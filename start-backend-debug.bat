@echo off
title Backend Server Debug
echo ============================================
echo    Starting Backend Server with Debug Info
echo ============================================
echo.

cd /d "%~dp0"

echo Checking backend files...
if exist server\index.js (
    echo ✓ server\index.js found
) else (
    echo ✗ server\index.js not found
    pause
    exit /b 1
)

echo.
echo Checking .env file...
if exist .env (
    echo ✓ .env file found
    echo Checking OpenAI API key...
    findstr "OPENAI_API_KEY" .env
) else (
    echo ✗ .env file not found
)

echo.
echo Killing any existing backend processes...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1

echo.
echo Starting backend server...
echo Backend API will be available at: http://localhost:3001
echo.
echo Watch for these messages:
echo - "Firebase Admin SDK initialized successfully"
echo - "Server running on port 3001"
echo - OpenAI API mode (Mock or Real)
echo.
echo ============================================

npm run server

echo.
echo Backend server stopped or failed
pause