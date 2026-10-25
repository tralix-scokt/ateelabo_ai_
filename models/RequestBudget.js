import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: String,
  used: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
export default mongoose.model('RequestBudget', schema);
