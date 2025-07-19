@echo off
title Direct Vite Test
echo ============================================
echo    Running Vite directly (not through npm)
echo ============================================
echo.

cd /d "%~dp0"

echo Killing any existing Node processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Running Vite directly...
echo.

node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173

echo.
echo Vite command finished
pause