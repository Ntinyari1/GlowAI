import { Handler } from '@netlify/functions';
import { storage } from '../../server/storage';
import { insertRoutineSchema } from '../../shared/schema';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const userId = event.queryStringParameters && event.queryStringParameters.userId;
      if (!userId) return { statusCode: 400, body: 'Missing userId' };
      const routines = await storage.getUserRoutines(parseInt(userId));
      return { statusCode: 200, body: JSON.stringify(routines) };
    }
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const routineData = insertRoutineSchema.parse(body);
      const routine = await storage.createRoutine(routineData);
      return { statusCode: 200, body: JSON.stringify(routine) };
    }
    if (event.httpMethod === 'PUT') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return { statusCode: 400, body: 'Missing routine id' };
      const body = event.body ? JSON.parse(event.body) : {};
      const updates = insertRoutineSchema.partial().parse(body);
      const routine = await storage.updateRoutine(parseInt(id), updates);
      if (!routine) return { statusCode: 404, body: 'Routine not found' };
      return { statusCode: 200, body: JSON.stringify(routine) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to process request', error: String(error) }) };
  }
}; 