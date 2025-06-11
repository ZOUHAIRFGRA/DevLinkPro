/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Globe,
  Github,
  Mail,
  Calendar,
  Edit,
  Star,
  GitFork,
  Users,
  Building,
  Plus,
} from "lucide-react";
import { GitHubAPI, extractSkillsFromRepos, GitHubRepo } from "@/lib/github";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown (tables, strikethrough, etc.)
import rehypeRaw from "rehype-raw"; // To render HTML inside markdown (use with caution)
import {
  Tooltip,
  TooltipContent,
  TooltipProvider, // Ensure this is wrapping your app or page layout
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define custom renderers
const markdownComponents: Components = {
  // Custom renderer for images
  img: ({ node, src, alt, ...props }) => {
    // Check if it's a shields.io badge
    if (typeof src === "string" && src.includes("img.shields.io")) {
      return (
        <img
          src={src}
          alt={alt || "Tech Badge"} // Provide a default alt if missing
          style={{
            height: "28px", // Adjust height as desired for badges
            display: "inline-block", // Make them flow inline
            margin: "2px 4px", // Add some spacing around badges
            verticalAlign: "middle", // Align them nicely
          }}
          {...props} // Pass other props like title if any
        />
      );
    }
    // For other images (like GitHub stats, trophies etc.), render them normally
    // You might want to use Next/Image here for optimization if they are local
    // or if you know their dimensions. For external dynamic images, <img> is fine.
    return (
      <img src={src} alt={alt || ""} {...props} style={{ maxWidth: "100%" }} />
    ); // Added maxWidth for responsiveness of other images
  },

  p: ({ node, children, ...props }) => {
    // Check if this paragraph node contains primarily badge images (shields.io)
    let isBadgeParagraph = false;
    if (node && node.children) {
      isBadgeParagraph = Array.from(node.children).some((childNode: any) => {
        return (
          childNode.tagName === "img" &&
          childNode.properties &&
          typeof childNode.properties.src === "string" &&
          childNode.properties.src.includes("img.shields.io")
        );
      });
    }

    if (isBadgeParagraph) {
      // If it's the paragraph containing the tech stack, render it as a div
      // with flex layout to allow badges to wrap and align.
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap", // Allow badges to wrap to the next line
            alignItems: "center", // Align badges vertically
            gap: "4px", // Consistent gap (you had 0px 4px, just 4px is also common for flex gap)
            marginBottom: "1rem", // Add some space after the badge block
          }}
          {...props} // Pass through other props like 'key' if provided by react-markdown
        >
          {children}
        </div>
      );
    }

    // For all other paragraphs (NOT badge containers), apply specific Tailwind classes
    // These classes aim to give more control over paragraph styling than default prose.
    // Adjust these classes to match your desired look (e.g., GitHub's paragraph styling).
    return (
      <p
        className="my-3 leading-relaxed text-slate-700 dark:text-slate-300" // Example classes
        {...props}
      >
        {children}
      </p>
    );
  },

  h1: ({ node, ...props }) => (
    <h1
      className="text-2xl font-semibold my-4 text-slate-900 dark:text-slate-100"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="text-xl font-semibold my-3 text-slate-800 dark:text-slate-200"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="text-lg font-semibold my-2 text-slate-700 dark:text-slate-300"
      {...props}
    />
  ),

  a: ({ node, ...props }) => (
    <a
      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
  li: ({ node, ...props }) => <li className="my-1" {...props} />,
};

async function fetchGitHubProfile(accessToken: string) {
  try {
    const github = new GitHubAPI(accessToken);

    // Fetch GitHub user data
    const githubUser = await github.getUser();
    const repositories = await github.getRepositories(githubUser.login, {
      per_page: 50,
    });
    const pinnedRepos = await github.getPinnedRepositories(githubUser.login);
    const profileReadme = await github.getProfileReadme(githubUser.login);
    const contributionStats = await github.getContributionStats(
      githubUser.login
    );
    const organizations = await github.getOrganizations(githubUser.login);

    // Extract skills from repositories
    const extractedSkills = extractSkillsFromRepos(repositories);
    console.log('GitHub User:', githubUser);

    // Transform GitHub data to our profile format
    const profile = {
      id: githubUser.id.toString(),
      name: githubUser.name || githubUser.login,
      email: githubUser.email,
      image: githubUser.avatar_url,
      bio: githubUser.bio || "",
      location: githubUser.location || "",
      github: {
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
      },
      skills: extractedSkills, // GitHub-extracted skills as fallback
      repositories: repositories.slice(0, 10), // Top 10 recent repos
      pinnedRepositories: pinnedRepos,
      socialLinks: {
        github: githubUser.html_url,
        portfolio: githubUser.blog || "",
        twitter: githubUser.twitter_username
          ? `https://twitter.com/${githubUser.twitter_username}`
          : "",
        linkedin: "", // Not available from GitHub API
      },
      joinedDate: githubUser.created_at,
      plan: githubUser.plan, // Add plan for own profile
    };

    return profile;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

import type { IUser } from '@/models/user';

async function fetchDatabaseProfile(email: string) {
  try {
    await connectDB();
    const user = await User.findOne({ email }).select('-password').lean() as IUser | null;
    return user;
  } catch (error) {
    console.error("Error fetching database profile:", error);
    return null;
  }
}

async function fetchDatabaseProfileByUsername(username: string) {
  try {
    await connectDB();
    const user = await User.findOne({ 
      'githubData.username': username 
    }).select('-password').lean() as IUser | null;
    
    if (!user || !user.githubData) {
      return null;
    }

    // Transform database user to profile format
    const profile = {
      id: user.githubId || (user._id as any)?.toString() || user.email,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio || "",
      location: user.location || "",
      github: {
        username: user.githubData.username,
        url: user.githubData.url,
        publicRepos: user.githubData.publicRepos,
        followers: user.githubData.followers,
        following: user.githubData.following,
        company: user.githubData.company,
        createdAt: user.githubData.createdAt,
        profileReadme: user.githubData.profileReadme,
        contributions: user.githubData.contributions,
        organizations: user.githubData.organizations,
      },
      skills: user.skills || [],
      repositories: (user.githubData.repositories || []).slice(0, 10),
      pinnedRepositories: user.githubData.pinnedRepositories || [],
      socialLinks: user.socialLinks || {
        github: user.githubData.url,
        portfolio: "",
        twitter: "",
        linkedin: "",
      },
      joinedDate: user.githubData.createdAt,
      plan: null, // Don't expose plan for other users
    };

    return profile;
  } catch (error) {
    console.error("Error fetching database profile by username:", error);
    return null;
  }
}

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { username } = await params;
  const viewingUsername = username;
  const isOwnProfile = session.githubLogin === viewingUsername;

  let profile;

  if (isOwnProfile) {
    if (!session.accessToken) {
      return (
        <div className="container mx-auto py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">GitHub Access Required</h1>
            <p className="text-muted-foreground mb-4">
              Please sign in with GitHub to view your profile data.
            </p>
            <Button asChild>
              <Link href="/auth/sign-in">Sign in with GitHub</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    // Fetch both GitHub and database profiles for own profile
    const [githubProfile, dbProfile] = await Promise.all([
      fetchGitHubProfile(session.accessToken),
      fetchDatabaseProfile(session.user.email!)
    ]);
    
    if (githubProfile) {
      // Merge database skills with GitHub profile, prioritizing database skills
      profile = {
        ...githubProfile,
        skills: dbProfile?.skills && dbProfile.skills.length > 0 
          ? dbProfile.skills 
          : githubProfile.skills,
        // Also merge other database fields if available
        bio: dbProfile?.bio || githubProfile.bio,
        location: dbProfile?.location || githubProfile.location,
        socialLinks: {
          ...githubProfile.socialLinks,
          ...(dbProfile?.socialLinks || {}),
        },
      };
    } else {
      profile = null;
    }
    
    console.log('Merged Profile:', profile);
  } else {
    // Fetch profile data from database instead of GitHub API
    profile = await fetchDatabaseProfileByUsername(viewingUsername);
    console.log('Database Profile:', profile);
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Profile not found
          </h1>
          <p className="text-muted-foreground mb-4">
            We couldn&apos;t find a profile for {viewingUsername}. The user might not be registered on DevLink or hasn&apos;t set up their profile yet.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          {profile.image && (
            <Image
              src={profile.image}
              alt={`${profile.name || "User"}'s profile`}
              width={120}
              height={120}
              className="w-30 h-30 rounded-full border-4 border-border"
            />
          )}
        </div>
        <div className="flex-1">            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {profile.name || profile.github?.username || "GitHub User"}
                  {/* PRO Badge - only show for own profile and when plan exists */}
                  {isOwnProfile && profile.plan?.name === "pro" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="default"
                            className="ml-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs font-semibold"
                          >
                            PRO
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Github Pro Member</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-3">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.github?.company && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{profile.github.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(
                        profile.github?.createdAt || profile.joinedDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            {/* Edit Profile Button - only show for own profile */}
            {isOwnProfile && (
              <Button asChild>
                <Link href="/profile/edit">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>

          {profile.bio && <p className="text-lg mb-4">{profile.bio}</p>}

          {/* GitHub Stats */}
          <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
            {profile.github && (
              <>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{profile.github.followers} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{profile.github.following} following</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{profile.github.publicRepos} repositories</span>
                </div>
              </>
            )}
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            {profile.socialLinks?.github && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {profile.socialLinks?.portfolio && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={profile.socialLinks.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Portfolio
                </a>
              </Button>
            )}
            {profile.socialLinks?.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>
              </Button>
            )}
            {profile.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${profile.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Technical Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
            <CardDescription>
              {isOwnProfile ? "Your" : `${profile.name || viewingUsername}'s`} technical skills and proficiency levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.skills && profile.skills.length > 0 ? (
                <div className="grid gap-3">
                  {profile.skills.map((skill: { name: string; level: string }, index: number) => (
                    <div
                      key={`${skill.name}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <span className="font-medium">{skill.name}</span>
                      <Badge
                        variant={
                          skill.level === "Expert"
                            ? "default"
                            : skill.level === "Advanced"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          skill.level === "Expert"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : skill.level === "Advanced"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : skill.level === "Intermediate"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }
                      >
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile ? "You haven't added any skills yet" : "No skills listed"}
                  </p>
                  {isOwnProfile && (
                    <Button variant="outline" asChild>
                      <Link href="/profile/edit">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Skills
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* DevLink Projects - Enhanced and Prioritized */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="w-6 h-6 text-primary" />
              </div>
              DevLink Projects
            </CardTitle>
            <CardDescription className="text-base">
              Collaborative projects and innovations {isOwnProfile ? "I've" : `${profile.name || viewingUsername} has`} built within the DevLink community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isOwnProfile ? "Start Your DevLink Journey" : "No Projects Yet"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {isOwnProfile 
                    ? "Create amazing projects, collaborate with developers worldwide, and showcase your innovations to the DevLink community."
                    : `${profile.name || viewingUsername} hasn't shared any DevLink projects yet. Check back later for exciting collaborations!`
                  }
                </p>
              </div>
              {isOwnProfile && (
                <div className="space-y-3">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" asChild>
                    <Link href="/dashboard">
                      <Building className="w-5 h-5 mr-2" />
                      Explore Dashboard
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Connect with fellow developers and start building together
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Repositories - Enhanced */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Recent Repositories
            </CardTitle>
            <CardDescription>
              {isOwnProfile ? "My" : `${profile.name || viewingUsername}'s`} most recently updated GitHub repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.repositories && profile.repositories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.repositories
                  .slice(0, 6)
                  .map(
                    (repo: any) => (
                      <div key={repo.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors"
                            >
                              {repo.name}
                            </a>
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>{repo.stargazers_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              <span>{repo.forks_count}</span>
                            </div>
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Updated{" "}
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No repositories found
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile README (if available) - Enhanced */}
        {profile.github?.profileReadme && (
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                Profile README
              </CardTitle>
              <CardDescription>
                {isOwnProfile ? "My" : `${profile.name || viewingUsername}'s`} GitHub profile introduction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={markdownComponents} // <-- Add your custom components here
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]} // rehypeRaw is important for your <br> tags
                  // rehypePlugins={[rehypeRaw, rehypeHighlight]} // if using syntax highlighting
                >
                  {profile.github.profileReadme}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
