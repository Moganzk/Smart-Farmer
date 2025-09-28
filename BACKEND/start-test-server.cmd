@echo off
echo Starting Smart Farmer Test Server...
cd /d %~dp0
node test-server.js
pause