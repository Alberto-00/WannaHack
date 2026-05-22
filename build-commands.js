#!/usr/bin/env node
// Build script: assembles individual command JSON files into js/commands.js
// Usage: node build-commands.js

const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, 'commands');
const OUTPUT_FILE = path.join(__dirname, 'js', 'commands.js');

// Read categories
const categories = JSON.parse(
  fs.readFileSync(path.join(COMMANDS_DIR, '_categories.json'), 'utf8')
);

// Read links
const links = JSON.parse(
  fs.readFileSync(path.join(COMMANDS_DIR, '_links.json'), 'utf8')
);

// Collect all command files
const commands = [];
const errors = [];

function scanDir(dir, category, subcategory) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue; // Skip meta files

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (category === null) {
        // First level directory = category
        scanDir(fullPath, entry.name, null);
      } else if (subcategory === null) {
        // Second level directory = subcategory
        scanDir(fullPath, category, entry.name);
      }
      // Ignore deeper nesting
    } else if (entry.name.endsWith('.json')) {
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

        // Validate required fields
        if (!data.id || !data.name || !data.command) {
          errors.push(`${fullPath}: missing required fields (id, name, command)`);
          continue;
        }

        // Place category/subcategory after command field for consistent ordering
        const ordered = {
          id: data.id,
          name: data.name,
          command: data.command,
          category: category || '',
          subcategory: subcategory || '',
        };
        // Add remaining fields
        for (const key of Object.keys(data)) {
          if (!ordered.hasOwnProperty(key)) {
            ordered[key] = data[key];
          }
        }
        commands.push(ordered);
      } catch (e) {
        errors.push(`${fullPath}: ${e.message}`);
      }
    }
  }
}

scanDir(COMMANDS_DIR, null, null);

// Report errors
if (errors.length > 0) {
  console.error('\nErrors found:');
  errors.forEach(err => console.error(`  - ${err}`));
  if (commands.length === 0) {
    process.exit(1);
  }
  console.error('');
}

// Sort commands by category, subcategory, name
commands.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  if (a.subcategory !== b.subcategory) return a.subcategory.localeCompare(b.subcategory);
  return a.name.localeCompare(b.name);
});

// ─── Phase 6: auto-populate related_hacktricks from the eager tag map ───
// If `js/hacktricks-tag-map.js` exists (produced by scripts/sync-hacktricks.js)
// we score each command's tags + id-parts against the map and attach the top N
// pages. Skipped silently when the tag map is absent — no hard dependency.
let autoLinked = 0;
try {
  const tagMapPath = path.join(__dirname, 'js', 'hacktricks-tag-map.js');
  if (fs.existsSync(tagMapPath)) {
    const { HACKTRICKS_TAG_MAP } = require(tagMapPath);
    if (HACKTRICKS_TAG_MAP && typeof HACKTRICKS_TAG_MAP === 'object') {
      const MAX_PER_COMMAND = 3;
      const MIN_SCORE = 2;  // require either an explicit tag match or two id-token hits
      for (const cmd of commands) {
        // Skip if the command was authored with a curated related_hacktricks list.
        if (Array.isArray(cmd.related_hacktricks) && cmd.related_hacktricks.length) continue;

        const idTokens = String(cmd.id || '').toLowerCase().split(/[-_]/).filter((s) => s.length >= 3);
        const tags = (cmd.tags || []).map((t) => String(t).toLowerCase());
        const candidates = new Map(); // url -> { entry, score }
        const consider = (tag, weight) => {
          const pages = HACKTRICKS_TAG_MAP[tag];
          if (!Array.isArray(pages)) return;
          for (const p of pages) {
            const cur = candidates.get(p.url) || { entry: p, score: 0 };
            cur.score += weight;
            candidates.set(p.url, cur);
          }
        };
        for (const tag of tags) consider(tag, 3);     // explicit tags weigh most
        for (const tok of idTokens) consider(tok, 1); // id-derived tokens are softer

        const ranked = [...candidates.values()]
          .filter((c) => c.score >= MIN_SCORE)
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_PER_COMMAND);
        if (ranked.length) {
          cmd.related_hacktricks = ranked.map((r) => ({ title: r.entry.title, url: r.entry.url }));
          autoLinked += 1;
        }
      }
      console.log(`  auto-linked HackTricks pages on ${autoLinked} command(s)`);
    }
  }
} catch (e) {
  console.error('  (related_hacktricks linkage skipped: ' + e.message + ')');
}

// Generate output
const output = `// WannaHack - Command Database
// AUTO-GENERATED — do not edit manually.
// To add or modify commands, edit the JSON files in the commands/ directory.
// Then run: node build-commands.js

const COMMAND_DATA = ${JSON.stringify({ categories, commands }, null, 2)};

const COMMAND_LINKS = ${JSON.stringify(links, null, 2)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COMMAND_DATA, COMMAND_LINKS };
} else {
  window.COMMAND_LINKS = COMMAND_LINKS;
}
`;

fs.writeFileSync(OUTPUT_FILE, output);
console.log(`Built ${commands.length} commands into ${OUTPUT_FILE}`);
if (errors.length > 0) {
  console.log(`(${errors.length} files had errors and were skipped)`);
}
