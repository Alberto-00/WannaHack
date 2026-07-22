@echo off
setlocal EnableDelayedExpansion
title WannaHack - Command Manager

REM ====================================================================
REM  WannaHack - Command Manager launcher (Windows / cmd)
REM  Un solo file, come command-manager.sh su Linux. Comandi:
REM    (nessuno)/launch  avvia il server Python e apre il browser
REM    install           mette l'icona sul Desktop (icon.ico)
REM    uninstall         rimuove l'icona dal Desktop
REM    status            controlla ambiente (python, porta, icona)
REM    help / -h / --help
REM  Server = Python, conda come prima scelta. Solo localhost (127.0.0.1).
REM  Niente PowerShell (shortcut via cscript/VBS).
REM ====================================================================

REM ---- palette ANSI (Windows 10+) ----
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
if "!ESC!"=="" set "ESC=["
set "CYAN=!ESC![96m"
set "BLUE=!ESC![94m"
set "GREEN=!ESC![92m"
set "YELLOW=!ESC![93m"
set "RED=!ESC![91m"
set "MAGENTA=!ESC![95m"
set "WHITE=!ESC![97m"
set "GRAY=!ESC![90m"
set "RESET=!ESC![0m"
set "BOLD=!ESC![1m"

set "APP=WannaHack Command Manager"
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.."
set "PROJECT_DIR=%CD%"
popd

set "ACTION=%~1"
if "%ACTION%"=="" set "ACTION=launch"
if /i "%ACTION%"=="launch"    goto :launch
if /i "%ACTION%"=="install"   goto :install
if /i "%ACTION%"=="uninstall" goto :uninstall
if /i "%ACTION%"=="status"    goto :status
if /i "%ACTION%"=="help"      goto :help
if /i "%ACTION%"=="-h"        goto :help
if /i "%ACTION%"=="--help"    goto :help
if /i "%ACTION%"=="/?"        goto :help
echo   !YELLOW![!]!RESET! Comando sconosciuto: %ACTION%
goto :help


REM ====================================================================
:launch
cls
cd /d "%PROJECT_DIR%"
if not exist "index.html" (
    echo   !RED![ERRORE]!RESET! !WHITE!index.html non trovato in %PROJECT_DIR%!RESET!
    echo. & pause & exit /b 1
)
echo.
echo !CYAN!==========================================================!RESET!
echo !CYAN!!BOLD!                  WANNAHACK - COMMAND MANAGER!RESET!
echo !CYAN!==========================================================!RESET!
echo.

call :detect_python
if "!PYTHON_CMD!"=="" (
    echo   !RED![ERRORE]!RESET! !WHITE!Python non trovato. Installa Python 3 o Conda.!RESET!
    echo. & pause & exit /b 1
)
if "!CONDA_FOUND!"=="1" (
    echo   !GREEN![OK]!RESET! !WHITE!Conda attivato ^(!CONDA_NAME!^)!RESET!
) else (
    echo   !YELLOW![INFO]!RESET! !WHITE!Conda non trovato, uso Python di sistema!RESET!
)
echo.

call :find_port
if !PORT! equ 0 (
    echo   !RED![ERRORE]!RESET! !WHITE!Nessuna porta disponibile!!RESET!
    echo. & pause & exit /b 1
)
echo   !GREEN![OK]!RESET! !WHITE!Porta !PORT! disponibile!RESET!
echo.

set "BIND_ADDR=127.0.0.1"

echo !CYAN!==========================================================!RESET!
echo   !BLUE![LOCALE]!RESET!     !MAGENTA!http://localhost:!PORT!/!RESET!
echo.
echo   !GRAY!Solo su questo computer ^(127.0.0.1^) - nessun accesso da rete!RESET!
echo   !YELLOW!Chiudi questa finestra per fermare il server!RESET!
echo !CYAN!==========================================================!RESET!
echo.
echo   !GREEN![AVVIO]!RESET! !WHITE!Server in esecuzione con !PYTHON_CMD! sulla porta !PORT! ^(!BIND_ADDR!^)!RESET!
echo.

start "" http://localhost:!PORT!/
REM serve.py invia header no-store: il browser non mostra app.jsx vecchio
if exist "%SCRIPT_DIR%serve.py" (
    !PYTHON_CMD! "%SCRIPT_DIR%serve.py" !PORT! !BIND_ADDR!
) else (
    !PYTHON_CMD! -m http.server !PORT! --bind !BIND_ADDR!
)

if errorlevel 1 (
    echo.
    echo   !RED![ERRORE]!RESET! !WHITE!Il server si e' chiuso con un errore.!RESET!
    echo   !GRAY!Se la porta e' riservata, prova come Amministratore.!RESET!
    echo. & pause
)
exit /b 0


REM ====================================================================
:install
cls
set "TARGET=%SCRIPT_DIR%command-manager.bat"
set "ICON=%PROJECT_DIR%\img\icon.ico"
for /f "tokens=2*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop 2^>nul') do set "DESKTOP_PATH=%%b"
if not defined DESKTOP_PATH set "DESKTOP_PATH=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP_PATH%\%APP%.lnk"

echo.
echo   !CYAN!!BOLD!WannaHack - icona sul Desktop!RESET!
echo   !GRAY!Icona:   %ICON%!RESET!
echo   !GRAY!Desktop: %DESKTOP_PATH%!RESET!
echo.
if not exist "%ICON%" echo   !YELLOW![INFO]!RESET! icon.ico non trovato: verra' usata l'icona di default.

REM crea lo shortcut .lnk via VBScript (niente PowerShell)
set "VBS=%TEMP%\wh_shortcut.vbs"
> "%VBS%"  echo Set ws = CreateObject("WScript.Shell")
>> "%VBS%" echo Set lnk = ws.CreateShortcut("%SHORTCUT%")
>> "%VBS%" echo lnk.TargetPath = "cmd.exe"
>> "%VBS%" echo lnk.Arguments = "/c ""%TARGET%"""
>> "%VBS%" echo lnk.WorkingDirectory = "%PROJECT_DIR%"
>> "%VBS%" echo lnk.IconLocation = "%ICON%"
>> "%VBS%" echo lnk.Description = "Avvia WannaHack Command Manager"
>> "%VBS%" echo lnk.Save
cscript //nologo "%VBS%" >nul 2>&1
del "%VBS%" >nul 2>&1

if exist "%SHORTCUT%" (
    echo   !GREEN![OK]!RESET! !WHITE!Icona creata sul Desktop:!RESET!
    echo        %SHORTCUT%
    echo.
    echo   !GRAY!Doppio click sull'icona per avviare.!RESET!
) else (
    echo   !RED![ERRORE]!RESET! !WHITE!Impossibile creare l'icona.!RESET!
)
echo. & pause & exit /b 0


REM ====================================================================
:uninstall
for /f "tokens=2*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop 2^>nul') do set "DESKTOP_PATH=%%b"
if not defined DESKTOP_PATH set "DESKTOP_PATH=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP_PATH%\%APP%.lnk"
echo.
if exist "%SHORTCUT%" (
    del "%SHORTCUT%"
    echo   !GREEN![OK]!RESET! !WHITE!Icona rimossa dal Desktop ^(icon.png/icon.ico restano^).!RESET!
) else (
    echo   !YELLOW![INFO]!RESET! !WHITE!Nessuna icona da rimuovere.!RESET!
)
echo. & pause & exit /b 0


REM ====================================================================
:status
cls
cd /d "%PROJECT_DIR%"
echo.
echo   !CYAN!!BOLD!WannaHack - controllo ambiente!RESET!
if exist "index.html" ( echo   !GREEN![OK]!RESET! index.html ) else ( echo   !RED![X]!RESET! index.html mancante )
call :detect_python
if not "!PYTHON_CMD!"=="" (
    if "!CONDA_FOUND!"=="1" (
        echo   !GREEN![OK]!RESET! python ^(conda !CONDA_NAME!^): !PYTHON_CMD!
    ) else (
        echo   !GREEN![OK]!RESET! python: !PYTHON_CMD!
    )
) else (
    echo   !RED![X]!RESET! Python non trovato ^(installa Python 3 / conda^)
)
if exist "%PROJECT_DIR%\img\icon.ico" ( echo   !GREEN![OK]!RESET! icon.ico ) else ( echo   !YELLOW![!]!RESET! icon.ico mancante )
if exist "%PROJECT_DIR%\img\icon.png" ( echo   !GREEN![OK]!RESET! icon.png ) else ( echo   !YELLOW![!]!RESET! icon.png mancante )
call :find_port
echo   !GREEN![OK]!RESET! porta libera: !PORT!
echo. & pause & exit /b 0


REM ====================================================================
:help
echo.
echo   !CYAN!!BOLD!WannaHack - Command Manager ^(Windows^)!RESET!
echo.
echo   !WHITE!Uso:!RESET! command-manager.bat [comando]
echo.
echo   !WHITE!Comandi:!RESET!
echo     launch      Avvia il server e apre il browser ^(default: doppio click^)
echo     install     Mette l'icona sul Desktop ^(usa icon.ico^)
echo     uninstall   Rimuove l'icona dal Desktop
echo     status      Controlla ambiente ^(python, porta, icone^)
echo     help        Questo aiuto ^(anche -h, --help^)
echo.
echo   !WHITE!Note:!RESET! Server Python, conda come prima scelta. Solo localhost ^(127.0.0.1^).
echo. & pause & exit /b 0


REM ================== subroutine ==================

:detect_python
set "CONDA_FOUND=0"
set "PYTHON_CMD="
set "CONDA_NAME="
if exist "C:\ProgramData\miniconda3\condabin\conda.bat" (
    call C:\ProgramData\miniconda3\condabin\conda.bat activate base 2>nul
    if !errorlevel! equ 0 (
        set "CONDA_FOUND=1"
        set "PYTHON_CMD=python"
        set "CONDA_NAME=miniconda3"
    )
)
if "!CONDA_FOUND!"=="0" if exist "C:\ProgramData\anaconda3\condabin\conda.bat" (
    call C:\ProgramData\anaconda3\condabin\conda.bat activate base 2>nul
    if !errorlevel! equ 0 (
        set "CONDA_FOUND=1"
        set "PYTHON_CMD=python"
        set "CONDA_NAME=anaconda3"
    )
)
if "!CONDA_FOUND!"=="0" if exist "%USERPROFILE%\miniconda3\condabin\conda.bat" (
    call "%USERPROFILE%\miniconda3\condabin\conda.bat" activate base 2>nul
    if !errorlevel! equ 0 (
        set "CONDA_FOUND=1"
        set "PYTHON_CMD=python"
        set "CONDA_NAME=miniconda3"
    )
)
if "!CONDA_FOUND!"=="0" if exist "%USERPROFILE%\anaconda3\condabin\conda.bat" (
    call "%USERPROFILE%\anaconda3\condabin\conda.bat" activate base 2>nul
    if !errorlevel! equ 0 (
        set "CONDA_FOUND=1"
        set "PYTHON_CMD=python"
        set "CONDA_NAME=anaconda3"
    )
)
if "!CONDA_FOUND!"=="0" (
    where conda >nul 2>&1
    if !errorlevel! equ 0 (
        call conda activate base 2>nul
        if !errorlevel! equ 0 (
            set "CONDA_FOUND=1"
            set "PYTHON_CMD=python"
            set "CONDA_NAME=conda"
        )
    )
)
if "!CONDA_FOUND!"=="0" (
    where python >nul 2>&1
    if !errorlevel! equ 0 set "PYTHON_CMD=python"
    if "!PYTHON_CMD!"=="" (
        where python3 >nul 2>&1
        if !errorlevel! equ 0 set "PYTHON_CMD=python3"
    )
)
exit /b 0

:find_port
set "PORT=0"
for %%p in (8787 8000 3000 5000 8080 8001 8888 9000 4000) do (
    if !PORT! equ 0 (
        !PYTHON_CMD! -c "import socket,sys;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',%%p));s.close();sys.exit(0)" >nul 2>&1
        if !errorlevel! equ 0 set "PORT=%%p"
    )
)
exit /b 0
