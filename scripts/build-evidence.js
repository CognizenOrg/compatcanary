#!/usr/bin/env node

import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { buildEvidenceArtifacts } from "../src/evidence.js";

const root = resolve(process.cwd());
const evidenceDir = join(root, "evidence");
const checkOnly = process.argv.includes("--check");
const manifest = JSON.parse(await readFile(join(evidenceDir, "manifest.json"), "utf8"));
const reports = new Map();

for (const entry of manifest.entries ?? []) {
  const path = join(evidenceDir, entry.report);
  reports.set(entry.report, JSON.parse(await readFile(path, "utf8")));
}

const artifacts = buildEvidenceArtifacts(manifest, reports);
const pagesDir = join(evidenceDir, "pages");
const badgesDir = join(evidenceDir, "badges");

async function replaceGeneratedFiles(directory, expectedNames, contents) {
  for (const name of await readdir(directory)) {
    if (!expectedNames.has(name)) await unlink(join(directory, name));
  }
  for (const [name, content] of contents) {
    await writeFile(join(directory, name), content, "utf8");
  }
}

async function checkGeneratedFiles(directory, expectedNames, contents) {
  const actualNames = new Set(await readdir(directory));
  const unexpected = [...actualNames].filter((name) => !expectedNames.has(name));
  const missing = [...expectedNames].filter((name) => !actualNames.has(name));
  if (unexpected.length || missing.length) {
    throw new Error(`Generated files differ in ${directory}: unexpected=${unexpected.join(",") || "none"}; missing=${missing.join(",") || "none"}`);
  }
  for (const [name, expected] of contents) {
    const actual = await readFile(join(directory, name), "utf8");
    if (actual !== expected) throw new Error(`Generated file is stale: ${join(directory, name)}`);
  }
}

if (checkOnly) {
  await checkGeneratedFiles(pagesDir, new Set(artifacts.pages.keys()), artifacts.pages);
  await checkGeneratedFiles(badgesDir, new Set(artifacts.badges.keys()), artifacts.badges);
  if (await readFile(join(root, "COMPATIBILITY.md"), "utf8") !== artifacts.matrix) {
    throw new Error("Generated file is stale: COMPATIBILITY.md");
  }
  if (await readFile(join(evidenceDir, "index.json"), "utf8") !== artifacts.index) {
    throw new Error("Generated file is stale: evidence/index.json");
  }
} else {
  await mkdir(pagesDir, { recursive: true });
  await mkdir(badgesDir, { recursive: true });
  await replaceGeneratedFiles(pagesDir, new Set(artifacts.pages.keys()), artifacts.pages);
  await replaceGeneratedFiles(badgesDir, new Set(artifacts.badges.keys()), artifacts.badges);
  await writeFile(join(root, "COMPATIBILITY.md"), artifacts.matrix, "utf8");
  await writeFile(join(evidenceDir, "index.json"), artifacts.index, "utf8");
}

console.log(`${checkOnly ? "Verified" : "Built"} ${artifacts.pages.size} compatibility evidence page(s).`);
