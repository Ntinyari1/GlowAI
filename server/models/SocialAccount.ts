import mongoose from 'mongoose';


const socialAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  username: { type: String },
  displayName: { type: String },
  avatar: { type: String },
  connected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('SocialAccount', socialAccountSchema);
