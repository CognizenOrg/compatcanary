import { probes as defaultProbes } from "./probes.js";

function cleanError(error) {
  const detail = {
    message: error?.message ?? String(error),
  };
  if (error?.code) detail.code = error.code;
  if (error?.status) detail.httpStatus = error.status;
  if (error?.body) detail.responseBody = error.body;
  return detail;
}

function calculateScore(results) {
  const total = results.reduce((sum, result) => sum + result.weight, 0);
  const earned = results.reduce((sum, result) => {
    if (result.status === "pass") return sum + result.weight;
    if (result.status === "warn") return sum + result.weight * 0.5;
    return sum;
  }, 0);
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

export async function scanEndpoint(options, probeSet = defaultProbes) {
  const startedAt = new Date();
  const config = {
    baseUrl: options.baseUrl.replace(/\/+$/, ""),
    model: options.model,
    apiKey: options.apiKey ?? "",
    headers: options.headers ?? {},
    timeoutMs: options.timeoutMs ?? 30_000,
  };
  const profile = options.profile ?? "modern";
  const selectedProbes = probeSet.filter(
    (probe) => !probe.profiles || probe.profiles.includes(profile),
  );
  const results = [];

  for (const probe of selectedProbes) {
    const probeStarted = Date.now();
    try {
      const outcome = await probe.run(config);
      results.push({
        id: probe.id,
        name: probe.name,
        category: probe.category,
        required: probe.required,
        weight: probe.weight,
        ...outcome,
      });
    } catch (error) {
      results.push({
        id: probe.id,
        name: probe.name,
        category: probe.category,
        required: probe.required,
        weight: probe.weight,
        status: "fail",
        summary: error?.message ?? "Probe failed",
        error: cleanError(error),
        durationMs: error?.durationMs ?? Date.now() - probeStarted,
      });
    }
  }

  const completedAt = new Date();
  const requiredFailures = results.filter((result) => result.required && result.status === "fail").length;
  const failures = results.filter((result) => result.status === "fail").length;
  const warnings = results.filter((result) => result.status === "warn").length;
  const passes = results.filter((result) => result.status === "pass").length;

  return {
    schemaVersion: "compatcanary.report.v1",
    scanner: { name: "compatcanary", version: "0.1.0" },
    target: { baseUrl: config.baseUrl, model: config.model, profile },
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    score: calculateScore(results),
    compatible: requiredFailures === 0,
    summary: { passes, warnings, failures, requiredFailures, total: results.length },
    results,
  };
}

export function shouldFail(report, failOn = "required") {
  if (failOn === "never") return false;
  if (failOn === "any") return report.summary.failures > 0;
  return report.summary.requiredFailures > 0;
}
