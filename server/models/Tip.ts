import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
  content: { type: String, required: true },
  skinTypes: [String],
  timeOfDay: String,
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Tip', tipSchema);
