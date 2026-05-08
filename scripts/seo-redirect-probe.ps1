$ErrorActionPreference = 'Continue'

# Variants that often appear in GSC reports for SPA-on-CF sites
$urls = @(
  # Trailing-slash variants — should normalize one way
  'https://pzm.ae/services/buy-iphone',
  'https://pzm.ae/services/brand-new',
  'https://pzm.ae/areas/al-barsha',
  # Apex vs www
  'https://www.pzm.ae/',
  # http → https
  'http://pzm.ae/',
  # Legacy / retired routes mentioned in repo memory
  'https://pzm.ae/buy-iphone.html',
  'https://pzm.ae/products.html',
  'https://pzm.ae/products/',
  'https://pzm.ae/admin',
  'https://pzm.ae/admin/',
  'https://pzm.ae/api/',
  # Locale / index / hash artifacts sometimes flagged
  'https://pzm.ae/index.html',
  'https://pzm.ae/home',
  # 404 we already saw, just to confirm consistency
  'https://pzm.ae/services/laptop-shop/',
  'https://pzm.ae/services/computer-shop/'
)

foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
    $loc = $r.Headers['Location']
    if ($loc) {
      "[{0}] {1} -> {2}" -f $r.StatusCode, $u, $loc
    } else {
      "[{0}] {1}" -f $r.StatusCode, $u
    }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $code = [int]$resp.StatusCode
      try { $loc = $resp.Headers['Location'] } catch { $loc = $null }
      if ($loc) {
        "[{0}] {1} -> {2}" -f $code, $u, $loc
      } else {
        "[{0}] {1}" -f $code, $u
      }
    } else {
      "[ERR] {0} :: {1}" -f $u, $_.Exception.Message
    }
  }
}
