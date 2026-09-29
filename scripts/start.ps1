$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$localRoot = Join-Path $projectRoot '.local'
$jdk = Get-ChildItem -LiteralPath $localRoot -Directory -Filter 'jdk-17*' | Select-Object -First 1
$maria = Get-ChildItem -LiteralPath $localRoot -Directory -Filter 'mariadb-*' | Select-Object -First 1
if (-not $jdk -or -not $maria) { throw 'Java 17 / MariaDB missing. See README.md.' }
$env:JAVA_HOME = $jdk.FullName
$env:DB_URL = 'jdbc:mariadb://127.0.0.1:3307/devlog'
$env:DB_USERNAME = 'devlog'
$env:DB_PASSWORD = 'devlog_local'
$env:SERVER_PORT = '8080'
$logRoot = Join-Path $localRoot 'logs'
New-Item -ItemType Directory -Force $logRoot | Out-Null
function Listening($port) { return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) }
if (-not (Listening 3307)) {
    Start-Process -FilePath (Join-Path $maria.FullName 'bin/mariadbd.exe') -ArgumentList ('--defaults-file="' + $localRoot + '\data\my.ini"') -WindowStyle Hidden | Out-Null
}
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    & (Join-Path $maria.FullName 'bin/mariadb-admin.exe') "--defaults-extra-file=$localRoot/root.cnf" ping --silent 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'MariaDB did not start. Check .local/data/*.err.' }
$jar = Join-Path $projectRoot 'backend/build/libs/devlog-0.0.1-SNAPSHOT.jar'
if (-not (Test-Path $jar)) {
    Push-Location (Join-Path $projectRoot 'backend')
    try { & .\gradlew.bat bootJar; if ($LASTEXITCODE -ne 0) { throw 'Backend build failed' } } finally { Pop-Location }
}
if (-not (Listening 8080)) {
    $backend = Start-Process -FilePath (Join-Path $jdk.FullName 'bin/java.exe') -ArgumentList @('-jar', ('"' + $jar + '"')) -WindowStyle Hidden -RedirectStandardOutput "$logRoot/backend.log" -RedirectStandardError "$logRoot/backend-error.log" -PassThru
    Set-Content "$localRoot/backend.pid" $backend.Id
}
$ready = $false
for ($i = 0; $i -lt 45; $i++) {
    try { $null = Invoke-RestMethod 'http://127.0.0.1:8080/api/tags'; $ready = $true; break } catch { Start-Sleep -Seconds 1 }
}
if (-not $ready) { throw 'Backend did not start. Check .local/logs/backend.log.' }
$frontend = Join-Path $projectRoot 'frontend'
if (-not (Test-Path "$frontend/node_modules")) {
    & npm.cmd install --prefix $frontend
    if ($LASTEXITCODE -ne 0) { throw 'Frontend installation failed' }
}
if (-not (Listening 5173)) {
    $vite = Join-Path $frontend 'node_modules/vite/bin/vite.js'
    $front = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(('"' + $vite + '"'), '--host', '127.0.0.1') -WorkingDirectory $frontend -WindowStyle Hidden -RedirectStandardOutput "$logRoot/frontend.log" -RedirectStandardError "$logRoot/frontend-error.log" -PassThru
    Set-Content "$localRoot/frontend.pid" $front.Id
}
$ready = $false
for ($i = 0; $i -lt 20; $i++) {
    try { $null = Invoke-WebRequest 'http://127.0.0.1:5173' -UseBasicParsing; $ready = $true; break } catch { Start-Sleep -Seconds 1 }
}
if (-not $ready) { throw 'Frontend did not start. Check .local/logs/frontend-error.log.' }
Write-Host 'DevLog: http://127.0.0.1:5173'
Write-Host 'Swagger: http://127.0.0.1:8080/swagger-ui/index.html'
Write-Host 'Use stop.cmd to stop the local servers.'
