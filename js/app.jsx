/* global React, ReactDOM, CATEGORIES, COMMANDS, CHAINS, REQUIRES_META, PROTOCOL_META */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

/* ─────────────────────────────────────────────────────────────
   Icon — a minimal Feather-style set
   ───────────────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, ...rest }) => {
  const paths = {
    search:    <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    star:      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    'star-fill': <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>,
    globe:     <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    radar:     <><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="12" x2="20" y2="6"/></>,
    wifi:      <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    list:      <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    alert:     <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    target:    <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    box:       <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    'arrow-up': <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
    'arrow-down': <polyline points="6 9 12 15 18 9"/>,
    'arrow-right': <polyline points="9 18 15 12 9 6"/>,
    'arrow-left': <polyline points="15 18 9 12 15 6"/>,
    shuffle:   <><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></>,
    network:   <><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6" y2="14"/><line x1="18" y1="6" x2="18" y2="14"/><line x1="12" y1="2" x2="12" y2="14"/><circle cx="6" cy="4" r="2"/><circle cx="18" cy="4" r="2"/><circle cx="12" cy="2.5" r="0.5"/></>,
    copy:      <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    check:     <polyline points="20 6 9 17 4 12"/>,
    terminal:  <><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>,
    book:      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>,
    link:      <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    layers:    <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus:     <line x1="5" y1="12" x2="19" y2="12"/>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    chevron:   <polyline points="6 9 12 15 18 9"/>,
    external:  <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
    docs:      <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    play:      <polygon points="5 3 19 12 5 21 5 3"/>,
    menu:      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    sidebar:   <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></>,
    'panel-left':  <><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/><rect x="3" y="4" width="6" height="16" rx="2" fill="currentColor" stroke="none" opacity="0.45"/></>,
    'panel-right': <><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="15" y1="4" x2="15" y2="20"/><rect x="15" y="4" width="6" height="16" rx="2" fill="currentColor" stroke="none" opacity="0.45"/></>,
    'panel-split': <><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></>,
    // Phase-specific icons
    eye:       <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    bug:       <><rect x="8" y="6" width="8" height="14" rx="4"/><line x1="12" y1="6" x2="12" y2="20"/><line x1="2" y1="11" x2="8" y2="11"/><line x1="16" y1="11" x2="22" y2="11"/><line x1="2" y1="17" x2="8" y2="17"/><line x1="16" y1="17" x2="22" y2="17"/><line x1="9" y1="3" x2="11" y2="6"/><line x1="15" y1="3" x2="13" y2="6"/></>,
    crosshair: <><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2" fill="currentColor"/></>,
    package:   <><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    'shield-up':  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 8 15 11"/><line x1="12" y1="8" x2="12" y2="15"/></>,
    'shield-win': <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="12" y1="6" x2="12" y2="17"/></>,
    sitemap:   <><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v3M5 17v-4h14v4"/></>,
    swap:      <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>,
    key:       <><circle cx="8" cy="15" r="4"/><line x1="10.85" y1="12.15" x2="19" y2="4"/><line x1="18" y1="5" x2="20" y2="7"/><line x1="15" y1="8" x2="17" y2="10"/></>,
    lock:      <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    linux:     <path d="M12 2a4 4 0 0 1 4 4c0 1-.4 1.9-1 2.6L17 14l1 4-3-2-3 2-3-2-3 2 1-4 2-5.4A4 4 0 0 1 8 6a4 4 0 0 1 4-4z"/>,
    windows:   <path d="M3 5.3 11 4v7H3zM12 4l9-1.5V11h-9zM3 13h8v7L3 18.7zM12 13h9v8.5L12 20z"/>,
    sparkle:   <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name] || null}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   Lookup tables + helpers
   ───────────────────────────────────────────────────────────── */
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const SUB_MAP = {};
CATEGORIES.forEach(c => c.subcategories.forEach(s => {
  SUB_MAP[s.id] = { ...s, category: c.id, hue: c.hue };
}));

// Disciplines (PT/Web, WiFi, …) — top-level mode that swaps the whole phase set
const DISCS = window.DISCIPLINES || [
  { id: 'pt', name: 'Pentest', short: 'PT', icon: 'crosshair', showPlatform: true,
    targetFields: [], accessOptions: [{ value: 'all', label: 'Qualsiasi accesso' }] },
];
const DISC_MAP = Object.fromEntries(DISCS.map(d => [d.id, d]));
const catsForDiscipline = (id) => CATEGORIES.filter(c => (c.domain || 'pt') === id);

/* ─────────────────────────────────────────────────────────────
   Suggerimento automatico dei filtri dal template.
   Legge template + varianti e propone platform / requires / protocols.
   È un SUGGERIMENTO: i campi restano editabili a mano. I casi ambigui
   (brute-force dove la password è il bersaglio; ticket/cert generati
   dentro la card e non posseduti) usano il default più comune e vanno
   riletti dall'operatore. lintFilters segnala le incoerenze al salvataggio.
   ───────────────────────────────────────────────────────────── */
const _joinTmpl = (template, variants) =>
  [template, ...(variants || []).map(v => v.template)].filter(Boolean).join('\n');
const _disciplineOfCat = (catId) => {
  const c = CATEGORIES.find(x => x.id === catId);
  return (c && c.domain) || 'pt';
};

const _WIN_RE = /(^|\n|\|)\s*(reg |reg\.exe|powershell|Get-[A-Z]|Set-[A-Z]|Add-[A-Z]|New-[A-Z]|Remove-[A-Z]|Import-Module|Invoke-[A-Z]|cmd\.exe|cmd \/|dir \/|findstr|net user|net localgroup|net group|nltest|sc\.exe|sc config|wmic|schtasks|certutil|bitsadmin|icacls|takeown|robocopy|cmdkey|runas|systeminfo|netsh|msiexec|regsvr32|whoami \/)/;
const _NIX_RE = /(^|\n)\s*(iw |iwconfig|iwlist|airmon|airodump|aireplay|aircrack|apt |apt-get|ip a|ip route|ip -|ifconfig|nmcli|hostapd|reaver|bully|mdk[34]|macchanger|dhclient|wpa_|systemctl|getcap|chmod |bash -i|sudo )/;
const _XPLAT_RE = /^(curl|nmap|python3?|openssl|sqlmap|whois|dig|host|nslookup|nc |ncat|wget|ssh |scp |sftp |ftp )/;

const _derivePlatform = (text) => {
  const win = _WIN_RE.test(text), nix = _NIX_RE.test(text);
  if (win && nix) return 'cross-platform';
  if (win) return 'windows';
  if (_XPLAT_RE.test(text.trim())) return 'cross-platform';
  return 'linux';
};

const _deriveRequiresPT = (text, tags, category) => {
  // brute/spray: le credenziali sono il bersaglio, non un possesso → no-creds
  const isBrute =
    /rockyou|passwords?\.txt|PASS_FILE|passwordspray|password ?spray|--continue-on-success|http-(get|post)-form|-P (\/usr|<wordlist>|passwords)|--usernames|--passwords/i.test(text) ||
    (tags || []).some(x => /brute|spray/i.test(x));
  // Segnale principale = il PLACEHOLDER nel template (<password>, <hash>, <pfx>…):
  // la sua presenza significa "quella credenziale ti serve". In più qualche flag
  // per i casi senza placeholder esplicito (-hashes, /pth:, KRB5CCNAME).
  const hasHash = /<hash>|<nthash>|<ntlmhash>|<rc4>|<aeskey>|<krbtgt>|-hashes|\/pth:|--hashes/i.test(text);
  const hasPw   = /<password>|<newpass>|<pass>|<community>/i.test(text);
  const usesPfx = /<pfx>|-pfx |auth -pfx/i.test(text);
  const producesPfx = /certipy-ad req\b|-out [^\s]*\.pfx|-on-behalf-of/.test(text);
  const usesTicket = /<ticket>|<tgt>|<tgs>|\.ccache|KRB5CCNAME|-k -no-pass/i.test(text);
  const producesTicket = /getST|getTGT|ticketer|asktgt|golden|silver|s4u/i.test(text);

  if (isBrute) {
    const r = ['no-creds'];
    if (hasHash) r.push('hash'); // es. pass-the-hash spray
    return r;
  }
  const req = [];
  if (hasPw) req.push('password');
  if (hasHash) req.push('hash');
  if (usesTicket && !producesTicket) req.push('ticket'); // ticket in input, non generato qui
  if (usesPfx && !producesPfx && !hasPw) req.push('cert'); // pfx come unico input
  if (req.length) return req;
  // senza credenziali: privesc e post-exploitation girano con una shell già ottenuta
  if (category === 'privesc' || category === 'post-exp') return ['shell'];
  return ['no-creds'];
};

const _deriveRequiresWifi = (text) => {
  const req = [];
  if (/aircrack-ng .*-w|cowpatty .*-f|hashcat -m ?2200|hashcat -m ?22000|-m 2500/i.test(text)) req.push('handshake');
  if (/hashcat -m ?16800|-m 16800/i.test(text)) req.push('pmkid');
  if (/hashcat -m ?5500|eapmd5pass|asleap/i.test(text)) req.push('eap-hash');
  if (/airdecap-ng .*-p|wpa_passphrase|pbkdf2_hmac/i.test(text)) req.push('psk');
  if (/wpa_supplicant|nmcli .*connect|dhclient/i.test(text)) { req.push('psk'); req.push('eap-creds'); }
  return req.length ? [...new Set(req)] : ['no-creds'];
};

const _PROTO_RULES = [
  [/nxc smb|smbclient|smbmap|smbexec|psexec\.py|impacket-psexec|:445|smbserver/, 'smb'],
  [/ldapsearch|ldap:\/\/|nxc ldap|windapsearch|ldapdomaindump|bloodhound|rusthound|adidnsdump/, 'ldap'],
  [/GetNPUsers|GetUserSPNs|getTGT|getST|kerbrute|\.ccache|-k -no-pass|certipy-ad auth|ticketer|KRB5CCNAME|kerberoast/i, 'kerberos'],
  [/winrm|evil-winrm/, 'winrm'],
  [/xfreerdp|:3389|nxc rdp|rdp-/, 'rdp'],
  [/rpcdump|impacket-rbcd|coercer|petitpotam|printerbug|dcomexec|wmiexec|atexec/i, 'rpc'],
  [/wmiexec|dcomexec|Get-CimInstance|wmic/, 'wmi'],
  [/\bdig\b|dnsrecon|dnsenum|dnsx|:53\b|axfr|nslookup|dnscmd/, 'dns'],
  [/mssql|:1433|impacket-mssqlclient|xp_cmdshell/i, 'mssql'],
  [/\bmysql\b|:3306/, 'mysql'],
  [/curl |https?:\/\/|wpscan|nikto|ffuf|gobuster|whatweb|nuclei|droopescan|:80\b|:443\b/, 'http'],
  [/ftp:\/\/|\bftp \b|lftp|:21\b/, 'ftp'],
  [/\bssh \b|\bscp \b|\bsftp \b|ssh -|:22\b/, 'ssh'],
  [/snmpwalk|snmpbulk|snmp-check|onesixtyone|braa|:161/, 'snmp'],
  [/swaks|smtp-user-enum|:25\b/, 'smtp'],
  [/showmount|mount -t nfs|:2049|\bnfs\b/, 'nfs'],
  [/redis-cli|:6379/, 'redis'],
  [/\bpsql\b|postgres|:5432/, 'postgresql'],
  [/mongosh|mongodb|:27017/, 'mongodb'],
  [/:9200|elasticsearch|_cat\/indices/, 'elastic'],
  [/memcached|memcstat|:11211/, 'memcached'],
  [/ipmitool|\bipmi\b/i, 'ipmi'],
  [/rsync/, 'rsync'],
  [/rtsp|:554/, 'rtsp'],
  [/vncviewer|:5900|vnc_/, 'vnc'],
  [/dcsync|secretsdump/i, 'dcsync'],
];
const _WIFI_PROTO_RULES = [
  [/wpa3|\bsae\b/i, 'wpa3'],
  [/wpa2|-m 22000/i, 'wpa2'],
  [/\bwpa\b/i, 'wpa'],
  [/\bwep\b|airdecap|arpreplay|chopchop|fragment|fakeauth|\.ivs/i, 'wep'],
  [/\bwps\b|reaver|bully|\bwash\b|pixie|wpspin/i, 'wps'],
  [/\beap\b|802\.1x|hostapd-wpe|eaphammer|radius|mschap/i, 'eap'],
  [/eapol|4-way|handshake/i, 'eapol'],
  [/pmkid/i, 'pmkid'],
  [/open\.conf|captive|--open/i, 'open'],
];
const _deriveProtocols = (text, disc) => {
  const rules = disc === 'wifi' ? _WIFI_PROTO_RULES : _PROTO_RULES;
  const out = [];
  for (const [re, p] of rules) if (re.test(text) && !out.includes(p)) out.push(p);
  if (disc === 'wifi' && !out.includes('802.11')) out.push('802.11');
  return out.slice(0, 4);
};

// Suggerimento completo per un comando in bozza.
const suggestFilters = ({ template, variants, category, tags }) => {
  const text = _joinTmpl(template, variants);
  const disc = _disciplineOfCat(category);
  return {
    platform: _derivePlatform(text),
    requires: disc === 'wifi' ? _deriveRequiresWifi(text) : _deriveRequiresPT(text, tags, category),
    protocols: _deriveProtocols(text, disc),
  };
};

// Controllo di coerenza (warning non bloccanti) su una bozza già compilata.
const lintFilters = ({ template, variants, category, platform, requires }) => {
  const text = _joinTmpl(template, variants);
  const disc = _disciplineOfCat(category);
  const req = (requires || []).map(s => s.trim()).filter(Boolean);
  const w = [];
  req.forEach(r => { if (!REQUIRES_META[r]) w.push(`"${r}" non è un valore di "Cosa hai" riconosciuto`); });
  const producesTicket = /getST|getTGT|ticketer|asktgt|golden|silver|s4u/i.test(text);
  const producesPfx = /certipy-ad req\b|-out [^\s]*\.pfx|-on-behalf-of/.test(text);
  if (/-H '?<hash>|-hashes|\/pth:|:<hash>@/.test(text) && !req.includes('hash'))
    w.push('il template usa un hash: aggiungere "hash" a "Cosa hai"?');
  if (/KRB5CCNAME|-k -no-pass/.test(text) && !producesTicket && !req.includes('ticket'))
    w.push('il template consuma un ticket Kerberos: aggiungere "ticket"?');
  if (/-pfx <|auth -pfx/.test(text) && !producesPfx && !req.includes('cert'))
    w.push('il template usa un certificato .pfx: aggiungere "cert"?');
  if (_WIN_RE.test(text) && !_NIX_RE.test(text) && platform !== 'windows')
    w.push('comandi Windows nel template ma piattaforma non impostata su "windows"');
  const acc = (DISC_MAP[disc] && DISC_MAP[disc].accessOptions || []).map(o => o.value);
  if (req.length && acc.length && !req.some(r => acc.includes(r)))
    w.push('nessun valore di "Cosa hai" è filtrabile in questa disciplina');
  return w;
};

const catColor = (hue) => `oklch(0.72 0.12 ${hue})`;
const catColorSoft = (hue) => `oklch(0.72 0.12 ${hue} / 0.14)`;

// Reorder a list by a saved array of ids (stable: unknown ids keep natural order, at the end)
const applyOrder = (list, order) => {
  if (!order || !order.length) return list;
  const pos = new Map(order.map((id, i) => [id, i]));
  return [...list].sort((a, b) =>
    (pos.has(a.id) ? pos.get(a.id) : Infinity) - (pos.has(b.id) ? pos.get(b.id) : Infinity));
};

const renderTemplate = (tmpl, values) => {
  const parts = [];
  const re = /<(\w+)>/g;
  let lastIndex = 0;
  let m;
  while ((m = re.exec(tmpl)) !== null) {
    if (m.index > lastIndex) parts.push({ type: 'text', text: tmpl.slice(lastIndex, m.index) });
    const key = m[1];
    const val = values[key];
    if (val && String(val).trim()) parts.push({ type: 'value', text: String(val) });
    else                            parts.push({ type: 'placeholder', text: `<${key}>` });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < tmpl.length) parts.push({ type: 'text', text: tmpl.slice(lastIndex) });
  return parts;
};
const renderTemplateString = (tmpl, values) =>
  renderTemplate(tmpl, values).map(t => t.text).join('');

// Lightweight rich text for descriptions: `code` spans, "- "/"• " bullet lists, line breaks
// Inline markdown → React nodes: `code`, **bold**, *italic*/_italic_.
// Bold is matched before italic so ** non viene letto come due delimitatori *.
const renderInline = (s, kp = 'i') => {
  if (s == null) return null;
  return String(s)
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g)
    .map((p, i) => {
      const key = kp + '-' + i;
      if (/^`[^`]+`$/.test(p))       return <code key={key}>{p.slice(1, -1)}</code>;
      if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={key}>{p.slice(2, -2)}</strong>;
      if (/^\*[^*\n]+\*$/.test(p) || /^_[^_\n]+_$/.test(p))
                                     return <em key={key}>{p.slice(1, -1)}</em>;
      return <React.Fragment key={key}>{p}</React.Fragment>;
    });
};
const renderRich = (text) => {
  if (!text) return null;
  const out = [];
  let list = null;
  String(text).split('\n').forEach((ln, i) => {
    const t = ln.trim();
    const m = t.match(/^[-•]\s+(.*)/);
    if (m) {
      (list = list || []).push(<li key={'li' + i}>{renderInline(m[1], 'li' + i)}</li>);
    } else {
      if (list) { out.push(<ul key={'ul' + i}>{list}</ul>); list = null; }
      if (t) out.push(<p key={'p' + i}>{renderInline(t, 'p' + i)}</p>);
    }
  });
  if (list) out.push(<ul key="ul-end">{list}</ul>);
  return out;
};

// Note callouts accept Markdown AND raw HTML, mixed (GitHub-style). Markdown
// shortcuts are expanded; any literal HTML you write passes through untouched.
// Only code-span contents are HTML-escaped, so `<?php …>` shows verbatim.
// Returns an HTML string (rendered via dangerouslySetInnerHTML — note text is
// author-controlled KB data, not third-party input).
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mdInline = (s) =>
  // split on code spans: their contents are escaped and skip markdown; every
  // other segment gets markdown applied, with any raw HTML left to pass through.
  s.split(/(`[^`]+`)/g).map((seg) =>
    seg.startsWith('`') && seg.endsWith('`') && seg.length > 1
      ? `<code>${escHtml(seg.slice(1, -1))}</code>`
      : seg
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')          // **bold**
          .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')          // *italic*
          .replace(/(^|[^a-zA-Z0-9_])_([^_\n]+)_/g, '$1<em>$2</em>')   // _italic_
  ).join('');

// Block-level: "# heading" → header bar, "- "/"• " → list, a line starting with
// "<" → raw HTML passthrough, anything else → paragraph. Blank line ends a list.
const markdownToHtml = (text) => {
  if (!text) return '';
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; } };
  String(text).split('\n').forEach((ln) => {
    const t = ln.trim();
    if (!t)                        { flush(); }
    else if (/^#{1,6}\s+/.test(t)) { flush(); out.push(`<h4>${mdInline(t.replace(/^#{1,6}\s+/, ''))}</h4>`); }
    else if (/^[-•]\s+/.test(t))   { (list = list || []).push(`<li>${mdInline(t.replace(/^[-•]\s+/, ''))}</li>`); }
    else if (t.startsWith('<'))    { flush(); out.push(t); }              // raw HTML block/line
    else                           { flush(); out.push(`<p>${mdInline(t)}</p>`); }
  });
  flush();
  return out.join('');
};

// Split a note into sections, one per top-level "# " heading, so each renders
// as its own callout box (visually separated). Single-heading notes → one box.
const splitNote = (text) => {
  if (!text) return [];
  const out = [];
  let cur = [];
  String(text).split('\n').forEach((ln) => {
    if (/^#\s+/.test(ln.trim()) && cur.some(l => l.trim())) {
      out.push(cur.join('\n')); cur = [ln];
    } else {
      cur.push(ln);
    }
  });
  if (cur.some(l => l.trim())) out.push(cur.join('\n'));
  return out;
};

const Pill = ({ tone, children }) => (
  <span className={`pill pill-${tone}`}>{children}</span>
);
const Proto = ({ name }) => (
  <span className={`proto proto-${PROTOCOL_META[name] || 'slate'}`}>{name}</span>
);

const RenderedCommand = ({ template, values }) => {
  const tokens = renderTemplate(template, values);
  return (
    <code>
      {tokens.map((t, i) => {
        if (t.type === 'placeholder')
          return <span key={i} className="tok-placeholder">{t.text}</span>;
        if (t.type === 'value')
          return <span key={i} className="tok-value">{t.text}</span>;
        const text = t.text;
        const out = [];
        const re = /(\b[A-Z_]{3,}=)|(\s-\-?[\w-]+)/g;
        let m, last = 0;
        while ((m = re.exec(text))) {
          if (m.index > last) out.push(text.slice(last, m.index));
          if (m[1]) out.push(<span key={`${i}-${m.index}`} className="tok-env">{m[1]}</span>);
          else      out.push(<span key={`${i}-${m.index}`} className="tok-flag">{m[2]}</span>);
          last = re.lastIndex;
        }
        if (last < text.length) out.push(text.slice(last));
        return <React.Fragment key={i}>{out}</React.Fragment>;
      })}
    </code>
  );
};

/* ─────────────────────────────────────────────────────────────
   Discipline switch — top-level mode (PT/Web · WiFi · …)
   Dropdown so it scales to any number of disciplines.
   ───────────────────────────────────────────────────────────── */
const DisciplineSwitch = ({ discipline, setDiscipline }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const cur = DISC_MAP[discipline] || DISCS[0];
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const MENU_W = 260;          // matches .disc-menu fixed width
      // centered left edge, clamped inside the viewport
      let left = r.left + r.width / 2 - MENU_W / 2;
      left = Math.min(Math.max(left, 8), window.innerWidth - 8 - MENU_W);
      setCoords({ top: r.bottom + 6, left });
    };
    place();
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);
  return (
    <div className="disc-switch" ref={ref}>
      <button ref={triggerRef} className={`disc-trigger ${open ? 'open' : ''}`}
              onClick={() => setOpen(o => !o)}
              title="Cambia disciplina">
        <Icon name={cur.icon} size={15} />
        <span className="disc-trigger-name">{cur.name}</span>
        <Icon name="chevron" size={12}
              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && coords && (
        <div className="disc-menu" role="listbox"
             style={{ position: 'fixed', top: coords.top, left: coords.left, right: 'auto' }}>
          {DISCS.map(d => (
            <button key={d.id} role="option" aria-selected={discipline === d.id}
                    className={`disc-menu-item ${discipline === d.id ? 'active' : ''}`}
                    onClick={() => { setDiscipline(d.id); setOpen(false); }}>
              <span className="disc-menu-icon"><Icon name={d.icon} size={15} /></span>
              <div className="disc-menu-text">
                <div className="disc-menu-name">{d.name}</div>
                {d.blurb && <div className="disc-menu-blurb">{d.blurb}</div>}
              </div>
              {discipline === d.id && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Sidebar — hierarchical tree
   ───────────────────────────────────────────────────────────── */
const Sidebar = ({ query, setQuery, searching,
                   activeCat, activeSub, setActive,
                   platform, setPlatform, access, setAccess,
                   counts, visibleCats,
                   categories, disciplineCfg,
                   expandedCats, toggleCatExpand, expandAll, collapseAll,
                   sidebarCollapsed, setSidebarCollapsed }) => (
  <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
    <div className="sidebar-header">
      <div className="logo-mark">
        <img src="assets/wannahack-icon.png" alt="WannaHack" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="logo-title">WannaHack</div>
        <div className="logo-sub">{disciplineCfg?.blurb || 'Pentest Cheatsheet'}</div>
      </div>
      <button className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(c => !c)}
              title={sidebarCollapsed ? 'Espandi sidebar (Ctrl+B)' : 'Comprimi sidebar (Ctrl+B)'}>
        <Icon name="sidebar" size={14} />
      </button>
    </div>

    <div className="sidebar-search">
      <Icon name="search" size={14} className="search-icon" />
      <input
        className="search-input"
        placeholder="Cerca comandi…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {query
        ? <button className="sidebar-search-clear" onClick={() => setQuery('')} title="Pulisci"><Icon name="x" size={12}/></button>
        : <span className="search-kbd">Ctrl K</span>}
    </div>

    <div className="filters">
      {disciplineCfg?.showPlatform && (
        <div>
          <label className="filter-label">Piattaforma</label>
          <select className="select" value={platform} onChange={e => setPlatform(e.target.value)}>
            <option value="all">Tutte</option>
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
            <option value="cross-platform">Cross-platform</option>
          </select>
        </div>
      )}
      <div>
        <label className="filter-label">Cosa hai</label>
        <select className="select" value={access} onChange={e => setAccess(e.target.value)}>
          {(disciplineCfg?.accessOptions || [{ value: 'all', label: 'Qualsiasi' }]).map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="divider"></div>

    <div className="nav-tree-controls">
      <button className="nav-tree-btn" onClick={expandAll} title="Espandi tutte le fasi (E)">
        <Icon name="plus" size={11}/> Espandi
      </button>
      <button className="nav-tree-btn" onClick={collapseAll} title="Comprimi tutte le fasi (C)">
        <Icon name="minus" size={11}/> Comprimi
      </button>
    </div>

    <nav className="nav-tree">
      <div className={`nav-all ${activeCat === 'all' ? 'active' : ''}`}
           onClick={() => setActive('all', null)}>
        <div className="nav-all-icon">
          <Icon name="layers" size={13} />
        </div>
        <span style={{ flex: 1 }}>Tutte le fasi</span>
        <span className="nav-sub-count">{counts.all || 0}</span>
      </div>

      {categories.map(c => {
        if (visibleCats && !visibleCats.has(c.id)) return null;
        const hasMatches = (counts[c.id] || 0) > 0;
        // During a search, auto-reveal phases that contain matches
        const expanded = expandedCats.has(c.id) || (searching && hasMatches);
        const isActive = activeCat === c.id;
        const visibleSubs = c.subcategories.filter(s => (counts[`${c.id}:${s.id}`] || 0) > 0);
        const searchClass = searching ? (hasMatches ? 'search-hit' : 'search-dim') : '';
        return (
          <div key={c.id}
               className={`nav-section ${expanded ? 'expanded' : ''} ${isActive ? 'active' : ''} ${searchClass}`}
               style={{ '--cat-color': catColor(c.hue) }}>
            <button className="nav-section-header"
                    title={c.name}
                    onClick={() => {
                      if (isActive) {
                        toggleCatExpand(c.id);
                      } else {
                        if (!expanded) toggleCatExpand(c.id);
                        setActive(c.id, null);
                      }
                    }}>
              <span className="nav-section-chevron"
                    onClick={(e) => { e.stopPropagation(); toggleCatExpand(c.id); }}>
                <Icon name="arrow-right" size={11} />
              </span>
              <span className="nav-cat-icon">
                <Icon name={c.icon} size={14} />
              </span>
              <span className="nav-cat-name">{c.name}</span>
              <span className="nav-cat-count">{counts[c.id] || 0}</span>
            </button>
            <div className="nav-section-body">
              <div>
                <div className="nav-section-body-inner">
                  {visibleSubs.map(s => (
                    <button key={s.id}
                            className={`nav-sub ${activeSub === s.id ? 'active' : ''}`}
                            onClick={() => setActive(c.id, s.id)}>
                      <span className="nav-sub-name">{s.name}</span>
                      <span className="nav-sub-count">{counts[`${c.id}:${s.id}`] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Flyout — visible only when sidebar collapsed and section is hovered */}
            <div className="nav-sub-flyout" aria-hidden="true">
              <div className="nav-sub-flyout-header">
                <Icon name={c.icon} size={14} />
                <span>{c.name}</span>
              </div>
              {visibleSubs.length === 0 ? (
                <div className="nav-sub-flyout-empty">Nessuna sotto-fase con comandi</div>
              ) : (
                <div className="nav-sub-flyout-list">
                  <button
                    className={`nav-sub ${isActive && !activeSub ? 'active' : ''}`}
                    onClick={() => setActive(c.id, null)}>
                    <span className="nav-sub-name" style={{ fontWeight: 600 }}>Tutta la fase</span>
                    <span className="nav-sub-count">{counts[c.id] || 0}</span>
                  </button>
                  {visibleSubs.map(s => (
                    <button key={s.id}
                            className={`nav-sub ${activeSub === s.id ? 'active' : ''}`}
                            onClick={() => setActive(c.id, s.id)}>
                      <span className="nav-sub-name">{s.name}</span>
                      <span className="nav-sub-count">{counts[`${c.id}:${s.id}`] || 0}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </nav>
  </aside>
);

/* ─────────────────────────────────────────────────────────────
   Top bar — mode switch with sliding indicator
   ───────────────────────────────────────────────────────────── */
const TopBar = ({ mode, setMode, activeCat, activeSub,
                  addMenuOpen, setAddMenuOpen,
                  onAddCommand, onAddChain, onExport, onImport,
                  onExportSourceCmds, onExportSourceChains, onResetAll, onShowShortcuts,
                  discipline, setDiscipline, showFavs, setShowFavs, favCount, onOpenAI,
                  layout, setLayout }) => {
  const modeRef = useRef(null);
  const menuRef = useRef(null);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!modeRef.current) return;
    const active = modeRef.current.querySelector('button.active');
    if (active) {
      modeRef.current.style.setProperty('--mode-indicator-x', `${active.offsetLeft}px`);
      modeRef.current.style.setProperty('--mode-indicator-w', `${active.offsetWidth}px`);
    }
  }, [mode]);

  // Position popup ABOVE the button (so it doesn't get clipped by topbar overflow)
  useEffect(() => {
    if (!addMenuOpen || !buttonRef.current || !popupRef.current) return;
    const reposition = () => {
      if (!buttonRef.current || !popupRef.current) return;
      const btn = buttonRef.current.getBoundingClientRect();
      const popup = popupRef.current;
      // Default: open downward below the button
      const popupHeight = popup.offsetHeight;
      const popupWidth  = popup.offsetWidth;
      const spaceBelow  = window.innerHeight - btn.bottom;
      const openUp = spaceBelow < popupHeight + 16;
      const top = openUp ? btn.top - popupHeight - 6 : btn.bottom + 6;
      const right = window.innerWidth - btn.right;
      popup.style.top = `${top}px`;
      popup.style.right = `${right}px`;
      popup.style.left = 'auto';
    };
    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [addMenuOpen]);

  // close menu on outside click
  useEffect(() => {
    if (!addMenuOpen) return;
    const onDown = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setAddMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [addMenuOpen]);

  const cat = activeCat !== 'all' ? CAT_MAP[activeCat] : null;
  const sub = activeSub ? SUB_MAP[activeSub] : null;
  return (
    <header className="topbar">
      <div className="mode-switch" role="tablist" ref={modeRef}>
        <button className={mode === 'library' ? 'active' : ''} onClick={() => setMode('library')}>
          <Icon name="list" size={13} /> Libreria
        </button>
        <button className={mode === 'chains' ? 'active' : ''} onClick={() => setMode('chains')}>
          <Icon name="link" size={13} /> Attack Chains
        </button>
      </div>
      <div className="crumb" style={{ marginLeft: 8 }}>
        <span className="crumb-sep">/</span>
        <strong>{cat ? cat.name : 'Tutte le fasi'}</strong>
        {sub && (
          <>
            <span className="crumb-sep">/</span>
            <span>{sub.name}</span>
          </>
        )}
      </div>
      <div className="spacer" />
      <DisciplineSwitch discipline={discipline} setDiscipline={setDiscipline} />
      <button className={`topbar-fav ${showFavs ? 'active' : ''}`}
              onClick={() => setShowFavs(v => !v)}
              title="Preferiti (F)">
        <Icon name={showFavs ? 'star-fill' : 'star'} size={15} />
        {favCount > 0 && <span className="topbar-fav-count">{favCount}</span>}
      </button>
      <button className="btn btn-ai" onClick={onOpenAI} title="Ricerca con AI">
        <Icon name="sparkle" size={14} /> AI
      </button>
      <div className="topbar-divider" />
      <div className="layout-toggle" role="group" aria-label="Vista pannelli">
        <button
          className={layout === 'list' ? 'active' : ''}
          onClick={() => setLayout('list')}
          title={mode === 'chains' ? 'Solo lista playbook' : 'Solo lista comandi'}>
          <Icon name="panel-left" size={14}/>
        </button>
        <button
          className={layout === 'split' ? 'active' : ''}
          onClick={() => setLayout('split')}
          title="Vista divisa (default)">
          <Icon name="panel-split" size={14}/>
        </button>
        <button
          className={layout === 'detail' ? 'active' : ''}
          onClick={() => setLayout('detail')}
          title={mode === 'chains' ? 'Solo dettaglio playbook' : 'Solo Builder'}>
          <Icon name="panel-right" size={14}/>
        </button>
      </div>
      <div className="add-menu" ref={menuRef}>
        <button className="btn btn-primary" ref={buttonRef} onClick={() => setAddMenuOpen(o => !o)}>
          <Icon name="plus" size={13} /> Aggiungi
          <Icon name="chevron" size={11}
                style={{ marginLeft: 2, transform: addMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {addMenuOpen && (
          <div className="add-menu-popup" ref={popupRef}>
            <button onClick={onAddCommand}>
              <Icon name="terminal" size={14} />
              <div>
                <div className="menu-item-title">Nuovo comando</div>
                <div className="menu-item-sub">Comando singolo con parametri</div>
              </div>
            </button>
            <button onClick={onAddChain}>
              <Icon name="link" size={14} />
              <div>
                <div className="menu-item-title">Nuovo playbook</div>
                <div className="menu-item-sub">Attack chain multi-step</div>
              </div>
            </button>
            <div className="add-menu-divider"></div>
            <button onClick={onExport}>
              <Icon name="box" size={14} />
              <div>
                <div className="menu-item-title">Esporta dati…</div>
                <div className="menu-item-sub">Scarica tutto come JSON</div>
              </div>
            </button>
            <button onClick={onImport}>
              <Icon name="docs" size={14} />
              <div>
                <div className="menu-item-title">Importa dati…</div>
                <div className="menu-item-sub">Ripristina da backup JSON</div>
              </div>
            </button>
            <div className="add-menu-divider"></div>
            <button onClick={onExportSourceCmds}>
              <Icon name="terminal" size={14} />
              <div>
                <div className="menu-item-title">Esporta data.js</div>
                <div className="menu-item-sub">Comandi come file sorgente .js</div>
              </div>
            </button>
            <button onClick={onExportSourceChains}>
              <Icon name="link" size={14} />
              <div>
                <div className="menu-item-title">Esporta chains.js</div>
                <div className="menu-item-sub">Playbook come file sorgente .js</div>
              </div>
            </button>
            <div className="add-menu-divider"></div>
            <button onClick={onResetAll} className="menu-item-danger">
              <Icon name="alert" size={14} />
              <div>
                <div className="menu-item-title">Pulisci cache</div>
                <div className="menu-item-sub">Ripristina ai dati originali (cancella le modifiche)</div>
              </div>
            </button>
          </div>
        )}
      </div>
      <button className="btn btn-icon" title="Scorciatoie da tastiera (?)" onClick={onShowShortcuts}>?</button>
    </header>
  );
};

/* ─────────────────────────────────────────────────────────────
   Target context bar
   ───────────────────────────────────────────────────────────── */
const TargetContext = ({ ctx, setCtx, collapsed, setCollapsed, fields }) => {
  const flds = (fields && fields.length) ? fields : [
    { key: 'ip',       label: 'IP',       placeholder: '10.10.10.11' },
    { key: 'user',     label: 'Utente',   placeholder: 'jdoe' },
    { key: 'password', label: 'Password', placeholder: '••••••', secret: true },
    { key: 'domain',   label: 'Dominio',  placeholder: 'corp.local' },
    { key: 'hash',     label: 'Hash',     placeholder: 'aad3b…', secret: true },
  ];
  const primary = flds[0];
  const isSecret = (f) => f.secret || f.key === 'password' || f.key === 'hash';
  return (
    <div className={`context-bar ${collapsed ? 'collapsed' : ''}`}>
      <div className="context-label">
        <Icon name="target" size={12} />
        Target
        {primary && ctx[primary.key] && <span className="target-host">{ctx[primary.key]}</span>}
        {collapsed && (
          <span className="context-chips">
            {flds.filter(f => f.key !== primary?.key && ctx[f.key]).map(f => (
              <span key={f.key} className="context-chip">
                <span className="context-chip-key">{f.label}</span>
                <span className="context-chip-val">
                  {isSecret(f)
                    ? '•'.repeat(Math.min(8, String(ctx[f.key]).length))
                    : ctx[f.key]}
                </span>
              </span>
            ))}
          </span>
        )}
      </div>
      <div className={`context-fields-wrap ${collapsed ? 'collapsed' : ''}`}>
        <div className="context-fields">
          {flds.map(f => (
            <div key={f.key} className="field">
              <label className="field-label">{f.label}</label>
              <input
                value={ctx[f.key] || ''}
                placeholder={f.placeholder}
                className={ctx[f.key] ? 'has-value' : ''}
                onChange={e => setCtx({ ...ctx, [f.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>
      <button className="context-collapse" onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Espandi target' : 'Comprimi target'}>
        <Icon name="chevron" size={14}
              style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .25s cubic-bezier(0.4, 0, 0.2, 1)' }}/>
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Command card
   ───────────────────────────────────────────────────────────── */
const CommandCard = React.memo(({ cmd, selected, onSelect, isFav, onToggleFav,
                       showProtocols, showTags, onEdit, onCopy, onReorder }) => {
  const cat = CAT_MAP[cmd.category];
  const [dragOver, setDragOver] = useState(null);   // 'top' | 'bottom'
  const [dragging, setDragging] = useState(false);
  const dropPos = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2 ? 'top' : 'bottom';
  };
  return (
    <div className={`cmd-card ${selected ? 'selected' : ''} ${dragging ? 'dragging' : ''} ${dragOver ? 'drag-over-' + dragOver : ''}`}
         data-cmd-id={cmd.id}
         style={{ '--cat-color': catColor(cat?.hue || 200) }}
         onClick={() => onSelect(cmd.id)}
         draggable
         onDragStart={e => { e.dataTransfer.setData('text/plain', cmd.id); e.dataTransfer.effectAllowed = 'move'; setDragging(true); }}
         onDragOver={e => { if (onReorder) { e.preventDefault(); setDragOver(dropPos(e)); } }}
         onDragLeave={() => setDragOver(null)}
         onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); const before = dropPos(e) === 'top'; setDragOver(null); onReorder && onReorder(id, cmd.id, before); }}
         onDragEnd={() => { setDragOver(null); setDragging(false); }}>
      <span className="cmd-card-spacer"></span>
      <div className="cmd-card-main">
        <div className="cmd-card-row">
          <h4 className="cmd-card-name">{cmd.name}</h4>
          {cmd.variants && <span className="variant-count">{cmd.variants.length}</span>}
          {cmd.group && <span className="cmd-card-subcat">{cmd.group}</span>}
        </div>
        <div className="cmd-card-syntax">{cmd.template}</div>
        <div className="cmd-card-pills">
          {cmd.requires.map(r => {
            const meta = REQUIRES_META[r];
            return meta ? <Pill key={r} tone={meta.tone}>{meta.label}</Pill> : null;
          })}
          {showProtocols && cmd.protocols.slice(0, 3).map(p =>
            <Proto key={p} name={p} />
          )}
        </div>
        {showTags && cmd.tags?.length > 0 && (
          <div className="cmd-card-tags">
            {cmd.tags.slice(0, 5).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button className={`cmd-card-star ${isFav ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); onToggleFav(cmd.id); }}
                title={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}>
          <Icon name={isFav ? 'star-fill' : 'star'} size={14} />
        </button>
        <button className="cmd-card-copy"
                onClick={e => { e.stopPropagation(); onCopy(cmd); }}
                title="Copia comando (valori dal Target)">
          <Icon name="copy" size={13} />
        </button>
        <button className="cmd-card-edit"
                onClick={e => { e.stopPropagation(); onEdit(cmd); }}
                title="Modifica comando">
          <Icon name="edit" size={13} />
        </button>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   Library subsection view — grouped commands
   ───────────────────────────────────────────────────────────── */
// Memoized: its props are all referentially stable except when the library view truly
// changes, so this no longer re-renders (253 cards) on a sidebar toggle or while typing
// in the Target bar / editing a command — removing the reconciliation hitch on frame 1.
const LibraryContent = React.memo(({ commands, activeCat, activeSub, chains,
                          selectedId, setSelectedId, favs, toggleFav,
                          onEdit, onCopy, onReorder, setMode, setActiveChainId, query,
                          collapsedGroups, toggleGroup, expandAllGroups, collapseAllGroups }) => {
  // Group commands by `group` field
  const groups = useMemo(() => {
    const g = {};
    commands.forEach(c => {
      const key = c.group || 'Altro';
      if (!g[key]) g[key] = [];
      g[key].push(c);
    });
    return g;
  }, [commands]);

  // Local "filter groups of this phase" search (distinct from global command search)
  const [groupQuery, setGroupQuery] = useState('');
  const [groupSearchOpen, setGroupSearchOpen] = useState(false);
  useEffect(() => { setGroupQuery(''); setGroupSearchOpen(false); }, [activeCat, activeSub]);

  // Global command search active → force every group open so matches are visible
  const searching = query.trim().length > 0;

  const cat = activeCat !== 'all' ? CAT_MAP[activeCat] : null;
  const sub = activeSub ? SUB_MAP[activeSub] : null;

  // Pertinent chains for this view
  // Show banner ONLY when a specific section is selected AND has chains.
  // "All Phases" never shows the banner (too generic).
  const pertinentChains = activeCat === 'all'
    ? []
    : chains.filter(ch =>
        sub ? ch.subcategory === sub.id : ch.category === activeCat
      );

  const heroTitle = searching
    ? `Risultati per “${query.trim()}”`
    : (sub ? sub.name : (cat ? cat.name : 'Tutti i comandi'));
  const heroDesc  = searching
    ? 'Ricerca globale in tutte le fasi — usa la sidebar per restringere a una fase.'
    : (sub ? (sub.description || cat?.description) : (cat?.description || 'Tutti i comandi del cheatsheet, raggruppati per fase.'));
  const hue       = cat?.hue || 165;
  const groupNames = Object.keys(groups);

  // "Cerca gruppi" (in-phase): narrows which groups are shown
  const gq = groupQuery.trim().toLowerCase();
  const matchedGroups = gq ? groupNames.filter(n => n.toLowerCase().includes(gq)) : groupNames;

  return (
    <div className="subsection-view" style={{ '--cat-color': catColor(hue), '--cat-color-soft': catColorSoft(hue) }}>
      <div className="subsection-hero">
        <div className="subsection-hero-tag">
          <span className="pulse-dot"></span>
          {searching ? 'RICERCA GLOBALE' : (cat ? cat.name.toUpperCase() : 'CHEATSHEET')}
          {!searching && sub && ' · ' + sub.name}
        </div>
        <h1>{heroTitle}</h1>
        {heroDesc && <p className="subsection-hero-desc">{heroDesc}</p>}
        <div className="subsection-hero-stats">
          <div><strong>{commands.length}</strong> <em>comandi</em></div>
          <div><strong>{groupNames.length}</strong> <em>gruppi</em></div>
          {pertinentChains.length > 0 && (
            <div><strong>{pertinentChains.length}</strong> <em>attack chains</em></div>
          )}
        </div>
      </div>

      {commands.length === 0 ? (
        <div className="no-results" style={{ padding: '60px 20px' }}>
          {searching ? (
            <>Nessun comando trovato per «{query.trim()}».</>
          ) : (
            <>
              Nessun comando in questa sezione (ancora).
              <br/>
              <small style={{ color: 'var(--fg-3)' }}>
                Aggiungine uno con "+ Aggiungi" in alto.
              </small>
            </>
          )}
        </div>
      ) : (
        <>
          {groupNames.length > 1 && !searching && (
            <div className="cmd-groups-toolbar">
              <button onClick={() => expandAllGroups(groupNames)} title="Espandi tutti i gruppi (G)">
                <Icon name="plus" size={11}/> Espandi
              </button>
              <button onClick={() => collapseAllGroups(groupNames)} title="Comprimi tutti i gruppi (G)">
                <Icon name="minus" size={11}/> Comprimi
              </button>
              <div className="cmd-groups-toolbar-spacer" />
              {groupSearchOpen && (
                <input
                  className="group-search-input"
                  autoFocus
                  placeholder="Filtra gruppi…"
                  value={groupQuery}
                  onChange={e => setGroupQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') { setGroupQuery(''); setGroupSearchOpen(false); } }}
                />
              )}
              <button
                className={`group-search-toggle ${groupSearchOpen ? 'active' : ''}`}
                title="Cerca gruppi in questa fase"
                onClick={() => setGroupSearchOpen(o => { if (o) setGroupQuery(''); return !o; })}>
                <Icon name="search" size={11}/> {groupSearchOpen ? 'Chiudi' : 'Cerca gruppi'}
              </button>
            </div>
          )}
          {matchedGroups.length === 0 ? (
            <div className="no-results" style={{ padding: '40px 20px' }}>
              Nessun gruppo per «{groupQuery.trim()}».
            </div>
          ) : Object.entries(groups).filter(([groupName]) => matchedGroups.includes(groupName)).map(([groupName, list]) => {
            const isCollapsed = searching ? false : collapsedGroups.has(groupName);
            return (
              <div key={groupName} className={`cmd-group ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="cmd-group-header" onClick={() => toggleGroup(groupName)}>
                  <span className="group-chevron">
                    <Icon name="chevron" size={12}/>
                  </span>
                  <h3>{groupName}</h3>
                  <div className="line"></div>
                  <span className="count">{list.length}</span>
                </div>
                <div className="cmd-group-body">
                  <div>
                    <div className="cmd-group-grid">
                      {list.map(c => (
                        <CommandCard key={c.id}
                                     cmd={c}
                                     selected={c.id === selectedId}
                                     onSelect={setSelectedId}
                                     isFav={favs.includes(c.id)}
                                     onToggleFav={toggleFav}
                                     showProtocols={true}
                                     showTags={false}
                                     onEdit={onEdit}
                                     onCopy={onCopy}
                                     onReorder={onReorder} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   Builder
   ───────────────────────────────────────────────────────────── */
const Builder = ({ cmd, ctx, onToast }) => {
  const [variantId, setVariantId] = useState('default');
  const [localValues, setLocalValues] = useState({});
  const [copied, setCopied] = useState(false);

  // Reset variant when command changes. Default to 'default' if present, else first variant id.
  useEffect(() => {
    const variants = cmd?.variants;
    if (variants && variants.length > 0) {
      const hasDefault = variants.some(v => v.id === 'default');
      setVariantId(hasDefault ? 'default' : variants[0].id);
    } else {
      setVariantId('default');
    }
    setLocalValues({});
  }, [cmd?.id]);

  if (!cmd) {
    return (
      <div className="builder-empty">
        <div className="icon"><Icon name="terminal" size={24} /></div>
        <h3>Seleziona un comando</h3>
        <p>Scegli un comando dalla lista per vedere i parametri e copiare la versione pronta all'uso.</p>
      </div>
    );
  }

  const variant = cmd.variants?.find(v => v.id === variantId);
  const template = (variant && variant.template) || cmd.template;

  const values = useMemo(() => {
    const v = {};
    (cmd.params || []).forEach(p => {
      v[p.key] = localValues[p.key] ?? (p.ctx ? ctx[p.ctx] : '') ?? '';
    });
    const re = /<(\w+)>/g;
    let m;
    while ((m = re.exec(template))) {
      const k = m[1];
      if (!(k in v)) v[k] = localValues[k] ?? '';
    }
    return v;
  }, [cmd, localValues, ctx, template]);

  const handleCopy = () => {
    const str = renderTemplateString(template, values);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str).then(() => {
        setCopied(true);
        onToast('Comando copiato negli appunti');
        setTimeout(() => setCopied(false), 1600);
      });
    }
  };

  // Mostra SOLO i parametri usati dal template attivo (variante), nell'ordine in cui compaiono.
  // Cambiando variante il template cambia → i campi si aggiornano da soli.
  const paramMap = new Map((cmd.params || []).map(p => [p.key, p]));
  const re = /<(\w+)>/g;
  const seenKeys = new Set();
  const params = [];
  let m;
  while ((m = re.exec(template))) {
    const k = m[1];
    if (seenKeys.has(k)) continue;
    seenKeys.add(k);
    params.push(paramMap.get(k) || { key: k, label: k.charAt(0).toUpperCase() + k.slice(1), placeholder: `Enter ${k}…` });
  }

  const platformIcon = cmd.platform === 'windows' ? 'windows' : (cmd.platform === 'linux' ? 'linux' : 'box');

  // Phase color of the selected command (cmd may be from any phase, even in "all" view)
  const phaseCat = CAT_MAP[cmd.category];
  const phaseColor = phaseCat ? catColor(phaseCat.hue) : 'var(--accent)';
  const phaseColorSoft = phaseCat ? catColorSoft(phaseCat.hue) : 'var(--accent-soft)';
  const refs = cmd.refs || [];

  return (
    <div className="builder" key={cmd.id}
         style={{ '--phase-color': phaseColor, '--phase-color-soft': phaseColorSoft }}>
      <div className="builder-head">
        <div style={{ flex: 1 }}>
          <h2 className="builder-title">{cmd.name}</h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {cmd.requires.map(r => {
              const meta = REQUIRES_META[r];
              return meta ? <Pill key={r} tone={meta.tone}>{meta.label}</Pill> : null;
            })}
            {cmd.protocols.map(p => <Proto key={p} name={p} />)}
          </div>
        </div>
        <span className="builder-platform">
          <Icon name={platformIcon} size={12} />
          {cmd.platform}
        </span>
      </div>

      <div className="builder-section">
        <h3 className="builder-section-title">
          <Icon name="book" size={12} /> Descrizione
        </h3>
        <div className="builder-description">{renderRich(cmd.description)}</div>
        {variant?.description && (
          <div className="builder-variant-note">
            <div className="builder-variant-note-head">
              <Icon name="shuffle" size={11} /> Variante · {variant.label}
            </div>
            <div className="builder-variant-note-body">{renderRich(variant.description)}</div>
          </div>
        )}
      </div>

      {cmd.variants && (
        <div className="variant-tabs">
          {cmd.variants.map(v => (
            <button key={v.id}
                    className={`variant-tab ${variantId === v.id ? 'active' : ''}`}
                    onClick={() => setVariantId(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
      )}

      {params.length > 0 && (
        <div className="builder-section">
          <h3 className="builder-section-title">
            <span className="accent-dot"></span> Parametri
          </h3>
          <div className="params-grid">
            {params.map(p => {
              const overridden = p.key in localValues;
              const resetToCtx = () => {
                if (!p.ctx) return;
                const next = { ...localValues };
                delete next[p.key];
                setLocalValues(next);
              };
              return (
                <div key={p.key} className="param">
                  <label className="param-label">
                    {p.label}
                    {p.ctx && (
                      <span
                        className={`ctx-hint ${overridden ? 'overridden' : ''}`}
                        onClick={resetToCtx}
                        title={overridden
                          ? `Click per ripristinare valore Target (${ctx[p.ctx] || 'vuoto'})`
                          : `Valore proveniente da Target.${p.ctx}`}>
                        ctx: {p.ctx}
                        {overridden && <Icon name="x" size={9} style={{ marginLeft: 2 }}/>}
                      </span>
                    )}
                  </label>
                  <input
                    placeholder={p.placeholder}
                    value={localValues[p.key] ?? (p.ctx ? ctx[p.ctx] : '') ?? ''}
                    onChange={e => setLocalValues({ ...localValues, [p.key]: e.target.value })}
                    className={values[p.key] ? 'has-value' : ''}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="generated">
        <div className="generated-head">
          <h4><Icon name="terminal" size={12} /> Comando generato</h4>
          <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            {copied ? 'Copiato' : 'Copia'}
          </button>
        </div>
        <div className="generated-body">
          <RenderedCommand template={template} values={values} />
        </div>
      </div>

      {cmd.note && (
        <div className="builder-callouts">
          {splitNote(cmd.note).map((sec, i) => (
            <div key={i} className="builder-callout"
                 dangerouslySetInnerHTML={{ __html: markdownToHtml(sec) }} />
          ))}
        </div>
      )}

      {refs.length > 0 && (
        <>
          <hr className="builder-divider" />
          <div className="builder-refs">
            <h3 className="builder-section-title">
              <Icon name="link" size={12} /> Riferimenti
            </h3>
            <div className="builder-refs-list">
              {refs.map((r, i) => {
                const url   = typeof r === 'string' ? r : r.url;
                const label = typeof r === 'string' ? r : (r.label || r.url);
                return (
                  <a key={i} className="builder-ref" href={url}
                     target="_blank" rel="noopener noreferrer" title={url}>
                    <Icon name="external" size={13} />
                    <span className="builder-ref-label">{label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Chains view
   ───────────────────────────────────────────────────────────── */
const CMD_MAP_BUILD = (commands) => Object.fromEntries(commands.map(c => [c.id, c]));

const ChainCard = ({ chain, active, progress, onClick, onReorder }) => {
  const total = chain.steps.length;
  const done = chain.steps.filter(s => progress?.steps?.[s.id]?.status === 'done').length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(false);
  const dropPos = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2 ? 'top' : 'bottom';
  };
  return (
    <div className={`chain-card ${active ? 'active' : ''} ${dragging ? 'dragging' : ''} ${dragOver ? 'drag-over-' + dragOver : ''}`}
         onClick={onClick}
         draggable
         onDragStart={e => { e.dataTransfer.setData('text/plain', chain.id); e.dataTransfer.effectAllowed = 'move'; setDragging(true); }}
         onDragOver={e => { if (onReorder) { e.preventDefault(); setDragOver(dropPos(e)); } }}
         onDragLeave={() => setDragOver(null)}
         onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); const before = dropPos(e) === 'top'; setDragOver(null); onReorder && onReorder(id, chain.id, before); }}
         onDragEnd={() => { setDragOver(null); setDragging(false); }}>
      <div className="chain-card-head">
        <h4 className="chain-card-name">{chain.name}</h4>
        <span className="chain-card-short">{chain.short}</span>
      </div>
      <div className="chain-card-tactic">{chain.tactic} · {chain.estTime}</div>
      <div className="chain-card-meta">
        <span className={`diff-pill diff-${chain.difficulty}`}>{chain.difficulty}</span>
        {chain.mitre.slice(0, 2).map(m => <span key={m} className="mitre">{m}</span>)}
      </div>
      <div className="chain-card-progress">
        <div className="chain-card-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="chain-card-stats">
        <span><strong>{done}</strong>/{total} step</span>
        <span>{Math.round(pct)}%</span>
      </div>
    </div>
  );
};

const Step = ({ commandsMap, step, idx, stepState, onToggleStatus, onUpdate,
                ctx, onToast, expanded, onToggleExpand, onEdit }) => {
  const cmd = step.cmd || (step.cmdRef ? commandsMap[step.cmdRef] : null);
  const variantList = cmd?.variants || [];
  // A step can run any of the command's variants; chain data may set a default via step.variant
  const [stepVariant, setStepVariant] = useState(
    step.variant || (variantList.some(v => v.id === 'default') ? 'default' : variantList[0]?.id) || 'default'
  );
  const activeVariant = variantList.find(v => v.id === stepVariant);

  const template = useMemo(() => {
    if (!cmd) return null;
    return (activeVariant && activeVariant.template) || cmd.template;
  }, [cmd, activeVariant]);

  // Mostra SOLO i parametri usati dal template attivo (variante), nell'ordine in cui compaiono.
  // Cambiando variante il template cambia → i campi si aggiornano da soli.
  const paramList = useMemo(() => {
    if (!cmd || !template) return [];
    const paramMap = new Map((cmd.params || []).map(p => [p.key, p]));
    const re = /<(\w+)>/g;
    const seen = new Set();
    const list = [];
    let m;
    while ((m = re.exec(template))) {
      const k = m[1];
      if (seen.has(k)) continue;
      seen.add(k);
      list.push(paramMap.get(k) || { key: k, label: k.charAt(0).toUpperCase() + k.slice(1) });
    }
    return list;
  }, [cmd, template]);

  const stepValues = stepState.values || {};

  // Resolved value per param: runtime override → static playbook override → Context → empty
  const values = useMemo(() => {
    const v = {};
    paramList.forEach(p => {
      v[p.key] = stepValues[p.key]
        ?? (step.overrides ? step.overrides[p.key] : undefined)
        ?? (p.ctx ? ctx[p.ctx] : '')
        ?? '';
    });
    return v;
  }, [paramList, stepValues, step.overrides, ctx]);

  const handleCopy = () => {
    if (!template) return;
    const s = renderTemplateString(template, values);
    navigator.clipboard?.writeText(s).then(() => onToast('Comando step copiato'));
  };

  const status = stepState.status || 'todo';

  return (
    <div className={`step ${status}`}>
      <div className="step-node" onClick={onToggleStatus} title="Cambia stato (todo → active → done)">
        {status === 'done' ? <Icon name="check" size={16}/> : idx + 1}
      </div>
      <div className="step-body">
        <div className="step-head" onClick={onToggleExpand}>
          <h4 className="step-title">{step.title}</h4>
          {cmd && (
            <span className="cmd-card-subcat" style={{ marginRight: 4 }}>
              {cmd.name}
            </span>
          )}
          <div className="step-actions" onClick={e => e.stopPropagation()}>
            <button className="step-action"
                    title="Salta step"
                    onClick={() => onUpdate({ status: status === 'skipped' ? 'todo' : 'skipped' })}>
              <Icon name="x" size={13}/>
            </button>
            <button className="step-action"
                    title={expanded ? 'Comprimi step' : 'Espandi step'}
                    onClick={onToggleExpand}>
              <Icon name="chevron" size={13}
                    style={{ transform: expanded ? 'none' : 'rotate(-90deg)', transition: 'transform .2s' }} />
            </button>
          </div>
        </div>

        <div className={`step-content-wrap ${expanded ? 'expanded' : ''}`}>
          <div className="step-content-inner">
            <div className="step-content">
              {cmd?.description && (
                <div className="step-desc">
                  {renderRich(cmd.description)}
                  {activeVariant?.description && (
                    <div className="step-variant-desc">{renderRich(activeVariant.description)}</div>
                  )}
                </div>
              )}

              {variantList.length > 0 && (
                <div className="variant-tabs">
                  {variantList.map(v => (
                    <button key={v.id}
                            className={`variant-tab ${stepVariant === v.id ? 'active' : ''}`}
                            onClick={() => setStepVariant(v.id)}>
                      {v.label}
                    </button>
                  ))}
                </div>
              )}

              {paramList.length > 0 && (
                <div className="captures">
                  <h5 className="captures-title">
                    <span className="dot"></span>
                    Parametri
                  </h5>
                  <div className="captures-grid">
                    {paramList.map(p => (
                      <div key={p.key} className="capture">
                        <label className="capture-label">
                          {p.label || p.key}
                          {p.ctx && <span className="ctx-tag">→ {p.ctx}</span>}
                        </label>
                        <input
                          placeholder={p.placeholder || p.key}
                          value={values[p.key] || ''}
                          className={values[p.key] ? 'has-value' : ''}
                          onChange={e => onUpdate({
                            values: { ...stepValues, [p.key]: e.target.value },
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {template && (
                <div className="step-command-preview">
                  <RenderedCommand template={template} values={values} />
                  <button className="copy-btn copy-btn-icon" onClick={handleCopy}
                          title="Copia comando">
                    <Icon name="copy" size={13}/>
                  </button>
                </div>
              )}

              {step.verify && (
                <div className="step-verify">
                  <span style={{ marginLeft: 4 }}>{renderInline(step.verify, 'verify')}</span>
                </div>
              )}

              <textarea
                className="step-notes"
                placeholder="// Note — output, osservazioni, gotchas…"
                value={stepState.notes || ''}
                onChange={e => onUpdate({ notes: e.target.value })}
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={status === 'done' ? 'btn' : 'btn btn-phase'}
                  onClick={() => onUpdate({ status: status === 'done' ? 'todo' : 'done' })}>
                  <Icon name="check" size={13} />
                  {status === 'done' ? 'Riapri' : 'Segna fatto'}
                </button>
                {onEdit && (
                  <button className="btn" onClick={onEdit} title="Modifica questo step (apre il playbook)">
                    <Icon name="edit" size={13} /> Modifica step
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChainsView = ({ chains, activeChainId, setActiveChainId,
                     progress, setProgress,
                     ctx, setCtx, onToast, commandsMap, dialog,
                     onEditChain, onEditStep, onNewChain, onReorderChain, layout }) => {
  const chain = chains.find(c => c.id === activeChainId) || chains[0];

  // Step expansion is controlled here so we can expand/collapse all at once.
  // openSteps[id] = explicit bool; missing = per-step default (active or first).
  const [openSteps, setOpenSteps] = useState({});
  useEffect(() => { setOpenSteps({}); }, [activeChainId]);

  if (!chain) return (
    <div className="chain-empty">
      <div className="icon"><Icon name="link" size={28} /></div>
      <h3>Nessuna chain in questa sezione</h3>
      <p style={{ margin: 0, fontSize: 13 }}>
        Seleziona "Tutte le fasi" per vedere tutte le chain o crea un nuovo playbook con il bottone in alto.
      </p>
    </div>
  );
  const chainState = progress[chain.id] || { steps: {} };

  const updateStep = (stepId, patch) => {
    setProgress(p => {
      const c = p[chain.id] || { steps: {} };
      const prev = c.steps[stepId] || {};
      return { ...p, [chain.id]: { ...c, steps: { ...c.steps, [stepId]: { ...prev, ...patch } } } };
    });
    // Step completato → si chiude da solo; se torna todo/active riprende il default di apertura
    if (patch.status === 'done') {
      setOpenSteps(m => ({ ...m, [stepId]: false }));
    } else if (patch.status) {
      setOpenSteps(m => { const { [stepId]: _drop, ...rest } = m; return rest; });
    }
  };

  const cycleStatus = (stepId) => {
    const cur = chainState.steps[stepId]?.status || 'todo';
    const order = ['todo', 'active', 'done'];
    const next = order[(order.indexOf(cur) + 1) % order.length];
    updateStep(stepId, { status: next });
  };

  const stepOpen = (s, i) =>
    openSteps[s.id] ?? (chainState.steps[s.id]?.status === 'active' || i === 0);
  const toggleStep = (id, cur) => setOpenSteps(m => ({ ...m, [id]: !cur }));
  const setAllSteps = (val) =>
    setOpenSteps(Object.fromEntries(chain.steps.map(s => [s.id, val])));

  const resetChain = () => {
    dialog({
      type: 'warning',
      title: 'Azzerare progresso playbook?',
      message: `Tutti gli stati degli step, i valori inseriti e le note per "${chain.name}" saranno cancellati.`,
      confirmLabel: 'Azzera',
      cancelLabel: 'Mantieni',
      onConfirm: () => setProgress(p => ({ ...p, [chain.id]: { steps: {} } })),
    });
  };

  const doneCount = chain.steps.filter(s => chainState.steps[s.id]?.status === 'done').length;
  const progressFill = chain.steps.length > 0 ? doneCount / chain.steps.length : 0;

  // Phase color for this chain — cascades to step buttons (var --phase-color)
  const phaseCat = CAT_MAP[chain.category];
  const chainStyle = {
    '--phase-color': phaseCat ? catColor(phaseCat.hue) : 'var(--accent)',
    '--phase-color-soft': phaseCat ? catColorSoft(phaseCat.hue) : 'var(--accent-soft)',
  };

  return (
    <div className={`chains-view layout-${layout || 'split'}`} style={chainStyle}>
      <aside className="chain-list-panel">
        <div className="panel-header">
          <h3 className="panel-title">Playbook</h3>
          <div className="panel-count"><strong>{chains.length}</strong> chain</div>
        </div>
        <div className="chain-list-body">
          {chains.map(c => (
            <ChainCard key={c.id}
                       chain={c}
                       active={c.id === chain.id}
                       progress={progress[c.id]}
                       onClick={() => setActiveChainId(c.id)}
                       onReorder={onReorderChain} />
          ))}
          {onNewChain && (
            <button className="btn" onClick={onNewChain}
                    style={{ justifyContent: 'center', borderStyle: 'dashed', marginTop: 4 }}>
              <Icon name="plus" size={13}/> Nuovo playbook
            </button>
          )}
        </div>
      </aside>

      <section className="chain-detail">
        <div className="chain-hero">
          <div className="chain-hero-tag">
            <span className="pulse-dot"></span>
            PLAYBOOK ATTIVO · {chain.tactic}
          </div>
          <h1>{chain.name}</h1>
          <p className="chain-hero-objective">{chain.objective}</p>
          <div className="chain-hero-meta">
            <div><strong>Risultato</strong><span>{chain.outcome}</span></div>
            <div>
              <strong>Difficoltà</strong>
              <span className={`diff-pill diff-${chain.difficulty}`} style={{ marginTop: 2 }}>
                {chain.difficulty}
              </span>
            </div>
            <div><strong>Tempo stimato</strong><span>{chain.estTime}</span></div>
            <div>
              <strong>MITRE ATT&amp;CK</strong>
              <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {chain.mitre.map(m => <span key={m} className="mitre">{m}</span>)}
              </span>
            </div>
            <div><strong>Progresso</strong><span>{doneCount} / {chain.steps.length} step</span></div>
          </div>
          {chain.prereqs && chain.prereqs.length > 0 && (
            <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--fg-2)' }}>
              <strong style={{ color: 'var(--fg-3)', fontSize: 10, letterSpacing: '0.08em',
                              textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                Prerequisiti
              </strong>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                {chain.prereqs.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {chain.refs && chain.refs.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong style={{ color: 'var(--fg-3)', fontSize: 10, letterSpacing: '0.08em',
                              textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Riferimenti
              </strong>
              <div className="builder-refs-list">
                {chain.refs.map((r, i) => {
                  const url   = typeof r === 'string' ? r : r.url;
                  const label = typeof r === 'string' ? r : (r.label || r.url);
                  return (
                    <a key={i} className="builder-ref" href={url}
                       target="_blank" rel="noopener noreferrer" title={url}>
                      <Icon name="external" size={13} />
                      <span className="builder-ref-label">{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          <div className="chain-hero-actions">
            {onEditChain && (
              <button className="btn" onClick={() => onEditChain(chain)}>
                <Icon name="edit" size={13} /> Modifica playbook
              </button>
            )}
            <button className="btn" onClick={resetChain}>Azzera progresso</button>
          </div>
        </div>

        {chain.steps.length > 1 && (
          <div className="chain-steps-toolbar">
            <button onClick={() => setAllSteps(true)} title="Espandi tutti gli step">
              <Icon name="plus" size={11}/> Espandi step
            </button>
            <button onClick={() => setAllSteps(false)} title="Comprimi tutti gli step">
              <Icon name="minus" size={11}/> Comprimi step
            </button>
          </div>
        )}

        <div className="chain-steps" style={{ '--progress': progressFill }}>
          {chain.steps.map((s, i) => {
            const isOpen = stepOpen(s, i);
            return (
              <Step key={`${chain.id}-${s.id}`}
                    commandsMap={commandsMap}
                    step={s}
                    idx={i}
                    stepState={chainState.steps[s.id] || {}}
                    onToggleStatus={() => cycleStatus(s.id)}
                    onUpdate={(patch) => updateStep(s.id, patch)}
                    ctx={ctx}
                    onToast={onToast}
                    expanded={isOpen}
                    onToggleExpand={() => toggleStep(s.id, isOpen)}
                    onEdit={onEditStep ? () => onEditStep(chain.id, s.id) : null} />
            );
          })}
        </div>
      </section>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Dialog popup (replaces native alert/confirm)
   ───────────────────────────────────────────────────────────── */
const Dialog = ({ dialog, onClose }) => {
  // Keyboard — registered unconditionally to obey hooks rules
  useEffect(() => {
    if (!dialog) return;
    const onConfirm = dialog.onConfirm;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') {
        if (onConfirm) onConfirm();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, onClose]);

  if (!dialog) return null;
  const {
    type = 'info',        // info | warning | danger | success | confirm
    title,
    message,
    confirmLabel = 'OK',
    cancelLabel = 'Annulla',
    onConfirm,
  } = dialog;
  const variant = (type === 'confirm') ? 'warning' : type;
  const iconName = {
    info: 'docs', warning: 'alert', danger: 'alert',
    success: 'check', confirm: 'alert',
  }[type] || 'docs';

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true">
        <div className={`dialog-icon dialog-icon-${variant}`}>
          <Icon name={iconName} size={22} />
        </div>
        <div className="dialog-body">
          {title && <h3 className="dialog-title">{title}</h3>}
          <p className="dialog-message">{message}</p>
        </div>
        <div className="dialog-footer">
          {onConfirm && (
            <button className="btn" onClick={onClose}>{cancelLabel}</button>
          )}
          <button
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { if (onConfirm) onConfirm(); onClose(); }}
            autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Shortcuts modal — keyboard reference (Windows-style keys)
   ───────────────────────────────────────────────────────────── */
const SHORTCUTS = [
  {
    group: 'Generale',
    items: [
      { keys: ['Ctrl', 'K'],  label: 'Focus sulla ricerca' },
      { keys: ['Ctrl', 'B'],  label: 'Apri / chiudi sidebar' },
      { keys: ['?'],          label: 'Apri questa modale' },
      { keys: ['Esc'],        label: 'Chiudi modali e popup' },
    ],
  },
  {
    group: 'Navigazione',
    items: [
      { keys: ['1'], label: 'Vai a Library' },
      { keys: ['2'], label: 'Vai a Attack Chains' },
      { keys: ['F'], label: 'Mostra / nascondi preferiti' },
    ],
  },
  {
    group: 'Sidebar (fasi)',
    items: [
      { keys: ['E'], label: 'Espandi tutte le fasi' },
      { keys: ['C'], label: 'Comprimi tutte le fasi' },
    ],
  },
  {
    group: 'Gruppi comandi',
    items: [
      { keys: ['G'], label: 'Espandi / comprimi tutti i gruppi' },
    ],
  },
];

const ShortcutsModal = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="shortcuts-modal" role="dialog" aria-modal="true">
        <div className="shortcuts-modal-header">
          <h2>
            <Icon name="key" size={16}/> Scorciatoie da tastiera
          </h2>
          <button className="btn-icon btn" onClick={onClose} title="Chiudi (Esc)">
            <Icon name="x" size={14}/>
          </button>
        </div>
        <div className="shortcuts-modal-body">
          {SHORTCUTS.map(group => (
            <div key={group.group}>
              <div className="shortcuts-group-title">{group.group}</div>
              {group.items.map((s, i) => (
                <div key={i} className="shortcut-row">
                  <span className="shortcut-label">{s.label}</span>
                  <span className="shortcut-keys">
                    {s.keys.map((k, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <span className="plus">+</span>}
                        <span className="kbd">{k}</span>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Edit / Add command modal
   ───────────────────────────────────────────────────────────── */
const EditModal = ({ cmd, defaultCat, defaultSub, onClose, onSave, onDelete, dialog }) => {
  const [form, setForm] = useState(() => ({
    id: cmd?.id || `custom-${Date.now()}`,
    name: cmd?.name || '',
    category: cmd?.category || defaultCat || CATEGORIES[0].id,
    subcategory: cmd?.subcategory || defaultSub || CATEGORIES[0].subcategories[0].id,
    group: cmd?.group || 'Other',
    description: cmd?.description || '',
    platform: cmd?.platform || 'linux',
    requires: (cmd?.requires || ['no-creds']).join(','),
    protocols: (cmd?.protocols || []).join(','),
    tags: (cmd?.tags || []).join(','),
    template: cmd?.template || '',
    params: cmd?.params || [],
    variants: cmd?.variants ? cmd.variants.map(v => ({ ...v })) : [],
    refs: (cmd?.refs || []).map(r => (typeof r === 'string' ? r : `${r.label || ''} | ${r.url}`)).join('\n'),
    note: cmd?.note || '',
  }));

  const cat = CATEGORIES.find(c => c.id === form.category);
  const subOptions = cat?.subcategories || [];

  useEffect(() => {
    // when category changes, default the sub to the first one
    if (!subOptions.find(s => s.id === form.subcategory)) {
      setForm(f => ({ ...f, subcategory: subOptions[0]?.id || '' }));
    }
  }, [form.category]);

  // auto-detect params from base template + ogni variante (una variante può usare
  // parametri non presenti nel template base: vanno comunque tenuti ed editabili).
  const detectedParams = useMemo(() => {
    const re = /<(\w+)>/g;
    const out = new Set();
    const scan = (t) => { let m; re.lastIndex = 0; while ((m = re.exec(t || ''))) out.add(m[1]); };
    scan(form.template);
    form.variants.forEach(v => scan(v.template));
    return [...out];
  }, [form.template, form.variants]);

  // sync params with detected
  useEffect(() => {
    const existing = new Map(form.params.map(p => [p.key, p]));
    const next = detectedParams.map(k =>
      existing.get(k) || { key: k, label: k.charAt(0).toUpperCase() + k.slice(1), placeholder: '' }
    );
    if (JSON.stringify(next) !== JSON.stringify(form.params)) {
      setForm(f => ({ ...f, params: next }));
    }
  }, [detectedParams]);

  const updateParam = (i, patch) => {
    setForm(f => {
      const next = [...f.params];
      next[i] = { ...next[i], ...patch };
      return { ...f, params: next };
    });
  };

  const addVariant = () => setForm(f => ({
    ...f,
    variants: [
      ...f.variants,
      // First variant added: prefill 'default' from base
      f.variants.length === 0
        ? { id: 'default', label: 'Default', template: f.template }
        : { id: `v${f.variants.length + 1}-${Date.now().toString(36).slice(-4)}`, label: '', template: '' },
    ],
  }));
  const removeVariant = (i) => setForm(f => ({
    ...f, variants: f.variants.filter((_, idx) => idx !== i),
  }));
  const updateVariant = (i, patch) => setForm(f => {
    const next = [...f.variants];
    next[i] = { ...next[i], ...patch };
    return { ...f, variants: next };
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.template.trim()) {
      dialog({
        type: 'warning',
        title: 'Campi mancanti',
        message: 'Nome e template sono richiesti per salvare il comando.',
        confirmLabel: 'Capito',
      });
      return;
    }
    // Filter out empty variants. Only include variants array if non-empty.
    const cleanVariants = form.variants
      .filter(v => (v.label || '').trim() && (v.template || '').trim())
      .map((v, i) => ({
        id: v.id || `v${i + 1}`,
        label: v.label.trim(),
        template: v.template.trim(),
        ...(v.description && v.description.trim() ? { description: v.description.trim() } : {}),
      }));
    // Parse refs: one per line, "Label | https://url" (bare URL also accepted)
    const cleanRefs = form.refs.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const bar = line.indexOf('|');
      return bar !== -1
        ? { label: line.slice(0, bar).trim(), url: line.slice(bar + 1).trim() }
        : { label: line, url: line };
    });
    onSave({
      id: form.id,
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory,
      group: form.group.trim() || 'Altro',
      description: form.description.trim(),
      platform: form.platform,
      requires: form.requires.split(',').map(s => s.trim()).filter(Boolean),
      protocols: form.protocols.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      template: form.template.trim(),
      params: form.params,
      ...(cleanVariants.length > 0 ? { variants: cleanVariants } : {}),
      ...(cleanRefs.length > 0 ? { refs: cleanRefs } : {}),
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
      isCustom: true,
    });
  };

  // Precompila Piattaforma + Cosa hai (e, dietro le quinte, i protocolli per i badge)
  // leggendo il template. I protocolli non hanno più un campo: senza filtro protocollo
  // la cura manuale non serve, restano nel dato solo per le pill sulle card.
  const [suggested, setSuggested] = useState(false);
  const applySuggestion = () => {
    const s = suggestFilters({
      template: form.template,
      variants: form.variants,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setForm(f => ({
      ...f,
      platform: s.platform,
      requires: s.requires.join(','),
      protocols: s.protocols.join(','),
    }));
    setSuggested(true);
    setTimeout(() => setSuggested(false), 1600);
  };
  // Warning di coerenza mostrati sotto i campi filtro (non bloccano il salvataggio).
  const filterWarnings = lintFilters({
    template: form.template,
    variants: form.variants,
    category: form.category,
    platform: form.platform,
    requires: form.requires.split(',').map(s => s.trim()).filter(Boolean),
  });

  // Vocabolario cliccabile (disciplina della categoria selezionata): così non serve
  // ricordare a memoria i valori di "Cosa hai" né i placeholder del Target.
  const _disc = _disciplineOfCat(form.category);
  const accessOpts = ((DISC_MAP[_disc] && DISC_MAP[_disc].accessOptions) || []).filter(o => o.value !== 'all');
  const targetFields = (DISC_MAP[_disc] && DISC_MAP[_disc].targetFields) || [];
  const reqSet = new Set(form.requires.split(',').map(s => s.trim()).filter(Boolean));
  const toggleReq = (val) => {
    const s = new Set(form.requires.split(',').map(x => x.trim()).filter(Boolean));
    s.has(val) ? s.delete(val) : s.add(val);
    setForm(f => ({ ...f, requires: [...s].join(',') }));
  };
  const insertPlaceholder = (key) => setForm(f => {
    const t = f.template;
    const sep = t && !/\s$/.test(t) ? ' ' : '';
    return { ...f, template: t + sep + '<' + key + '>' };
  });

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(760px, 94vw)' }}>
        <div className="modal-header">
          <h2>{cmd ? 'Modifica comando' : 'Aggiungi comando'}</h2>
          <button className="btn-icon btn" onClick={onClose} title="Chiudi (Esc)"><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="modal-row">
            <label>Nome</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                   placeholder="es. nxc smb — null session" />
          </div>
          <div className="modal-row-pair">
            <div className="modal-row">
              <label>Fase</label>
              <select value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="modal-row">
              <label>Sotto-sezione</label>
              <select value={form.subcategory}
                      onChange={e => setForm({ ...form, subcategory: e.target.value })}>
                {subOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-row">
            <label>Gruppo (nella sotto-sezione)</label>
            <input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}
                   placeholder="es. Null Session, Pillaging" />
          </div>
          <div className="modal-row mono">
            <label>Template — usa &lt;placeholder&gt; per i parametri</label>
            <textarea value={form.template}
                      onChange={e => setForm({ ...form, template: e.target.value })}
                      placeholder="netexec smb <ip> -u '<user>' -p '<password>' --shares" />
            {targetFields.length > 0 && (
              <div className="chip-row" style={{ marginTop: 8 }}>
                <span className="chip-row-label">Placeholder (clic per inserire):</span>
                {targetFields.map(f => (
                  <button key={f.key} type="button" className="chip mono"
                          onClick={() => insertPlaceholder(f.key)} title={f.label}>
                    &lt;{f.key}&gt;
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-head">
              <span className="form-section-title">Filtri</span>
              <button type="button" className={`btn-suggest ${suggested ? 'done' : ''}`}
                      onClick={applySuggestion} disabled={!form.template.trim()}
                      title="Compila Piattaforma e Cosa hai leggendo il template">
                {suggested ? '✓ Compilati' : '⚡ Suggerisci dal template'}
              </button>
            </div>
            <div className="modal-row-pair">
              <div className="modal-row">
                <label>Piattaforma</label>
                <select value={form.platform}
                        onChange={e => setForm({ ...form, platform: e.target.value })}>
                  <option value="linux">linux</option>
                  <option value="windows">windows</option>
                  <option value="cross-platform">cross-platform</option>
                </select>
              </div>
              <div className="modal-row" />
            </div>
            <div className="modal-row">
              <label>Cosa hai — requires <span className="form-hint">(clic per aggiungere/togliere)</span></label>
              {accessOpts.length > 0 && (
                <div className="chip-row" style={{ marginBottom: 6 }}>
                  {accessOpts.map(o => (
                    <button key={o.value} type="button"
                            className={`chip ${reqSet.has(o.value) ? 'on' : ''}`}
                            onClick={() => toggleReq(o.value)} title={o.label}>
                      {reqSet.has(o.value) ? '✓ ' : ''}{o.value}
                    </button>
                  ))}
                </div>
              )}
              <input value={form.requires}
                     onChange={e => setForm({ ...form, requires: e.target.value })}
                     placeholder="avanzato: password,hash" />
            </div>
            {filterWarnings.length > 0 && (
              <div className="filter-lint">
                <strong>⚠ Controllo filtri (non bloccante)</strong>
                <ul>{filterWarnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
          </div>

          <br />
          <div className="modal-row">
            <label>Descrizione</label>
            <textarea value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Cosa fa il comando, quando usarlo, gotchas…" />
          </div>
          <div className="modal-row mono">
            <label>Nota — callout Markdown e/o HTML, opzionale, appare prima dei Riferimenti</label>
            <textarea value={form.note}
                      onChange={e => setForm({ ...form, note: e.target.value })}
                      placeholder={'# 🔥 Titolo\nTesto con **grassetto**, `codice` e *corsivo*.\nAnche <kbd>HTML</kbd> inline è ammesso.'} />
          </div>
          <div className="modal-row">
            <label>Tag (separati da virgola)</label>
            <input value={form.tags}
                   onChange={e => setForm({ ...form, tags: e.target.value })}
                   placeholder="nxc, recon" />
          </div>
          <div className="modal-row mono">
            <label>Riferimenti — uno per riga: Etichetta | https://url</label>
            <textarea value={form.refs}
                      onChange={e => setForm({ ...form, refs: e.target.value })}
                      placeholder={'HackTricks — SMB | https://book.hacktricks.xyz/...\nNetExec wiki | https://www.netexec.wiki/...'} />
          </div>
          {form.params.length > 0 && (
            <div className="modal-row">
              <label>Parametri (rilevati automaticamente dal template)</label>
              <div className="params-editor">
                <div className="params-editor-header">
                  <span title="Auto — estratto dal template fra < >. Non modificabile.">
                    Chiave
                    <span className="hint-mark" title="Auto, presa dal template">?</span>
                  </span>
                  <span title="Nome leggibile mostrato nel Builder (es. 'Indirizzo IP', 'Nome utente').">
                    Etichetta
                    <span className="hint-mark" title="Nome mostrato all'utente">?</span>
                  </span>
                  <span title="Opzionale. Collega al Target Context per autofill. Valori: ip, user, password, domain, hash.">
                    ctx
                    <span className="hint-mark" title="Collega a Target: ip/user/password/domain/hash">?</span>
                  </span>
                  <span title="Testo di suggerimento (grigio) mostrato nel campo del Builder quando è vuoto. Es. il percorso di una wordlist.">
                    Placeholder
                    <span className="hint-mark" title="Hint grigio nel Builder. Non finisce nel comando finché non lo digiti/incolli.">?</span>
                  </span>
                </div>
                {form.params.map((p, i) => (
                  <div key={p.key} className="params-editor-row">
                    <input value={p.key} disabled title="Chiave (auto)" />
                    <input value={p.label} placeholder="es. Indirizzo IP"
                           onChange={e => updateParam(i, { label: e.target.value })} />
                    <input value={p.ctx || ''} placeholder="ip / user / password / domain / hash"
                           onChange={e => updateParam(i, { ctx: e.target.value || undefined })} />
                    <input value={p.placeholder || ''} placeholder=""
                           onChange={e => updateParam(i, { placeholder: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Varianti — alternative al template base */}
          <div className="modal-row">
            <label>
              Varianti (opzionale)
              <span className="hint-mark" title="Permettono di avere più versioni del comando. L'utente sceglie dal tab nel Builder.">?</span>
            </label>
            <div className="params-help">
              <h5><Icon name="layers" size={11}/> Cosa sono le varianti</h5>
              <p style={{ margin: 0 }}>
                Permettono di avere alternative al template base. Esempi:
                <br/>• <code>dig</code> → varianti <em>Any</em> / <em>MX</em> / <em>TXT</em>
                <br/>• <code>ftp</code> → <em>Auth</em> / <em>Anonymous</em>
                <br/>• <code>nmap</code> → <em>TCP</em> / <em>UDP</em> / <em>Full</em>
                <br/>L'utente sceglie la variante dai tab nel Builder. Lascia vuoto se non servono.
              </p>
            </div>
            {form.variants.length > 0 && (
              <div className="variants-editor">
                <div className="variants-editor-header">
                  <span>Etichetta</span>
                  <span>Template</span>
                  <span/>
                </div>
                {form.variants.map((v, i) => (
                  <div key={i} className="variant-edit-block">
                    <div className="variants-editor-row">
                      <input value={v.label || ''}
                             placeholder="es. Anonymous"
                             onChange={e => updateVariant(i, { label: e.target.value })}/>
                      <textarea value={v.template || ''}
                             placeholder="ftp -A <ip>"
                             className="mono"
                             rows={1}
                             onChange={e => updateVariant(i, { template: e.target.value })}/>
                      <button type="button" onClick={() => removeVariant(i)} title="Rimuovi variante">
                        <Icon name="x" size={11}/>
                      </button>
                    </div>
                    <input className="variant-desc-input"
                           value={v.description || ''}
                           placeholder="Descrizione variante (opzionale — sostituisce quella del comando)"
                           onChange={e => updateVariant(i, { description: e.target.value })}/>
                  </div>
                ))}
              </div>
            )}
            <button className="btn" type="button" onClick={addVariant}
                    style={{ alignSelf: 'flex-start', marginTop: 6 }}>
              <Icon name="plus" size={12}/> Aggiungi variante
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <div>
            {cmd && onDelete && (
              <button className="btn btn-danger-ghost" onClick={() => {
                dialog({
                  type: 'danger',
                  title: 'Eliminare questo comando?',
                  message: `"${form.name}" sarà rimosso dalla library. I comandi built-in vengono nascosti (riappaiono svuotando i dati del browser o reimportando).`,
                  confirmLabel: 'Elimina',
                  cancelLabel: 'Mantieni',
                  onConfirm: () => onDelete(form.id),
                });
              }}>
                <Icon name="x" size={13} /> Elimina comando
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Icon name="check" size={13} /> Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Shared per-step command editor — base library command + optional
   inline copy you can edit for that step only (never touches the library).
   Controlled: reads step.{cmdRef,cmd,variant}, reports changes via onChange.
   ───────────────────────────────────────────────────────────── */
const stepSyncParams = (tmpl, prev) => {
  const keys = [...new Set([...String(tmpl).matchAll(/<(\w+)>/g)].map(m => m[1]))];
  const map = new Map((prev || []).map(p => [p.key, p]));
  return keys.map(k => map.get(k) || { key: k, label: k.charAt(0).toUpperCase() + k.slice(1), placeholder: '' });
};
const cloneCmd = (c) => ({
  name: c?.name || '',
  ...(c?.description ? { description: c.description } : {}),
  template: c?.template || '',
  params: (c?.params || []).map(p => ({ ...p })),
  ...(c?.variants ? { variants: c.variants.map(v => ({ ...v })) } : {}),
});
// serialize an inline step command for saving (drops empty variants, syncs params)
const cleanInlineCmd = (cmd) => {
  if (!cmd || !(cmd.template || '').trim()) return undefined;
  const variants = (cmd.variants || [])
    .filter(v => (v.label || '').trim() && (v.template || '').trim())
    .map((v, i) => ({
      id: v.id || `v${i + 1}`, label: v.label.trim(), template: v.template.trim(),
      ...(v.description?.trim() ? { description: v.description.trim() } : {}),
    }));
  return {
    name: (cmd.name || '').trim() || 'Comando step',
    ...(cmd.description?.trim() ? { description: cmd.description.trim() } : {}),
    template: cmd.template.trim(),
    params: stepSyncParams(cmd.template, cmd.params),
    ...(variants.length ? { variants } : {}),
  };
};

const StepCommandEditor = ({ step, allCommands, onChange }) => {
  const custom = !!step.cmd;
  const libCmd = step.cmdRef ? allCommands.find(c => c.id === step.cmdRef) : null;
  const effCmd = step.cmd || libCmd;
  const variants = effCmd?.variants || [];

  const pickBase = (id) => {
    const c = allCommands.find(x => x.id === id) || null;
    // command changed → variant ids and override param keys no longer apply: reset them
    const base = { cmdRef: id, variant: '', overrides: [] };
    onChange(custom ? { ...base, cmd: cloneCmd(c) } : base);
  };
  const toggleCustom = (on) => onChange(on ? { cmd: cloneCmd(libCmd) } : { cmd: undefined });
  const updCmd = (patch) => onChange({ cmd: { ...step.cmd, ...patch } });
  const setTemplate = (t) => updCmd({ template: t, params: stepSyncParams(t, step.cmd?.params) });
  const vList = step.cmd?.variants || [];
  const vAdd = () => updCmd({ variants: [...vList, { id: `v${vList.length + 1}`, label: '', template: '', description: '' }] });
  const vUpd = (i, p) => updCmd({ variants: vList.map((v, idx) => idx === i ? { ...v, ...p } : v) });
  const vRm  = (i) => updCmd({ variants: vList.filter((_, idx) => idx !== i) });

  return (
    <div className="step-cmd-group">
      <div className="step-cmd-group-title"><Icon name="terminal" size={12}/> Comando</div>
      <div className="modal-row">
        <label>Base (library)</label>
        <select value={step.cmdRef || ''} onChange={e => pickBase(e.target.value)}>
          <option value="">— nessuno / personalizzato —</option>
          {allCommands.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <label className="step-custom-toggle">
        <input type="checkbox" checked={custom} onChange={e => toggleCustom(e.target.checked)} />
        Personalizza il comando per questo step (non modifica la library)
      </label>
      {custom ? (
        <div className="step-cmd-edit">
          <div className="modal-row">
            <label>Nome comando</label>
            <input value={step.cmd.name || ''} onChange={e => updCmd({ name: e.target.value })}
                   placeholder="es. dig — record DNS (step)" />
          </div>
          <div className="modal-row mono">
            <label>Template — usa &lt;placeholder&gt; per i parametri</label>
            <textarea value={step.cmd.template || ''} onChange={e => setTemplate(e.target.value)}
                      placeholder="dig +short txt <domain> @1.1.1.1" />
          </div>
          <div className="modal-row">
            <label>Descrizione</label>
            <textarea value={step.cmd.description || ''} onChange={e => updCmd({ description: e.target.value })}
                      placeholder="Cosa fa, quando usarlo…" />
          </div>
          <div className="step-editor-sub">
            <div className="step-editor-sub-head">
              <span className="step-editor-sub-title">
                <Icon name="shuffle" size={11}/> Varianti
              </span>
              <button type="button" onClick={vAdd} className="step-editor-add-mini">
                <Icon name="plus" size={10}/> Variante
              </button>
            </div>
            {vList.length > 0 && (
              <div className="variant-edit-list">
                {vList.map((v, vi) => (
                  <div key={vi} className="variant-edit-row">
                    <input value={v.label || ''} placeholder="Etichetta"
                           onChange={e => vUpd(vi, { label: e.target.value })} className="step-editor-input"/>
                    <textarea value={v.template || ''} placeholder="template" rows={1}
                           onChange={e => vUpd(vi, { template: e.target.value })} className="step-editor-input mono"/>
                    <input value={v.description || ''} placeholder="descrizione (opzionale)"
                           onChange={e => vUpd(vi, { description: e.target.value })} className="step-editor-input"/>
                    <button type="button" onClick={() => vRm(vi)} className="step-editor-remove" title="Rimuovi">
                      <Icon name="x" size={10}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        libCmd?.template && <div className="step-cmd-preview mono">{libCmd.template}</div>
      )}
      {variants.length > 0 && (
        <div className="modal-row">
          <label>Variante di default</label>
          <select value={step.variant || ''} onChange={e => onChange({ variant: e.target.value })}>
            <option value="">— prima / default —</option>
            {variants.map(v => <option key={v.id} value={v.id}>{v.label || v.id}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   New / Edit Playbook modal
   ───────────────────────────────────────────────────────────── */
const ChainModal = ({ chain, defaultCat, defaultSub, allCommands,
                       onClose, onSave, onDelete, dialog }) => {
  const [form, setForm] = useState(() => ({
    id: chain?.id || `chain-custom-${Date.now()}`,
    name: chain?.name || '',
    short: chain?.short || '',
    category: chain?.category || defaultCat || CATEGORIES[0].id,
    subcategory: chain?.subcategory || defaultSub || CATEGORIES[0].subcategories[0].id,
    tactic: chain?.tactic || '',
    difficulty: chain?.difficulty || 'medium',
    estTime: chain?.estTime || '',
    objective: chain?.objective || '',
    outcome: chain?.outcome || '',
    prereqs: (chain?.prereqs || []).join('\n'),
    mitre: (chain?.mitre || []).join(','),
    refs: (chain?.refs || []).map(r => (typeof r === 'string' ? r : `${r.label || ''} | ${r.url}`)).join('\n'),
    steps: chain?.steps?.map(s => ({
      ...s,
      // editor keeps overrides as an array {key,value}; serialized back to an object on save
      overrides: s.overrides && typeof s.overrides === 'object'
        ? Object.entries(s.overrides).map(([k, v]) => ({ key: k, value: v }))
        : [],
    })) || [
      { id: 's1', title: '', cmdRef: '', verify: '', overrides: [] },
    ],
  }));

  const cat = CATEGORIES.find(c => c.id === form.category);
  const subOptions = cat?.subcategories || [];
  useEffect(() => {
    if (!subOptions.find(s => s.id === form.subcategory)) {
      setForm(f => ({ ...f, subcategory: subOptions[0]?.id || '' }));
    }
  }, [form.category]);

  // Step blocks are collapsible — only the first is open by default
  const [openSteps, setOpenSteps] = useState(() => new Set([0]));
  const toggleStepOpen = (i) => setOpenSteps(s => {
    const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n;
  });
  const expandAllSteps = () => setOpenSteps(new Set(form.steps.map((_, i) => i)));
  const collapseAllSteps = () => setOpenSteps(new Set());

  const addStep = () => {
    setOpenSteps(s => new Set([...s, form.steps.length])); // open the new step
    setForm(f => ({
      ...f,
      steps: [
        ...f.steps,
        { id: `s${f.steps.length + 1}`, title: '', cmdRef: '',
          verify: '', overrides: [] },
      ],
    }));
  };
  const removeStep = (i) => {
    setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
    setOpenSteps(s => {
      const n = new Set();
      s.forEach(idx => { if (idx < i) n.add(idx); else if (idx > i) n.add(idx - 1); });
      return n;
    });
  };
  const updateStep = (i, patch) => setForm(f => {
    const next = [...f.steps];
    next[i] = { ...next[i], ...patch };
    return { ...f, steps: next };
  });

  // ── Overrides editor (per step) ────────────────────────────
  // overrides is an object {paramKey: value}. Editor maintains as ordered array internally,
  // serialized back to object on save to preserve schema.
  const stepOverrideKeys = (st) => {
    const cmd = st.cmd || (st.cmdRef ? allCommands.find(c => c.id === st.cmdRef) : null);
    if (!cmd) return [];
    const tmpl = (st.variant && cmd.variants?.find(v => v.id === st.variant)?.template) || cmd.template || '';
    return [...new Set([...String(tmpl).matchAll(/<(\w+)>/g)].map(m => m[1]))];
  };
  const addOverride = (stepIdx) => {
    const st = form.steps[stepIdx];
    const cur = st.overrides || [];
    if (cur.length >= stepOverrideKeys(st).length) return; // one override per parameter
    updateStep(stepIdx, { overrides: [...cur, { key: '', value: '' }] });
  };
  const removeOverride = (stepIdx, ovIdx) => {
    const arr = (form.steps[stepIdx].overrides || []).filter((_, idx) => idx !== ovIdx);
    updateStep(stepIdx, { overrides: arr });
  };
  const updateOverride = (stepIdx, ovIdx, patch) => {
    const arr = (form.steps[stepIdx].overrides || []).map((o, idx) =>
      idx === ovIdx ? { ...o, ...patch } : o
    );
    updateStep(stepIdx, { overrides: arr });
  };

  const handleSave = () => {
    if (!form.name.trim() || form.steps.length === 0 || !form.steps[0].title.trim()) {
      dialog({
        type: 'warning',
        title: 'Playbook incompleto',
        message: 'Nome e almeno uno step con titolo sono richiesti.',
        confirmLabel: 'Capito',
      });
      return;
    }
    // Riferimenti: uno per riga, "Etichetta | https://url" (accettato anche il solo URL)
    const chainRefs = form.refs.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const bar = line.indexOf('|');
      return bar !== -1
        ? { label: line.slice(0, bar).trim(), url: line.slice(bar + 1).trim() }
        : { label: line, url: line };
    });
    onSave({
      id: form.id,
      name: form.name.trim(),
      short: form.short.trim() || form.name.toLowerCase().slice(0, 8),
      category: form.category,
      subcategory: form.subcategory,
      tactic: form.tactic.trim() || 'Custom',
      difficulty: form.difficulty,
      estTime: form.estTime.trim() || '—',
      objective: form.objective.trim(),
      outcome: form.outcome.trim() || '—',
      prereqs: form.prereqs.split('\n').map(s => s.trim()).filter(Boolean),
      mitre: form.mitre.split(',').map(s => s.trim()).filter(Boolean),
      ...(chainRefs.length > 0 ? { refs: chainRefs } : {}),
      steps: form.steps.filter(s => s.title.trim()).map((s, i) => {
        const overridesObj = {};
        (s.overrides || []).forEach(({ key, value }) => {
          if (key && key.trim()) overridesObj[key.trim()] = value;
        });
        const hasOverrides = Object.keys(overridesObj).length > 0;
        const inlineCmd = cleanInlineCmd(s.cmd);
        return {
          id: s.id || `s${i + 1}`,
          title: s.title.trim(),
          ...(s.cmdRef ? { cmdRef: s.cmdRef } : {}),
          ...(inlineCmd ? { cmd: inlineCmd } : {}),
          ...(s.variant ? { variant: s.variant } : {}),
          ...(s.verify?.trim() ? { verify: s.verify.trim() } : {}),
          ...(hasOverrides ? { overrides: overridesObj } : {}),
        };
      }),
      isCustom: true,
    });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(880px, 94vw)' }}>
        <div className="modal-header">
          <h2>{chain ? 'Modifica playbook' : 'Nuovo playbook'}</h2>
          <button className="btn-icon btn" onClick={onClose} title="Chiudi (Esc)"><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="modal-row-pair">
            <div className="modal-row">
              <label>Nome</label>
              <input value={form.name}
                     onChange={e => setForm({ ...form, name: e.target.value })}
                     placeholder="es. SMB → SYSTEM via PrintNightmare" />
            </div>
            <div className="modal-row">
              <label>Tag breve</label>
              <input value={form.short}
                     onChange={e => setForm({ ...form, short: e.target.value })}
                     placeholder="es. printnight" />
            </div>
          </div>
          <div className="modal-row-pair">
            <div className="modal-row">
              <label>Fase</label>
              <select value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="modal-row">
              <label>Sotto-sezione</label>
              <select value={form.subcategory}
                      onChange={e => setForm({ ...form, subcategory: e.target.value })}>
                {subOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-row-pair">
            <div className="modal-row">
              <label>Tattica</label>
              <input value={form.tactic}
                     onChange={e => setForm({ ...form, tactic: e.target.value })}
                     placeholder="Privilege Escalation" />
            </div>
            <div className="modal-row">
              <label>Difficoltà</label>
              <select value={form.difficulty}
                      onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>
          </div>
          <div className="modal-row-pair">
            <div className="modal-row">
              <label>Tempo stimato</label>
              <input value={form.estTime}
                     onChange={e => setForm({ ...form, estTime: e.target.value })}
                     placeholder="15 min" />
            </div>
            <div className="modal-row">
              <label>MITRE (separati da virgola)</label>
              <input value={form.mitre}
                     onChange={e => setForm({ ...form, mitre: e.target.value })}
                     placeholder="T1078, T1649" />
            </div>
          </div>
          <div className="modal-row">
            <label>Obiettivo</label>
            <textarea value={form.objective}
                      onChange={e => setForm({ ...form, objective: e.target.value })}
                      placeholder="Cosa fa il playbook e quando usarlo…" />
          </div>
          <div className="modal-row-pair">
            <div className="modal-row">
              <label>Risultato</label>
              <textarea value={form.outcome}
                        onChange={e => setForm({ ...form, outcome: e.target.value })}
                        placeholder="NT hash di Administrator" />
            </div>
            <div className="modal-row">
              <label>Prerequisiti (uno per riga)</label>
              <textarea value={form.prereqs}
                        onChange={e => setForm({ ...form, prereqs: e.target.value })}
                        placeholder={"Credenziali valide per qualsiasi utente\nAccesso di rete al DC"} />
            </div>
            <div className="modal-row mono">
              <label>Riferimenti — uno per riga: Etichetta | https://url</label>
              <textarea value={form.refs}
                        onChange={e => setForm({ ...form, refs: e.target.value })}
                        placeholder={'Ligolo-ng — guida pivoting | https://medium.com/...'} />
            </div>
          </div>

          <div className="modal-row">
            <div className="step-editor-label-row">
              <label>Step</label>
              {form.steps.length > 1 && (
                <div className="step-editor-allbtns">
                  <button type="button" onClick={expandAllSteps}><Icon name="plus" size={10}/> Espandi</button>
                  <button type="button" onClick={collapseAllSteps}><Icon name="minus" size={10}/> Comprimi</button>
                </div>
              )}
            </div>
            <div className="step-editor">
              {form.steps.map((s, i) => {
                const isOpen = openSteps.has(i);
                const overridesArr = s.overrides || [];
                const stepCmd = s.cmd || (s.cmdRef ? allCommands.find(c => c.id === s.cmdRef) : null);
                // override keys = SOLO i parametri della variante scelta (fallback al base)
                const stepTmpl = stepCmd
                  ? ((s.variant && stepCmd.variants?.find(v => v.id === s.variant)?.template) || stepCmd.template || '')
                  : '';
                const overrideKeys = [...new Set([...String(stepTmpl).matchAll(/<(\w+)>/g)].map(m => m[1]))];
                return (
                  <div key={i} className={`step-editor-block ${isOpen ? '' : 'collapsed'}`}>
                    <div className="step-editor-head">
                      <button type="button" className="step-editor-toggle"
                              onClick={() => toggleStepOpen(i)}
                              title={isOpen ? 'Comprimi step' : 'Espandi step'}>
                        <Icon name="chevron" size={12}
                              style={{ transform: isOpen ? 'none' : 'rotate(-90deg)', transition: 'transform .2s' }}/>
                      </button>
                      <span className="step-editor-num">{i + 1}</span>
                      <input value={s.title}
                             onChange={e => updateStep(i, { title: e.target.value })}
                             placeholder="Titolo step (es. Enumera template vulnerabili)"
                             className="step-editor-input"/>
                      <button type="button" onClick={() => removeStep(i)}
                              className="step-editor-remove"
                              title="Rimuovi step">
                        <Icon name="x" size={11}/>
                      </button>
                    </div>

                    <div className={`step-editor-collapse ${isOpen ? 'open' : ''}`}>
                    <div className="step-editor-body">
                      <StepCommandEditor step={s} allCommands={allCommands}
                                         onChange={(patch) => updateStep(i, patch)} />

                      <div className="modal-section-title"><Icon name="check" size={12}/> Verify</div>
                      <input value={s.verify || ''}
                             onChange={e => updateStep(i, { verify: e.target.value })}
                             placeholder="es. `Got hash for administrator@…`"
                             className="step-editor-input mono"/>

                      <div className="step-editor-sub">
                        <div className="step-editor-sub-head">
                          <span className="step-editor-sub-title">
                            <Icon name="edit" size={11}/>
                            Override parametri comando (opzionale)
                          </span>
                          <button type="button" onClick={() => addOverride(i)} className="step-editor-add-mini"
                                  disabled={overridesArr.length >= overrideKeys.length}
                                  title={overridesArr.length >= overrideKeys.length ? 'Ogni parametro può avere un solo override' : ''}>
                            <Icon name="plus" size={10}/> Override
                          </button>
                        </div>
                        {stepCmd && overrideKeys.length > 0 && (
                          <div className="override-hint">
                            Param di <strong>{stepCmd.name}</strong>{s.variant ? ' (variante)' : ''}: <code>{overrideKeys.join('  ')}</code>
                          </div>
                        )}
                        {overridesArr.length > 0 && (
                          <div className="override-editor-grid">
                            <span className="capture-editor-h">Param key</span>
                            <span className="capture-editor-h">Valore</span>
                            <span/>
                            {overridesArr.map((o, oi) => (
                              <React.Fragment key={oi}>
                                <select value={o.key}
                                        onChange={e => updateOverride(i, oi, { key: e.target.value })}
                                        className="step-editor-input mono">
                                  <option value="">— param —</option>
                                  {overrideKeys
                                    .filter(k => k === o.key || !overridesArr.some((x, xi) => xi !== oi && x.key === k))
                                    .map(k => <option key={k} value={k}>{k}</option>)}
                                  {o.key && !overrideKeys.includes(o.key) && <option value={o.key}>{o.key}</option>}
                                </select>
                                <input value={o.value}
                                       placeholder="administrator  oppure  <hash>"
                                       onChange={e => updateOverride(i, oi, { value: e.target.value })}
                                       className="step-editor-input mono"/>
                                <button type="button" onClick={() => removeOverride(i, oi)}
                                        className="step-editor-remove" title="Rimuovi override">
                                  <Icon name="x" size={10}/>
                                </button>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })}
              <button className="btn" type="button" onClick={addStep}
                      style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                <Icon name="plus" size={12}/> Aggiungi step
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div>
            {chain && onDelete && (
              <button className="btn btn-danger-ghost" onClick={() => {
                dialog({
                  type: 'danger',
                  title: 'Eliminare questo playbook?',
                  message: `"${form.name}" sarà rimosso. I playbook built-in vengono nascosti (riappaiono svuotando i dati del browser o reimportando).`,
                  confirmLabel: 'Elimina',
                  cancelLabel: 'Mantieni',
                  onConfirm: () => onDelete(form.id),
                });
              }}>
                <Icon name="x" size={13} /> Elimina playbook
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Icon name="check" size={13} /> Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Single-step editor — edit one playbook step in isolation
   ───────────────────────────────────────────────────────────── */
const StepEditModal = ({ step, allCommands, onClose, onSave, onDelete, dialog }) => {
  const [form, setForm] = useState(() => ({
    id: step.id,
    title: step.title || '',
    cmdRef: step.cmdRef || '',
    cmd: step.cmd ? cloneCmd(step.cmd) : undefined, // inline copy, decoupled from library
    variant: step.variant || '',
    verify: step.verify || '',
    overrides: step.overrides && typeof step.overrides === 'object'
      ? Object.entries(step.overrides).map(([k, v]) => ({ key: k, value: v })) : [],
  }));
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const libCmd = form.cmdRef ? allCommands.find(c => c.id === form.cmdRef) : null;
  const effCmd = form.cmd || libCmd;
  const variants = effCmd?.variants || [];
  // override keys = SOLO i parametri della variante scelta (fallback al base)
  const stepTmpl = effCmd
    ? ((form.variant && variants.find(v => v.id === form.variant)?.template) || effCmd.template || '')
    : '';
  const overrideKeys = [...new Set([...String(stepTmpl).matchAll(/<(\w+)>/g)].map(m => m[1]))];

  // a parameter can be overridden once: filter out keys already used by other rows
  const availKeys = (oi) => {
    const used = form.overrides.filter((_, idx) => idx !== oi).map(o => o.key).filter(Boolean);
    return overrideKeys.filter(k => k === form.overrides[oi].key || !used.includes(k));
  };
  const ovFull = form.overrides.length >= overrideKeys.length;
  const addOv = () => { if (!ovFull) set({ overrides: [...form.overrides, { key: '', value: '' }] }); };
  const updOv = (i, patch) => set({ overrides: form.overrides.map((o, idx) => idx === i ? { ...o, ...patch } : o) });
  const rmOv  = (i) => set({ overrides: form.overrides.filter((_, idx) => idx !== i) });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    const ov = {};
    form.overrides.forEach(({ key, value }) => { if (key && key.trim()) ov[key.trim()] = value; });
    // inline command copy (step-local; never touches the library)
    const cmd = cleanInlineCmd(form.cmd);
    onSave({
      id: form.id,
      title: form.title.trim() || form.id,
      ...(form.cmdRef ? { cmdRef: form.cmdRef } : {}),
      ...(cmd ? { cmd } : {}),
      ...(form.variant ? { variant: form.variant } : {}),
      ...(form.verify.trim() ? { verify: form.verify.trim() } : {}),
      ...(Object.keys(ov).length ? { overrides: ov } : {}),
    });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(720px, 94vw)' }}>
        <div className="modal-header">
          <h2>Modifica step</h2>
          <button className="btn-icon btn" onClick={onClose} title="Chiudi (Esc)"><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="modal-row">
            <label>Titolo</label>
            <input value={form.title} onChange={e => set({ title: e.target.value })}
                   placeholder="Titolo dello step" />
          </div>
          <StepCommandEditor step={form} allCommands={allCommands} onChange={set} />

          <div className="modal-row mono">
            <div className="modal-section-title"><Icon name="check" size={12}/> Verify</div>
            <input value={form.verify} onChange={e => set({ verify: e.target.value })}
                   placeholder="es. `Got hash for administrator@…`" />
          </div>

          <div className="step-editor-sub">
            <div className="step-editor-sub-head">
              <span className="step-editor-sub-title">
                <Icon name="edit" size={11}/> Override parametri comando
              </span>
              <button type="button" onClick={addOv} className="step-editor-add-mini"
                      disabled={ovFull}
                      title={ovFull ? 'Ogni parametro può avere un solo override' : ''}>
                <Icon name="plus" size={10}/> Override
              </button>
            </div>
            {effCmd && overrideKeys.length > 0 && (
              <div className="override-hint">
                Param di <strong>{effCmd.name || 'comando'}</strong>{form.variant ? ' (variante)' : ''}: <code>{overrideKeys.join('  ')}</code>
              </div>
            )}
            {form.overrides.length > 0 && (
              <div className="override-editor-grid">
                <span className="capture-editor-h">Param key</span>
                <span className="capture-editor-h">Valore</span>
                <span/>
                {form.overrides.map((o, oi) => (
                  <React.Fragment key={oi}>
                    <select value={o.key} onChange={e => updOv(oi, { key: e.target.value })} className="step-editor-input mono">
                      <option value="">— param —</option>
                      {availKeys(oi).map(k => <option key={k} value={k}>{k}</option>)}
                      {o.key && !overrideKeys.includes(o.key) && <option value={o.key}>{o.key}</option>}
                    </select>
                    <input value={o.value} placeholder="administrator  oppure  <hash>"
                           onChange={e => updOv(oi, { value: e.target.value })} className="step-editor-input mono"/>
                    <button type="button" onClick={() => rmOv(oi)} className="step-editor-remove" title="Rimuovi">
                      <Icon name="x" size={10}/>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <div>
            {onDelete && (
              <button className="btn btn-danger-ghost"
                      onClick={() => dialog
                        ? dialog({ type: 'danger', title: 'Eliminare questo step?',
                                   message: `"${form.title || form.id}" sarà rimosso dal playbook.`,
                                   confirmLabel: 'Elimina', cancelLabel: 'Annulla', onConfirm: onDelete })
                        : onDelete()}>
                <Icon name="x" size={13}/> Elimina step
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Icon name="check" size={13} /> Salva step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   AI search (OpenAI) — natural-language → command / playbook.
   Key stored locally (localStorage), never leaves the browser
   except in the request to OpenAI. opsec warning shown.
   ───────────────────────────────────────────────────────────── */
const AI_DEFAULTS = {
  model: 'gpt-4.1-mini-2025-04-14',
  temperature: '0',
  maxResults: '15',
  maxTokens: '1000',
  webSearch: '0',
  alwaysExplain: '0',
};
const AI_DEFAULT_PROMPT =
`Sei l'assistente di ricerca di WannaHack per un penetration tester / red teamer in un ingaggio AUTORIZZATO (lab, CTF o pentest con mandato), disciplina "{{DISCIPLINE}}".
Compito: mappare la richiesta in linguaggio naturale dell'utente sui comandi e sui playbook elencati in fondo. Selezioni voci pertinenti dall'indice, non esegui nulla.

Output: restituisci ESCLUSIVAMENTE un oggetto JSON valido (RFC 8259), senza testo prima o dopo, senza commenti e senza racchiuderlo in blocchi di codice. Usa doppi apici e nessuna virgola finale.
Schema esatto:
{"commandIds": string[], "chainIds": string[], "explanation": string, "suggestedCommand": {"name": string, "template": string, "note": string} | null}

Come scegliere:
- Interpreta l'INTENTO, non solo le parole: gestisci sinonimi, termini IT/EN, nomi di tool e abbreviazioni (es. "scalare privilegi su windows" -> privesc Windows; "prendere l'handshake" -> cattura WPA).
- Valuta ogni voce su nome + fase + tag + descrizione. Preferisci i comandi piu' specifici e direttamente azionabili per l'obiettivo dell'utente; scarta i match solo vagamente correlati.
- Resta nella disciplina "{{DISCIPLINE}}". Le uniche fasi disponibili sono: {{PHASES}}. Non proporre attivita' fuori da queste.

Campi:
- commandIds: id dei comandi piu' pertinenti, dal piu' rilevante, massimo {{MAX_RESULTS}}, senza duplicati.
- chainIds: id dei playbook adatti allo scenario, massimo 3, per rilevanza.
- explanation: SOLO se l'utente chiede esplicitamente di spiegare/capire (es. "spiega", "perche'", "come funziona") -> massimo 3 frasi, in italiano, concettuali, senza sintassi di comandi. Altrimenti "".
- suggestedCommand: SOLO se l'utente chiede esplicitamente un comando assente o una variante con flag diversi E nessuna voce dell'indice lo copre gia'; altrimenti null. In esso: name = nome breve; template = una riga, con i segnaposto del Target di questa disciplina ({{TARGET_KEYS}}) dove servono, e nessun altro; note = una frase in italiano.

Vincoli:
- Usa SOLO id presenti nell'indice, copiati ESATTAMENTE (case-sensitive): non inventarli, non modificarli, non tradurli.
- Se nulla e' pertinente, rispondi: {"commandIds": [], "chainIds": [], "explanation": "", "suggestedCommand": null}.

COMANDI (id | nome | fase | tag | descrizione):
{{COMMAND_INDEX}}

PLAYBOOK (id | nome | obiettivo):
{{CHAIN_INDEX}}`;

// secret.env <-> object
const parseEnv = (text) => {
  const out = {};
  text.split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const i = t.indexOf('=');
    if (i < 0) return;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  });
  return out;
};
// Lenient JSON: a model (specie con web search ON) puo' avvolgere il JSON in
// prosa o fence. Prova il parse diretto, poi estrai il primo blocco {...}.
const parseModelJson = (text) => {
  if (typeof text !== 'string') return null;
  try { return JSON.parse(text); } catch {}
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
};
const buildEnv = (c) => [
  '# API Key (required)',
  `OPENAI_API_KEY=${c.apiKey || ''}`,
  '',
  '# Model Configuration',
  `OPENAI_MODEL=${c.model || ''}`,
  `OPENAI_TEMPERATURE=${c.temperature ?? '0'}`,
  `OPENAI_MAX_RESULTS=${c.maxResults ?? '15'}`,
  `OPENAI_MAX_TOKENS=${c.maxTokens ?? '1000'}`,
  '',
  '# Behaviour',
  `OPENAI_WEB_SEARCH=${c.webSearch ?? '0'}`,
  `OPENAI_ALWAYS_EXPLAIN=${c.alwaysExplain ?? '0'}`,
  '',
].join('\n');
const aiDownload = (name, text, mime) => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

const AISearchModal = ({ onClose, commands, chains, disciplineCfg,
                         onOpenCommand, onOpenChain }) => {
  const lsGet = (k) => { const v = localStorage.getItem(k); return v === null ? null : v; };
  // The saved search is per discipline: ids from Pentest mean nothing in WiFi.
  const lastKey = `cm-ai-last-${disciplineCfg?.id || 'pt'}`;
  const lastSaved = (() => { try { return JSON.parse(localStorage.getItem(lastKey) || 'null'); } catch { return null; } })();
  const [apiKey, setApiKey]           = useState(() => lsGet('cm-openai-key') ?? '');
  const [model, setModel]             = useState(() => lsGet('cm-openai-model'));
  const [temperature, setTemperature] = useState(() => lsGet('cm-openai-temp'));
  const [maxResults, setMaxResults]   = useState(() => lsGet('cm-openai-maxresults'));
  const [maxTokens, setMaxTokens]     = useState(() => lsGet('cm-openai-maxtokens'));
  const [webSearch, setWebSearch]     = useState(() => lsGet('cm-openai-websearch'));
  const [alwaysExplain, setAlwaysExplain] = useState(() => lsGet('cm-openai-always-explain'));
  const [promptTpl, setPromptTpl]     = useState(() => lsGet('cm-ai-prompt'));
  const [prompt, setPrompt]   = useState(() => lastSaved?.q || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(() => lastSaved?.result || null);
  const [models, setModels]               = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError]     = useState(null);
  const [modelManual, setModelManual]     = useState(false);
  const [showSettings, setShowSettings] = useState(() => !localStorage.getItem('cm-openai-key'));
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Load defaults from secret.env + ai-system-prompt.md (localStorage overrides win)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('config/secret.env', { cache: 'no-store' });
        if (!r.ok) throw 0;
        const env = parseEnv(await r.text());
        if (cancelled) return;
        setApiKey(v => v || env.OPENAI_API_KEY || '');
        setModel(v => v ?? (env.OPENAI_MODEL || AI_DEFAULTS.model));
        setTemperature(v => v ?? (env.OPENAI_TEMPERATURE ?? AI_DEFAULTS.temperature));
        setMaxResults(v => v ?? (env.OPENAI_MAX_RESULTS ?? AI_DEFAULTS.maxResults));
        setMaxTokens(v => v ?? (env.OPENAI_MAX_TOKENS ?? AI_DEFAULTS.maxTokens));
        setWebSearch(v => v ?? (env.OPENAI_WEB_SEARCH ?? AI_DEFAULTS.webSearch));
        setAlwaysExplain(v => v ?? (env.OPENAI_ALWAYS_EXPLAIN ?? AI_DEFAULTS.alwaysExplain));
      } catch {
        if (cancelled) return;
        setModel(v => v ?? AI_DEFAULTS.model);
        setTemperature(v => v ?? AI_DEFAULTS.temperature);
        setMaxResults(v => v ?? AI_DEFAULTS.maxResults);
        setMaxTokens(v => v ?? AI_DEFAULTS.maxTokens);
        setWebSearch(v => v ?? AI_DEFAULTS.webSearch);
        setAlwaysExplain(v => v ?? AI_DEFAULTS.alwaysExplain);
      }
      try {
        const r = await fetch('config/ai-system-prompt.md', { cache: 'no-store' });
        if (!r.ok) throw 0;
        const t = await r.text();
        if (!cancelled) setPromptTpl(v => v ?? t);
      } catch { if (!cancelled) setPromptTpl(v => v ?? AI_DEFAULT_PROMPT); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { localStorage.setItem('cm-openai-key', apiKey); }, [apiKey]);
  useEffect(() => { if (model != null) localStorage.setItem('cm-openai-model', model); }, [model]);
  useEffect(() => { if (temperature != null) localStorage.setItem('cm-openai-temp', temperature); }, [temperature]);
  useEffect(() => { if (maxResults != null) localStorage.setItem('cm-openai-maxresults', maxResults); }, [maxResults]);
  useEffect(() => { if (maxTokens != null) localStorage.setItem('cm-openai-maxtokens', maxTokens); }, [maxTokens]);
  useEffect(() => { if (promptTpl != null) localStorage.setItem('cm-ai-prompt', promptTpl); }, [promptTpl]);
  useEffect(() => { if (webSearch != null) localStorage.setItem('cm-openai-websearch', webSearch); }, [webSearch]);
  useEffect(() => { if (alwaysExplain != null) localStorage.setItem('cm-openai-always-explain', alwaysExplain); }, [alwaysExplain]);

  const cmdById   = useMemo(() => Object.fromEntries(commands.map(c => [c.id, c])), [commands]);
  const chainById = useMemo(() => Object.fromEntries(chains.map(c => [c.id, c])), [chains]);

  const buildIndex = () => {
    const cmdLines = commands.map(c =>
      `${c.id} | ${c.name} | ${CAT_MAP[c.category]?.name || c.category}`
      + ` | ${(c.tags || []).slice(0, 5).join(',')}`
      + ` | ${(c.description || '').replace(/\s+/g, ' ').slice(0, 90)}`
    ).join('\n');
    const chainLines = chains.map(c =>
      `${c.id} | ${c.name} | ${(c.objective || '').replace(/\s+/g, ' ').slice(0, 110)}`
    ).join('\n');
    return { cmdLines, chainLines };
  };

  const baseUrl = 'https://api.openai.com/v1';

  // List the models available to this key (GET /v1/models), filtered to chat-capable ids.
  const fetchModels = async () => {
    if (!apiKey) { setModelsError('Inserisci la API key per elencare i modelli.'); return; }
    setModelsLoading(true); setModelsError(null);
    try {
      const r = await fetch(`${baseUrl}/models`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
      if (!r.ok) {
        const t = await r.text(); let m = `HTTP ${r.status}`;
        try { m = JSON.parse(t)?.error?.message || m; } catch {}
        throw new Error(m);
      }
      const data = await r.json();
      const ids = (data.data || []).map(x => x.id)
        .filter(id => /^(gpt-|o[1-9]|chatgpt-)/.test(id))
        .filter(id => !/(embedding|whisper|tts|audio|transcribe|image|dall-e|moderation|realtime)/i.test(id))
        .sort();
      setModels(ids);
      if (!ids.length) setModelsError('Nessun modello chat trovato per questa key.');
    } catch (e) { setModels([]); setModelsError(e.message || String(e)); }
    finally { setModelsLoading(false); }
  };
  // Auto-list once when the settings panel opens with a key present.
  useEffect(() => {
    if (showSettings && apiKey && !models.length && !modelsLoading && !modelsError) fetchModels();
  }, [showSettings, apiKey]);

  // The last search persists in localStorage; this wipes it for good.
  const clearLast = () => {
    setResult(null); setPrompt(''); setError(null);
    try { localStorage.removeItem(lastKey); } catch {}
    inputRef.current?.focus();
  };

  // Restore AI config (model, params, prompt) to defaults from secret.env /
  // ai-system-prompt.md / AI_DEFAULTS. Keeps the API key.
  const resetAiSettings = async () => {
    ['cm-openai-model','cm-openai-temp','cm-openai-maxresults','cm-openai-maxtokens',
     'cm-openai-websearch','cm-openai-always-explain','cm-ai-prompt']
      .forEach(k => { try { localStorage.removeItem(k); } catch {} });
    let env = {};
    try { const r = await fetch('config/secret.env', { cache: 'no-store' }); if (r.ok) env = parseEnv(await r.text()); } catch {}
    setModel(env.OPENAI_MODEL || AI_DEFAULTS.model);
    setTemperature(env.OPENAI_TEMPERATURE ?? AI_DEFAULTS.temperature);
    setMaxResults(env.OPENAI_MAX_RESULTS ?? AI_DEFAULTS.maxResults);
    setMaxTokens(env.OPENAI_MAX_TOKENS ?? AI_DEFAULTS.maxTokens);
    setWebSearch(env.OPENAI_WEB_SEARCH ?? AI_DEFAULTS.webSearch);
    setAlwaysExplain(env.OPENAI_ALWAYS_EXPLAIN ?? AI_DEFAULTS.alwaysExplain);
    let tpl = AI_DEFAULT_PROMPT;
    try { const r = await fetch('config/ai-system-prompt.md', { cache: 'no-store' }); if (r.ok) tpl = await r.text(); } catch {}
    setPromptTpl(tpl);
    setError(null);
  };

  const cfg = { apiKey, model, temperature, maxResults, maxTokens, webSearch, alwaysExplain };
  const downloadEnv = () => aiDownload('secret.env', buildEnv(cfg), 'text/plain');
  const downloadPrompt = () => aiDownload('ai-system-prompt.md', promptTpl || AI_DEFAULT_PROMPT, 'text/markdown');

  const run = async () => {
    const q = prompt.trim();
    if (!q) return;
    if (!apiKey) { setShowSettings(true); setError('Inserisci prima la tua API key OpenAI.'); return; }
    setLoading(true); setError(null); setResult(null);
    const { cmdLines, chainLines } = buildIndex();
    const nMax = parseInt(maxResults, 10) || 15;
    const useWeb = webSearch === '1';
    const wantExplain = alwaysExplain === '1';
    const tpl = promptTpl || AI_DEFAULT_PROMPT;
    // Discipline-specific bits: the Target placeholders a suggested command may
    // use (<ip>… for Pentest, <iface>… for WiFi) and the phases really indexed.
    const targetKeys = (disciplineCfg?.targetFields || []).map(f => `<${f.key}>`).join(' ')
      || '<ip> <user> <password> <domain> <hash>';
    const phaseNames = [...new Set(commands.map(c => CAT_MAP[c.category]?.name || c.category))].join(', ');
    // function replacements so $ in command templates is never treated specially
    let system = tpl
      .replace(/\{\{DISCIPLINE\}\}/g, () => disciplineCfg?.name || 'Pentest')
      .replace(/\{\{TARGET_KEYS\}\}/g, () => targetKeys)
      .replace(/\{\{PHASES\}\}/g, () => phaseNames || '(nessuna)')
      .replace(/\{\{MAX_RESULTS\}\}/g, () => String(nMax))
      .replace(/\{\{COMMAND_INDEX\}\}/g, () => cmdLines)
      .replace(/\{\{CHAIN_INDEX\}\}/g, () => chainLines || '(nessuno)');
    if (wantExplain)
      system += '\n\nIMPORTANTE: compila SEMPRE il campo "explanation" (massimo 3 frasi, concettuale) anche se non richiesto, da mostrare prima dell\'elenco.';

    // Search-capable models reject temperature / response_format: con web search ON li
    // omettiamo e interpretiamo il JSON in modo tollerante (il modello puo' aggiungere prosa).
    const body = {
      model: model || AI_DEFAULTS.model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: q }],
      max_tokens: parseInt(maxTokens, 10) || 1000,
    };
    if (useWeb) {
      body.web_search_options = {};
    } else {
      body.temperature = Number(temperature) || 0;
      body.response_format = { type: 'json_object' };
    }

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        let msg = `HTTP ${res.status}`;
        try { msg = JSON.parse(txt)?.error?.message || msg; } catch {}
        if (useWeb && res.status === 400)
          msg += ' — la ricerca web richiede un modello "search" (es. gpt-5-search-api).';
        throw new Error(msg);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const parsed = parseModelJson(content);
      if (!parsed) throw new Error('Risposta non interpretabile dal modello.');
      const out = {
        commandIds: (parsed.commandIds || []).filter(id => cmdById[id]).slice(0, nMax),
        chainIds:   (parsed.chainIds || []).filter(id => chainById[id]),
        explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
        suggestedCommand: parsed.suggestedCommand || null,
      };
      setResult(out);
      try { localStorage.setItem(lastKey, JSON.stringify({ q, result: out, ts: Date.now() })); } catch {}
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal ai-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Icon name="sparkle" size={16} /> Ricerca con AI
            <span className="ai-disc-tag">{disciplineCfg?.name}</span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-icon"
                    title={showSettings ? 'Torna alla ricerca' : 'Impostazioni AI'}
                    onClick={() => setShowSettings(s => !s)}>
              <Icon name={showSettings ? 'search' : 'settings'} size={15} />
            </button>
            <button className="btn btn-icon" onClick={onClose}><Icon name="x" size={15} /></button>
          </div>
        </div>

        <div className="modal-body ai-body">
          {showSettings && (
            <div className="ai-settings">
              <div className="ai-settings-head">
                <span className="modal-label">Configurazione · secret.env</span>
                <div className="ai-field-actions">
                  <button className="ai-mini-btn" onClick={resetAiSettings}
                          title="Riporta modello, parametri e system prompt ai valori di default (mantiene la API key)">
                    <Icon name="arrow-left" size={11} /> Ripristina
                  </button>
                  <button className="ai-mini-btn" onClick={downloadEnv}>
                    <Icon name="box" size={12} /> Scarica secret.env
                  </button>
                </div>
              </div>

              <div className="ai-group-label">Connessione</div>
              <div className="modal-row">
                <label className="modal-label">OPENAI_API_KEY</label>
                <input type="password" value={apiKey} placeholder="sk-…"
                       onChange={e => setApiKey(e.target.value)} />
                <div className="ai-hint">Salvata solo su questo dispositivo (localStorage). Inviata solo a OpenAI.</div>
              </div>
              <div className="modal-row">
                <div className="ai-field-head">
                  <label className="modal-label">Modello</label>
                  <div className="ai-field-actions">
                    <button className="ai-mini-btn" onClick={fetchModels} disabled={modelsLoading || !apiKey}>
                      <Icon name="search" size={11} /> {modelsLoading ? 'Carico…' : 'Ricarica'}
                    </button>
                    <button className="ai-mini-btn" onClick={() => setModelManual(m => !m)}>
                      <Icon name={modelManual ? 'list' : 'edit'} size={11} /> {modelManual ? 'Elenco' : 'Manuale'}
                    </button>
                  </div>
                </div>
                {(modelManual || !models.length) ? (
                  <input value={model || ''} placeholder="gpt-4.1-mini-…"
                         onChange={e => setModel(e.target.value)} />
                ) : (
                  <select value={model || ''} onChange={e => setModel(e.target.value)}>
                    {model && !models.includes(model) && <option value={model}>{model} (corrente)</option>}
                    {models.map(id => <option key={id} value={id}>{id}</option>)}
                  </select>
                )}
                {modelsError
                  ? <div className="ai-hint ai-hint-warn">{modelsError}</div>
                  : (!models.length && !modelsLoading &&
                     <div className="ai-hint">Premi «Ricarica» per elencare i modelli della tua key, oppure «Manuale» per digitarlo.</div>)}
              </div>

              <div className="ai-group-label">Generazione</div>
              <div className="ai-settings-grid ai-grid-3">
                <div className="modal-row">
                  <label className="modal-label">Temperature</label>
                  <input type="number" step="0.1" min="0" max="2" value={temperature ?? ''}
                         disabled={webSearch === '1'}
                         onChange={e => setTemperature(e.target.value)} />
                </div>
                <div className="modal-row">
                  <label className="modal-label">Max risultati</label>
                  <input type="number" min="1" value={maxResults ?? ''}
                         onChange={e => setMaxResults(e.target.value)} />
                </div>
                <div className="modal-row">
                  <label className="modal-label">Max tokens</label>
                  <input type="number" min="1" value={maxTokens ?? ''}
                         onChange={e => setMaxTokens(e.target.value)} />
                </div>
              </div>

              <div className="ai-group-label">Comportamento</div>
              <div className="ai-toggles">
                <label className="ai-toggle">
                  <input type="checkbox" checked={alwaysExplain === '1'}
                         onChange={e => setAlwaysExplain(e.target.checked ? '1' : '0')} />
                  <span><strong>Spiegazione sempre attiva</strong><br />Mostra una breve spiegazione prima dell'elenco di comandi e playbook, anche se non la chiedi.</span>
                </label>
                <label className="ai-toggle">
                  <input type="checkbox" checked={webSearch === '1'}
                         onChange={e => setWebSearch(e.target.checked ? '1' : '0')} />
                  <span><strong>Ricerca web</strong> <span className="ai-tag-exp">sperimentale</span><br />Richiede un modello «search» (es. gpt-5-search-api). Disattiva JSON rigido e temperature; più lenta e meno precisa.</span>
                </label>
              </div>

              <div className="ai-settings-head" style={{ marginTop: 4 }}>
                <span className="modal-label">System prompt</span>
                <button className="ai-mini-btn" onClick={downloadPrompt}>
                  <Icon name="box" size={12} /> Scarica prompt
                </button>
              </div>
              <textarea className="ai-prompt-edit" rows={8} value={promptTpl || ''}
                        onChange={e => setPromptTpl(e.target.value)} />
              <div className="ai-hint">{'Placeholder: {{DISCIPLINE}}, {{PHASES}}, {{TARGET_KEYS}}, {{MAX_RESULTS}}, {{COMMAND_INDEX}}, {{CHAIN_INDEX}}. Vengono riempiti con i dati della disciplina attiva.'}</div>
            </div>
          )}

          {!showSettings && (
          <div className="ai-search-panel">
          <div className="ai-input-wrap">
            <textarea ref={inputRef} className="ai-input" rows={3}
                      placeholder="Descrivi cosa vuoi fare… (Ctrl+Invio per cercare)"
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      onKeyDown={onKeyDown} />
            <button className="btn btn-primary ai-run" onClick={run} disabled={loading}>
              {loading ? 'Cerco…' : <><Icon name="sparkle" size={13} /> Cerca</>}
            </button>
          </div>

          <div className="ai-opsec">
            <Icon name="alert" size={12} /> OPSEC: le query vengono inviate a OpenAI. Non incollare dati reali del target (IP, host, credenziali).
          </div>

          {error && <div className="ai-error"><Icon name="alert" size={13} /> {error}</div>}

          {result && (
            <div className="ai-results">
              <div className="ai-results-head">
                <span className="ai-results-meta"><Icon name="check" size={11} /> Ultima ricerca</span>
                <button className="ai-mini-btn" onClick={clearLast}
                        title="Rimuove la ricerca salvata da questo dispositivo">
                  <Icon name="x" size={11} /> Pulisci ultima ricerca
                </button>
              </div>
              {result.explanation && (
                <div className="ai-explanation">
                  <span className="ai-block-label"><Icon name="book" size={11} /> Spiegazione</span>
                  <p>{result.explanation}</p>
                </div>
              )}

              {result.suggestedCommand && result.suggestedCommand.template && (
                <div className="ai-suggested">
                  <span className="ai-block-label"><Icon name="terminal" size={11} /> Comando suggerito (non in libreria)</span>
                  <div className="ai-suggested-name">{result.suggestedCommand.name}</div>
                  <div className="ai-suggested-cmd">
                    <code>{result.suggestedCommand.template}</code>
                    <button className="copy-btn copy-btn-icon"
                            title="Copia"
                            onClick={() => navigator.clipboard?.writeText(result.suggestedCommand.template)}>
                      <Icon name="copy" size={13} />
                    </button>
                  </div>
                  {result.suggestedCommand.note && <div className="ai-hint">{result.suggestedCommand.note}</div>}
                </div>
              )}

              {result.commandIds.length > 0 && (
                <div className="ai-section">
                  <span className="ai-block-label"><Icon name="list" size={11} /> Comandi pertinenti</span>
                  {result.commandIds.map(id => {
                    const c = cmdById[id];
                    if (!c) return null;   // id da un'altra disciplina o comando cancellato
                    return (
                      <button key={id} className="ai-hit" onClick={() => onOpenCommand(id)}>
                        <div className="ai-hit-main">
                          <div className="ai-hit-name">{c.name}</div>
                          <div className="ai-hit-syntax">{c.template}</div>
                        </div>
                        <span className="ai-hit-cat" style={{ '--cat-color': catColor(CAT_MAP[c.category]?.hue || 200) }}>
                          {CAT_MAP[c.category]?.short || ''}
                        </span>
                        <Icon name="arrow-right" size={14} />
                      </button>
                    );
                  })}
                </div>
              )}

              {result.chainIds.length > 0 && (
                <div className="ai-section">
                  <span className="ai-block-label"><Icon name="link" size={11} /> Playbook suggeriti</span>
                  {result.chainIds.map(id => {
                    const c = chainById[id];
                    if (!c) return null;
                    return (
                      <button key={id} className="ai-hit" onClick={() => onOpenChain(id)}>
                        <div className="ai-hit-main">
                          <div className="ai-hit-name">{c.name}</div>
                          <div className="ai-hit-syntax">{c.objective}</div>
                        </div>
                        <Icon name="arrow-right" size={14} />
                      </button>
                    );
                  })}
                </div>
              )}

              {result.commandIds.length === 0 && result.chainIds.length === 0 &&
               !result.suggestedCommand && !result.explanation && (
                <div className="ai-empty">Nessun risultato pertinente. Prova a riformulare.</div>
              )}
            </div>
          )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Search palette — centered command finder (Ctrl+K, sidebar collapsed)
   ───────────────────────────────────────────────────────────── */
const SearchPalette = ({ query, setQuery, results, categories, onPick, onClose }) => {
  const inputRef = useRef(null);
  const listRef  = useRef(null);
  const [sel, setSel] = useState(0);

  const catMap = useMemo(() => {
    const m = {};
    (categories || []).forEach(c => { m[c.id] = c; });
    return m;
  }, [categories]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  // reset highlight to the top whenever the result set changes
  useEffect(() => { setSel(0); }, [query]);
  // keep the highlighted row in view
  useEffect(() => {
    listRef.current?.querySelector('.palette-row.active')?.scrollIntoView({ block: 'nearest' });
  }, [sel, results]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown')      { e.preventDefault(); setSel(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter')     { e.preventDefault(); const c = results[sel]; if (c) onPick(c.id); }
    // Escape is handled by the global keydown listener (clear + close)
  };

  const q = query.trim();
  return (
    <div className="palette-overlay" onMouseDown={onClose}>
      <div className="palette" onMouseDown={e => e.stopPropagation()}>
        <div className="palette-search">
          <Icon name="search" size={16} className="palette-search-icon" />
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Cerca comandi in tutte le fasi…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="palette-kbd">Esc</span>
        </div>
        <div className="palette-results" ref={listRef}>
          {q === '' ? (
            <div className="palette-empty">Scrivi per cercare fra tutti i comandi.</div>
          ) : results.length === 0 ? (
            <div className="palette-empty">Nessun comando per «{q}».</div>
          ) : (
            results.map((c, i) => {
              const cat = catMap[c.category];
              return (
                <button key={c.id}
                        className={`palette-row ${i === sel ? 'active' : ''}`}
                        style={{ '--cat-color': cat ? catColor(cat.hue) : 'var(--accent)' }}
                        onMouseEnter={() => setSel(i)}
                        onClick={() => onPick(c.id)}>
                  <div className="palette-row-top">
                    <span className="palette-row-name">{c.name}</span>
                    <span className="palette-row-phase">{cat ? cat.name : c.category}</span>
                  </div>
                  <code className="palette-row-tpl">{c.template}</code>
                </button>
              );
            })
          )}
        </div>
        {results.length > 0 && (
          <div className="palette-hint">
            <span><kbd>↑</kbd><kbd>↓</kbd> naviga</span>
            <span><kbd>↵</kbd> apri</span>
            <span><kbd>Esc</kbd> chiudi</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   App — top level
   ───────────────────────────────────────────────────────────── */
function App() {
  // Mode
  const [mode, setMode] = useState(() => localStorage.getItem('cm-mode') || 'library');
  useEffect(() => { localStorage.setItem('cm-mode', mode); }, [mode]);

  // Discipline (PT/Web · WiFi · …) — swaps the entire phase set, library and chains
  const [discipline, setDiscipline] = useState(() =>
    localStorage.getItem('cm-discipline') || (DISCS[0]?.id || 'pt'));
  useEffect(() => { localStorage.setItem('cm-discipline', discipline); }, [discipline]);
  const disciplineCfg = DISC_MAP[discipline] || DISCS[0];
  const disciplineCats = useMemo(() => catsForDiscipline(discipline), [discipline]);
  const disciplineCatIds = useMemo(
    () => new Set(disciplineCats.map(c => c.id)), [disciplineCats]);

  // Active selection
  const [activeCat, setActiveCat] = useState(() => localStorage.getItem('cm-cat') || 'all');
  const [activeSub, setActiveSub] = useState(() => localStorage.getItem('cm-sub') || null);
  useEffect(() => { localStorage.setItem('cm-cat', activeCat); }, [activeCat]);
  useEffect(() => {
    if (activeSub) localStorage.setItem('cm-sub', activeSub);
    else localStorage.removeItem('cm-sub');
  }, [activeSub]);
  const setActive = (cat, sub) => { setActiveCat(cat); setActiveSub(sub); };

  // Sidebar expansion
  const [expandedCats, setExpandedCats] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('cm-expanded') || '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => {
    localStorage.setItem('cm-expanded', JSON.stringify([...expandedCats]));
  }, [expandedCats]);
  const toggleCatExpand = (id) => {
    setExpandedCats(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const expandAll = () => setExpandedCats(new Set(CATEGORIES.map(c => c.id)));
  const collapseAll = () => setExpandedCats(new Set());

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // FLIP slide for open/close: the grid width snaps to its final value (one reflow), then
  // .main is animated into place with a GPU-composited transform. The command list paints
  // once and the compositor translates the whole layer, so the slide is 60fps even in
  // "Tutte le fasi" (~250 cards) — no per-frame reflow/repaint of the list.
  const mainRef = useRef(null);
  const sidebarFirst = useRef(false);
  React.useLayoutEffect(() => {
    if (!sidebarFirst.current) { sidebarFirst.current = true; return; }
    const main = mainRef.current;
    if (!main) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dx = sidebarCollapsed ? 208 : -208;   // 272 - 64 = px the rail width changed by
    // Start from the OLD position (set before paint so there's no one-frame flash of the
    // snapped layout), then release to 0 on the next frame.
    // Reliable FLIP: set the start offset, FORCE A REFLOW to commit it (a single rAF can
    // fire before the browser paints the start state, coalescing the transition away — that
    // was the "animation disappeared" bug), then release to 0 with the transition on. Pure
    // composited transform, so 60fps regardless of how many cards are mounted.
    main.style.transition = 'none';
    main.style.transform = `translateX(${dx}px)`;
    void main.offsetWidth;
    main.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
    main.style.transform = 'translateX(0)';
    const clear = () => { main.style.transition = ''; main.style.transform = ''; };
    const t = setTimeout(clear, 340);
    return () => { clearTimeout(t); };
  }, [sidebarCollapsed]);

  // Panel layout: 'list' | 'split' | 'detail' (persisted per mode)
  const [layoutByMode, setLayoutByMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-layout') || '{}'); }
    catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('cm-layout', JSON.stringify(layoutByMode)); }, [layoutByMode]);
  const layout = layoutByMode[mode] || 'split';
  const setLayout = useCallback((v) => {
    setLayoutByMode(m => ({ ...m, [mode]: v }));
  }, [mode]);

  // Filters
  const [query, setQueryRaw]    = useState('');
  // Search is global: starting a query jumps to "Tutte le fasi" so it spans every phase;
  // clearing it restores the phase you were in.
  const preSearch = useRef(null);
  const setQuery = useCallback((v) => {
    const was = query.trim().length > 0;
    const now = v.trim().length > 0;
    if (!was && now) {
      preSearch.current = { cat: activeCat, sub: activeSub };
      if (activeCat !== 'all' || activeSub) setActive('all', null);
    } else if (was && !now && preSearch.current) {
      setActive(preSearch.current.cat, preSearch.current.sub);
      preSearch.current = null;
    }
    setQueryRaw(v);
  }, [query, activeCat, activeSub]);
  const [platform, setPlatform] = useState('all');
  const [access, setAccess]     = useState('all');

  // Favorites
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-favs') || '[]'); } catch { return []; }
  });
  const [showFavs, setShowFavs] = useState(false);
  useEffect(() => { localStorage.setItem('cm-favs', JSON.stringify(favs)); }, [favs]);
  const toggleFav = useCallback(
    (id) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]),
    []
  );

  // Latest Target context, kept in a ref so copyCommand stays a STABLE callback
  // (required for React.memo on CommandCard) without ever copying stale values.
  const ctxRef = useRef(null);

  // Copy a command straight from its card — resolve <placeholders> from the latest Target context
  const copyCommand = useCallback((cmd) => {
    const cur = ctxRef.current || {};
    const values = {};
    (cmd.params || []).forEach(p => { values[p.key] = (p.ctx ? cur[p.ctx] : '') || ''; });
    const str = renderTemplateString(cmd.template, values);
    if (navigator.clipboard) navigator.clipboard.writeText(str).then(() => showToast('Comando copiato'));
  }, []);

  // Custom commands (added/edited)
  const [customCmds, setCustomCmds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-custom') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('cm-custom', JSON.stringify(customCmds)); }, [customCmds]);

  // Custom chains
  const [customChains, setCustomChains] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-custom-chains') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('cm-custom-chains', JSON.stringify(customChains)); }, [customChains]);

  // Hidden ids — built-ins can't be removed from the JS files, so we hide them (permanent)
  const [hiddenCmds, setHiddenCmds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-hidden-cmds') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('cm-hidden-cmds', JSON.stringify(hiddenCmds)); }, [hiddenCmds]);
  const [hiddenChains, setHiddenChains] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-hidden-chains') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('cm-hidden-chains', JSON.stringify(hiddenChains)); }, [hiddenChains]);

  // User-defined drag order (arrays of ids) — applied on top of the merged lists
  const [cmdOrder, setCmdOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-cmd-order') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('cm-cmd-order', JSON.stringify(cmdOrder)); }, [cmdOrder]);
  const [chainOrder, setChainOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-chain-order') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('cm-chain-order', JSON.stringify(chainOrder)); }, [chainOrder]);

  // Selected command
  const [selectedId, setSelectedId] = useState(() =>
    localStorage.getItem('cm-selected') || COMMANDS[0]?.id);
  useEffect(() => {
    if (selectedId) localStorage.setItem('cm-selected', selectedId);
  }, [selectedId]);

  // Picking a palette result scrolls its card into view and flashes it — so the
  // click clearly "lands" on that card even when it was already visible.
  const [scrollToId, setScrollToId] = useState(null);
  useEffect(() => {
    if (!scrollToId) return;
    const id = scrollToId;
    setScrollToId(null);
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-cmd-id="${id}"]`);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.remove('cmd-card-flash');
      void el.offsetWidth;                 // reflow so the animation restarts on re-pick
      el.classList.add('cmd-card-flash');
      setTimeout(() => el.classList.remove('cmd-card-flash'), 1300);
    });
  }, [scrollToId]);

  // Active chain
  const [activeChainId, setActiveChainId] = useState(() => localStorage.getItem('cm-chain') || CHAINS[0].id);
  useEffect(() => { localStorage.setItem('cm-chain', activeChainId); }, [activeChainId]);

  // Chain progress
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-progress') || '{}'); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('cm-progress', JSON.stringify(progress)); }, [progress]);

  // Target context
  const [ctx, setCtx] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-ctx') || '{}'); }
    catch { return { ip: '10.10.10.11', user: '', password: '', domain: '', hash: '' }; }
  });
  useEffect(() => { localStorage.setItem('cm-ctx', JSON.stringify(ctx)); }, [ctx]);
  ctxRef.current = ctx;   // keep the ref fresh so the stable copyCommand reads live values
  // Target context bar — collapsed by default; remembers user's choice
  const [ctxCollapsed, setCtxCollapsed] = useState(() => {
    const v = localStorage.getItem('cm-ctx-collapsed');
    return v === null ? true : v === '1';
  });
  useEffect(() => {
    localStorage.setItem('cm-ctx-collapsed', ctxCollapsed ? '1' : '0');
  }, [ctxCollapsed]);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  // Edit modal
  const [editingCmd, setEditingCmd] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChain, setEditingChain] = useState(null);
  const [editingStep, setEditingStep] = useState(null); // { chainId, stepId }
  const [showAddChainModal, setShowAddChainModal] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Dialog popup
  const [dialogState, setDialogState] = useState(null);
  const dialog = useCallback((opts) => setDialogState(opts), []);

  // === Collapsed command groups (per active subsection) ===
  const groupKey = `${activeCat}:${activeSub || ''}`;
  const [collapsedGroupsMap, setCollapsedGroupsMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm-collapsed-groups') || '{}'); }
    catch { return {}; }
  });
  useEffect(() => {
    localStorage.setItem('cm-collapsed-groups', JSON.stringify(collapsedGroupsMap));
  }, [collapsedGroupsMap]);
  const collapsedGroups = useMemo(
    () => new Set(collapsedGroupsMap[groupKey] || []),
    [collapsedGroupsMap, groupKey]
  );
  const toggleGroup = useCallback((name) => {
    setCollapsedGroupsMap(m => {
      const cur = new Set(m[groupKey] || []);
      cur.has(name) ? cur.delete(name) : cur.add(name);
      return { ...m, [groupKey]: [...cur] };
    });
  }, [groupKey]);
  const expandAllGroups = useCallback(() => {
    setCollapsedGroupsMap(m => ({ ...m, [groupKey]: [] }));
  }, [groupKey]);
  const collapseAllGroups = useCallback((groupNames) => {
    setCollapsedGroupsMap(m => ({ ...m, [groupKey]: [...groupNames] }));
  }, [groupKey]);

  // === Composite chain list (built-in + custom) ===
  const allChains = useMemo(() => {
    const hidden = new Set(hiddenChains);
    const customMap = new Map(customChains.map(c => [c.id, c]));
    const merged = CHAINS.map(c => customMap.get(c.id) || c);
    customChains.forEach(c => {
      if (!CHAINS.find(b => b.id === c.id)) merged.push(c);
    });
    return applyOrder(merged.filter(c => !hidden.has(c.id) && disciplineCatIds.has(c.category)), chainOrder);
  }, [customChains, hiddenChains, chainOrder, disciplineCatIds]);

  // === Composite command list (built-in + custom, with overrides) ===
  const allCommands = useMemo(() => {
    const hidden = new Set(hiddenCmds);
    const customMap = new Map(customCmds.map(c => [c.id, c]));
    const merged = COMMANDS.map(c => customMap.get(c.id) || c);
    // Add new customs not overriding builtins
    customCmds.forEach(c => {
      if (!COMMANDS.find(b => b.id === c.id)) merged.push(c);
    });
    return applyOrder(merged.filter(c => !hidden.has(c.id)), cmdOrder);
  }, [customCmds, hiddenCmds, cmdOrder]);
  const allCommandsRef = useRef(allCommands);
  allCommandsRef.current = allCommands;   // fresh list for the stable reorderCommand

  const commandsMap = useMemo(() => CMD_MAP_BUILD(allCommands), [allCommands]);

  // === Filtering ===
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCommands.filter(c => {
      if (!disciplineCatIds.has(c.category)) return false;
      if (showFavs && !favs.includes(c.id)) return false;
      if (activeCat !== 'all' && c.category !== activeCat) return false;
      if (activeSub && c.subcategory !== activeSub) return false;
      if (platform !== 'all' && c.platform !== platform && c.platform !== 'cross-platform') return false;
      if (access !== 'all' && !c.requires.includes(access)) return false;
      if (q) {
        const hay = [c.name, c.template, c.description, ...(c.tags || []),
                     c.subcategory, c.group].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allCommands, query, activeCat, activeSub, platform, access, showFavs, favs, disciplineCatIds]);

  // Group names currently rendered — drives the 'G' shortcut without touching the DOM
  const currentGroupNames = useMemo(() => {
    const seen = new Set();
    filteredCommands.forEach(c => seen.add(c.group || 'Altro'));
    return [...seen];
  }, [filteredCommands]);
  // 'G' shortcut: if anything is collapsed, expand all; otherwise collapse all
  const toggleAllGroups = useCallback(() => {
    const current = collapsedGroupsMap[groupKey] || [];
    setCollapsedGroupsMap(m => ({
      ...m, [groupKey]: current.length > 0 ? [] : [...currentGroupNames],
    }));
  }, [collapsedGroupsMap, groupKey, currentGroupNames]);

  // === Counts (for sidebar) — respect filters AND the search query, so during a
  //     search the badges show where the matches live across phases/sub-phases. ===
  const counts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (c) => {
      if (!disciplineCatIds.has(c.category)) return false;
      if (platform !== 'all' && c.platform !== platform && c.platform !== 'cross-platform') return false;
      if (access !== 'all' && !c.requires.includes(access)) return false;
      if (showFavs && !favs.includes(c.id)) return false;
      if (q) {
        const hay = [c.name, c.template, c.description, ...(c.tags || []),
                     c.subcategory, c.group].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    };
    const subset = allCommands.filter(matches);
    const out = { all: subset.length };
    disciplineCats.forEach(c => {
      out[c.id] = subset.filter(x => x.category === c.id).length;
      c.subcategories.forEach(s => {
        out[`${c.id}:${s.id}`] = subset.filter(x => x.category === c.id && x.subcategory === s.id).length;
      });
    });
    return out;
  }, [allCommands, query, platform, access, showFavs, favs, disciplineCats, disciplineCatIds]);

  // === Palette results — a GLOBAL command finder (ignores the active phase and
  //     favourites, keeps the platform/access context filters). ===
  const paletteResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allCommands.filter(c => {
      if (!disciplineCatIds.has(c.category)) return false;
      if (platform !== 'all' && c.platform !== platform && c.platform !== 'cross-platform') return false;
      if (access !== 'all' && !c.requires.includes(access)) return false;
      const hay = [c.name, c.template, c.description, ...(c.tags || []),
                   c.subcategory, c.group].join(' ').toLowerCase();
      return hay.includes(q);
    }).slice(0, 60);
  }, [allCommands, query, platform, access, disciplineCatIds]);

  // Categories that should be visible in sidebar (have at least one matching command)
  const visibleCats = useMemo(() => {
    const filtersActive = platform !== 'all' || access !== 'all' || showFavs;
    if (!filtersActive) return null; // null = show all
    const set = new Set();
    CATEGORIES.forEach(c => { if ((counts[c.id] || 0) > 0) set.add(c.id); });
    return set;
  }, [counts, platform, access, showFavs]);

  // === Pertinent chains ===
  // Strict filter: if a sub-phase is selected, only show that sub-phase's chains.
  // If a phase is selected, only show that phase's chains. Empty state if none.
  const pertinentChains = useMemo(() => {
    if (activeCat === 'all') return allChains;
    if (activeSub) return allChains.filter(c => c.subcategory === activeSub);
    return allChains.filter(c => c.category === activeCat);
  }, [activeCat, activeSub, allChains]);

  // Ensure activeChainId is valid for the current filter
  useEffect(() => {
    if (mode === 'chains' && pertinentChains.length > 0 &&
        !pertinentChains.find(c => c.id === activeChainId)) {
      setActiveChainId(pertinentChains[0].id);
    }
  }, [mode, activeCat, activeSub]);

  // Switching discipline → reset navigation + filters to that discipline's defaults
  const didMountDisc = useRef(false);
  useEffect(() => {
    if (!didMountDisc.current) { didMountDisc.current = true; return; }
    setActive('all', null);
    setAccess('all'); setPlatform('all');
    setShowFavs(false);
    const firstCmd = allCommands.find(c => disciplineCatIds.has(c.category));
    if (firstCmd) setSelectedId(firstCmd.id);
    const firstChain = allChains.find(c => disciplineCatIds.has(c.category));
    if (firstChain) setActiveChainId(firstChain.id);
  }, [discipline]);

  const selected = filteredCommands.find(c => c.id === selectedId) ||
                   allCommands.find(c => c.id === selectedId) ||
                   allCommands[0];

  // Keep the Builder coherent with the navigated section: when the active
  // category/subsection changes and the currently-selected command is no
  // longer part of the filtered list, jump selection to the first command
  // of the section (skip while doing a global search).
  useEffect(() => {
    if (mode !== 'library') return;
    if (query.trim()) return;
    if (filteredCommands.length === 0) return;
    if (!filteredCommands.some(c => c.id === selectedId)) {
      setSelectedId(filteredCommands[0].id);
    }
  }, [activeCat, activeSub, mode]);

  // === Body class management (static). The sidebar-collapsed state now lives as a
  //     class on the .sidebar element, not <body>, so toggling it invalidates only the
  //     sidebar subtree instead of forcing a whole-document style recalc. ===
  useEffect(() => {
    document.body.className = 'accent-mint bg-cool density-comfortable';
  }, []);

  // === Keyboard shortcuts (Windows-style) ===
  useEffect(() => {
    const isEditable = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };
    const onKey = (e) => {
      // Ctrl+K — sidebar open: focus its search; sidebar collapsed: open the palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (sidebarCollapsed) setPaletteOpen(true);
        else document.querySelector('.search-input')?.focus();
        return;
      }
      // Ctrl+B — toggle sidebar (always)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(c => !c);
        return;
      }
      // Escape — palette first (clear + close, one press), then modals, then wipe the search
      if (e.key === 'Escape') {
        if (paletteOpen) { setPaletteOpen(false); setQuery(''); return; }
        const modalWasOpen = editingCmd || showAddModal || editingChain || editingStep ||
                             showAddChainModal || showShortcutsModal || addMenuOpen || dialogState;
        setEditingCmd(null);
        setShowAddModal(false);
        setEditingChain(null);
        setShowAddChainModal(false);
        setShowShortcutsModal(false);
        setAddMenuOpen(false);
        if (modalWasOpen) return;
        if (query.trim()) setQuery('');   // nothing else open → cancel the active search
        return;
      }
      // Other shortcuts: skip while typing or when a modal/popup is open
      if (isEditable(document.activeElement)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const modalOpen = editingCmd || showAddModal || editingChain || editingStep ||
                        showAddChainModal || showShortcutsModal || dialogState;
      // Allow '?' to open shortcuts even from idle state, but block other letters when modal open
      if (modalOpen && e.key !== '?' && !(e.shiftKey && e.key === '/')) return;

      const k = e.key.toLowerCase();
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal(s => !s);
      } else if (e.key === '1') {
        e.preventDefault();
        setMode('library');
      } else if (e.key === '2') {
        e.preventDefault();
        setMode('chains');
      } else if (k === 'f') {
        e.preventDefault();
        setShowFavs(v => !v);
      } else if (k === 'e') {
        e.preventDefault();
        expandAll();
      } else if (k === 'c') {
        e.preventDefault();
        collapseAll();
      } else if (k === 'g') {
        e.preventDefault();
        toggleAllGroups();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // === Save command (from modal) ===
  const saveCmd = (cmd) => {
    setCustomCmds(cmds => {
      const idx = cmds.findIndex(c => c.id === cmd.id);
      if (idx >= 0) {
        const next = [...cmds]; next[idx] = cmd; return next;
      }
      return [...cmds, cmd];
    });
    setEditingCmd(null);
    setShowAddModal(false);
    setSelectedId(cmd.id);
    showToast(editingCmd ? 'Comando aggiornato' : 'Comando aggiunto');
  };
  const deleteCmd = (id) => {
    setCustomCmds(cmds => cmds.filter(c => c.id !== id));
    // built-ins live in data.js → mark hidden so they don't reappear on reload
    if (COMMANDS.some(c => c.id === id)) setHiddenCmds(h => h.includes(id) ? h : [...h, id]);
    setEditingCmd(null);
    showToast('Comando eliminato');
  };

  // === Save chain ===
  const saveChain = (ch) => {
    setCustomChains(cs => {
      const idx = cs.findIndex(c => c.id === ch.id);
      if (idx >= 0) {
        const next = [...cs]; next[idx] = ch; return next;
      }
      return [...cs, ch];
    });
    setEditingChain(null);
    setShowAddChainModal(false);
    setActiveChainId(ch.id);
    setMode('chains');
    showToast(editingChain ? 'Playbook aggiornato' : 'Playbook creato');
  };
  const deleteChain = (id) => {
    setCustomChains(cs => cs.filter(c => c.id !== id));
    if (CHAINS.some(c => c.id === id)) setHiddenChains(h => h.includes(id) ? h : [...h, id]);
    setEditingChain(null);
    showToast('Playbook eliminato');
  };

  // Save a single step back into its chain (creates a custom override of the chain)
  const saveStep = (newStep) => {
    if (!editingStep) return;
    const base = allChains.find(c => c.id === editingStep.chainId);
    if (!base) { setEditingStep(null); return; }
    const updated = {
      ...base,
      steps: base.steps.map(s => s.id === editingStep.stepId ? { ...newStep, id: editingStep.stepId } : s),
      isCustom: true,
    };
    setCustomChains(cs => {
      const idx = cs.findIndex(c => c.id === updated.id);
      if (idx >= 0) { const n = [...cs]; n[idx] = updated; return n; }
      return [...cs, updated];
    });
    setEditingStep(null);
    showToast('Step aggiornato');
  };
  const deleteStep = () => {
    if (!editingStep) return;
    const base = allChains.find(c => c.id === editingStep.chainId);
    if (!base) { setEditingStep(null); return; }
    const updated = { ...base, steps: base.steps.filter(s => s.id !== editingStep.stepId), isCustom: true };
    setCustomChains(cs => {
      const idx = cs.findIndex(c => c.id === updated.id);
      if (idx >= 0) { const n = [...cs]; n[idx] = updated; return n; }
      return [...cs, updated];
    });
    setEditingStep(null);
    showToast('Step eliminato');
  };

  // === Reset: wipe all cm-* localStorage and reload (back to the file defaults) ===
  const resetAll = () => {
    setAddMenuOpen(false);
    dialog({
      type: 'danger',
      title: 'Pulire tutta la cache?',
      message: 'Tutte le modifiche non salvate (comandi e playbook custom, ordine, preferiti, progresso, target, elementi nascosti) saranno cancellate e l’app tornerà ai dati originali dei file. Esporta prima se vuoi conservarle.',
      confirmLabel: 'Pulisci e ripristina',
      cancelLabel: 'Annulla',
      onConfirm: () => {
        Object.keys(localStorage).filter(k => k.startsWith('cm-')).forEach(k => localStorage.removeItem(k));
        location.reload();
      },
    });
  };

  // === Drag reorder (HTML5 DnD) — move dragged id before/after target, save full order ===
  const reorder = (list, setOrder) => (draggedId, targetId, before) => {
    if (!draggedId || draggedId === targetId) return;
    const order = list.map(x => x.id);
    const from = order.indexOf(draggedId);
    if (from < 0) return;
    order.splice(from, 1);
    let to = order.indexOf(targetId);
    if (to < 0) return;
    order.splice(before ? to : to + 1, 0, draggedId);
    setOrder(order);
  };
  const reorderCommand = useCallback(
    (draggedId, targetId, before) => reorder(allCommandsRef.current, setCmdOrder)(draggedId, targetId, before),
    []
  );
  const reorderChain = reorder(allChains, setChainOrder);

  // === Export / Import (no backend) ===
  const downloadFile = (filename, text, mime) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  // JSON backup — round-trips through "Importa dati…"
  const exportData = () => {
    setAddMenuOpen(false);
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      favs, customCmds, customChains, progress, ctx,
      cmdOrder, chainOrder, hiddenCmds, hiddenChains,
    };
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`wannahack-${stamp}.json`, JSON.stringify(data, null, 2), 'application/json');
    showToast('Esportato come file JSON');
  };

  // Source export — regenerate the per-discipline .js data file (built-in + custom
  // merged). Discipline-scoped: the base discipline regenerates the canonical
  // data.js / chains.js that DEFINE the global; every add-on discipline regenerates
  // its own data-<id>.js / chains-<id>.js that APPENDS to it. Keeps the modules
  // separate instead of dumping every discipline's entries into data.js.
  const stripInternal = ({ isCustom, ...rest }) => rest;
  const baseDiscipline = DISCS[0]?.id || 'pt';
  const buildSource = (kind, items) => {
    const isBase = discipline === baseDiscipline;
    const suffix = isBase ? '' : `-${discipline}`;
    const fname = `${kind === 'COMMANDS' ? 'data' : 'chains'}${suffix}.js`;
    const varName = isBase
      ? kind
      : `${discipline.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_${kind}`;
    const decl = `const ${varName} = ${JSON.stringify(items.map(stripInternal), null, 2)};\n`;
    const footer = isBase
      ? `window.${kind} = ${varName};\n`
      : `if (window.${kind} && Array.isArray(window.${kind})) {\n` +
        `  window.${kind}.push(...${varName});\n` +
        `} else {\n` +
        `  window.${kind} = ${varName}.slice();\n` +
        `}\n`;
    const js = `/* ${fname} — generato da WannaHack il ${new Date().toISOString()} */\n` +
      decl + footer;
    return { fname, js };
  };
  const exportSourceCmds = () => {
    setAddMenuOpen(false);
    const items = allCommands.filter(c => disciplineCatIds.has(c.category));
    const { fname, js } = buildSource('COMMANDS', items);
    downloadFile(fname, js, 'text/javascript');
    showToast(`${fname} esportato (${items.length} comandi)`);
  };
  const exportSourceChains = () => {
    setAddMenuOpen(false);
    const items = allChains.filter(c => disciplineCatIds.has(c.category));
    const { fname, js } = buildSource('CHAINS', items);
    downloadFile(fname, js, 'text/javascript');
    showToast(`${fname} esportato (${items.length} playbook)`);
  };

  const importData = () => {
    setAddMenuOpen(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data || typeof data !== 'object') throw new Error('not an object');
        dialog({
          type: 'warning',
          title: 'Importare i dati?',
          message: `Trovati ${(data.customCmds || []).length} comandi custom, ${(data.customChains || []).length} playbook, ${(data.favs || []).length} preferiti. L'operazione SOVRASCRIVE i dati attuali.`,
          confirmLabel: 'Importa',
          cancelLabel: 'Annulla',
          onConfirm: () => {
            if (Array.isArray(data.favs))          setFavs(data.favs);
            if (Array.isArray(data.customCmds))    setCustomCmds(data.customCmds);
            if (Array.isArray(data.customChains))  setCustomChains(data.customChains);
            if (data.progress && typeof data.progress === 'object') setProgress(data.progress);
            if (data.ctx && typeof data.ctx === 'object')           setCtx(data.ctx);
            if (Array.isArray(data.cmdOrder))      setCmdOrder(data.cmdOrder);
            if (Array.isArray(data.chainOrder))    setChainOrder(data.chainOrder);
            if (Array.isArray(data.hiddenCmds))    setHiddenCmds(data.hiddenCmds);
            if (Array.isArray(data.hiddenChains))  setHiddenChains(data.hiddenChains);
            showToast('Dati importati con successo');
          },
        });
      } catch (err) {
        dialog({
          type: 'danger',
          title: 'Import fallito',
          message: `Impossibile leggere il file: ${err.message}`,
          confirmLabel: 'OK',
        });
      }
    };
    input.click();
  };

  // AI search → jump to a command or a chain in the current discipline
  const aiOpenCommand = (id) => {
    const c = allCommands.find(x => x.id === id);
    if (!c) return;
    setShowFavs(false); setQueryRaw(''); setAccess('all'); setPlatform('all');
    setMode('library'); setActive(c.category, c.subcategory || null); setSelectedId(id);
    setShowAI(false);
    showToast('Comando aperto');
  };
  const aiOpenChain = (id) => {
    const c = allChains.find(x => x.id === id);
    if (!c) return;
    setMode('chains'); setActive(c.category, null); setActiveChainId(id);
    setShowAI(false);
    showToast('Playbook aperto');
  };

  // Palette → keep the query ACTIVE so the main view stays in "global results" mode
  // (all matching cards across phases + sidebar highlighting, exactly like a normal
  // open-sidebar search). Just highlight and scroll to the chosen card — never clear
  // the search or restrict to a single phase.
  const palettePick = (id) => {
    setMode('library');
    // Force the main view back to GLOBAL results. A prior sidebar-phase click can
    // leave activeCat pinned to one phase while the query is still active; the
    // palette is global, so the picked card may live in another phase and wouldn't
    // be rendered (→ no scroll target). 'all' guarantees the card is on screen.
    setActive('all', null);
    setSelectedId(id);
    setPaletteOpen(false);
    setScrollToId(id);       // effect scrolls + flashes the card after render
  };

  // Phase color cascade: derive --phase-color from active phase (fallback: accent)
  const activePhase = activeCat !== 'all' ? CAT_MAP[activeCat] : null;
  // Sidebar width + overflow are driven from here (inline on .app) rather than a body
  // class: collapsing now only re-lays-out .app (~7ms) with no document-wide recalc.
  // Only the grid width is toggled — .app keeps its constant `overflow: hidden` (from
  // CSS). Toggling overflow on .app was a ~50ms hit because it re-homed every
  // content-visibility card's viewport intersection; the collapsed flyouts escape the
  // 64px rail via `.sidebar.collapsed { overflow: visible }` instead.
  const appStyle = {
    gridTemplateColumns: sidebarCollapsed ? '64px 1fr' : '272px 1fr',
    ...(activePhase ? {
      '--phase-color': catColor(activePhase.hue),
      '--phase-color-soft': catColorSoft(activePhase.hue),
    } : {}),
  };

  return (
    <>
      <div className="app" style={appStyle}>
        <Sidebar
          query={query} setQuery={setQuery} searching={query.trim().length > 0}
          activeCat={activeCat} activeSub={activeSub} setActive={setActive}
          platform={platform} setPlatform={setPlatform}
          access={access} setAccess={setAccess}
          counts={counts}
          visibleCats={visibleCats}
          categories={disciplineCats}
          disciplineCfg={disciplineCfg}
          expandedCats={expandedCats} toggleCatExpand={toggleCatExpand}
          expandAll={expandAll} collapseAll={collapseAll}
          sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}
        />
        <main className="main" ref={mainRef}>
          <TopBar mode={mode} setMode={setMode}
                  activeCat={activeCat} activeSub={activeSub}
                  addMenuOpen={addMenuOpen} setAddMenuOpen={setAddMenuOpen}
                  onAddCommand={() => { setShowAddModal(true); setAddMenuOpen(false); }}
                  onAddChain={() => { setShowAddChainModal(true); setAddMenuOpen(false); }}
                  onExport={exportData}
                  onImport={importData}
                  onExportSourceCmds={exportSourceCmds}
                  onExportSourceChains={exportSourceChains}
                  onResetAll={resetAll}
                  onShowShortcuts={() => setShowShortcutsModal(true)}
                  discipline={discipline} setDiscipline={setDiscipline}
                  showFavs={showFavs} setShowFavs={setShowFavs} favCount={favs.length}
                  onOpenAI={() => setShowAI(true)}
                  layout={layout} setLayout={setLayout} />
          <TargetContext ctx={ctx} setCtx={setCtx}
                         fields={disciplineCfg?.targetFields}
                         collapsed={ctxCollapsed} setCollapsed={setCtxCollapsed} />
          {mode === 'chains' ? (
            <ChainsView
              chains={pertinentChains}
              activeChainId={activeChainId} setActiveChainId={setActiveChainId}
              progress={progress} setProgress={setProgress}
              ctx={ctx} setCtx={setCtx}
              onToast={showToast}
              commandsMap={commandsMap}
              dialog={dialog}
              onEditChain={(c) => setEditingChain(c)}
              onEditStep={(chainId, stepId) => setEditingStep({ chainId, stepId })}
              onNewChain={() => setShowAddChainModal(true)}
              onReorderChain={reorderChain}
              layout={layout}
            />
          ) : (
            <div className={`content layout-${layout}`}>
              <section className="panel">
                <LibraryContent
                  commands={filteredCommands}
                  activeCat={activeCat} activeSub={activeSub}
                  chains={allChains}
                  selectedId={selectedId} setSelectedId={setSelectedId}
                  favs={favs} toggleFav={toggleFav}
                  onEdit={setEditingCmd}
                  onCopy={copyCommand}
                  onReorder={reorderCommand}
                  setMode={setMode}
                  setActiveChainId={setActiveChainId}
                  query={query}
                  collapsedGroups={collapsedGroups}
                  toggleGroup={toggleGroup}
                  expandAllGroups={expandAllGroups}
                  collapseAllGroups={collapseAllGroups}
                />
              </section>
              <section className="panel">
                <div className="panel-header">
                  <h3 className="panel-title">Command Builder</h3>
                  <div className="panel-subtitle">Compila i parametri · anteprima live · copia</div>
                </div>
                <div className="panel-body">
                  <Builder cmd={selected} ctx={ctx} onToast={showToast} />
                </div>
              </section>
            </div>
          )}
        </main>

        <div className={`toast ${toast ? 'show' : ''}`}>
          <Icon name="check" size={14} className="check" />
          {toast}
        </div>
      </div>

      {(editingCmd || showAddModal) && (
        <EditModal
          cmd={editingCmd}
          defaultCat={!editingCmd && activeCat !== 'all' ? activeCat : undefined}
          defaultSub={!editingCmd && activeSub ? activeSub : undefined}
          onClose={() => { setEditingCmd(null); setShowAddModal(false); }}
          onSave={saveCmd}
          onDelete={deleteCmd}
          dialog={dialog}
        />
      )}

      {(editingChain || showAddChainModal) && (
        <ChainModal
          chain={editingChain}
          defaultCat={!editingChain && activeCat !== 'all' ? activeCat : undefined}
          defaultSub={!editingChain && activeSub ? activeSub : undefined}
          allCommands={allCommands}
          onClose={() => { setEditingChain(null); setShowAddChainModal(false); }}
          onSave={saveChain}
          onDelete={deleteChain}
          dialog={dialog}
        />
      )}

      {editingStep && (() => {
        const ch = allChains.find(c => c.id === editingStep.chainId);
        const st = ch?.steps.find(s => s.id === editingStep.stepId);
        return st ? (
          <StepEditModal
            step={st}
            allCommands={allCommands}
            onClose={() => setEditingStep(null)}
            onSave={saveStep}
            onDelete={deleteStep}
            dialog={dialog}
          />
        ) : null;
      })()}

      <Dialog dialog={dialogState} onClose={() => setDialogState(null)} />

      <ShortcutsModal open={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />

      {showAI && (
        <AISearchModal
          onClose={() => setShowAI(false)}
          commands={allCommands.filter(c => disciplineCatIds.has(c.category))}
          chains={allChains}
          disciplineCfg={disciplineCfg}
          onOpenCommand={aiOpenCommand}
          onOpenChain={aiOpenChain}
        />
      )}

      {paletteOpen && (
        <SearchPalette
          query={query}
          setQuery={setQuery}
          results={paletteResults}
          categories={disciplineCats}
          onPick={palettePick}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
