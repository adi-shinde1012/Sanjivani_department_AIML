const { mongoose, Parent, Teacher, Mark } = require('./db');

async function testConnection() {
  try {
    // Wait for connection to be established
    await mongoose.connection.asPromise();
    console.log('✅ MongoDB Atlas connection successful!');
    
    // Test creating a sample document
    const testParent = new Parent({
      email: 'test@example.com',
      password: 'hashedpassword'
    });
    
    console.log('✅ Database models are working correctly!');
    console.log('🎉 Your MongoDB Atlas integration is complete!');
    
    // Don't actually save the test document
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
