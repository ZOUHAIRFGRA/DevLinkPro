// Test script to verify Pusher setup
// Run this in browser console on your app to test real-time connections

console.log('🚀 Testing Pusher Connection...');

// Test client connection
if (typeof window !== 'undefined' && window.Pusher) {
  console.log('✅ Pusher client library loaded');
  
  // Test connecting to a test channel
  const testChannel = pusherClient.subscribe('test-channel');
  
  testChannel.bind('test-event', function(data) {
    console.log('✅ Received test event:', data);
  });
  
  // Check connection state
  pusherClient.connection.bind('connected', function() {
    console.log('✅ Connected to Pusher');
  });
  
  pusherClient.connection.bind('disconnected', function() {
    console.log('❌ Disconnected from Pusher');
  });
  
  pusherClient.connection.bind('error', function(err) {
    console.log('❌ Pusher connection error:', err);
  });
  
} else {
  console.log('❌ Pusher client not found');
}

// Test API endpoint
fetch('/api/pusher/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'socket_id=test&channel_name=test-channel'
})
.then(response => {
  if (response.ok) {
    console.log('✅ Pusher auth endpoint responding');
  } else {
    console.log('❌ Pusher auth endpoint error:', response.status);
  }
})
.catch(err => {
  console.log('❌ Pusher auth endpoint failed:', err);
});
