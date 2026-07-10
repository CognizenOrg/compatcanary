# LiteLLM 1.91.1 with GitHub Models

These reports used LiteLLM Proxy `1.91.1` in front of GitHub Models with `openai/gpt-4o-mini`.

## Configuration

Save this as `litellm-config.yaml`:

```yaml
model_list:
  - model_name: github-gpt-4o-mini
    litellm_params:
      model: openai/openai/gpt-4o-mini
      api_base: https://models.github.ai/inference
      api_key: os.environ/GITHUB_MODELS_TOKEN

litellm_settings:
  drop_params: false
```

Install and start the proxy:

```sh
python3 -m venv .venv
.venv/bin/pip install 'litellm[proxy]==1.91.1'
export GITHUB_MODELS_TOKEN="$(gh auth token)"
.venv/bin/litellm --config litellm-config.yaml --host 127.0.0.1 --port 4001
```

Run the two profiles:

```sh
npx compatcanary scan \
  --base-url http://127.0.0.1:4001/v1 \
  --model github-gpt-4o-mini \
  --profile chat

npx compatcanary scan \
  --base-url http://127.0.0.1:4001/v1 \
  --model github-gpt-4o-mini \
  --profile modern
```

The Chat profile passed all probes. The Modern profile reached the configured backend's unsupported `/responses` route and recorded the resulting failures; this report does not claim that LiteLLM promises Responses translation for every custom OpenAI-compatible backend.
