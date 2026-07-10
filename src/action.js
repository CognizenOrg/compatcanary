import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { renderReport } from "./reporters.js";
import { scanEndpoint, shouldFail } from "./scanner.js";

function input(name, fallback = "") {
  const key = `INPUT_${name.replace(/ /g, "_").toUpperCase()}`;
  return process.env[key] || fallback;
}

async function output(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, "utf8");
}

try {
  const reportPath = input("output", "compatcanary-report.md");
  const format = input("format", "markdown");
  const timeout = Number(input("timeout", "30"));
  const options = {
    baseUrl: input("base-url"),
    model: input("model"),
    profile: input("profile", "modern"),
    apiKey: input("api-key"),
    headers: {},
    timeoutMs: timeout * 1_000,
  };
  if (!options.baseUrl || !options.model) {
    throw new Error("The base-url and model action inputs are required");
  }
  const report = await scanEndpoint(options);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, renderReport(report, format), "utf8");
  await output("score", report.score);
  await output("compatible", report.compatible);
  await output("report", reportPath);
  console.log(`CompatCanary score: ${report.score}/100`);
  console.log(`Report: ${reportPath}`);
  if (shouldFail(report, input("fail-on", "required"))) process.exitCode = 1;
} catch (error) {
  console.error(`compatcanary: ${error.message}`);
  process.exitCode = 2;
}
