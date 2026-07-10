# OpenAI: openai/gpt-4.1-nano

![OpenAI compatibility badge](../badges/github-models-openai-gpt-4-1-nano.svg)

- **Implementation:** GitHub Models hosted 2026-07-10
- **Endpoint:** `https://models.github.ai/inference`
- **Profile:** `chat`
- **Scanned:** 2026-07-10 with CompatCanary 0.2.0
- **Submitted by:** @guvenemre
- **Provider documentation:** https://docs.github.com/en/rest/models/inference

- **Verdict:** **PASS WITH WARNINGS**, 86/100

The gateway supported basic chat, forced function calls, and strict JSON Schema output. It omitted /models and emitted one non-canonical metadata frame before normal streaming chunks.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **WARN** | Optional capability unavailable: HTTP 404 from /models |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **WARN** | Received 5 chat chunks and 1 non-canonical metadata event(s) |
| Forced tool call | yes | **PASS** | Returned a forced function call with parseable JSON arguments |
| Strict structured output | yes | **PASS** | Returned JSON satisfying a strict schema |

## Reproduce

```sh
npx compatcanary scan --base-url https://models.github.ai/inference \
  --model openai/gpt-4.1-nano --profile chat
```

The complete machine-readable evidence is in [the raw report](../reports/github-models-openai-gpt-4.1-nano.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
