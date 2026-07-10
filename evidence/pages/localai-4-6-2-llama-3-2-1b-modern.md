# LocalAI: llama-3.2-1b-instruct:q4_k_m

![LocalAI compatibility badge](../badges/localai-4-6-2-llama-3-2-1b-modern.svg)

- **Implementation:** LocalAI CPU + llama.cpp 4.6.2
- **Endpoint:** `http://127.0.0.1:8082/v1`
- **Profile:** `modern`
- **Scanned:** 2026-07-10 with CompatCanary 0.2.0
- **Submitted by:** @guvenemre
- **Provider documentation:** https://github.com/mudler/LocalAI/releases/tag/v4.6.2
- **Setup:** [reproduction configuration](../setups/localai-4.6.2-llama-3.2-1b.md)
- **Verdict:** **FAIL**, 82/100

Model discovery, chat, streaming, strict JSON Schema output, Responses, and Responses streaming passed. The selected 1B model did not produce the forced function call.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **PASS** | Discovered 1 models; selected model is listed |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **PASS** | Received 7 valid chat stream chunks and [DONE] |
| Forced tool call | yes | **FAIL** | Expected a function tool call |
| Strict structured output | yes | **PASS** | Returned JSON satisfying a strict schema |
| Responses API | yes | **PASS** | Returned a structurally valid Responses API object |
| Responses streaming | yes | **PASS** | Received 12 typed response stream events |

## Reproduce

```sh
npx compatcanary scan --base-url http://127.0.0.1:8082/v1 \
  --model llama-3.2-1b-instruct:q4_k_m --profile modern
```

The complete machine-readable evidence is in [the raw report](../reports/localai-4.6.2-llama-3.2-1b-modern.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
