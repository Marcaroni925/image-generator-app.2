@echo off
title Coloring Book Debug - Stay Open
echo ============================================
echo    Debug Terminal - Will Stay Open
echo ============================================
echo.

REM Change to the project directory
cd /d "%~dp0"

echo Current directory: %CD%
echo.
echo Current time: %TIME%
echo Current date: %DATE%
echo.

echo Testing basic commands...
echo.

echo Testing 'dir' command:
dir package.json 2>nul
if errorlevel 1 (
    echo ERROR: package.json not found in current directory
    echo Contents of current directory:
    dir
) else (
    echo SUCCESS: package.json found
)

echo.
echo Testing Node.js installation:
node --version 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found or not in PATH
    echo Please install Node.js from https://nodejs.org/
) else (
    echo SUCCESS: Node.js is installed
)

echo.
echo Testing npm installation:
npm --version 2>nul
if errorlevel 1 (
    echo ERROR: npm not found
) else (
    echo SUCCESS: npm is installed
)

echo.
echo Checking if node_modules exists:
if exist node_modules (
    echo SUCCESS: node_modules directory exists
) else (
    echo WARNING: node_modules not found
    echo Running npm install...
    npm install
)

echo.
echo ============================================
echo All checks completed.
echo Window will stay open - press any key to continue
echo ============================================
pause

echo.
echo Now attempting to start Vite...
echo.

npm run dev

echo.
echo ============================================
echo npm run dev command finished
echo Press any key to close this window
echo ============================================
pause