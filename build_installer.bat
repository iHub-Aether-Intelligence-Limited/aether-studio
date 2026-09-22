@echo off
title Building Aether Studio Installer
echo Building installer.exe...
pip install pyinstaller -q
pyinstaller --onefile --windowed --name "AetherStudio-Setup" installer.py
echo.
echo Done! Installer is in dist\AetherStudio-Setup.exe
pause
