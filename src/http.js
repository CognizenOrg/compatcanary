import { parseSSE } from "./sse.js";

export class ProbeHttpError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ProbeHttpError";
    Object.assign(this, details);
  }
}

function endpoint(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

function requestHeaders(config, accept) {
  const headers = {
    Accept: accept,
    "Content-Type": "application/json",
    "User-Agent": "compatcanary/0.1",
    ...config.headers,
  };
  if (config.apiKey && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }
  return headers;
}

async function perform(config, path, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await fetch(endpoint(config.baseUrl, path), {
      ...init,
      signal: controller.signal,
    });
    const text = await response.text();
    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      throw new ProbeHttpError(`HTTP ${response.status} from ${path}`, {
        status: response.status,
        body: text.slice(0, 1_000),
        durationMs,
      });
    }
    return { response, text, durationMs };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ProbeHttpError(`Timed out after ${config.timeoutMs}ms`, {
        code: "TIMEOUT",
        durationMs: Date.now() - startedAt,
      });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function getJson(config, path) {
  const result = await perform(config, path, {
    method: "GET",
    headers: requestHeaders(config, "application/json"),
  });
  let json;
  try {
    json = JSON.parse(result.text);
  } catch {
    throw new ProbeHttpError(`Expected JSON from ${path}`, {
      body: result.text.slice(0, 1_000),
      durationMs: result.durationMs,
    });
  }
  return { ...result, json };
}

export async function postJson(config, path, body) {
  const result = await perform(config, path, {
    method: "POST",
    headers: requestHeaders(config, "application/json"),
    body: JSON.stringify(body),
  });
  let json;
  try {
    json = JSON.parse(result.text);
  } catch {
    throw new ProbeHttpError(`Expected JSON from ${path}`, {
      body: result.text.slice(0, 1_000),
      durationMs: result.durationMs,
    });
  }
  return { ...result, json };
}

export async function postSSE(config, path, body) {
  const result = await perform(config, path, {
    method: "POST",
    headers: requestHeaders(config, "text/event-stream"),
    body: JSON.stringify(body),
  });
  const contentType = result.response.headers.get("content-type") ?? "";
  const events = parseSSE(result.text);
  return { ...result, contentType, events };
}
