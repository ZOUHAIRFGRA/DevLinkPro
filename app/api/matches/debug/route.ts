import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/match';
import Project from '@/models/project';
import User from '@/models/user';
import mongoose from 'mongoose';

// GET - Debug matches data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current user by email to get their ObjectId
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; name: string; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all matches for this user
    const allMatches = await Match.find({
      $or: [
        { userId: currentUser._id },
        { projectOwnerId: currentUser._id }
      ]
    }).lean();

    // Get detailed info about each match
    const debugInfo = await Promise.all(
      allMatches.map(async (match) => {
        const [user, project, targetUser] = await Promise.all([
          User.findById(match.userId).select('name email').lean(),
          match.targetType === 'project' ? Project.findById(match.targetId).select('title').lean() : null,
          match.targetType === 'user' ? User.findById(match.targetId).select('name email').lean() : null
        ]);

        const userData = user as { name?: string } | null;
        const projectData = project as { title?: string } | null;
        const targetUserData = targetUser as { name?: string } | null;

        return {
          matchId: match._id,
          userId: match.userId,
          userName: userData?.name || 'Unknown',
          targetType: match.targetType,
          targetId: match.targetId,
          targetName: match.targetType === 'project' ? projectData?.title : targetUserData?.name,
          projectOwnerId: match.projectOwnerId,
          status: match.status,
          matchedAt: match.matchedAt,
          isCurrentUserDeveloper: match.userId?.toString() === currentUser._id.toString(),
          isCurrentUserProjectOwner: match.projectOwnerId?.toString() === currentUser._id.toString()
        };
      })
    );

    return NextResponse.json({
      currentUser: {
        id: currentUser._id,
        name: currentUser.name,
        email: session.user.email
      },
      totalMatches: allMatches.length,
      matches: debugInfo
    });
  } catch (error) {
    console.error('Error in matches debug API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info' },
      { status: 500 }
    );
  }
}
