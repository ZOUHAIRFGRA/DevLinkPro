// Test script to verify GitHub data storage in database
import connectDB from '../lib/mongodb.js';
import User from '../models/user.js';

async function testGithubDataStorage() {
  try {
    await connectDB();
    console.log('Connected to database');
    
    // Find users with GitHub data
    const usersWithGithubData = await User.find({ 
      githubData: { $exists: true } 
    }).select('email name githubData.username githubData.lastUpdated githubData.publicRepos');
    
    console.log('\n=== Users with GitHub Data ===');
    console.log(`Found ${usersWithGithubData.length} users with GitHub data:`);
    
    usersWithGithubData.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      if (user.githubData) {
        console.log(`   GitHub: ${user.githubData.username}`);
        console.log(`   Repos: ${user.githubData.publicRepos}`);
        console.log(`   Last Updated: ${user.githubData.lastUpdated}`);
      }
    });
    
    // Find users without GitHub data
    const usersWithoutGithubData = await User.find({ 
      githubData: { $exists: false } 
    }).select('email name githubId');
    
    console.log('\n=== Users without GitHub Data ===');
    console.log(`Found ${usersWithoutGithubData.length} users without GitHub data:`);
    
    usersWithoutGithubData.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - GitHub ID: ${user.githubId || 'None'}`);
    });
    
    // Find users with skills
    const usersWithSkills = await User.find({ 
      skills: { $exists: true, $ne: [] } 
    }).select('email name skills');
    
    console.log('\n=== Users with Skills ===');
    console.log(`Found ${usersWithSkills.length} users with skills:`);
    
    usersWithSkills.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Skills: ${user.skills?.map(s => `${s.name} (${s.level})`).join(', ') || 'None'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing GitHub data storage:', error);
    process.exit(1);
  }
}

testGithubDataStorage();
