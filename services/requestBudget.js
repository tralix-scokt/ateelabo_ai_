import { createHmac } from 'node:crypto';
import RequestBudget from '../models/RequestBudget.js';
function limit(name, fallback) {
  const value = Number(process.env[name] || fallback);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}
export async function reserveBudget(key, maximum, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  try {
    await RequestBudget.findOneAndUpdate(
      { _id: `${day}:${key}`, used: { $lt: maximum } },
      { $inc: { used: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + 2 * 86400000) } },
      { upsert: true, new: true },
    );
  } catch (error) {
    // Exhausted records cannot match; the attempted upsert hits the unique _id.
    if (error.code === 11000) throw Object.assign(new Error('Daily AI request allowance reached. Please try again tomorrow (UTC).'), { status: 429 });
    throw error; // Fail closed if the durable budget cannot be checked.
  }
}
export async function reserveChatBudget(req) {
  const identity = req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
  const key = createHmac('sha256', process.env.JWT_SECRET).update(identity).digest('hex');
  await reserveBudget(key, req.user ? limit('USER_DAILY_REQUESTS', 100) : limit('GUEST_DAILY_REQUESTS', 20));
  await reserveBudget('global', limit('GLOBAL_DAILY_REQUESTS', 1000));
}
