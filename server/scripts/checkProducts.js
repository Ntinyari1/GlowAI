// Check MongoDB connection and products collection
import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://ntinyariyvonne823:5j8sJPpv7sqsl2g4@cluster1.9zo3usy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const dbName = 'GlowAI';
const collectionName = 'products';

async function checkDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`\n📚 Collections in ${dbName}:`);
    console.log(collectionNames);
    
    if (collectionNames.includes(collectionName)) {
      console.log(`\n✅ Collection "${collectionName}" found`);
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`📊 Number of products: ${count}`);
      
      if (count > 0) {
        console.log('\n📝 Sample product:');
        const sample = await collection.findOne();
        console.log(JSON.stringify(sample, null, 2));
      } else {
        console.log('\n⚠️  Collection is empty. No products found.');
      }
    } else {
      console.log(`\n❌ Collection "${collectionName}" not found`);
    }
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

checkDatabase();
