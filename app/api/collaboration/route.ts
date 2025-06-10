import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/match';
import Project from '@/models/project';
import User from '@/models/user';
import Message from '@/models/message';
import mongoose from 'mongoose';

// POST - Set up collaboration for a match
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, action, data } = await request.json();

    if (!matchId || !action) {
      return NextResponse.json({ error: 'Match ID and action are required' }, { status: 400 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get match
    const match = await Match.findById(matchId).populate('targetId');
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    let result = {};

    switch (action) {
      case 'assign_role':
        result = await assignProjectRole(match, currentUser._id, data);
        break;
      case 'setup_github':
        result = await setupGitHubCollaboration(match, currentUser._id, data);
        break;
      case 'create_milestone':
        result = await createMilestone(match, currentUser._id, data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Send system message about the collaboration action
    await Message.create({
      matchId: match._id,
      senderId: currentUser._id,
      content: getSystemMessage(action, data),
      messageType: 'system'
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in collaboration API:', error);
    return NextResponse.json(
      { error: 'Failed to set up collaboration' },
      { status: 500 }
    );
  }
}

async function assignProjectRole(match: { targetType: string; targetId: string }, userId: mongoose.Types.ObjectId, data: { roleTitle: string; roleDescription: string; responsibilities: string[] }) {
  if (match.targetType !== 'project') {
    throw new Error('Can only assign roles for project matches');
  }

  const { roleTitle, roleDescription, responsibilities } = data;

  // Update project with new collaborator
  await Project.findByIdAndUpdate(match.targetId, {
    $push: {
      collaborators: {
        user: userId,
        role: roleTitle,
        joinedAt: new Date(),
        status: 'Active',
        responsibilities: responsibilities || []
      }
    }
  });

  return { roleTitle, roleDescription, assignedAt: new Date() };
}

async function setupGitHubCollaboration(match: { targetType: string; targetId: string }, userId: mongoose.Types.ObjectId, data: { githubRepo: string; accessLevel?: string }) {
  const { githubRepo, accessLevel = 'write' } = data;

  // In a real implementation, you'd use GitHub API to add collaborator
  // For now, we'll just store the intention
  const collaborationSetup = {
    githubRepo,
    accessLevel,
    invitedAt: new Date(),
    status: 'pending' // would be 'active' after GitHub API call
  };

  // You could integrate with GitHub API here:
  // const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  // await octokit.rest.repos.addCollaborator({
  //   owner: repoOwner,
  //   repo: repoName,
  //   username: collaboratorGithubUsername,
  //   permission: accessLevel
  // });

  return collaborationSetup;
}

async function createMilestone(match: { targetType: string; targetId: string }, userId: mongoose.Types.ObjectId, data: { title: string; description: string; dueDate: string; tasks?: string[] }) {
  const { title, description, dueDate, tasks } = data;

  const milestone = {
    title,
    description,
    dueDate: new Date(dueDate),
    tasks: tasks || [],
    createdBy: userId,
    createdAt: new Date(),
    status: 'pending'
  };

  return milestone;
}

function getSystemMessage(action: string, data: { roleTitle?: string; githubRepo?: string; title?: string; dueDate?: string }): string {
  switch (action) {
    case 'assign_role':
      return `🎯 Project role "${data.roleTitle}" has been assigned to the developer.`;
    case 'setup_github':
      return `🔗 GitHub collaboration has been set up for repository: ${data.githubRepo}`;
    case 'create_milestone':
      return `📋 New milestone created: "${data.title}" (Due: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'No due date'})`;
    default:
      return '✅ Collaboration action completed.';
  }
}
