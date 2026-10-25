// Trusted operator-only bootstrap. Registration/login must never grant admin by email alone.
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { validEmail } from '../middleware/authValidation.js';
const email = process.argv[2];
if (!validEmail(email) || !process.env.MONGO_URI) throw new Error('Usage: node scripts/set-admin.js user@example.com (MONGO_URI required)');
try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const user = await User.findOneAndUpdate({ email: email.trim().toLowerCase() }, { role: 'admin' }, { new: true });
  if (!user) throw new Error('Create the account first, and verify ownership before granting administrator access.');
  console.log('Administrator role granted to the specified account.');
} finally { await mongoose.disconnect(); }
