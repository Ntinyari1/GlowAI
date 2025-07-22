import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI must be set in your .env file');
}

mongoose.connect(uri);

mongoose.connection.on('connected', () => {
  console.log('[db] MongoDB connection established successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('[db] MongoDB connection error:', err);
});

export default mongoose;