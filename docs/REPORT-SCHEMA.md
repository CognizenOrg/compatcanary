# Report schema v1

CompatCanary JSON reports identify themselves with:

```json
{
  "schemaVersion": "compatcanary.report.v1"
}
```

Top-level fields:

| Field | Meaning |
|---|---|
| `scanner` | Scanner name and version |
| `target` | Target base URL, model, and selected compatibility profile |
| `startedAt`, `completedAt` | ISO-8601 scan timestamps |
| `durationMs` | Total wall-clock duration |
| `score` | Weighted score from 0–100 |
| `compatible` | `true` when all required probes pass |
| `summary` | Counts of pass, warning, and failure outcomes |
| `results` | Per-probe observations and evidence |

The schema is append-only within version 1. Consumers should ignore unknown fields.

Probe status meanings:

| Status | Meaning |
|---|---|
| `pass` | The observed behavior satisfied the probe |
| `warn` | Required compatibility remains usable, but optional or non-canonical behavior was observed |
| `fail` | The observed behavior did not satisfy the probe |

Public evidence reports are listed in `evidence/manifest.json`. Running `npm run evidence:build` validates those reports and regenerates the public matrix, detail pages, badges, and machine-readable index.

## Privacy

Reports may expose private endpoint URLs, model identifiers, response excerpts on HTTP errors, and timing data. Review reports before publishing them.

CompatCanary removes URL credentials, query strings, and fragments from the target URL recorded in reports. Custom path segments and model identifiers are retained because they are often necessary for reproduction.

The public evidence validator also rejects common key formats, bearer tokens, suspicious authorization fields, and credential-bearing URLs. This is defense in depth, not a substitute for manual review.
