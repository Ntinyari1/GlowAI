import { Handler } from '@netlify/functions';
import { storage } from '../../server/storage';
import { insertTipSchema } from '../../shared/schema';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const skinType = params.skinType;
      const limit = params.limit ? parseInt(params.limit) : undefined;
      const tips = await storage.getTips(skinType, limit);
      return {
        statusCode: 200,
        body: JSON.stringify(tips),
      };
    }
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      
      // Extract only the expected properties for createTip
      const tipData = {
        content: body.content,
        skinTypes: body.skinTypes || undefined,
        timeOfDay: body.timeOfDay || undefined
      };
      
      // First validate with the full schema
      insertTipSchema.parse(body);
      
      // Then create the tip with only the expected properties
      const tip = await storage.createTip(tipData);
      return {
        statusCode: 200,
        body: JSON.stringify(tip),
      };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to process request', error: String(error) }),
    };
  }
}; 