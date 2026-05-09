@echo off
echo.
echo ==========================================
echo  HTR Label Home Update
echo ==========================================
echo.
echo Pushing to GitHub...
git add .
git status
echo.
set /p MSG="Commit message (Enter = 'update label home'): "
if "%MSG%"=="" set MSG=update label home
git commit -m "%MSG%"
git push --force
if %errorlevel% equ 0 (
  echo.
  echo ==========================================
  echo  SUCCESS! hello-texas-records is live.
  echo ==========================================
) else (
  echo ERROR: Push failed.
)
echo.
pause
