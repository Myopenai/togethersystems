#!/usr/bin/env pwsh
param(
  [int]$Port = 8080
)

Write-Host "[build] Node 20 required"; node -v
Write-Host "[serve] Starting dev server at http://127.0.0.1:$Port"
$env:PORT = $Port
node tools/serve.js

