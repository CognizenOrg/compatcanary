# LocalAI 4.6.2 with Llama 3.2 1B

This report used the LocalAI `v4.6.2` CPU container with the gallery model `llama-3.2-1b-instruct:q4_k_m`.

Start LocalAI:

```sh
docker run --rm \
  --name compatcanary-localai \
  -p 127.0.0.1:8082:8080 \
  localai/localai:v4.6.2 \
  run llama-3.2-1b-instruct:q4_k_m
```

The first run downloads the container, the 770 MB model, and the CPU llama.cpp backend. After LocalAI reports that it is running, scan the Modern profile:

```sh
npx compatcanary scan \
  --base-url http://127.0.0.1:8082/v1 \
  --model 'llama-3.2-1b-instruct:q4_k_m' \
  --profile modern
```

The observed forced-tool failure is specific to this runtime/model/configuration combination. LocalAI's Responses and Responses-streaming endpoints passed in the same run.
