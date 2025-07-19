@echo off
title Restore Original App
echo ============================================
echo    Restoring Original App.jsx
echo ============================================
echo.

cd /d "%~dp0"

if exist src\App-backup.jsx (
    copy src\App-backup.jsx src\App.jsx >nul
    echo ✓ Restored original App.jsx from backup
    del src\App-backup.jsx >nul
    echo ✓ Removed backup file
) else (
    echo ✗ No backup found - App.jsx not restored
)

echo.
echo Original app restored!
echo You can now run your regular start commands.
echo ============================================
pause