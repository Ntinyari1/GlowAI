// ESM version of MongoDB check script
import { MongoClient } from 'mongodb';

// MongoDB connection string
const uri = 'mongodb+srv://ntinyariyvonne823:5j8sJPpv7sqsl2g4@cluster1.9zo3usy.mongodb.net/GlowAI?retryWrites=true&w=majority';

async function run() {
  console.log('🔍 Starting MongoDB check...');
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Get the database
    const db = client.db();
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections:');
    console.table(collections.map(c => ({ name: c.name, type: c.type })));
    
    // Check products collection
    const products = db.collection('products');
    const count = await products.countDocuments();
    console.log(`\n📊 Total products: ${count}`);
    
    // Get first 3 products
    const sample = await products.find().limit(3).toArray();
    console.log('\n🔍 Sample products:');
    sample.forEach((p, i) => {
      console.log(`\nProduct ${i + 1}:`);
      console.log(`- Name: ${p.name || p.product_name || 'N/A'}`);
      console.log(`- Brand: ${p.brand || p.brands || 'N/A'}`);
      console.log(`- ID: ${p._id || p.code || 'N/A'}`);
      console.log(`- Categories: ${p.categories ? p.categories.slice(0, 50) + '...' : 'N/A'}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
run().catch(console.error);
