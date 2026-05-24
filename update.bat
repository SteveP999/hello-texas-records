@echo off
echo.
echo ==========================================
echo  HTR Label Home Update
echo ==========================================
echo.
echo Pausing Dropbox to prevent file locks...
"%LOCALAPPDATA%\Dropbox\client\Dropbox.exe" /pause 2>nul
timeout /t 3 /nobreak >nul

echo Pushing to GitHub...
git add .
git status
echo.
set /p MSG="Commit message (Enter = 'update label home'): "
if "%MSG%"=="" set MSG=update label home
git commit -m "%MSG%"
git push
set PUSH_RESULT=%errorlevel%

echo.
echo Resuming Dropbox...
"%LOCALAPPDATA%\Dropbox\client\Dropbox.exe" /start 2>nul

if %PUSH_RESULT% equ 0 (
  echo.
  echo ==========================================
  echo  SUCCESS! hello-texas-records is live.
  echo ==========================================
) else (
  echo ERROR: Push failed. Check output above.
)
echo.
pause
