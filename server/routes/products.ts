// server/routes/products.ts
import { Router } from 'express';
import { getProducts } from '../controllers/productsController';
import { MongoClient, ServerApiVersion } from 'mongodb';

const router = Router();

// Main products endpoint with pagination
router.get('/', getProducts);

// Test endpoint to check MongoDB connection and data
router.get('/test', async (req, res) => {
  const uri = 'mongodb+srv://ntinyariyvonne823:5j8sJPpv7sqsl2g4@cluster1.9zo3usy.mongodb.net/GlowAI?retryWrites=true&w=majority';
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    
    const db = client.db('GlowAI');
    const collection = db.collection('products');
    
    // Get total count of products
    const total = await collection.countDocuments();
    
    // Get first 5 products
    const products = await collection.find({}).limit(5).toArray();
    
    res.json({
      success: true,
      totalProducts: total,
      sampleProducts: products.map(p => ({
        id: p._id,
        name: p.name || p.product_name,
        brand: p.brand || p.brands,
        categories: p.categories,
        image_url: p.image_url
      }))
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  } finally {
    await client.close();
  }
});

export default router;
