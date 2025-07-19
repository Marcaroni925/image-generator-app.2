@echo off
echo ============================================
echo    Simple Frontend Start (No Background)
echo ============================================
echo.

cd /d "%~dp0"

echo Stopping any existing processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting frontend server...
echo This window will show all output.
echo.
echo Visit: http://localhost:5173/
echo Alternative: http://127.0.0.1:5173/
echo.
echo Press Ctrl+C to stop
echo ============================================
echo.

npm run dev

pause