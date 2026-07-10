import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import { createMockServer } from "./fixtures/mock-server.js";
import { scanEndpoint, shouldFail } from "../src/scanner.js";
import { renderMarkdown } from "../src/reporters.js";

async function withServer(mode, callback) {
  const server = createMockServer({ mode });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const { port } = server.address();
    await callback(`http://127.0.0.1:${port}/v1`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("a compatible endpoint passes every v0.1 probe", async () => {
  await withServer("compatible", async (baseUrl) => {
    const report = await scanEndpoint({
      baseUrl,
      model: "canary-model",
      timeoutMs: 2_000,
      headers: {},
    });
    assert.equal(report.compatible, true);
    assert.equal(report.score, 100);
    assert.equal(report.summary.passes, 7);
    assert.equal(report.target.profile, "modern");
    assert.equal(shouldFail(report, "required"), false);
    const markdown = renderMarkdown(report);
    assert.match(markdown, /\*\*100\/100\*\*/);
    assert.match(markdown, /Strict structured output/);
  });
});

test("the chat profile excludes Responses API probes", async () => {
  await withServer("compatible", async (baseUrl) => {
    const report = await scanEndpoint({
      baseUrl,
      model: "canary-model",
      profile: "chat",
      timeoutMs: 2_000,
      headers: {},
    });
    assert.equal(report.score, 100);
    assert.equal(report.summary.total, 5);
    assert.equal(report.results.some((result) => result.id.startsWith("responses.")), false);
  });
});

test("reports remove URL credentials and query strings", async () => {
  const report = await scanEndpoint(
    {
      baseUrl: "https://user:secret@example.test/v1?token=hidden#private",
      model: "canary-model",
      profile: "chat",
      timeoutMs: 20,
      headers: {},
    },
    [],
  );
  assert.equal(report.target.baseUrl, "https://example.test/v1");
});

test("a broken stream produces actionable failure evidence", async () => {
  await withServer("broken-stream", async (baseUrl) => {
    const report = await scanEndpoint({
      baseUrl,
      model: "canary-model",
      timeoutMs: 2_000,
      headers: {},
    });
    const stream = report.results.find((result) => result.id === "chat.streaming");
    assert.equal(stream.status, "fail");
    assert.match(stream.summary, /text\/event-stream/);
    assert.equal(report.compatible, false);
    assert.equal(shouldFail(report, "required"), true);
  });
});

test("a non-canonical streaming metadata frame produces a warning", async () => {
  await withServer("metadata-stream", async (baseUrl) => {
    const report = await scanEndpoint({
      baseUrl,
      model: "canary-model",
      profile: "chat",
      timeoutMs: 2_000,
      headers: {},
    });
    const stream = report.results.find((result) => result.id === "chat.streaming");
    assert.equal(stream.status, "warn");
    assert.equal(stream.evidence.metadataEventCount, 1);
    assert.equal(report.compatible, true);
  });
});

test("an unavailable optional probe is a warning rather than a failure", async () => {
  const optionalProbe = {
    id: "optional.missing",
    name: "Optional missing endpoint",
    category: "Optional",
    required: false,
    weight: 1,
    async run() {
      const error = new Error("HTTP 404 from /optional");
      error.status = 404;
      throw error;
    },
  };
  const report = await scanEndpoint(
    {
      baseUrl: "https://example.test/v1",
      model: "canary-model",
      profile: "chat",
      timeoutMs: 20,
      headers: {},
    },
    [optionalProbe],
  );
  assert.equal(report.results[0].status, "warn");
  assert.equal(report.compatible, true);
});
