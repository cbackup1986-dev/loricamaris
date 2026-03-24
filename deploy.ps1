# LoricaMaris Automated Deployment Script
# Usage: ./deploy.ps1 [-ServerIP "0.0.0.0"] [-User "root"]

param (
    [string]$ServerIP = "0.0.0.0",
    [string]$User = "root",
    [string]$RemotePath = "/app/loricamaris"
)

$ErrorActionPreference = "Stop"
$ImageName = "mindpeak-app:latest"
$TarFile = "nextjs-game.tar"

Write-Host "🚀 Starting Automated Deployment to $ServerIP..." -ForegroundColor Cyan

# 1. Build Docker Image
Write-Host "📦 Step 1: Building production Docker image..." -ForegroundColor Yellow
docker build -t $ImageName .

# 2. Export Image to Tarball
Write-Host "💾 Step 2: Exporting image to $TarFile..." -ForegroundColor Yellow
if (Test-Path $TarFile) { Remove-Item $TarFile }
docker save $ImageName -o $TarFile

# 3. Create Remote Directory & Transfer Files
Write-Host "🚚 Step 3: Transferring files to $ServerIP..." -ForegroundColor Yellow
ssh "$User@$ServerIP" "mkdir -p $RemotePath"
scp $TarFile docker-compose.yml "$User@${ServerIP}:$RemotePath/"

# 4. Load Image and Restart Services on Server
Write-Host "🔄 Step 4: Loading image and restarting services on server..." -ForegroundColor Yellow
$RemoteCmd = @"
cd $RemotePath
docker load -i $TarFile
docker compose up -d
rm $TarFile
"@
ssh "$User@$ServerIP" $RemoteCmd

Write-Host "✅ Deployment Complete! App should be live at http://${ServerIP}:3000" -ForegroundColor Green
