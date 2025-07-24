import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';

const uri = 'mongodb+srv://ntinyariyvonne823:5j8sJPpv7sqsl2g4@cluster1.9zo3usy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const dbName = 'GlowAI';
const collectionName = 'products';

async function main() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
    await collection.deleteMany({});
    const result = await collection.insertMany(products);
    console.log(`Imported ${result.insertedCount} products to MongoDB Atlas.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();