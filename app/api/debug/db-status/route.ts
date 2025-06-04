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
    
    // Get database statistics
    const totalUsers = await User.countDocuments();
    const usersWithGithubData = await User.countDocuments({ githubData: { $exists: true } });
    const usersWithSkills = await User.countDocuments({ skills: { $exists: true, $ne: [] } });
    
    // Get current user's data
    const currentUser = await User.findOne({ email: session.user.email }).select('-password');
    
    // Get a sample of users with GitHub data (for debugging)
    const sampleUsers = await User.find({ githubData: { $exists: true } })
      .select('email name githubData.username githubData.lastUpdated githubData.publicRepos skills')
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers,
        usersWithGithubData,
        usersWithSkills,
        percentageWithGithubData: totalUsers > 0 ? Math.round((usersWithGithubData / totalUsers) * 100) : 0,
      },
      currentUser: {
        email: currentUser?.email,
        name: currentUser?.name,
        hasGithubData: !!currentUser?.githubData,
        githubUsername: currentUser?.githubData?.username,
        lastGithubUpdate: currentUser?.githubData?.lastUpdated,
        skillsCount: currentUser?.skills?.length || 0,
        githubRepos: currentUser?.githubData?.publicRepos,
      },
      sampleUsers: sampleUsers.map(user => ({
        email: user.email,
        name: user.name,
        githubUsername: user.githubData?.username,
        lastUpdated: user.githubData?.lastUpdated,
        repoCount: user.githubData?.publicRepos,
        skillsCount: user.skills?.length || 0,
      })),
    });

  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
