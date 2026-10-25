import test from 'node:test';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nock from 'nock';
import User from '../models/User.js';
import AIUsage from '../models/AIUsage.js';
import RequestBudget from '../models/RequestBudget.js';
process.env.JWT_SECRET = 'test-only-secret-never-use-in-production';
process.env.OPENAI_API_KEY = 'test';
process.env.GEMINI_API_KEY = 'test';
process.env.ADMIN_EMAIL = 'owner@example.com';
const { app } = await import('../server.js');

test('API regression checks with mocked database and AI providers', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const user = { _id:'507f1f77bcf86cd799439011', email:'owner@example.com', name:'Owner', role:'user', tokenVersion:0, password:await bcrypt.hash('old-password', 4), save:async () => {} };
  const token = () => jwt.sign({ userId:user._id, tokenVersion:user.tokenVersion }, process.env.JWT_SECRET);
  const post = (path, body, headers = {}) => fetch(url + path, {method:'POST', headers:{'Content-Type':'application/json', ...headers}, body:JSON.stringify(body)});
  nock.disableNetConnect(); nock.enableNetConnect('127.0.0.1');
  try {
    await t.test('malformed account data is rejected before database access', async () => {
      assert.equal((await post('/api/auth/register', {name:'x', email:{$ne:null}, password:'password123'})).status, 400);
      assert.equal((await post('/api/auth/register', {name:' ', email:'a@b.com', password:'password123'})).status, 400);
      assert.equal((await post('/api/auth/change-password', {email:{$ne:null}, currentPassword:'x', newPassword:'new-password'})).status, 400);
      assert.equal((await fetch(url+'/api/chat',{method:'POST', headers:{'Content-Type':'application/json'},body:'{'})).status, 400);
    });
    await t.test('login uses an HttpOnly cookie and never promotes an unverified owner email', async () => {
      t.mock.method(User,'findOne', async () => user);
      const response = await post('/api/auth/login', {email:'OWNER@example.com', password:'old-password'});
      assert.equal(response.status, 200);
      assert.match(response.headers.get('set-cookie'), /HttpOnly/);
      assert.match(response.headers.get('set-cookie'), /SameSite=Strict/);
      assert.equal((await response.json()).token, undefined);
      assert.equal(user.role,'user');
      t.mock.restoreAll();
    });
    await t.test('admin endpoints reject missing and regular-user sessions', async () => {
      assert.equal((await fetch(url+'/api/admin/stats')).status,401);
      t.mock.method(User,'findById', async () => user);
      assert.equal((await fetch(url+'/api/admin/stats',{headers:{Authorization:`Bearer ${token()}`}})).status,403);
      t.mock.restoreAll();
    });
    await t.test('delegated admins can change roles; invalid IDs and self-demotion are blocked', async () => {
      user.role='admin'; user.email='delegate@example.com';
      const target={_id:'507f1f77bcf86cd799439012', email:'other@example.com', role:'user', save:async()=>{}};
      t.mock.method(User,'findById', async id => id === user._id ? user : target);
      const patch = (id, role) => fetch(url+`/api/admin/users/${id}/role`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token()}`},body:JSON.stringify({role})});
      assert.equal((await patch('not-an-id','admin')).status,400);
      assert.equal((await patch(user._id,'user')).status,403);
      assert.equal((await patch(target._id,'admin')).status,200);
      assert.equal(target.role,'admin');
      t.mock.restoreAll();
    });
    await t.test('OpenAI receives prior turns and saved document; usage recorded', async () => {
      let recorded;
      t.mock.method(RequestBudget,'findOneAndUpdate',async()=>({used:1}));
      t.mock.method(AIUsage,'create', async data => { recorded=data; });
      const scope=nock('https://api.openai.com').post('/v1/chat/completions', body => body.messages[1].content === 'earlier' && body.messages.at(-1).content.includes('DOCUMENT FACT')).reply(200,{model:'gpt-4o-mini', choices:[{message:{content:'Answer'}}],usage:{total_tokens:12}});
      const response=await post('/api/chat',{message:'follow up',fileContext:'DOCUMENT FACT',history:JSON.stringify([{role:'user',content:'earlier'}])});
      assert.equal(response.status,200); assert.equal((await response.json()).reply,'Answer');
      assert.equal(recorded.totalTokens,12); assert.ok(scope.isDone());
      t.mock.restoreAll();
    });
    await t.test('rate-limit failures fall back to Gemini with mapped conversation roles', async () => {
      t.mock.method(RequestBudget,'findOneAndUpdate',async()=>({used:1}));
      t.mock.method(AIUsage,'create',async()=>{});
      nock('https://api.openai.com').post('/v1/chat/completions').reply(429,{});
      const scope=nock('https://generativelanguage.googleapis.com').post('/v1beta/models/gemini-2.5-flash:generateContent',body => body.contents[0].role === 'model').reply(200,{candidates:[{content:{parts:[{text:'Backup answer'}]}}]});
      const response=await post('/api/chat',{message:'continue',history:[{role:'assistant',content:'previous'}]});
      assert.equal(response.status,200); assert.equal((await response.json()).reply,'Backup answer'); assert.ok(scope.isDone());
      t.mock.restoreAll();
    });
    await t.test('uploaded DOCX text reaches the provider on the first question', async () => {
      t.mock.method(RequestBudget,'findOneAndUpdate',async()=>({used:1}));
      t.mock.method(AIUsage,'create',async()=>{});
      const scope=nock('https://api.openai.com').post('/v1/chat/completions',body => body.messages.at(-1).content.includes('test colour is blue')).reply(200,{choices:[{message:{content:'Blue'}}]});
      const form=new FormData(); form.append('message','What colour?');
      form.append('file',new Blob([await readFile('tests/fixtures/document.docx')],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),'document.docx');
      const response=await fetch(url+'/api/chat',{method:'POST',body:form});
      assert.equal(response.status,200); assert.match((await response.json()).fileText,/test colour is blue/); assert.ok(scope.isDone());
      t.mock.restoreAll();
    });
    await t.test('daily allowance blocks provider work before a request is sent', async () => {
      t.mock.method(RequestBudget,'findOneAndUpdate',async()=>{throw Object.assign(new Error('duplicate'),{code:11000});});
      assert.equal((await post('/api/chat',{message:'hello'})).status,429);
      t.mock.restoreAll();
    });
    await t.test('malformed primary output falls back; backup quota is reported', async () => {
      t.mock.method(RequestBudget,'findOneAndUpdate',async()=>({used:1}));
      nock('https://api.openai.com').post('/v1/chat/completions').reply(200,'not json');
      nock('https://generativelanguage.googleapis.com').post('/v1beta/models/gemini-2.5-flash:generateContent').reply(429,{error:{message:'quota exceeded'}});
      const response=await post('/api/chat',{message:'hello'});
      assert.equal(response.status,429); assert.equal((await response.json()).code,'AI_QUOTA_EXCEEDED');
      t.mock.restoreAll();
    });
    await t.test('cookie-authenticated chat rejects revoked sessions', async () => {
      t.mock.method(User,'findById',()=>({select:async()=>({...user,tokenVersion:9})}));
      const response=await post('/api/chat',{message:'hello'},{Cookie:`ateelabo_session=${token()}`});
      assert.equal(response.status,401); t.mock.restoreAll();
    });
    await t.test('profile changes require authentication and reject invalid data', async () => {
      const patch = (body,headers={})=>fetch(url+'/api/auth/profile',{method:'PATCH',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
      assert.equal((await patch({name:'Changed'})).status,401);
      t.mock.method(User,'findById',()=>({select:async()=>user}));
      assert.equal((await patch({name:{$ne:null}},{Cookie:`ateelabo_session=${token()}`})).status,400);
      t.mock.method(User,'findByIdAndUpdate',()=>({select:async()=>({...user,name:'Changed',profilePicture:''})}));
      const response=await patch({name:'Changed'},{Cookie:`ateelabo_session=${token()}`});
      assert.equal(response.status,200); assert.equal((await response.json()).user.name,'Changed');
      t.mock.restoreAll();
    });
    await t.test('ordinary provider client errors do not trigger fallback', async () => {
      t.mock.method(RequestBudget,'findOneAndUpdate',async()=>({used:1}));
      nock('https://api.openai.com').post('/v1/chat/completions').reply(400,{});
      assert.equal((await post('/api/chat',{message:'hello'})).status,502);
      t.mock.restoreAll();
    });
    await t.test('password changes revoke old sessions', async () => {
      const oldToken=token();
      t.mock.method(User,'findOne', async()=>user);
      assert.equal((await post('/api/auth/change-password',{email:user.email,currentPassword:'old-password',newPassword:'new-password'})).status,200);
      assert.equal(user.tokenVersion,1);
      t.mock.method(User,'findById',()=>({select:async()=>user}));
      assert.equal((await post('/api/chat',{message:'hi'},{Authorization:`Bearer ${oldToken}`})).status,401);
      t.mock.restoreAll();
    });
    await t.test('logout clears the session cookie', async () => {
      const response=await post('/api/auth/logout',{});
      assert.equal(response.status,200);
      assert.match(response.headers.get('set-cookie'),/Expires=Thu, 01 Jan 1970/);
    });
  } finally { t.mock.restoreAll(); nock.cleanAll(); nock.enableNetConnect(); await new Promise(resolve=>server.close(resolve)); }
});
