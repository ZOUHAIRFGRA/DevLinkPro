import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use stored GitHub data instead of fetching from API
    const profileData = {
      ...user.toObject(),
      // Include GitHub data from database
      github: user.githubData ? {
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
      } : null,
      repositories: user.githubData?.repositories || [],
      pinnedRepositories: user.githubData?.pinnedRepositories || [],
      // Check if GitHub data is stale (older than 7 days)
      isGithubDataStale: user.githubData ? 
        (new Date().getTime() - new Date(user.githubData.lastUpdated).getTime()) > (7 * 24 * 60 * 60 * 1000) : 
        true,
    };

    return NextResponse.json({ user: profileData });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      bio,
      location,
      preferredRoles,
      skills,
      experience,
      education,
      socialLinks,
    } = body;

    await connectDB();
    
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name,
        bio,
        location,
        preferredRoles,
        skills,
        experience,
        education,
        socialLinks,
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
