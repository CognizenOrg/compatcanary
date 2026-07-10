import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs, validateScanOptions } from "../src/args.js";

test("parses scan options and repeated headers", () => {
  const options = parseArgs(
    [
      "scan",
      "--base-url",
      "https://api.example.test/v1/",
      "--model",
      "example-model",
      "--profile",
      "chat",
      "--header",
      "X-Tenant: acme",
      "--header",
      "X-Region: eu",
      "--timeout",
      "12",
      "--format",
      "json",
    ],
    {},
  );
  validateScanOptions(options);
  assert.equal(options.baseUrl, "https://api.example.test/v1/");
  assert.equal(options.model, "example-model");
  assert.equal(options.profile, "chat");
  assert.equal(options.timeoutMs, 12_000);
  assert.deepEqual(options.headers, { "X-Tenant": "acme", "X-Region": "eu" });
});

test("reads conventional OpenAI environment variables", () => {
  const options = parseArgs([], {
    OPENAI_BASE_URL: "http://localhost:8787/v1",
    OPENAI_MODEL: "canary-model",
    OPENAI_API_KEY: "test-key",
  });
  assert.equal(options.baseUrl, "http://localhost:8787/v1");
  assert.equal(options.model, "canary-model");
  assert.equal(options.apiKey, "test-key");
});

test("rejects an invalid output format", () => {
  assert.throws(() => parseArgs(["--format", "yaml"], {}), /text, json, or markdown/);
});

test("rejects an unknown compatibility profile", () => {
  assert.throws(() => parseArgs(["--profile", "everything"], {}), /modern or chat/);
});
