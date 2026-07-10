# Public compatibility evidence

This page will contain reproducible reports for public or explicitly authorized endpoints. It intentionally begins empty rather than treating documentation claims as measured behavior.

Each entry must include:

- Provider or implementation and version.
- Model ID or model family.
- `modern` or `chat` profile.
- Scan timestamp and CompatCanary version.
- A redacted JSON report.
- Reproduction notes for every failure.

Scores expire as software and hosted endpoints change. The planned hosted index will continuously retest entries and display freshness.

## Contributing evidence

Run:

```bash
npx --yes github:guvenemre/compatcanary#v0.1.0 \
  --base-url "$OPENAI_BASE_URL" \
  --model "$OPENAI_MODEL" \
  --format json \
  --output compatcanary-report.json
```

Review and redact the report before opening a compatibility issue. Never publish credentials, private endpoint names, customer prompts, or sensitive response bodies.
