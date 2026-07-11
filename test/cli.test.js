import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";

const run = promisify(execFile);

const runCli = (...args) => run(process.execPath, ["src/cli.js", ...args]);

const probeLines = (stdout) => stdout.split("\n").filter((line) => line.startsWith("- "));

test("lists the five chat probes without scan configuration", async () => {
  const { stdout, stderr } = await runCli("--profile", "chat", "--list-probes");

  assert.equal(stderr, "");
  assert.equal(probeLines(stdout).length, 5);
  assert.match(stdout, /models\.list.*optional.*weight 0\.5/);
  assert.doesNotMatch(stdout, /responses\./);
});

test("lists all seven modern probes without scan configuration", async () => {
  const { stdout, stderr } = await runCli("--profile", "modern", "--list-probes");

  assert.equal(stderr, "");
  assert.equal(probeLines(stdout).length, 7);
  assert.match(stdout, /responses\.basic.*required.*weight 1\.5/);
  assert.match(stdout, /responses\.streaming.*required.*weight 1\.5/);
});

test("documents the offline probe listing option", async () => {
  const { stdout } = await runCli("--help");

  assert.match(stdout, /--list-probes/);
});
