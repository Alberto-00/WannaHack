// WannaHack - MissionLog
// Append-only event log per profile. Used to export a markdown writeup at the
// end of a CTF session.
//
// Capped to MAX_EVENTS to keep localStorage healthy.

(function () {
  'use strict';

  const MAX_EVENTS = 1000;

  function fmtVal(v) {
    if (v == null) return '_(empty)_';
    if (Array.isArray(v)) return v.length > 5 ? `${v.slice(0, 5).join(', ')} … (+${v.length - 5})` : v.join(', ');
    if (typeof v === 'object') {
      const k = Object.keys(v).slice(0, 5).map((kk) => `${kk}=${JSON.stringify(v[kk])}`).join(', ');
      return Object.keys(v).length > 5 ? `${k} …` : k;
    }
    const s = String(v);
    return s.length > 200 ? s.slice(0, 197) + '…' : s;
  }

  function nowIso() { return new Date().toISOString(); }

  class MissionLog {
    constructor(storageKeyFn) {
      this._storageKeyFn = storageKeyFn;
      this.events = [];
      this._load();
    }

    _key() { return this._storageKeyFn('mission-log'); }

    _load() {
      try {
        const raw = localStorage.getItem(this._key());
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data)) this.events = data;
        }
      } catch (_) {}
    }

    _save() {
      try {
        if (this.events.length > MAX_EVENTS) this.events = this.events.slice(-MAX_EVENTS);
        localStorage.setItem(this._key(), JSON.stringify(this.events));
      } catch (_) {}
    }

    record(type, payload = {}) {
      this.events.push({ ts: nowIso(), type, ...payload });
      this._save();
    }

    clear() {
      this.events = [];
      this._save();
    }

    exportMarkdown({ targetBoard, chainRunner } = {}) {
      const lines = [];
      lines.push(`# WannaHack Mission Report`);
      lines.push('');
      lines.push(`**Generated:** ${nowIso()}`);

      // Target board summary
      if (targetBoard) {
        const buckets = targetBoard.byBucket();
        const summary = [];
        if (buckets.intel.length) {
          const ip = targetBoard.get('target_ip') || targetBoard.get('dc_ip');
          const domain = targetBoard.get('domain');
          if (ip) summary.push(`Target IP: \`${ip}\``);
          if (domain) summary.push(`Domain: \`${domain}\``);
          const os = targetBoard.get('os');
          if (os) summary.push(`OS: ${os}`);
        }
        if (summary.length) {
          lines.push('');
          for (const s of summary) lines.push(`**${s}**  `);
        }
      }
      lines.push('');
      lines.push('---');
      lines.push('');

      // Timeline grouped by chain instance
      if (chainRunner) {
        const instances = chainRunner.listInstances();
        for (const i of instances) {
          const inst = chainRunner.instances[i.instance_id];
          const chain = chainRunner.getChain(inst.chain_id);
          if (!chain) continue;
          lines.push(`## Chain — ${chain.name}`);
          if (chain.description) lines.push(`> ${chain.description.replace(/\n+/g, ' ')}`);
          lines.push('');
          lines.push(`Instance: \`${inst.instance_id}\` · created ${inst.created_at}`);
          lines.push('');
          chain.steps.forEach((step, idx) => {
            const state = inst.step_state[step.id] || {};
            const statusMark = state.status === 'done' ? '✅' :
                               state.status === 'failed' ? '❌' :
                               state.status === 'running' ? '🟡' : '⬜';
            lines.push(`### Step ${idx + 1} — ${step.name || step.id} ${statusMark}`);
            if (step.notes) lines.push(`_${step.notes.trim().split('\n').join(' ')}_`);
            // Resolved command text
            try {
              const r = chainRunner._resolveStepCommand(step, inst);
              if (r && r.command_text) {
                lines.push('');
                lines.push('```');
                lines.push(r.command_text);
                lines.push('```');
              }
            } catch (_) {}
            if (state.captured && state.captured.length) {
              lines.push('');
              lines.push(`**Captured:** ${state.captured.map((v) => `\`${v}\` = ${fmtVal(inst.vars[v])}`).join(', ')}`);
            }
            if (state.raw_output) {
              lines.push('');
              lines.push('<details><summary>Raw output</summary>');
              lines.push('');
              lines.push('```');
              const out = state.raw_output.length > 4000 ? state.raw_output.slice(0, 4000) + '\n…(truncated)…' : state.raw_output;
              lines.push(out);
              lines.push('```');
              lines.push('');
              lines.push('</details>');
            }
            lines.push('');
          });
        }
      }

      // Loot summary
      if (targetBoard) {
        const buckets = targetBoard.byBucket();
        if (buckets.loot.length) {
          lines.push('---');
          lines.push('');
          lines.push('## 🟢 Loot');
          for (const it of buckets.loot) lines.push(`- **${it.label}** — ${fmtVal(it.value)}`);
        }
        if (buckets.shells.length) {
          lines.push('');
          lines.push('## 🔵 Shells');
          for (const it of buckets.shells) lines.push(`- **${it.label}** — ${fmtVal(it.value)}`);
        }
      }

      // HackTricks consulted (from logged events)
      const htHits = this.events.filter((e) => e.type === 'hacktricks.opened');
      if (htHits.length) {
        lines.push('');
        lines.push('---');
        lines.push('');
        lines.push('## 📚 HackTricks consulted');
        const uniq = new Map();
        for (const e of htHits) uniq.set(e.url, e.title || e.url);
        for (const [url, title] of uniq) lines.push(`- [${title}](${url})`);
      }

      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push('_Generated by WannaHack._');
      return lines.join('\n');
    }

    downloadMarkdown(opts) {
      const md = this.exportMarkdown(opts);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wannahack-mission-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    }
  }

  window.WannaMissionLog = MissionLog;
})();
