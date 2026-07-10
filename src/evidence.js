const MANIFEST_SCHEMA = "compatcanary.evidence-manifest.v1";
const REPORT_SCHEMA = "compatcanary.report.v1";

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function requiredString(value, field) {
  invariant(typeof value === "string" && value.trim().length > 0, `${field} must be a non-empty string`);
  return value.trim();
}

function markdown(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function xml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function suspiciousSecret(value) {
  const text = JSON.stringify(value);
  return [
    /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{12,}\b/,
    /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}\b/i,
    /["']?(?:api[_-]?key|authorization)["']?\s*[:=]\s*["'][^"']{8,}["']/i,
    /https?:\/\/[^/\s:@]+:[^@\s/]+@/i,
  ].some((pattern) => pattern.test(text));
}

function validatePublicUrl(value, field) {
  const url = new URL(requiredString(value, field));
  invariant(url.protocol === "https:", `${field} must use HTTPS`);
  invariant(!url.username && !url.password, `${field} must not contain credentials`);
  invariant(!url.search && !url.hash, `${field} must not contain a query string or fragment`);
  return url.toString().replace(/\/$/, "");
}

export function validateReport(report, reportPath = "report") {
  invariant(report && typeof report === "object" && !Array.isArray(report), `${reportPath} must be an object`);
  invariant(report.schemaVersion === REPORT_SCHEMA, `${reportPath} must use ${REPORT_SCHEMA}`);
  invariant(report.scanner?.name === "compatcanary", `${reportPath} must be produced by CompatCanary`);
  requiredString(report.scanner?.version, `${reportPath}.scanner.version`);
  validatePublicUrl(report.target?.baseUrl, `${reportPath}.target.baseUrl`);
  requiredString(report.target?.model, `${reportPath}.target.model`);
  invariant(["modern", "chat"].includes(report.target?.profile), `${reportPath}.target.profile is invalid`);
  invariant(Number.isInteger(report.score) && report.score >= 0 && report.score <= 100, `${reportPath}.score must be an integer from 0 to 100`);
  invariant(typeof report.compatible === "boolean", `${reportPath}.compatible must be boolean`);
  invariant(Number.isFinite(Date.parse(report.completedAt)), `${reportPath}.completedAt must be ISO-8601`);
  invariant(Array.isArray(report.results) && report.results.length > 0, `${reportPath}.results must not be empty`);
  for (const [index, result] of report.results.entries()) {
    const prefix = `${reportPath}.results[${index}]`;
    requiredString(result?.id, `${prefix}.id`);
    requiredString(result?.name, `${prefix}.name`);
    invariant(["pass", "warn", "fail"].includes(result?.status), `${prefix}.status is invalid`);
    invariant(typeof result?.required === "boolean", `${prefix}.required must be boolean`);
    requiredString(result?.summary, `${prefix}.summary`);
  }
  invariant(!suspiciousSecret(report), `${reportPath} appears to contain a credential or authorization value`);
  return report;
}

export function validateManifest(manifest) {
  invariant(manifest && typeof manifest === "object" && !Array.isArray(manifest), "manifest must be an object");
  invariant(manifest.schemaVersion === MANIFEST_SCHEMA, `manifest must use ${MANIFEST_SCHEMA}`);
  invariant(Array.isArray(manifest.entries) && manifest.entries.length > 0, "manifest.entries must not be empty");
  const slugs = new Set();
  const reports = new Set();
  for (const [index, entry] of manifest.entries.entries()) {
    const prefix = `manifest.entries[${index}]`;
    const slug = requiredString(entry?.slug, `${prefix}.slug`);
    invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), `${prefix}.slug must be lowercase kebab-case`);
    invariant(!slugs.has(slug), `${prefix}.slug duplicates ${slug}`);
    slugs.add(slug);
    requiredString(entry?.provider, `${prefix}.provider`);
    requiredString(entry?.implementation, `${prefix}.implementation`);
    requiredString(entry?.implementationVersion, `${prefix}.implementationVersion`);
    requiredString(entry?.submittedBy, `${prefix}.submittedBy`);
    const report = requiredString(entry?.report, `${prefix}.report`);
    invariant(!report.includes(".."), `${prefix}.report must not traverse directories`);
    invariant(/^reports\/[a-z0-9][a-z0-9._/-]*\.json$/.test(report), `${prefix}.report must be under reports/`);
    invariant(!reports.has(report), `${prefix}.report duplicates ${report}`);
    reports.add(report);
    validatePublicUrl(entry?.sourceUrl, `${prefix}.sourceUrl`);
    if (entry.notes !== undefined) requiredString(entry.notes, `${prefix}.notes`);
  }
  return manifest;
}

function statusColor(report) {
  if (!report.compatible) return "#d73a49";
  if (report.results.some((result) => result.status === "warn")) return "#d29922";
  return "#2da44e";
}

function statusLabel(report) {
  if (!report.compatible) return "FAIL";
  if (report.results.some((result) => result.status === "warn")) return "PASS WITH WARNINGS";
  return "PASS";
}

function badgeWidth(text) {
  return Math.max(54, Math.round(text.length * 6.7 + 20));
}

export function renderBadge(entry, report) {
  const label = entry.provider;
  const message = `${report.score}/100 ${statusLabel(report).toLowerCase()}`;
  const left = badgeWidth(label);
  const right = badgeWidth(message);
  const total = left + right;
  const title = `${entry.provider} ${report.target.model}: ${report.score}/100 ${statusLabel(report)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${xml(title)}" width="${total}" height="20" viewBox="0 0 ${total} 20">
  <title>${xml(title)}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".1" stop-opacity=".1"/><stop offset=".9" stop-opacity=".3"/><stop offset="1" stop-opacity=".5"/></linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)"><rect width="${left}" height="20" fill="#555"/><rect x="${left}" width="${right}" height="20" fill="${statusColor(report)}"/><rect width="${total}" height="20" fill="url(#s)"/></g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11"><text x="${left / 2}" y="15" fill="#010101" fill-opacity=".3">${xml(label)}</text><text x="${left / 2}" y="14">${xml(label)}</text><text x="${left + right / 2}" y="15" fill="#010101" fill-opacity=".3">${xml(message)}</text><text x="${left + right / 2}" y="14">${xml(message)}</text></g>
</svg>
`;
}

export function renderEvidencePage(entry, report) {
  const completed = report.completedAt.slice(0, 10);
  const lines = [
    `# ${entry.provider}: ${report.target.model}`,
    "",
    `![${markdown(entry.provider)} compatibility badge](../badges/${entry.slug}.svg)`,
    "",
    `- **Implementation:** ${markdown(entry.implementation)} ${markdown(entry.implementationVersion)}`,
    `- **Endpoint:** \`${markdown(report.target.baseUrl)}\``,
    `- **Profile:** \`${markdown(report.target.profile)}\``,
    `- **Scanned:** ${completed} with CompatCanary ${markdown(report.scanner.version)}`,
    `- **Submitted by:** ${markdown(entry.submittedBy)}`,
    `- **Provider documentation:** ${entry.sourceUrl}`,
    `- **Verdict:** **${statusLabel(report)}**, ${report.score}/100`,
    "",
    entry.notes ? `${markdown(entry.notes)}` : "",
    entry.notes ? "" : "",
    "## Observed behavior",
    "",
    "| Probe | Required | Status | Evidence |",
    "|---|---:|---:|---|",
  ];
  for (const result of report.results) {
    lines.push(`| ${markdown(result.name)} | ${result.required ? "yes" : "no"} | **${result.status.toUpperCase()}** | ${markdown(result.summary)} |`);
  }
  lines.push(
    "",
    "## Reproduce",
    "",
    "```sh",
    `npx compatcanary scan --base-url ${report.target.baseUrl} ` + "\\",
    `  --model ${report.target.model} --profile ${report.target.profile}`,
    "```",
    "",
    `The complete machine-readable evidence is in [the raw report](../${entry.report}).`,
    "",
    "_This records observed behavior at one point in time. It is not an official certification, security audit, or guarantee of future behavior._",
    "",
  );
  return lines.join("\n");
}

export function buildEvidenceArtifacts(manifest, reportsByPath) {
  validateManifest(manifest);
  const entries = manifest.entries.map((entry) => {
    const report = reportsByPath.get(entry.report);
    invariant(report, `Missing report: ${entry.report}`);
    validateReport(report, entry.report);
    return { entry, report };
  }).sort((a, b) => a.entry.provider.localeCompare(b.entry.provider) || a.report.target.model.localeCompare(b.report.target.model));

  const matrix = [
    "# Public compatibility evidence",
    "",
    "CompatCanary publishes reproducible, timestamped observations rather than repeating compatibility claims from documentation. Every row links to the raw report and can be regenerated from the public endpoint with appropriate credentials.",
    "",
    "| Provider | Implementation | Model | Profile | Score | Required compatibility | Scanned | Evidence |",
    "|---|---|---|---:|---:|---:|---:|---|",
  ];
  const pages = new Map();
  const badges = new Map();
  const indexEntries = [];
  for (const { entry, report } of entries) {
    const scanned = report.completedAt.slice(0, 10);
    matrix.push(`| ${markdown(entry.provider)} | ${markdown(entry.implementation)} ${markdown(entry.implementationVersion)} | \`${markdown(report.target.model)}\` | \`${report.target.profile}\` | **${report.score}/100** | **${statusLabel(report)}** | ${scanned} | [report](evidence/pages/${entry.slug}.md) · [JSON](evidence/${entry.report}) · ![badge](evidence/badges/${entry.slug}.svg) |`);
    pages.set(`${entry.slug}.md`, renderEvidencePage(entry, report));
    badges.set(`${entry.slug}.svg`, renderBadge(entry, report));
    indexEntries.push({
      slug: entry.slug,
      provider: entry.provider,
      implementation: entry.implementation,
      implementationVersion: entry.implementationVersion,
      model: report.target.model,
      profile: report.target.profile,
      score: report.score,
      compatible: report.compatible,
      status: statusLabel(report).toLowerCase().replace(/ /g, "-"),
      scannedAt: report.completedAt,
      report: entry.report,
      page: `pages/${entry.slug}.md`,
      badge: `badges/${entry.slug}.svg`,
      sourceUrl: entry.sourceUrl,
    });
  }
  matrix.push(
    "",
    "## Add an endpoint",
    "",
    "Run CompatCanary with `--format json`, review the report for sensitive data, and open a compatibility evidence issue. Accepted reports automatically produce a matrix row, detail page, machine-readable index entry, and badge.",
    "",
    "Scores are snapshots. Re-run a report after provider, gateway, server, or model-version changes.",
    "",
  );
  const updatedAt = indexEntries.map((entry) => entry.scannedAt).sort().at(-1);
  const index = `${JSON.stringify({ schemaVersion: "compatcanary.evidence-index.v1", updatedAt, entries: indexEntries }, null, 2)}\n`;
  return { matrix: matrix.join("\n"), pages, badges, index };
}
