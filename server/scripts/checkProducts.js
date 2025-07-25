const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb+srv://ntinyariyvonne823:5j8sJPpv7sqsl2g4@cluster1.9zo3usy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('GlowAI');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections:');
    console.table(collections.map(c => ({ name: c.name, type: c.type })));
    
    // Check products collection
    const products = db.collection('products');
    
    // Count total products
    const count = await products.countDocuments();
    console.log(`\n📊 Total products: ${count}`);
    
    // Get sample products
    const sampleProducts = await products.find().limit(5).toArray();
    console.log('\n🔍 Sample products:');
    sampleProducts.forEach((p, i) => {
      console.log(`\nProduct ${i + 1}:`);
      console.log(`- Name: ${p.name || p.product_name || 'N/A'}`);
      console.log(`- Brand: ${p.brand || p.brands || 'N/A'}`);
      console.log(`- ID: ${p._id || p.code || 'N/A'}`);
      console.log(`- Categories: ${p.categories ? p.categories.slice(0, 50) + '...' : 'N/A'}`);
    });
    
    // Test pagination
    console.log('\n🔢 Testing pagination (page 1, 24 items):');
    const page1 = await products.find()
      .skip(0)
      .limit(24)
      .toArray();
    console.log(`Fetched ${page1.length} products`);
    
    return { count, sample: sampleProducts };
    
  } catch (err) {
    console.error('❌ Error:', err);
    throw err;
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
console.log('🔍 Starting database check...');
main()
  .then(() => console.log('✅ Check completed successfully'))
  .catch(() => process.exit(1));
