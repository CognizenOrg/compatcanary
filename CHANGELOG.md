# Changelog

All notable changes to CompatCanary will be documented here.

## 0.2.0 — 2026-07-10

- Added a generated public compatibility matrix, provider/model detail pages, SVG badges, and a machine-readable evidence index.
- Added three live GitHub Models reports covering OpenAI, Mistral AI, and Microsoft models.
- Added credential and URL-safety validation for public evidence submissions.
- Added a compatibility evidence issue form and deterministic evidence CI.
- Treat optional unavailable endpoints and non-canonical streaming metadata frames as explicit warnings instead of false required failures.
- Added tag-driven npm trusted publishing and GitHub release automation.

## 0.1.1 — 2026-07-10

- Moved canonical project ownership to the Cognizen GitHub organization.
- Updated package provenance, installation examples, and action references.
- Preserved the original `v0.1.0` tag instead of rewriting public release history.

## 0.1.0 — 2026-07-10

- Added dependency-free Node.js CLI.
- Added `modern` and `chat` compatibility profiles.
- Added live probes for model discovery, Chat Completions, SSE streaming, forced function calls, strict structured outputs, Responses API, and typed Responses streaming.
- Added text, JSON, and Markdown evidence reports.
- Added GitHub Action outputs and failure policies.
- Added deterministic compatible and broken endpoint fixtures.
