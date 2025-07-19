@echo off
echo ============================================
echo    Coloring Book Creator - Port 8080
echo ============================================
echo.

cd /d "%~dp0"

echo Killing any existing Node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo.
echo Starting Vite on port 8080...
echo.
echo Frontend will be available at:
echo   http://localhost:8080/
echo   http://127.0.0.1:8080/
echo.
echo Press Ctrl+C to stop
echo ============================================
echo.

npx vite --port 8080 --host true

echo.
echo Server stopped.
pause