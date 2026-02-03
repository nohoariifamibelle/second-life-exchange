# Test du rate limiting sur auth/login
Write-Host "Test rate limiting sur /auth/login (5 req / 15 min)"

$loginBody = '{"email":"test.export@example.com","password":"Test123!@#"}'

for ($i = 1; $i -le 7; $i++) {
    Write-Host "Appel $i..."
    try {
        $r = Invoke-WebRequest -Uri 'http://localhost:3001/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing
        Write-Host "  Status: $($r.StatusCode)"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status: $status"
        if ($status -eq 429) {
            Write-Host "  RATE LIMITING ACTIF!"
            break
        }
    }
}
