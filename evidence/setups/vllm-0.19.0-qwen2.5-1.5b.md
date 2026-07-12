# vLLM 0.19.0 with Qwen2.5 1.5B

These reports used the official `vllm/vllm-openai:v0.19.0` Docker image with `Qwen/Qwen2.5-1.5B-Instruct` on one NVIDIA T4 with 16 GB VRAM. The observed host was an AWS `g4dn.xlarge`, and vLLM's OpenAI-compatible API was exposed only on loopback port `8000`.

## Start the runtime

```sh
export VLLM_API_KEY=compatcanary-local
export OPENAI_API_KEY="$VLLM_API_KEY"

docker volume create compatcanary-vllm-0190

docker run -d \
  --name compatcanary-vllm-0190 \
  --gpus all \
  --ipc host \
  -p 127.0.0.1:8000:8000 \
  -v compatcanary-vllm-0190:/root/.cache/huggingface \
  vllm/vllm-openai:v0.19.0 \
  --model Qwen/Qwen2.5-1.5B-Instruct \
  --served-model-name qwen2.5-1.5b-instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --dtype half \
  --max-model-len 4096 \
  --max-num-seqs 8 \
  --gpu-memory-utilization 0.80 \
  --enforce-eager \
  --api-key "$VLLM_API_KEY" \
  --enable-auto-tool-choice \
  --tool-call-parser hermes

curl -H "Authorization: Bearer $VLLM_API_KEY" \
  http://127.0.0.1:8000/version
```

The version endpoint returned `0.19.0`.

## Run CompatCanary

```sh
npx --yes compatcanary@0.2.2 scan \
  --base-url http://127.0.0.1:8000/v1 \
  --model qwen2.5-1.5b-instruct \
  --profile chat \
  --format json \
  --output vllm-chat.json \
  --fail-on never

npx --yes compatcanary@0.2.2 scan \
  --base-url http://127.0.0.1:8000/v1 \
  --model qwen2.5-1.5b-instruct \
  --profile modern \
  --format json \
  --output vllm-modern.json \
  --fail-on never
```

## Observations

The Chat report passed model discovery, basic chat, canonical SSE streaming, forced tool calling, and strict JSON Schema output. The separately captured Modern report also passed the Responses API and typed Responses streaming. Both point-in-time reports scored 100/100.

On the observed 16 GB T4 host, the initial launch with vLLM 0.19 defaults exhausted GPU memory during the 256-sequence sampler warmup after CUDA graph capture. The published run therefore bounded concurrency, reserved additional GPU headroom, and used eager execution. This records a host-and-configuration-specific reproduction detail rather than a universal runtime defect.

## Cleanup

```sh
docker rm -f compatcanary-vllm-0190
docker volume rm compatcanary-vllm-0190
unset VLLM_API_KEY OPENAI_API_KEY
```
