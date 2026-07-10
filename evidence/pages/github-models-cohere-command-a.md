# Cohere: cohere/cohere-command-a

![Cohere compatibility badge](../badges/github-models-cohere-command-a.svg)

- **Implementation:** GitHub Models hosted 2026-07-10
- **Endpoint:** `https://models.github.ai/inference`
- **Profile:** `chat`
- **Scanned:** 2026-07-10 with CompatCanary 0.2.0
- **Submitted by:** @guvenemre
- **Provider documentation:** https://docs.github.com/en/rest/models/inference

- **Verdict:** **PASS WITH WARNINGS**, 95/100

All required Chat-profile probes passed. The GitHub Models inference base URL did not expose the optional /models route.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **WARN** | Optional capability unavailable: HTTP 404 from /models |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **PASS** | Received 8 valid chat stream chunks and [DONE] |
| Forced tool call | yes | **PASS** | Returned a forced function call with parseable JSON arguments |
| Strict structured output | yes | **PASS** | Returned JSON satisfying a strict schema |

## Reproduce

```sh
npx compatcanary scan --base-url https://models.github.ai/inference \
  --model cohere/cohere-command-a --profile chat
```

The complete machine-readable evidence is in [the raw report](../reports/github-models-cohere-command-a.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
