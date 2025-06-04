import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { GitHubAPI, extractSkillsFromRepos } from "@/lib/github";

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

    // If user has GitHub access token, fetch GitHub data to pre-fill missing fields
    let githubData = null;
    if (session.accessToken) {
      try {
        const github = new GitHubAPI(session.accessToken);
        const githubUser = await github.getUser();
        const repositories = await github.getRepositories(githubUser.login, {
          per_page: 50,
        });
        const extractedSkills = extractSkillsFromRepos(repositories);

        githubData = {
          bio: githubUser.bio,
          location: githubUser.location,
          socialLinks: {
            github: githubUser.html_url,
            portfolio: githubUser.blog,
            twitter: githubUser.twitter_username ? `https://twitter.com/${githubUser.twitter_username}` : "",
          },
          skills: extractedSkills,
        };
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      }
    }

    // Merge database data with GitHub data (database takes priority)
    const profileData = {
      ...user.toObject(),
      bio: user.bio || githubData?.bio || "",
      location: user.location || githubData?.location || "",
      socialLinks: {
        github: user.socialLinks?.github || githubData?.socialLinks?.github || "",
        linkedin: user.socialLinks?.linkedin || "",
        portfolio: user.socialLinks?.portfolio || githubData?.socialLinks?.portfolio || "",
        twitter: user.socialLinks?.twitter || githubData?.socialLinks?.twitter || "",
      },
      skills: user.skills?.length > 0 ? user.skills : (githubData?.skills || []),
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
