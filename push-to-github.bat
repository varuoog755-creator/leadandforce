@echo off
echo ========================================
echo GitHub Push Script for LeadEnforce
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    echo OR use GitHub Desktop: https://desktop.github.com/
    echo.
    pause
    exit /b 1
)

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Creating initial commit...
git commit -m "Initial commit: LeadEnforce Clone - Social Automation Platform"

echo.
echo Step 4: Setting main branch...
git branch -M main

echo.
echo Step 5: Adding remote repository...
git remote add origin https://github.com/varuoog755-creator/leadandforce.git

echo.
echo Step 6: Pushing to GitHub...
git push -u origin main --force

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Repository: https://github.com/varuoog755-creator/leadandforce
echo.
echo Next step: Deploy to VPS
echo Run: ssh root@72.61.235.182
echo.
pause
