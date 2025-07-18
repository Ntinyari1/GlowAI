import { Handler } from '@netlify/functions';
import { storage } from '../../server/storage';
import { insertProductSchema } from '../../shared/schema';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      if (params.id) {
        const product = await storage.getProductById(parseInt(params.id));
        if (!product) return { statusCode: 404, body: 'Product not found' };
        return { statusCode: 200, body: JSON.stringify(product) };
      }
      if (params.search) {
        const products = await storage.searchProducts(params.search);
        return { statusCode: 200, body: JSON.stringify(products) };
      }
      const products = await storage.getProducts(params.category, params.limit ? parseInt(params.limit) : undefined);
      return { statusCode: 200, body: JSON.stringify(products) };
    }
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const productData = insertProductSchema.parse(body);
      const product = await storage.createProduct(productData);
      return { statusCode: 200, body: JSON.stringify(product) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to process request', error: String(error) }) };
  }
}; 