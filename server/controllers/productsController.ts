// server/controllers/productsController.ts
import { Request, Response } from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = 'mongodb+srv://ntinyariyvonne823:5j8sJPpv7sqsl2g4@cluster1.9zo3usy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const clientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};
const dbName = 'GlowAI';
const collectionName = 'products';

export async function getProducts(req: Request, res: Response) {
  const { query = '', page = 1, pageSize = 12, skinType = '', concerns = '', goals = '' } = req.query;
  // Skipping skinType, concerns, goals filtering for now (not in product schema)
  const client = new MongoClient(uri, clientOptions);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    // Build filter
    const filter: any = {};
    if (query) {
      // Try matching by name or brand
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ];
    }
    // Only filter by query (name/brand) for now
    // Pagination
    const skip = (Number(page) - 1) * Number(pageSize);
    const total = await collection.countDocuments(filter);
    const products = await collection.find(filter).skip(skip).limit(Number(pageSize)).toArray();
    res.json({
      products,
      count: total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize)),
      hasNextPage: Number(page) * Number(pageSize) < total,
      hasPrevPage: Number(page) > 1
    });
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err instanceof Error ? err.message : String(err) });
  } finally {
    try {
      await client.close();
    } catch (closeErr) {
      console.error('Error closing MongoDB connection:', closeErr);
    }
  }
}
