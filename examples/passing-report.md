# CompatCanary report

- **Target:** `http://127.0.0.1:8787/v1`
- **Model:** `canary-model`
- **Profile:** `modern`
- **Score:** **100/100**
- **Required compatibility:** **PASS**

| Probe | Status | Evidence |
|---|---:|---|
| Model discovery | **PASS** | Selected model is listed |
| Chat Completions | **PASS** | Valid chat completion |
| Chat streaming | **PASS** | Valid chunks and `[DONE]` |
| Forced tool call | **PASS** | Valid function call and JSON arguments |
| Strict structured output | **PASS** | Output satisfies the requested schema |
| Responses API | **PASS** | Valid response object and output text |
| Responses streaming | **PASS** | Typed creation, output, and completion events |

This example is generated from the deterministic local fixture rather than a third-party service.
