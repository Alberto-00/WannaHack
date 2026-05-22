// WannaHack - PivotMenu
// "Cosa posso fare con questo?" — context menu opened by clicking a TargetBoard
// item. Lists commands whose placeholders consume the variable, chains whose
// `requires` mention it, and (in Phase 6) related HackTricks pages.

(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }

  // For each board variable, the placeholder names that should match it.
  // Allows e.g. var `dc_ip` to match commands using `<ip>` or `<dc-ip>`.
  const PLACEHOLDER_ALIASES = {
    dc_ip: ['ip', 'dc-ip', 'dc_ip'],
    target_ip: ['ip', 'target-ip', 'target_ip'],
    adcs_ip: ['ip', 'adcs-ip'],
    listener_ip: ['listener_ip', 'listener-ip', 'lhost'],
    attacker_ip: ['attacker_ip', 'attacker-ip', 'lhost', 'listener_ip'],
    ntlm_hashes: ['hash'],
    asrep_hashes: ['hash', 'hash_file'],
    tgs_hashes: ['hash', 'hash_file'],
    dc_nt_hash: ['hash'],
    dc_pfx_file: ['pfx_file', 'pfx'],
    cracked_creds: ['password'],
    cracked_service_creds: ['password'],
    user_list: ['user', 'users', 'username', 'wordlist'],
    roastable_users: ['user', 'users', 'username'],
    kerberoastable_users: ['user', 'users', 'username'],
  };

  function placeholdersFor(varName) {
    const aliases = PLACEHOLDER_ALIASES[varName] || [];
    const set = new Set([varName, varName.replace(/_/g, '-'), ...aliases]);
    return [...set];
  }

  class PivotMenu {
    constructor({ chainRunner, onCommandSelect }) {
      this.chainRunner = chainRunner;
      this.onCommandSelect = onCommandSelect || ((id) => { if (location.hash !== `#${id}`) location.hash = `#${id}`; });
      this.modal = null;
      this._onDocClick = this._onDocClick.bind(this);
    }

    findCommands(varName) {
      const allCommands = (window.COMMAND_DATA && Array.isArray(window.COMMAND_DATA.commands)) ? window.COMMAND_DATA.commands : [];
      const wanted = new Set(placeholdersFor(varName));
      const matches = [];
      for (const cmd of allCommands) {
        const placeholders = (cmd.command || '').match(/<([^<>\s]+)>/g) || [];
        const have = placeholders.map((p) => p.slice(1, -1));
        for (const p of have) {
          if (wanted.has(p)) {
            matches.push(cmd);
            break;
          }
        }
      }
      return matches;
    }

    findChains(varName) {
      const allChains = (window.CHAIN_DATA && Array.isArray(window.CHAIN_DATA.chains)) ? window.CHAIN_DATA.chains : [];
      const matches = [];
      for (const chain of allChains) {
        let hit = false;
        for (const step of chain.steps || []) {
          if (Array.isArray(step.requires) && step.requires.includes(varName)) { hit = true; break; }
          if (step.inputs) {
            for (const v of Object.values(step.inputs)) {
              if (typeof v === 'string' && v.includes('${' + varName + '}')) { hit = true; break; }
            }
          }
          if (hit) break;
        }
        if (hit) matches.push(chain);
      }
      return matches;
    }

    open(varName, displayValue) {
      this.close();
      const commands = this.findCommands(varName);
      const chains = this.findChains(varName);

      const modal = document.createElement('div');
      modal.className = 'wh-pivot-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:8000;display:flex;align-items:center;justify-content:center;';

      let html = '';
      html += `<div class="wh-pivot-panel" style="background:var(--bg-panel);border:1px solid var(--border-default);border-radius:8px;padding:20px;min-width:380px;max-width:560px;max-height:80vh;overflow:auto;color:var(--text-primary);font-family:var(--font-mono);">`;
      html += `<div class="wh-pivot-header"><h3 style="margin:0 0 4px 0;color:var(--accent-primary);">Pivot from <code>${esc(varName)}</code></h3>`;
      if (displayValue) html += `<div style="color:var(--text-secondary);font-size:0.85em;">${esc(displayValue)}</div>`;
      html += `</div>`;

      if (chains.length) {
        html += `<section style="margin-top:14px;"><h4 style="margin:0 0 6px 0;color:var(--accent-info);font-size:0.85em;text-transform:uppercase;letter-spacing:0.08em;">🔗 Chains (${chains.length})</h4><ul style="list-style:none;padding:0;margin:0;">`;
        for (const c of chains) {
          html += `<li><button class="wh-pivot-link" data-pivot-chain="${escAttr(c.id)}" style="display:block;width:100%;text-align:left;background:transparent;border:0;color:var(--text-primary);padding:6px 8px;border-radius:4px;cursor:pointer;font-family:inherit;">${esc(c.name)} <small style="color:var(--text-muted);">${esc(c.id)}</small></button></li>`;
        }
        html += `</ul></section>`;
      }

      if (commands.length) {
        html += `<section style="margin-top:14px;"><h4 style="margin:0 0 6px 0;color:var(--accent-primary);font-size:0.85em;text-transform:uppercase;letter-spacing:0.08em;">🔴 Commands (${commands.length})</h4><ul style="list-style:none;padding:0;margin:0;">`;
        for (const c of commands.slice(0, 20)) {
          html += `<li><button class="wh-pivot-link" data-pivot-command="${escAttr(c.id)}" style="display:block;width:100%;text-align:left;background:transparent;border:0;color:var(--text-primary);padding:6px 8px;border-radius:4px;cursor:pointer;font-family:inherit;">${esc(c.name)} <small style="color:var(--text-muted);">${esc(c.id)}</small></button></li>`;
        }
        if (commands.length > 20) html += `<li style="color:var(--text-muted);padding:6px 8px;">… and ${commands.length - 20} more</li>`;
        html += `</ul></section>`;
      }

      if (!chains.length && !commands.length) {
        html += `<div style="margin-top:14px;color:var(--text-muted);">Nothing in the library consumes <code>${esc(varName)}</code> yet.</div>`;
      }

      html += `<div style="margin-top:16px;text-align:right;"><button class="wh-pivot-close" style="background:var(--bg-elevated);border:1px solid var(--border-default);color:var(--text-primary);padding:6px 14px;border-radius:4px;cursor:pointer;font-family:inherit;">Close (Esc)</button></div>`;
      html += `</div>`;
      modal.innerHTML = html;
      document.body.appendChild(modal);
      this.modal = modal;

      modal.querySelectorAll('[data-pivot-chain]').forEach((b) => b.addEventListener('click', () => {
        this.close();
        if (this.chainRunner) this.chainRunner.startChain(b.dataset.pivotChain);
      }));
      modal.querySelectorAll('[data-pivot-command]').forEach((b) => b.addEventListener('click', () => {
        this.close();
        this.onCommandSelect(b.dataset.pivotCommand);
      }));
      modal.querySelector('.wh-pivot-close').addEventListener('click', () => this.close());
      modal.addEventListener('click', (e) => { if (e.target === modal) this.close(); });
      document.addEventListener('keydown', this._onDocClick);
    }

    close() {
      if (this.modal && this.modal.parentNode) this.modal.parentNode.removeChild(this.modal);
      this.modal = null;
      document.removeEventListener('keydown', this._onDocClick);
    }

    _onDocClick(e) {
      if (e.key === 'Escape') this.close();
    }
  }

  window.WannaPivotMenu = PivotMenu;
})();
