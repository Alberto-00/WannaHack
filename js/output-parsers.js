// WannaHack - Auto-extract parsers
// Built-in parsers for common tool output. Each parser is { name, detect(text), parse(text) }.
// OutputParsers.autoExtract(text) runs every parser whose detect() returns true and merges
// the captured variables. Used by the chain runner's "⚡ Auto-extract" button.
//
// Adding a parser: append to the PARSERS array. Keep regex anchored (^/m where useful)
// so a stray line in piped output doesn't false-positive a competing parser.

(function () {
  'use strict';

  const PARSERS = [
    // ──────────────────────────────── nmap ───────────────────────────────
    {
      name: 'nmap',
      detect: (t) => /Nmap scan report for|^PORT\s+STATE\s+SERVICE/m.test(t),
      parse: (t) => {
        const vars = {};
        const target = t.match(/Nmap scan report for\s+(?:([^\s()]+)\s+)?\(?([0-9.]+)\)?/);
        if (target) vars.target_ip = target[2];
        const ports = [];
        const services = {};
        const portRe = /^(\d{1,5})\/(tcp|udp)\s+open\s+(\S+)/gm;
        let m;
        while ((m = portRe.exec(t)) !== null) {
          const port = parseInt(m[1], 10);
          ports.push(port);
          services[String(port)] = m[3];
        }
        if (ports.length) {
          vars.open_ports = ports;
          vars.services = services;
        }
        return vars;
      },
    },

    // ─────────────────── impacket GetNPUsers (AS-REP roast) ───────────────────
    {
      name: 'impacket-getnpusers',
      detect: (t) => /\$krb5asrep\$/.test(t),
      parse: (t) => {
        const vars = {};
        const hashes = [];
        const users = new Set();
        const re = /\$krb5asrep\$\d+\$([A-Za-z0-9._-]+)@[^:]*:[A-Fa-f0-9]+\$[A-Fa-f0-9]+/g;
        let m;
        while ((m = re.exec(t)) !== null) {
          hashes.push(m[0]);
          users.add(m[1]);
        }
        if (hashes.length) {
          vars.asrep_hashes = hashes;
          vars.roastable_users = [...users];
        }
        return vars;
      },
    },

    // ─────────────────── impacket GetUserSPNs (Kerberoast) ────────────────────
    {
      name: 'impacket-getuserspns',
      detect: (t) => /\$krb5tgs\$/.test(t),
      parse: (t) => {
        const vars = {};
        const hashes = [];
        const users = new Set();
        // $krb5tgs$23$*user$realm$spn*$...
        const re = /\$krb5tgs\$\d+\$\*([A-Za-z0-9._$-]+)\$[^*]+\*\$[A-Fa-f0-9]+/g;
        let m;
        while ((m = re.exec(t)) !== null) {
          hashes.push(m[0]);
          users.add(m[1]);
        }
        if (hashes.length) {
          vars.tgs_hashes = hashes;
          vars.kerberoastable_users = [...users];
        }
        return vars;
      },
    },

    // ──────────────────────── secretsdump / DCSync ────────────────────────
    {
      name: 'secretsdump',
      detect: (t) => /^[A-Za-z0-9._$-]+:\d+:[a-f0-9]{32}:[a-f0-9]{32}:::/m.test(t),
      parse: (t) => {
        const vars = {};
        const dump = [];
        const users = new Set();
        const re = /^([A-Za-z0-9._$-]+):(\d+):([a-f0-9]{32}):([a-f0-9]{32}):::/gm;
        let m;
        while ((m = re.exec(t)) !== null) {
          dump.push({ user: m[1], rid: parseInt(m[2], 10), lm: m[3], nt: m[4] });
          users.add(m[1]);
        }
        if (dump.length) {
          vars.ntlm_hashes = dump;
          vars.users_dumped = [...users];
        }
        return vars;
      },
    },

    // ─────────────────────────── hashcat cracked ──────────────────────────
    {
      name: 'hashcat-cracked',
      detect: (t) => /^(?:\$[a-z0-9]+\$|[a-f0-9]{32,})[^:]*:[^:\n]+$/m.test(t),
      parse: (t) => {
        const vars = {};
        const cracked = [];
        // Conservative: hashcat --show emits `hash:password`. Accept hashes that
        // are either $-prefixed (kerberos/asrep/etc.) or 32+ hex chars (NTLM).
        const re = /^((?:\$[a-z0-9_$-]+\$[^:]+)|(?:[a-f0-9]{32,}))(?::[^:\n]+)*:([^:\n]+)$/gm;
        let m;
        while ((m = re.exec(t)) !== null) {
          // Reject anything that contains the obvious AS-REP-uncracked marker
          if (m[2].startsWith('$krb5')) continue;
          cracked.push({ hash: m[1], password: m[2] });
        }
        if (cracked.length) vars.cracked_creds = cracked;
        return vars;
      },
    },

    // ───────────────────── enum4linux / nxc user enum ─────────────────────
    {
      name: 'user-enum',
      detect: (t) => /\[\+\]\s+\S+\s+\\?\S+\s*:/.test(t) ||
                     /^user:\s*\[/m.test(t),
      parse: (t) => {
        const vars = {};
        const users = new Set();
        // nxc style: "(Pwn3d!) USER" lines aren't trivially distinguishable; we look
        // for the explicit "--users" output shape: "username: someuser".
        const nxcUsers = /-\s+([A-Za-z0-9._$-]+)\s+\([^)]*description[^)]*\)/g;
        const enumUsers = /^user:\s*\[([^\]]+)\]/gm;
        let m;
        while ((m = nxcUsers.exec(t)) !== null) users.add(m[1]);
        while ((m = enumUsers.exec(t)) !== null) users.add(m[1]);
        if (users.size) vars.user_list = [...users];
        return vars;
      },
    },

    // ───────────────────────── BloodHound JSON ────────────────────────────
    {
      name: 'bloodhound-json',
      detect: (t) => {
        const s = t.trim();
        if (!s.startsWith('{')) return false;
        try {
          const j = JSON.parse(s);
          return !!(j && j.meta && j.data);
        } catch (_) { return false; }
      },
      parse: (t) => {
        const vars = {};
        try {
          const j = JSON.parse(t);
          if (j.meta && j.meta.type) vars.bh_type = j.meta.type;
          if (Array.isArray(j.data)) vars.bh_count = j.data.length;
        } catch (_) { /* swallowed */ }
        return vars;
      },
    },

    // ───────────────────────── evil-winrm shell prompt ────────────────────
    {
      name: 'evil-winrm-prompt',
      detect: (t) => /\*Evil-WinRM\*\s+PS\s+/.test(t),
      parse: (t) => {
        const vars = { shell_active: true };
        const m = t.match(/\*Evil-WinRM\*\s+PS\s+([A-Za-z]:\\[^>]*)>/);
        if (m) vars.shell_pwd = m[1].trim();
        return vars;
      },
    },
  ];

  class OutputParsers {
    constructor() { this.parsers = PARSERS; }

    // Run all matching parsers against text. Returns:
    //   { vars: {...merged}, hits: [{parser, vars}] }
    autoExtract(text) {
      if (!text || typeof text !== 'string') return { vars: {}, hits: [] };
      const merged = {};
      const hits = [];
      for (const p of this.parsers) {
        let matched = false;
        try { matched = !!p.detect(text); } catch (_) { matched = false; }
        if (!matched) continue;
        let extracted = {};
        try { extracted = p.parse(text) || {}; } catch (_) { extracted = {}; }
        if (Object.keys(extracted).length) {
          hits.push({ parser: p.name, vars: extracted });
          for (const [k, v] of Object.entries(extracted)) merged[k] = v;
        }
      }
      return { vars: merged, hits };
    }

    // Short human-readable summary like "3 NTLM hashes, 12 users".
    summarize(hits) {
      if (!hits || !hits.length) return 'No known formats detected.';
      const parts = [];
      for (const { vars } of hits) {
        for (const [k, v] of Object.entries(vars)) {
          const n = Array.isArray(v) ? v.length : (typeof v === 'object' ? Object.keys(v).length : 1);
          parts.push(`${n}× ${k.replace(/_/g, ' ')}`);
        }
      }
      return parts.join(', ');
    }
  }

  window.WannaOutputParsers = new OutputParsers();
})();
