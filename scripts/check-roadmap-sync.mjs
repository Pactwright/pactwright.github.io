// XC-12: the master ROADMAP.md must match every repo's ROADMAP.md.
//
// Run it against a master file and one or more repo roadmaps:
//   node scripts/check-roadmap-sync.mjs --master ROADMAP.md \
//     --repo kit=../Pactwright-Kit/ROADMAP.md \
//     --repo contracts=../Pactwright-contracts/ROADMAP.md \
//     --repo studio=../Pactwright-studio/ROADMAP.md
//
// Five things are checked, all of them as errors:
//   1. a task ID listed twice in one file;
//   2. a Progress-summary number that does not match the rows in its own section;
//   3. a total (per file) that does not match its rows;
//   4. a repo roadmap that tracks an ID the master does not know, or that disagrees with
//      the master on that task's status ([ ] / [~] / [x] / [-] must be identical everywhere);
//   5. a master task with no row in any repo roadmap and no `· home: <where>` marker on it,
//      which means nobody — not this CI job, not a contributor — can tell where the work lives.
//
// `home:` is only for tasks that genuinely have no repo roadmap: org and program work
// (`home: org`) and work done inside another organisation's repo (`home: accensa/...`).
// Everything else gets a row in the repo where the change is made.
import { readFileSync } from "node:fs";

const TASK = /^- \[([ ~x-])\] \*\*([A-Z][A-Z0-9]*-\d+[A-Za-z]?)\*\*\s*(.*)$/;
const HEADING = /^##\s+(.*)$/;
const CELL_ROW = /^\|(.+)\|\s*$/;

/** `{ id, state, title, line, home }` for every task row, plus the section each one sits in. */
function parseTasks(file) {
  const tasks = [];
  let section = null;
  readFileSync(file, "utf8").split("\n").forEach((raw, i) => {
    const h = raw.match(HEADING);
    if (h) section = h[1].trim();
    const t = raw.match(TASK);
    if (!t) return;
    const [, state, id, rest] = t;
    const home = rest.match(/\bhome:\s*([^\s·(]+)/)?.[1];
    const titleEnd = rest.search(/ — /);
    tasks.push({
      id,
      state: state.trim() === " " ? " " : state.trim(),
      title: (titleEnd < 0 ? rest : titleEnd && titleEnd > 0 ? rest.slice(0, titleEnd) : "").trim(),
      section,
      home,
      line: i + 1,
    });
  });
  return tasks;
}

/** `[{ label, key, tasks, done }]` from the `## Progress summary` table, in either shape. */
function parseSummary(file) {
  const rows = [];
  let inSummary = false;
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const h = raw.match(HEADING);
    if (h) {
      inSummary = /Progress summary/i.test(h[1]);
      continue;
    }
    if (!inSummary || !CELL_ROW.test(raw)) continue;
    const cells = raw.slice(1, -1).split("|").map((c) => c.trim());
    const v = cells.map(stripBold);
    if (cells.length === 6 && /^(\d+|X|Total)$/.test(v[0]) && /^\d+$/.test(v[3]) && /^\d+$/.test(v[4]))
      rows.push({ master: true, key: v[0], label: cells[1] || cells[0], tasks: +v[3], done: +v[4] });
    else if (cells.length === 4 && /^\d+$/.test(v[1]) && /^\d+$/.test(v[2]))
      rows.push({ master: false, key: v[0], label: cells[0], tasks: +v[1], done: +v[2] });
  }
  return { rows, master: rows.some((r) => r.master) };
}

/** The declared total: `| Overall progress | **104 / 141 tasks (74%)** |` or `| Progress | … |`. */
function parseTotal(file) {
  const m = readFileSync(file, "utf8").match(
    /^\|\s*(?:Overall progress|Progress)\s*\|\s*\*\*(\d+)\s*\/\s*(\d+) tasks \((\d+)%\)\*\*/m,
  );
  return m ? { done: +m[1], tasks: +m[2], pct: +m[3] } : null;
}

const stripBold = (s) => s.replace(/\*\*/g, "").trim();

/** The Progress-summary label a task section is counted under. */
function summaryKeyFor(section, master) {
  if (master) {
    const phase = section.match(/^Phase\s+(\d+)/i);
    if (phase) return phase[1];
    if (/^Cross-cutting/i.test(section)) return "X";
    return null;
  }
  return section;
}

function main(argv) {
  const args = { master: null, repos: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--master") args.master = argv[++i];
    else if (argv[i] === "--repo") {
      const eq = argv[i + 1].indexOf("=");
      args.repos.push({ name: argv[i + 1].slice(0, eq), file: argv[i + 1].slice(eq + 1) });
      i++;
    }
  }
  if (!args.master || args.repos.length === 0) {
    console.error("usage: check-roadmap-sync.mjs --master <ROADMAP.md> --repo <name>=<ROADMAP.md> […]");
    return 2;
  }

  const files = [{ name: "master", file: args.master }, ...args.repos];
  const byFile = new Map(files.map(({ name, file }) => [name, { name, file, tasks: parseTasks(file) }]));
  const errors = [];
  const err = (msg) => errors.push(msg);

  // 1 + 2 + 3: each file against itself.
  for (const { name, file, tasks } of byFile.values()) {
    const seen = new Map();
    for (const t of tasks) {
      if (seen.has(t.id)) err(`${name}: ${t.id} is listed twice (line ${seen.get(t.id)} and line ${t.line}).`);
      else seen.set(t.id, t.line);
    }

    const { rows, master } = parseSummary(file);
    const total = parseTotal(file);
    if (rows.length === 0 || !total) {
      err(`${name}: no Progress summary table or total line found — the checker cannot audit counts it cannot read.`);
      continue;
    }
    for (const row of rows) {
      if (row.key === "Total") continue;
      const inSection = tasks.filter((t) => summaryKeyFor(t.section, master) === row.key);
      if (inSection.length === 0 && row.tasks > 0) {
        err(`${name}: summary says section "${row.label}" has ${row.tasks} tasks, but no task rows are under a heading that maps to it.`);
        continue;
      }
      const done = inSection.filter((t) => t.state === "x").length;
      if (inSection.length !== row.tasks || done !== row.done) {
        err(`${name}: section "${row.label}" declares ${row.done}/${row.tasks}, the rows say ${done}/${inSection.length}.`);
      }
    }
    for (const key of new Set(tasks.map((t) => summaryKeyFor(t.section, master)))) {
      if (!rows.some((r) => r.key === key))
        err(`${name}: the section mapped to "${key}" has task rows but no Progress-summary row, so its counts are never checked.`);
    }
    const done = tasks.filter((t) => t.state === "x").length;
    if (tasks.length !== total.tasks || done !== total.done) {
      err(`${name}: total declares ${total.done}/${total.tasks}, the rows say ${done}/${tasks.length}.`);
    }
  }

  // 4: master against every repo.
  const masterTasks = byFile.get("master").tasks;
  const masterById = new Map(masterTasks.map((t) => [t.id, t]));
  for (const { name, tasks } of byFile.values()) {
    if (name === "master") continue;
    for (const t of tasks) {
      const m = masterById.get(t.id);
      if (!m) {
        err(`${name}: line ${t.line} tracks ${t.id} ("${t.title}") but the master roadmap has no such task.`);
        continue;
      }
      if (m.state !== t.state) {
        err(`${name}: ${t.id} is "${stateName(t.state)}" here and "${stateName(m.state)}" in the master (master line ${m.line}, ${name} line ${t.line}) — reconcile by evidence, do not copy a state over.`);
      }
    }
  }

  // 5: every master task must have a home.
  for (const t of masterTasks) {
    const inRepo = files.some((f, i) => i > 0 && byFile.get(f.name).tasks.some((r) => r.id === t.id));
    if (inRepo || t.home) continue;
    err(`master: line ${t.line} ${t.id} has no row in any repo roadmap and no \`· home: <where>\` marker — nobody can see where this work is done.`);
  }

  if (errors.length) {
    const inActions = process.env.GITHUB_ACTIONS === "true";
    for (const e of errors) console.log(inActions ? `::error::${e}` : `✗ ${e}`);
    console.log(`\n${errors.length} roadmap-sync problem(s).`);
    return 1;
  }
  const repoCounts = files.filter((f) => f.name !== "master").map(({ name }) => `${name}=${byFile.get(name).tasks.length}`);
  console.log(`✓ in sync: ${masterById.size} master tasks, ${repoCounts.join(", ")} — no divergence.`);
  return 0;
}

const stateName = (s) => ({ " ": "todo", "~": "in progress", x: "done", "-": "dropped" })[s] || s;

process.exitCode = main(process.argv.slice(2));
