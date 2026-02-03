# Test du rate limiting
$loginBody = '{"email":"test.export@example.com","password":"Test123!@#"}'
$login = Invoke-WebRequest -Uri 'http://localhost:3001/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing
$token = ($login.Content | ConvertFrom-Json).accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Host "Appel 1..."
try {
    $r1 = Invoke-WebRequest -Uri 'http://localhost:3001/users/me/export' -Headers $headers -UseBasicParsing
    Write-Host "  Status: $($r1.StatusCode)"
} catch {
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "Appel 2 (immediat)..."
try {
    $r2 = Invoke-WebRequest -Uri 'http://localhost:3001/users/me/export' -Headers $headers -UseBasicParsing
    Write-Host "  Status: $($r2.StatusCode) - RATE LIMITING NON ACTIF"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 429) {
        Write-Host "  Status: 429 - RATE LIMITING ACTIF (OK)"
    } else {
        Write-Host "  Status: $status"
    }
}
