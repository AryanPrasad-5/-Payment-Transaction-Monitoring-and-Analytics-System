$merchants = @("merch_001", "merch_002", "merch_003", "merch_004", "merch_005", "merch_006", "merch_007", "merch_008", "merch_009", "merch_010")
$statuses = @("SUCCESS", "FAILED")
$methods = @("UPI", "CARD", "WALLET")

$total = 270
$successCount = 0
$failCount = 0

for ($i = 0; $i -lt $total; $i++) {
    $m = $merchants[(Get-Random -Maximum $merchants.Count)]
    $s = $statuses[(Get-Random -Maximum $statuses.Count)]
    $pm = $methods[(Get-Random -Maximum $methods.Count)]
    $amt = [math]::Round((Get-Random -Minimum 1000 -Maximum 5000000) / 100, 2)

    $body = @{
        merchant_id    = $m
        amount         = $amt
        status         = $s
        payment_method = $pm
    } | ConvertTo-Json

    try {
        $null = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/transactions/" -Method POST -Body $body -ContentType "application/json"
        if ($s -eq "SUCCESS") { $successCount++ } else { $failCount++ }
        Write-Host "[$($i+1)/$total] $s - $m - $pm - `$$amt"
    } catch {
        Write-Host "[$($i+1)/$total] FAILED to post: $_" -ForegroundColor Red
    }
}

Write-Host "`nDone! $successCount SUCCESS, $failCount FAILED out of $total total." -ForegroundColor Green
