<#
.SYNOPSIS
    Adds one managed restaurant business to Supabase.

.DESCRIPTION
    Inserts a row into the "businesses" table via Supabase's PostgREST
    API, using the service role key from .env.local. This is the intake
    path for the business details (website, menu, GBP, reviews, address)
    you provide in chat — later this becomes a proper form in the
    dashboard, but this script lets us store real data immediately.

.EXAMPLE
    .\scripts\add-business.ps1 `
        -Name "Spice Villa" `
        -CuisineType "Indian" `
        -WebsiteUrl "https://spicevilla.co.uk" `
        -MenuUrl "https://spicevilla.co.uk/menu" `
        -GbpUrl "https://maps.app.goo.gl/xxxx" `
        -GoogleReviewUrl "https://g.page/r/xxxx/review" `
        -AddressLine "12 High Street" `
        -Postcode "SW1A 1AA"
#>

param(
    [Parameter(Mandatory=$true)][string]$Name,
    [string]$CuisineType,
    [string]$WebsiteUrl,
    [string]$MenuUrl,
    [string]$GbpUrl,
    [string]$GbpPlaceId,
    [string]$GoogleReviewUrl,
    [string]$AddressLine,
    [string]$Postcode,
    [string]$Phone,
    [string]$FacebookUrl,
    [string]$InstagramUrl,
    [string]$OrderingProvider,
    [string]$OrderingUrl,
    [switch]$IsManaged = $true
)

# Load .env.local
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Error ".env.local not found. Run .\scripts\setup.ps1 first."
    exit 1
}

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#=]+)=(.*)$") {
        $envVars[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$supabaseUrl = $envVars["SUPABASE_URL"]
$serviceKey  = $envVars["SUPABASE_SERVICE_ROLE_KEY"]

if (-not $supabaseUrl -or -not $serviceKey) {
    Write-Error "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing from .env.local"
    exit 1
}

$body = @{
    is_managed          = [bool]$IsManaged
    name                = $Name
    cuisine_type        = $CuisineType
    website_url         = $WebsiteUrl
    menu_url            = $MenuUrl
    gbp_url             = $GbpUrl
    gbp_place_id        = $GbpPlaceId
    google_review_url   = $GoogleReviewUrl
    address_line        = $AddressLine
    postcode            = $Postcode
    phone               = $Phone
    facebook_url        = $FacebookUrl
    instagram_url       = $InstagramUrl
    ordering_provider   = $OrderingProvider
    ordering_url        = $OrderingUrl
} | ConvertTo-Json

$headers = @{
    "apikey"        = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

try {
    $response = Invoke-RestMethod -Method Post `
        -Uri "$supabaseUrl/rest/v1/businesses" `
        -Headers $headers `
        -Body $body

    Write-Host "Business added:" -ForegroundColor Green
    $response | Format-List
} catch {
    Write-Error "Failed to add business: $_"
    exit 1
}
