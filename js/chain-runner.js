// WannaHack - ChainRunner
// Loads a chain definition from CHAIN_DATA, renders a step-by-step timeline,
// substitutes ${var} placeholders into each step's command at render time,
// captures variables from pasted output (chain regex OR built-in auto-extract),
// and persists per-instance state.
//
// Surface API used by MissionControl:
//   new ChainRunner({ targetBoard, storageKeyFn, copyText, showToast })
//   .listChains() -> [{id, name, description, ...}]
//   .listInstances() -> [{instance_id, chain_id, name, ...}]
//   .startChain(chainId) -> instance_id
//   .openInstance(instance_id)
//   .mount(rootEl) — attach to a container, re-renders on state change
//   .currentStep() -> step object or null

(function () {
  'use strict';

  // ────────────────────────── helpers ──────────────────────────
  const STATUS = {
    BLOCKED: 'blocked',     // requires not met
    READY:   'ready',       // ready to copy
    RUNNING: 'running',     // user has copied / pasted, not yet extracted
    DONE:    'done',
    FAILED:  'failed',
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function uniqInstanceId(chainId) {
    const ts = new Date().toISOString().slice(0, 10);
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${chainId}-${ts}-${suffix}`;
  }

  // ${var} → vars[var]. Arrays render as space-joined strings;
  // objects use JSON shorthand. Missing vars stay literal.
  function substituteVars(template, vars) {
    if (template == null) return '';
    return String(template).replace(/\$\{([a-z_][a-z0-9_]*)\}/gi, (_, name) => {
      if (!(name in vars)) return '${' + name + '}';
      const v = vars[name];
      if (Array.isArray(v)) return v.join(' ');
      if (v != null && typeof v === 'object') return JSON.stringify(v);
      return String(v);
    });
  }

  // Replace command placeholders (<dc-ip>) from step.inputs + ${var} interpolation.
  function renderCommand(commandTemplate, step, vars) {
    const inputs = step.inputs || {};
    let cmd = commandTemplate;
    for (const [placeholder, valueTpl] of Object.entries(inputs)) {
      const value = substituteVars(valueTpl, vars);
      const re = new RegExp('<' + placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '>', 'g');
      cmd = cmd.replace(re, value);
    }
    return cmd;
  }

  // ────────────────────────── ChainRunner ──────────────────────────
  class ChainRunner {
    constructor({ targetBoard, storageKeyFn, copyText, showToast, parsers }) {
      this.targetBoard = targetBoard;
      this._storageKeyFn = storageKeyFn;
      this._copyText = copyText || (async (s) => { try { await navigator.clipboard.writeText(s); } catch (_) {} });
      this._showToast = showToast || ((m) => console.log('[toast]', m));
      this._parsers = parsers || (window.WannaOutputParsers || null);

      this.chains = (window.CHAIN_DATA && Array.isArray(window.CHAIN_DATA.chains))
        ? window.CHAIN_DATA.chains : [];
      this.instances = {};        // instance_id -> ChainInstance
      this.activeInstanceId = null;
      this.rootEl = null;
      this.listeners = new Set();

      this._load();
    }

    on(handler) { this.listeners.add(handler); return () => this.listeners.delete(handler); }
    _emit() { for (const h of this.listeners) { try { h(this); } catch (_) {} } }

    // ───────── persistence ─────────
    _load() {
      try {
        const raw = localStorage.getItem(this._storageKeyFn('chain-instances'));
        if (raw) {
          const data = JSON.parse(raw);
          if (data && typeof data === 'object') this.instances = data;
        }
        this.activeInstanceId = localStorage.getItem(this._storageKeyFn('chain-active')) || null;
      } catch (_) { /* swallowed */ }
    }
    _save() {
      try {
        localStorage.setItem(this._storageKeyFn('chain-instances'), JSON.stringify(this.instances));
        if (this.activeInstanceId) {
          localStorage.setItem(this._storageKeyFn('chain-active'), this.activeInstanceId);
        } else {
          localStorage.removeItem(this._storageKeyFn('chain-active'));
        }
      } catch (_) { /* swallowed */ }
    }
    reloadFromProfile() {
      this.instances = {};
      this.activeInstanceId = null;
      this._load();
      this._emit();
      this._render();
    }

    // ───────── lookups ─────────
    listChains() { return this.chains.slice(); }
    getChain(id) { return this.chains.find((c) => c.id === id) || null; }
    findCommand(commandId) {
      if (!commandId || !window.COMMAND_DATA || !Array.isArray(window.COMMAND_DATA.commands)) return null;
      return window.COMMAND_DATA.commands.find((c) => c.id === commandId) || null;
    }
    listInstances() {
      return Object.values(this.instances).map((inst) => {
        const chain = this.getChain(inst.chain_id);
        return {
          instance_id: inst.instance_id,
          chain_id: inst.chain_id,
          chain_name: chain ? chain.name : inst.chain_id,
          created_at: inst.created_at,
          progress: this._progress(inst),
        };
      }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }
    _progress(inst) {
      const chain = this.getChain(inst.chain_id);
      if (!chain) return { done: 0, total: 0 };
      const total = chain.steps.length;
      let done = 0;
      for (const step of chain.steps) {
        const s = (inst.step_state[step.id] || {}).status;
        if (s === STATUS.DONE) done += 1;
      }
      return { done, total };
    }
    activeInstance() {
      if (!this.activeInstanceId) return null;
      return this.instances[this.activeInstanceId] || null;
    }
    currentStep() {
      const inst = this.activeInstance();
      if (!inst) return null;
      const chain = this.getChain(inst.chain_id);
      if (!chain) return null;
      // First step that isn't done — that's "current".
      for (const step of chain.steps) {
        const s = (inst.step_state[step.id] || {}).status;
        if (s !== STATUS.DONE && s !== STATUS.FAILED) return { step, instance: inst, chain };
      }
      return null;
    }

    // ───────── lifecycle ─────────
    startChain(chainId) {
      const chain = this.getChain(chainId);
      if (!chain) throw new Error(`Unknown chain: ${chainId}`);
      const id = uniqInstanceId(chainId);
      const seedVars = this._seedVarsFromInputs(chain);
      const inst = {
        instance_id: id,
        chain_id: chainId,
        created_at: new Date().toISOString(),
        vars: seedVars,
        step_state: {},
        branch_choices: {},
      };
      this.instances[id] = inst;
      this.activeInstanceId = id;
      this._save();
      this._emit();
      this._render();
      return id;
    }

    _seedVarsFromInputs(chain) {
      const vars = {};
      const board = this.targetBoard;
      for (const input of chain.inputs || []) {
        // explicit source: target_context.<field>
        if (input.source && input.source.startsWith('target_context.')) {
          const field = input.source.slice('target_context.'.length);
          if (board && board.has(field)) {
            vars[input.name] = board.get(field);
            continue;
          }
        }
        // implicit: same-name var in the board
        if (board && board.has(input.name)) {
          vars[input.name] = board.get(input.name);
        }
      }
      return vars;
    }

    openInstance(instanceId) {
      if (!this.instances[instanceId]) return;
      this.activeInstanceId = instanceId;
      this._save();
      this._render();
    }

    closeActive() {
      this.activeInstanceId = null;
      this._save();
      this._render();
    }

    deleteInstance(instanceId) {
      delete this.instances[instanceId];
      if (this.activeInstanceId === instanceId) this.activeInstanceId = null;
      this._save();
      this._emit();
      this._render();
    }

    forkAt(stepIdx) {
      const inst = this.activeInstance();
      if (!inst) return null;
      const chain = this.getChain(inst.chain_id);
      if (!chain) return null;
      const id = uniqInstanceId(inst.chain_id);
      const clone = JSON.parse(JSON.stringify(inst));
      clone.instance_id = id;
      clone.created_at = new Date().toISOString();
      // Reset state from stepIdx onwards.
      for (let i = stepIdx; i < chain.steps.length; i += 1) {
        delete clone.step_state[chain.steps[i].id];
      }
      // Clear branch choices for downstream steps too.
      const remainingIds = new Set(chain.steps.slice(0, stepIdx).map((s) => s.id));
      clone.branch_choices = Object.fromEntries(
        Object.entries(clone.branch_choices || {}).filter(([k]) => remainingIds.has(k))
      );
      this.instances[id] = clone;
      this.activeInstanceId = id;
      this._save();
      this._emit();
      this._render();
      this._showToast('Chain forked — working on a copy.');
      return id;
    }

    chooseBranch(stepId, when) {
      const inst = this.activeInstance();
      if (!inst) return;
      inst.branch_choices[stepId] = when;
      this._save();
      this._render();
    }

    // ───────── capture & status ─────────

    // Run the step's capture rules against text; merge into instance vars
    // AND into the target board. If no rules are declared, fall back to auto-extract.
    captureFromStep(stepId, text) {
      const inst = this.activeInstance();
      if (!inst) return { vars: {}, summary: 'no active instance' };
      const chain = this.getChain(inst.chain_id);
      if (!chain) return { vars: {}, summary: 'no chain' };
      const step = chain.steps.find((s) => s.id === stepId);
      if (!step) return { vars: {}, summary: 'unknown step' };

      let captured = {};
      let summary = '';
      const declared = Array.isArray(step.capture) ? step.capture : [];

      if (declared.length) {
        for (const rule of declared) {
          const v = this._runCaptureRule(rule, text);
          if (v != null) captured[rule.var] = v;
        }
        const parts = Object.keys(captured).map((k) => `${this._summarizeShort(captured[k])} ${k.replace(/_/g, ' ')}`);
        summary = parts.length ? `Captured: ${parts.join(', ')}` : 'No matches from capture rules.';
      } else if (this._parsers) {
        const { vars, hits } = this._parsers.autoExtract(text);
        captured = vars;
        summary = this._parsers.summarize(hits);
      } else {
        summary = 'No capture rules and no parser available.';
      }

      // Persist
      Object.assign(inst.vars, captured);
      const state = inst.step_state[step.id] || {};
      state.status = STATUS.DONE;
      state.raw_output = text;
      state.captured_at = new Date().toISOString();
      state.captured = Object.keys(captured);
      inst.step_state[step.id] = state;

      // Mirror into board
      if (this.targetBoard && Object.keys(captured).length) {
        this.targetBoard.merge(captured, 'chain');
      }

      this._save();
      this._emit();
      this._render();
      return { vars: captured, summary };
    }

    _runCaptureRule(rule, text) {
      let regex;
      try { regex = new RegExp(rule.regex, rule.match === 'all' ? 'gm' : 'm'); }
      catch (_) { return null; }

      if (rule.match === 'all') {
        const out = [];
        let m;
        while ((m = regex.exec(text)) !== null) {
          if (m.index === regex.lastIndex) regex.lastIndex += 1; // prevent zero-width loops
          out.push(this._shapeMatch(m, rule));
        }
        return out.length ? out : null;
      }

      const m = regex.exec(text);
      if (!m) return null;
      return this._shapeMatch(m, rule);
    }

    _shapeMatch(m, rule) {
      if (rule.groups && typeof rule.groups === 'object') {
        const obj = {};
        for (const [k, idx] of Object.entries(rule.groups)) obj[k] = m[idx];
        return this._applyTransform(obj, rule.transform);
      }
      const raw = (m[1] != null) ? m[1] : m[0];
      return this._applyTransform(raw, rule.transform);
    }

    _applyTransform(value, transform) {
      if (transform === 'trim' && typeof value === 'string') return value.trim();
      if (transform === 'lines' && typeof value === 'string') return value.split(/\r?\n/).filter(Boolean);
      if (transform === 'json' && typeof value === 'string') {
        try { return JSON.parse(value); } catch (_) { return value; }
      }
      return value;
    }

    _summarizeShort(v) {
      if (Array.isArray(v)) return `${v.length}×`;
      if (typeof v === 'object' && v != null) return '1×';
      return '1×';
    }

    markStepStatus(stepId, status) {
      const inst = this.activeInstance();
      if (!inst) return;
      const state = inst.step_state[stepId] || {};
      state.status = status;
      inst.step_state[stepId] = state;
      this._save();
      this._render();
    }

    resetStep(stepId) {
      const inst = this.activeInstance();
      if (!inst) return;
      delete inst.step_state[stepId];
      this._save();
      this._render();
    }

    // ───────── rendering ─────────

    mount(rootEl) {
      this.rootEl = rootEl;
      this._render();
    }

    _stepStatus(inst, chain, step) {
      const explicit = (inst.step_state[step.id] || {}).status;
      if (explicit) return explicit;
      const reqs = Array.isArray(step.requires) ? step.requires : [];
      for (const r of reqs) {
        const has = inst.vars[r] != null && inst.vars[r] !== '' &&
                    !(Array.isArray(inst.vars[r]) && inst.vars[r].length === 0);
        if (!has) return STATUS.BLOCKED;
      }
      return STATUS.READY;
    }

    _resolveStepCommand(step, inst) {
      // Returns { command_text, command_name, command_id } or null.
      if (step.command_ref) {
        const cmd = this.findCommand(step.command_ref);
        if (!cmd) return null;
        return {
          command_id: cmd.id,
          command_name: cmd.name,
          command_text: renderCommand(cmd.command, step, inst.vars),
        };
      }
      if (step.inline_command) {
        return {
          command_id: null,
          command_name: step.name || step.id,
          command_text: renderCommand(step.inline_command, step, inst.vars),
        };
      }
      if (Array.isArray(step.branch)) {
        const choice = inst.branch_choices[step.id];
        const branch = step.branch.find((b) => b.when === choice) || null;
        if (!branch) return { branch: step.branch };
        if (branch.command_ref) {
          const cmd = this.findCommand(branch.command_ref);
          if (!cmd) return null;
          return {
            command_id: cmd.id,
            command_name: branch.label || cmd.name,
            command_text: renderCommand(cmd.command, step, inst.vars),
            branchChoice: choice,
          };
        }
        if (branch.inline_command) {
          return {
            command_id: null,
            command_name: branch.label || step.name || step.id,
            command_text: renderCommand(branch.inline_command, step, inst.vars),
            branchChoice: choice,
          };
        }
      }
      return null;
    }

    _render() {
      const el = this.rootEl;
      if (!el) return;

      const inst = this.activeInstance();
      if (!inst) { el.innerHTML = this._renderChainPicker(); this._wirePicker(el); return; }
      const chain = this.getChain(inst.chain_id);
      if (!chain) { el.innerHTML = `<div class="wh-empty">Chain "${esc(inst.chain_id)}" no longer exists.</div>`; return; }

      const progress = this._progress(inst);
      let html = '';
      html += `<header class="wh-chain-header">`;
      html += `<div class="wh-chain-titlebar">`;
      html += `<button class="wh-back-btn" data-action="back" title="Back to chain picker">← Chains</button>`;
      html += `<h2>${esc(chain.name)}</h2>`;
      html += `<span class="wh-chain-progress">${progress.done}/${progress.total}</span>`;
      html += `</div>`;
      if (chain.description) html += `<p class="wh-chain-desc">${esc(chain.description)}</p>`;
      html += `<div class="wh-chain-meta">`;
      html += `<span class="wh-instance-id" title="Instance id">${esc(inst.instance_id)}</span>`;
      if (chain.difficulty) html += ` <span class="wh-difficulty wh-difficulty-${esc(chain.difficulty)}">${esc(chain.difficulty)}</span>`;
      html += ` <button class="wh-link-btn" data-action="reset-instance">Reset</button>`;
      html += ` <button class="wh-link-btn" data-action="delete-instance">Delete</button>`;
      html += `</div>`;
      html += `</header>`;

      html += `<ol class="wh-timeline">`;
      chain.steps.forEach((step, idx) => {
        html += this._renderStep(inst, chain, step, idx);
      });
      html += `</ol>`;

      // Attack-tree hops: the chains that naturally follow this one.
      if (Array.isArray(chain.next_chains) && chain.next_chains.length) {
        html += `<section class="wh-chain-next-section">`;
        html += `<h3 class="wh-chain-next-title">→ Continue the attack tree</h3>`;
        html += `<ul class="wh-chain-next-list">`;
        for (const nc of chain.next_chains) {
          const target = this.getChain(nc.chain);
          if (!target) continue;
          html += `<li class="wh-chain-next-item">`;
          html += `<button class="wh-chain-next-btn" data-action="hop-to" data-chain="${esc(nc.chain)}">`;
          html += `<span class="wh-chain-next-arrow">▸</span> ${esc(target.name)}`;
          html += `</button>`;
          if (nc.when)   html += `<div class="wh-chain-next-when">when: ${esc(nc.when)}</div>`;
          if (nc.reason) html += `<div class="wh-chain-next-reason">${esc(nc.reason)}</div>`;
          html += `</li>`;
        }
        html += `</ul></section>`;
      }

      el.innerHTML = html;
      this._wireRunner(el);
    }

    _renderStep(inst, chain, step, idx) {
      const status = this._stepStatus(inst, chain, step);
      const resolved = this._resolveStepCommand(step, inst);
      const stepName = step.name || (resolved && resolved.command_name) || step.id;
      const isBranch = Array.isArray(step.branch);
      const needsBranchChoice = isBranch && !inst.branch_choices[step.id];
      const state = inst.step_state[step.id] || {};

      let html = `<li class="wh-step wh-step-${status}" data-step-id="${esc(step.id)}" data-idx="${idx}">`;
      html += `<div class="wh-step-header">`;
      html += `<span class="wh-step-marker">${idx + 1}</span>`;
      html += `<div class="wh-step-title">${esc(stepName)}</div>`;
      html += `<span class="wh-status-pill wh-status-${status}">${status}</span>`;
      html += `</div>`;

      if (step.notes) {
        html += `<div class="wh-step-notes">${esc(step.notes)}</div>`;
      }

      // Requires summary
      if (Array.isArray(step.requires) && step.requires.length) {
        html += `<div class="wh-step-requires">requires: `;
        html += step.requires.map((r) => {
          const has = inst.vars[r] != null && inst.vars[r] !== '';
          const cls = has ? 'wh-var-have' : 'wh-var-need';
          return `<span class="${cls}">${esc(r)}</span>`;
        }).join(' ');
        html += `</div>`;
      }

      if (needsBranchChoice) {
        html += `<div class="wh-branch-chooser">`;
        html += `<div class="wh-branch-prompt">Choose a path:</div>`;
        step.branch.forEach((b) => {
          const have = inst.vars[b.when] != null && inst.vars[b.when] !== '';
          html += `<button class="wh-branch-opt ${have ? 'wh-branch-have' : ''}" data-action="choose-branch" data-step="${esc(step.id)}" data-when="${esc(b.when)}">`;
          html += `${esc(b.label || b.when)} <small>(${esc(b.when)})</small>`;
          html += `</button>`;
        });
        html += `</div>`;
      } else if (resolved && resolved.command_text != null) {
        html += `<div class="wh-step-command-card">`;
        if (resolved.command_id) {
          html += `<div class="wh-step-command-meta">→ <code>${esc(resolved.command_id)}</code></div>`;
        }
        const highlighted = (window.commandManager && typeof window.commandManager.highlightPlaceholders === 'function')
          ? window.commandManager.highlightPlaceholders(resolved.command_text)
          : esc(resolved.command_text);
        html += `<pre class="wh-step-command"><code>${highlighted}</code></pre>`;
        html += `<div class="wh-step-actions">`;
        html += `<button class="wh-btn wh-btn-primary" data-action="copy" data-step="${esc(step.id)}">📋 Copy</button>`;
        html += `<button class="wh-btn" data-action="extract-toggle" data-step="${esc(step.id)}">📥 Paste &amp; extract output</button>`;
        if (status !== STATUS.DONE) html += `<button class="wh-btn wh-btn-ghost" data-action="mark-done" data-step="${esc(step.id)}">Mark done</button>`;
        if (status === STATUS.DONE) html += `<button class="wh-btn wh-btn-ghost" data-action="reset-step" data-step="${esc(step.id)}">Reset step</button>`;
        html += `<button class="wh-btn wh-btn-ghost" data-action="fork" data-idx="${idx}" title="Fork chain from this step">⑂ Fork</button>`;
        html += `</div>`;

        // Phase 6: HackTricks context (auto-populated by build-commands.js).
        if (resolved.command_id) {
          const cmd = this.findCommand(resolved.command_id);
          const ht = cmd && Array.isArray(cmd.related_hacktricks) ? cmd.related_hacktricks : null;
          if (ht && ht.length) {
            html += `<div class="wh-step-hacktricks"><div class="wh-step-hacktricks-title">📚 HackTricks</div><ul>`;
            for (const r of ht.slice(0, 4)) {
              html += `<li>• <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a></li>`;
            }
            html += `</ul></div>`;
          }
        }

        // Extract panel (collapsed by default)
        const open = state.extractOpen === true;
        html += `<div class="wh-extract-panel ${open ? 'wh-open' : ''}" data-step-extract="${esc(step.id)}">`;
        html += `<textarea class="wh-extract-textarea" data-extract-input="${esc(step.id)}" rows="6" placeholder="Paste the tool output here…"></textarea>`;
        html += `<div class="wh-extract-actions">`;
        html += `<button class="wh-btn wh-btn-primary" data-action="extract" data-step="${esc(step.id)}">⚡ Auto-extract</button>`;
        html += `<button class="wh-btn wh-btn-ghost" data-action="extract-clear" data-step="${esc(step.id)}">Clear</button>`;
        html += `</div>`;
        if (state.captured && state.captured.length) {
          html += `<div class="wh-extract-result">last capture: ${state.captured.map(esc).join(', ')}</div>`;
        }
        html += `</div>`;

        html += `</div>`;
      } else {
        html += `<div class="wh-empty-inline">No command resolved for this step (missing command_ref?).</div>`;
      }

      html += `</li>`;
      return html;
    }

    _renderChainPicker() {
      let html = '';
      const instances = this.listInstances();
      if (instances.length) {
        html += `<section class="wh-section">`;
        html += `<h3 class="wh-section-title">Active missions</h3>`;
        html += `<ul class="wh-instance-list">`;
        for (const i of instances) {
          html += `<li class="wh-instance-card" data-instance="${esc(i.instance_id)}">`;
          html += `<div class="wh-instance-card-main">`;
          html += `<div class="wh-instance-name">${esc(i.chain_name)}</div>`;
          html += `<div class="wh-instance-progress">step ${i.progress.done}/${i.progress.total} · ${esc(i.instance_id)}</div>`;
          html += `</div>`;
          html += `<div class="wh-instance-actions">`;
          html += `<button class="wh-btn wh-btn-primary" data-action="open-instance" data-instance="${esc(i.instance_id)}">Resume</button>`;
          html += `<button class="wh-btn wh-btn-ghost" data-action="delete-instance" data-instance="${esc(i.instance_id)}">Delete</button>`;
          html += `</div>`;
          html += `</li>`;
        }
        html += `</ul></section>`;
      }

      html += `<section class="wh-section">`;
      html += `<h3 class="wh-section-title">Start a new chain</h3>`;
      const chains = this.listChains();
      if (!chains.length) {
        html += `<div class="wh-empty">No chains found in <code>chains/</code>. Add a YAML file and run <code>npm run build</code>.</div>`;
      } else {
        html += `<ul class="wh-chain-list">`;
        for (const chain of chains) {
          html += `<li class="wh-chain-card">`;
          html += `<div class="wh-chain-card-main">`;
          html += `<div class="wh-chain-card-name">${esc(chain.name)}`;
          if (chain.difficulty) html += ` <span class="wh-difficulty wh-difficulty-${esc(chain.difficulty)}">${esc(chain.difficulty)}</span>`;
          html += `</div>`;
          if (chain.description) html += `<div class="wh-chain-card-desc">${esc(chain.description)}</div>`;
          if (Array.isArray(chain.tags) && chain.tags.length) {
            html += `<div class="wh-chain-card-tags">`;
            for (const t of chain.tags) html += `<span class="wh-tag">${esc(t)}</span>`;
            html += `</div>`;
          }
          html += `</div>`;
          html += `<button class="wh-btn wh-btn-primary" data-action="start-chain" data-chain="${esc(chain.id)}">Start</button>`;
          html += `</li>`;
        }
        html += `</ul>`;
      }
      html += `</section>`;
      return html;
    }

    // ───────── DOM wiring ─────────
    _wirePicker(el) {
      el.querySelectorAll('[data-action="start-chain"]').forEach((btn) => {
        btn.addEventListener('click', () => this.startChain(btn.dataset.chain));
      });
      el.querySelectorAll('[data-action="open-instance"]').forEach((btn) => {
        btn.addEventListener('click', () => this.openInstance(btn.dataset.instance));
      });
      el.querySelectorAll('[data-action="delete-instance"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (confirm('Delete this chain instance? Captured variables stay on the board.')) {
            this.deleteInstance(btn.dataset.instance);
          }
        });
      });
    }

    _wireRunner(el) {
      el.querySelectorAll('[data-action="back"]').forEach((b) => b.addEventListener('click', () => this.closeActive()));
      el.querySelectorAll('[data-action="reset-instance"]').forEach((b) => b.addEventListener('click', () => this._resetActiveInstance()));
      el.querySelectorAll('[data-action="delete-instance"]').forEach((b) => b.addEventListener('click', () => {
        const inst = this.activeInstance();
        if (inst && confirm('Delete this chain instance?')) this.deleteInstance(inst.instance_id);
      }));
      el.querySelectorAll('[data-action="choose-branch"]').forEach((b) => b.addEventListener('click', () => {
        this.chooseBranch(b.dataset.step, b.dataset.when);
      }));
      el.querySelectorAll('[data-action="copy"]').forEach((b) => b.addEventListener('click', async () => {
        const stepId = b.dataset.step;
        const text = this._currentCommandText(stepId);
        if (text == null) return;
        await this._copyText(text);
        this._showToast('Copied command to clipboard');
        this.markStepStatus(stepId, STATUS.RUNNING);
      }));
      el.querySelectorAll('[data-action="extract-toggle"]').forEach((b) => b.addEventListener('click', () => {
        const stepId = b.dataset.step;
        const inst = this.activeInstance();
        if (!inst) return;
        const state = inst.step_state[stepId] || {};
        state.extractOpen = !state.extractOpen;
        inst.step_state[stepId] = state;
        this._save();
        this._render();
        const ta = this.rootEl.querySelector(`[data-extract-input="${CSS.escape(stepId)}"]`);
        if (ta) ta.focus();
      }));
      el.querySelectorAll('[data-action="extract"]').forEach((b) => b.addEventListener('click', () => {
        const stepId = b.dataset.step;
        const ta = this.rootEl.querySelector(`[data-extract-input="${CSS.escape(stepId)}"]`);
        if (!ta) return;
        const text = ta.value;
        if (!text.trim()) { this._showToast('Paste output first', 'error'); return; }
        const { summary } = this.captureFromStep(stepId, text);
        this._showToast(summary || 'Extraction complete');
      }));
      el.querySelectorAll('[data-action="extract-clear"]').forEach((b) => b.addEventListener('click', () => {
        const ta = this.rootEl.querySelector(`[data-extract-input="${CSS.escape(b.dataset.step)}"]`);
        if (ta) { ta.value = ''; ta.focus(); }
      }));
      el.querySelectorAll('[data-action="mark-done"]').forEach((b) => b.addEventListener('click', () => this.markStepStatus(b.dataset.step, STATUS.DONE)));
      el.querySelectorAll('[data-action="reset-step"]').forEach((b) => b.addEventListener('click', () => this.resetStep(b.dataset.step)));
      el.querySelectorAll('[data-action="fork"]').forEach((b) => b.addEventListener('click', () => this.forkAt(parseInt(b.dataset.idx, 10))));
      el.querySelectorAll('[data-action="hop-to"]').forEach((b) => b.addEventListener('click', () => this.startChain(b.dataset.chain)));
    }

    _currentCommandText(stepId) {
      const inst = this.activeInstance();
      if (!inst) return null;
      const chain = this.getChain(inst.chain_id);
      if (!chain) return null;
      const step = chain.steps.find((s) => s.id === stepId);
      if (!step) return null;
      const r = this._resolveStepCommand(step, inst);
      return r ? r.command_text : null;
    }

    _resetActiveInstance() {
      const inst = this.activeInstance();
      if (!inst) return;
      if (!confirm('Reset all step state for this instance? Captured vars on the board stay.')) return;
      inst.step_state = {};
      inst.branch_choices = {};
      this._save();
      this._render();
    }

    // Hotkey helpers — used by MissionControl bindings.
    copyCurrent() {
      const cur = this.currentStep();
      if (!cur) return false;
      const text = this._currentCommandText(cur.step.id);
      if (text == null) return false;
      this._copyText(text);
      this.markStepStatus(cur.step.id, STATUS.RUNNING);
      this._showToast('Copied current step');
      return true;
    }
    openExtractForCurrent() {
      const cur = this.currentStep();
      if (!cur) return false;
      const state = cur.instance.step_state[cur.step.id] || {};
      state.extractOpen = true;
      cur.instance.step_state[cur.step.id] = state;
      this._save();
      this._render();
      const ta = this.rootEl && this.rootEl.querySelector(`[data-extract-input="${CSS.escape(cur.step.id)}"]`);
      if (ta) ta.focus();
      return true;
    }
    async pasteIntoCurrent() {
      const cur = this.currentStep();
      if (!cur) return false;
      try {
        const text = await navigator.clipboard.readText();
        const state = cur.instance.step_state[cur.step.id] || {};
        state.extractOpen = true;
        cur.instance.step_state[cur.step.id] = state;
        this._save();
        this._render();
        const ta = this.rootEl && this.rootEl.querySelector(`[data-extract-input="${CSS.escape(cur.step.id)}"]`);
        if (ta) { ta.value = text; ta.focus(); }
        return true;
      } catch (_) {
        this._showToast('Could not read clipboard', 'error');
        return false;
      }
    }
    extractCurrent() {
      const cur = this.currentStep();
      if (!cur) return false;
      const ta = this.rootEl && this.rootEl.querySelector(`[data-extract-input="${CSS.escape(cur.step.id)}"]`);
      if (!ta || !ta.value.trim()) { this._showToast('Open paste panel and paste output first', 'error'); return false; }
      const { summary } = this.captureFromStep(cur.step.id, ta.value);
      this._showToast(summary || 'Extracted');
      return true;
    }
  }

  ChainRunner.STATUS = STATUS;
  ChainRunner.substituteVars = substituteVars;
  ChainRunner.renderCommand = renderCommand;
  window.WannaChainRunner = ChainRunner;
})();
