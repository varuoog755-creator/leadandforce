#!/bin/bash

# LeadEnforce VPS Deployment Script
# Auto-deploy from GitHub to VPS

echo "🚀 LeadEnforce - VPS Deployment Starting..."
echo "================================================"

# Update system
echo ""
echo "📦 Step 1/8: Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

# Install Git
echo ""
echo "📥 Step 2/8: Installing Git..."
sudo apt install -y git

# Install Docker
echo ""
echo "🐳 Step 3/8: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo ""
echo "🐳 Step 4/8: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Clone repository
echo ""
echo "📥 Step 5/8: Cloning repository from GitHub..."
cd /root
if [ -d "leadandforce" ]; then
    echo "⚠️  Directory exists. Removing old version..."
    rm -rf leadandforce
fi
git clone https://github.com/varuoog755-creator/leadandforce.git
cd leadandforce

# Create .env file
echo ""
echo "⚙️  Step 6/8: Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env file with your credentials!"
else
    echo "✅ .env file already exists"
fi

# Build Docker containers
echo ""
echo "🏗️  Step 7/8: Building Docker containers..."
docker-compose build

# Start services
echo ""
echo "🚀 Step 8/8: Starting services..."
docker-compose up -d

# Wait for services to start
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

# Show status
echo ""
echo "================================================"
echo "📊 Service Status:"
echo "================================================"
docker-compose ps

echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "📍 Access your application:"
echo "   🌐 Frontend:    http://$(curl -s ifconfig.me):3000"
echo "   🔧 Backend API: http://$(curl -s ifconfig.me):3001"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "   1. Edit .env file: nano .env"
echo "   2. Update database passwords"
echo "   3. Configure proxy settings (REQUIRED for production)"
echo "   4. Restart services: docker-compose restart"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update code:      git pull && docker-compose restart"
echo ""
echo "================================================"
