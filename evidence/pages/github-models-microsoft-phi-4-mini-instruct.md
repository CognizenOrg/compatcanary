# Microsoft: microsoft/phi-4-mini-instruct

![Microsoft compatibility badge](../badges/github-models-microsoft-phi-4-mini-instruct.svg)

- **Implementation:** GitHub Models hosted 2026-07-10
- **Endpoint:** `https://models.github.ai/inference`
- **Profile:** `chat`
- **Scanned:** 2026-07-10 with CompatCanary 0.2.0
- **Submitted by:** @guvenemre
- **Provider documentation:** https://docs.github.com/en/rest/models/inference
- **Verdict:** **FAIL**, 41/100

Basic and streaming chat passed. The endpoint rejected OpenAI's object-form forced tool choice and json_schema response format for this model.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **WARN** | Optional capability unavailable: HTTP 404 from /models |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **PASS** | Received 6 valid chat stream chunks and [DONE] |
| Forced tool call | yes | **FAIL** | HTTP 422 from /chat/completions |
| Strict structured output | yes | **FAIL** | HTTP 422 from /chat/completions |

## Reproduce

```sh
npx compatcanary scan --base-url https://models.github.ai/inference \
  --model microsoft/phi-4-mini-instruct --profile chat
```

The complete machine-readable evidence is in [the raw report](../reports/github-models-microsoft-phi-4-mini-instruct.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
