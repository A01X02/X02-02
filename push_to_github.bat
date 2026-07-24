@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  Push ai-chatbot-new-v0716 to GitHub
REM  Auto-detects script location - works on any drive letter
REM ============================================================

echo ============================================
echo   GitHub Push Script
echo ============================================

REM --- Step 0: Auto-detect script directory ---
cd /d "%~dp0"
if errorlevel 1 (
  echo [ERROR] Cannot find project directory.
  pause
  exit /b 1
)

echo Current directory: %CD%
echo.

REM --- Step 1: Check if Git is installed ---
where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git is not installed or not in PATH.
  echo Please install Git first: https://git-scm.com/downloads
  pause
  exit /b 1
)

echo [OK] Git found.
echo.

REM --- Step 2: Fix dubious ownership warning ---
git config --global --add safe.directory "%CD%"
if errorlevel 1 (
  echo [WARN] Failed to set safe.directory, continuing anyway...
)

REM --- Step 3: Configure Git user (change if needed) ---
echo [INFO] Setting Git user config...
git config user.name "A01X02"
git config user.email "A01X02@users.noreply.github.com"
echo.

REM --- Step 4: Check remote ---
echo [INFO] Checking remote repository...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo [INFO] No remote found. Adding origin...
  git remote add origin https://github.com/A01X02/X02-02.git
) else (
  echo [OK] Remote already configured.
)
echo.

REM --- Step 5: Stage all files ---
echo [INFO] Staging files...
git add -A
if errorlevel 1 (
  echo [ERROR] git add failed!
  pause
  exit /b 1
)
echo.

REM --- Step 6: Commit ---
echo [INFO] Creating commit...
git commit -m "feat: ai-chatbot v0716 - deploy package for CloudBase"
if errorlevel 1 (
  echo [WARN] Nothing to commit or commit failed. Continuing to push...
)
echo.

REM --- Step 7: Push to GitHub ---
echo [INFO] Pushing to GitHub (main branch)...
echo This may open a login window if not authenticated.
echo.
git push -u origin main 2>&1
if errorlevel 1 (
  echo.
  echo ============================================
  echo   [ERROR] PUSH FAILED!
  echo ============================================
  echo Possible reasons:
  echo   1. Not logged into GitHub - a login window should have appeared
  echo   2. Wrong credentials - try using a Personal Access Token (PAT)
  echo   3. Network issue - check your internet connection
  echo   4. Repository does not exist - create it first at github.com
  echo.
  echo To use PAT instead of password:
  echo   1. Go to GitHub - Settings - Developer Settings - Personal Access Tokens
  echo   2. Generate a new token with repo scope
  echo   3. Run: git push https://TOKEN@github.com/A01X02/X02-02.git main
  echo ============================================
  pause
  exit /b 1
)

echo.
echo ============================================
echo   [SUCCESS] Code pushed to GitHub!
echo   Repository: https://github.com/A01X02/X02-02
echo   Branch: main
echo ============================================
echo Now go back to TencentCloud and select branch "main".
echo.
pause
