# Quick Deployment Script for Hugging Face Spaces (PowerShell)
# This script helps prepare your backend for deployment

Write-Host "🚀 TaskFlow Backend - Hugging Face Deployment Preparation" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "requirements.txt")) {
    Write-Host "❌ Error: Please run this script from the backend directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found backend directory" -ForegroundColor Green
Write-Host ""

# Check required files
Write-Host "📋 Checking required files..." -ForegroundColor Yellow
$files = @("Dockerfile", "requirements.txt", "alembic.ini", "src/main.py")
$missing_files = @()

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $missing_files += $file
    }
}

if ($missing_files.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Missing required files. Please ensure all files are present." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔐 Generating secrets..." -ForegroundColor Yellow

# Generate BETTER_AUTH_SECRET (using .NET crypto)
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$SECRET = [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()

Write-Host ""
Write-Host "Your BETTER_AUTH_SECRET (save this!):" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host $SECRET -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Create deployment notes
$deploymentNotes = @"
TaskFlow Backend - Deployment Information
Generated: $(Get-Date)

BETTER_AUTH_SECRET: $SECRET

Required Environment Variables for Hugging Face:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DATABASE_URL
   Get from: Neon PostgreSQL Dashboard
   Format: postgresql://user:password@host/database

2. BETTER_AUTH_SECRET
   Value: $SECRET

3. CORS_ORIGINS
   Initial: http://localhost:3000
   After frontend deploy: https://your-app.vercel.app,https://your-app-*.vercel.app

4. DEBUG
   Value: False

5. JWT_ALGORITHM (optional)
   Value: HS256

6. JWT_EXPIRATION_DAYS (optional)
   Value: 7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
1. Create Hugging Face Space at https://huggingface.co/new-space
2. Choose Docker SDK
3. Clone the Space repository
4. Copy all backend files to the Space directory
5. Rename README_HF.md to README.md
6. Commit and push
7. Add environment variables in Space Settings
8. Wait for build to complete

"@

$deploymentNotes | Out-File -FilePath "DEPLOYMENT_NOTES.txt" -Encoding UTF8

Write-Host "📝 Deployment notes saved to: DEPLOYMENT_NOTES.txt" -ForegroundColor Green
Write-Host ""

# Check if Docker is available
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "🐳 Docker is installed" -ForegroundColor Green
    Write-Host ""
    $response = Read-Host "Would you like to test the Docker build locally? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Building Docker image..." -ForegroundColor Yellow
        docker build -t taskflow-backend-test .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker build successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Docker build failed. Please check the errors above." -ForegroundColor Red
        }
    }
} else {
    Write-Host "ℹ️  Docker not found. Skipping local build test." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review DEPLOYMENT_NOTES.txt"
Write-Host "  2. Follow the deployment guide in ../DEPLOYMENT_GUIDE.md"
Write-Host "  3. Create your Hugging Face Space"
Write-Host "  4. Push your code"
Write-Host ""
