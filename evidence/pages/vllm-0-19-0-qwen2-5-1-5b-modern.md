# vLLM: qwen2.5-1.5b-instruct

![vLLM compatibility badge](../badges/vllm-0-19-0-qwen2-5-1-5b-modern.svg)

- **Implementation:** vLLM Docker + NVIDIA T4 0.19.0
- **Endpoint:** `http://127.0.0.1:8000/v1`
- **Profile:** `modern`
- **Scanned:** 2026-07-12 with CompatCanary 0.2.2
- **Submitted by:** @guvenemre
- **Provider documentation:** https://docs.vllm.ai/en/v0.19.0/deployment/docker/
- **Setup:** [reproduction configuration](../setups/vllm-0.19.0-qwen2.5-1.5b.md)
- **Verdict:** **PASS**, 100/100

This Modern-profile run passed all seven probes, including forced tool calls, strict JSON Schema output, the Responses API, and typed Responses streaming.

## Observed behavior

| Probe | Required | Status | Evidence |
|---|---:|---:|---|
| Model discovery | no | **PASS** | Discovered 1 models; selected model is listed |
| Chat Completions | yes | **PASS** | Returned a structurally valid chat completion |
| Chat streaming | yes | **PASS** | Received 5 valid chat stream chunks and [DONE] |
| Forced tool call | yes | **PASS** | Returned a forced function call with parseable JSON arguments |
| Strict structured output | yes | **PASS** | Returned JSON satisfying a strict schema |
| Responses API | yes | **PASS** | Returned a structurally valid Responses API object |
| Responses streaming | yes | **PASS** | Received 11 typed response stream events |

## Reproduce

```sh
npx compatcanary scan --base-url http://127.0.0.1:8000/v1 \
  --model qwen2.5-1.5b-instruct --profile modern
```

The complete machine-readable evidence is in [the raw report](../reports/vllm-0.19.0-qwen2.5-1.5b-modern.json).

_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._
