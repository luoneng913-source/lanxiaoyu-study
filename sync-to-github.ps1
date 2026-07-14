$ErrorActionPreference = 'Stop'
$Repository = 'https://github.com/luoneng913-source/lanxiaoyu-study.git'
$Branch = 'main'
$ProjectPath = (Get-Location).Path

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is not installed.' }
if (-not (Test-Path -LiteralPath (Join-Path $ProjectPath '.git'))) { git init }

$remote = ''
try { $remote = (git remote get-url origin 2>$null).Trim() } catch { $remote = '' }
if ([string]::IsNullOrWhiteSpace($remote)) { git remote add origin $Repository }
elseif ($remote -ne $Repository) { git remote set-url origin $Repository }
git branch -M $Branch

if (-not (Test-Path -LiteralPath (Join-Path $ProjectPath '.gitignore'))) {
  @('node_modules/','.next/','dist/','.env','.env.*','!.env.example','*.zip') | Set-Content -LiteralPath (Join-Path $ProjectPath '.gitignore') -Encoding ASCII
}

git add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'No changes found.'; Read-Host 'Press Enter to close'; exit 0 }
git commit -m ("sync: " + (Get-Date).ToString('yyyy-MM-dd HH:mm'))
git push -u origin $Branch
Write-Host 'Sync completed. Vercel will deploy automatically.' -ForegroundColor Green
Read-Host 'Press Enter to close'
