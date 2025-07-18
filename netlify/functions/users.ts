import { Handler } from '@netlify/functions';
import { storage } from '../../server/storage';
import { insertUserSchema } from '../../shared/schema';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return { statusCode: 400, body: 'Missing user id' };
      const user = await storage.getUser(parseInt(id));
      if (!user) return { statusCode: 404, body: 'User not found' };
      return { statusCode: 200, body: JSON.stringify(user) };
    }
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const userData = insertUserSchema.parse(body);
      const user = await storage.createUser(userData);
      return { statusCode: 200, body: JSON.stringify(user) };
    }
    if (event.httpMethod === 'PUT') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return { statusCode: 400, body: 'Missing user id' };
      const body = event.body ? JSON.parse(event.body) : {};
      const updates = insertUserSchema.partial().parse(body);
      const user = await storage.updateUser(parseInt(id), updates);
      if (!user) return { statusCode: 404, body: 'User not found' };
      return { statusCode: 200, body: JSON.stringify(user) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to process request', error: String(error) }) };
  }
}; 