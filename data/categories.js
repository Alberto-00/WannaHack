// ────────────────────────────────────────────────────────────
//  Pentest Cheatsheet — taxonomy
//  Top-level = phases of a pentest engagement
//  Each command:   category → subcategory → group (visual only)
// ────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'info-gathering',
    domain: 'pt',
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
    domain: 'pt',
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
    domain: 'pt',
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
    domain: 'pt',
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
    domain: 'pt',
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
    domain: 'pt',
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
    domain: 'pt',
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
    domain: 'pt',
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
    domain: 'pt',
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

  // ════════════════════════════════════════════════════════════
  //  WIFI DISCIPLINE — phases of an 802.11 / wireless assessment
  //  (shown only when the WiFi discipline is selected)
  // ════════════════════════════════════════════════════════════
  {
    id: 'wifi-recon',
    domain: 'wifi',
    name: 'Recon & Monitor Mode',
    short: 'RC',
    hue: 190,
    icon: 'radar',
    description: 'Porta la scheda in monitor mode e mappa l’etere: AP, ESSID/BSSID, canali, cifratura e client associati. Niente attacco ancora — solo visibilità.',
    subcategories: [
      { id: 'iface-setup', name: 'Interface & Monitor Mode',
        description: 'Identifica la scheda, killa i processi che interferiscono (NetworkManager/wpa_supplicant) e abilita la monitor mode. Base di tutto il resto.' },
      { id: 'discovery',   name: 'AP & Client Discovery',
        description: 'Scansiona le reti vicine: airodump-ng/kismet per BSSID, canale, cifratura (WPA2/WPA3/WEP/OPEN) e station list. Da qui scegli il target (BSSID + canale).' },
    ],
  },
  {
    id: 'wifi-capture',
    domain: 'wifi',
    name: 'Handshake & PMKID Capture',
    short: 'CP',
    hue: 50,
    icon: 'key',
    description: 'Cattura il materiale crittografico necessario al cracking offline: il 4-way handshake WPA/WPA2 (con o senza deauth) oppure il PMKID clientless dall’AP.',
    subcategories: [
      { id: 'handshake', name: 'WPA/WPA2 4-way Handshake',
        description: 'Aggancia un canale, attendi (o forza con una deauth) un client che si riautentica e salva il 4-way handshake nel .cap/.pcapng.' },
      { id: 'pmkid',     name: 'PMKID (clientless)',
        description: 'Estrai il PMKID direttamente dall’AP senza alcun client connesso (hcxdumptool). Funziona solo se l’AP lo include nel primo messaggio EAPOL.' },
      { id: 'deauth',    name: 'Deauth & Client Kick',
        description: 'Disconnetti i client (aireplay-ng/mdk4) per forzare la riautenticazione e catturare l’handshake. Rumoroso — usalo con criterio e nello scope.' },
    ],
  },
  {
    id: 'wifi-crack',
    domain: 'wifi',
    name: 'Offline Cracking',
    short: 'CK',
    hue: 25,
    icon: 'lock',
    description: 'Recupera la PSK offline dal materiale catturato: converti in formato hashcat 22000 e attacca con wordlist, regole o maschere. GPU >> CPU.',
    subcategories: [
      { id: 'convert',   name: 'Convert & Prep',
        description: 'Converti .cap/.pcapng nel formato hashcat 22000 (hcxpcapngtool) o nel vecchio 16800. Verifica che l’handshake/PMKID sia valido.' },
      { id: 'hashcat',   name: 'hashcat (GPU)',
        description: 'Cracking GPU dei mode 22000 (WPA-PBKDF2 EAPOL/PMKID). Wordlist, regole, maschere e combinator.' },
      { id: 'aircrack',  name: 'aircrack-ng (CPU)',
        description: 'Fallback CPU rapido per dizionari piccoli direttamente sul .cap, senza conversione.' },
    ],
  },
  {
    id: 'wifi-attacks',
    domain: 'wifi',
    name: 'Active Attacks',
    short: 'AT',
    hue: 310,
    icon: 'crosshair',
    description: 'Attacchi attivi: Evil Twin / rogue AP con captive portal per rubare la PSK, attacchi WPS (Pixie-Dust / PIN) e WEP legacy.',
    subcategories: [
      { id: 'evil-twin', name: 'Evil Twin / Rogue AP',
        description: 'Clona l’ESSID target, forza i client sul tuo AP e cattura la PSK via captive portal (eaphammer, hostapd-mana, wifiphisher).' },
      { id: 'wps',       name: 'WPS',
        description: 'Attacchi al WPS: Pixie-Dust (offline) e PIN bruteforce (reaver/bully). Veloce quando l’AP è vulnerabile.' },
      { id: 'wep',       name: 'WEP (legacy)',
        description: 'Reti WEP: IV collection + aircrack-ng. Raro oggi ma ancora presente in OT/legacy.' },
    ],
  },
  {
    id: 'wifi-enterprise',
    domain: 'wifi',
    name: 'WPA-Enterprise (802.1X)',
    short: 'EN',
    hue: 260,
    icon: 'sitemap',
    description: 'Attacchi a WPA-Enterprise / 802.1X: rogue RADIUS per catturare le credenziali EAP (MSCHAPv2) e relay. Richiede un AP gestito da te.',
    subcategories: [
      { id: 'eap-recon', name: 'EAP Recon',
        description: 'Identifica il metodo EAP (PEAP/EAP-TTLS/EAP-TLS) e se i client validano il certificato del server (la chiave dell’attacco rogue).' },
      { id: 'rogue-radius', name: 'Rogue RADIUS / Cred Capture',
        description: 'eaphammer / hostapd-wpe: AP enterprise fasullo che cattura gli hash MSCHAPv2 dei client, poi crack offline (hashcat 5500).' },
    ],
  },
  {
    id: 'wifi-postauth',
    domain: 'wifi',
    name: 'Post-Connection',
    short: 'PA',
    hue: 140,
    icon: 'network',
    description: 'Una volta sulla rete wireless: recon della LAN, MITM e pivot verso l’infrastruttura. Da qui spesso si passa alla disciplina PT.',
    subcategories: [
      { id: 'lan-recon', name: 'LAN Recon',
        description: 'Connettiti con la PSK recuperata e mappa la LAN interna (host vivi, gateway, servizi). Ponte verso il pentest infrastrutturale.' },
      { id: 'mitm',      name: 'MITM',
        description: 'Intercetta il traffico sul segmento wireless (bettercap): ARP/ND spoofing, sniffing, downgrade.' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
//  Disciplines — top-level mode switch. Each one owns a set of
//  phases (categories tagged with the matching `domain`), its own
//  Target-context fields and its own "Cosa hai" / platform filters.
//  Add a new object here to introduce a new discipline.
// ════════════════════════════════════════════════════════════
const DISCIPLINES = [
  {
    id: 'pt',
    name: 'Pentest',
    short: 'PT',
    icon: 'crosshair',
    blurb: 'Infrastruttura, Active Directory e Web',
    showPlatform: true,
    targetFields: [
      { key: 'ip',       label: 'IP',       placeholder: '10.10.10.11' },
      { key: 'user',     label: 'Utente',   placeholder: 'jdoe' },
      { key: 'password', label: 'Password', placeholder: '••••••', secret: true },
      { key: 'domain',   label: 'Dominio',  placeholder: 'corp.local' },
      { key: 'hash',     label: 'Hash',     placeholder: 'aad3b…', secret: true },
    ],
    accessOptions: [
      { value: 'all',      label: 'Qualsiasi accesso' },
      { value: 'no-creds', label: 'Nessuna credenziale' },
      { value: 'password', label: 'Password' },
      { value: 'hash',     label: 'Hash (NTLM)' },
      { value: 'ticket',   label: 'Ticket Kerberos' },
      { value: 'cert',     label: 'Certificato (PFX)' },
      { value: 'shell',    label: 'Shell' },
    ],
  },
  {
    id: 'wifi',
    name: 'WiFi',
    short: 'WiFi',
    icon: 'wifi',
    blurb: 'Assessment wireless 802.11',
    showPlatform: false,
    targetFields: [
      { key: 'iface',   label: 'Interfaccia', placeholder: 'wlan0' },
      { key: 'mon',     label: 'Monitor',     placeholder: 'wlan0mon' },
      { key: 'bssid',   label: 'BSSID',        placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'essid',   label: 'ESSID',        placeholder: 'CORP-WIFI' },
      { key: 'channel', label: 'Canale',       placeholder: '6' },
      { key: 'client',  label: 'Client MAC',   placeholder: '11:22:33:44:55:66' },
    ],
    accessOptions: [
      { value: 'all',       label: 'Qualsiasi' },
      { value: 'no-creds',  label: 'Solo monitor' },
      { value: 'handshake', label: 'Ho un handshake' },
      { value: 'pmkid',     label: 'Ho un PMKID' },
      { value: 'eap-creds', label: 'Credenziali EAP' },
      { value: 'psk',       label: 'PSK recuperata' },
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
  // WiFi
  'handshake': { label: 'handshake', tone: 'amber' },
  'pmkid':     { label: 'pmkid',     tone: 'violet' },
  'eap-creds': { label: 'eap-creds', tone: 'sky' },
  'psk':       { label: 'psk',       tone: 'mint' },
  'wordlist':  { label: 'wordlist',  tone: 'slate' },
};

const PROTOCOL_META = {
  smb: 'cyan', ldap: 'indigo', kerberos: 'rose', winrm: 'teal',
  rdp: 'orange', rpc: 'purple', dns: 'lime', ntlm: 'pink',
  mssql: 'red', mysql: 'red', http: 'yellow', tcp: 'slate', udp: 'slate',
  ntp: 'slate', dcsync: 'rose', wmi: 'teal', ftp: 'cyan', ssh: 'teal',
  snmp: 'lime', smtp: 'pink', nfs: 'cyan', redis: 'red', ipmi: 'orange',
  icmp: 'slate',
  // WiFi
  wpa2: 'teal', wpa: 'teal', wpa3: 'cyan', wep: 'orange', wps: 'pink',
  eap: 'indigo', '802.11': 'slate', pmkid: 'violet', eapol: 'rose',
  open: 'slate',
};

window.CATEGORIES = CATEGORIES;
window.DISCIPLINES = DISCIPLINES;
window.REQUIRES_META = REQUIRES_META;
window.PROTOCOL_META = PROTOCOL_META;
