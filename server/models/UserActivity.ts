import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activity: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('UserActivity', userActivitySchema);
