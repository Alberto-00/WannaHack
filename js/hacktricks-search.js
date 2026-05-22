// WannaHack - HackTricks search (Mission Control workspace mode "hacktricks")
//
// Lazy-loads js/hacktricks-index.js on first activation, builds a MiniSearch
// index, and renders ranked results into the workspace pane.

(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  class HacktricksSearch {
    constructor() {
      this.rootEl = null;
      this.index = null;       // MiniSearch instance
      this.docs = null;        // raw HACKTRICKS_INDEX array
      this.loading = false;
      this.loaded = false;
      this.lastQuery = '';
    }

    mount(rootEl) {
      this.rootEl = rootEl;
      if (!this.loaded && !this.loading) {
        this._renderShell('Loading HackTricks index…');
        this._loadIndex();
      } else {
        this._renderShell();
      }
    }

    _loadIndex() {
      this.loading = true;
      // If the index is already loaded, skip the network/cache fetch.
      if (window.HACKTRICKS_INDEX) {
        this._buildAndRender();
        return;
      }
      const s = document.createElement('script');
      s.src = 'js/hacktricks-index.js';
      s.async = true;
      s.onload = () => this._buildAndRender();
      s.onerror = () => {
        this.loading = false;
        this._renderShell('Could not load js/hacktricks-index.js — run <code>node scripts/sync-hacktricks.js</code> to generate it.');
      };
      document.head.appendChild(s);
    }

    _buildAndRender() {
      try {
        this.docs = window.HACKTRICKS_INDEX || [];
        if (typeof MiniSearch === 'undefined') {
          this.loading = false;
          this._renderShell('MiniSearch vendor file missing.');
          return;
        }
        this.index = new MiniSearch({
          fields: ['title', 'summary', 'tags'],
          storeFields: ['title', 'summary', 'url', 'tags'],
          searchOptions: {
            boost: { title: 4, tags: 2 },
            fuzzy: 0.2,
            prefix: true,
            combineWith: 'AND',
          },
        });
        this.index.addAll(this.docs.map((d, i) => ({
          id: d.id || i,
          title: d.title || '',
          summary: d.summary || '',
          tags: (d.tags || []).join(' '),
          url: d.url || '#',
        })));
        this.loaded = true;
        this.loading = false;
        this._renderShell();
      } catch (e) {
        this.loading = false;
        this._renderShell('Failed to build search index: ' + esc(e.message));
      }
    }

    _renderShell(messageOverride) {
      if (!this.rootEl) return;
      const total = this.docs ? this.docs.length : 0;
      const summary = messageOverride
        ? `<div class="wh-empty">${messageOverride}</div>`
        : `<div class="wh-ht-meta">${total.toLocaleString()} pages indexed</div>`;
      this.rootEl.innerHTML = `
        <header class="wh-ht-header">
          <h2>📚 HackTricks search</h2>
          ${summary}
        </header>
        <div class="wh-ht-searchbar">
          <input type="search" id="wh-ht-q" placeholder="Search HackTricks…" autocomplete="off">
        </div>
        <div id="wh-ht-results" class="wh-ht-results"></div>
      `;
      const input = this.rootEl.querySelector('#wh-ht-q');
      if (!input) return;
      input.disabled = !this.loaded;
      if (this.loaded) input.focus();
      input.value = this.lastQuery;
      input.addEventListener('input', () => {
        this.lastQuery = input.value;
        this._renderResults();
      });
      if (this.lastQuery) this._renderResults();
    }

    _renderResults() {
      const out = this.rootEl && this.rootEl.querySelector('#wh-ht-results');
      if (!out || !this.index) return;
      const q = this.lastQuery.trim();
      if (!q) { out.innerHTML = `<div class="wh-empty">Type to search.</div>`; return; }
      const hits = this.index.search(q, { fuzzy: 0.2, prefix: true });
      if (!hits.length) { out.innerHTML = `<div class="wh-empty">No matches for “${esc(q)}”.</div>`; return; }
      let html = '<ul class="wh-ht-list">';
      for (const hit of hits.slice(0, 50)) {
        const summary = hit.summary ? esc(hit.summary) : '';
        html += `<li class="wh-ht-hit"><a href="${esc(hit.url)}" target="_blank" rel="noopener"><div class="wh-ht-hit-title">${esc(hit.title)}</div><div class="wh-ht-hit-summary">${summary}</div><div class="wh-ht-hit-url">${esc(hit.url)}</div></a></li>`;
      }
      html += '</ul>';
      out.innerHTML = html;
    }
  }

  window.WannaHacktricksSearch = HacktricksSearch;
})();
