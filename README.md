# CompatCanary

[![npm](https://img.shields.io/npm/v/compatcanary?label=npm)](https://www.npmjs.com/package/compatcanary)
[![CI](https://github.com/CognizenOrg/compatcanary/actions/workflows/ci.yml/badge.svg)](https://github.com/CognizenOrg/compatcanary/actions/workflows/ci.yml)
[![GitHub Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-CompatCanary-2088FF?logo=github-actions&logoColor=white)](https://github.com/marketplace/actions/compatcanary)

**One command to find where an “OpenAI-compatible” API actually differs before the difference reaches production.**

Requires Node.js 20 or newer:

```bash
npx --yes compatcanary@latest scan \
  --base-url https://your-provider.example/v1 \
  --model your-model
```

CompatCanary runs seven deterministic live probes for discovery, chat, streaming, tool calls, structured output, and the Responses API. It produces terminal, JSON, or Markdown evidence for local debugging, CI, and upstream reports.

[View the compatibility matrix](COMPATIBILITY.md) · [Request a target](https://github.com/CognizenOrg/compatcanary/issues/new?template=target-request.yml) · [Use the GitHub Action](#github-action) · [Share feedback](https://github.com/CognizenOrg/compatcanary/discussions)

See the [public compatibility matrix](COMPATIBILITY.md) for live, timestamped reports and reusable badges.

> Early public release. CompatCanary is independent, is not affiliated with OpenAI, and does not provide official certification.

## Who it helps

- Gateway and proxy operators checking behavior across providers.
- Inference-server maintainers validating compatibility across releases and backends.
- Client and framework maintainers turning vague integration failures into reproducible evidence.
- Platform teams catching regressions after endpoint, model, or routing changes.

## Why

Changing `base_url` is easy. Discovering that streaming chunks, tool calls, strict JSON schemas, or the Responses API behave differently is usually not.

CompatCanary tests observed behavior instead of trusting a compatibility label.

The default `modern` profile covers Chat Completions plus the Responses API. Use `--profile chat` when an implementation intentionally promises only the Chat Completions surface.

## What v0.2 tests

| Capability | What is verified |
|---|---|
| Model discovery | `GET /models` returns a model list |
| Chat Completions | Basic response structure and assistant content |
| Chat streaming | SSE content type, chunk objects, and `[DONE]` |
| Tool calling | A forced function call with parseable JSON arguments |
| Structured output | Output satisfies a strict JSON Schema |
| Responses API | Basic response object and output text |
| Responses streaming | Typed `response.created`, output, and completion events |

## Authentication and profiles

For an authenticated endpoint:

```bash
export OPENAI_API_KEY='your-key'
npx --yes compatcanary@latest scan \
  --base-url https://your-provider.example/v1 \
  --model your-model
```

Or use the conventional environment variables:

```bash
export OPENAI_BASE_URL='https://your-provider.example/v1'
export OPENAI_MODEL='your-model'
export OPENAI_API_KEY='your-key'
npx --yes compatcanary@latest
```

CompatCanary does not require an API key for endpoints that do not require authentication.

Chat-only implementations can select the narrower profile:

```bash
npx --yes compatcanary@latest scan \
  --base-url https://your-provider.example/v1 \
  --model your-model \
  --profile chat
```

## Reports

Terminal output is the default:

```text
PASS  Chat Completions          Returned a structurally valid chat completion
PASS  Chat streaming            Received 2 valid chat stream chunks and [DONE]
PASS  Forced tool call          Returned a forced function call with parseable JSON arguments
FAIL  Strict structured output  HTTP 400 from /chat/completions

Score: 76/100
Required compatibility: FAIL
```

Generate evidence for a pull request or issue:

```bash
npx --yes compatcanary@latest \
  --base-url "$OPENAI_BASE_URL" \
  --model "$OPENAI_MODEL" \
  --format markdown \
  --output compatcanary-report.md
```

JSON output follows the versioned schema `compatcanary.report.v1`:

```bash
npx --yes compatcanary@latest \
  --base-url "$OPENAI_BASE_URL" \
  --model "$OPENAI_MODEL" \
  --format json \
  --output compatcanary-report.json
```

## Public evidence network

Accepted JSON reports generate four public artifacts: a matrix row, provider/model detail page, machine-readable index entry, and reusable SVG compatibility badge.

The evidence generator rejects common credential formats, URL credentials, query strings, fragments, and suspicious authorization fields. Reports still require human review before publication.

To contribute, run a JSON scan with `--fail-on never`, review it, and open a [compatibility evidence issue](https://github.com/CognizenOrg/compatcanary/issues/new?template=compatibility-report.yml).

## Help choose what to test next

- [Request a provider, runtime, gateway, or model](https://github.com/CognizenOrg/compatcanary/issues/new?template=target-request.yml).
- [Share a redacted compatibility report](https://github.com/CognizenOrg/compatcanary/issues/new?template=compatibility-report.yml).
- [Ask a question or suggest a probe](https://github.com/CognizenOrg/compatcanary/discussions).

If CompatCanary saves you integration time, starring the repository helps other maintainers discover the same checks.

## GitHub Action

```yaml
name: API compatibility

on:
  pull_request:
  schedule:
    - cron: "17 3 * * *"

permissions:
  contents: read

jobs:
  compatcanary:
    runs-on: ubuntu-latest
    steps:
      - uses: CognizenOrg/compatcanary@v0.2.2
        id: canary
        with:
          base-url: ${{ vars.OPENAI_BASE_URL }}
          model: ${{ vars.OPENAI_MODEL }}
          profile: modern
          api-key: ${{ secrets.OPENAI_API_KEY }}
          output: compatcanary-report.md

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: compatcanary-report
          path: compatcanary-report.md
```

The action outputs `score`, `compatible`, and `report`.

## Custom authentication

Bearer authentication is added automatically when a key is supplied. Additional headers can be repeated:

```bash
npx --yes compatcanary@latest \
  --base-url https://gateway.example/v1 \
  --model deployed-model \
  --header 'X-Tenant: acme' \
  --header 'X-Deployment: production'
```

Prefer environment variables over `--api-key`, because command-line arguments may appear in shell history or process listings.

## Exit codes

| Code | Meaning |
|---:|---|
| `0` | Selected failure policy passed |
| `1` | Compatibility probe failure |
| `2` | Invalid configuration or scanner error |

The default policy fails only when a required probe fails. Use `--fail-on any` to include optional probes or `--fail-on never` to collect evidence without breaking CI.

## Local development

No runtime dependencies are required.

```bash
npm install
npm test
npm run evidence:check
```

Run the deterministic local fixture:

```bash
npm run mock
```

In another shell:

```bash
node src/cli.js scan \
  --base-url http://127.0.0.1:8787/v1 \
  --model canary-model
```

## What CompatCanary does not claim

A passing report does not prove model quality, security, privacy, availability, rate-limit behavior, or complete compatibility with every client. It proves only that the named probes passed against the named endpoint, model, and time.


Public reports belong in [COMPATIBILITY.md](COMPATIBILITY.md). Documentation claims are not counted as measured evidence.

## License

MIT
