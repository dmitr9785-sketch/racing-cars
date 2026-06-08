$src = "D:\racing cars"
$out = Join-Path $src "build"
$zip = Join-Path $src "highway-rush.zip"

if (Test-Path $out) { Remove-Item -LiteralPath $out -Recurse -Force }
if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }

New-Item -ItemType Directory -Path $out -Force | Out-Null

Copy-Item (Join-Path $src "index.html") $out
Copy-Item (Join-Path $src "styles.css") $out
Copy-Item (Join-Path $src "game.js") $out

Copy-Item -Recurse -Force (Join-Path $src "assets") "$out\assets"

Compress-Archive -Path (Join-Path $out "*") -DestinationPath $zip -Force

Remove-Item -LiteralPath $out -Recurse -Force

Write-Host "Архив создан: $zip"
