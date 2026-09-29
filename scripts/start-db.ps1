$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$localRoot = Join-Path $projectRoot '.local'

$maria = Get-ChildItem -LiteralPath $localRoot -Directory -Filter 'mariadb-*' |
    Select-Object -First 1

if (-not $maria) {
    throw 'MariaDB missing. See README.md.'
}

function Listening($port) {
    return [bool](Get-NetTCPConnection `
        -LocalPort $port `
        -State Listen `
        -ErrorAction SilentlyContinue)
}

if (Listening 3307) {
    Write-Host 'MariaDB is already running on port 3307.'
    exit 0
}

Write-Host 'Starting MariaDB...'

Start-Process `
    -FilePath (Join-Path $maria.FullName 'bin/mariadbd.exe') `
    -ArgumentList ('--defaults-file="' + $localRoot + '\data\my.ini"') `
    -WindowStyle Hidden | Out-Null

$ready = $false

for ($i = 0; $i -lt 30; $i++) {
    & (Join-Path $maria.FullName 'bin/mariadb-admin.exe') `
        "--defaults-extra-file=$localRoot/root.cnf" `
        ping --silent 2>$null | Out-Null

    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        break
    }

    Start-Sleep -Seconds 1
}

if (-not $ready) {
    throw 'MariaDB did not start. Check .local/data/*.err.'
}

Write-Host 'MariaDB started successfully.'
Write-Host 'Host: 127.0.0.1'
Write-Host 'Port: 3307'
Write-Host 'DB: devlog'