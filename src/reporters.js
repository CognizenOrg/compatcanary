function icon(status) {
  if (status === "pass") return "PASS";
  if (status === "warn") return "WARN";
  return "FAIL";
}

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function renderJson(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderMarkdown(report) {
  const lines = [
    "# CompatCanary report",
    "",
    `- **Target:** \`${report.target.baseUrl}\``,
    `- **Model:** \`${report.target.model}\``,
    `- **Profile:** \`${report.target.profile}\``,
    `- **Score:** **${report.score}/100**`,
    `- **Required compatibility:** **${report.compatible ? "PASS" : "FAIL"}**`,
    `- **Generated:** ${report.completedAt}`,
    "",
    "| Probe | Status | Evidence | Time |",
    "|---|---:|---|---:|",
  ];

  for (const result of report.results) {
    lines.push(
      `| ${escapeCell(result.name)} | **${icon(result.status)}** | ${escapeCell(result.summary)} | ${result.durationMs} ms |`,
    );
  }

  lines.push(
    "",
    "_CompatCanary measures observed API behavior. A passing report is not a security audit or an official OpenAI certification._",
    "",
  );
  return lines.join("\n");
}

export function renderText(report) {
  const width = Math.max(...report.results.map((result) => result.name.length), 18);
  const lines = [
    `CompatCanary ${VERSION}`,
    `Target: ${report.target.baseUrl}`,
    `Model:  ${report.target.model}`,
    `Profile: ${report.target.profile}`,
    "",
  ];

  for (const result of report.results) {
    lines.push(`${icon(result.status).padEnd(4)}  ${result.name.padEnd(width)}  ${result.summary}`);
  }

  lines.push(
    "",
    `Score: ${report.score}/100`,
    `Required compatibility: ${report.compatible ? "PASS" : "FAIL"}`,
    `Summary: ${report.summary.passes} passed, ${report.summary.warnings} warned, ${report.summary.failures} failed`,
    "",
  );
  return lines.join("\n");
}

export function renderReport(report, format) {
  if (format === "json") return renderJson(report);
  if (format === "markdown") return renderMarkdown(report);
  return renderText(report);
}
import { VERSION } from "./version.js";
