@echo off
echo ========================================
echo Pushing to GitHub with Token
echo ========================================

cd /d D:\CODE\leadenforce-clone

REM Configure Git (if needed)
git config --global user.name "varuoog755-creator"
git config --global user.email "varuoog755@gmail.com"

REM Initialize repository
git init

REM Add all files
echo Adding files...
git add .

REM Commit
echo Creating commit...
git commit -m "Initial commit: LeadEnforce Clone - Social Automation Platform"

REM Set branch to main
git branch -M main

REM Add remote with token
echo Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://GITHUB_TOKEN@github.com/varuoog755-creator/leadandforce.git

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main --force

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo Repository: https://github.com/varuoog755-creator/leadandforce
echo.
pause
