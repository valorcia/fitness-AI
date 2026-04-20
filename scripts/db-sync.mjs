#!/usr/bin/env node
// Retry-friendly wrapper for `prisma db push`. Wakes up Neon-style serverless
// Postgres (which auto-suspends) and keeps the build green even if the DB
// stays asleep longer than expected.

import { spawn } from "node:child_process";

const ATTEMPTS = 4;
const BACKOFF_MS = [2000, 4000, 8000, 15000];

function runOnce() {
  return new Promise((resolve) => {
    const child = spawn(
      "npx",
      ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"],
      { stdio: "inherit", env: process.env },
    );
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[db-sync] DATABASE_URL not set, skipping.");
    return;
  }
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    console.log(`[db-sync] attempt ${attempt}/${ATTEMPTS}`);
    const code = await runOnce();
    if (code === 0) return;
    const delay = BACKOFF_MS[attempt - 1] ?? 15000;
    if (attempt < ATTEMPTS) {
      console.log(`[db-sync] failed (exit ${code}). Retrying in ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    } else {
      console.log(`[db-sync] giving up after ${ATTEMPTS} attempts — continuing build anyway.`);
    }
  }
}

main().catch((e) => {
  console.log("[db-sync] unexpected error:", e?.message ?? e);
});
