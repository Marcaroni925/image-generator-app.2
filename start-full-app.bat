@echo off
title Complete App Startup
echo ============================================
echo    Starting Complete Coloring Book App
echo ============================================
echo.

cd /d "%~dp0"

echo Step 1: Stopping any existing servers...
taskkill /f /im node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

echo.
echo Step 2: Starting Backend Server...
start "Coloring Book Backend" cmd /k "echo Backend Server && npm run server"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Step 3: Starting Frontend Server...
start "Coloring Book Frontend" cmd /k "echo Frontend Server && node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173"

echo.
echo ============================================
echo BOTH SERVERS STARTING!
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Two command windows should have opened.
echo Wait for both to show "ready" messages.
echo.
echo Then visit: http://localhost:5173
echo ============================================
echo.
echo Press any key to close this launcher...
pause