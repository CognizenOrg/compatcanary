const VALUE_FLAGS = new Set([
  "--base-url",
  "--model",
  "--profile",
  "--api-key",
  "--api-key-env",
  "--format",
  "--output",
  "--timeout",
  "--fail-on",
  "--header",
]);

export function parseArgs(argv, env = process.env) {
  const options = {
    command: "scan",
    baseUrl: env.OPENAI_BASE_URL ?? "",
    model: env.OPENAI_MODEL ?? "",
    profile: env.COMPATCANARY_PROFILE ?? "modern",
    apiKey: "",
    apiKeyEnv: "OPENAI_API_KEY",
    format: "text",
    output: "",
    timeoutMs: 30_000,
    failOn: "required",
    headers: {},
    help: false,
    version: false,
  };

  const args = [...argv];
  if (args[0] && !args[0].startsWith("-")) {
    options.command = args.shift();
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--version" || arg === "-v") {
      options.version = true;
      continue;
    }
    if (!VALUE_FLAGS.has(arg)) {
      throw new Error(`Unknown option: ${arg}`);
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    index += 1;

    switch (arg) {
      case "--base-url":
        options.baseUrl = value;
        break;
      case "--model":
        options.model = value;
        break;
      case "--profile":
        options.profile = value;
        break;
      case "--api-key":
        options.apiKey = value;
        break;
      case "--api-key-env":
        options.apiKeyEnv = value;
        break;
      case "--format":
        options.format = value;
        break;
      case "--output":
        options.output = value;
        break;
      case "--timeout":
        options.timeoutMs = Number(value) * 1_000;
        break;
      case "--fail-on":
        options.failOn = value;
        break;
      case "--header": {
        const separator = value.indexOf(":");
        if (separator < 1) {
          throw new Error("--header must use the form 'Name: value'");
        }
        const name = value.slice(0, separator).trim();
        const headerValue = value.slice(separator + 1).trim();
        options.headers[name] = headerValue;
        break;
      }
      default:
        break;
    }
  }

  if (!["text", "json", "markdown"].includes(options.format)) {
    throw new Error("--format must be text, json, or markdown");
  }
  if (!["modern", "chat"].includes(options.profile)) {
    throw new Error("--profile must be modern or chat");
  }
  if (!["required", "any", "never"].includes(options.failOn)) {
    throw new Error("--fail-on must be required, any, or never");
  }
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error("--timeout must be a positive number of seconds");
  }

  if (!options.apiKey && options.apiKeyEnv) {
    options.apiKey = env[options.apiKeyEnv] ?? "";
  }

  return options;
}

export function validateScanOptions(options) {
  if (options.command !== "scan") {
    throw new Error(`Unknown command: ${options.command}`);
  }
  if (!options.baseUrl) {
    throw new Error("Missing --base-url or OPENAI_BASE_URL");
  }
  if (!options.model) {
    throw new Error("Missing --model or OPENAI_MODEL");
  }
  let parsed;
  try {
    parsed = new URL(options.baseUrl);
  } catch {
    throw new Error("--base-url must be a valid HTTP(S) URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("--base-url must use HTTP or HTTPS");
  }
}
