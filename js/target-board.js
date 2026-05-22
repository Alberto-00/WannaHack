// WannaHack - TargetBoard
// Unified live state of the box under attack: IP, OS guess, ports, captured
// credentials, hashes, active shells. Items are buckets for the UI's
// semantic color coding (intel / loot / shells / attack assets).
//
// Subscribes nothing — emits 'change' events that MissionControl listens to
// in order to re-render the left panel and ask NextMoves to re-score.
//
// Persistence: per-profile via the CommandManager's _storageKey() helper.
// We hold a back-reference to that helper so the storage layout stays in sync
// with the existing profile system.

(function () {
  'use strict';

  // Variable name → semantic bucket. Anything not in the map lands in 'misc'.
  const BUCKET_FOR_VAR = {
    // Intel (recon, target metadata)
    target_ip: 'intel', ip: 'intel', dc_ip: 'intel', adcs_ip: 'intel',
    listener_ip: 'intel', attacker_ip: 'intel',
    domain: 'intel', os: 'intel', hostname: 'intel',
    open_ports: 'intel', services: 'intel',
    user_list: 'intel', users_dumped: 'intel',
    roastable_users: 'intel', kerberoastable_users: 'intel',
    bh_type: 'intel', bh_count: 'intel',

    // Loot (credentials / hashes / tickets)
    asrep_hashes: 'loot', tgs_hashes: 'loot',
    ntlm_hashes: 'loot', cracked_creds: 'loot', cracked_service_creds: 'loot',
    dc_nt_hash: 'loot', dc_pfx: 'loot', dc_pfx_file: 'loot',
    password: 'loot', hash: 'loot', ticket: 'loot',

    // Shells / footholds
    shell_active: 'shells', shell_pwd: 'shells',
    shell_user: 'shells', shell_host: 'shells',
  };

  // Display labels for known vars (fallback: humanize the snake_case name).
  const LABEL_FOR_VAR = {
    target_ip: 'Target IP', dc_ip: 'DC IP', adcs_ip: 'ADCS IP',
    listener_ip: 'Listener IP', attacker_ip: 'Attacker IP',
    open_ports: 'Open ports',
    asrep_hashes: 'AS-REP hashes', tgs_hashes: 'TGS hashes',
    ntlm_hashes: 'NTLM hashes', cracked_creds: 'Cracked creds',
    cracked_service_creds: 'Cracked service creds',
    dc_nt_hash: 'DC NT hash', dc_pfx: 'DC PFX',
    user_list: 'Users', users_dumped: 'Dumped users',
    roastable_users: 'AS-REP-able users', kerberoastable_users: 'Kerberoastable users',
  };

  function humanize(name) {
    return LABEL_FOR_VAR[name] || name.replace(/_/g, ' ');
  }

  function bucketFor(name, value) {
    if (BUCKET_FOR_VAR[name]) return BUCKET_FOR_VAR[name];
    // Heuristic fallbacks
    if (/hash|cred|password|ticket|pfx/.test(name)) return 'loot';
    if (/shell|pwd|prompt/.test(name)) return 'shells';
    return 'misc';
  }

  class TargetBoard {
    constructor(storageKeyFn) {
      this._storageKeyFn = storageKeyFn; // (suffix) -> string
      this.vars = {};                    // map var -> value
      this.sources = {};                 // map var -> 'context' | 'chain' | 'manual'
      this.listeners = new Set();
    }

    on(handler) { this.listeners.add(handler); return () => this.listeners.delete(handler); }
    _emit() { for (const h of this.listeners) { try { h(this); } catch (_) {} } }

    // Hydrate from localStorage AND from the existing context bar (targetContext).
    load(seedFromContext) {
      this.vars = {};
      this.sources = {};
      if (seedFromContext && typeof seedFromContext === 'object') {
        for (const [k, v] of Object.entries(seedFromContext)) {
          if (v == null || v === '') continue;
          this.vars[k] = v;
          this.sources[k] = 'context';
        }
      }
      try {
        const key = this._storageKeyFn('target-board');
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          if (data && typeof data === 'object' && data.vars) {
            for (const [k, v] of Object.entries(data.vars)) {
              this.vars[k] = v;
              this.sources[k] = (data.sources && data.sources[k]) || 'chain';
            }
          }
        }
      } catch (_) { /* swallowed */ }
      this._emit();
    }

    save() {
      try {
        const key = this._storageKeyFn('target-board');
        // Don't persist context-sourced vars — they belong to targetContext and
        // would otherwise drift out of sync. Re-seed them at load time instead.
        const persistVars = {};
        const persistSources = {};
        for (const [k, v] of Object.entries(this.vars)) {
          if (this.sources[k] === 'context') continue;
          persistVars[k] = v;
          persistSources[k] = this.sources[k];
        }
        localStorage.setItem(key, JSON.stringify({ vars: persistVars, sources: persistSources }));
      } catch (_) { /* swallowed */ }
    }

    // Replace a single value. Source defaults to 'manual'.
    set(name, value, source = 'manual') {
      this.vars[name] = value;
      this.sources[name] = source;
      this.save();
      this._emit();
    }

    // Bulk merge — used by chain captures and auto-extract. Skips empty values.
    merge(map, source = 'chain') {
      let changed = false;
      for (const [k, v] of Object.entries(map || {})) {
        if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
        this.vars[k] = v;
        this.sources[k] = source;
        changed = true;
      }
      if (changed) { this.save(); this._emit(); }
    }

    remove(name) {
      delete this.vars[name];
      delete this.sources[name];
      this.save();
      this._emit();
    }

    clear() {
      this.vars = {};
      this.sources = {};
      this.save();
      this._emit();
    }

    has(name) {
      const v = this.vars[name];
      return v != null && v !== '' && !(Array.isArray(v) && v.length === 0);
    }

    get(name) { return this.vars[name]; }

    // Returns the board grouped by semantic bucket for rendering.
    byBucket() {
      const buckets = { intel: [], loot: [], shells: [], misc: [] };
      for (const [name, value] of Object.entries(this.vars)) {
        const b = bucketFor(name, value);
        if (!buckets[b]) buckets[b] = [];
        buckets[b].push({
          name,
          value,
          label: humanize(name),
          source: this.sources[name] || 'manual',
          summary: TargetBoard.summarize(value),
        });
      }
      for (const b of Object.values(buckets)) b.sort((a, b2) => a.label.localeCompare(b2.label));
      return buckets;
    }

    // Compact human summary of a value (used in board chips).
    static summarize(v) {
      if (v == null) return '';
      if (typeof v === 'string') return v.length > 40 ? v.slice(0, 37) + '…' : v;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      if (Array.isArray(v)) {
        if (v.length === 0) return '(empty)';
        if (typeof v[0] === 'string') {
          const preview = v.slice(0, 3).join(', ');
          return v.length > 3 ? `${preview} … (+${v.length - 3})` : preview;
        }
        return `${v.length} item${v.length === 1 ? '' : 's'}`;
      }
      if (typeof v === 'object') {
        const keys = Object.keys(v);
        return `{${keys.length} field${keys.length === 1 ? '' : 's'}}`;
      }
      return String(v);
    }

    static humanize(name) { return humanize(name); }
    static bucketFor(name, value) { return bucketFor(name, value); }
  }

  window.WannaTargetBoard = TargetBoard;
})();
