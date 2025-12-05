@echo off
setlocal

echo ==========================================
echo       LUNA-Badge Auto Sync Script
echo ==========================================

:: 1. Commit local changes
echo.
echo [1/3] Saving local changes...
git add .
:: Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% neq 0 (
    git commit -m "Auto-sync: %date% %time%"
    echo    - Changes committed.
) else (
    echo    - No changes to commit.
)

:: 2. Pull --rebase
echo.
echo [2/3] Pulling updates from GitHub (Rebase)...
git pull --rebase origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Pull failed! 
    echo It might be a merge conflict or network issue.
    echo Please resolve conflicts manually and run:
    echo     git rebase --continue
    pause
    exit /b %errorlevel%
)

:: 3. Push
echo.
echo [3/3] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed!
    echo Please check your network connection or proxy settings.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo [SUCCESS] Sync completed successfully!
echo ==========================================
pause
