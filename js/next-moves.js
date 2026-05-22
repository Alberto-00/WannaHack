// WannaHack - NextMoves
// Given the current TargetBoard state, score chains / commands / hacktricks
// pages for relevance and surface the top picks. Used by the right panel of
// Mission Control and by GuidedStart's "what should I try" pass.
//
// Heuristics (intentionally simple — adjust without ceremony):
//   * Chain with all `inputs.required = true` satisfied by board: +50
//   * Chain whose top-level tag matches a board signal (e.g. board has
//     `open_ports` containing 88 → tag "kerberos" gets +10): +N
//   * Command whose `<placeholder>`s match board vars (e.g. board has `hash`
//     → commands containing `<hash>` get +5)
//   * Tag overlap between board signals and command.tags: +3 per overlap

(function () {
  'use strict';

  // Heuristic mapping from "board signal" → tag affinities.
  const SIGNAL_TAGS = {
    open_ports_88:   ['kerberos', 'asreproast', 'kerberoast', 'active-directory'],
    open_ports_445:  ['smb', 'lateral', 'secretsdump', 'enum'],
    open_ports_389:  ['ldap', 'active-directory', 'enum'],
    open_ports_3389: ['rdp', 'lateral'],
    open_ports_5985: ['winrm', 'evil-winrm', 'lateral'],
    open_ports_5986: ['winrm', 'evil-winrm', 'lateral'],
    open_ports_22:   ['ssh', 'lateral', 'linux'],
    open_ports_80:   ['http', 'web', 'enum'],
    open_ports_443:  ['http', 'web', 'enum'],
    open_ports_1433: ['mssql', 'lateral'],
    open_ports_88_no_creds:  ['asreproast'],
    has_password: ['kerberoast', 'lateral', 'secretsdump', 'enum'],
    has_hash:     ['pth', 'pass-the-hash', 'lateral'],
    has_ticket:   ['kerberos', 'lateral'],
    has_user_list: ['asreproast', 'spray'],
  };

  function signalsFromBoard(board) {
    const sigs = new Set();
    if (!board) return sigs;
    const ports = board.get('open_ports') || [];
    if (Array.isArray(ports)) {
      for (const p of ports) sigs.add(`open_ports_${p}`);
    }
    if (board.has('password')) sigs.add('has_password');
    if (board.has('hash') || board.has('ntlm_hashes')) sigs.add('has_hash');
    if (board.has('ticket')) sigs.add('has_ticket');
    if (board.has('user_list') || board.has('roastable_users')) sigs.add('has_user_list');
    if (Array.isArray(ports) && ports.includes(88) && !board.has('password') && !board.has('hash')) {
      sigs.add('open_ports_88_no_creds');
    }
    return sigs;
  }

  function tagAffinity(signals) {
    const counter = new Map();
    for (const s of signals) {
      const tags = SIGNAL_TAGS[s] || [];
      for (const t of tags) counter.set(t, (counter.get(t) || 0) + 1);
    }
    return counter; // Map<tag, count>
  }

  class NextMoves {
    constructor({ targetBoard, chainRunner }) {
      this.targetBoard = targetBoard;
      this.chainRunner = chainRunner;
    }

    // Returns { chains: [{chain, score, reason}], commands: [{command, score, reason}] }
    suggest(limits = {}) {
      const { chains: maxChains = 5, commands: maxCommands = 8 } = limits;
      const signals = signalsFromBoard(this.targetBoard);
      const affinity = tagAffinity(signals);
      const allChains = (window.CHAIN_DATA && Array.isArray(window.CHAIN_DATA.chains)) ? window.CHAIN_DATA.chains : [];
      const allCommands = (window.COMMAND_DATA && Array.isArray(window.COMMAND_DATA.commands)) ? window.COMMAND_DATA.commands : [];

      // ── score chains ──
      const chainScores = [];
      for (const chain of allChains) {
        let score = 0;
        const reasons = [];

        const inputs = chain.inputs || [];
        const requiredInputs = inputs.filter((i) => i.required);
        const requiredHave = requiredInputs.filter((i) => this._inputSatisfied(i));
        if (requiredInputs.length && requiredHave.length === requiredInputs.length) {
          score += 50;
          reasons.push('all required inputs ready');
        } else if (requiredInputs.length) {
          score += (requiredHave.length / requiredInputs.length) * 25;
          reasons.push(`${requiredHave.length}/${requiredInputs.length} required inputs ready`);
        }

        for (const t of chain.tags || []) {
          if (affinity.has(t)) {
            const w = affinity.get(t) * 10;
            score += w;
            reasons.push(`tag "${t}"`);
          }
        }

        if (score > 0) chainScores.push({ chain, score, reason: reasons.join(', ') });
      }
      chainScores.sort((a, b) => b.score - a.score);

      // ── score commands ──
      const commandScores = [];
      for (const cmd of allCommands) {
        let score = 0;
        const reasons = [];
        // Placeholder match
        const placeholders = (cmd.command || '').match(/<([^<>\s]+)>/g) || [];
        const bareNames = placeholders.map((p) => p.slice(1, -1));
        for (const ph of bareNames) {
          const normalized = ph.replace(/[-.]/g, '_');
          if (this.targetBoard && (this.targetBoard.has(ph) || this.targetBoard.has(normalized))) {
            score += 5;
          }
        }
        if (score > 0) reasons.push('uses your captured vars');
        // Tag affinity
        let tagHits = 0;
        for (const t of cmd.tags || []) {
          if (affinity.has(t)) tagHits += 1;
        }
        if (tagHits) { score += tagHits * 3; reasons.push(`${tagHits} tag match${tagHits === 1 ? '' : 'es'}`); }

        if (score > 0) commandScores.push({ command: cmd, score, reason: reasons.join(', ') });
      }
      commandScores.sort((a, b) => b.score - a.score);

      return {
        chains: chainScores.slice(0, maxChains),
        commands: commandScores.slice(0, maxCommands),
        signals: [...signals],
      };
    }

    _inputSatisfied(input) {
      if (!this.targetBoard) return false;
      if (input.source && input.source.startsWith('target_context.')) {
        return this.targetBoard.has(input.source.slice('target_context.'.length));
      }
      return this.targetBoard.has(input.name);
    }

    renderTo(rootEl) {
      if (!rootEl) return;
      const { chains, commands, signals } = this.suggest();
      let html = '';
      html += `<div class="wh-nm-header"><h3>Next Moves</h3>`;
      if (signals.length) {
        html += `<div class="wh-nm-signals">${signals.length} signal${signals.length === 1 ? '' : 's'} from board</div>`;
      }
      html += `</div>`;

      if (!chains.length && !commands.length) {
        html += `<div class="wh-empty">Add intel to the Target Board (e.g. an IP, open ports, captured creds) and suggestions appear here.</div>`;
      }

      if (chains.length) {
        html += `<section class="wh-nm-section"><h4>🔗 Chains</h4><ul class="wh-nm-list">`;
        for (const { chain, reason } of chains) {
          html += `<li class="wh-nm-item" data-suggest-chain="${escAttr(chain.id)}">`;
          html += `<div class="wh-nm-item-name">${esc(chain.name)}</div>`;
          if (reason) html += `<div class="wh-nm-item-reason">${esc(reason)}</div>`;
          html += `</li>`;
        }
        html += `</ul></section>`;
      }

      if (commands.length) {
        html += `<section class="wh-nm-section"><h4>🔴 Commands</h4><ul class="wh-nm-list">`;
        for (const { command, reason } of commands) {
          html += `<li class="wh-nm-item" data-suggest-command="${escAttr(command.id)}">`;
          html += `<div class="wh-nm-item-name">${esc(command.name)}</div>`;
          if (reason) html += `<div class="wh-nm-item-reason">${esc(reason)}</div>`;
          html += `</li>`;
        }
        html += `</ul></section>`;
      }

      rootEl.innerHTML = html;

      rootEl.querySelectorAll('[data-suggest-chain]').forEach((el) => {
        el.addEventListener('click', () => {
          if (this.chainRunner) this.chainRunner.startChain(el.dataset.suggestChain);
        });
      });
      rootEl.querySelectorAll('[data-suggest-command]').forEach((el) => {
        el.addEventListener('click', () => {
          const id = el.dataset.suggestCommand;
          if (window.commandManager && typeof window.commandManager.selectCommandById === 'function') {
            window.commandManager.selectCommandById(id);
          } else if (location.hash !== `#${id}`) {
            location.hash = `#${id}`;
          }
        });
      });
    }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }

  window.WannaNextMoves = NextMoves;
})();
