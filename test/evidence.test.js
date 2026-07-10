import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEvidenceArtifacts,
  validateManifest,
  validateReport,
} from "../src/evidence.js";

function sampleReport(overrides = {}) {
  return {
    schemaVersion: "compatcanary.report.v1",
    scanner: { name: "compatcanary", version: "0.2.1" },
    target: {
      baseUrl: "https://example.test/v1",
      model: "example-model",
      profile: "chat",
    },
    startedAt: "2026-07-10T12:00:00.000Z",
    completedAt: "2026-07-10T12:00:01.000Z",
    durationMs: 1_000,
    score: 91,
    compatible: true,
    summary: { passes: 1, warnings: 1, failures: 0, requiredFailures: 0, total: 2 },
    results: [
      {
        id: "chat.basic",
        name: "Chat Completions",
        category: "Chat",
        required: true,
        weight: 1,
        status: "pass",
        summary: "Returned a valid response",
        durationMs: 100,
      },
      {
        id: "models.list",
        name: "Model discovery",
        category: "Discovery",
        required: false,
        weight: 0.5,
        status: "warn",
        summary: "Optional capability unavailable",
        durationMs: 50,
      },
    ],
    ...overrides,
  };
}

function sampleManifest(overrides = {}) {
  return {
    schemaVersion: "compatcanary.evidence-manifest.v1",
    entries: [
      {
        slug: "example-model",
        provider: "Example",
        implementation: "Example API",
        implementationVersion: "hosted",
        report: "reports/example-model.json",
        sourceUrl: "https://example.test/docs",
        submittedBy: "@tester",
        notes: "A deterministic test entry.",
        ...overrides,
      },
    ],
  };
}

test("evidence reports reject credentials and private URL components", () => {
  assert.throws(
    () => validateReport(sampleReport({ target: { baseUrl: "https://user:secret@example.test/v1", model: "example", profile: "chat" } })),
    /must not contain credentials/,
  );
  assert.throws(
    () => validateReport(sampleReport({ results: [{ id: "x", name: "x", required: true, status: "fail", summary: "Bearer secret-token-value" }] })),
    /credential or authorization/,
  );
});

test("evidence reports allow loopback HTTP but reject remote HTTP", () => {
  assert.doesNotThrow(() => validateReport(sampleReport({
    target: { baseUrl: "http://127.0.0.1:4000/v1", model: "example", profile: "chat" },
  })));
  assert.throws(
    () => validateReport(sampleReport({ target: { baseUrl: "http://example.test/v1", model: "example", profile: "chat" } })),
    /HTTPS or loopback HTTP/,
  );
});

test("evidence manifests reject path traversal", () => {
  assert.throws(
    () => validateManifest(sampleManifest({ report: "reports/../private.json" })),
    /must not traverse directories/,
  );
  assert.throws(
    () => validateManifest(sampleManifest({ setup: "setups/../private.md" })),
    /setup must not traverse directories/,
  );
});

test("evidence generation creates a matrix, detail page, index, and badge", () => {
  const report = sampleReport();
  const artifacts = buildEvidenceArtifacts(
    sampleManifest(),
    new Map([["reports/example-model.json", report]]),
  );
  assert.match(artifacts.matrix, /Example API hosted/);
  assert.match(artifacts.matrix, /PASS WITH WARNINGS/);
  assert.match(artifacts.pages.get("example-model.md"), /Observed behavior/);
  assert.match(artifacts.badges.get("example-model.svg"), /91\/100 pass with warnings/);
  assert.deepEqual(JSON.parse(artifacts.index).entries[0].score, 91);
});
