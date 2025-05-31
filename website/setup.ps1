#!/usr/bin/env pwsh

# This script sets up and starts the Minecraft Modpack Installer Generator

Write-Host "Setting up Minecraft Modpack Installer Generator..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm -v
    Write-Host "pnpm $pnpmVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "pnpm is not installed. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pnpm install

# Check if .dev.vars file exists
if (-Not (Test-Path -Path ".dev.vars")) {
    Write-Host "Creating .dev.vars file template..." -ForegroundColor Yellow
    Set-Content -Path ".dev.vars" -Value "GITHUB_TOKEN=your_github_personal_access_token`n# Replace with your actual GitHub token"
    Write-Host "Please edit .dev.vars file and add your GitHub token" -ForegroundColor Red
    Write-Host "Note: Most GitHub API calls are made directly from the client. The token is only needed for:" -ForegroundColor Cyan
    Write-Host "  - Triggering GitHub Actions workflows" -ForegroundColor Cyan
    Write-Host "  - Downloading artifacts that require authentication" -ForegroundColor Cyan
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "In a separate terminal, run 'pnpm dev:worker' to start the Cloudflare worker" -ForegroundColor Yellow
pnpm dev
