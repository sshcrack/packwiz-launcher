param(
    [Parameter(Mandatory=$false)]
    [string]$BinaryPath = ".\target\release\modpack-installer.exe"
)

# Define the ModpackConfig as JSON
$modpackConfig = @{
    title = "Minecolonies"
    description = "A modpack focused on building and managing colonies with the Minecolonies mod. Includes various quality of life mods and performance improvements."
    logo_url = "https://discord.do/wp-content/uploads/2023/08/MineColonies.jpg"
    packwiz_url = "http://localhost:3000"
    theme = "dark"
    background = "deepslate"
}

# Convert the ModpackConfig to a JSON string
$jsonString = ConvertTo-Json -InputObject $modpackConfig -Compress

# Convert the JSON string to bytes
$jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonString)
$jsonLength = $jsonBytes.Length

Write-Host "JSON payload: $jsonString"
Write-Host "JSON size: $jsonLength bytes"

# Convert the JSON length to a u64 little-endian byte array (8 bytes)
$lengthBytes = [BitConverter]::GetBytes([UInt64]$jsonLength)

# Check that we're on a little-endian system, otherwise reverse the bytes
if (![BitConverter]::IsLittleEndian) {
    [Array]::Reverse($lengthBytes)
}

# Open the binary file in append mode
try {
    $binary = [System.IO.File]::Open($BinaryPath, [System.IO.FileMode]::Append)
    
    # Append the JSON bytes
    $binary.Write($jsonBytes, 0, $jsonBytes.Length)
    
    # Append the JSON length as u64 (8 bytes)
    $binary.Write($lengthBytes, 0, 8)
    
    Write-Host "Successfully appended metadata to $BinaryPath"
}
catch {
    Write-Error "Failed to append metadata: $_"
}
finally {
    if ($binary) {
        $binary.Close()
    }
}

# Verify the file was modified correctly
try {
    $fileInfo = Get-Item $BinaryPath
    Write-Host "Final file size: $($fileInfo.Length) bytes"
} catch {
    Write-Error "Could not verify file: $_"
}