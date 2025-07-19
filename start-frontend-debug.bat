@echo off
echo ============================================
echo    Coloring Book Creator - Frontend Debug
echo ============================================
echo.

REM Change to the project directory
cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Checking if package.json exists...
if exist package.json (
    echo ✓ package.json found
) else (
    echo ✗ package.json not found - wrong directory?
    pause
    exit /b 1
)

echo.
echo Checking if node_modules exists...
if exist node_modules (
    echo ✓ node_modules found
) else (
    echo ✗ node_modules not found - running npm install...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Checking Node.js version...
node --version
echo NPM version:
npm --version

echo.
echo Checking if port 5173 is free...
netstat -an | findstr :5173
if errorlevel 1 (
    echo ✓ Port 5173 is available
) else (
    echo ✗ Port 5173 is in use - stopping existing process...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak > nul
)

echo.
echo ============================================
echo Starting Vite dev server with verbose output...
echo ============================================
echo.

REM Try to start with verbose logging
npm run dev -- --host 0.0.0.0 --port 5173

echo.
echo ============================================
echo Vite server stopped or failed to start
echo ============================================
pause