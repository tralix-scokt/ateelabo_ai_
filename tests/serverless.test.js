import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.js';
test('serverless health and missing-configuration responses never expose secrets or connect', async () => {
  const oldUri=process.env.MONGO_URI;
  const oldSecret=process.env.JWT_SECRET;
  delete process.env.MONGO_URI;
  delete process.env.JWT_SECRET;
  const response=()=>({ headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},json(body){this.body=body;return this;} });
  try {
    const health=response();
    await handler({url:'/api/health'},health);
    assert.equal(health.code,503);
    assert.equal(health.body.status,'configuration_required');
    const api=response();
    await handler({url:'/api/auth/login'},api);
    assert.equal(api.code,503);
    assert.match(api.body.error,/configuration/);
  } finally {
    if(oldUri!==undefined)process.env.MONGO_URI=oldUri;
    if(oldSecret!==undefined)process.env.JWT_SECRET=oldSecret;
  }
});
