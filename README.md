# WannaHack

> CTF attack-chain automator. Plan, track, and write up offensive workflows from a single web console.

WannaHack is a single-page web app for CTF players and pentest students. It wraps a curated database of pentesting commands and exposes a **chain runner** that walks you through multi-step attacks — copy a command, paste the output, and the next step unblocks automatically as captured variables propagate downstream.

Runs entirely in your browser. No install, no backend, no telemetry, no remote execution.

## Authors

- **Giovanni Rapa** — [@Givaa](https://github.com/Givaa)
- **Alberto Montefusco** — [@Alberto-00](https://github.com/Alberto-00)

## What you get

- **Command library** — 285+ pentest commands with placeholders, auth variations, protocol/platform filters, copy-to-clipboard.
- **Attack chains** — YAML-defined playbooks (`asrep-to-shell.yaml`, `kerberoast-chain.yaml`, …). Step-by-step UI tracks state, propagates captured variables, supports forking and branching. *(Phase 2+)*
- **Knowledge bases integrated** — GTFOBins, LOLBAS, reverse-shell-generator land as first-class commands; HackTricks ships as a searchable index with bidirectional links from every command. Refreshed weekly via GitHub Actions. *(Phase 5–6)*
- **Mission Control UI** — Target Board (live target state) + Active Workspace (chain or free-form) + Next Moves (contextual suggestions). One screen, no decision fatigue. *(Phase 3)*
- **Auto-extract** — built-in parsers for nmap, impacket, secretsdump, hashcat, BloodHound, … paste output and variables pop into the board, no regex required. *(Phase 3)*
- **Visual chain editor** — drag-and-drop graph that reads/writes the same YAML. *(Phase 4)*
- **Mission Log export** — every session exports as a markdown writeup. *(Phase 7)*

## Run it

```bash
git clone https://github.com/Alberto-00/WannaHack.git
cd WannaHack
# open index.html directly in your browser, or:
python3 -m http.server 8000
```

`js/commands.js` is committed, so there is nothing to build before running. Optional rebuild after editing JSON:

```bash
npm install            # only needed for validate/build scripts
npm run validate       # AJV schema check against commands/
npm run build          # regenerate js/commands.js
```

## Chain authoring

Chains live under `chains/` as YAML files — git-versionable, shareable as "playbooks". Each step references a command by id, declares which variables it needs (`requires`) and which it captures from output (`capture`, with regex or auto-extract).

See `chains/` for examples and `schema/chain.schema.json` for the full grammar. *(Available from Phase 2.)*

```yaml
id: asrep-to-shell
name: "AS-REP Roast to Evil-WinRM Shell"
steps:
  - id: enum_users
    command_ref: nxc-ldap-users
    capture:
      - { var: user_list, regex: '^([A-Za-z0-9._-]+)\s', match: all }
  - id: roast
    command_ref: impacket-getnpusers
    requires: [user_list]
  # ...
```

## KB sync

GitHub Actions cron runs weekly and refreshes:
- **GTFOBins** → `commands/gtfobins/`
- **LOLBAS** → `commands/lolbas/`
- **reverse-shell-generator** → `commands/payloads/`
- **HackTricks** → `js/hacktricks-index.js` + `js/hacktricks-tag-map.js`

Diff lands as a PR for review. *(Phase 5–6.)*

## Adding a command manually

Open `command-editor.html` in your browser, fill in the form, save the generated JSON to `commands/<category>/<subcategory>/<id>.json`, run `node validate-commands.js`, commit.

## Keyboard shortcuts

Press <kbd>?</kbd> anywhere in the app to see all registered shortcuts. From Phase 3 onward, hotkeys cover the most frequent actions (`c` copy, `n` next step, `p` paste, `x` auto-extract, `g` guided start, `/` focus search).

## Credits

The seed command database, JSON schema, and original copy-to-clipboard UX were extracted from a prior pentest cheatsheet project; WannaHack adds the chain engine, integrated knowledge bases, the Mission Control UI, and the visual chain editor.

Commands themselves draw from:

- [The Hacker Recipes](https://www.thehacker.recipes/) — Charlie Bromberg & contributors
- [NetExec](https://www.netexec.wiki/) — the NetExec maintainers
- [Impacket](https://github.com/fortra/impacket) — Fortra
- [BloodHound](https://github.com/SpecterOps/BloodHound) and [bloodyAD](https://github.com/CravateRouge/bloodyAD)
- [Certipy](https://github.com/ly4k/Certipy) — Oliver Lyak
- [HackTricks](https://book.hacktricks.xyz/) — Carlos Polop & contributors
- [GTFOBins](https://gtfobins.github.io/) — the GTFOBins team
- [LOLBAS](https://lolbas-project.github.io/) — the LOLBAS team
- [reverse-shell-generator](https://github.com/0dayCTF/reverse-shell-generator) — 0dayCTF

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

For authorized security testing, CTF play, training, and research only. You are responsible for complying with all applicable laws and for having explicit permission before running any of these commands against systems you do not own.
