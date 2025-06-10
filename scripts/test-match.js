/**
 * Match Testing Helper
 * Use this in browser console to test match functionality
 */

async function testMatchData(matchId) {
  console.log('🧪 Testing match data for ID:', matchId);
  
  try {
    // Test the debug endpoint
    const debugResponse = await fetch(`/api/debug/matches/${matchId}`);
    const debugData = await debugResponse.json();
    
    if (debugResponse.ok) {
      console.log('✅ Debug data:', debugData.debug);
      
      // Test messages endpoint
      const messagesResponse = await fetch(`/api/messages?matchId=${matchId}`);
      const messagesData = await messagesResponse.json();
      
      if (messagesResponse.ok) {
        console.log('✅ Messages API working');
        console.log('📨 Match data from messages API:', messagesData.match);
        console.log('📨 Messages count:', messagesData.messages.length);
      } else {
        console.log('❌ Messages API failed:', messagesData.error);
      }
      
    } else {
      console.log('❌ Debug API failed:', debugData.error);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

async function testSendMessage(matchId, content = "Test message") {
  console.log('📤 Testing message send for match:', matchId);
  
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matchId: matchId,
        content: content
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Message sent successfully:', data.message);
    } else {
      console.log('❌ Message send failed:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Message send error:', error);
  }
}

// Export functions to window for easy access
window.testMatchData = testMatchData;
window.testSendMessage = testSendMessage;

console.log('🧪 Match testing functions loaded!');
console.log('Usage:');
console.log('- testMatchData("your-match-id")');
console.log('- testSendMessage("your-match-id", "Hello!")');
