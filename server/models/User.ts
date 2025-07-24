import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  age: { type: Number },
  skinType: { type: String },
  goals: [{ type: String }],
  concerns: [{ type: String }],
  routinePref: { type: String },
  photo: { type: String }, // base64 or URL
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
