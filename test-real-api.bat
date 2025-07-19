@echo off
title Test Real API Integration
echo ============================================
echo    Testing Real OpenAI API Integration
echo ============================================
echo.

cd /d "%~dp0"

echo Stopping any existing backend processes...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting backend with fully fixed API detection...
echo.
echo You should now see:
echo ✓ "Development (Real API)" everywhere (not Mock)
echo ✓ "Real API Key" in system info
echo ✓ "Using real OpenAI key" 
echo.
echo ============================================

npm run server

pause