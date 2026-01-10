#!/bin/bash

# Quick Deployment Script for Hugging Face Spaces
# This script helps prepare your backend for deployment

echo "🚀 TaskFlow Backend - Hugging Face Deployment Preparation"
echo "=========================================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

echo "✅ Found backend directory"
echo ""

# Check required files
echo "📋 Checking required files..."
files=("Dockerfile" "requirements.txt" "alembic.ini" "src/main.py")
missing_files=()

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo ""
    echo "❌ Missing required files. Please ensure all files are present."
    exit 1
fi

echo ""
echo "🔐 Generating secrets..."

# Generate BETTER_AUTH_SECRET
SECRET=$(openssl rand -hex 32)
echo ""
echo "Your BETTER_AUTH_SECRET (save this!):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create deployment notes
cat > DEPLOYMENT_NOTES.txt << EOF
TaskFlow Backend - Deployment Information
Generated: $(date)

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

EOF

echo "📝 Deployment notes saved to: DEPLOYMENT_NOTES.txt"
echo ""

# Test if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker is installed"
    echo ""
    echo "Would you like to test the Docker build locally? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Building Docker image..."
        docker build -t taskflow-backend-test .
        if [ $? -eq 0 ]; then
            echo "✅ Docker build successful!"
        else
            echo "❌ Docker build failed. Please check the errors above."
        fi
    fi
else
    echo "ℹ️  Docker not found. Skipping local build test."
fi

echo ""
echo "✅ Preparation complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Review DEPLOYMENT_NOTES.txt"
echo "  2. Follow the deployment guide in ../DEPLOYMENT_GUIDE.md"
echo "  3. Create your Hugging Face Space"
echo "  4. Push your code"
echo ""
