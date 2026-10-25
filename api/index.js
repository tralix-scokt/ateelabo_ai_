// Keep the entry point free of eager native/parser/database imports so health and
// configuration responses work even before any secrets have been configured.
let connection;
function configured() {
  return Boolean(process.env.MONGO_URI && process.env.JWT_SECRET?.length >= 32 &&
    !process.env.JWT_SECRET.startsWith('replace-with'));
}
async function database() {
  const { default: mongoose } = await import('mongoose');
  if (mongoose.connection.readyState === 1) return;
  if (!connection) {
    connection = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, maxPoolSize: 5,
    }).then(async () => {
      const { default: User } = await import('../models/User.js');
      await User.init();
    }).catch(error => { connection = undefined; throw error; });
  }
  await connection;
}
// Literal imports let Vercel trace parser dependencies used by the isolated worker.
async function traceParsers() { await import('mammoth'); await import('pdf-parse'); }
void traceParsers;
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = new URL(req.url, 'https://localhost');
  if (url.pathname === '/api/index.js' && url.searchParams.has('path')) {
    const route = url.searchParams.get('path');
    url.searchParams.delete('path');
    req.url = `/api/${route}${url.search}`;
  }
  if (req.url.split('?')[0] === '/api/health') {
    return res.status(configured() ? 200 : 503).json({
      status: configured() ? 'configured' : 'configuration_required',
      databaseConfigured: Boolean(process.env.MONGO_URI),
      sessionConfigured: Boolean(process.env.JWT_SECRET?.length >= 32),
      aiConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
    });
  }
  if (!configured()) return res.status(503).json({ error: 'Deployment needs MongoDB and session configuration. The administrator must configure environment variables and redeploy.' });
  try { await database(); }
  catch { return res.status(503).json({ error: 'Database unavailable. Please try again later.' }); }
  try {
    const { app } = await import('../server.js');
    return app(req, res);
  } catch (error) {
    console.error('API initialization failed:', error.name);
    return res.status(503).json({ error: 'API initialization unavailable. Please contact the administrator.' });
  }
};
