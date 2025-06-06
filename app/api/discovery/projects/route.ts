import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import User from '@/models/user';
import Swipe from '@/models/swipe';

interface UserWithSkills {
  _id: string;
  skills?: Array<{
    name: string;
    level: string;
  }>;
}

interface LeanProject {
  _id: string;
  technologies?: string[];
  plannedTechnologies?: string[];
  [key: string]: unknown;
}

interface ProjectWithScore extends LeanProject {
  matchScore: number;
}

// GET - Discover projects for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const technologies = searchParams.get('technologies')?.split(',').filter(Boolean);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    await connectDB();

    // Get user's skills to improve matching
    const currentUser = await User.findOne({ email: session.user.email }).lean() as UserWithSkills | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    // Get projects the user has already swiped on
    const swipedProjects = await Swipe.find({
      userId: currentUser._id,
      targetType: 'project'
    }).distinct('targetId');

    // Build query for projects
    const query: Record<string, unknown> = {
      isPublic: true,
      owner: { $ne: currentUser._id }, // Don't show user's own projects
      _id: { $nin: swipedProjects }, // Don't show already swiped projects
      status: { $in: ['Planning', 'In Progress'] } // Only show active projects
    };

    // Add filters
    if (technologies && technologies.length > 0) {
      query.$or = [
        { technologies: { $in: technologies } },
        { plannedTechnologies: { $in: technologies } }
      ];
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = category;
    }

    // Fetch projects
    const projects = await Project.find(query)
      .populate('owner', 'name email image githubData.username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean() as LeanProject[];

    // Calculate match scores based on user skills
    const userSkills = ((currentUser as UserWithSkills).skills || []).map((skill: { name: string }) => skill.name.toLowerCase());
    
    const projectsWithScores: ProjectWithScore[] = projects.map(project => {
      const projectTechs = [
        ...(project.technologies || []),
        ...(project.plannedTechnologies || [])
      ].map((tech: string) => tech.toLowerCase());

      const skillMatches = projectTechs.filter((tech: string) => 
        userSkills.some((skill: string) => skill.includes(tech) || tech.includes(skill))
      );

      const matchScore = skillMatches.length / Math.max(projectTechs.length, 1);

      return {
        ...project,
        matchScore: Math.round(matchScore * 100)
      };
    });

    // Sort by match score
    projectsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ projects: projectsWithScores });
  } catch (error) {
    console.error('Error in discovery API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
