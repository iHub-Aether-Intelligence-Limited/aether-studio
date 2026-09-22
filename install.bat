@echo off
setlocal enabledelayedexpansion
title Aether Studio Installer v1.0.0
color 0B

echo.
echo  ================================================
echo    AETHER STUDIO v1.0.0 - INSTALLER
echo ================================================
echo.

REM Check Python
echo [1/6] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Python not found!
    echo  Please install Python 3.10 or newer from:
    echo  https://www.python.org/downloads/
    echo  Make sure to check "Add Python to PATH" during install.
    echo.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo  Python !PYVER! - OK
echo.

REM Set install path
set INSTALL_DIR=%LOCALAPPDATA%\AetherStudio
echo [2/6] Install location: !INSTALL_DIR!
echo.

REM Create folders
echo [3/6] Creating folders...
if not exist "!INSTALL_DIR!" mkdir "!INSTALL_DIR!"
if not exist "!INSTALL_DIR!\workspaces" mkdir "!INSTALL_DIR!\workspaces"
if not exist "!INSTALL_DIR!\build_output" mkdir "!INSTALL_DIR!\build_output"
if not exist "!INSTALL_DIR!\database" mkdir "!INSTALL_DIR!\database"
echo  Folders created.
echo.

REM Copy files
echo [4/6] Copying Studio files...
set SRC=%~dp0
xcopy /E /I /Y "!SRC!static" "!INSTALL_DIR!\static" >nul 2>&1
xcopy /E /I /Y "!SRC!gateway" "!INSTALL_DIR!\gateway" >nul 2>&1
xcopy /E /I /Y "!SRC!studio_core" "!INSTALL_DIR!\studio_core" >nul 2>&1
xcopy /E /I /Y "!SRC!modules" "!INSTALL_DIR!\modules" >nul 2>&1
copy /Y "!SRC!main.py" "!INSTALL_DIR!\main.py" >nul 2>&1
if exist "!SRC!.env" copy /Y "!SRC!.env" "!INSTALL_DIR!\..\.env" >nul 2>&1
echo  Files copied.
echo.

REM Install dependencies
echo [5/6] Installing dependencies...
python -m pip install --user flask >nul 2>&1
echo  Dependencies ready.
echo.

REM Create desktop shortcut
echo [6/6] Creating desktop shortcut...
set DESKTOP=%USERPROFILE%\Desktop
set SHORTCUT=!DESKTOP!\Aether Studio.bat
echo @echo off > "!SHORTCUT!"
echo cd /d "!INSTALL_DIR!" >> "!SHORTCUT!"
echo start http://127.0.0.1:5200 >> "!SHORTCUT!"
echo python main.py >> "!SHORTCUT!"
echo pause >> "!SHORTCUT!"
echo  Shortcut created on desktop.
echo.

echo  ================================================
echo    INSTALL COMPLETE
echo ================================================
echo.
echo  Installed to: !INSTALL_DIR!
echo  Desktop shortcut: Aether Studio
echo.
echo  To start: double-click "Aether Studio" on your desktop
echo  Web UI:    http://127.0.0.1:5200
echo.
pause
