// Migration script to clean up duplicate matches and migrate to new single-match system
const { MongoClient } = import('mongodb');

// This script should be run after deploying the new match system
// It will:
// 1. Find all duplicate matches (where there are two matches for the same developer-project pair)
// 2. Merge them into a single match with projectOwnerId field
// 3. Update any existing messages to reference the single match

async function migrateMatches() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Starting match migration...');
    
    // Find all matches where targetType is 'project' (developer -> project matches)
    const developerMatches = await db.collection('matches').find({
      targetType: 'project'
    }).toArray();
    
    console.log(`Found ${developerMatches.length} developer matches`);
    
    for (const devMatch of developerMatches) {
      // Find the corresponding project owner match
      const ownerMatch = await db.collection('matches').findOne({
        userId: devMatch.targetId, // This should be the project owner
        targetId: devMatch.userId,
        targetType: 'user'
      });
      
      if (ownerMatch) {
        console.log(`Migrating match pair: ${devMatch._id} and ${ownerMatch._id}`);
        
        // Update the developer match to include projectOwnerId
        await db.collection('matches').updateOne(
          { _id: devMatch._id },
          { $set: { projectOwnerId: ownerMatch.userId } }
        );
        
        // Update any messages that reference the owner match to reference the developer match
        await db.collection('messages').updateMany(
          { matchId: ownerMatch._id },
          { $set: { matchId: devMatch._id } }
        );
        
        // Delete the owner match
        await db.collection('matches').deleteOne({ _id: ownerMatch._id });
        
        console.log(`Merged matches ${devMatch._id} and ${ownerMatch._id}`);
      } else {
        console.log(`No corresponding owner match found for ${devMatch._id}`);
      }
    }
    
    console.log('Match migration completed');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.close();
  }
}

// Run the migration
if (require.main === module) {
  migrateMatches().catch(console.error);
}

module.exports = { migrateMatches };
