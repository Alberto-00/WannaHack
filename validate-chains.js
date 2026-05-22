#!/usr/bin/env node
// Validate every chain YAML file under chains/ against schema/chain.schema.json.
// Usage: node validate-chains.js
//
// Checks performed:
//   1. YAML parses
//   2. Conforms to schema/chain.schema.json (including the oneOf step shape)
//   3. id matches filename (sans .yaml/.yml)
//   4. id is unique across the whole chains/ tree
//   5. Step ids are unique within each chain
//   6. Every command_ref resolves to an id that exists in commands/

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const yaml = require('js-yaml');

const ROOT = __dirname;
const CHAINS_DIR = path.join(ROOT, 'chains');
const COMMANDS_DIR = path.join(ROOT, 'commands');
const SCHEMA_PATH = path.join(ROOT, 'schema', 'chain.schema.json');

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

// Build the set of known command ids by walking commands/ once. We avoid
// rebuilding js/commands.js here so validate can run on a fresh clone.
function collectCommandIds() {
  const ids = new Set();
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('_')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.json')) continue;
      try {
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        if (data && typeof data.id === 'string') ids.add(data.id);
      } catch (_) { /* swallowed — validate-commands.js owns reporting */ }
    }
  }
  if (fs.existsSync(COMMANDS_DIR)) walk(COMMANDS_DIR);
  return ids;
}

const errors = [];
const seenIds = new Map(); // id -> file
const knownCommandIds = collectCommandIds();

function checkStepRefs(chainFile, chain) {
  const stepIds = new Set();
  for (const step of chain.steps || []) {
    if (stepIds.has(step.id)) {
      errors.push(`${rel(chainFile)}: duplicate step id "${step.id}" within chain`);
    } else {
      stepIds.add(step.id);
    }

    const refsToCheck = [];
    if (step.command_ref) refsToCheck.push({ ref: step.command_ref, where: step.id });
    if (Array.isArray(step.branch)) {
      for (const b of step.branch) {
        if (b.command_ref) refsToCheck.push({ ref: b.command_ref, where: `${step.id}.branch[when=${b.when}]` });
      }
    }

    for (const { ref, where } of refsToCheck) {
      if (!knownCommandIds.has(ref)) {
        errors.push(`${rel(chainFile)}: step "${where}" references unknown command id "${ref}"`);
      }
    }
  }
}

if (!fs.existsSync(CHAINS_DIR)) {
  console.log('No chains/ directory — nothing to validate.');
  process.exit(0);
}

for (const entry of fs.readdirSync(CHAINS_DIR, { withFileTypes: true })) {
  if (entry.name.startsWith('_')) continue;
  if (entry.isDirectory()) {
    errors.push(`${rel(path.join(CHAINS_DIR, entry.name))}: nested directories are not supported under chains/`);
    continue;
  }
  if (!/\.ya?ml$/i.test(entry.name)) continue;

  const full = path.join(CHAINS_DIR, entry.name);
  let data;
  try {
    data = yaml.load(fs.readFileSync(full, 'utf8'));
  } catch (e) {
    errors.push(`${rel(full)}: invalid YAML — ${e.message}`);
    continue;
  }

  if (!data || typeof data !== 'object') {
    errors.push(`${rel(full)}: top-level must be a mapping`);
    continue;
  }

  const ok = validate(data);
  if (!ok) {
    for (const err of validate.errors) {
      errors.push(`${rel(full)}: ${err.instancePath || '/'} ${err.message}`);
    }
    continue;
  }

  const expectedId = entry.name.replace(/\.ya?ml$/i, '');
  if (data.id !== expectedId) {
    errors.push(`${rel(full)}: id "${data.id}" does not match filename "${expectedId}"`);
  }

  if (seenIds.has(data.id)) {
    errors.push(`${rel(full)}: duplicate chain id "${data.id}" (also in ${rel(seenIds.get(data.id))})`);
  } else {
    seenIds.set(data.id, full);
  }

  checkStepRefs(full, data);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} chain validation error(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}

console.log(`OK — ${seenIds.size} chains validated against ${knownCommandIds.size} known commands.`);
