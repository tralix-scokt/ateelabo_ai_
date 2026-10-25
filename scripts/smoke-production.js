import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
process.env.NODE_ENV='production';
process.env.JWT_SECRET='test-secret-not-for-real-deployments';
const { app }=await import('../server.js');
const server=app.listen(0,'127.0.0.1');
await new Promise(resolve=>server.once('listening',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
try {
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  for(const path of ['/', '/login', '/profile', '/settings', '/admin']) {
    const response=await fetch(url+path); assert.equal(response.status,200); assert.equal(await response.text(),html);
  }
  const asset=html.match(/src="([^"]+\.js)"/)[1];
  const response=await fetch(url+asset); assert.equal(response.status,200); assert.match(response.headers.get('content-type'),/javascript/);
  assert.equal((await fetch(url+'/api/missing')).status,404);
  const logout=await fetch(url+'/api/auth/logout',{method:'POST'});
  assert.match(logout.headers.get('set-cookie'),/Secure/);
  assert.match(logout.headers.get('set-cookie'),/HttpOnly/);
  console.log('Production smoke checks passed: SPA routes, JS asset, API 404 and secure cookie settings. No live database or provider requests made.');
} finally { await new Promise(resolve=>server.close(resolve)); }
