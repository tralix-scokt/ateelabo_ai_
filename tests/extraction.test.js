import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDocument } from '../services/extractDocument.js';
test('isolated worker extracts real PDF and DOCX fixtures', async () => {
  assert.match(await extractDocument('tests/fixtures/document.docx','docx'),/test colour is blue/);
  assert.match(await extractDocument('tests/fixtures/document.pdf','pdf'),/test colour is green/);
});
test('file contents must match the declared document type', async () => {
  await assert.rejects(()=>extractDocument('tests/fixtures/document.docx','pdf'),error=>error.status===400);
  await assert.rejects(()=>extractDocument('tests/fixtures/document.pdf','docx'),error=>error.status===400);
});
