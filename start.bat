@echo off
title Aether Studio
cd /d "%~dp0"
echo ================================================
echo    AETHER STUDIO v1.0.0
echo ================================================
echo.
echo Starting...
echo Web UI: http://127.0.0.1:5200
echo.
start http://127.0.0.1:5200
python main.py
pause
