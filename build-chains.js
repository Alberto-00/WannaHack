#!/usr/bin/env node
// Build script: bundle every YAML chain under chains/ into js/chains.js.
// Usage: node build-chains.js

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = __dirname;
const CHAINS_DIR = path.join(ROOT, 'chains');
const OUTPUT_FILE = path.join(ROOT, 'js', 'chains.js');

const chains = [];
const errors = [];

if (fs.existsSync(CHAINS_DIR)) {
  for (const entry of fs.readdirSync(CHAINS_DIR, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    if (entry.isDirectory()) continue;
    if (!/\.ya?ml$/i.test(entry.name)) continue;

    const full = path.join(CHAINS_DIR, entry.name);
    try {
      const data = yaml.load(fs.readFileSync(full, 'utf8'));
      if (data && typeof data === 'object') chains.push(data);
    } catch (e) {
      errors.push(`${entry.name}: ${e.message}`);
    }
  }
}

// Stable order: by id ascending.
chains.sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));

const output = `// WannaHack - Chain Database
// AUTO-GENERATED — do not edit manually.
// To add or modify chains, edit the YAML files in the chains/ directory.
// Then run: node build-chains.js

const CHAIN_DATA = ${JSON.stringify({ chains }, null, 2)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CHAIN_DATA };
} else {
  window.CHAIN_DATA = CHAIN_DATA;
}
`;

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, output);
console.log(`Built ${chains.length} chain(s) into ${path.relative(ROOT, OUTPUT_FILE)}`);
if (errors.length > 0) {
  console.log(`(${errors.length} file(s) had errors and were skipped)`);
  for (const e of errors) console.log(`  - ${e}`);
}
