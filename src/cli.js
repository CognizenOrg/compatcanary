#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { parseArgs, validateScanOptions } from "./args.js";
import { renderReport } from "./reporters.js";
import { scanEndpoint, selectProbes, shouldFail } from "./scanner.js";
import { VERSION } from "./version.js";

export { VERSION } from "./version.js";

export function helpText() {
  return `CompatCanary ${VERSION}

Evidence-first compatibility scanner for OpenAI-style APIs.

Usage:
  compatcanary scan --base-url URL --model MODEL [options]
  compatcanary --profile PROFILE --list-probes

Options:
  --base-url URL       API base URL, normally ending in /v1
  --model MODEL        Model ID to use for live probes
  --profile PROFILE    modern or chat (default: modern)
  --api-key KEY        API key (prefer --api-key-env in shared shells)
  --api-key-env NAME   Read the API key from NAME (default: OPENAI_API_KEY)
  --header 'K: V'      Add a custom request header; may be repeated
  --format FORMAT      text, json, or markdown (default: text)
  --output PATH        Write the report to a file instead of stdout
  --timeout SECONDS    Per-request timeout (default: 30)
  --fail-on MODE       required, any, or never (default: required)
  --list-probes        List probes selected by the active profile and exit
  -h, --help           Show help
  -v, --version        Show version

Environment:
  OPENAI_BASE_URL, OPENAI_MODEL, OPENAI_API_KEY, COMPATCANARY_PROFILE

Examples:
  compatcanary --profile chat --list-probes
  compatcanary scan --base-url http://localhost:8000/v1 --model local-model
  compatcanary scan --base-url https://example.com/v1 --model example-model \\
    --format markdown --output compatcanary.md
`;
}

export function probeListText(profile) {
  const lines = selectProbes(profile).map((probe) => {
    const requirement = probe.required ? "required" : "optional";
    return `- ${probe.id}: ${probe.name} (${requirement}, weight ${probe.weight})`;
  });

  return [`CompatCanary probes for profile "${profile}":`, ...lines].join("\n");
}

export async function main(argv = process.argv.slice(2), io = console) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      io.log(helpText());
      return 0;
    }
    if (options.version) {
      io.log(VERSION);
      return 0;
    }
    if (options.listProbes) {
      io.log(probeListText(options.profile));
      return 0;
    }
    validateScanOptions(options);
    const report = await scanEndpoint(options);
    const rendered = renderReport(report, options.format);
    if (options.output) {
      await mkdir(dirname(options.output), { recursive: true });
      await writeFile(options.output, rendered, "utf8");
      io.log(`Wrote ${options.format} report to ${options.output}`);
      io.log(`Compatibility score: ${report.score}/100 (${report.compatible ? "PASS" : "FAIL"})`);
    } else {
      io.log(rendered.trimEnd());
    }
    return shouldFail(report, options.failOn) ? 1 : 0;
  } catch (error) {
    io.error(`compatcanary: ${error.message}`);
    io.error("Run compatcanary --help for usage.");
    return 2;
  }
}

process.exitCode = await main();
