param([Switch]$Clean)

$src = "D:\racing cars"
$out = Join-Path $src "highway-rush.zip"
$buildDir = Join-Path $env:TEMP "highway-rush-build"

# Clean
if (Test-Path $out) { Remove-Item -LiteralPath $out -Force }
if (Test-Path $buildDir) { Remove-Item -LiteralPath $buildDir -Recurse -Force }

# Prepare build directory
$null = New-Item -ItemType Directory -Path $buildDir -Force
Copy-Item (Join-Path $src "index.html"), (Join-Path $src "styles.css"), (Join-Path $src "game.js") $buildDir
Copy-Item -Recurse (Join-Path $src "assets") (Join-Path $buildDir "assets")

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipStream = [System.IO.File]::Open($out, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $buildDir -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $relative = $_.FullName.Substring($buildDir.Length + 1) -replace '\\', '/'
    $entry = $zip.CreateEntry($relative, [System.IO.Compression.CompressionLevel]::Optimal)
    $writer = New-Object System.IO.BinaryWriter $entry.Open()
    $writer.Write([System.IO.File]::ReadAllBytes($_.FullName))
    $writer.Dispose()
}

$zip.Dispose()
$zipStream.Dispose()
Remove-Item -LiteralPath $buildDir -Recurse -Force
Write-Host "Архив создан: $out"
