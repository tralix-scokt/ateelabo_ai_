import test from "node:test";
import assert from "node:assert/strict";
import { readEvents } from "../services/eventStream.js";
import nock from "nock";
import RequestBudget from "../models/RequestBudget.js";
import AIUsage from "../models/AIUsage.js";
process.env.JWT_SECRET = "test-only-secret-never-use-in-production";
process.env.OPENAI_API_KEY = "test";
process.env.GEMINI_API_KEY = "test";
const { app } = await import("../server.js");
test("SSE decoder preserves fragmented UTF-8, CRLF and multiple frames", async () => {
  const bytes = new TextEncoder().encode(
    'data: {"text":"Hello 🌍"}\r\n\r\ndata: [DONE]\r\n\r\n',
  );
  async function* chunks() {
    for (const byte of bytes) yield new Uint8Array([byte]);
  }
  const events = [];
  for await (const event of readEvents(chunks())) events.push(event);
  assert.deepEqual(events, [{ text: "Hello 🌍" }]);
  async function* broken() {
    yield 'data: {"text":"unfinished"}';
  }
  await assert.rejects(async () => {
    for await (const event of readEvents(broken())) void event;
  }, /Incomplete/);
});
test("real SSE API path streams provider deltas, final metadata and backup responses", async (t) => {
  t.mock.method(RequestBudget, "findOneAndUpdate", async () => ({ used: 1 }));
  t.mock.method(AIUsage, "create", async () => {});
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const url = `http://127.0.0.1:${server.address().port}/api/chat`;
  const post = () =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ message: "Hello" }),
    });
  const frame = (data) => `data: ${JSON.stringify(data)}\n\n`;
  nock.disableNetConnect();
  nock.enableNetConnect("127.0.0.1");
  try {
    const primary = nock("https://api.openai.com")
      .post("/v1/chat/completions", (body) => body.stream === true)
      .reply(
        200,
        frame({ choices: [{ delta: { content: "Hello " } }] }) +
          frame({ choices: [{ delta: { content: "world" } }] }) +
          frame({ usage: { total_tokens: 12 } }) +
          "data: [DONE]\n\n",
        { "Content-Type": "text/event-stream" },
      );
    const response = await post();
    assert.match(response.headers.get("content-type"), /text\/event-stream/);
    const events = [];
    for await (const event of readEvents(response.body)) events.push(event);
    assert.equal(
      events
        .filter((e) => e.type === "delta")
        .map((e) => e.text)
        .join(""),
      "Hello world",
    );
    assert.equal(events.at(-1).reply, "Hello world");
    assert.equal(events.at(-1).type, "done");
    assert.ok(primary.isDone());
    nock("https://api.openai.com").post("/v1/chat/completions").reply(429, {});
    const backup = nock("https://generativelanguage.googleapis.com")
      .post("/v1beta/models/gemini-2.5-flash:streamGenerateContent")
      .query({ alt: "sse" })
      .reply(
        200,
        frame({ candidates: [{ content: { parts: [{ text: "Backup" }] } }] }),
        { "Content-Type": "text/event-stream" },
      );
    const fallback = await post();
    const backupEvents = [];
    for await (const event of readEvents(fallback.body))
      backupEvents.push(event);
    assert.equal(backupEvents[0].text, "Backup");
    assert.equal(backupEvents.at(-1).reply, "Backup");
    assert.ok(backup.isDone());
  } finally {
    nock.cleanAll();
    nock.enableNetConnect();
    await new Promise((r) => server.close(r));
  }
});
