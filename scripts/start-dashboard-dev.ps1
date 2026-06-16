param(
    [string]$BindAddress = "127.0.0.1",
    [int]$Port = 3002
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$dashboardPath = Join-Path $projectRoot "dashboard-ui"

if (-not (Test-Path $dashboardPath)) {
    throw "dashboard-ui directory was not found at $dashboardPath"
}

Push-Location $dashboardPath
try {
    if (-not (Test-Path "node_modules")) {
        npm install
    }

    npm run dev:local -- --host $BindAddress --port $Port
}
finally {
    Pop-Location
}
