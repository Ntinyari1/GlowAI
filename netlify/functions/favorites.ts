import { Handler } from '@netlify/functions';
import { storage } from '../../server/storage';
import { insertFavoriteSchema } from '../../shared/schema';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const userId = event.queryStringParameters && event.queryStringParameters.userId;
      const type = event.queryStringParameters && event.queryStringParameters.type;
      if (!userId) return { statusCode: 400, body: 'Missing userId' };
      const favorites = await storage.getUserFavorites(parseInt(userId), type);
      return { statusCode: 200, body: JSON.stringify(favorites) };
    }
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const favoriteData = insertFavoriteSchema.parse(body);
      const favorite = await storage.addFavorite(favoriteData);
      return { statusCode: 200, body: JSON.stringify(favorite) };
    }
    if (event.httpMethod === 'DELETE') {
      const userId = event.queryStringParameters && event.queryStringParameters.userId;
      const type = event.queryStringParameters && event.queryStringParameters.type;
      const itemId = event.queryStringParameters && event.queryStringParameters.itemId;
      if (!userId || !type || !itemId) return { statusCode: 400, body: 'Missing parameters' };
      await storage.removeFavorite(parseInt(userId), type, parseInt(itemId));
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to process request', error: String(error) }) };
  }
}; 