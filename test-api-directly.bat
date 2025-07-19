@echo off
title Direct API Test
echo ============================================
echo    Testing API Directly with curl
echo ============================================
echo.

cd /d "%~dp0"

echo Testing if backend is reachable...
echo.

echo 1. Testing health endpoint:
curl -X GET http://localhost:3001/api/health 2>nul
echo.
echo.

echo 2. Testing generation endpoint with simple prompt:
curl -X POST http://localhost:3001/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"a simple cat\"}" 2>nul
echo.
echo.

echo 3. Testing prompt refinement endpoint:
curl -X POST http://localhost:3001/api/refine-prompt ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"a cute dog\"}" 2>nul
echo.

echo.
echo ============================================
echo Direct API test completed
pause