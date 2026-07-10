# CompatCanary failure example

- **Target:** `http://127.0.0.1:8787/v1`
- **Model:** `canary-model`
- **Profile:** `modern`
- **Score:** **88/100**
- **Required compatibility:** **FAIL**

| Probe | Status | Evidence |
|---|---:|---|
| Chat streaming | **FAIL** | Expected `text/event-stream`; endpoint returned JSON |

The remaining six probes pass. This demonstrates that a successful non-streaming request does not establish streaming compatibility.
