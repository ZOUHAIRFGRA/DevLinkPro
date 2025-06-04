import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email }).select('githubData');
    
    if (!user || !user.githubData) {
      return NextResponse.json({ error: "No GitHub data found. Please refresh your GitHub data first." }, { status: 404 });
    }

    // Return stored GitHub data
    const profile = {
      id: session.user?.id,
      name: session.user?.name,
      email: session.user?.email,
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
        lastUpdated: user.githubData.lastUpdated,
      },
      repositories: user.githubData.repositories || [],
      pinnedRepositories: user.githubData.pinnedRepositories || [],
      isDataStale: user.githubData.lastUpdated ? 
        (new Date().getTime() - new Date(user.githubData.lastUpdated).getTime()) > (7 * 24 * 60 * 60 * 1000) : 
        true,
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
