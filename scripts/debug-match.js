// Debug script to check match creation
const mongoose = import('mongoose');

// MongoDB connection string from your environment
const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_connection_string';

async function debugMatch() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const matchId = '684848ce037f57d7a2709716'; // The match ID from your screenshot
    
    // Get the match document
    const match = await mongoose.connection.collection('matches').findOne({
      _id: new mongoose.Types.ObjectId(matchId)
    });
    
    console.log('Match document:', JSON.stringify(match, null, 2));
    
    // Get the corresponding application
    const application = await mongoose.connection.collection('applications').findOne({
      projectId: match.targetId,
      developerId: match.userId,
      status: 'accepted'
    });
    
    console.log('Application document:', JSON.stringify(application, null, 2));
    
    // Check if we need to update the match
    if (match && !match.projectOwnerId && application && application.projectOwnerId) {
      console.log('Match is missing projectOwnerId, updating...');
      
      await mongoose.connection.collection('matches').updateOne(
        { _id: new mongoose.Types.ObjectId(matchId) },
        { $set: { projectOwnerId: application.projectOwnerId } }
      );
      
      console.log('Match updated successfully!');
      
      // Verify the update
      const updatedMatch = await mongoose.connection.collection('matches').findOne({
        _id: new mongoose.Types.ObjectId(matchId)
      });
      
      console.log('Updated match:', JSON.stringify(updatedMatch, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the debug script
debugMatch();
