$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

$log = Join-Path $root "ROSTER-FOLDERIZER-LOG.txt"

"==================================================" | Set-Content -LiteralPath $log
"HTR ROSTER PHOTOS FOLDERIZER v1.2" | Add-Content -LiteralPath $log
"ROOT=$root" | Add-Content -LiteralPath $log
"==================================================" | Add-Content -LiteralPath $log
"" | Add-Content -LiteralPath $log

Write-Host "=================================================="
Write-Host "HTR ROSTER PHOTOS FOLDERIZER v1.2"
Write-Host "=================================================="
Write-Host "Folder:"
Write-Host $root
Write-Host ""
Write-Host "Moving PNG files into artist folders..."
Write-Host ""

$suffixes = @(
  "roster-photo",
  "hero-photo",
  "discography-bg",
  "video-bg",
  "photo-1",
  "photo-2",
  "photo-3"
)

$moved = 0
$skipped = 0

$files = Get-ChildItem -LiteralPath $root -File -Filter "*.png"

foreach ($file in $files) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $artist = $null

    foreach ($suffix in $suffixes) {
        $tail = "-" + $suffix
        if ($base.EndsWith($tail, [System.StringComparison]::OrdinalIgnoreCase)) {
            $artist = $base.Substring(0, $base.Length - $tail.Length)
            break
        }
    }

    if ([string]::IsNullOrWhiteSpace($artist)) {
        $line = "SKIP no match: $($file.Name)"
        Write-Host $line
        $line | Add-Content -LiteralPath $log
        $skipped++
        continue
    }

    $destDir = Join-Path $root $artist
    if (!(Test-Path -LiteralPath $destDir)) {
        New-Item -ItemType Directory -Path $destDir | Out-Null
    }

    $dest = Join-Path $destDir $file.Name

    if (Test-Path -LiteralPath $dest) {
        $line = "SKIP exists: $($file.Name) -> $artist\"
        Write-Host $line
        $line | Add-Content -LiteralPath $log
        $skipped++
        continue
    }

    Move-Item -LiteralPath $file.FullName -Destination $dest

    $line = "MOVED: $($file.Name) -> $artist\"
    Write-Host $line
    $line | Add-Content -LiteralPath $log
    $moved++
}

Write-Host ""
Write-Host "=================================================="
Write-Host "Done."
Write-Host "Moved: $moved"
Write-Host "Skipped: $skipped"
Write-Host "Log: $log"
Write-Host "=================================================="

"" | Add-Content -LiteralPath $log
"Done." | Add-Content -LiteralPath $log
"Moved: $moved" | Add-Content -LiteralPath $log
"Skipped: $skipped" | Add-Content -LiteralPath $log
