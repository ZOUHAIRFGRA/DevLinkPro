#!/usr/bin/env node

/**
 * Pusher Configuration Checker
 * Run this script to verify your Pusher environment variables are set correctly
 */

const requiredEnvVars = [
  'PUSHER_APP_ID',
  'PUSHER_KEY', 
  'PUSHER_SECRET',
  'PUSHER_CLUSTER',
  'NEXT_PUBLIC_PUSHER_KEY',
  'NEXT_PUBLIC_PUSHER_CLUSTER'
];

console.log('🔍 Checking Pusher Configuration...\n');

let allSet = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allSet = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allSet) {
  console.log('✅ All Pusher environment variables are configured!');
  console.log('\n📋 Next steps:');
  console.log('1. Make sure your Pusher app is active');
  console.log('2. Test the connection in your browser');
  console.log('3. Check the browser console for any errors');
} else {
  console.log('❌ Missing environment variables!');
  console.log('\n📋 Please set the missing variables in your .env.local file');
  console.log('📖 See REALTIME_SETUP.md for detailed instructions');
}

console.log('\n🔗 Pusher Dashboard: https://dashboard.pusher.com/');
console.log('📚 Documentation: https://pusher.com/docs/channels/getting_started/javascript/');
