import mongoose from 'mongoose';

const routineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  steps: [Object],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

export default mongoose.model('Routine', routineSchema);
