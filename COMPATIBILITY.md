# Public compatibility evidence

CompatCanary publishes reproducible, timestamped observations rather than repeating compatibility claims from documentation. Every row links to the raw report and can be regenerated from the public endpoint with appropriate credentials.

| Provider | Implementation | Model | Profile | Score | Required compatibility | Scanned | Evidence |
|---|---|---|---:|---:|---:|---:|---|
| Microsoft | GitHub Models hosted 2026-07-10 | `microsoft/phi-4-mini-instruct` | `chat` | **41/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/github-models-microsoft-phi-4-mini-instruct.md) · [JSON](evidence/reports/github-models-microsoft-phi-4-mini-instruct.json) · ![badge](evidence/badges/github-models-microsoft-phi-4-mini-instruct.svg) |
| Mistral AI | GitHub Models hosted 2026-07-10 | `mistral-ai/ministral-3b` | `chat` | **68/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/github-models-mistral-ministral-3b.md) · [JSON](evidence/reports/github-models-mistral-ministral-3b.json) · ![badge](evidence/badges/github-models-mistral-ministral-3b.svg) |
| OpenAI | GitHub Models hosted 2026-07-10 | `openai/gpt-4.1-nano` | `chat` | **86/100** | **PASS WITH WARNINGS** | 2026-07-10 | [report](evidence/pages/github-models-openai-gpt-4-1-nano.md) · [JSON](evidence/reports/github-models-openai-gpt-4.1-nano.json) · ![badge](evidence/badges/github-models-openai-gpt-4-1-nano.svg) |

## Add an endpoint

Run CompatCanary with `--format json`, review the report for sensitive data, and open a compatibility evidence issue. Accepted reports automatically produce a matrix row, detail page, machine-readable index entry, and badge.

Scores are snapshots. Re-run a report after provider, gateway, server, or model-version changes.
