import mongoose from 'mongoose';

const socialPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  status: String,
  scheduledFor: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SocialPost', socialPostSchema);
