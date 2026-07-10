# Public compatibility evidence

CompatCanary publishes reproducible, timestamped observations rather than repeating compatibility claims from documentation. Every row links to the raw report and can be regenerated from the public endpoint with appropriate credentials.

| Provider | Implementation | Model | Profile | Score | Required compatibility | Scanned | Evidence |
|---|---|---|---:|---:|---:|---:|---|
| Cohere | GitHub Models hosted 2026-07-10 | `cohere/cohere-command-a` | `chat` | **95/100** | **PASS WITH WARNINGS** | 2026-07-10 | [report](evidence/pages/github-models-cohere-command-a.md) · [JSON](evidence/reports/github-models-cohere-command-a.json) · ![badge](evidence/badges/github-models-cohere-command-a.svg) |
| LiteLLM | LiteLLM Proxy + GitHub Models 1.91.1 | `github-gpt-4o-mini` | `chat` | **100/100** | **PASS** | 2026-07-10 | [report](evidence/pages/litellm-1-91-1-github-gpt-4o-mini-chat.md) · [JSON](evidence/reports/litellm-1.91.1-github-gpt-4o-mini-chat.json) · ![badge](evidence/badges/litellm-1-91-1-github-gpt-4o-mini-chat.svg) |
| LiteLLM | LiteLLM Proxy + GitHub Models 1.91.1 | `github-gpt-4o-mini` | `modern` | **65/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/litellm-1-91-1-github-gpt-4o-mini-modern.md) · [JSON](evidence/reports/litellm-1.91.1-github-gpt-4o-mini-modern.json) · ![badge](evidence/badges/litellm-1-91-1-github-gpt-4o-mini-modern.svg) |
| LocalAI | LocalAI CPU + llama.cpp 4.6.2 | `llama-3.2-1b-instruct:q4_k_m` | `modern` | **82/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/localai-4-6-2-llama-3-2-1b-modern.md) · [JSON](evidence/reports/localai-4.6.2-llama-3.2-1b-modern.json) · ![badge](evidence/badges/localai-4-6-2-llama-3-2-1b-modern.svg) |
| Microsoft | GitHub Models hosted 2026-07-10 | `microsoft/phi-4-mini-instruct` | `chat` | **41/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/github-models-microsoft-phi-4-mini-instruct.md) · [JSON](evidence/reports/github-models-microsoft-phi-4-mini-instruct.json) · ![badge](evidence/badges/github-models-microsoft-phi-4-mini-instruct.svg) |
| Microsoft | GitHub Models hosted 2026-07-10 | `microsoft/phi-4-multimodal-instruct` | `chat` | **68/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/github-models-microsoft-phi-4-multimodal-instruct.md) · [JSON](evidence/reports/github-models-microsoft-phi-4-multimodal-instruct.json) · ![badge](evidence/badges/github-models-microsoft-phi-4-multimodal-instruct.svg) |
| Mistral AI | GitHub Models hosted 2026-07-10 | `mistral-ai/codestral-2501` | `chat` | **68/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/github-models-mistral-codestral-2501.md) · [JSON](evidence/reports/github-models-mistral-codestral-2501.json) · ![badge](evidence/badges/github-models-mistral-codestral-2501.svg) |
| Mistral AI | GitHub Models hosted 2026-07-10 | `mistral-ai/ministral-3b` | `chat` | **68/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/github-models-mistral-ministral-3b.md) · [JSON](evidence/reports/github-models-mistral-ministral-3b.json) · ![badge](evidence/badges/github-models-mistral-ministral-3b.svg) |
| Mistral AI | GitHub Models hosted 2026-07-10 | `mistral-ai/mistral-small-2503` | `chat` | **41/100** | **FAIL** | 2026-07-10 | [report](evidence/pages/github-models-mistral-small-2503.md) · [JSON](evidence/reports/github-models-mistral-small-2503.json) · ![badge](evidence/badges/github-models-mistral-small-2503.svg) |
| OpenAI | GitHub Models hosted 2026-07-10 | `openai/gpt-4.1-nano` | `chat` | **86/100** | **PASS WITH WARNINGS** | 2026-07-10 | [report](evidence/pages/github-models-openai-gpt-4-1-nano.md) · [JSON](evidence/reports/github-models-openai-gpt-4.1-nano.json) · ![badge](evidence/badges/github-models-openai-gpt-4-1-nano.svg) |
| OpenAI | GitHub Models hosted 2026-07-10 | `openai/gpt-4o-mini` | `chat` | **86/100** | **PASS WITH WARNINGS** | 2026-07-10 | [report](evidence/pages/github-models-openai-gpt-4o-mini.md) · [JSON](evidence/reports/github-models-openai-gpt-4o-mini.json) · ![badge](evidence/badges/github-models-openai-gpt-4o-mini.svg) |

## Add an endpoint

Run CompatCanary with `--format json`, review the report for sensitive data, and open a compatibility evidence issue. Accepted reports automatically produce a matrix row, detail page, machine-readable index entry, and badge.

Scores are snapshots. Re-run a report after provider, gateway, server, or model-version changes.
