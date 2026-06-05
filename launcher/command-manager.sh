#!/usr/bin/env bash
# ============================================================================
#  WannaHack — Command Manager launcher  (Linux / macOS)
#  toolmap-style: put a Desktop icon (from icon.png) that serves the app over
#  localhost and opens it in the browser, after every sanity check.
#  Only the launcher goes on the Desktop; every other file stays in the repo.
#
#  Why a server and not just file://?
#    index.html loads app.jsx via <script type="text/babel">.
#    Babel-standalone fetches that file over XHR; browsers block XHR on the
#    file:// scheme (CORS), so a plain double-click on the HTML shows a blank
#    page. We therefore serve the repo over http://127.0.0.1 and open that.
#
#  Usage:
#    ./command-manager.sh              # same as: launch
#    ./command-manager.sh launch       # start server + open browser
#    ./command-manager.sh install      # generate icon + launcher inside the repo
#    ./command-manager.sh uninstall    # remove the generated files
#    ./command-manager.sh status       # run checks only, print report
#    ./command-manager.sh help          # show help (also -h, --help)
# ============================================================================
set -euo pipefail

# ---- identity --------------------------------------------------------------
APP_NAME="WannaHack Command Manager"
APP_ID="wannahack-command-manager"
HTML_FILE="index.html"
PORT_DEFAULT="${CM_PORT:-8787}"

# ---- pretty (palette stile Kali-Linux-Toolmap) -----------------------------
if [[ -t 1 ]]; then
  CYAN=$'\e[96m'; BLUE=$'\e[94m'; GREEN=$'\e[92m'; YELLOW=$'\e[93m'
  RED=$'\e[91m';  MAGENTA=$'\e[95m'; WHITE=$'\e[97m'; GRAY=$'\e[90m'
  BOLD=$'\e[1m';  NC=$'\e[0m'
else CYAN= BLUE= GREEN= YELLOW= RED= MAGENTA= WHITE= GRAY= BOLD= NC=; fi
ok()   { printf "  ${GREEN}[OK]${NC} ${WHITE}%s${NC}\n" "$*"; }
warn() { printf "  ${YELLOW}[!]${NC}  ${GRAY}%s${NC}\n" "$*"; }
die()  { printf "  ${RED}[X]${NC} ${WHITE}%s${NC}\n" "$*" >&2; exit 1; }
info() { printf "${CYAN}${BOLD}%s${NC}\n" "$*"; }
hr()   { printf "${CYAN}===========================================================${NC}\n"; }

# ---- locate the repo (dir that holds the HTML) -----------------------------
SELF="$(cd "$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")" && pwd)"
SCRIPT_PATH="$SELF/$(basename "$0")"
find_repo() {
  local d="$SELF"
  for _ in 1 2 3; do
    [[ -f "$d/$HTML_FILE" ]] && { printf '%s' "$d"; return 0; }
    d="$(dirname "$d")"
  done
  return 1
}
REPO_DIR="$(find_repo)" || die "'$HTML_FILE' not found near $SELF — keep this script inside the repo."

# ---- checks ----------------------------------------------------------------
have() { command -v "$1" >/dev/null 2>&1; }

# The server is ALWAYS Python (like Kali-Linux-Toolmap), and conda is the first
# choice. detect_python() scans, conda first; resolve_python() also honours the
# interpreter baked into the .desktop at install time (CM_PYTHON).
detect_python() {
  local c
  # 1) conda env currently active (script launched from an activated shell)
  [[ -n "${CONDA_PREFIX:-}" && -x "$CONDA_PREFIX/bin/python3" ]] && { echo "$CONDA_PREFIX/bin/python3"; return; }
  [[ -n "${CONDA_PREFIX:-}" && -x "$CONDA_PREFIX/bin/python"  ]] && { echo "$CONDA_PREFIX/bin/python";  return; }
  # 2) conda base installs (miniconda/anaconda/miniforge)
  for c in "$HOME/miniconda3" "$HOME/anaconda3" "$HOME/miniforge3" "$HOME/mambaforge" "/opt/conda"; do
    [[ -x "$c/bin/python3" ]] && { echo "$c/bin/python3"; return; }
    [[ -x "$c/bin/python"  ]] && { echo "$c/bin/python";  return; }
  done
  # 3) system python on PATH
  command -v python3 2>/dev/null && return
  command -v python  2>/dev/null && return
  echo ""
}
resolve_python() {
  # CM_PYTHON (baked at install) wins — a desktop double-click does NOT run
  # `conda activate`, so we captured the right interpreter at install time.
  [[ -n "${CM_PYTHON:-}" && -x "${CM_PYTHON}" ]] && { echo "$CM_PYTHON"; return; }
  detect_python
}

# Name of the conda flavour for a python path, or "" if it's a system python.
conda_label() {
  case "$1" in
    *"/miniconda3/"*) echo miniconda3 ;;
    *"/anaconda3/"*)  echo anaconda3 ;;
    *"/miniforge3/"*) echo miniforge3 ;;
    *"/mambaforge/"*) echo mambaforge ;;
    *) [[ -n "${CONDA_PREFIX:-}" && "$1" == "$CONDA_PREFIX"* ]] && echo conda || echo "" ;;
  esac
}

port_busy() {  # 0 = something is listening on $1
  local p="$1"
  if have ss; then ss -ltnH 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$p\$"; return; fi
  if have nc; then nc -z 127.0.0.1 "$p" >/dev/null 2>&1; return; fi
  (exec 3<>"/dev/tcp/127.0.0.1/$p") >/dev/null 2>&1 && { exec 3>&- 3<&-; return 0; } || return 1
}

free_port() {
  local p="$PORT_DEFAULT" i
  for i in $(seq 0 30); do
    port_busy "$p" || { echo "$p"; return; }
    p=$((p + 1))
  done
  echo "$PORT_DEFAULT"
}

wait_up() {  # wait until $1 is listening
  local p="$1" i
  for i in $(seq 1 60); do port_busy "$p" && return 0; sleep 0.1; done
  return 1
}

# LAN IP (VPN-safe): skip tun/tap/wg/ppp, prefer 192.168.x / 172.16-31.x
lan_ip() {
  local ip="" a
  if have ip; then
    ip=$(ip -4 addr show scope global 2>/dev/null \
         | grep -v -E 'tun[0-9]|tap[0-9]|wg[0-9]|ppp[0-9]' \
         | grep 'inet ' | head -1 | awk '{print $2}' | cut -d/ -f1)
  fi
  if [[ -z "$ip" ]] && have hostname; then
    for a in $(hostname -I 2>/dev/null); do
      if [[ "$a" =~ ^192\.168\. || "$a" =~ ^172\.(1[6-9]|2[0-9]|3[01])\. ]]; then ip="$a"; break; fi
    done
    [[ -z "$ip" ]] && ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  fi
  [[ -z "$ip" ]] && ip=$(ipconfig getifaddr en0 2>/dev/null)   # macOS
  echo "$ip"
}

# Prefer binding 0.0.0.0 (LAN-reachable); fall back to 127.0.0.1 if blocked.
pick_bind() {
  local py="$1" port="$2"
  if "$py" -c "import socket; s=socket.socket(); s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1); s.bind(('0.0.0.0',$port)); s.close()" 2>/dev/null; then
    echo "0.0.0.0"
  else
    echo "127.0.0.1"
  fi
}

browser_cmd() {
  local b
  for b in xdg-open open sensible-browser x-www-browser firefox chromium chromium-browser google-chrome brave-browser; do
    have "$b" && { echo "$b"; return; }
  done
  echo ""
}

cmd_status() {
  info "Command Manager — environment check"
  ok "repo: $REPO_DIR"
  [[ -f "$REPO_DIR/$HTML_FILE" ]] && ok "found: $HTML_FILE" || die "missing $HTML_FILE"
  local f
  for f in app.jsx data.js categories.js chains.js styles.css; do
    [[ -f "$REPO_DIR/$f" ]] && ok "found: $f" || warn "missing: $f (app may not fully load)"
  done
  local py; py="$(resolve_python)"
  if [[ -n "$py" ]]; then
    case "$py" in
      *conda*|*anaconda*|*miniforge*|*mambaforge*) ok "python (conda): $py" ;;
      *) ok "python: $py" ;;
    esac
  else
    die "Python not found — install Python 3 (conda recommended)"
  fi
  local bc; bc="$(browser_cmd)"
  [[ -n "$bc" ]] && ok "browser opener: $bc" || warn "no browser opener found (you'll open the URL by hand)"
  local p; p="$(free_port)"
  ok "free port: $p"
  [[ -f "$(icon_path)" ]] && ok "icon: $(icon_path)" || warn "icon.png missing at $(icon_path)"
  ok "desktop target: $(desktop_path)"
}

# ---- serve -----------------------------------------------------------------
serve() {  # exec `python -m http.server` on port $1, bind $2 (foreground)
  local port="$1" bind="${2:-127.0.0.1}" py
  py="$(resolve_python)"
  [[ -n "$py" ]] || die "Python not found (install Python 3, ideally via conda)"
  cd "$REPO_DIR"
  exec "$py" -m http.server "$port" --bind "$bind"
}

SERVER_PID=""
cleanup_server() { [[ -n "${SERVER_PID:-}" ]] && kill "$SERVER_PID" 2>/dev/null || true; }

cmd_launch() {
  [[ -f "$REPO_DIR/$HTML_FILE" ]] || die "missing $HTML_FILE"
  local py port bind ip url_local url_net bc
  py="$(resolve_python)"
  [[ -n "$py" ]] || die "Python not found — install Python 3 (conda recommended)"

  port="$(free_port)"
  bind="$(pick_bind "$py" "$port")"
  ip="$(lan_ip)"
  url_local="http://localhost:${port}/"          # index.html served at root
  url_net="http://${ip}:${port}/"

  ( serve "$port" "$bind" ) &
  SERVER_PID=$!
  trap cleanup_server INT TERM EXIT
  wait_up "$port" || die "server did not come up on port $port"

  bc="$(browser_cmd)"
  if [[ -n "$bc" ]]; then nohup "$bc" "$url_local" >/dev/null 2>&1 & fi

  local cl; cl="$(conda_label "$py")"
  printf "\n"; hr
  printf "${CYAN}${BOLD}                  WANNAHACK — COMMAND MANAGER${NC}\n"
  hr
  printf "\n"
  if [[ -n "$cl" ]]; then
    printf "  ${GREEN}[OK]${NC} ${WHITE}Conda attivato (%s)${NC}\n" "$cl"
  else
    printf "  ${YELLOW}[INFO]${NC} ${WHITE}Conda non trovato, uso Python di sistema${NC}\n"
  fi
  printf "\n"
  printf "  ${GREEN}[OK]${NC} ${WHITE}Porta %s disponibile${NC}\n" "$port"
  printf "\n"
  hr
  printf "  ${BLUE}[LOCALE]${NC}     ${MAGENTA}%s${NC}\n" "$url_local"
  if [[ "$bind" == "0.0.0.0" && -n "$ip" ]]; then
    printf "  ${BLUE}[RETE]${NC}       ${MAGENTA}%s${NC}\n" "$url_net"
    printf "\n  ${GRAY}Accessibile da qualsiasi dispositivo sulla stessa rete${NC}\n"
  else
    printf "  ${YELLOW}[NOTA]${NC}      ${GRAY}Accesso da rete non disponibile (VPN/firewall o IP assente)${NC}\n"
  fi
  printf "  ${YELLOW}Chiudi questa finestra per fermare il server${NC}\n"
  hr
  printf "\n  ${GREEN}[AVVIO]${NC} ${WHITE}Server in esecuzione con python sulla porta %s (%s)${NC}\n\n" "$port" "$bind"
  wait "$SERVER_PID"
}

# ---- install ---------------------------------------------------------------
# Only the launcher (the "icon") goes onto the Desktop. icon.png stays in the
# repo and is the single source for both the desktop icon and the program icon.
#   <repo>/icon.png                              icon image
#   ~/Desktop/WannaHack Command Manager.desktop  the clickable launcher
icon_path() { echo "$REPO_DIR/icon.png"; }
desktop_dir() {
  local d=""
  have xdg-user-dir && d="$(xdg-user-dir DESKTOP 2>/dev/null)"
  [[ -n "$d" ]] || d="$HOME/Desktop"
  echo "$d"
}
desktop_path() { echo "$(desktop_dir)/$APP_NAME.desktop"; }

cmd_install() {
  info "Placing the launcher icon on the Desktop"
  local icon entry deskdir pybin exec_line
  icon="$(icon_path)"
  [[ -f "$icon" ]] || warn "icon.png not found at $icon — the icon may show blank"
  deskdir="$(desktop_dir)"; mkdir -p "$deskdir"
  entry="$(desktop_path)"

  # Capture the python to use (conda first) and bake it in, so the desktop icon
  # serves with the right interpreter even though a double-click never runs
  # `conda activate`.
  pybin="$(detect_python)"
  if [[ -n "$pybin" ]]; then
    exec_line="env \"CM_PYTHON=$pybin\" \"$SCRIPT_PATH\" launch"
    case "$pybin" in
      *conda*|*anaconda*|*miniforge*|*mambaforge*) ok "python baked in (conda): $pybin" ;;
      *) ok "python baked in: $pybin" ;;
    esac
  else
    warn "Python not found — install Python 3 (conda recommended) before launching"
    exec_line="\"$SCRIPT_PATH\" launch"
  fi

  cat > "$entry" <<DESKTOP
[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=Serve the WannaHack Command Manager on localhost and open it
Exec=$exec_line
Path=$REPO_DIR
Icon=$icon
Terminal=true
Categories=Development;Security;Utility;
Keywords=hacking;pentest;commands;wannahack;
StartupNotify=true
DESKTOP
  chmod +x "$entry"
  gio set "$entry" metadata::trusted true 2>/dev/null || true
  ok "icon on desktop: $entry"
  ok "icon image:      $icon"
  info "Done. Double-click \"$APP_NAME\" on your Desktop."
}

cmd_uninstall() {
  info "Removing the Desktop launcher (icon.png is kept)"
  rm -f "$(desktop_path)" 2>/dev/null && ok "removed desktop launcher" || true
  info "Done."
}

cmd_help() {
  info "WannaHack — Command Manager launcher (Linux/macOS)"
  cat <<EOF

Uso:
  $(basename "$0") [comando]

Comandi:
  launch       Avvia il server Python e apre il browser (default se ometti il comando)
  install      Mette l'icona sul Desktop (usa icon.png)
  uninstall    Rimuove l'icona dal Desktop (icon.png resta)
  status       Controlla l'ambiente (file, python, porta) — non scrive nulla
  help         Mostra questo aiuto (anche -h, --help)

Opzioni:
  CM_PORT=N    Porta di partenza (default ${PORT_DEFAULT}). Es: CM_PORT=9000 $(basename "$0")

Note:
  - Server: 'python -m http.server' — conda come prima scelta, poi python di sistema.
  - Rete:   prova bind 0.0.0.0 (LAN), fallback 127.0.0.1. Stampa URL [LOCALE] e [RETE].
  - Stop:   chiudi la finestra del launcher (o Ctrl+C).
EOF
}

# ---- dispatch --------------------------------------------------------------
case "${1:-launch}" in
  launch|"")        cmd_launch ;;
  install)          cmd_install ;;
  uninstall)        cmd_uninstall ;;
  status|check)     cmd_status ;;
  help|-h|--help)   cmd_help ;;
  *) warn "comando sconosciuto: '$1'"; cmd_help; exit 1 ;;
esac
