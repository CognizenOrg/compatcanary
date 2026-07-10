# Security

CompatCanary sends live requests to the endpoint you provide. Treat endpoint URLs, model IDs, custom headers, prompts, responses, and reports as potentially sensitive.

## Safe usage

- Prefer `--api-key-env` or the `OPENAI_API_KEY` environment variable instead of command-line keys.
- Never commit generated reports containing private endpoint details.
- Run private scans from infrastructure you control.
- Redact response bodies before opening public issues.

CompatCanary does not intentionally persist credentials. Version 0.1 runs locally and writes only the report path selected by the user.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could expose credentials or private endpoint data. Use GitHub's private vulnerability reporting after the public repository enables it.
