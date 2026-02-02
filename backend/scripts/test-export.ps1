# Script de test pour l'endpoint d'export RGPD
# Usage: powershell -ExecutionPolicy Bypass -File scripts/test-export.ps1

$baseUrl = "http://localhost:3001"
$testEmail = "test.export@example.com"
$testPassword = "Test123!@#"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTS EXPORT RGPD - Article 20" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Login
Write-Host "[TEST 1] Login pour obtenir un token..." -ForegroundColor Yellow
try {
    $loginBody = @{ email = $testEmail; password = $testPassword } | ConvertTo-Json
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.accessToken
    Write-Host "  [OK] Login reussi - Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "  [ECHEC] Login echoue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Export RGPD avec token valide
Write-Host "`n[TEST 2] Export RGPD avec token valide..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $exportResponse = Invoke-WebRequest -Uri "$baseUrl/users/me/export" -Method GET -Headers $headers -UseBasicParsing
    $exportData = $exportResponse.Content | ConvertFrom-Json
    Write-Host "  [OK] Export reussi - Status: $($exportResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  Date export: $($exportData.exportedAt)" -ForegroundColor Gray
    Write-Host "  Article RGPD: $($exportData.gdprArticle)" -ForegroundColor Gray
} catch {
    Write-Host "  [ECHEC] Export echoue: $($_.Exception.Message)" -ForegroundColor Red
    $exportResponse = $null
}

# Test 3: Verifier absence du password
Write-Host "`n[TEST 3] Verification absence du password..." -ForegroundColor Yellow
if ($exportData -and $exportData.user) {
    $userJson = $exportData.user | ConvertTo-Json
    if ($userJson -match "password") {
        Write-Host "  [ECHEC] Le password est present dans l'export!" -ForegroundColor Red
    } else {
        Write-Host "  [OK] Password absent de l'export" -ForegroundColor Green
    }
    Write-Host "  Email: $($exportData.user.email)" -ForegroundColor Gray
    Write-Host "  Nom: $($exportData.user.firstName) $($exportData.user.lastName)" -ForegroundColor Gray
} else {
    Write-Host "  [SKIP] Pas de donnees d'export" -ForegroundColor Yellow
}

# Test 4: Verifier le header Content-Disposition
Write-Host "`n[TEST 4] Verification header Content-Disposition..." -ForegroundColor Yellow
if ($exportResponse) {
    $contentDisposition = $exportResponse.Headers["Content-Disposition"]
    if ($contentDisposition -match "attachment") {
        Write-Host "  [OK] Header Content-Disposition present: $contentDisposition" -ForegroundColor Green
    } else {
        Write-Host "  [ECHEC] Header Content-Disposition absent ou incorrect" -ForegroundColor Red
        Write-Host "  Valeur: $contentDisposition" -ForegroundColor Gray
    }
} else {
    Write-Host "  [SKIP] Pas de reponse d'export" -ForegroundColor Yellow
}

# Test 5: Rate limiting (2eme appel)
Write-Host "`n[TEST 5] Test rate limiting (2eme appel)..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $exportResponse2 = Invoke-WebRequest -Uri "$baseUrl/users/me/export" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "  [ECHEC] Le rate limiting n'a pas bloque la requete! Status: $($exportResponse2.StatusCode)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 429) {
        Write-Host "  [OK] Rate limiting fonctionne - Status: 429 Too Many Requests" -ForegroundColor Green
    } else {
        Write-Host "  [ECHEC] Erreur inattendue: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Export sans authentification
Write-Host "`n[TEST 6] Test sans authentification..." -ForegroundColor Yellow
try {
    $exportResponseNoAuth = Invoke-WebRequest -Uri "$baseUrl/users/me/export" -Method GET -UseBasicParsing
    Write-Host "  [ECHEC] L'endpoint accepte les requetes sans auth! Status: $($exportResponseNoAuth.StatusCode)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  [OK] Authentification requise - Status: 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "  [ECHEC] Erreur inattendue: $statusCode" -ForegroundColor Red
    }
}

# Statistiques finales
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STATISTIQUES DE L'EXPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if ($exportData) {
    Write-Host "  Items: $($exportData.items.Count)" -ForegroundColor White
    Write-Host "  Exchanges: $($exportData.exchanges.Count)" -ForegroundColor White
    Write-Host "  Reviews donnees: $($exportData.reviews.given.Count)" -ForegroundColor White
    Write-Host "  Reviews recues: $($exportData.reviews.received.Count)" -ForegroundColor White
}

# Sauvegarder le resultat
if ($exportData) {
    $exportData | ConvertTo-Json -Depth 10 | Out-File -FilePath "export-rgpd-test.json" -Encoding UTF8
    Write-Host "`n  Fichier sauvegarde: export-rgpd-test.json" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTS TERMINES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
