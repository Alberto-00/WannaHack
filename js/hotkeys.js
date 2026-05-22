// WannaHack - HotkeyManager
// Global keyboard shortcut infrastructure. Subsequent phases (Mission Control,
// chain editor, etc.) register their bindings here. Scope-based: only handlers
// registered in the currently active scope (or 'global') fire.
//
// Built-in: `?` opens the help overlay listing every registered binding.

(function () {
    'use strict';

    class HotkeyManager {
        constructor() {
            // Map<scope, Map<key, {handler, description}>>
            this.bindings = new Map();
            this.activeScope = 'global';
            this.enabled = true;
            this.helpModal = null;

            this._onKeyDown = this._onKeyDown.bind(this);
            window.addEventListener('keydown', this._onKeyDown);

            // Built-in help overlay binding
            this.register('?', () => this.toggleHelp(), {
                scope: 'global',
                description: 'Toggle hotkey help overlay',
            });
        }

        // Register a binding. Options: { scope, description }.
        register(key, handler, options = {}) {
            const scope = options.scope || 'global';
            const description = options.description || '';
            if (!this.bindings.has(scope)) this.bindings.set(scope, new Map());
            this.bindings.get(scope).set(this._normalizeKey(key), {
                handler,
                description,
                key,
            });
        }

        unregister(key, scope = 'global') {
            const scopeMap = this.bindings.get(scope);
            if (scopeMap) scopeMap.delete(this._normalizeKey(key));
        }

        setScope(scope) {
            this.activeScope = scope;
        }

        getActiveScope() {
            return this.activeScope;
        }

        enable() { this.enabled = true; }
        disable() { this.enabled = false; }

        // Returns a snapshot of all registered bindings, grouped by scope.
        // Used by the help overlay (Phase 7) and the built-in basic modal.
        listBindings() {
            const result = {};
            for (const [scope, scopeMap] of this.bindings.entries()) {
                result[scope] = [];
                for (const { handler: _h, description, key } of scopeMap.values()) {
                    result[scope].push({ key, description });
                }
            }
            return result;
        }

        toggleHelp() {
            if (this.helpModal && document.body.contains(this.helpModal)) {
                this.closeHelp();
            } else {
                this.openHelp();
            }
        }

        openHelp() {
            // Phase 7 replaces this with a richer overlay (js/help-overlay.js).
            // Phase 1 ships a minimal but functional fallback so the `?` key
            // already works end-to-end.
            const bindings = this.listBindings();
            const modal = document.createElement('div');
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Keyboard shortcuts');
            modal.style.cssText = [
                'position: fixed',
                'inset: 0',
                'background: rgba(0, 0, 0, 0.7)',
                'z-index: 9000',
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'font-family: var(--font-mono, monospace)',
            ].join(';');

            const panel = document.createElement('div');
            panel.style.cssText = [
                'background: var(--bg-panel, #161b22)',
                'border: 1px solid var(--border-default, #30363d)',
                'border-radius: 8px',
                'padding: 24px',
                'min-width: 360px',
                'max-width: 600px',
                'max-height: 80vh',
                'overflow: auto',
                'color: var(--text-primary, #c9d1d9)',
                'box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5)',
            ].join(';');

            let html = '<h2 style="margin: 0 0 16px 0; color: var(--accent-primary, #ff4757); font-size: 1.1em;">⌨ Keyboard Shortcuts</h2>';
            const scopes = Object.keys(bindings).sort((a, b) => {
                if (a === 'global') return -1;
                if (b === 'global') return 1;
                return a.localeCompare(b);
            });
            for (const scope of scopes) {
                const items = bindings[scope];
                if (!items.length) continue;
                html += `<div style="margin-bottom: 16px;"><div style="color: var(--accent-info, #1e90ff); font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">${this._escape(scope)}</div>`;
                html += '<table style="width: 100%; border-collapse: collapse;">';
                for (const { key, description } of items) {
                    html += `<tr><td style="padding: 4px 8px 4px 0; vertical-align: top;"><kbd style="background: var(--bg-elevated, #21262d); border: 1px solid var(--border-default, #30363d); border-radius: 4px; padding: 2px 8px; font-family: var(--font-mono, monospace); font-size: 0.9em;">${this._escape(key)}</kbd></td><td style="padding: 4px 0; color: var(--text-secondary, #8b949e);">${this._escape(description || '')}</td></tr>`;
                }
                html += '</table></div>';
            }
            html += '<div style="margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--border-default, #30363d); color: var(--text-muted, #6e7681); font-size: 0.8em;">Press <kbd style="background: var(--bg-elevated, #21262d); border: 1px solid var(--border-default, #30363d); border-radius: 4px; padding: 1px 6px;">Esc</kbd> or <kbd style="background: var(--bg-elevated, #21262d); border: 1px solid var(--border-default, #30363d); border-radius: 4px; padding: 1px 6px;">?</kbd> to close.</div>';
            panel.innerHTML = html;
            modal.appendChild(panel);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeHelp();
            });

            document.body.appendChild(modal);
            this.helpModal = modal;
        }

        closeHelp() {
            if (this.helpModal && this.helpModal.parentNode) {
                this.helpModal.parentNode.removeChild(this.helpModal);
            }
            this.helpModal = null;
        }

        _onKeyDown(event) {
            if (!this.enabled) return;

            // Esc always closes the help overlay even when typing.
            if (event.key === 'Escape' && this.helpModal) {
                event.preventDefault();
                this.closeHelp();
                return;
            }

            // Do not intercept while user is typing in an input/textarea/contenteditable.
            const target = event.target;
            if (target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            )) {
                return;
            }

            // Skip when modifier keys are pressed — those are reserved for the
            // host app (Ctrl+K search, Cmd+C system copy, etc.).
            if (event.ctrlKey || event.metaKey || event.altKey) return;

            const key = this._normalizeKey(event.key);
            const activeBindings = this.bindings.get(this.activeScope);
            const globalBindings = this.bindings.get('global');

            const binding =
                (activeBindings && activeBindings.get(key)) ||
                (globalBindings && globalBindings.get(key));

            if (binding) {
                event.preventDefault();
                try {
                    binding.handler(event);
                } catch (err) {
                    console.error('[HotkeyManager] handler error for', key, err);
                }
            }
        }

        _normalizeKey(key) {
            // Single-char keys are case-insensitive. Special keys (Escape,
            // ArrowUp, ...) preserve their canonical name.
            if (typeof key !== 'string') return '';
            return key.length === 1 ? key.toLowerCase() : key;
        }

        _escape(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    }

    // Singleton — installed before app.js loads so any component can `register`.
    window.WannaHotkeys = new HotkeyManager();
})();
