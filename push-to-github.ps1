# Run in PowerShell AFTER: gh auth login
# If gh is on D: drive, set path first (edit the line below):

$GhExe = "D:\Software_pc\gh.exe"

if (-not (Test-Path $GhExe)) {
    Write-Host "gh.exe not found at: $GhExe"
    Write-Host "Find it: File Explorer -> search gh.exe on D:"
    Write-Host "Then edit `$GhExe in this script."
    exit 1
}

$DashboardRoot = $PSScriptRoot
$RepoName = "vetinstant-dashboard"   # <-- change if you want another name

Set-Location $DashboardRoot

& $GhExe auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Run login first: & '$GhExe' auth login"
    exit 1
}

$login = & $GhExe api user --jq .login
Write-Host "Logged in as: $login"

# Create repo on GitHub if it does not exist (public, for Pages)
& $GhExe repo view "$login/$RepoName" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating repo $login/$RepoName ..."
    & $GhExe repo create $RepoName --public --description "VetInstant dashboard (GitHub Pages)"
}

if (-not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "Add VetInstant dashboard with ngrok API config"
    git branch -M main
}

$remote = "https://github.com/$login/$RepoName.git"
git remote remove origin 2>$null
git remote add origin $remote

git push -u origin main

Write-Host ""
Write-Host "Done. Enable Pages: https://github.com/$login/$RepoName/settings/pages"
Write-Host "Branch: main, folder: / (root)"
Write-Host "Site URL: https://$login.github.io/$RepoName/"
