import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import User from '@/models/user';

interface RouteParams {
  params: { id: string };
}

// POST - Apply to a project
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { roleAppliedFor, message } = await request.json();

    if (!roleAppliedFor) {
      return NextResponse.json(
        { success: false, error: 'Role to apply for is required' },
        { status: 400 }
      );
    }

    await connectDB;

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the project
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner (can't apply to own project)
    if (project.owner.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Cannot apply to your own project' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingApplication = project.applicants.find(
      (app: { user: { toString(): string } }) => app.user.toString() === user._id.toString()
    );

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this project' },
        { status: 400 }
      );
    }

    // Check if user is already a collaborator
    const isCollaborator = project.collaborators.some(
      (collab: { user: { toString(): string } }) => collab.user.toString() === user._id.toString()
    );

    if (isCollaborator) {
      return NextResponse.json(
        { success: false, error: 'You are already a collaborator on this project' },
        { status: 400 }
      );
    }

    // Add the application
    project.applicants.push({
      user: user._id,
      roleAppliedFor,
      message: message || '',
      appliedAt: new Date(),
      status: 'Pending'
    });

    await project.save();

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error applying to project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply to project' },
      { status: 500 }
    );
  }
}

// PUT - Update application status (accept/reject)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { applicantId, status, role } = await request.json();

    if (!applicantId || !status || !['Accepted', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    await connectDB;

    // Find the user (project owner)
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the project
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (project.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Only project owner can manage applications' },
        { status: 403 }
      );
    }

    // Find the application
    const applicationIndex = project.applicants.findIndex(
      (app: { user: { toString(): string } }) => app.user.toString() === applicantId
    );

    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application status
    project.applicants[applicationIndex].status = status;

    // If accepted, add to collaborators
    if (status === 'Accepted') {
      project.collaborators.push({
        user: applicantId,
        role: role || project.applicants[applicationIndex].roleAppliedFor,
        joinedAt: new Date(),
        status: 'Active'
      });
    }

    await project.save();

    return NextResponse.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
