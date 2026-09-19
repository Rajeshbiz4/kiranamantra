@echo off
title KiranaMitra Windows Installer Builder
echo Checking Node.js...
node -v || goto :missing
echo Installing required packages...
call npm install || goto :failed
echo Building KiranaMitra installer...
call npm run dist:win || goto :failed
echo.
echo SUCCESS: Installer created in the release-installers folder.
echo You can copy that EXE to the client machine.
pause
exit /b 0
:missing
echo Install Node.js 20 LTS and run this file again.
pause
exit /b 1
:failed
echo Build failed.
echo Close KiranaMitra if it is running, then run this file again.
echo If Windows Security shows a warning, allow Node.js and the project folder.
pause
exit /b 1
