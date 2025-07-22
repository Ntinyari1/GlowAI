import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  itemId: mongoose.Schema.Types.ObjectId,
  type: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Favorite', favoriteSchema);
