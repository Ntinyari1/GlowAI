// Simple test script
console.log('🔍 Starting test...');
console.log('Node.js version:', process.version);

// Test require
console.log('\nTesting require...');
try {
  const mongo = require('mongodb');
  console.log('✅ MongoDB module loaded successfully');
  console.log('MongoDB package version:', mongo.version);
} catch (err) {
  console.error('❌ Error loading MongoDB module:', err);
}

console.log('\nTest completed');
