@echo off
title Path and Environment Check
echo ============================================
echo    Checking Environment and Path
echo ============================================
echo.

echo Current PATH:
echo %PATH%
echo.

echo Current directory:
echo %CD%
echo.

echo Checking for Node.js in PATH:
where node
echo.

echo Checking for npm in PATH:
where npm
echo.

echo Testing direct node command:
"C:\Program Files\nodejs\node.exe" --version 2>nul
if errorlevel 1 (
    echo Node.js not found in default location
) else (
    echo Node.js found in default location
)

echo.
echo Listing contents of current directory:
dir

echo.
echo ============================================
echo Press any key to close
echo ============================================
pause