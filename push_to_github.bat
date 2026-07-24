@echo off
chcp 65001 >nul
title 智能体项目一键推送 GitHub

echo ============================================
echo   智能体项目推送脚本（CMD 版）
echo   仓库：https://github.com/A01X02/X02-02.git
echo ============================================

REM 1. 解决外接硬盘（K盘）的 dubious ownership 报错
git config --global --add safe.directory "K:\Games\ai-chatbot-new-v0716"

REM 2. 进入项目目录
cd /d "K:\Games\ai-chatbot-new-v0716"
if errorlevel 1 (
  echo [错误] 找不到项目目录 K:\Games\ai-chatbot-new-v0716
  pause
  exit /b 1
)

REM 3. 配置提交身份（如已配置则保持，无影响）
git config user.name "mimi"
git config user.email "mimi@users.noreply.github.com"

REM 4. 暂存所有改动（.gitignore 已排除 node_modules 等）
git add -A

REM 5. 仅在有改动时提交
git diff --cached --quiet
if %errorlevel%==0 (
  echo [信息] 没有新的改动，跳过提交。
) else (
  git commit -m "更新：智能体项目 + 扣子记忆工作流设计 %date%"
  echo [信息] 已提交。
)

REM 6. 设置远程仓库地址（已存在则更新，不存在则新增）
git remote get-url origin >nul 2>&1
if %errorlevel%==0 (
  git remote set-url origin https://github.com/A01X02/X02-02.git
) else (
  git remote add origin https://github.com/A01X02/X02-02.git
)

REM 7. 推送到 GitHub
echo [信息] 开始推送到 GitHub...
git push -u origin main

echo.
echo ============================================
echo   推送完成！按任意键关闭窗口。
echo ============================================
pause
