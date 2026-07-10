# Mistral AI: mistral-ai/ministral-3b

![Mistral AI compatibility badge](../badges/github-models-mistral-ministral-3b.svg)

- **Implementation:** GitHub Models hosted 2026-07-10
- **Endpoint:** `https://models.github.ai/inference`
- **Profile:** `chat`
- **Scanned:** 2026-07-10 with CompatCanary 0.2.0
- **Submitted by:** @guvenemre
- **Provider documentation:** https://docs.github.com/en/rest/models/inference

- **Verdict:** **FAIL**, 68/100

Basic chat, streaming, and strict JSON Schema output passed. The endpoint rejected OpenAI's object-form forced tool choice for this model.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **WARN** | Optional capability unavailable: HTTP 404 from /models |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **PASS** | Received 6 valid chat stream chunks and [DONE] |
| Forced tool call | yes | **FAIL** | HTTP 422 from /chat/completions |
| Strict structured output | yes | **PASS** | Returned JSON satisfying a strict schema |

## Reproduce

```sh
npx compatcanary scan --base-url https://models.github.ai/inference \
  --model mistral-ai/ministral-3b --profile chat
```

The complete machine-readable evidence is in [the raw report](../reports/github-models-mistral-ministral-3b.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
