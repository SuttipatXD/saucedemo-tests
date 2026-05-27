#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const RESULTS_FILE = path.join(__dirname, "../test-results/results.json");
const OUTPUT_FILE = path.join(__dirname, "../dashboard.html");

// ── Type classification per TC ID ────────────────────────────────────────────
const TYPE_MAP = {
  "TC-LOG-001": "Positive",
  "TC-LOG-002": "Positive",
  "TC-LOG-003": "Negative",
  "TC-LOG-004": "Negative",
  "TC-LOG-005": "Negative",
  "TC-LOG-006": "Negative",
  "TC-LOG-007": "Negative",
  "TC-LOG-008": "Positive",
  "TC-LOG-009": "Positive",
  "TC-LOG-010": "Edge",
  "TC-LOG-011": "Edge",
  "TC-CART-001": "Positive",
  "TC-CART-002": "Positive",
  "TC-CART-003": "Positive",
  "TC-CART-004": "Positive",
  "TC-CART-005": "Positive",
  "TC-CART-006": "Positive",
  "TC-CART-007": "Negative",
  "TC-CART-008": "Negative",
  "TC-CART-009": "Negative",
  "TC-CART-010": "Positive",
  "TC-CART-011": "Edge",
  "TC-CART-012": "Edge",
  "TC-CHK-001": "Positive",
  "TC-CHK-002": "Positive",
  "TC-CHK-003": "Positive",
  "TC-CHK-004": "Positive",
  "TC-CHK-005": "Negative",
  "TC-CHK-006": "Negative",
  "TC-CHK-007": "Negative",
  "TC-CHK-008": "Negative",
  "TC-CHK-009": "Positive",
  "TC-CHK-010": "Positive",
  "TC-CHK-011": "Positive",
  "TC-CHK-012": "Edge",
  "TC-SORT-001": "Positive",
  "TC-SORT-002": "Positive",
  "TC-SORT-003": "Positive",
  "TC-SORT-004": "Positive",
  "TC-SORT-005": "Positive",
  "TC-SORT-006": "Positive",
  "TC-SORT-007": "Positive",
  "TC-SORT-008": "Positive",
  "TC-SORT-009": "Positive",
  "TC-SORT-010": "Positive",
  "TC-OUT-001": "Positive",
  "TC-OUT-002": "Edge",
  "TC-OUT-003": "Positive",
  "TC-OUT-004": "Positive",
};

// ── Feature metadata keyed by spec filename ───────────────────────────────────
const FEATURE_META = {
  "login.spec.ts": {
    name: "Login",
    desc: "Authentication & session handling",
    icon: "🔐",
    color: "#eef2ff",
  },
  "cart.spec.ts": {
    name: "Cart",
    desc: "Add, remove & cart state management",
    icon: "🛒",
    color: "#fef3c7",
  },
  "checkout.spec.ts": {
    name: "Checkout",
    desc: "Order flow, validation & summary",
    icon: "💳",
    color: "#dcfce7",
  },
  "sorting.spec.ts": {
    name: "Product Listing & Sorting",
    desc: "Inventory display, sort order & detail",
    icon: "🔃",
    color: "#fce7f3",
  },
  "logout.spec.ts": {
    name: "Logout",
    desc: "Session termination & re-authentication",
    icon: "🚪",
    color: "#fde8d8",
  },
};

// ── File order ────────────────────────────────────────────────────────────────
const FILE_ORDER = [
  "login.spec.ts",
  "cart.spec.ts",
  "checkout.spec.ts",
  "sorting.spec.ts",
  "logout.spec.ts",
];

// ── Read results ──────────────────────────────────────────────────────────────
if (!fs.existsSync(RESULTS_FILE)) {
  console.error(`❌  ${RESULTS_FILE} not found — run tests first.`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
const stats = data.stats || {};

// ── Collect specs grouped by file ─────────────────────────────────────────────
const byFile = {};

function collectSpecs(suite, fileName) {
  for (const spec of suite.specs || []) {
    const m = spec.title.match(/^(TC-[A-Z]+-\d+)[:\s]*(.*)/);
    const tcId = m ? m[1] : "";
    const desc = m ? m[2].trim() : spec.title;

    let status = "skip";
    let duration = 0;
    if (spec.tests && spec.tests.length > 0) {
      const t = spec.tests[0];
      status =
        t.status === "skipped"
          ? "skip"
          : t.status === "expected"
            ? "pass"
            : "fail";
      duration = (t.results && t.results[0] && t.results[0].duration) || 0;
    }

    byFile[fileName] = byFile[fileName] || [];
    byFile[fileName].push({
      tcId,
      desc,
      type: TYPE_MAP[tcId] || "Positive",
      status,
      duration,
    });
  }
  for (const child of suite.suites || []) collectSpecs(child, fileName);
}

for (const fileSuite of data.suites || []) {
  const fileName = path.basename(fileSuite.file || fileSuite.title || "");
  collectSpecs(fileSuite, fileName);
}

// ── Build ordered feature list ────────────────────────────────────────────────
const features = FILE_ORDER.map((f) => ({
  fileName: f,
  ...(FEATURE_META[f] || { name: f, desc: "", icon: "🧪", color: "#f1f5f9" }),
  specs: byFile[f] || [],
}));

// ── Aggregate counts ──────────────────────────────────────────────────────────
const allSpecs = features.flatMap((f) => f.specs);
const cntTotal = allSpecs.length;
const cntPass = allSpecs.filter((s) => s.status === "pass").length;
const cntFail = allSpecs.filter((s) => s.status === "fail").length;
const cntSkip = allSpecs.filter((s) => s.status === "skip").length;
const passRate = cntTotal ? Math.round((cntPass / cntTotal) * 100) : 0;
const totalMs = stats.duration || 0;
const durationStr =
  totalMs >= 60000
    ? `${Math.floor(totalMs / 60000)}m ${Math.round((totalMs % 60000) / 1000)}s`
    : `${(totalMs / 1000).toFixed(1)}s`;
const startTime = stats.startTime
  ? new Date(stats.startTime).toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  : new Date().toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

// ── Helpers ───────────────────────────────────────────────────────────────────
function typePill(type) {
  const cls =
    { Positive: "type-positive", Negative: "type-negative", Edge: "type-edge" }[
      type
    ] || "type-positive";
  return `<span class="tc-type ${cls}">${type}</span>`;
}
function statusBadge(status) {
  const map = {
    pass: ["s-pass", "Pass"],
    fail: ["s-fail", "Fail"],
    skip: ["s-skip", "Skip"],
  };
  const [cls, label] = map[status] || ["s-skip", "—"];
  return `<span class="status-badge ${cls}">${label}</span>`;
}
function durStr(ms) {
  if (!ms) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}
function featureRows(specs) {
  return specs
    .map(
      (s) =>
        `<tr>
      <td class="tc-id">${s.tcId || "—"}</td>
      <td>${s.desc}</td>
      <td>${typePill(s.type)}</td>
      <td>${statusBadge(s.status)}</td>
      <td style="text-align:right;color:var(--text-muted);font-size:.78rem;">${durStr(s.duration)}</td>
    </tr>`,
    )
    .join("\n        ");
}
function featureSection(f, idx) {
  const pass = f.specs.filter((s) => s.status === "pass").length;
  const fail = f.specs.filter((s) => s.status === "fail").length;
  const total = f.specs.length;
  const pillFail =
    fail > 0 ? `<span class="pill pill-fail">${fail} failed</span>` : "";
  return `
  <div class="section open" id="s-${idx}">
    <div class="section-header" onclick="toggle('s-${idx}')">
      <div class="section-title">
        <div class="feature-icon" style="background:${f.color};">${f.icon}</div>
        <div>
          <h2>${f.name}</h2>
          <p>${f.desc}</p>
        </div>
      </div>
      <div class="section-meta">
        <span class="pill pill-pass">${pass} passed</span>
        ${pillFail}
        <span class="pill pill-total">${total} tests</span>
        <span class="chevron">▼</span>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Test ID</th><th>Description</th><th>Type</th><th>Status</th><th style="text-align:right;">Duration</th></tr></thead>
        <tbody>
        ${featureRows(f.specs)}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ── Generate HTML ─────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SauceDemo — Test Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #f0f4f8; --surface: #ffffff; --border: #e2e8f0;
      --text-primary: #1a202c; --text-secondary: #718096; --text-muted: #a0aec0;
      --accent: #4f46e5; --accent-light: #eef2ff;
      --pass: #059669; --pass-bg: #d1fae5;
      --fail: #dc2626; --fail-bg: #fee2e2;
      --skip: #d97706; --skip-bg: #fef3c7;
      --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --radius: 12px;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text-primary); min-height: 100vh; padding: 2rem 1.5rem 4rem; }

    .header { max-width: 900px; margin: 0 auto 2rem; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .header-left h1 { font-size: 1.75rem; font-weight: 700; letter-spacing: -.5px; }
    .header-left p { margin-top: .25rem; font-size: .875rem; color: var(--text-secondary); }
    .badge-env { display: inline-flex; align-items: center; gap: .35rem; padding: .3rem .75rem; border-radius: 99px; background: var(--accent-light); color: var(--accent); font-size: .75rem; font-weight: 600; margin-top: .5rem; }
    .badge-env::before { content: "●"; font-size: .5rem; }

    .btn-pdf { display: inline-flex; align-items: center; gap: .5rem; padding: .6rem 1.25rem; background: var(--accent); color: #fff; font-size: .875rem; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; box-shadow: var(--shadow-sm); transition: background .15s, transform .1s; }
    .btn-pdf:hover { background: #4338ca; transform: translateY(-1px); }
    .btn-pdf svg { width: 16px; height: 16px; flex-shrink: 0; }

    .summary-grid { max-width: 900px; margin: 0 auto 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; }
    .stat-card { background: var(--surface); border-radius: var(--radius); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    .stat-label { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); }
    .stat-value { font-size: 2rem; font-weight: 700; line-height: 1.2; margin-top: .25rem; }
    .stat-total .stat-value { color: var(--accent); }
    .stat-pass  .stat-value { color: var(--pass); }
    .stat-fail  .stat-value { color: var(--fail); }
    .stat-skip  .stat-value { color: var(--skip); }
    .stat-dur   .stat-value { color: #0891b2; font-size: 1.4rem; }

    .progress-wrap { max-width: 900px; margin: 0 auto 2rem; background: var(--surface); border-radius: var(--radius); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    .progress-label { display: flex; justify-content: space-between; font-size: .8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: .6rem; }
    .progress-bar { height: 10px; border-radius: 99px; background: var(--border); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #059669, #34d399); -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .section { max-width: 900px; margin: 0 auto 1.5rem; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden; }
    .section-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); cursor: pointer; user-select: none; }
    .section-header:hover { background: #fafbff; }
    .section-title { display: flex; align-items: center; gap: .75rem; }
    .feature-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    .section-title h2 { font-size: 1rem; font-weight: 600; }
    .section-title p { font-size: .78rem; color: var(--text-secondary); margin-top: 1px; }
    .section-meta { display: flex; align-items: center; gap: .75rem; }
    .pill { display: inline-flex; align-items: center; padding: .25rem .65rem; border-radius: 99px; font-size: .72rem; font-weight: 600; }
    .pill-pass  { background: var(--pass-bg); color: var(--pass); }
    .pill-fail  { background: var(--fail-bg); color: var(--fail); }
    .pill-total { background: var(--accent-light); color: var(--accent); }
    .chevron { color: var(--text-muted); transition: transform .2s; font-size: .75rem; }
    .section.open .chevron { transform: rotate(180deg); }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: .825rem; }
    thead th { background: #f8fafc; padding: .65rem 1.25rem; text-align: left; font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid #f1f5f9; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: #fafbff; }
    tbody td { padding: .7rem 1.25rem; vertical-align: middle; }
    .tc-id { font-family: "SF Mono","Fira Code",monospace; font-size: .75rem; color: var(--accent); font-weight: 600; white-space: nowrap; }
    .tc-type { display: inline-flex; padding: .2rem .55rem; border-radius: 99px; font-size: .68rem; font-weight: 600; }
    .type-positive { background: #dbeafe; color: #1d4ed8; }
    .type-negative { background: #fee2e2; color: #b91c1c; }
    .type-edge     { background: #fef3c7; color: #92400e; }
    .status-badge { display: inline-flex; align-items: center; gap: .3rem; padding: .25rem .6rem; border-radius: 99px; font-size: .72rem; font-weight: 600; white-space: nowrap; }
    .status-badge::before { content: "●"; font-size: .4rem; line-height: 1; }
    .s-pass { background: var(--pass-bg); color: var(--pass); }
    .s-fail { background: var(--fail-bg); color: var(--fail); }
    .s-skip { background: var(--skip-bg); color: var(--skip); }

    .footer { max-width: 900px; margin: 2.5rem auto 0; text-align: center; font-size: .78rem; color: var(--text-muted); }

    @media print {
      body { background: #fff; padding: 0; }
      .btn-pdf { display: none !important; }
      .section .table-wrap { display: block !important; }
      .chevron { display: none; }
      .section { break-inside: avoid; box-shadow: none; border: 1px solid #ccc; margin-bottom: 1rem; }
    }
  </style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>SauceDemo — Test Dashboard</h1>
    <p>Generated: ${startTime}</p>
    <div class="badge-env">Chromium · Playwright</div>
  </div>
  <button class="btn-pdf" onclick="window.print()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
    Export PDF
  </button>
</div>

<div class="summary-grid">
  <div class="stat-card stat-total"><div class="stat-label">Total Tests</div><div class="stat-value">${cntTotal}</div></div>
  <div class="stat-card stat-pass"><div class="stat-label">Passed</div><div class="stat-value">${cntPass}</div></div>
  <div class="stat-card stat-fail"><div class="stat-label">Failed</div><div class="stat-value">${cntFail}</div></div>
  <div class="stat-card stat-skip"><div class="stat-label">Skipped</div><div class="stat-value">${cntSkip}</div></div>
  <div class="stat-card stat-total"><div class="stat-label">Features</div><div class="stat-value">5</div></div>
  <div class="stat-card stat-dur"><div class="stat-label">Duration</div><div class="stat-value">${durationStr}</div></div>
</div>

<div class="progress-wrap">
  <div class="progress-label"><span>Pass rate</span><span>${passRate}%</span></div>
  <div class="progress-bar"><div class="progress-fill" style="width:${passRate}%"></div></div>
</div>

${features.map((f, i) => featureSection(f, i)).join("\n")}

<div class="footer">SauceDemo · Playwright · saucedemo-playwright-tests</div>

<script>
  function toggle(id) {
    const el = document.getElementById(id);
    const open = el.classList.toggle("open");
    const tw = el.querySelector(".table-wrap");
    if (tw) tw.style.display = open ? "" : "none";
  }
  document.querySelectorAll(".section:not(.open) .table-wrap").forEach(t => { t.style.display = "none"; });
<\/script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_FILE, html, "utf-8");
