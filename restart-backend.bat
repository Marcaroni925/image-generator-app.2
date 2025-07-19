@echo off
title Restart Backend with Updated API Detection
echo ============================================
echo    Restarting Backend with Real API Key
echo ============================================
echo.

cd /d "%~dp0"

echo Stopping any existing backend processes...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting backend with updated API key detection...
echo.
echo Look for these messages:
echo - "Development (Real API)" (not Mock)
echo - Your API key length and prefix
echo - "Using real OpenAI key"
echo.
echo ============================================

npm run server

pause