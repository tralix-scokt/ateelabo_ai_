// Vercel invokes this handler per request; never start a listening HTTP server here.
import mongoose from 'mongoose';
import { app } from '../server.js';
import User from '../models/User.js';
// Trace parser dependencies into the function bundle for the isolated worker.
import 'mammoth';
import 'pdf-parse';

let connection;
export function configured() {
  return Boolean(process.env.MONGO_URI && process.env.JWT_SECRET?.length >= 32 &&
    !process.env.JWT_SECRET.startsWith('replace-with'));
}
async function database() {
  if (mongoose.connection.readyState === 1) return;
  if (!connection) {
    connection = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, maxPoolSize: 5,
    }).then(() => User.init()).catch(error => { connection = undefined; throw error; });
  }
  await connection;
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.url.split('?')[0] === '/api/health') {
    return res.status(configured() ? 200 : 503).json({
      status: configured() ? 'configured' : 'configuration_required',
      databaseConfigured: Boolean(process.env.MONGO_URI),
      sessionConfigured: Boolean(process.env.JWT_SECRET?.length >= 32),
      aiConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
      // Configuration presence is not a live provider/database connectivity test.
    });
  }
  if (!configured()) return res.status(503).json({ error: 'Deployment needs MongoDB and session configuration. The administrator must configure environment variables and redeploy.' });
  try { await database(); }
  catch { return res.status(503).json({ error: 'Database unavailable. Please try again later.' }); }
  return app(req, res);
}
