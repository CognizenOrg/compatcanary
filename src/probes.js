import { getJson, postJson, postSSE } from "./http.js";

const CHAT_PATH = "/chat/completions";
const RESPONSES_PATH = "/responses";

function assertion(condition, message) {
  if (!condition) throw new Error(message);
}

function messageContent(json) {
  return json?.choices?.[0]?.message?.content;
}

function responseText(json) {
  if (typeof json?.output_text === "string") return json.output_text;
  const parts = [];
  for (const item of json?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("");
}

export const probes = [
  {
    id: "models.list",
    name: "Model discovery",
    category: "Discovery",
    profiles: ["modern", "chat"],
    required: false,
    weight: 0.5,
    async run(config) {
      const { json, durationMs } = await getJson(config, "/models");
      assertion(Array.isArray(json?.data), "Expected a data array from GET /models");
      const ids = json.data.map((item) => item?.id).filter(Boolean);
      const selectedPresent = ids.includes(config.model);
      return {
        status: selectedPresent ? "pass" : "warn",
        summary: selectedPresent
          ? `Discovered ${ids.length} models; selected model is listed`
          : `Discovered ${ids.length} models; selected model is not listed`,
        evidence: { modelCount: ids.length, selectedModelListed: selectedPresent },
        durationMs,
      };
    },
  },
  {
    id: "chat.basic",
    name: "Chat Completions",
    category: "Chat",
    profiles: ["modern", "chat"],
    required: true,
    weight: 1,
    async run(config) {
      const { json, durationMs } = await postJson(config, CHAT_PATH, {
        model: config.model,
        messages: [{ role: "user", content: "Reply briefly with CANARY_OK." }],
      });
      assertion(json?.object === "chat.completion", "Expected object=chat.completion");
      assertion(typeof messageContent(json) === "string", "Expected choices[0].message.content");
      return {
        status: "pass",
        summary: "Returned a structurally valid chat completion",
        evidence: { object: json.object, finishReason: json?.choices?.[0]?.finish_reason ?? null },
        durationMs,
      };
    },
  },
  {
    id: "chat.streaming",
    name: "Chat streaming",
    category: "Streaming",
    profiles: ["modern", "chat"],
    required: true,
    weight: 1,
    async run(config) {
      const { events, contentType, durationMs } = await postSSE(config, CHAT_PATH, {
        model: config.model,
        messages: [{ role: "user", content: "Reply briefly with CANARY_OK." }],
        stream: true,
      });
      const jsonEvents = events.filter((event) => event.json);
      assertion(contentType.includes("text/event-stream"), "Expected text/event-stream content type");
      assertion(jsonEvents.length > 0, "Expected at least one JSON SSE event");
      assertion(
        jsonEvents.every((event) => event.json?.object === "chat.completion.chunk"),
        "Expected object=chat.completion.chunk for JSON SSE events",
      );
      assertion(events.some((event) => event.done), "Expected the [DONE] stream terminator");
      return {
        status: "pass",
        summary: `Received ${jsonEvents.length} valid chat stream chunks and [DONE]`,
        evidence: { chunkCount: jsonEvents.length, done: true },
        durationMs,
      };
    },
  },
  {
    id: "chat.tool_call",
    name: "Forced tool call",
    category: "Tools",
    profiles: ["modern", "chat"],
    required: true,
    weight: 1.5,
    async run(config) {
      const toolName = "compatcanary_echo";
      const { json, durationMs } = await postJson(config, CHAT_PATH, {
        model: config.model,
        messages: [{ role: "user", content: "Call the provided tool with value CANARY_OK." }],
        tools: [
          {
            type: "function",
            function: {
              name: toolName,
              description: "Echo a compatibility probe value.",
              strict: true,
              parameters: {
                type: "object",
                properties: { value: { type: "string" } },
                required: ["value"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: toolName } },
      });
      const call = json?.choices?.[0]?.message?.tool_calls?.[0];
      assertion(call?.type === "function", "Expected a function tool call");
      assertion(call?.function?.name === toolName, `Expected tool ${toolName}`);
      let args;
      try {
        args = JSON.parse(call.function.arguments);
      } catch {
        throw new Error("Tool arguments were not valid JSON");
      }
      assertion(typeof args?.value === "string", "Expected a string value tool argument");
      return {
        status: "pass",
        summary: "Returned a forced function call with parseable JSON arguments",
        evidence: { toolName, argumentsValidJson: true },
        durationMs,
      };
    },
  },
  {
    id: "chat.structured_output",
    name: "Strict structured output",
    category: "Structured output",
    profiles: ["modern", "chat"],
    required: true,
    weight: 1.5,
    async run(config) {
      const { json, durationMs } = await postJson(config, CHAT_PATH, {
        model: config.model,
        messages: [{ role: "user", content: "Return the requested compatibility status." }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "compatcanary_status",
            strict: true,
            schema: {
              type: "object",
              properties: { status: { type: "string", enum: ["ok"] } },
              required: ["status"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = messageContent(json);
      assertion(typeof content === "string", "Expected a string message content");
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("Structured output content was not valid JSON");
      }
      assertion(parsed?.status === "ok", "Structured output did not satisfy the requested schema");
      assertion(Object.keys(parsed).length === 1, "Structured output contained additional properties");
      return {
        status: "pass",
        summary: "Returned JSON satisfying a strict schema",
        evidence: { schemaSatisfied: true },
        durationMs,
      };
    },
  },
  {
    id: "responses.basic",
    name: "Responses API",
    category: "Responses",
    profiles: ["modern"],
    required: true,
    weight: 1.5,
    async run(config) {
      const { json, durationMs } = await postJson(config, RESPONSES_PATH, {
        model: config.model,
        input: "Reply briefly with CANARY_OK.",
      });
      assertion(json?.object === "response", "Expected object=response");
      assertion(Array.isArray(json?.output), "Expected a response output array");
      assertion(responseText(json).length > 0, "Expected text in the response output");
      return {
        status: "pass",
        summary: "Returned a structurally valid Responses API object",
        evidence: { object: json.object, status: json.status ?? null },
        durationMs,
      };
    },
  },
  {
    id: "responses.streaming",
    name: "Responses streaming",
    category: "Responses",
    profiles: ["modern"],
    required: true,
    weight: 1.5,
    async run(config) {
      const { events, contentType, durationMs } = await postSSE(config, RESPONSES_PATH, {
        model: config.model,
        input: "Reply briefly with CANARY_OK.",
        stream: true,
      });
      const types = events.map((event) => event.json?.type ?? event.event).filter(Boolean);
      assertion(contentType.includes("text/event-stream"), "Expected text/event-stream content type");
      assertion(types.includes("response.created"), "Expected response.created event");
      assertion(types.includes("response.completed"), "Expected response.completed event");
      assertion(
        types.some((type) => type === "response.output_text.delta" || type === "response.content_part.added"),
        "Expected a typed response output event",
      );
      return {
        status: "pass",
        summary: `Received ${events.length} typed response stream events`,
        evidence: { eventCount: events.length, eventTypes: [...new Set(types)] },
        durationMs,
      };
    },
  },
];
