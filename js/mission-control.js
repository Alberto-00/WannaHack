// WannaHack - MissionControl
// Orchestrates the new UI on top of the existing CommandManager (js/app.js).
// Mounts after CommandManager is constructed, sets up:
//   * mode switcher pill (Commands / Chain) in the topbar
//   * a fixed Target Board on the left (always visible)
//   * a Chain workspace pane (shown when mode === 'chain', overlays the builder)
//   * a Next Moves panel on the right (collapsible)
//   * hotkey bindings on top of the global HotkeyManager
//
// We keep the existing Commands-mode layout intact so users who only want the
// search/copy flow get exactly what they always had — the Mission Control
// chrome is additive.

(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const MODE_COMMANDS = 'commands';
  const MODE_CHAIN = 'chain';
  const MODE_HACKTRICKS = 'hacktricks';

  class MissionControl {
    constructor(cm) {
      this.cm = cm; // existing CommandManager instance
      this.mode = MODE_COMMANDS;
      this.boardCollapsed = false;
      this.nextMovesCollapsed = false;

      const storageKeyFn = (s) => cm._storageKey(s);
      const showToast = (msg, type) => cm.showToast(msg, type);
      const copyText = async (text) => {
        try { await navigator.clipboard.writeText(text); }
        catch (e) { showToast('Clipboard write failed', 'error'); throw e; }
      };

      this.board = new window.WannaTargetBoard(storageKeyFn);
      this.board.load(cm.targetContext);
      // Also keep the TargetBoard in sync when context bar values change.
      const origSave = cm.saveTargetContext ? cm.saveTargetContext.bind(cm) : null;
      if (origSave) {
        cm.saveTargetContext = () => {
          origSave();
          this.board.load(cm.targetContext);
        };
      }

      this.chainRunner = new window.WannaChainRunner({
        targetBoard: this.board,
        storageKeyFn,
        copyText,
        showToast,
        parsers: window.WannaOutputParsers,
      });

      this.nextMoves = new window.WannaNextMoves({
        targetBoard: this.board,
        chainRunner: this.chainRunner,
      });

      this.pivotMenu = new window.WannaPivotMenu({
        chainRunner: this.chainRunner,
        onCommandSelect: (id) => this._jumpToCommand(id),
      });

      this.guided = new window.WannaGuidedStart({
        targetBoard: this.board,
        nextMoves: this.nextMoves,
        chainRunner: this.chainRunner,
        parsers: window.WannaOutputParsers,
        storageKeyFn,
        showToast,
      });

      // Lazy HackTricks search (loads its 1MB index only when the tab is opened).
      this.hacktricks = window.WannaHacktricksSearch ? new window.WannaHacktricksSearch() : null;

      // Append-only event log for the writeup export.
      this.missionLog = window.WannaMissionLog ? new window.WannaMissionLog(storageKeyFn) : null;
      if (this.missionLog) {
        this.board.on(() => {
          // No-op for now: would log var changes here if we want every captured
          // variable individually. ChainRunner already records step.done events.
        });
        this.chainRunner.on(() => {
          // Snapshot active step status into the log on every state change so
          // the export reflects the latest run.
          const cur = this.chainRunner.currentStep();
          if (cur) this.missionLog.record('step.tick', { chain: cur.chain.id, step: cur.step.id });
        });
      }

      // Re-render dependent panes on state change.
      this.board.on(() => { this._renderBoard(); this._renderNextMoves(); });
      this.chainRunner.on(() => { /* runner re-renders itself; nothing else needed here */ });

      this._injectShell();
      this._registerHotkeys();

      // Initial paint
      this._renderBoard();
      this._renderNextMoves();
      this.setMode(MODE_COMMANDS);

      // Maybe show guided start on first profile use.
      setTimeout(() => this.guided.maybeAutoOpen(), 400);
    }

    setMode(mode) {
      this.mode = mode;
      const container = document.querySelector('.container');
      if (container) {
        container.classList.toggle('wh-mode-chain',      mode === MODE_CHAIN);
        container.classList.toggle('wh-mode-commands',   mode === MODE_COMMANDS);
        container.classList.toggle('wh-mode-hacktricks', mode === MODE_HACKTRICKS);
      }
      // Mirror onto body so the CSS overrides (which gate Target Board / Next
      // Moves visibility per mode) match what the user actually selected.
      document.body.classList.toggle('wh-mode-chain',      mode === MODE_CHAIN);
      document.body.classList.toggle('wh-mode-commands',   mode === MODE_COMMANDS);
      document.body.classList.toggle('wh-mode-hacktricks', mode === MODE_HACKTRICKS);
      const chainPane = document.getElementById('wh-chain-pane');
      const htPane = document.getElementById('wh-ht-pane');
      const mainContent = document.querySelector('.main-content');
      if (chainPane) chainPane.style.display = mode === MODE_CHAIN ? 'flex' : 'none';
      if (htPane)    htPane.style.display    = mode === MODE_HACKTRICKS ? 'flex' : 'none';
      if (mainContent) mainContent.style.display = mode === MODE_COMMANDS ? '' : 'none';
      this._renderModeSwitcher();
      if (mode === MODE_CHAIN) {
        const root = document.getElementById('wh-chain-root');
        if (root) this.chainRunner.mount(root);
      } else if (mode === MODE_HACKTRICKS && this.hacktricks) {
        const root = document.getElementById('wh-ht-root');
        if (root) this.hacktricks.mount(root);
      }
    }

    reloadFromProfile() {
      this.board.load(this.cm.targetContext);
      this.chainRunner.reloadFromProfile();
      this._renderBoard();
      this._renderNextMoves();
      if (this.mode === MODE_CHAIN) {
        const root = document.getElementById('wh-chain-root');
        if (root) this.chainRunner.mount(root);
      }
    }

    // ───────────────────── DOM scaffolding ─────────────────────

    _injectShell() {
      // Mode switcher: top strip ABOVE the .container so it survives when the
      // chain/hacktricks pane replaces .main-content.
      const switcher = document.createElement('div');
      switcher.id = 'wh-mode-switcher';
      switcher.className = 'wh-mode-switcher';
      switcher.innerHTML = `
        <button class="wh-mode-btn wh-mode-active" data-mode="${MODE_COMMANDS}">📚 Commands</button>
        <button class="wh-mode-btn" data-mode="${MODE_CHAIN}">🔗 Chain</button>
        <button class="wh-mode-btn" data-mode="${MODE_HACKTRICKS}">📘 HackTricks</button>
        <button class="wh-mode-aux" data-action="guided" title="Start a guided mission (g)">🚀 Start mission</button>
        <button class="wh-mode-aux" data-action="writeup" title="Export mission writeup (Markdown)">📝 Writeup</button>
        <button class="wh-mode-aux" data-action="help" title="Keyboard shortcuts (?)">⌨</button>
      `;
      const container = document.querySelector('.container');
      if (container) document.body.insertBefore(switcher, container);
      else document.body.insertBefore(switcher, document.body.firstChild);
      switcher.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode)));
      switcher.querySelector('[data-action="guided"]').addEventListener('click', () => this.guided.open());
      switcher.querySelector('[data-action="writeup"]').addEventListener('click', () => {
        if (this.missionLog) this.missionLog.downloadMarkdown({ targetBoard: this.board, chainRunner: this.chainRunner });
      });
      switcher.querySelector('[data-action="help"]').addEventListener('click', () => {
        if (window.WannaHotkeys) window.WannaHotkeys.toggleHelp();
      });

      // Target Board panel — fixed right column, always visible.
      const board = document.createElement('aside');
      board.id = 'wh-board-pane';
      board.className = 'wh-board-pane';
      board.innerHTML = `
        <header class="wh-board-header">
          <div class="wh-board-title">🎯 Target Board</div>
          <button class="wh-board-toggle" data-action="board-collapse" title="Collapse">◀</button>
        </header>
        <div id="wh-board-body" class="wh-board-body"></div>
        <footer class="wh-board-footer">
          <button class="wh-link-btn" data-action="board-clear" title="Remove all chain-captured vars (manual entries kept)">Clear captured</button>
        </footer>
      `;
      document.body.appendChild(board);
      board.querySelector('[data-action="board-collapse"]').addEventListener('click', () => this._toggleBoard());
      board.querySelector('[data-action="board-clear"]').addEventListener('click', () => {
        if (confirm('Remove all captured chain variables from the board?')) {
          // Only clear chain-source vars; keep manual/context entries.
          for (const [name, source] of Object.entries(this.board.sources)) {
            if (source === 'chain') this.board.remove(name);
          }
        }
      });

      // Next Moves panel — bottom right, smaller.
      const nm = document.createElement('aside');
      nm.id = 'wh-nextmoves-pane';
      nm.className = 'wh-nextmoves-pane';
      nm.innerHTML = `<div id="wh-nextmoves-body" class="wh-nextmoves-body"></div>`;
      document.body.appendChild(nm);

      // Chain workspace pane — sibling of .main-content; hidden by default.
      const chainPane = document.createElement('section');
      chainPane.id = 'wh-chain-pane';
      chainPane.className = 'wh-chain-pane';
      chainPane.innerHTML = `<div id="wh-chain-root" class="wh-chain-root"></div>`;
      const container = document.querySelector('.container');
      if (container) container.appendChild(chainPane);
      chainPane.style.display = 'none';

      // HackTricks workspace pane — sibling of .main-content; hidden by default.
      const htPane = document.createElement('section');
      htPane.id = 'wh-ht-pane';
      htPane.className = 'wh-ht-pane';
      htPane.innerHTML = `<div id="wh-ht-root" class="wh-ht-root"></div>`;
      if (container) container.appendChild(htPane);
      htPane.style.display = 'none';
    }

    _renderModeSwitcher() {
      document.querySelectorAll('#wh-mode-switcher [data-mode]').forEach((b) => {
        b.classList.toggle('wh-mode-active', b.dataset.mode === this.mode);
      });
    }

    _toggleBoard() {
      this.boardCollapsed = !this.boardCollapsed;
      const board = document.getElementById('wh-board-pane');
      if (board) board.classList.toggle('wh-board-collapsed', this.boardCollapsed);
      const btn = board && board.querySelector('[data-action="board-collapse"]');
      if (btn) btn.textContent = this.boardCollapsed ? '▶' : '◀';
    }

    // ───────────────────── render: Target Board ─────────────────────

    _renderBoard() {
      const body = document.getElementById('wh-board-body');
      if (!body) return;
      const buckets = this.board.byBucket();
      const buckOrder = [
        ['intel',  '🟡 Intel'],
        ['loot',   '🟢 Loot'],
        ['shells', '🔵 Shells'],
        ['misc',   '⚪ Misc'],
      ];
      let html = '';
      let anything = false;
      for (const [key, label] of buckOrder) {
        const items = buckets[key] || [];
        if (!items.length) continue;
        anything = true;
        html += `<section class="wh-board-bucket wh-board-bucket-${key}"><h4>${esc(label)}</h4><ul>`;
        for (const it of items) {
          html += `<li class="wh-board-item" data-var="${esc(it.name)}" title="Click for pivot menu">`;
          html += `<div class="wh-board-item-row">`;
          html += `<span class="wh-board-item-name">${esc(it.label)}</span>`;
          html += `<button class="wh-board-item-remove" data-action="board-remove" data-var="${esc(it.name)}" title="Remove">×</button>`;
          html += `</div>`;
          html += `<div class="wh-board-item-value">${esc(it.summary)}</div>`;
          html += `</li>`;
        }
        html += `</ul></section>`;
      }
      if (!anything) {
        html = `<div class="wh-empty wh-empty-board">Empty — start a mission (<kbd>g</kbd>) to populate.</div>`;
      }
      body.innerHTML = html;
      body.querySelectorAll('.wh-board-item').forEach((el) => {
        el.addEventListener('click', (e) => {
          if (e.target.matches('[data-action="board-remove"]')) return;
          const name = el.dataset.var;
          const value = this.board.get(name);
          this.pivotMenu.open(name, window.WannaTargetBoard.summarize(value));
        });
      });
      body.querySelectorAll('[data-action="board-remove"]').forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.board.remove(b.dataset.var);
      }));
    }

    // ───────────────────── render: Next Moves ─────────────────────
    _renderNextMoves() {
      const body = document.getElementById('wh-nextmoves-body');
      if (!body) return;
      this.nextMoves.renderTo(body);
    }

    // ───────────────────── hotkeys ─────────────────────
    _registerHotkeys() {
      if (!window.WannaHotkeys) return;
      const hk = window.WannaHotkeys;
      // Global
      hk.register('g', () => this.guided.open(), { scope: 'global', description: 'Start guided mission' });
      hk.register('m', () => this.setMode(this.mode === MODE_CHAIN ? MODE_COMMANDS : MODE_CHAIN), { scope: 'global', description: 'Toggle Commands ⇄ Chain mode' });
      // Chain scope
      hk.register('c', () => this.chainRunner.copyCurrent(), { scope: 'chain', description: 'Copy current step command' });
      hk.register('p', () => this.chainRunner.pasteIntoCurrent(), { scope: 'chain', description: 'Paste clipboard into current step' });
      hk.register('x', () => this.chainRunner.extractCurrent(), { scope: 'chain', description: 'Run auto-extract on current step' });
      hk.register('n', () => {
        // "Next" = mark current as done if still pending.
        const cur = this.chainRunner.currentStep();
        if (cur) this.chainRunner.markStepStatus(cur.step.id, window.WannaChainRunner.STATUS.DONE);
      }, { scope: 'chain', description: 'Mark current step done & advance' });
      hk.register('o', () => this.chainRunner.openExtractForCurrent(), { scope: 'chain', description: 'Open output paste panel' });

      // Activate the chain scope when mode is chain.
      const origSetMode = this.setMode.bind(this);
      this.setMode = (mode) => {
        origSetMode(mode);
        hk.setScope(mode === MODE_CHAIN ? 'chain' : 'global');
      };
    }

    // ───────────────────── helpers ─────────────────────
    _jumpToCommand(id) {
      this.setMode(MODE_COMMANDS);
      if (this.cm && typeof this.cm.selectCommandById === 'function') {
        this.cm.selectCommandById(id);
      } else {
        location.hash = `#${id}`;
      }
    }
  }

  window.WannaMissionControl = MissionControl;
})();
