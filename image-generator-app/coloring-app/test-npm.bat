@echo off
title Testing npm commands
echo ============================================
echo    Testing npm commands step by step
echo ============================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Testing npm version:
npm --version
echo.

echo Testing package.json read:
npm list --depth=0
echo.

echo Testing vite installation:
npm list vite
echo.

echo Testing if we can run scripts:
npm run
echo.

echo ============================================
echo Now trying to run dev script...
echo ============================================
echo.

echo Running: npm run dev
npm run dev

echo.
echo ============================================
echo npm run dev finished or failed
echo Press any key to close
echo ============================================
pause