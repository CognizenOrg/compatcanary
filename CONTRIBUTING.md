# Contributing

CompatCanary values reproducible compatibility evidence over broad claims.

Before proposing a new probe:

1. Link to the relevant public API contract or implementation documentation.
2. Include a minimal compatible fixture.
3. Include a minimal incompatible fixture demonstrating the failure.
4. Keep the check deterministic and inexpensive.
5. Describe whether the feature is required for the default profile.

Run the project checks with:

```bash
npm run check
npm test
```

Never add live credentials or captured private API payloads to fixtures.
