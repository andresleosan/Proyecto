Param(
  [string]$ServiceAccountPath = ''
)

# Simple orchestrator: installs dependencies and runs seeds. Requires Node.js installed.
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js is not installed or not in PATH. Install Node.js (LTS) and reopen shell."
  exit 1
}

if ($ServiceAccountPath -ne '') {
  if (-not (Test-Path $ServiceAccountPath)) {
    Write-Error "Service account path '$ServiceAccountPath' not found."
    exit 1
  }
  $env:GOOGLE_APPLICATION_CREDENTIALS = (Resolve-Path $ServiceAccountPath).Path
  Write-Output "Using service account: $env:GOOGLE_APPLICATION_CREDENTIALS"
} else {
  Write-Output "No service account path provided. You can set environment variable GOOGLE_APPLICATION_CREDENTIALS manually before running seeds."
}

Write-Output "Installing root dependencies (if package.json exists)..."
if (Test-Path .\package.json) { npm install } else { Write-Output "No root package.json found." }

if (Test-Path .\web\package.json) {
  Write-Output "Installing frontend dependencies in ./web..."
  Push-Location .\web
  npm install
  Pop-Location
} else {
  Write-Output "No ./web/package.json found; skipping frontend install."
}

Write-Output "Running seed:all script..."
npm run seed:all

Write-Output "Done. To start the frontend (if present):"
Write-Output "  cd web"
Write-Output "  npm run start"
