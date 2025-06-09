import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/application';
import Project from '@/models/project';
import User from '@/models/user';
import Match from '@/models/match';
import Notification from '@/models/notification';
import mongoose from 'mongoose';

// GET - Get applications for user's projects
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    await connectDB();

    // Get current user by email to get their ObjectId
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query
    const query: Record<string, unknown> = {
      projectOwnerId: currentUser._id,
      status
    };

    if (projectId) {
      query.projectId = new mongoose.Types.ObjectId(projectId);
    }

    // Get applications
    const applications = await Application.find(query)
      .sort({ appliedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Populate application details
    const populatedApplications = await Promise.all(
      applications.map(async (app) => {
        const [project, developer] = await Promise.all([
          Project.findById(app.projectId).select('title description technologies').lean(),
          User.findById(app.developerId).select('name email image skills githubData').lean()
        ]);

        return {
          ...app,
          project,
          developer
        };
      })
    );

    return NextResponse.json({ applications: populatedApplications });
  } catch (error) {
    console.error('Error in applications API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Accept or reject an application
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, action } = await request.json();

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await connectDB();

    // Get current user by email to get their ObjectId
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find and update application
    const application = await Application.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(applicationId),
        projectOwnerId: currentUser._id,
        status: 'pending'
      },
      {
        status: action === 'accept' ? 'accepted' : 'rejected',
        respondedAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // If accepted, create a match
    let match = null;
    if (action === 'accept') {
      match = await Match.create({
        userId: application.developerId,
        targetId: application.projectId,
        targetType: 'project',
        matchedAt: new Date(),
        status: 'active'
      });

      // Also create reverse match for project owner
      await Match.create({
        userId: application.projectOwnerId,
        targetId: application.developerId,
        targetType: 'user',
        matchedAt: new Date(),
        status: 'active'
      });
    }

    // Create notification for developer
    const project = await Project.findById(application.projectId).select('title').lean() as { title: string } | null;
    await Notification.create({
      userId: application.developerId,
      type: action === 'accept' ? 'application_accepted' : 'application_rejected',
      title: action === 'accept' ? 'Application Accepted!' : 'Application Update',
      message: action === 'accept' 
        ? `Your application for "${project?.title}" has been accepted!`
        : `Your application for "${project?.title}" was not selected this time.`,
      data: {
        projectId: application.projectId.toString(),
        applicationId: application._id.toString(),
        matchId: match?._id?.toString()
      }
    });

    return NextResponse.json({ 
      success: true,
      application,
      match: !!match,
      matchId: match?._id
    });
  } catch (error) {
    console.error('Error in application response API:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}
