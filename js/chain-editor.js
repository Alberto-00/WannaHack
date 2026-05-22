// WannaHack - Chain Editor (Drawflow-based)
// Visual authoring of chain YAML files. The YAML is the source of truth — this
// editor is a convenience layer that can both export to YAML and import an
// existing chain back into the canvas.
//
// Graph model:
//   * Each node = a chain step. node.data carries { command_id, step_id,
//     step_name, notes, requires[], inputs{}, capture[] }.
//   * Each edge = "this step's captured vars are needed by that step".
//     The chain runner doesn't read edges directly — they translate to
//     `requires` arrays on the downstream step (variable names = capture vars
//     declared upstream).

(function () {
  'use strict';

  const drawflowEl = document.getElementById('drawflow');
  if (!drawflowEl || typeof Drawflow === 'undefined') {
    console.error('[chain-editor] Drawflow not loaded');
    return;
  }
  const editor = new Drawflow(drawflowEl);
  editor.reroute = true;
  editor.start();

  const COMMANDS = (window.COMMAND_DATA && Array.isArray(window.COMMAND_DATA.commands)) ? window.COMMAND_DATA.commands : [];
  const CHAINS   = (window.CHAIN_DATA && Array.isArray(window.CHAIN_DATA.chains))     ? window.CHAIN_DATA.chains   : [];

  // ──────────────────────── helpers ────────────────────────
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function findCommand(id) { return COMMANDS.find((c) => c.id === id) || null; }

  function nodeHtml(commandId, stepId, stepName) {
    return `<div class="ce-node"><div class="ce-node-title">${esc(stepName || stepId || commandId)}</div><div class="ce-node-meta">→ ${esc(commandId || '(inline)')}</div></div>`;
  }

  function defaultStepId(commandId, existingIds) {
    const base = (commandId || 'step').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    let candidate = base;
    let i = 1;
    while (existingIds.has(candidate)) { candidate = `${base}-${++i}`; }
    return candidate;
  }

  function allStepIds() {
    const ids = new Set();
    const home = editor.drawflow.drawflow.Home.data;
    for (const id of Object.keys(home)) {
      const data = home[id].data || {};
      if (data.step_id) ids.add(data.step_id);
    }
    return ids;
  }

  // ──────────────────────── palette ────────────────────────
  function renderPalette(filter = '') {
    const list = document.getElementById('ce-palette-list');
    if (!list) return;
    const groups = {};
    const q = filter.trim().toLowerCase();
    for (const cmd of COMMANDS) {
      if (q) {
        const hay = `${cmd.id} ${cmd.name} ${(cmd.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      const cat = cmd.category || 'misc';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    }
    let html = '';
    for (const [cat, cmds] of Object.entries(groups)) {
      html += `<div class="ce-palette-cat"><h4>${esc(cat)}</h4>`;
      for (const c of cmds.slice(0, 60)) {
        html += `<div class="ce-palette-item" draggable="true" data-cmd-id="${esc(c.id)}">${esc(c.name)}<span class="ce-palette-item-id">${esc(c.id)}</span></div>`;
      }
      if (cmds.length > 60) html += `<div class="ce-empty" style="padding:4px;">+${cmds.length - 60} hidden — narrow your filter</div>`;
      html += `</div>`;
    }
    if (!Object.keys(groups).length) html = `<div class="ce-empty">No commands match.</div>`;
    list.innerHTML = html;

    list.querySelectorAll('.ce-palette-item').forEach((el) => {
      el.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/plain', el.dataset.cmdId);
        ev.dataTransfer.effectAllowed = 'copy';
      });
    });
  }
  renderPalette();
  document.getElementById('ce-palette-search').addEventListener('input', (e) => renderPalette(e.target.value));

  // ──────────────────────── canvas drag-drop ────────────────────────
  drawflowEl.addEventListener('dragover', (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; });
  drawflowEl.addEventListener('drop', (ev) => {
    ev.preventDefault();
    const commandId = ev.dataTransfer.getData('text/plain');
    if (!commandId) return;
    const cmd = findCommand(commandId);
    if (!cmd) return;
    const rect = drawflowEl.getBoundingClientRect();
    const x = (ev.clientX - rect.left - editor.canvas_x) / editor.zoom;
    const y = (ev.clientY - rect.top  - editor.canvas_y) / editor.zoom;
    const stepId = defaultStepId(commandId, allStepIds());
    const data = {
      command_id: commandId,
      step_id: stepId,
      step_name: cmd.name,
      notes: '',
      requires: [],
      inputs: {},
      capture: [],
    };
    editor.addNode(
      stepId,                 // name
      1,                      // inputs
      1,                      // outputs
      x, y,
      'wh-step',              // class
      data,
      nodeHtml(commandId, stepId, cmd.name)
    );
  });

  // ──────────────────────── selection / inspector ────────────────────────
  let selectedNodeId = null;
  editor.on('nodeSelected', (id) => { selectedNodeId = id; renderInspector(); });
  editor.on('nodeUnselected', () => { selectedNodeId = null; renderInspector(); });
  editor.on('nodeRemoved', () => { selectedNodeId = null; renderInspector(); });

  function getNode(id) { return editor.getNodeFromId(id); }
  function setNodeData(id, patch) {
    const n = getNode(id);
    if (!n) return;
    const merged = Object.assign({}, n.data || {}, patch);
    editor.updateNodeDataFromId(id, merged);
    const newHtml = nodeHtml(merged.command_id, merged.step_id, merged.step_name);
    editor.drawflow.drawflow.Home.data[id].html = newHtml;
    // Force re-render of node title/meta. Drawflow doesn't expose a redraw, so
    // we mutate the live DOM directly.
    const el = document.getElementById(`node-${id}`);
    if (el) {
      const content = el.querySelector('.drawflow_content_node');
      if (content) content.innerHTML = newHtml;
    }
  }

  function renderInspector() {
    const box = document.getElementById('ce-step-inspector');
    if (!box) return;
    if (!selectedNodeId) {
      box.innerHTML = `<div class="ce-empty">Click a node on the canvas to edit its capture/requires/inputs.</div>`;
      return;
    }
    const n = getNode(selectedNodeId);
    if (!n) { box.innerHTML = `<div class="ce-empty">Selection lost.</div>`; return; }
    const d = n.data || {};
    const cmd = findCommand(d.command_id);
    const placeholders = cmd ? Array.from(new Set((cmd.command || '').match(/<([^<>\s]+)>/g) || []).values()).map((s) => s.slice(1, -1)) : [];

    let html = '';
    html += field('Step ID', `<input type="text" id="ce-si-stepid" value="${esc(d.step_id || '')}" autocomplete="off">`);
    html += field('Display name', `<input type="text" id="ce-si-stepname" value="${esc(d.step_name || '')}" autocomplete="off">`);
    html += field('Notes', `<textarea id="ce-si-notes" rows="3">${esc(d.notes || '')}</textarea>`);
    html += field('Requires (comma-separated var names)', `<input type="text" id="ce-si-requires" value="${esc((d.requires || []).join(', '))}" autocomplete="off">`);

    if (placeholders.length) {
      html += `<label style="display:block;font-size:0.7em;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted,#6e7681);margin:8px 0 3px 0;">Inputs (placeholder → ${'$'}{var})</label>`;
      for (const ph of placeholders) {
        const v = (d.inputs && d.inputs[ph]) || '';
        html += `<div style="display:flex;gap:4px;margin-bottom:3px;"><span style="font-size:0.75em;color:var(--accent-info,#1e90ff);min-width:90px;padding-top:6px;"><code>&lt;${esc(ph)}&gt;</code></span><input type="text" data-input-key="${esc(ph)}" value="${esc(v)}" placeholder="\${var_name} or literal" style="flex:1;background:var(--bg-elevated,#21262d);border:1px solid var(--border-default,#30363d);color:var(--text-primary,#c9d1d9);padding:4px 6px;border-radius:3px;font-family:inherit;font-size:0.8em;"></div>`;
      }
    } else {
      html += `<div class="ce-helper">Command has no placeholders.</div>`;
    }

    // Capture rules
    html += `<label style="display:block;font-size:0.7em;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted,#6e7681);margin:10px 0 3px 0;">Captures</label>`;
    if (!(d.capture || []).length) html += `<div class="ce-helper">No capture rules. Add one to extract variables from this step's output.</div>`;
    (d.capture || []).forEach((cap, idx) => {
      html += `<div style="border:1px dashed var(--border-default,#30363d);border-radius:4px;padding:6px;margin-bottom:6px;">`;
      html += `<div style="display:flex;gap:4px;margin-bottom:3px;"><input type="text" data-cap-idx="${idx}" data-cap-field="var" value="${esc(cap.var || '')}" placeholder="var_name" style="flex:1;background:var(--bg-elevated,#21262d);border:1px solid var(--border-default,#30363d);color:var(--text-primary,#c9d1d9);padding:4px 6px;border-radius:3px;font-family:inherit;font-size:0.8em;"><select data-cap-idx="${idx}" data-cap-field="match" style="background:var(--bg-elevated,#21262d);border:1px solid var(--border-default,#30363d);color:var(--text-primary,#c9d1d9);padding:4px;border-radius:3px;font-family:inherit;font-size:0.8em;"><option value="first" ${cap.match === 'first' || !cap.match ? 'selected' : ''}>first</option><option value="all" ${cap.match === 'all' ? 'selected' : ''}>all</option></select><button type="button" data-cap-remove="${idx}" style="background:transparent;border:0;color:var(--accent-primary,#ff4757);cursor:pointer;">×</button></div>`;
      html += `<input type="text" data-cap-idx="${idx}" data-cap-field="regex" value="${esc(cap.regex || '')}" placeholder="regex pattern" style="width:100%;box-sizing:border-box;background:var(--bg-elevated,#21262d);border:1px solid var(--border-default,#30363d);color:var(--text-primary,#c9d1d9);padding:4px 6px;border-radius:3px;font-family:inherit;font-size:0.8em;">`;
      html += `</div>`;
    });
    html += `<button type="button" id="ce-cap-add" class="ce-btn" style="font-size:0.75em;padding:4px 10px;">+ Add capture</button>`;

    html += `<div style="margin-top:14px;text-align:right;"><button type="button" id="ce-step-delete" class="ce-btn" style="font-size:0.75em;color:var(--accent-primary,#ff4757);border-color:var(--accent-primary,#ff4757);">Delete step</button></div>`;

    box.innerHTML = html;
    wireInspector(selectedNodeId);
  }

  function field(label, inputHtml) {
    return `<div class="ce-field"><label>${esc(label)}</label>${inputHtml}</div>`;
  }

  function wireInspector(nodeId) {
    const box = document.getElementById('ce-step-inspector');
    const apply = () => {
      const n = getNode(nodeId);
      if (!n) return;
      const data = Object.assign({}, n.data);
      data.step_id   = box.querySelector('#ce-si-stepid').value.trim() || data.step_id;
      data.step_name = box.querySelector('#ce-si-stepname').value;
      data.notes     = box.querySelector('#ce-si-notes').value;
      data.requires  = box.querySelector('#ce-si-requires').value.split(',').map((s) => s.trim()).filter(Boolean);
      data.inputs    = {};
      box.querySelectorAll('[data-input-key]').forEach((el) => {
        const k = el.dataset.inputKey;
        const v = el.value.trim();
        if (v) data.inputs[k] = v;
      });
      const caps = [];
      box.querySelectorAll('[data-cap-idx]').forEach((el) => {
        const idx = parseInt(el.dataset.capIdx, 10);
        const field = el.dataset.capField;
        if (!caps[idx]) caps[idx] = { var: '', regex: '', match: 'first' };
        caps[idx][field] = el.value;
      });
      data.capture = caps.filter((c) => c.var && c.regex);
      setNodeData(nodeId, data);
    };
    box.querySelectorAll('input, textarea, select').forEach((el) => el.addEventListener('change', apply));
    const addBtn = box.querySelector('#ce-cap-add');
    if (addBtn) addBtn.addEventListener('click', () => {
      const n = getNode(nodeId);
      const data = Object.assign({}, n.data);
      data.capture = (data.capture || []).concat([{ var: '', regex: '', match: 'first' }]);
      setNodeData(nodeId, data);
      renderInspector();
    });
    box.querySelectorAll('[data-cap-remove]').forEach((b) => b.addEventListener('click', () => {
      const idx = parseInt(b.dataset.capRemove, 10);
      const n = getNode(nodeId);
      const data = Object.assign({}, n.data);
      data.capture = (data.capture || []).filter((_, i) => i !== idx);
      setNodeData(nodeId, data);
      renderInspector();
    }));
    const delBtn = box.querySelector('#ce-step-delete');
    if (delBtn) delBtn.addEventListener('click', () => {
      if (!confirm('Delete this step?')) return;
      editor.removeNodeId(`node-${nodeId}`);
      selectedNodeId = null;
      renderInspector();
    });
  }

  // ──────────────────────── graph ⇄ chain adapters ────────────────────────
  function graphToChain() {
    const home = editor.drawflow.drawflow.Home.data;
    const nodeIds = Object.keys(home);
    // Topological-ish order: input-less first, then BFS via outputs.
    const incoming = {};
    for (const id of nodeIds) incoming[id] = 0;
    for (const id of nodeIds) {
      const n = home[id];
      for (const out of Object.values(n.outputs || {})) {
        for (const conn of out.connections || []) {
          if (incoming[conn.node] != null) incoming[conn.node] += 1;
        }
      }
    }
    const order = [];
    const queue = nodeIds.filter((id) => incoming[id] === 0);
    while (queue.length) {
      const id = queue.shift();
      order.push(id);
      const n = home[id];
      for (const out of Object.values(n.outputs || {})) {
        for (const conn of out.connections || []) {
          incoming[conn.node] -= 1;
          if (incoming[conn.node] === 0) queue.push(conn.node);
        }
      }
    }
    // Append unreachable cycles deterministically.
    for (const id of nodeIds) if (!order.includes(id)) order.push(id);

    const steps = order.map((id) => {
      const data = home[id].data || {};
      const step = { id: data.step_id || id };
      if (data.step_name) step.name = data.step_name;
      if (data.notes) step.notes = data.notes;
      if (data.command_id) step.command_ref = data.command_id;
      if (data.requires && data.requires.length) step.requires = data.requires;
      if (data.inputs && Object.keys(data.inputs).length) step.inputs = data.inputs;
      if (data.capture && data.capture.length) {
        step.capture = data.capture.map((c) => {
          const out = { var: c.var, regex: c.regex };
          if (c.match) out.match = c.match;
          return out;
        });
      }
      return step;
    });

    const chain = {
      id: document.getElementById('ce-chain-id').value.trim() || 'untitled-chain',
      name: document.getElementById('ce-chain-name').value.trim() || 'Untitled chain',
      description: document.getElementById('ce-chain-desc').value.trim() || 'TODO: describe what this chain accomplishes.',
    };
    const tags = document.getElementById('ce-chain-tags').value.split(',').map((s) => s.trim()).filter(Boolean);
    if (tags.length) chain.tags = tags;
    const diff = document.getElementById('ce-chain-difficulty').value;
    if (diff) chain.difficulty = diff;
    chain.steps = steps;
    return chain;
  }

  function chainToGraph(chain) {
    editor.clear();
    document.getElementById('ce-chain-id').value = chain.id || '';
    document.getElementById('ce-chain-name').value = chain.name || '';
    document.getElementById('ce-chain-desc').value = chain.description || '';
    document.getElementById('ce-chain-tags').value = (chain.tags || []).join(', ');
    document.getElementById('ce-chain-difficulty').value = chain.difficulty || '';

    const idMap = {};
    (chain.steps || []).forEach((step, idx) => {
      const x = 80 + (idx % 3) * 260;
      const y = 80 + Math.floor(idx / 3) * 180;
      const cmd = findCommand(step.command_ref);
      const data = {
        command_id: step.command_ref || null,
        step_id: step.id,
        step_name: step.name || (cmd && cmd.name) || step.id,
        notes: step.notes || '',
        requires: step.requires || [],
        inputs: step.inputs || {},
        capture: step.capture || [],
      };
      const dfId = editor.addNode(step.id, 1, 1, x, y, 'wh-step', data,
        nodeHtml(data.command_id, data.step_id, data.step_name));
      idMap[step.id] = dfId;
    });

    // Best-effort edge inference: connect each step whose `requires` overlap
    // with an upstream step's capture vars. Strictly visual — runtime doesn't
    // need edges to compute readiness.
    const capturesByNode = {};
    (chain.steps || []).forEach((step) => {
      capturesByNode[step.id] = new Set((step.capture || []).map((c) => c.var));
    });
    (chain.steps || []).forEach((step) => {
      const reqs = step.requires || [];
      if (!reqs.length) return;
      for (const other of chain.steps) {
        if (other.id === step.id) continue;
        const caps = capturesByNode[other.id];
        if (!caps || !caps.size) continue;
        const overlap = reqs.some((r) => caps.has(r));
        if (overlap) {
          try {
            editor.addConnection(idMap[other.id], idMap[step.id], 'output_1', 'input_1');
          } catch (_) { /* tolerate duplicates */ }
        }
      }
    });
  }

  // ──────────────────────── YAML I/O ────────────────────────
  const modal = document.getElementById('ce-yaml-modal');
  const yamlText = document.getElementById('ce-yaml-text');
  const yamlTitle = document.getElementById('ce-yaml-title');
  const loadBtn = document.getElementById('ce-yaml-load');

  function openModal(mode, text) {
    yamlText.value = text || '';
    yamlTitle.textContent = mode === 'import' ? 'Import YAML' : 'Export YAML';
    loadBtn.style.display = mode === 'import' ? 'inline-block' : 'none';
    modal.classList.add('open');
    setTimeout(() => yamlText.focus(), 50);
  }
  function closeModal() { modal.classList.remove('open'); }

  document.getElementById('ce-export').addEventListener('click', () => {
    const chain = graphToChain();
    const yaml = jsyaml.dump(chain, { lineWidth: 100, noRefs: true });
    openModal('export', yaml);
  });
  document.getElementById('ce-import').addEventListener('click', () => openModal('import', ''));
  document.getElementById('ce-yaml-close').addEventListener('click', closeModal);
  document.getElementById('ce-yaml-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(yamlText.value); document.getElementById('ce-yaml-copy').textContent = '✅ Copied'; setTimeout(() => document.getElementById('ce-yaml-copy').textContent = '📋 Copy', 1500); }
    catch (e) { alert('Clipboard write failed — select the text and copy manually.'); }
  });
  loadBtn.addEventListener('click', () => {
    try {
      const data = jsyaml.load(yamlText.value);
      if (!data || typeof data !== 'object') throw new Error('YAML must be a mapping');
      if (!Array.isArray(data.steps)) throw new Error('Missing steps[]');
      chainToGraph(data);
      closeModal();
    } catch (e) { alert('Invalid YAML: ' + e.message); }
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // ──────────────────────── new / quickstart ────────────────────────
  document.getElementById('ce-new').addEventListener('click', () => {
    if (Object.keys(editor.drawflow.drawflow.Home.data).length && !confirm('Clear current graph?')) return;
    editor.clear();
    document.getElementById('ce-chain-id').value = '';
    document.getElementById('ce-chain-name').value = '';
    document.getElementById('ce-chain-desc').value = '';
    document.getElementById('ce-chain-tags').value = '';
    document.getElementById('ce-chain-difficulty').value = '';
    selectedNodeId = null;
    renderInspector();
  });

  // ──────────────────────── deep-link: ?chain=<id> preload ────────────────────────
  (function preloadFromURL() {
    const params = new URLSearchParams(location.search);
    const id = params.get('chain');
    if (!id) return;
    const chain = CHAINS.find((c) => c.id === id);
    if (chain) chainToGraph(chain);
  })();

})();
