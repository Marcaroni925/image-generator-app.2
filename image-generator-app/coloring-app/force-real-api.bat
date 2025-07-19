@echo off
title Force Real API Mode
echo ============================================
echo    Forcing Real OpenAI API Usage
echo ============================================
echo.

cd /d "%~dp0"

echo This will temporarily modify the server to force real API usage
echo regardless of environment detection.
echo.

echo Backing up server files...
if exist server\app.js (
    copy server\app.js server\app-backup.js >nul
    echo ✓ Backed up app.js
)

echo.
echo Modifying server to force real API...

REM Create a temporary patch file
echo const apiKey = process.env.OPENAI_API_KEY ^|^| 'sk-mock-key-for-testing'; > temp-patch.txt
echo   >> temp-patch.txt
echo   apiLogger.info('OpenAI client initialized', { >> temp-patch.txt
echo     mode: 'Forced Real API Mode', >> temp-patch.txt
echo     environment: process.env.NODE_ENV, >> temp-patch.txt
echo     hasApiKey: !!apiKey, >> temp-patch.txt
echo     keyLength: apiKey?.length >> temp-patch.txt
echo   }); >> temp-patch.txt

echo ✓ Temporary patch created
echo.

echo Starting server with forced real API mode...
echo.
echo Backend will be available at: http://localhost:3001
echo Should now show "Forced Real API Mode" in logs
echo.

REM Kill existing processes
taskkill /f /im node.exe >nul 2>&1

echo ============================================

npm run server

echo.
echo Server stopped. 
echo To restore original: copy server\app-backup.js server\app.js
pause