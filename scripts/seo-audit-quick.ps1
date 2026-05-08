$ErrorActionPreference = 'Continue'
$samples = @(
  'https://pzm.ae/',
  'https://pzm.ae/services/buy-iphone/',
  'https://pzm.ae/services/brand-new/',
  'https://pzm.ae/services/secondhand/',
  'https://pzm.ae/services/repair/',
  'https://pzm.ae/services/sell-gadgets/',
  'https://pzm.ae/services/gaming-pc/',
  'https://pzm.ae/services/accessories/',
  'https://pzm.ae/areas/al-barsha/',
  'https://pzm.ae/areas/business-bay/',
  'https://pzm.ae/blog/',
  'https://pzm.ae/product/prod-mo4quvwx-668ugf/',
  'https://pzm.ae/product/prod-mo4qviia-t4t7si/',
  'https://pzm.ae/product/prod-mnnz7dy1-88bplj/',
  'https://pzm.ae/product/prod-mnnz7hfp-d4coml/'
)
foreach ($u in $samples) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing
    $html = $r.Content
    $canonical = if ($html -match '<link[^>]+rel="canonical"[^>]+href="([^"]+)"') { $Matches[1] } else { '<none>' }
    $robots    = if ($html -match '<meta[^>]+name="robots"[^>]+content="([^"]+)"') { $Matches[1] } else { '<none>' }
    $title     = if ($html -match '<title>([^<]+)</title>') { $Matches[1] } else { '<none>' }
    $ogUrl     = if ($html -match '<meta[^>]+property="og:url"[^>]+content="([^"]+)"') { $Matches[1] } else { '<none>' }
    $jsonLd    = ([regex]::Matches($html, '<script[^>]+type="application/ld\+json"[^>]*>')).Count
    $hasProd   = $html -match '"@type":\s*"Product"'
    $hasBC     = $html -match '"@type":\s*"BreadcrumbList"'
    $hasOrg    = $html -match '"@type":\s*"Organization"'
    $hasItem   = $html -match '"@type":\s*"ItemList"'
    $words     = ([regex]::Replace($html, '<[^>]+>', ' ') -split '\s+' | Where-Object { $_ }).Count
    "URL: $u"
    "  Status: $($r.StatusCode)  Words: $words  JsonLd: $jsonLd  Product: $hasProd  Breadcrumb: $hasBC  Org: $hasOrg  ItemList: $hasItem"
    "  Title: $title"
    "  Canonical: $canonical"
    "  OgUrl:     $ogUrl"
    "  Robots:    $robots"
  } catch {
    "FAIL $u :: $($_.Exception.Message)"
  }
}
