import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import User from '@/models/user';

interface RouteParams {
  params: { id: string };
}

// GET - Fetch a specific project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    await connectDB();

    const project = await Project.findById(id)
      .populate('owner', 'name email githubData.username githubData.avatar_url')
      .populate('collaborators.user', 'name email githubData.username githubData.avatar_url')
      .populate('applicants.user', 'name email githubData.username githubData.avatar_url');

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // If project is not public, check if user has access
    if (!project.isPublic) {
      const session = await auth();
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if user is owner or collaborator
      const isOwner = project.owner._id.toString() === user._id.toString();
      const isCollaborator = project.collaborators.some(
        (collab: { user: { _id: { toString(): string } } }) => collab.user._id.toString() === user._id.toString()
      );

      if (!isOwner && !isCollaborator) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT - Update a project
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
    const body = await request.json();

    await connectDB();

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

    // Check if user is the owner
    if (project.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Only project owner can update the project' },
        { status: 403 }
      );
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('owner', 'name email githubData.username githubData.avatar_url')
     .populate('collaborators.user', 'name email githubData.username githubData.avatar_url');

    return NextResponse.json({
      success: true,
      data: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectDB();

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

    // Check if user is the owner
    if (project.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Only project owner can delete the project' },
        { status: 403 }
      );
    }

    // Delete the project
    await Project.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
