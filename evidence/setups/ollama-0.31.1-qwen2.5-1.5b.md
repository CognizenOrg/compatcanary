# Ollama 0.31.1 with Qwen2.5 1.5B

These reports used the official Ollama `0.31.1` Docker image on CPU with `qwen2.5:1.5b`. The container exposed Ollama's OpenAI-compatible API on loopback port `11435`.

## Start the runtime

```sh
docker volume create compatcanary-ollama-0311

docker run -d \
  --name compatcanary-ollama-0311 \
  -p 127.0.0.1:11435:11434 \
  -v compatcanary-ollama-0311:/root/.ollama \
  ollama/ollama:0.31.1

docker exec compatcanary-ollama-0311 ollama pull qwen2.5:1.5b
curl http://127.0.0.1:11435/api/version
```

The version endpoint returned `0.31.1`.

## Run CompatCanary

```sh
npx --yes compatcanary@0.2.2 scan \
  --base-url http://127.0.0.1:11435/v1 \
  --model qwen2.5:1.5b \
  --profile chat \
  --format json \
  --output ollama-chat.json \
  --fail-on never

npx --yes compatcanary@0.2.2 scan \
  --base-url http://127.0.0.1:11435/v1 \
  --model qwen2.5:1.5b \
  --profile modern \
  --format json \
  --output ollama-modern.json \
  --fail-on never
```

## Observations

The direct OpenAI-compatible route returned canonical SSE for every observed Chat stream: four repeated Chat-profile runs and the published Modern-profile run all received valid chunks followed by `[DONE]`. This narrows failures involving Ollama's native `application/x-ndjson` stream toward an intermediary or route-selection boundary, but does not by itself reproduce or prove a defect in another project.

Basic chat and strict structured output passed in all four repeated Chat-profile runs. The forced tool-call probe passed twice and failed twice because the model returned ordinary assistant content instead of the forced function call. The published Chat report preserves one failing run; the separately captured Modern report passed all seven probes, including the Responses API and typed Responses streaming.

The repeated runs are documented to avoid presenting one favorable or unfavorable generation as a universal runtime claim. Each raw report remains a point-in-time observation for the named runtime, model, profile, and request sequence.

## Cleanup

```sh
docker rm -f compatcanary-ollama-0311
docker volume rm compatcanary-ollama-0311
```
