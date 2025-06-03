import { auth } from "@/auth";
import { GitHubAPI, extractSkillsFromRepos } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "No GitHub access token available" }, { status: 401 });
    }

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

    // Transform GitHub data to our profile format
    const profile = {
      id: session.user?.id,
      name: githubUser.name || githubUser.login,
      email: githubUser.email || session.user?.email,
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
      skills: extractedSkills,
      repositories: repositories.slice(0, 10), // Top 10 recent repos
      pinnedRepositories: pinnedRepos,
      socialLinks: {
        github: githubUser.html_url,
        portfolio: githubUser.blog || "",
        twitter: githubUser.twitter_username ? `https://twitter.com/${githubUser.twitter_username}` : "",
        linkedin: "", // Not available from GitHub API
      },
      joinedDate: new Date().toISOString(), // Use actual join date from database if available
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GitHub profile fetch error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch GitHub profile data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
