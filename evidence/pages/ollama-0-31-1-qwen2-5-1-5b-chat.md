# Ollama: qwen2.5:1.5b

![Ollama compatibility badge](../badges/ollama-0-31-1-qwen2-5-1-5b-chat.svg)

- **Implementation:** Ollama Docker CPU 0.31.1
- **Endpoint:** `http://127.0.0.1:11435/v1`
- **Profile:** `chat`
- **Scanned:** 2026-07-11 with CompatCanary 0.2.2
- **Submitted by:** @guvenemre
- **Provider documentation:** https://github.com/ollama/ollama/releases/tag/v0.31.1
- **Setup:** [reproduction configuration](../setups/ollama-0.31.1-qwen2.5-1.5b.md)
- **Verdict:** **FAIL**, 73/100

Model discovery, basic chat, canonical SSE streaming, and strict structured output passed. This run did not return the forced function call; four repeated Chat-profile runs produced the call twice, so the setup records the observed model/runtime variability.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **PASS** | Discovered 1 models; selected model is listed |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **PASS** | Received 4 valid chat stream chunks and [DONE] |
| Forced tool call | yes | **FAIL** | Expected a function tool call |
| Strict structured output | yes | **PASS** | Returned JSON satisfying a strict schema |

## Reproduce

```sh
npx compatcanary scan --base-url http://127.0.0.1:11435/v1 \
  --model qwen2.5:1.5b --profile chat
```

The complete machine-readable evidence is in [the raw report](../reports/ollama-0.31.1-qwen2.5-1.5b-chat.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
