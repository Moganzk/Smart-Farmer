@echo off
echo Smart Farmer - Backend Server and Test Runner

echo.
echo [1] Start Backend Server
echo [2] Run Simple API Test
echo [3] Run Feature Tests (Profile, Settings, Notifications, USSD)
echo [4] Run USSD Service Test
echo [5] Exit
echo.

set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" (
  echo.
  echo Starting Backend Server...
  cd %~dp0
  node src/server.js
) else if "%choice%"=="2" (
  echo.
  echo Running Simple API Test...
  cd %~dp0\test
  powershell -ExecutionPolicy Bypass -File simple-test.ps1
) else if "%choice%"=="3" (
  echo.
  echo Running Feature Tests...
  cd %~dp0\test
  powershell -ExecutionPolicy Bypass -File test-features.ps1
) else if "%choice%"=="4" (
  echo.
  echo Running USSD Service Test...
  cd %~dp0
  node test/ussd-test.js
) else if "%choice%"=="5" (
  echo Exiting...
  exit /b 0
) else (
  echo Invalid choice. Please try again.
  pause
  %0
)

pause