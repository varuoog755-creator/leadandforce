#!/bin/bash

# ============================================
# LeadEnforce - Complete VPS Deployment
# Run this script on your VPS
# ============================================

set -e

echo "🚀 LeadEnforce - VPS Deployment"
echo "================================"
echo ""

# Update system
echo "[1/12] Updating system..."
apt update -y && apt upgrade -y

# Install basic tools
echo "[2/12] Installing tools..."
apt install -y git curl wget unzip nano htop

# Install Docker
echo "[3/12] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
echo "[4/12] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js
echo "[5/12] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Python
echo "[6/12] Installing Python..."
apt install -y python3 python3-pip

# Clone repository
echo "[7/12] Cloning from GitHub..."
cd /root
if [ -d "leadandforce" ]; then
    rm -rf leadandforce
fi
git clone https://github.com/varuoog755-creator/leadandforce.git
cd leadandforce

# Create .env
echo "[8/12] Creating environment file..."
cat > .env << 'EOF'
DATABASE_URL=postgresql://leadenforce_user:SecurePass123!@postgres:5432/leadenforce
MONGODB_URL=mongodb://admin:MongoPass123!@mongodb:27017/leadenforce
REDIS_URL=redis://redis:6379
API_PORT=3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
JWT_SECRET=your_super_secret_jwt_key_change_this_12345
JWT_EXPIRES_IN=7d
LINKEDIN_CONNECT_LIMIT=20
LINKEDIN_MESSAGE_LIMIT=50
LINKEDIN_VISIT_LIMIT=100
PROXY_PROVIDER=luminati
PROXY_API_KEY=your_proxy_api_key
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password
ENCRYPTION_KEY=32_character_encryption_key_here
EOF

# Build containers
echo "[9/12] Building Docker containers..."
docker-compose build

# Start services
echo "[10/12] Starting services..."
docker-compose up -d

# Wait for services
echo "[11/12] Waiting for services..."
sleep 15

# Show status
echo "[12/12] Checking status..."
docker-compose ps

# Get IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "📍 Access your application:"
echo "   Frontend:  http://$SERVER_IP:3000"
echo "   Backend:   http://$SERVER_IP:3001"
echo ""
echo "⚙️  Next steps:"
echo "   1. Edit .env: nano .env"
echo "   2. Restart: docker-compose restart"
echo "   3. View logs: docker-compose logs -f"
echo ""
