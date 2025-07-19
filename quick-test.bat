@echo off
title Quick Test - Fixed Firebase Config
echo ============================================
echo    Testing Fixed Firebase Configuration
echo ============================================
echo.

cd /d "%~dp0"

echo The firebase-config.js has been fixed!
echo - Changed process.env to import.meta.env
echo - This should resolve the white screen issue
echo.

echo Killing any existing servers...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting Vite server...
echo.
echo Visit: http://localhost:5173
echo You should now see the test page instead of white screen!
echo.
echo ============================================

node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173

pause