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
      detect: (t) => /Nmap scan report for|^\s*PORT\s+STATE\s+SERVICE/m.test(t),
      parse: (t) => {
        const vars = {};

        // "Nmap scan report for <hostname> (<ip>)"  OR  "Nmap scan report for <ip>"
        // The hostname is the entire token before " (" and isn't a pure IP.
        const target = t.match(/Nmap scan report for\s+(\S+?)(?:\s+\(([0-9.]+)\))?\s*$/m);
        if (target) {
          if (target[2]) {
            vars.target_ip = target[2];
            // target[1] is the hostname (rDNS) iff it isn't itself an IP
            if (!/^[0-9.]+$/.test(target[1])) vars.target_hostname = target[1];
          } else if (/^[0-9.]+$/.test(target[1])) {
            vars.target_ip = target[1];
          } else {
            vars.target_hostname = target[1];
          }
        }

        // Port lines. Accept "open" and "open|filtered" (common for UDP).
        // Format: "<port>/<proto>  <state>  <service>  [version...]"
        const ports = [];
        const services = {};
        const versioned = {};
        // [ \t]+ instead of \s+ everywhere to keep the line-local match from
        // wandering into the next line via the lazy version-group backtrack.
        const portRe = /^(\d{1,5})\/(tcp|udp)[ \t]+(open(?:\|filtered)?)[ \t]+(\S+)(?:[ \t]+([^\n]*))?$/gm;
        let m;
        while ((m = portRe.exec(t)) !== null) {
          const port = parseInt(m[1], 10);
          if (ports.includes(port)) continue;
          ports.push(port);
          services[String(port)] = m[4];
          if (m[5]) versioned[String(port)] = { service: m[4], version: m[5].trim() };
        }
        if (ports.length) {
          vars.open_ports = ports;
          vars.services = services;
          if (Object.keys(versioned).length) vars.services_versioned = versioned;
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
        // Format: $krb5tgs$<etype>$*<user>$<realm>$<spn>*$<hash>
        // user can contain $ (computer-account SPNs end in $), but the realm
        // separator is also $ — so capture up to the FIRST $ after the marker.
        const re = /\$krb5tgs\$\d+\$\*([^$]+)\$[^*]+\*\$[A-Fa-f0-9]+/g;
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
    //
    // hashcat's default --outfile/--show separator is `:` and the hash can
    // itself contain colons (kerberos: $krb5tgs$23$*user$realm$spn*$abc:def).
    // We can't unambiguously parse the kerberos form, so we ONLY recognize
    // the two unambiguous NTLM shapes and leave kerberos to chain capture
    // rules (which know the per-step format).
    //
    // Recognized shapes per line:
    //   1) <32-hex-nt>:<password>
    //   2) <32-hex-lm>:<32-hex-nt>:<password>
    {
      name: 'hashcat-cracked',
      detect: (t) => /^(?:[a-f0-9]{32}:){1,2}\S+/m.test(t),
      parse: (t) => {
        const vars = {};
        const cracked = [];
        const reThree = /^([a-f0-9]{32}):([a-f0-9]{32}):([^\n]+)$/gm;
        const reTwo   = /^([a-f0-9]{32}):([^\n]+)$/gm;
        let m;
        while ((m = reThree.exec(t)) !== null) {
          cracked.push({ hash: m[2], lm: m[1], password: m[3] });
        }
        // Re-scan for 2-field lines that DON'T already match the 3-field form.
        // We do this with a Set of starting offsets we already consumed.
        const consumed = new Set();
        reThree.lastIndex = 0;
        while ((m = reThree.exec(t)) !== null) consumed.add(m.index);
        while ((m = reTwo.exec(t)) !== null) {
          if (consumed.has(m.index)) continue;
          // Don't double-count NT-half that already appears as group 2 of a 3-field match.
          if (cracked.some((c) => c.hash === m[1])) continue;
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
