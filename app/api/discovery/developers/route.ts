import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import Project from '@/models/project';
import Swipe from '@/models/swipe';

interface ProjectWithFields {
  owner: string;
  technologies?: string[];
  plannedTechnologies?: string[];
  rolesNeeded?: Array<{
    isActive?: boolean;
    skills?: string[];
  }>;
  title: string;
  _id: string;
}

// GET - Discover developers for a project
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skills = searchParams.get('skills')?.split(',').filter(Boolean);

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await connectDB();

    // Find the current user by email to get their MongoDB ObjectId
    const currentUser = await User.findOne({ email: session.user.email }).select('_id');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = await Project.findById(projectId).lean() as unknown as ProjectWithFields;
    if (!project || project.owner.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // Get developers the project owner has already swiped on
    const swipedDevelopers = await Swipe.find({
      userId: currentUser._id,
      targetType: 'user'
    }).distinct('targetId');

    // Build query for developers
    const query: Record<string, unknown> = {
      _id: { 
        $ne: currentUser._id, // Don't show the project owner
        $nin: swipedDevelopers // Don't show already swiped developers
      }
    };

    // Add skill filters
    if (skills && skills.length > 0) {
      query['skills.name'] = { $in: skills };
    }

    // Fetch developers
    let developers = await User.find(query)
      .select('-password -email') // Don't expose sensitive info
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Calculate match scores based on project requirements
    const projectTechnologies = [
      ...(project.technologies || []),
      ...(project.plannedTechnologies || [])
    ].map((tech: string) => tech.toLowerCase());

    const projectRoleSkills = (project.rolesNeeded || [])
      .filter((role: { isActive?: boolean; skills?: string[] }) => role.isActive)
      .flatMap((role: { skills?: string[] }) => role.skills || [])
      .map((skill: string) => skill.toLowerCase());

    const requiredSkills = [...new Set([...projectTechnologies, ...projectRoleSkills])];

    developers = developers.map(developer => {
      const developerSkills = (developer.skills || []).map((skill: { name: string }) => skill.name.toLowerCase());
      
      const skillMatches = requiredSkills.filter(reqSkill => 
        developerSkills.some((devSkill: string) => 
          devSkill.includes(reqSkill) || reqSkill.includes(devSkill)
        )
      );

      const matchScore = skillMatches.length / Math.max(requiredSkills.length, 1);

      // Boost score for GitHub activity and complete profiles
      let boostScore = 0;
      if (developer.githubData?.publicRepos > 10) boostScore += 0.1;
      if (developer.bio) boostScore += 0.05;
      if (developer.experience?.length > 0) boostScore += 0.05;

      const skillMisses = requiredSkills.filter(reqSkill => 
        !developerSkills.some((devSkill: string) => 
          devSkill.includes(reqSkill) || reqSkill.includes(devSkill)
        )
      );

      return {
        ...developer,
        matchScore: Math.min(Math.round((matchScore + boostScore) * 100), 100),
        matchDetails: {
          skillMatches: skillMatches,
          skillMisses: skillMisses,
          developerSkills: developerSkills,
          requiredSkills: requiredSkills,
          matchedCount: skillMatches.length,
          totalRequired: requiredSkills.length,
          boostScore: Math.round(boostScore * 100)
        }
      };
    });

    // Sort by match score
    developers.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ developers, project: { title: project.title, _id: project._id } });
  } catch (error) {
    console.error('Error in developer discovery API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developers' },
      { status: 500 }
    );
  }
}
