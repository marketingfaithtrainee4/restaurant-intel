<#
.SYNOPSIS
    One-time local setup for the Restaurant Marketing Intelligence platform.

.DESCRIPTION
    - Installs npm dependencies
    - Checks for Supabase CLI (installs via npm if missing)
    - Copies .env.example to .env.local if it doesn't exist yet
    - Optionally links + pushes the DB migration to a Supabase project

.NOTES
    Run from the project root:  .\scripts\setup.ps1
#>

param(
    [string]$SupabaseProjectRef = ""
)

Write-Host "== Restaurant Intel: setup starting ==" -ForegroundColor Cyan

# 1. Install npm dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed."
    exit 1
}

# 2. Ensure Supabase CLI is available
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Supabase CLI not found — installing globally via npm..." -ForegroundColor Yellow
    npm install -g supabase
}

# 3. Copy env template if .env.local doesn't exist
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "Created .env.local from template — fill in your real keys before running the app." -ForegroundColor Green
} else {
    Write-Host ".env.local already exists — leaving it as is." -ForegroundColor DarkGray
}

# 4. Link + push migrations, if a project ref was supplied
if ($SupabaseProjectRef -ne "") {
    Write-Host "Linking to Supabase project $SupabaseProjectRef..." -ForegroundColor Yellow
    supabase link --project-ref $SupabaseProjectRef

    Write-Host "Pushing database migrations..." -ForegroundColor Yellow
    supabase db push
} else {
    Write-Host "No -SupabaseProjectRef supplied — skipping link/push." -ForegroundColor DarkGray
    Write-Host "Run again with: .\scripts\setup.ps1 -SupabaseProjectRef your-project-ref" -ForegroundColor DarkGray
}

Write-Host "== Setup complete ==" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  1. Fill in real values in .env.local"
Write-Host "  2. Run: npm run dev"
Write-Host "  3. Open http://localhost:3000"
