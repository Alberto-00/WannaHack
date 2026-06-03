// ────────────────────────────────────────────────────────────
//  Pentest Cheatsheet — taxonomy
//  Top-level = phases of a pentest engagement
//  Each command:   category → subcategory → group (visual only)
// ────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'info-gathering',
    name: 'Information Gathering',
    short: 'IG',
    hue: 200,
    icon: 'eye',
    description: 'Recon passivo (OSINT, CT logs, breach data) e attivo (port scan, web discovery, DNS).',
    subcategories: [
      { id: 'passive-recon', name: 'Passive Recon',
        description: 'Raccogli informazioni sul target da fonti terze, senza inviargli traffico: WHOIS/ASN, DNS, sottodomini (CT logs, subfinder, amass), email/OSINT, servizi esposti (Shodan), segreti su GitHub.' },
      { id: 'active-recon',  name: 'Active Recon',
        description: 'Da qui si tocca il target: port/service scanning (nmap), web discovery (ffuf, vhost), fingerprinting e enumerazione DNS attiva (reverse, AXFR, bruteforce).' },
    ],
  },
  {
    id: 'service-enum',
    name: 'Service Enumeration',
    short: 'SE',
    hue: 170,
    icon: 'list',
    description: 'Enumeration in profondità per ogni servizio. Null session, anonymous, default creds, info leak.',
    subcategories: [
      { id: 'ftp',      name: 'FTP (21)' },
      { id: 'ssh',      name: 'SSH (22)' },
      { id: 'smb',      name: 'SMB (445/139)' },
      { id: 'snmp',     name: 'SNMP (161/udp)' },
      { id: 'smtp',     name: 'SMTP (25/587)' },
      { id: 'nfs',      name: 'NFS (2049)' },
      { id: 'dns-svc',  name: 'DNS (53)' },
      { id: 'mssql',    name: 'MSSQL (1433)' },
      { id: 'mysql',    name: 'MySQL (3306)' },
      { id: 'rdp',      name: 'RDP (3389)' },
      { id: 'winrm',    name: 'WinRM (5985/5986)' },
      { id: 'ldap',     name: 'LDAP (389/636)' },
      { id: 'web-apps', name: 'Web Apps (80/443)' },
    ],
  },
  {
    id: 'vuln-analysis',
    name: 'Vulnerability Analysis',
    short: 'VA',
    hue: 50,
    icon: 'bug',
    description: 'SQLi, LFI, XXE, file upload, SSRF, command injection, CVE hunting. Scanner + manual testing.',
    subcategories: [
      { id: 'web-app-testing', name: 'Web App Testing' },
      { id: 'infrastructure',  name: 'Infrastructure' },
    ],
  },
  {
    id: 'exploitation',
    name: 'Exploitation & Initial Access',
    short: 'EX',
    hue: 25,
    icon: 'crosshair',
    description: 'Payload generation, listeners, web shells, credential attacks, shell stabilization, AV bypass.',
    subcategories: [
      { id: 'payloads',     name: 'Payload Generation' },
      { id: 'listeners',    name: 'Listeners' },
      { id: 'webshells',    name: 'Web Shells' },
      { id: 'cred-attacks', name: 'Credential Attacks' },
      { id: 'shell-stab',   name: 'Shell Stabilization' },
      { id: 'av-bypass',    name: 'AV Bypass (Windows)' },
    ],
  },
  {
    id: 'post-exp',
    name: 'Post-Exploitation',
    short: 'PE',
    hue: 290,
    icon: 'package',
    description: 'Situational awareness, credential harvesting, pillaging, persistence, file transfer.',
    subcategories: [
      { id: 'situational-awareness', name: 'Situational Awareness' },
      { id: 'cred-harvesting',       name: 'Credential Harvesting' },
      { id: 'pillaging',             name: 'Pillaging' },
      { id: 'persistence',           name: 'Persistence' },
      { id: 'file-transfer',         name: 'File Transfer' },
    ],
  },
  {
    id: 'privesc',
    name: 'Privilege Escalation',
    short: 'PR',
    hue: 140,
    icon: 'shield-up',
    description: 'Sotto-fasi per tecnica. Usa il filtro Piattaforma (Linux/Windows) in sidebar per separare i comandi per OS.',
    subcategories: [
      { id: 'auto-enum',         name: 'Auto Enumeration' },
      { id: 'cred-hunting',      name: 'Credential Hunting' },
      { id: 'sudo',              name: 'Sudo Misconfig' },
      { id: 'suid-sgid',         name: 'SUID / SGID' },
      { id: 'capabilities',      name: 'Capabilities' },
      { id: 'cron-tasks',        name: 'Cron & Scheduled Tasks' },
      { id: 'token-priv',        name: 'Token Privileges' },
      { id: 'priv-groups',       name: 'Privileged Groups' },
      { id: 'vuln-services',     name: 'Vulnerable Services' },
      { id: 'aie',               name: 'AlwaysInstallElevated' },
      { id: 'kernel',            name: 'Kernel Exploits' },
      { id: 'container-escape',  name: 'Container / Host Escape' },
    ],
  },
  {
    id: 'lateral',
    name: 'Lateral Movement & Pivoting',
    short: 'LM',
    hue: 310,
    icon: 'swap',
    description: 'Remote shells (PsExec, WMI, WinRM), Pass-the-Hash, Pass-the-Ticket, pivoting (Chisel, Ligolo, SSH, Proxychains).',
    subcategories: [
      { id: 'remote-shells',    name: 'Remote Shells' },
      { id: 'pass-the-hash',    name: 'Pass-the-Hash' },
      { id: 'pass-the-ticket',  name: 'Pass-the-Ticket' },
      { id: 'pivoting',         name: 'Pivoting Tools' },
    ],
  },
  {
    id: 'active-directory',
    name: 'Active Directory',
    short: 'AD',
    hue: 260,
    icon: 'sitemap',
    description: 'Setup, enumeration (BloodHound, LDAP), initial access (AS-REP, Kerberoasting, spray), priv esc (ACL, ADCS, DCSync), persistence.',
    subcategories: [
      { id: 'setup',          name: 'Setup & Pre-Reqs' },
      { id: 'enumeration',    name: 'Enumeration' },
      { id: 'initial-access', name: 'Initial Access' },
      { id: 'priv-esc',       name: 'Privilege Escalation' },
      { id: 'persistence',    name: 'Persistence' },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    short: 'UT',
    hue: 90,
    icon: 'terminal',
    description: 'Reverse shells (revshells.com), GTFOBins escape, LOLBins Windows, cheatsheets (hashcat modes, file transfer, cURL).',
    subcategories: [
      { id: 'reverse-shells', name: 'Reverse Shells' },
      { id: 'gtfobins',       name: 'GTFOBins' },
      { id: 'lolbins',        name: 'LOLBins (Windows)' },
      { id: 'cheatsheets',    name: 'Cheatsheets' },
    ],
  },
];

// ─── Tag visual maps ─────────────────────────────────────────
const REQUIRES_META = {
  'no-creds': { label: 'no-creds', tone: 'slate' },
  'password': { label: 'password', tone: 'amber' },
  'hash':     { label: 'hash',     tone: 'violet' },
  'ticket':   { label: 'ticket',   tone: 'sky' },
  'cert':     { label: 'cert',     tone: 'mint' },
  'shell':    { label: 'shell',    tone: 'rose' },
};

const PROTOCOL_META = {
  smb: 'cyan', ldap: 'indigo', kerberos: 'rose', winrm: 'teal',
  rdp: 'orange', rpc: 'purple', dns: 'lime', ntlm: 'pink',
  mssql: 'red', mysql: 'red', http: 'yellow', tcp: 'slate', udp: 'slate',
  ntp: 'slate', dcsync: 'rose', wmi: 'teal', ftp: 'cyan', ssh: 'teal',
  snmp: 'lime', smtp: 'pink', nfs: 'cyan', redis: 'red', ipmi: 'orange',
  icmp: 'slate',
};

window.CATEGORIES = CATEGORIES;
window.REQUIRES_META = REQUIRES_META;
window.PROTOCOL_META = PROTOCOL_META;
