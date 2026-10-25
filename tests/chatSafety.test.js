import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { chatLimiter, chatUpload, validateChat } from '../middleware/chatSafety.js';

test('chat input and upload protections', async () => {
  const app = express();
  app.use(express.json());
  app.post('/chat', chatUpload, validateChat, (_req, res) => res.json({ ok: true }));
  app.post('/limited', chatLimiter, (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const post = body => fetch(`${url}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal((await post({message: 'Hello'})).status, 200);
    for (const body of [{}, {message: {}}, {message: ' '}, {message: 'x'.repeat(10001)}, {message: 'Hi', fileContext: 'x'.repeat(30001)}]) {
      assert.equal((await post(body)).status, 400);
    }
    const image = new FormData();
    image.append('message', 'Analyze');
    image.append('file', new Blob(['image'], {type: 'image/png'}), 'image.png');
    assert.equal((await fetch(`${url}/chat`, {method:'POST', body:image})).status, 400);
    const large = new FormData();
    large.append('message', 'Analyze');
    large.append('file', new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], {type: 'application/pdf'}), 'large.pdf');
    assert.equal((await fetch(`${url}/chat`, {method:'POST', body:large})).status, 413);
    for (let i = 0; i < 30; i++) assert.equal((await fetch(`${url}/limited`, {method:'POST'})).status, 200);
    assert.equal((await fetch(`${url}/limited`, {method:'POST'})).status, 429);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
