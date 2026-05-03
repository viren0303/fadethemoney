/**
 * End-to-end alert delivery test.
 *
 * 1. Loads .env.local (manually — Next loads it for us at runtime)
 * 2. Constructs a fake "Public on a 2-game streak" alert
 * 3. Sends through the real mailer
 * 4. Reports the Resend message id (or the error)
 *
 * Run:   tsx scripts/test-alert.ts
 */
import { promises as fs } from "fs";
import path from "path";
import { notifyAdmin } from "../lib/mailer";

async function loadDotenv(file: string) {
  try {
    const txt = await fs.readFile(file, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (process.env[k] !== undefined) continue;
      const v = vRaw.replace(/^['"]|['"]$/g, "");
      process.env[k] = v;
    }
    console.log(`[test-alert] loaded env from ${file}`);
  } catch {
    console.log(`[test-alert] no ${file} found, using process env only`);
  }
}

async function run() {
  await loadDotenv(path.join(process.cwd(), ".env.local"));

  const sample = {
    subject: "Fade The Money — Public on a 2-game streak",
    text:
      "TEST: Public has covered 2 in a row.\n\n" +
      "Streak: Public x2\n" +
      "Today's record: Public 2 / Vegas 0\n\n" +
      "Open the dashboard: http://localhost:3000\n\n" +
      "If you're reading this, alerts work end-to-end.",
  };

  console.log("[test-alert] sending to:", process.env.ADMIN_EMAIL || "(unset)");
  const res = await notifyAdmin(sample);
  console.log("[test-alert] result:", JSON.stringify(res, null, 2));
  if (!res.ok) process.exit(1);
}

run().catch((e) => { console.error(e); process.exit(1); });
