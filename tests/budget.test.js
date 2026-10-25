import test from 'node:test';
import assert from 'node:assert/strict';
import RequestBudget from '../models/RequestBudget.js';
import { reserveBudget } from '../services/requestBudget.js';
test('daily budget uses an atomic conditional upsert and fails closed', async t => {
  const mock=t.mock.method(RequestBudget,'findOneAndUpdate',async()=>({used:1}));
  await reserveBudget('person',20,new Date('2026-10-25T10:00:00Z'));
  const [filter,update,options]=mock.mock.calls[0].arguments;
  assert.deepEqual(filter,{_id:'2026-10-25:person',used:{$lt:20}});
  assert.equal(update.$inc.used,1); assert.equal(options.upsert,true);
  mock.mock.mockImplementation(async()=>{throw Object.assign(new Error('duplicate'),{code:11000});});
  await assert.rejects(()=>reserveBudget('person',20),error=>error.status===429);
  mock.mock.mockImplementation(async()=>{throw new Error('Database unavailable');});
  await assert.rejects(()=>reserveBudget('person',20),/Database unavailable/);
});
