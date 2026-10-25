// Vercel invokes this handler per request; never start a listening HTTP server here.
import mongoose from 'mongoose';
import User from '../models/User.js';
// Trace parser dependencies into the function bundle for the isolated worker.
// These literal lazy imports are traced without loading native PDF code at cold start.
async function parserDependencies() { await import('mammoth'); await import('pdf-parse'); }

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
  try {
    const { app } = await import('../server.js');
    // PDF dependencies are loaded by the isolated extraction worker, not for login/health.
    if (req.url.startsWith('/api/chat') && req.headers['content-type']?.includes('multipart/form-data')) {
      // Keep dependency tracing explicit; the worker performs actual extraction.
      void parserDependencies;
    }
    return app(req, res);
  } catch (error) {
    console.error('API initialization failed:', error.name);
    return res.status(503).json({ error: 'API initialization unavailable. Please contact the administrator.' });
  }
}
