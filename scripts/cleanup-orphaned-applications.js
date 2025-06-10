// Cleanup script for orphaned applications
// Run this script if you have applications with missing projects or developers

const { MongoClient } = import('mongodb');

async function cleanupOrphanedApplications() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Finding orphaned applications...');
    
    // Get all applications
    const applications = await db.collection('applications').find({}).toArray();
    console.log(`Found ${applications.length} total applications`);
    
    let orphanedCount = 0;
    const orphanedIds = [];
    
    // Check each application
    for (const app of applications) {
      const [project, developer] = await Promise.all([
        db.collection('projects').findOne({ _id: app.projectId }),
        db.collection('users').findOne({ _id: app.developerId })
      ]);
      
      if (!project || !developer) {
        orphanedIds.push(app._id);
        orphanedCount++;
        console.log(`❌ Orphaned application: ${app._id}`);
        if (!project) console.log(`   Missing project: ${app.projectId}`);
        if (!developer) console.log(`   Missing developer: ${app.developerId}`);
      }
    }
    
    if (orphanedCount === 0) {
      console.log('✅ No orphaned applications found!');
      return;
    }
    
    console.log(`\n🗑️  Found ${orphanedCount} orphaned applications`);
    console.log('To remove them, uncomment the delete operation below and run again:\n');
    
    // Uncomment the lines below to actually delete orphaned applications
    // const result = await db.collection('applications').deleteMany({
    //   _id: { $in: orphanedIds }
    // });
    // console.log(`✅ Deleted ${result.deletedCount} orphaned applications`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
  }
}

// Run the cleanup
cleanupOrphanedApplications()
  .then(() => {
    console.log('✅ Cleanup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
