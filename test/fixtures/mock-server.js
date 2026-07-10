import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(value));
}

function sse(response, frames) {
  response.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  for (const frame of frames) response.write(`${frame}\n\n`);
  response.end();
}

export function createMockServer({ mode = "compatible" } = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (request.method === "GET" && url.pathname === "/v1/models") {
      return json(response, 200, {
        object: "list",
        data: [{ id: "canary-model", object: "model" }],
      });
    }

    if (request.method === "POST" && url.pathname === "/v1/chat/completions") {
      const body = await readJson(request);
      if (body.stream) {
        if (mode === "broken-stream") {
          return json(response, 200, { object: "chat.completion" });
        }
        return sse(response, [
          `data: ${JSON.stringify({ id: "chatcmpl_canary", object: "chat.completion.chunk", choices: [{ index: 0, delta: { role: "assistant", content: "CANARY" }, finish_reason: null }] })}`,
          `data: ${JSON.stringify({ id: "chatcmpl_canary", object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: "_OK" }, finish_reason: "stop" }] })}`,
          "data: [DONE]",
        ]);
      }

      if (body.tools) {
        const name = body.tool_choice?.function?.name ?? body.tools[0]?.function?.name;
        return json(response, 200, {
          id: "chatcmpl_tool",
          object: "chat.completion",
          choices: [
            {
              index: 0,
              finish_reason: "tool_calls",
              message: {
                role: "assistant",
                content: null,
                tool_calls: [
                  {
                    id: "call_canary",
                    type: "function",
                    function: { name, arguments: JSON.stringify({ value: "CANARY_OK" }) },
                  },
                ],
              },
            },
          ],
        });
      }

      if (body.response_format?.type === "json_schema") {
        return json(response, 200, {
          id: "chatcmpl_schema",
          object: "chat.completion",
          choices: [
            {
              index: 0,
              finish_reason: "stop",
              message: { role: "assistant", content: JSON.stringify({ status: "ok" }) },
            },
          ],
        });
      }

      return json(response, 200, {
        id: "chatcmpl_basic",
        object: "chat.completion",
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: { role: "assistant", content: "CANARY_OK" },
          },
        ],
      });
    }

    if (request.method === "POST" && url.pathname === "/v1/responses") {
      const body = await readJson(request);
      if (body.stream) {
        return sse(response, [
          `event: response.created\ndata: ${JSON.stringify({ type: "response.created", response: { id: "resp_canary", object: "response", status: "in_progress" } })}`,
          `event: response.output_text.delta\ndata: ${JSON.stringify({ type: "response.output_text.delta", delta: "CANARY_OK" })}`,
          `event: response.completed\ndata: ${JSON.stringify({ type: "response.completed", response: { id: "resp_canary", object: "response", status: "completed" } })}`,
        ]);
      }
      return json(response, 200, {
        id: "resp_canary",
        object: "response",
        status: "completed",
        output: [
          {
            id: "msg_canary",
            type: "message",
            role: "assistant",
            content: [{ type: "output_text", text: "CANARY_OK" }],
          },
        ],
      });
    }

    return json(response, 404, { error: { message: "Not found" } });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 8787);
  const server = createMockServer({ mode: process.env.MOCK_MODE ?? "compatible" });
  server.listen(port, "127.0.0.1", () => {
    console.log(`CompatCanary mock endpoint: http://127.0.0.1:${port}/v1`);
  });
}
