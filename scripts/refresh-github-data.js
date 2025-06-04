// Manual script to test GitHub data refresh
import connectDB from '../lib/mongodb.js';
import User from '../models/user.js';
import { GitHubAPI, extractSkillsFromRepos } from '../lib/github.js';

async function refreshGithubDataForUser(userEmail, accessToken) {
  try {
    await connectDB();
    console.log('Connected to database');
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error('User not found:', userEmail);
      return;
    }
    
    console.log('Found user:', user.name);
    
    if (!accessToken) {
      console.error('No access token provided. Please provide a GitHub access token.');
      return;
    }
    
    console.log('Fetching GitHub data...');
    const github = new GitHubAPI(accessToken);
    
    const githubUser = await github.getUser();
    const repositories = await github.getRepositories(githubUser.login, { per_page: 30 });
    const pinnedRepos = await github.getPinnedRepositories(githubUser.login);
    const extractedSkills = extractSkillsFromRepos(repositories);
    
    const updateData = {
      githubData: {
        username: githubUser.login,
        url: githubUser.html_url,
        publicRepos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
        company: githubUser.company,
        createdAt: githubUser.created_at,
        repositories: repositories.slice(0, 20),
        pinnedRepositories: pinnedRepos,
        lastUpdated: new Date(),
      }
    };
    
    // Update basic info if not set
    if (!user.bio && githubUser.bio) {
      updateData.bio = githubUser.bio;
    }
    if (!user.location && githubUser.location) {
      updateData.location = githubUser.location;
    }
    
    // Update skills if user has few skills
    if (!user.skills || user.skills.length < 3) {
      updateData.skills = extractedSkills.map(skill => ({
        name: skill,
        level: 'Intermediate'
      }));
    }
    
    await User.findOneAndUpdate(
      { email: userEmail },
      updateData,
      { new: true }
    );
    
    console.log('✅ Successfully updated GitHub data for:', githubUser.login);
    console.log('Data updated:', {
      username: githubUser.login,
      repos: githubUser.public_repos,
      followers: githubUser.followers,
      skills: extractedSkills.length,
      lastUpdated: updateData.githubData.lastUpdated
    });
    
  } catch (error) {
    console.error('❌ Error refreshing GitHub data:', error);
  }
}

// Usage: node scripts/refresh-github-data.js <email> <github_token>
const userEmail = process.argv[2];
const accessToken = process.argv[3];

if (!userEmail) {
  console.log('Usage: node scripts/refresh-github-data.js <email> [github_token]');
  console.log('Example: node scripts/refresh-github-data.js user@example.com ghp_xxxxx');
  process.exit(1);
}

refreshGithubDataForUser(userEmail, accessToken).then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
