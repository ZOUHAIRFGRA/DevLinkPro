import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { GitHubAPI, extractSkillsFromRepos } from '@/lib/github';

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email read:org repo:status",
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user || !user.password) {
          return null;
        }

        const isValid = await user.comparePassword(credentials.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user with basic info
          const newUserData: Record<string, unknown> = {
            email: user.email,
            name: user.name,
            image: user.image,
            githubId: user.id,
          };

          // Try to fetch and store GitHub data during registration
          if (account.access_token) {
            try {
              const github = new GitHubAPI(account.access_token);
              const githubUser = await github.getUser();
              const repositories = await github.getRepositories(githubUser.login, { per_page: 30 });
              const pinnedRepos = await github.getPinnedRepositories(githubUser.login);
              const extractedSkills = extractSkillsFromRepos(repositories);
              
              // Try to get additional data (these might fail for some users)
              let profileReadme = null;
              let contributionStats = null;
              let organizations = null;
              
              try {
                profileReadme = await github.getProfileReadme(githubUser.login);
              } catch (error) {
                console.log('No profile README found for', githubUser.login, error instanceof Error ? error.message : '');
              }
              
              try {
                contributionStats = await github.getContributionStats(githubUser.login);
              } catch (error) {
                console.log('Could not fetch contribution stats for', githubUser.login, error instanceof Error ? error.message : '');
              }
              
              try {
                organizations = await github.getOrganizations(githubUser.login);
              } catch (error) {
                console.log('Could not fetch organizations for', githubUser.login, error instanceof Error ? error.message : '');
              }

              // Add GitHub data to user
              newUserData.bio = githubUser.bio;
              newUserData.location = githubUser.location;
              newUserData.socialLinks = {
                github: githubUser.html_url,
                portfolio: githubUser.blog || "",
                twitter: githubUser.twitter_username ? `https://twitter.com/${githubUser.twitter_username}` : "",
              };
              newUserData.skills = extractedSkills;
              newUserData.githubData = {
                username: githubUser.login,
                url: githubUser.html_url,
                publicRepos: githubUser.public_repos,
                followers: githubUser.followers,
                following: githubUser.following,
                company: githubUser.company,
                createdAt: githubUser.created_at,
                profileReadme,
                contributions: contributionStats,
                organizations,
                repositories: repositories.slice(0, 20),
                pinnedRepositories: pinnedRepos,
                lastUpdated: new Date(),
              };
              
              console.log('Successfully fetched GitHub data for new user:', githubUser.login);
            } catch (error) {
              console.error('Error fetching GitHub data during registration:', error);
              // Continue with basic user creation even if GitHub data fetch fails
            }
          }

          await User.create(newUserData);
        } else {
          // Update existing user's GitHub ID and image if not set
          const updateData: Record<string, unknown> = {};
          if (!existingUser.githubId) updateData.githubId = user.id;
          if (!existingUser.image) updateData.image = user.image;
          
          // If user doesn't have GitHub data or it's very old (>30 days), fetch it
          const shouldUpdateGithubData = !existingUser.githubData || 
            (existingUser.githubData.lastUpdated && 
             (new Date().getTime() - new Date(existingUser.githubData.lastUpdated).getTime()) > (30 * 24 * 60 * 60 * 1000));
          
          if (shouldUpdateGithubData && account.access_token) {
            try {
              const github = new GitHubAPI(account.access_token);
              const githubUser = await github.getUser();
              const repositories = await github.getRepositories(githubUser.login, { per_page: 20 });
              const extractedSkills = extractSkillsFromRepos(repositories);
              
              updateData.githubData = {
                username: githubUser.login,
                url: githubUser.html_url,
                publicRepos: githubUser.public_repos,
                followers: githubUser.followers,
                following: githubUser.following,
                company: githubUser.company,
                createdAt: githubUser.created_at,
                repositories: repositories.slice(0, 20),
                lastUpdated: new Date(),
              };
              
              // Only update skills if user has very few
              if (!existingUser.skills || existingUser.skills.length < 3) {
                updateData.skills = extractedSkills;
              }
              
              console.log('Updated GitHub data for existing user:', githubUser.login);
            } catch (error) {
              console.error('Error updating GitHub data for existing user:', error);
            }
          }
          
          if (Object.keys(updateData).length > 0) {
            await User.findOneAndUpdate({ email: user.email }, updateData);
          }
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // Store GitHub access token in JWT
      if (account?.provider === 'github') {
        token.accessToken = account.access_token;
        token.githubId = account.providerAccountId;
        token.githubLogin = profile?.login; // Store GitHub username
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        // Include access token, GitHub ID, and GitHub login in session
        session.accessToken = token.accessToken as string;
        session.githubId = token.githubId as string;
        session.githubLogin = token.githubLogin as string;
      }
      return session;
    },
  }
});
