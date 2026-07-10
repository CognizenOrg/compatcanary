# LiteLLM: github-gpt-4o-mini

![LiteLLM compatibility badge](../badges/litellm-1-91-1-github-gpt-4o-mini-modern.svg)

- **Implementation:** LiteLLM Proxy + GitHub Models 1.91.1
- **Endpoint:** `http://127.0.0.1:4001/v1`
- **Profile:** `modern`
- **Scanned:** 2026-07-10 with CompatCanary 0.2.0
- **Submitted by:** @guvenemre
- **Provider documentation:** https://github.com/BerriAI/litellm/releases/tag/v1.91.1
- **Setup:** [reproduction configuration](../setups/litellm-1.91.1-github-models.md)
- **Verdict:** **FAIL**, 65/100

The same configuration passed every Chat probe but failed both Modern-profile Responses probes because the configured GitHub Models backend did not expose /responses.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **PASS** | Discovered 1 models; selected model is listed |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **PASS** | Received 5 valid chat stream chunks and [DONE] |
| Forced tool call | yes | **PASS** | Returned a forced function call with parseable JSON arguments |
| Strict structured output | yes | **PASS** | Returned JSON satisfying a strict schema |
| Responses API | yes | **FAIL** | HTTP 404 from /responses |
| Responses streaming | yes | **FAIL** | HTTP 429 from /responses |

## Reproduce

```sh
npx compatcanary scan --base-url http://127.0.0.1:4001/v1 \
  --model github-gpt-4o-mini --profile modern
```

The complete machine-readable evidence is in [the raw report](../reports/litellm-1.91.1-github-gpt-4o-mini-modern.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
