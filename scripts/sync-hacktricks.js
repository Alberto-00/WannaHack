#!/usr/bin/env node
// Sync HackTricks → js/hacktricks-index.js + js/hacktricks-tag-map.js
//
// Source: https://github.com/HackTricks-wiki/hacktricks
//
// Produces TWO artifacts:
//   1. js/hacktricks-index.js  — full searchable index, lazy-loaded by the tab.
//      Shape: window.HACKTRICKS_INDEX = [{ id, title, summary, url, tags[] }, ...]
//
//   2. js/hacktricks-tag-map.js — small, eager-loaded map used by the build
//      step to auto-populate `related_hacktricks` on every command + by the
//      chain runner sidebar.
//      Shape: window.HACKTRICKS_TAG_MAP = { tag: [{ title, url, anchor? }, ...] }
//
// Usage:
//   node scripts/sync-hacktricks.js [--repo /path] [--dry-run]

const fs = require('fs');
const path = require('path');
const os = require('os');

const { ROOT, ensureDir, cloneOrUpdate, walkFiles, slugify } = require('./lib/kb-utils');

const REPO_URL = 'https://github.com/HackTricks-wiki/hacktricks';
const SRC_DIR = 'src';
const URL_BASE = 'https://book.hacktricks.wiki/en/';

const OUTPUT_INDEX = path.join(ROOT, 'js', 'hacktricks-index.js');
const OUTPUT_TAG_MAP = path.join(ROOT, 'js', 'hacktricks-tag-map.js');

// Cap per-tag pages in the eager map to keep its size bounded.
const TAG_MAP_PAGES_PER_TAG = 6;
// Drop tags so generic they would match too many commands (signal-to-noise loss).
const TAG_MAP_MAX_PAGES_PER_TAG_BEFORE_DROP = 50;
// We keep all tags below that ceiling — specific 1-page tags like "kerberoast"
// are the highest-signal links to commands and we don't want to lose them.

const STOP_TAG_WORDS = new Set([
  'a','an','and','are','as','at','be','but','by','for','if','in','into','is','it',
  'no','not','of','on','or','such','that','the','their','then','there','these',
  'they','this','to','was','will','with','your','en','src','readme','summary',
  'index','home','about','license','overview',
]);

function parseArgs() {
  const args = { repo: null, dryRun: false };
  for (let i = 2; i < process.argv.length; i += 1) {
    const a = process.argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--repo') args.repo = process.argv[++i];
  }
  return args;
}

function urlForPath(repoRelPath) {
  // src/foo/bar/baz.md → https://book.hacktricks.wiki/en/foo/bar/baz.html
  // README.md becomes index.html in mdBook.
  let rel = repoRelPath.replace(/\\/g, '/').replace(/^src\//, '');
  rel = rel.replace(/README\.md$/i, 'index.html').replace(/\.md$/, '.html');
  return URL_BASE + rel;
}

function extractTitle(raw) {
  // First top-level H1.
  const m = raw.match(/^#\s+(.+?)\s*$/m);
  if (m) return m[1].trim();
  return null;
}

function extractSummary(raw) {
  // First non-heading, non-blank paragraph after the H1.
  const after = raw.replace(/^#.+$/m, '');
  for (const block of after.split(/\n\n+/)) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('{{#include')) continue;
    if (trimmed.startsWith('>')) continue;       // callout
    if (trimmed.startsWith('|')) continue;       // table
    if (trimmed.startsWith('```')) continue;     // code
    if (trimmed.startsWith('<')) continue;       // raw html
    const plain = trimmed
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // strip markdown links
      .replace(/[*_`]/g, '')                    // strip emphasis markers
      .replace(/\s+/g, ' ')
      .trim();
    if (plain.length < 30) continue;
    return plain.slice(0, 240);
  }
  return '';
}

function extractSectionAnchors(raw) {
  const out = [];
  const re = /^(#{2,3})\s+(.+?)\s*$/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const heading = m[2].trim();
    const anchor = slugify(heading);
    if (anchor) out.push({ heading, anchor });
    if (out.length >= 8) break;
  }
  return out;
}

function extractTags(repoRelPath, title) {
  const tags = new Set();
  // Path segments
  const parts = repoRelPath
    .replace(/\\/g, '/')
    .replace(/^src\//, '')
    .replace(/\.md$/, '')
    .replace(/README$/i, '')
    .split('/')
    .filter(Boolean);
  for (const p of parts) {
    for (const word of p.split('-')) {
      const w = word.toLowerCase();
      if (w.length < 3) continue;
      if (STOP_TAG_WORDS.has(w)) continue;
      tags.add(w);
    }
    // Also add the joined slug ("active-directory") as a tag.
    if (p.length >= 4 && !STOP_TAG_WORDS.has(p)) tags.add(p.toLowerCase());
  }
  // Title words
  if (title) {
    for (const word of title.split(/[\s\W]+/)) {
      const w = word.toLowerCase();
      if (w.length < 4) continue;
      if (STOP_TAG_WORDS.has(w)) continue;
      tags.add(w);
    }
  }
  return [...tags];
}

function main() {
  const args = parseArgs();
  let checkout = args.repo;
  if (!checkout) {
    checkout = path.join(os.tmpdir(), 'wannahack-sync', 'hacktricks');
    console.log(`Cloning ${REPO_URL} → ${checkout}`);
    cloneOrUpdate(REPO_URL, checkout);
  }

  const srcDir = path.join(checkout, SRC_DIR);
  if (!fs.existsSync(srcDir)) {
    console.error(`Expected ${srcDir} to exist — repo layout changed?`);
    process.exit(2);
  }

  const entries = [];
  let skipped = 0;

  for (const file of walkFiles(srcDir, '.md')) {
    const repoRel = path.relative(checkout, file);
    // Skip top-level meta files (README, LICENSE, SUMMARY at src root).
    const rel = repoRel.replace(/\\/g, '/');
    if (/^src\/(README|SUMMARY|LICENSE|CONTRIBUTING)\.md$/i.test(rel)) { skipped += 1; continue; }
    // Skip translations subdirs (e.g. src/es/, src/fr/) — keep only the English root.
    if (/^src\/[a-z]{2}\//i.test(rel) && !/^src\/en\//i.test(rel)) { skipped += 1; continue; }

    let raw;
    try { raw = fs.readFileSync(file, 'utf8'); }
    catch (_) { skipped += 1; continue; }

    const title = extractTitle(raw);
    if (!title) { skipped += 1; continue; }
    const summary = extractSummary(raw);
    const url = urlForPath(rel);
    const tags = extractTags(rel, title);
    const anchors = extractSectionAnchors(raw);

    entries.push({
      id: slugify(rel.replace(/\.md$/, '').replace(/\//g, '-')),
      title,
      summary,
      url,
      tags,
      section_anchors: anchors,
    });
  }

  entries.sort((a, b) => a.title.localeCompare(b.title));

  // ─── Build tag map ───
  const tagPages = new Map();
  for (const e of entries) {
    for (const t of e.tags) {
      if (!tagPages.has(t)) tagPages.set(t, []);
      tagPages.get(t).push({ title: e.title, url: e.url });
    }
  }
  // Keep every tag that has 1 to MAX_PAGES_PER_TAG_BEFORE_DROP pages.
  // Single-page tags (e.g. "kerberoast" → only kerberoast.md) are the most
  // specific and therefore highest-signal mappings to commands.
  const tagMap = {};
  for (const [t, pages] of tagPages.entries()) {
    if (pages.length === 0) continue;
    if (pages.length > TAG_MAP_MAX_PAGES_PER_TAG_BEFORE_DROP) continue;
    tagMap[t] = pages.slice(0, TAG_MAP_PAGES_PER_TAG);
  }

  // ─── Emit ───
  const indexJs = `// WannaHack - HackTricks search index (auto-generated)
// Generated ${new Date().toISOString()} from ${REPO_URL}.
// Lazy-loaded by the HackTricks tab (~${(JSON.stringify(entries).length / 1024 / 1024).toFixed(1)} MB before gzip).

const HACKTRICKS_INDEX = ${JSON.stringify(entries)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { HACKTRICKS_INDEX };
} else {
  window.HACKTRICKS_INDEX = HACKTRICKS_INDEX;
}
`;

  const tagMapJs = `// WannaHack - HackTricks tag→pages map (auto-generated)
// Generated ${new Date().toISOString()} from ${REPO_URL}.
// Eager-loaded (small); consumed at build time by build-commands.js to
// auto-populate related_hacktricks[], and at runtime by chain step sidebars.

const HACKTRICKS_TAG_MAP = ${JSON.stringify(tagMap)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { HACKTRICKS_TAG_MAP };
} else {
  window.HACKTRICKS_TAG_MAP = HACKTRICKS_TAG_MAP;
}
`;

  if (args.dryRun) {
    console.log(`hacktricks (dry-run): ${entries.length} pages, ${Object.keys(tagMap).length} tags`);
    console.log(`  index bundle: ${(indexJs.length / 1024).toFixed(0)} KB`);
    console.log(`  tag-map bundle: ${(tagMapJs.length / 1024).toFixed(0)} KB`);
    return;
  }

  ensureDir(path.dirname(OUTPUT_INDEX));
  fs.writeFileSync(OUTPUT_INDEX, indexJs);
  fs.writeFileSync(OUTPUT_TAG_MAP, tagMapJs);
  console.log(`hacktricks: indexed ${entries.length} page(s), ${Object.keys(tagMap).length} tag(s) (${skipped} skipped)`);
  console.log(`  ${path.relative(ROOT, OUTPUT_INDEX)} = ${(indexJs.length / 1024).toFixed(0)} KB`);
  console.log(`  ${path.relative(ROOT, OUTPUT_TAG_MAP)} = ${(tagMapJs.length / 1024).toFixed(0)} KB`);
}

if (require.main === module) main();
