import assert from "node:assert/strict";
import test from "node:test";
import { parseSSE } from "../src/sse.js";

test("parses chat-style JSON frames and DONE", () => {
  const events = parseSSE(
    'data: {"object":"chat.completion.chunk"}\n\ndata: {"object":"chat.completion.chunk"}\n\ndata: [DONE]\n\n',
  );
  assert.equal(events.length, 3);
  assert.equal(events[0].json.object, "chat.completion.chunk");
  assert.equal(events[2].done, true);
});

test("parses typed Responses API events", () => {
  const events = parseSSE(
    'event: response.created\ndata: {"type":"response.created"}\n\nevent: response.completed\ndata: {"type":"response.completed"}\n\n',
  );
  assert.deepEqual(
    events.map((event) => event.event),
    ["response.created", "response.completed"],
  );
});
