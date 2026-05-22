#!/usr/bin/env node
// Sync LOLBAS → commands/lolbas/<category>/lolbas-<binary>-<category>[-N].json
//
// Source: https://github.com/LOLBAS-Project/LOLBAS
//
// Each `yml/<class>/<binary>.yml` documents a Microsoft-signed binary with
// one or more abuse `Commands[]`. We emit one of our command JSON files per
// command entry, normalizing the category and tracking the upstream id.
//
// Usage:
//   node scripts/sync-lolbas.js [--repo /path] [--dry-run]

const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

const { ROOT, slugify, safeWriteJson, cloneOrUpdate, walkFiles, pruneStale } = require('./lib/kb-utils');

const REPO_URL = 'https://github.com/LOLBAS-Project/LOLBAS';
const SYNC_DIR = path.join(ROOT, 'commands', 'lolbas');

const CATEGORY_MAP = {
  'Execute':    'execute',
  'Download':   'download',
  'Upload':     'upload',
  'Credentials':'credentials',
  'Encode':     'encode',
  'Decode':     'decode',
  'AWL Bypass': 'awl-bypass',
  'UAC Bypass': 'uac-bypass',
  'Copy':       'copy',
  'Compile':    'compile',
  'Dump':       'dump',
  'ADS':        'ads',
  'Reconnaissance': 'reconnaissance',
};

function parseArgs() {
  const args = { repo: null, dryRun: false };
  for (let i = 2; i < process.argv.length; i += 1) {
    const a = process.argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--repo') args.repo = process.argv[++i];
  }
  return args;
}

function normalizeCategory(raw) {
  if (!raw) return 'misc';
  return CATEGORY_MAP[raw] || slugify(raw) || 'misc';
}

function buildCommand(entry, cmdRecord, idx, totalForCategory) {
  const binary = entry.Name;
  if (!binary) return null;
  const category = normalizeCategory(cmdRecord.Category);
  const codeRaw = (cmdRecord.Command || '').trim();
  if (!codeRaw) return null;

  const baseSlug = `lolbas-${slugify(binary)}-${slugify(cmdRecord.Category || 'misc')}`;
  const id = totalForCategory > 1 ? `${baseSlug}-${idx + 1}` : baseSlug;

  let description = (cmdRecord.Description || '').trim();
  if (!description) description = `LOLBAS ${binary}: ${cmdRecord.Category || 'usage'}.`;

  return {
    id,
    name: `LOLBAS · ${binary} (${cmdRecord.Category || 'usage'})${totalForCategory > 1 ? ` #${idx + 1}` : ''}`,
    command: codeRaw,
    description,
    platform: 'windows',
    tags: ['lolbas', binary.toLowerCase().replace(/\.exe$/, ''), slugify(cmdRecord.Category || '')].filter(Boolean),
    source: 'lolbas',
    source_url: entry.Url || `https://lolbas-project.github.io/lolbas/${binary.replace(/\.exe$/i, '')}/`,
    upstream_id: `${binary}/${cmdRecord.Category || ''}/${idx}`,
    category: 'lolbas',
    subcategory: CATEGORY_MAP[cmdRecord.Category] ? CATEGORY_MAP[cmdRecord.Category] : 'misc',
    references: [
      { title: `LOLBAS — ${binary}`, url: entry.Url || `https://lolbas-project.github.io/lolbas/${binary.replace(/\.exe$/i, '')}/` },
    ],
  };
}

function main() {
  const args = parseArgs();
  let checkout = args.repo;
  if (!checkout) {
    checkout = path.join(os.tmpdir(), 'wannahack-sync', 'lolbas');
    console.log(`Cloning ${REPO_URL} → ${checkout}`);
    cloneOrUpdate(REPO_URL, checkout);
  }

  const ymlDir = path.join(checkout, 'yml');
  if (!fs.existsSync(ymlDir)) {
    console.error(`Expected ${ymlDir} to exist — repo layout changed?`);
    process.exit(2);
  }

  const written = [];
  const warnings = [];
  let total = 0;
  for (const file of walkFiles(ymlDir)) {
    if (!/\.ya?ml$/i.test(file)) continue;
    let entry;
    try { entry = yaml.load(fs.readFileSync(file, 'utf8')); }
    catch (e) { warnings.push(`${file}: ${e.message}`); continue; }
    if (!entry || typeof entry !== 'object') continue;
    if (!Array.isArray(entry.Commands)) continue;

    // Group commands by category to compute totalForCategory.
    const byCat = new Map();
    entry.Commands.forEach((c, idx) => {
      const cat = c.Category || 'misc';
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push({ c, idx });
    });

    for (const [, group] of byCat) {
      group.forEach(({ c, idx }, j) => {
        const cmd = buildCommand(entry, c, j, group.length);
        if (!cmd) return;
        const out = path.join(SYNC_DIR, cmd.subcategory, `${cmd.id}.json`);
        if (args.dryRun) { written.push(out); total += 1; return; }
        try {
          safeWriteJson(out, cmd, 'lolbas-');
          written.push(out);
          total += 1;
        } catch (e) {
          warnings.push(`${entry.Name}: ${e.message}`);
        }
      });
    }
  }

  if (!args.dryRun) {
    const archived = pruneStale(SYNC_DIR, 'lolbas-', written);
    console.log(`lolbas: wrote ${total} command(s), archived ${archived.length} stale`);
  } else {
    console.log(`lolbas (dry-run): would write ${total} command(s)`);
  }
  if (warnings.length) {
    console.log(`lolbas: ${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 20)) console.log('  - ' + w);
    if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
  }
}

if (require.main === module) main();
