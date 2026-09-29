$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$localRoot = Join-Path $projectRoot '.local'
foreach ($name in @('frontend','backend')) {
    $pidFile = Join-Path $localRoot "$name.pid"
    if (Test-Path $pidFile) {
        $processId = [int](Get-Content $pidFile)
        $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$processId"
        # Do not stop an unrelated process if Windows has reused the PID.
        if ($processInfo -and $processInfo.CommandLine -and $processInfo.CommandLine.Contains($projectRoot)) {
            Stop-Process -Id $processId
        }
    }
}
$maria = Get-ChildItem -LiteralPath $localRoot -Directory -Filter 'mariadb-*' | Select-Object -First 1
if ($maria -and (Test-Path "$localRoot/root.cnf")) {
    & (Join-Path $maria.FullName 'bin/mariadb-admin.exe') "--defaults-extra-file=$localRoot/root.cnf" shutdown
}
Write-Host 'DevLog stopped. Database files are preserved.'
