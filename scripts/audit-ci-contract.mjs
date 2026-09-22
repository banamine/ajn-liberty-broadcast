#!/usr/bin/env node
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredScripts = ["lint", "build", "test:news-discovery"];
const missingScripts = requiredScripts.filter(name => typeof pkg.scripts?.[name] !== "string");

const failures: string[] = [];
if (missingScripts.length) failures.push("Missing required scripts: " + missingScripts.join(", "));

const workflow = fs.readFileSync(".github/workflows/ajn-news-discovery.yml", "utf8");
for (const required of [
  "npm audit --audit-level=high",
  "npx tsc --noEmit --skipLibCheck",
  "npm run test:news-discovery",
  "npm run build",
  "actions/upload-artifact@v4"
]) {
  if (!workflow.includes(required)) failures.push("Workflow missing: " + required);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("AJN CI contract audit: PASS");
console.log("Required scripts, security audit, strict type check, news tests, build, and evidence upload are present.");
