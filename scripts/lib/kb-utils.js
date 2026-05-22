// WannaHack KB sync helpers — shared by sync-gtfobins.js, sync-lolbas.js, sync-rsg.js.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[_\s/.]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'unnamed';
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// Refuse to clobber a hand-authored file. Sync-sourced files MUST carry their
// known prefix in the filename (gtfo-, lolbas-, rsg-) — if a file already
// exists at the target path with a different prefix, that's a curated entry
// we should not overwrite.
function idCollisionCheck(filePath, expectedPrefix) {
  if (!fs.existsSync(filePath)) return;
  const base = path.basename(filePath, '.json');
  if (!base.startsWith(expectedPrefix)) {
    throw new Error(`refusing to overwrite curated file: ${filePath}`);
  }
}

function safeWriteJson(filePath, data, expectedPrefix) {
  if (expectedPrefix) idCollisionCheck(filePath, expectedPrefix);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

// Shallow git clone (or fetch + checkout) of `repoUrl` into `targetDir`.
// Idempotent: if targetDir already exists with a .git, runs `git pull`.
function cloneOrUpdate(repoUrl, targetDir, branch) {
  ensureDir(path.dirname(targetDir));
  if (fs.existsSync(path.join(targetDir, '.git'))) {
    execSync(`git -C "${targetDir}" fetch --depth 1 origin ${branch || ''}`, { stdio: 'ignore' });
    execSync(`git -C "${targetDir}" reset --hard FETCH_HEAD`, { stdio: 'ignore' });
  } else {
    const args = ['clone', '--depth', '1'];
    if (branch) args.push('-b', branch);
    args.push(repoUrl, targetDir);
    execSync(`git ${args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(' ')}`, { stdio: 'ignore' });
  }
}

// Walk a directory tree returning every file path relative to `dir`.
function walkFiles(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, ext));
    else if (!ext || entry.name.toLowerCase().endsWith(ext)) out.push(full);
  }
  return out;
}

// Reconcile written-this-run files vs already-on-disk files in a sync dir.
// Anything currently on disk with the expected prefix that we did NOT (re)write
// this run is moved to commands/_archived/ so the build script (which ignores
// `_*` prefixed paths) drops them from the bundle.
function pruneStale(syncRoot, expectedPrefix, writtenAbsPaths) {
  if (!fs.existsSync(syncRoot)) return [];
  const archiveRoot = path.join(ROOT, 'commands', '_archived', path.basename(syncRoot));
  const archived = [];
  const written = new Set(writtenAbsPaths.map((p) => path.resolve(p)));
  for (const file of walkFiles(syncRoot, '.json')) {
    const base = path.basename(file, '.json');
    if (!base.startsWith(expectedPrefix)) continue;
    if (written.has(path.resolve(file))) continue;
    const rel = path.relative(syncRoot, file);
    const dest = path.join(archiveRoot, rel);
    ensureDir(path.dirname(dest));
    fs.renameSync(file, dest);
    archived.push(dest);
  }
  return archived;
}

module.exports = {
  ROOT,
  slugify,
  ensureDir,
  idCollisionCheck,
  safeWriteJson,
  cloneOrUpdate,
  walkFiles,
  pruneStale,
};
