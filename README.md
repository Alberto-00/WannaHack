# WannaHack — Command Manager

## Indice

1. [Cos'è e a cosa serve](#cosè-e-a-cosa-serve)
2. [Avvio rapido (l'icona desktop)](#avvio-rapido-licona-desktop)
3. [Struttura del progetto](#struttura-del-progetto)
4. [Le due viste: Library e Attack Chains](#le-due-viste-library-e-attack-chains)
5. [Concetti chiave](#concetti-chiave)
6. [Tutte le funzionalità](#tutte-le-funzionalità)
7. [Scorciatoie da tastiera](#scorciatoie-da-tastiera)
8. [Modello dati](#modello-dati-per-chi-contribuisce)


## Cos'è e a cosa serve

Durante un pentest servono sempre gli stessi comandi, ma con parametri diversi (IP, dominio, utente, hash…) e nell'ordine giusto. **WannaHack** risolve due problemi:

- **«Qual era il comando?»** → la **Library** è un catalogo cercabile di comandi, diviso nelle 9 fasi di un'engagement, ognuno con descrizione, varianti e link di riferimento.

- **«E adesso cosa faccio?»** → le **Attack Chains** sono playbook, sequenze di comandi collegati (es. *Kerberoasting → crack → lateral movement*) con obiettivo, prerequisiti, mapping MITRE ATT&CK e avanzamento step-by-step.

Il tutto con un **contesto Target condiviso**: si scrive una volta l'IP/dominio/utente e ogni comando viene riscritto con i tuoi valori, pronto da copiare.

### Le 9 categorie

| # | Fase | Contenuto |
|---|------|-----------|
| 1 | **Information Gathering** | Recon passivo (OSINT, CT logs, DNS) e attivo (port scan, web/DNS discovery) |
| 2 | **Service Enumeration** | Enumeration per servizio: FTP, SSH, SMB, SNMP, SMTP, NFS, DNS, MSSQL, MySQL, RDP, WinRM, LDAP, Web |
| 3 | **Vulnerability Analysis** | SQLi, LFI, XXE, SSRF, file upload, command injection, CVE hunting |
| 4 | **Exploitation & Initial Access** | Payload, listener, web shell, attacchi a credenziali, stabilizzazione shell, AV bypass |
| 5 | **Post-Exploitation** | Situational awareness, raccolta credenziali, pillaging, persistence, file transfer |
| 6 | **Privilege Escalation** | Sudo, SUID/SGID, capabilities, cron, token, kernel, container escape (filtro Linux/Windows) |
| 7 | **Lateral Movement & Pivoting** | PsExec/WMI/WinRM, Pass-the-Hash, Pass-the-Ticket, Chisel/Ligolo/Proxychains |
| 8 | **Active Directory** | Setup, enum (BloodHound/LDAP), AS-REP/Kerberoasting/spray, ACL/ADCS/DCSync, persistence |
| 9 | **Utilities** | Reverse shell, GTFOBins, LOLBAS, cheatsheet (hashcat, file transfer, cURL) |

## Avvio rapido

Nella cartella `launcher/` ci sono due script che mettono **l'icona sul Desktop** e avviano l'app facendo tutti i controlli

#### Linux / macOS

```bash
cd launcher
./command-manager.sh status      # controlla l'ambiente (non modifica niente)
./command-manager.sh install     # mette l'icona sul Desktop (usa icon.png)
./command-manager.sh             # avvia subito (server + browser)
./command-manager.sh uninstall   # rimuove l'icona dal Desktop (icon.png resta)
```

Dopo `install` si trova **`WannaHack Command Manager` sul Desktop**.

#### Windows

Un **unico file `.bat`** (cmd) con gli stessi comandi del `.sh`.

```bat
cd launcher
command-manager.bat install      :: una volta — crea l'icona sul Desktop
command-manager.bat              :: avvia subito (server + browser)
command-manager.bat help         :: aiuto (anche -h, --help)
```

#### I comandi (uguali su Linux `.sh` e Windows `.bat`)

| Comando | Azione |
|---------|--------|
| `launch` (default) | Sceglie una porta libera, avvia il server Python, apre il browser, tiene il server vivo finché non si chiude la finestra. |
| `install` | Mette il launcher **sul Desktop** (`.desktop` su Linux, `.lnk` su Windows). |
| `uninstall` | Rimuove l'icona dal Desktop. Le icone (`icon.png`/`icon.ico`) e l'app restano. |
| `status` | Verifica file dell'app, Python (conda first), porta libera, icone. Non scrive nulla. |
| `help` | Mostra l'aiuto: comandi, note. Anche `-h` / `--help`. |

## Struttura del progetto

```
WannaHack/
├─ index.html                   # punto di ingresso (shell HTML, servito su /)
├─ app.jsx                      # tutta l'interfaccia React (~3.400 righe)
├─ categories.js                # tassonomia (9 fasi) + mappe colore dei tag
├─ data.js                      # COMMANDS[] — la libreria dei comandi
├─ chains.js                    # CHAINS[] — i playbook / attack chain
├─ styles.css                   # tutto lo stile (tema, layout, densità)
├─ icon.png                     # icona: favicon + logo in alto a sinistra
├─ icon.ico                     # icona multi-size per lo shortcut Windows
├─ launcher/
│  ├─ command-manager.sh   # launcher Linux/macOS (cmd: launch/install/uninstall/status/help)
│  └─ command-manager.bat  # launcher Windows (stessi comandi, in cmd)
```

## Le due viste: Library e Attack Chains

Si passa dall'una all'altra con la TopBar o coi tasti `1` e `2`.

### 📚 Library — il catalogo dei comandi

- Comandi raggruppati per **fase → sottofase → gruppo** (es. *Information Gathering → Passive Recon → DNS Records*).
- Ogni comando è una **card** con: nome, descrizione (quando e perché usarlo), il **template** del comando, i **tag**, eventuali **varianti** e i **link di riferimento** (HackTricks, RFC, doc ufficiali…).
- **Vista divisa**: lista a sinistra, dettaglio a destra.
- **Copia con un click**: il comando viene copiato **già compilato** con i valori del Target.

### 🔗 Attack Chains — i playbook

- Ogni chain ha **obiettivo**, **risultato atteso**, **prerequisiti**, **difficoltà**, **tempo stimato** e i **tag MITRE ATT&CK**.
- È una sequenza di **step**; ogni step richiama un comando della Library (`cmdRef`) e spiega **perché** quel passo serve (`rationale`).
- **Avanzamento**: ogni step si segna `todo → active → done` (o si salta), con campo **note** per output e osservazioni.
- **Captures**: i valori che si catturano in uno step (es. un hash, una lista di host) sono evidenziati come output da riusare nei passi successivi.


## Tutte le funzionalità

- 🔎 **Ricerca** istantanea su nomi, descrizioni e tag (`Ctrl+K`).
- 🧭 **Filtri sidebar**: per fase, sottofase e piattaforma.
- ⭐ **Preferiti**: segna i comandi che usi di più e mostrali da soli (`F`).
- 🎯 **Target condiviso**: parametri compilati una volta, usati ovunque.
- ✏️ **Comandi personalizzati**: aggiungi/modifica comandi dalla UI.
- 🧩 **Playbook personalizzati**: crea le tue attack chain, step per step.
- 🙈 **Nascondi** comandi/chain che non ti servono e **riordina** liste e step.
- 🗂️ **Gruppi e fasi comprimibili** per ridurre il rumore (`E`/`C`/`G`).
- ✅ **Avanzamento dei playbook** con stati, skip e note per step.
- 💾 **Backup JSON**: esporta tutto (preferiti, custom, progressi, target…) in un
  file e re-importalo quando vuoi (sovrascrive lo stato attuale).
- 🧱 **Esporta sorgenti**: rigenera `data.js` e `chains.js` (built-in + custom
  uniti), pronti da rimettere nel repo per condividere il tuo lavoro.
- ⌨️ **Scorciatoie da tastiera** (vedi sotto, `?` per la lista).
- 🎨 **Tema** mint/scuro con densità comoda, definito in `styles.css`.

## Scorciatoie da tastiera

| Tasti | Azione |
|-------|--------|
| `Ctrl` + `K` | Vai alla ricerca |
| `Ctrl` + `B` | Apri / chiudi la sidebar |
| `?` | Mostra tutte le scorciatoie |
| `Esc` | Chiudi modali e popup |
| `1` | Vista **Library** |
| `2` | Vista **Attack Chains** |
| `F` | Mostra / nascondi i preferiti |
| `E` / `C` | Espandi / comprimi tutte le fasi |
| `G` | Espandi / comprimi tutti i gruppi |


## Modello dati

I dati sono normali oggetti JavaScript. Per aggiungere roba a mano, modifica
`data.js` o `chains.js` (oppure fallo dalla UI ed esporta).

### Comando — `data.js`

```js
{
  id: 'whois-domain',                 // identificativo univoco
  name: 'whois — domain registration',
  category: 'info-gathering',         // una delle 9 fasi (categories.js)
  subcategory: 'passive-recon',       // sottofase
  group: 'WHOIS & ASN',               // raggruppamento visivo
  description: 'Registrar, date, nameserver…',
  platform: 'cross-platform',         // linux | windows | cross-platform
  requires: ['no-creds'],             // no-creds|password|hash|ticket|cert|shell
  protocols: [],                      // smb, ldap, http, …
  tags: ['whois', 'osint'],
  template: 'whois <domain>',         // <param> = segnaposto dal Target
  params: [                           // come compilare i segnaposto
    { key: 'domain', label: 'Domain', ctx: 'domain', placeholder: 'example.com' },
  ],
  variants: [                         // (opzionale) alternative dello stesso tool
    { id: 'plain', label: 'Plain whois', template: 'whois <ip>', description: '…' },
  ],
  refs: [                             // (opzionale) link di approfondimento
    { label: 'HackTricks — recon', url: 'https://…' },
  ],
}
```

### Attack chain — `chains.js`

```js
{
  id: 'esc1-to-da',
  name: 'ADCS ESC1 → Domain Admin',
  short: 'ESC1',
  category: 'active-directory', subcategory: 'priv-esc',
  tactic: 'Privilege Escalation',
  difficulty: 'medium',               // easy | medium | hard
  estTime: '15 min',
  objective: 'Cosa otteniamo e come, in una frase.',
  outcome: 'Risultato finale concreto.',
  prereqs: ['Un account di dominio qualsiasi', '…'],
  mitre: ['T1649'],                   // tecniche MITRE ATT&CK
  steps: [
    {
      id: 's1', title: 'Trova template vulnerabili',
      cmdRef: 'certipy-find',         // id di un comando in data.js
      rationale: 'Perché questo passo serve.',
      captures: [{ key: 'template', label: 'Template ESC1' }],  // output riusabile
      verify: 'Come capisci che è andato a buon fine.',         // (opzionale)
    },
  ],
}
```
