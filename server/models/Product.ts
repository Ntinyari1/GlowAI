import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
