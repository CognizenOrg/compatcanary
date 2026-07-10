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

## Privacy

Reports may expose private endpoint URLs, model identifiers, response excerpts on HTTP errors, and timing data. Review reports before publishing them.
