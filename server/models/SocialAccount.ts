import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  provider: String,
  providerId: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SocialAccount', socialAccountSchema);
