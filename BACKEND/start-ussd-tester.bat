@echo off
echo Starting Smart Farmer USSD Testing Environment
echo.

echo Starting server...
start cmd /k "cd /d "%~dp0" && node src/server.js"

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Opening USSD testing tool in browser...
start http://localhost:3001/ussd-tester.html

echo.
echo You can now test the USSD functionality in your browser.
echo The server is running on http://localhost:3001
echo.
echo Press any key to exit this window...
pause > nul