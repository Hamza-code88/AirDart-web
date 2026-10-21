@echo off
title AirDart Desktop (Next.js + Electron)
echo =======================================================
echo          AirDart Zero-Cloud P2P Desktop Engine
echo =======================================================
echo Starting Next.js Local Server...
start "" cmd /c "npm run dev"
echo Waiting for Next.js to initialize on http://localhost:3000...
timeout /t 4 /nobreak >nul
echo Launching Electron Desktop Window with AirGrab Engine...
call .\node_modules\.bin\electron.cmd .
pause
