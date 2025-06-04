import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { GitHubAPI, extractSkillsFromRepos } from "@/lib/github";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.accessToken) {
      return NextResponse.json({ error: "No GitHub access token available" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
      const github = new GitHubAPI(session.accessToken);
      
      // Fetch GitHub user data
      const githubUser = await github.getUser();
      const repositories = await github.getRepositories(githubUser.login, { per_page: 50 });
      const pinnedRepos = await github.getPinnedRepositories(githubUser.login);
      const profileReadme = await github.getProfileReadme(githubUser.login);
      const contributionStats = await github.getContributionStats(githubUser.login);
      const organizations = await github.getOrganizations(githubUser.login);
      
      // Extract skills from repositories
      const extractedSkills = extractSkillsFromRepos(repositories);

      // Update user with fresh GitHub data
      const updateData: Partial<typeof user> = {
        githubData: {
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
          repositories: repositories.slice(0, 20), // Store top 20 repos
          pinnedRepositories: pinnedRepos,
          lastUpdated: new Date(),
        },
        image: githubUser.avatar_url, // Update profile image
        githubId: githubUser.id.toString(),
      };

      // Update basic profile data if not already set
      if (!user.bio && githubUser.bio) {
        updateData.bio = githubUser.bio;
      }
      if (!user.location && githubUser.location) {
        updateData.location = githubUser.location;
      }

      // Update social links
      updateData.socialLinks = {
        ...user.socialLinks,
        github: githubUser.html_url,
        portfolio: user.socialLinks?.portfolio || githubUser.blog || "",
        twitter: user.socialLinks?.twitter || (githubUser.twitter_username ? `https://twitter.com/${githubUser.twitter_username}` : ""),
      };

      // Update skills if user doesn't have many skills set
      if (!user.skills || user.skills.length < 3) {
        updateData.skills = extractedSkills;
      }

      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        updateData,
        { new: true, select: '-password' }
      );

      return NextResponse.json({ 
        message: "GitHub data refreshed successfully",
        user: updatedUser,
        lastUpdated: updateData.githubData.lastUpdated
      });

    } catch (githubError) {
      console.error("GitHub API error:", githubError);
      return NextResponse.json({ 
        error: "Failed to fetch GitHub data",
        details: githubError instanceof Error ? githubError.message : "Unknown error"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Refresh GitHub data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
