@echo off
setlocal EnableExtensions
title HTR Roster Photos Folderizer v1.2

cd /d "%~dp0"

echo Running HTR Roster Photos Folderizer v1.2...
echo Folder: %CD%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0MOVE-ROSTER-PHOTOS-HERE.ps1"

echo.
pause
endlocal
