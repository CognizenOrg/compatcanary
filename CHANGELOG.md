# Changelog

All notable changes to CompatCanary will be documented here.

## 0.2.2 — 2026-07-11

- Reduced the npm package to runtime files and public technical documentation.
- Removed internal planning and launch-operation documents from public distribution.

## 0.2.1 — 2026-07-11

- Expanded the public matrix from three to eleven live reports.
- Added reproducible LiteLLM 1.91.1 and LocalAI 4.6.2 setup guides and runtime reports.
- Added five more GitHub Models reports across Cohere, Microsoft, Mistral AI, and OpenAI models.
- Allowed public evidence for loopback HTTP endpoints while continuing to require HTTPS for remote endpoints and source links.
- Added optional setup links to generated evidence pages and the machine-readable index.

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
