@echo off
title Testing Simple App Version
echo ============================================
echo    Testing with Simple App (No Firebase)
echo ============================================
echo.

cd /d "%~dp0"

echo Backing up current App.jsx...
if exist src\App.jsx (
    copy src\App.jsx src\App-backup.jsx >nul
    echo ✓ Backed up App.jsx to App-backup.jsx
)

echo.
echo Replacing with simple test version...
copy src\App-simple.jsx src\App.jsx >nul
echo ✓ Using simple App version

echo.
echo Killing any existing servers...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting Vite with simple app...
echo.
echo Visit: http://localhost:5173
echo You should see a simple test page instead of white screen
echo.
echo Press Ctrl+C to stop, then run restore-app.bat to restore original
echo ============================================
echo.

node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173

pause