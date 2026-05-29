$ErrorActionPreference = "Stop"
$base = "http://localhost:3010"

Write-Host "=== KPIs ==="
try {
  $kpis = Invoke-RestMethod "$base/api/glpi/tickets?view=kpis" -TimeoutSec 60
  $kpis | ConvertTo-Json -Depth 4
} catch {
  Write-Host "ERRO: $_"
}

Write-Host ""
Write-Host "=== Recent (primeiro item) ==="
try {
  $recent = Invoke-RestMethod "$base/api/glpi/tickets?view=recent" -TimeoutSec 60
  if ($recent.Count -gt 0) {
    $recent[0] | ConvertTo-Json -Depth 4
  }
} catch {
  Write-Host "ERRO: $_"
}

Write-Host ""
Write-Host "=== /tv/overview HTTP ==="
try {
  $r = Invoke-WebRequest "$base/tv/overview" -TimeoutSec 30
  Write-Host "Status: $($r.StatusCode)"
} catch {
  Write-Host "ERRO: $_"
}
