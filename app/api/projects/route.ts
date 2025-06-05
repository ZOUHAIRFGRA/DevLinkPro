import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import User from '@/models/user';

// GET - Fetch all projects or user's projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    await connectDB();

    let query: Record<string, unknown> = { isPublic: true };

    // If userId is provided, fetch user's projects
    if (userId) {
      query = { owner: userId };
    }

    // Add filters
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const projects = await Project.find(query)
      .populate('owner', 'name email githubData.username githubData.avatar_url')
      .populate('collaborators.user', 'name email githubData.username githubData.avatar_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      currentStatus,
      goals,
      technologies,
      plannedTechnologies,
      category,
      difficulty,
      estimatedDuration,
      rolesNeeded,
      isPublic = true
    } = body;

    // Validate required fields
    if (!title || !description || !currentStatus || !goals || !technologies || !category || !difficulty || !estimatedDuration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create the project
    const project = new Project({
      title,
      description,
      currentStatus,
      goals: Array.isArray(goals) ? goals : [goals],
      technologies: Array.isArray(technologies) ? technologies : [technologies],
      plannedTechnologies: plannedTechnologies ? (Array.isArray(plannedTechnologies) ? plannedTechnologies : [plannedTechnologies]) : [],
      category,
      difficulty,
      estimatedDuration,
      owner: user._id,
      rolesNeeded: rolesNeeded || [],
      isPublic
    });

    await project.save();

    // Populate the project with owner details
    await project.populate('owner', 'name email githubData.username githubData.avatar_url');

    return NextResponse.json({
      success: true,
      data: project
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
