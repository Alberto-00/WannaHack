// WannaHack - GuidedStart
// Onboarding wizard. Asks 4 quick questions, optionally auto-parses an nmap
// dump, populates the TargetBoard, then routes to a NextMoves-ranked chain.
// Opened on the first visit per profile (no chain instance yet, no target IP
// set) and via the `g` hotkey.

(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  class GuidedStart {
    constructor({ targetBoard, nextMoves, chainRunner, parsers, storageKeyFn, showToast }) {
      this.targetBoard = targetBoard;
      this.nextMoves = nextMoves;
      this.chainRunner = chainRunner;
      this.parsers = parsers || window.WannaOutputParsers;
      this._storageKeyFn = storageKeyFn;
      this._showToast = showToast || (() => {});
      this.modal = null;
    }

    seenSeenKey() { return this._storageKeyFn('guided-start-seen'); }
    markSeen() { try { localStorage.setItem(this.seenSeenKey(), '1'); } catch (_) {} }
    hasSeen() { try { return localStorage.getItem(this.seenSeenKey()) === '1'; } catch (_) { return false; } }

    // Open automatically on first profile use, only if board is empty.
    maybeAutoOpen() {
      if (this.hasSeen()) return;
      if (this.targetBoard && Object.keys(this.targetBoard.vars).length > 0) {
        this.markSeen();
        return;
      }
      this.open();
    }

    open() {
      this.close();
      const modal = document.createElement('div');
      modal.className = 'wh-guided-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:8500;display:flex;align-items:center;justify-content:center;';

      modal.innerHTML = `
        <div class="wh-guided-panel" style="background:var(--bg-panel);border:1px solid var(--border-default);border-radius:8px;padding:24px;width:560px;max-width:92vw;max-height:88vh;overflow:auto;color:var(--text-primary);font-family:var(--font-mono);box-shadow:0 12px 50px rgba(0,0,0,0.6);">
          <h2 style="margin:0 0 6px 0;color:var(--accent-primary);">🚀 Start a mission</h2>
          <p style="color:var(--text-secondary);margin:0 0 16px 0;font-size:0.9em;">A handful of quick answers will populate the Target Board and pick a starting chain. Skip what you don't have.</p>

          <form id="wh-guided-form" style="display:flex;flex-direction:column;gap:14px;">
            <label style="display:flex;flex-direction:column;gap:4px;">
              <span style="color:var(--accent-intel);font-size:0.85em;text-transform:uppercase;letter-spacing:0.06em;">Target IP</span>
              <input type="text" name="ip" placeholder="10.10.10.5" autocomplete="off" style="background:var(--bg-elevated);border:1px solid var(--border-default);color:var(--text-primary);padding:8px 10px;border-radius:4px;font-family:inherit;">
            </label>

            <label style="display:flex;flex-direction:column;gap:4px;">
              <span style="color:var(--accent-intel);font-size:0.85em;text-transform:uppercase;letter-spacing:0.06em;">Domain (if AD)</span>
              <input type="text" name="domain" placeholder="corp.local" autocomplete="off" style="background:var(--bg-elevated);border:1px solid var(--border-default);color:var(--text-primary);padding:8px 10px;border-radius:4px;font-family:inherit;">
            </label>

            <label style="display:flex;flex-direction:column;gap:4px;">
              <span style="color:var(--accent-intel);font-size:0.85em;text-transform:uppercase;letter-spacing:0.06em;">Nmap output (optional)</span>
              <textarea name="nmap" rows="5" placeholder="Paste full nmap output — open ports are extracted automatically." style="background:var(--bg-elevated);border:1px solid var(--border-default);color:var(--text-primary);padding:8px 10px;border-radius:4px;font-family:inherit;resize:vertical;"></textarea>
            </label>

            <fieldset style="border:1px solid var(--border-default);border-radius:4px;padding:8px 12px;">
              <legend style="padding:0 6px;color:var(--accent-intel);font-size:0.85em;">What you already have</legend>
              <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:4px;">
                <label><input type="checkbox" name="creds" value="password"> Password</label>
                <label><input type="checkbox" name="creds" value="hash"> NTLM hash</label>
                <label><input type="checkbox" name="creds" value="ticket"> Kerberos ticket</label>
                <label><input type="checkbox" name="creds" value="none" checked> Nothing yet</label>
              </div>
            </fieldset>

            <fieldset style="border:1px solid var(--border-default);border-radius:4px;padding:8px 12px;">
              <legend style="padding:0 6px;color:var(--accent-intel);font-size:0.85em;">Target OS</legend>
              <div style="display:flex;gap:14px;margin-top:4px;">
                <label><input type="radio" name="os" value="windows" checked> Windows</label>
                <label><input type="radio" name="os" value="linux"> Linux</label>
                <label><input type="radio" name="os" value="unknown"> Unknown</label>
              </div>
            </fieldset>

            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
              <button type="button" data-action="skip" style="background:var(--bg-elevated);border:1px solid var(--border-default);color:var(--text-secondary);padding:8px 14px;border-radius:4px;cursor:pointer;font-family:inherit;">Skip</button>
              <button type="submit" style="background:var(--accent-primary);border:0;color:#fff;padding:8px 18px;border-radius:4px;cursor:pointer;font-family:inherit;font-weight:600;">Plan moves →</button>
            </div>
          </form>

          <div id="wh-guided-result" style="margin-top:18px;"></div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;

      const form = modal.querySelector('#wh-guided-form');
      const resultBox = modal.querySelector('#wh-guided-result');
      modal.querySelector('[data-action="skip"]').addEventListener('click', () => {
        this.markSeen();
        this.close();
      });
      modal.addEventListener('click', (e) => { if (e.target === modal) { this.markSeen(); this.close(); } });
      this._escHandler = (e) => { if (e.key === 'Escape') { this.markSeen(); this.close(); } };
      document.addEventListener('keydown', this._escHandler);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const ip = (fd.get('ip') || '').toString().trim();
        const domain = (fd.get('domain') || '').toString().trim();
        const nmapText = (fd.get('nmap') || '').toString();
        const creds = fd.getAll('creds').map(String).filter((v) => v !== 'none');
        const os = (fd.get('os') || 'unknown').toString();

        if (ip) this.targetBoard.set('target_ip', ip, 'manual');
        if (ip) this.targetBoard.set('dc_ip', ip, 'manual'); // assume same — user can clear
        if (domain) this.targetBoard.set('domain', domain, 'manual');
        if (os && os !== 'unknown') this.targetBoard.set('os', os, 'manual');

        if (nmapText && this.parsers) {
          const { vars, hits } = this.parsers.autoExtract(nmapText);
          if (Object.keys(vars).length) {
            this.targetBoard.merge(vars, 'manual');
            this._showToast(`Parsed nmap: ${this.parsers.summarize(hits)}`);
          }
        }

        // Mark cred presence as boolean flags the suggestion engine reads.
        if (creds.includes('password')) this.targetBoard.set('password', '(unknown — fill from context bar)', 'manual');
        if (creds.includes('hash')) this.targetBoard.set('hash', '(unknown — fill from context bar)', 'manual');
        if (creds.includes('ticket')) this.targetBoard.set('ticket', '(unknown — fill from context bar)', 'manual');

        this.markSeen();
        this._renderSuggestions(resultBox);
      });

      // Focus first input.
      const firstInput = modal.querySelector('input[name="ip"]');
      if (firstInput) firstInput.focus();
    }

    _renderSuggestions(target) {
      if (!this.nextMoves) { this.close(); return; }
      const { chains, commands } = this.nextMoves.suggest({ chains: 4, commands: 4 });
      if (!chains.length && !commands.length) {
        target.innerHTML = `<div style="color:var(--text-muted);">No specific suggestions yet — explore the chain list.</div><div style="margin-top:10px;text-align:right;"><button id="wh-guided-done" style="background:var(--accent-primary);border:0;color:#fff;padding:8px 18px;border-radius:4px;cursor:pointer;font-family:inherit;">Open Mission Control</button></div>`;
        target.querySelector('#wh-guided-done').addEventListener('click', () => this.close());
        return;
      }
      let html = `<h3 style="margin:0 0 8px 0;color:var(--accent-loot);font-size:1em;">Recommended starts</h3>`;
      if (chains.length) {
        html += `<ul style="list-style:none;padding:0;margin:0 0 12px 0;">`;
        for (const { chain, reason } of chains) {
          html += `<li style="margin-bottom:6px;"><button data-guided-chain="${esc(chain.id)}" style="display:block;width:100%;text-align:left;background:var(--bg-elevated);border:1px solid var(--border-default);color:var(--text-primary);padding:10px 12px;border-radius:4px;cursor:pointer;font-family:inherit;"><div style="font-weight:600;">🔗 ${esc(chain.name)}</div>${reason ? `<div style="color:var(--text-muted);font-size:0.85em;margin-top:2px;">${esc(reason)}</div>` : ''}</button></li>`;
        }
        html += `</ul>`;
      }
      if (commands.length) {
        html += `<h4 style="margin:8px 0 6px 0;color:var(--accent-info);font-size:0.85em;">…or jump straight to a command</h4>`;
        html += `<ul style="list-style:none;padding:0;margin:0;">`;
        for (const { command } of commands) {
          html += `<li style="margin-bottom:4px;"><button data-guided-command="${esc(command.id)}" style="display:block;width:100%;text-align:left;background:transparent;border:0;color:var(--text-primary);padding:4px 8px;border-radius:4px;cursor:pointer;font-family:inherit;">🔴 ${esc(command.name)}</button></li>`;
        }
        html += `</ul>`;
      }
      html += `<div style="margin-top:12px;text-align:right;"><button id="wh-guided-done" style="background:var(--bg-elevated);border:1px solid var(--border-default);color:var(--text-primary);padding:8px 14px;border-radius:4px;cursor:pointer;font-family:inherit;">Just open the console</button></div>`;
      target.innerHTML = html;

      target.querySelectorAll('[data-guided-chain]').forEach((b) => b.addEventListener('click', () => {
        const id = b.dataset.guidedChain;
        this.close();
        this.chainRunner.startChain(id);
      }));
      target.querySelectorAll('[data-guided-command]').forEach((b) => b.addEventListener('click', () => {
        const id = b.dataset.guidedCommand;
        this.close();
        if (window.commandManager && typeof window.commandManager.selectCommandById === 'function') {
          window.commandManager.selectCommandById(id);
        } else {
          location.hash = `#${id}`;
        }
      }));
      target.querySelector('#wh-guided-done').addEventListener('click', () => this.close());
    }

    close() {
      if (this.modal && this.modal.parentNode) this.modal.parentNode.removeChild(this.modal);
      this.modal = null;
      if (this._escHandler) { document.removeEventListener('keydown', this._escHandler); this._escHandler = null; }
    }
  }

  window.WannaGuidedStart = GuidedStart;
})();
