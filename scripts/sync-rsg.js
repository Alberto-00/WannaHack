#!/usr/bin/env node
// Sync reverse-shell-generator → commands/payloads/<subcat>/rsg-<slug>.json
//
// Source: https://github.com/0dayCTF/reverse-shell-generator
//
// rsg ships its data as a plain JS module (`js/data.js`) that we `require`
// after the clone. Each entry is `{ name, command, meta: [os..., type] }`
// where type is one of ReverseShell|BindShell|MSFVenom|HoaxShell|Assembled.
//
// rsg uses `{ip}`/`{port}`/`{shell}` as template variables — we rewrite them
// to our `<lhost>`/`<lport>`/`<shell>` placeholder syntax so the chain runner
// and the existing context bar pick them up automatically.
//
// Usage:
//   node scripts/sync-rsg.js [--repo /path] [--dry-run]

const fs = require('fs');
const path = require('path');
const os = require('os');

const { ROOT, slugify, safeWriteJson, cloneOrUpdate, pruneStale } = require('./lib/kb-utils');

const REPO_URL = 'https://github.com/0dayCTF/reverse-shell-generator';
const SYNC_DIR = path.join(ROOT, 'commands', 'payloads');

const TYPE_TO_SUBCATEGORY = {
  'ReverseShell': 'reverse-shell',
  'BindShell':    'bind-shell',
  'MSFVenom':     'msfvenom',
  'HoaxShell':    'hoax-shell',
  'Assembled':    'misc',
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

// Replace rsg's {ip}/{port}/{shell} with our <placeholder> syntax. Anything
// else inside {} is left literal — many MSFVenom entries contain {arch} and
// similar which we surface as new placeholders the user can fill manually.
function rewriteTemplate(cmd) {
  return cmd
    .replace(/\{ip\}/g, '<lhost>')
    .replace(/\{port\}/g, '<lport>')
    .replace(/\{shell\}/g, '<shell>')
    .replace(/\{([a-zA-Z][\w-]*)\}/g, (_, name) => `<${name}>`);
}

function pickPlatform(meta) {
  const set = new Set(meta || []);
  const hasLinux = set.has('linux') || set.has('mac');
  const hasWindows = set.has('windows');
  if (hasLinux && hasWindows) return 'cross-platform';
  if (hasLinux) return 'linux';
  if (hasWindows) return 'windows';
  return 'cross-platform';
}

function buildCommand(entry, type, idx) {
  const subcat = TYPE_TO_SUBCATEGORY[type] || 'misc';
  const baseSlug = slugify(`${type.toLowerCase()}-${entry.name}`);
  const id = `rsg-${baseSlug}`;
  const command = rewriteTemplate(entry.command);
  const description = `${type.replace(/([A-Z])/g, ' $1').trim()} payload — ${entry.name} (via reverse-shell-generator).`;
  const tags = ['rsg', 'payload', subcat, ...(entry.meta || []).filter((t) => t !== type)];

  return {
    id,
    name: `RSG · ${type} · ${entry.name}`,
    command,
    description,
    platform: pickPlatform(entry.meta),
    tags,
    source: 'rsg',
    source_url: 'https://www.revshells.com/',
    upstream_id: `${type}/${entry.name}/${idx}`,
    category: 'payloads',
    subcategory: subcat,
    references: [
      { title: 'reverse-shell-generator (revshells.com)', url: 'https://www.revshells.com/' },
      { title: 'reverse-shell-generator GitHub',         url: 'https://github.com/0dayCTF/reverse-shell-generator' },
    ],
  };
}

function loadRsgData(checkout) {
  const dataPath = path.join(checkout, 'js', 'data.js');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Expected ${dataPath} to exist — repo layout changed?`);
  }
  // require() honors the `exports.rsgData =` block at the bottom of data.js.
  // Clear any cached module so consecutive sync runs pick up updates.
  delete require.cache[require.resolve(dataPath)];
  const mod = require(dataPath);
  if (!mod || !mod.rsgData) throw new Error('data.js did not export rsgData');
  return mod.rsgData;
}

function main() {
  const args = parseArgs();
  let checkout = args.repo;
  if (!checkout) {
    checkout = path.join(os.tmpdir(), 'wannahack-sync', 'rsg');
    console.log(`Cloning ${REPO_URL} → ${checkout}`);
    cloneOrUpdate(REPO_URL, checkout);
  }

  const data = loadRsgData(checkout);
  const all = data.reverseShellCommands || [];
  if (!Array.isArray(all)) throw new Error('rsgData.reverseShellCommands is not an array');

  const written = [];
  const warnings = [];
  const seen = new Set();
  let total = 0;

  all.forEach((entry, idx) => {
    if (!entry || !entry.command || !entry.name) return;
    const type = (entry.meta || []).find((m) => TYPE_TO_SUBCATEGORY[m]) || 'Assembled';
    let cmd;
    try { cmd = buildCommand(entry, type, idx); }
    catch (e) { warnings.push(`${entry.name}: ${e.message}`); return; }

    // Dedup if upstream has two entries with the same name + type.
    if (seen.has(cmd.id)) {
      cmd.id = `${cmd.id}-${idx}`;
    }
    seen.add(cmd.id);

    const out = path.join(SYNC_DIR, cmd.subcategory, `${cmd.id}.json`);
    if (args.dryRun) { written.push(out); total += 1; return; }
    try {
      safeWriteJson(out, cmd, 'rsg-');
      written.push(out);
      total += 1;
    } catch (e) {
      warnings.push(`${entry.name}: ${e.message}`);
    }
  });

  // Also surface special PowerShell payloads.
  if (data.specialCommands && typeof data.specialCommands === 'object') {
    let idx = 0;
    for (const [name, raw] of Object.entries(data.specialCommands)) {
      const entry = { name, command: raw, meta: ['windows'] };
      const cmd = buildCommand(entry, 'ReverseShell', 9000 + idx);
      cmd.id = `rsg-${slugify('special-' + name)}`;
      if (seen.has(cmd.id)) cmd.id = `${cmd.id}-${idx}`;
      seen.add(cmd.id);
      const out = path.join(SYNC_DIR, cmd.subcategory, `${cmd.id}.json`);
      if (args.dryRun) { written.push(out); total += 1; idx += 1; continue; }
      try { safeWriteJson(out, cmd, 'rsg-'); written.push(out); total += 1; }
      catch (e) { warnings.push(`special/${name}: ${e.message}`); }
      idx += 1;
    }
  }

  if (!args.dryRun) {
    const archived = pruneStale(SYNC_DIR, 'rsg-', written);
    console.log(`rsg: wrote ${total} command(s), archived ${archived.length} stale`);
  } else {
    console.log(`rsg (dry-run): would write ${total} command(s)`);
  }
  if (warnings.length) {
    console.log(`rsg: ${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 20)) console.log('  - ' + w);
    if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
  }
}

if (require.main === module) main();
