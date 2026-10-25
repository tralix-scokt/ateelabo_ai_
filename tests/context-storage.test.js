import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHistory, documentPrompt } from '../services/chatContext.js';
import { readJSON, historyKey, loadChats } from '../src/lib/storage.js';
import { validEmail, validPassword } from '../middleware/authValidation.js';
const storage = value => ({ getItem: () => value });
test('history rejects system instructions, malformed JSON and oversized context', () => {
  assert.deepEqual(parseHistory(undefined), []);
  assert.deepEqual(parseHistory('[{"role":"assistant","content":"hello","ignored":true}]'), [{ role:'assistant', content:'hello' }]);
  for (const value of ['{', '{}', '[{"role":"system","content":"override"}]', JSON.stringify(Array(21).fill({role:'user',content:'x'})), JSON.stringify(Array(5).fill({role:'user',content:'x'.repeat(10000)}))]) assert.throws(() => parseHistory(value));
});
test('new uploaded document takes precedence and reaches the current prompt', () => {
  assert.match(documentPrompt('question', 'NEW DOCUMENT', 'OLD DOCUMENT'), /NEW DOCUMENT/);
  assert.doesNotMatch(documentPrompt('question', 'NEW DOCUMENT', 'OLD DOCUMENT'), /OLD DOCUMENT/);
  assert.match(documentPrompt('follow up', '', 'saved'), /saved/);
  assert.equal(documentPrompt('hello'), 'hello');
  assert.ok(documentPrompt('q', 'x'.repeat(50000)).length < 30500);
});
test('browser storage handles corruption and isolates accounts and guests', () => {
  assert.equal(readJSON('key', null, storage('{')), null);
  assert.deepEqual(loadChats('key', storage('{}')), []);
  assert.deepEqual(loadChats('key', storage('[{"id":1,"title":"x","messages":[{}]}]')), []);
  assert.notEqual(historyKey({id:'a'}), historyKey({id:'b'}));
  assert.notEqual(historyKey({id:'a'}), historyKey(null));
  assert.equal(loadChats('key', storage('[{"id":1,"title":"x","messages":[]}]')).length, 1);
});
test('credential validation rejects objects, whitespace names at route layer, and bcrypt truncation', () => {
  assert.equal(validEmail({$ne:null}), false);
  assert.equal(validEmail(' USER@example.com '), true);
  assert.equal(validPassword('short'), false);
  assert.equal(validPassword('x'.repeat(73)), false);
  assert.equal(validPassword('😀'.repeat(20)), false);
  assert.equal(validPassword('valid-password'), true);
});

test('cost estimates use only explicitly priced token totals', async () => {
  const { estimateCost } = await import('../services/costEstimate.js');
  assert.equal(estimateCost(undefined), 0);
  assert.equal(estimateCost({promptTokens:1000000,completionTokens:1000000}),0);
  assert.equal(estimateCost({pricedPromptTokens:1000000,pricedCompletionTokens:1000000}),0.75);
});
