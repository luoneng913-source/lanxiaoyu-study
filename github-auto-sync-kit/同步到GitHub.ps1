$ErrorActionPreference = "Stop"

$ProjectPath = "E:\学堂网站"
$Repository = "https://github.com/luoneng913-source/lanxiaoyu-study.git"
$Branch = "main"

if (-not (Test-Path -LiteralPath $ProjectPath)) {
  throw "找不到项目文件夹：$ProjectPath"
}

Set-Location -LiteralPath $ProjectPath

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "未检测到 Git。请先安装 Git for Windows。"
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectPath ".git"))) {
  Write-Host "首次初始化 Git 仓库..." -ForegroundColor Yellow
  git init
}

$remote = ""
try { $remote = (git remote get-url origin 2>$null).Trim() } catch { $remote = "" }

if ([string]::IsNullOrWhiteSpace($remote)) {
  git remote add origin $Repository
} elseif ($remote -ne $Repository) {
  git remote set-url origin $Repository
}

git branch -M $Branch

if (-not (Test-Path -LiteralPath (Join-Path $ProjectPath ".gitignore"))) {
  @(
    "node_modules/",
    ".next/",
    "dist/",
    ".env",
    ".env.*",
    "!.env.example",
    "*.zip"
  ) | Set-Content -LiteralPath (Join-Path $ProjectPath ".gitignore") -Encoding UTF8
}

git add -A

git diff --cached --quiet
$hasNoChanges = $LASTEXITCODE -eq 0
if ($hasNoChanges) {
  Write-Host "没有检测到新的文件修改。" -ForegroundColor Yellow
  exit 0
}

$message = "sync: $((Get-Date).ToString('yyyy-MM-dd HH:mm'))"
git commit -m $message

Write-Host "正在推送到 GitHub $Branch..." -ForegroundColor Cyan
git push -u origin $Branch

Write-Host "同步完成。GitHub 推送后，Vercel 将自动开始部署。" -ForegroundColor Green
Read-Host "按回车关闭"
