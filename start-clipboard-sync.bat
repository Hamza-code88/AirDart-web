@echo off
title AirDart - Windows Auto Clipboard Sync
echo ============================================================
echo   AirDart Windows Auto-Clipboard Sync
echo ============================================================
echo.
echo Monitoring Windows Clipboard for Ctrl+C...
echo Any copied text will be beamed directly to your phone!
echo.
node scripts/clipboard-daemon.js
pause
