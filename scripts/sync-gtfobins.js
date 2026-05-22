#!/usr/bin/env node
// Sync GTFOBins → commands/gtfobins/<function>/gtfo-<binary>-<function>.json
//
// Source: https://github.com/GTFOBins/GTFOBins.github.io
//
// Each `_gtfobins/<binary>.md` is a Jekyll page with YAML front-matter:
//   ---
//   functions:
//     sudo:
//       - code: sudo find . -exec /bin/sh \; -quit
//         description: ...
//     suid:
//       - code: ./find . -exec /bin/sh -p \; -quit
//   ---
//
// We emit one of our command JSON files per (binary, function, variant).
//
// Usage:
//   node scripts/sync-gtfobins.js                  # uses /tmp checkout
//   node scripts/sync-gtfobins.js --repo /path     # use existing local clone
//   node scripts/sync-gtfobins.js --dry-run        # report what would change

const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

const { ROOT, slugify, safeWriteJson, cloneOrUpdate, walkFiles, pruneStale } = require('./lib/kb-utils');

const REPO_URL = 'https://github.com/GTFOBins/GTFOBins.github.io';
const SYNC_DIR = path.join(ROOT, 'commands', 'gtfobins');

// GTFOBins function names → our subcategory keys. `inherit` is an upstream
// concept (entry inherits abilities from another binary) — we surface it as
// nothing for now (silently skipped); the canonical binary still emits its
// own commands.
const FUNCTION_TO_SUBCATEGORY = {
  'shell': 'shell',
  'command': 'command',
  'reverse-shell': 'reverse-shell',
  'non-interactive-reverse-shell': 'non-interactive-reverse-shell',
  'bind-shell': 'bind-shell',
  'non-interactive-bind-shell': 'non-interactive-bind-shell',
  'upload': 'file-upload',
  'file-upload': 'file-upload',
  'download': 'file-download',
  'file-download': 'file-download',
  'file-write': 'file-write',
  'file-read': 'file-read',
  'library-load': 'library-load',
  'sudo': 'sudo',
  'suid': 'suid',
  'capabilities': 'capabilities',
  'limited-suid': 'limited-suid',
  'privilege-escalation': 'suid', // map to closest existing bucket
};
const SILENT_SKIP_FUNCTIONS = new Set(['inherit']);

function parseArgs() {
  const args = { repo: null, dryRun: false };
  for (let i = 2; i < process.argv.length; i += 1) {
    const a = process.argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--repo') args.repo = process.argv[++i];
  }
  return args;
}

function buildCommand(binary, functionName, variant, idx, totalVariants) {
  const subcat = FUNCTION_TO_SUBCATEGORY[functionName];
  if (!subcat) return null;
  const code = (variant.code || '').trim();
  if (!code) return null;
  // Composite id: gtfo-<binary>-<function>[-<n>] when multiple variants.
  const baseId = `gtfo-${slugify(binary)}-${slugify(functionName)}`;
  const id = totalVariants > 1 ? `${baseId}-${idx + 1}` : baseId;

  const description = (variant.description || '').trim() ||
    `Use ${binary} to ${functionName.replace(/-/g, ' ')} via GTFOBins.`;

  return {
    id,
    name: `GTFOBins · ${binary} (${functionName})${totalVariants > 1 ? ` #${idx + 1}` : ''}`,
    command: code,
    description,
    platform: 'linux',
    tags: ['gtfobins', binary, functionName],
    source: 'gtfobins',
    source_url: `https://gtfobins.github.io/gtfobins/${binary}/#${functionName}`,
    upstream_id: `${binary}/${functionName}/${idx}`,
    category: 'gtfobins',
    subcategory: subcat,
    references: [
      { title: 'GTFOBins', url: `https://gtfobins.github.io/gtfobins/${binary}/` },
    ],
  };
}

function main() {
  const args = parseArgs();
  let checkout = args.repo;
  if (!checkout) {
    checkout = path.join(os.tmpdir(), 'wannahack-sync', 'gtfobins');
    console.log(`Cloning ${REPO_URL} → ${checkout}`);
    cloneOrUpdate(REPO_URL, checkout);
  }

  const binDir = path.join(checkout, '_gtfobins');
  if (!fs.existsSync(binDir)) {
    console.error(`Expected ${binDir} to exist — repo layout changed?`);
    process.exit(2);
  }

  const written = [];
  const warnings = [];
  let total = 0;
  for (const file of walkFiles(binDir)) {
    // GTFOBins entries live in _gtfobins/<binary> (no file extension), with the
    // payload data in YAML front-matter at the top.
    if (path.basename(file).startsWith('.')) continue;
    const raw = fs.readFileSync(file, 'utf8');
    // Jekyll front-matter is delimited by `---` opening and either `---` or `...` closing.
    const m = raw.match(/^---\n([\s\S]*?)\n(?:---|\.\.\.)/);
    if (!m) { warnings.push(`${file}: no front-matter`); continue; }
    let data;
    try { data = yaml.load(m[1]); }
    catch (e) { warnings.push(`${file}: yaml parse: ${e.message}`); continue; }
    if (!data) continue;
    // Alias entries (e.g. apt → apt-get) have no `functions` block — skip silently.
    if (!data.functions) continue;

    const binary = path.basename(file);
    for (const [fnName, variants] of Object.entries(data.functions)) {
      if (!Array.isArray(variants)) continue;
      if (SILENT_SKIP_FUNCTIONS.has(fnName)) continue;
      if (!FUNCTION_TO_SUBCATEGORY[fnName]) {
        warnings.push(`${binary}: unknown function "${fnName}" — skipped`);
        continue;
      }
      variants.forEach((variant, idx) => {
        const cmd = buildCommand(binary, fnName, variant, idx, variants.length);
        if (!cmd) return;
        const out = path.join(SYNC_DIR, FUNCTION_TO_SUBCATEGORY[fnName], `${cmd.id}.json`);
        if (args.dryRun) { written.push(out); total += 1; return; }
        try {
          safeWriteJson(out, cmd, 'gtfo-');
          written.push(out);
          total += 1;
        } catch (e) {
          warnings.push(`${binary}/${fnName}: ${e.message}`);
        }
      });
    }
  }

  if (!args.dryRun) {
    const archived = pruneStale(SYNC_DIR, 'gtfo-', written);
    console.log(`gtfobins: wrote ${total} command(s), archived ${archived.length} stale`);
  } else {
    console.log(`gtfobins (dry-run): would write ${total} command(s)`);
  }
  if (warnings.length) {
    console.log(`gtfobins: ${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 20)) console.log('  - ' + w);
    if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
  }
}

if (require.main === module) main();
