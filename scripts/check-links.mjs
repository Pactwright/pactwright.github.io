// Fails if any internal link in the built site points at a page or #anchor that doesn't exist.
// Run after `astro build`: node scripts/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

/** The file a site path is served from, or null. */
function resolve(path) {
  const clean = decodeURI(path.split("#")[0].split("?")[0]);
  for (const candidate of [clean, join(clean, "index.html"), `${clean}.html`]) {
    const file = join(DIST, candidate);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};

const problems = [];
for (const file of htmlFiles(DIST)) {
  const page = file.slice(DIST.length - 1);
  for (const [, href] of readFileSync(file, "utf8").matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(href) || href.startsWith("//")) continue;
    const [path, anchor] = href.split("#");
    const target = path === "" ? file : path.startsWith("/") ? resolve(path) : resolve(join(page, "..", path));
    if (!target) problems.push(`${page}: ${href} (no such page)`);
    else if (anchor && !idsOf(target).has(decodeURIComponent(anchor))) problems.push(`${page}: ${href} (no #${anchor} there)`);
  }
}

if (problems.length) {
  console.error(`${problems.length} broken internal link(s):\n${[...new Set(problems)].join("\n")}`);
  process.exit(1);
}
console.log("All internal links resolve.");
