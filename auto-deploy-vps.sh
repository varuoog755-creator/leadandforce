#!/bin/bash

# ============================================
# LeadEnforce - One-Command VPS Deployment
# ============================================
# Copy this entire script and run on your VPS
# Usage: bash <(curl -s URL_TO_THIS_SCRIPT)
# Or: Save as deploy.sh, chmod +x deploy.sh, ./deploy.sh
# ============================================

set -e

echo "🚀 LeadEnforce - Automated VPS Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Update system
echo -e "${GREEN}[1/10]${NC} Updating system packages..."
apt update -y && apt upgrade -y

# Install basic tools
echo -e "${GREEN}[2/10]${NC} Installing basic tools..."
apt install -y git curl wget unzip nano htop

# Install Docker
echo -e "${GREEN}[3/10]${NC} Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo -e "${GREEN}[4/10]${NC} Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose already installed"
fi

# Create project directory
echo -e "${GREEN}[5/10]${NC} Creating project structure..."
cd /root
mkdir -p leadenforce
cd leadenforce

# Create all necessary files
echo -e "${GREEN}[6/10]${NC} Creating project files..."

# Create .env file
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://leadenforce_user:SecurePass123!@postgres:5432/leadenforce
MONGODB_URL=mongodb://admin:MongoPass123!@mongodb:27017/leadenforce
REDIS_URL=redis://redis:6379

# API Configuration
API_PORT=3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d

# Platform Limits (Daily)
LINKEDIN_CONNECT_LIMIT=20
LINKEDIN_MESSAGE_LIMIT=50
LINKEDIN_VISIT_LIMIT=100

# Proxy Configuration (REQUIRED for production)
PROXY_PROVIDER=luminati
PROXY_API_KEY=your_proxy_api_key_here
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password

# Encryption
ENCRYPTION_KEY=32_character_encryption_key_here_change_this

# Billing (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: leadenforce-postgres
    environment:
      POSTGRES_USER: leadenforce_user
      POSTGRES_PASSWORD: SecurePass123!
      POSTGRES_DB: leadenforce
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  mongodb:
    image: mongo:6-jammy
    container_name: leadenforce-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: MongoPass123!
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: leadenforce-redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
  mongodb_data:
EOF

# Create database schema
mkdir -p database
cat > database/schema.sql << 'EOF'
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    username VARCHAR(255),
    encrypted_credentials TEXT,
    proxy_ip VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    warmup_day INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    target_audience_url TEXT,
    action_type VARCHAR(50),
    daily_limit INTEGER DEFAULT 20,
    message_template TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255),
    profile_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    scraped_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action logs table
CREATE TABLE IF NOT EXISTS action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    action_type VARCHAR(50),
    status VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    direction VARCHAR(20),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_actions_campaign ON action_logs(campaign_id);
EOF

echo -e "${GREEN}[7/10]${NC} Starting database services..."
docker-compose up -d postgres mongodb redis

echo -e "${GREEN}[8/10]${NC} Waiting for databases to initialize..."
sleep 15

echo -e "${GREEN}[9/10]${NC} Verifying services..."
docker-compose ps

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")

echo ""
echo "=========================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "📊 Services Status:"
docker-compose ps
echo ""
echo "📍 Database Services Running:"
echo "   PostgreSQL: localhost:5432"
echo "   MongoDB:    localhost:27017"
echo "   Redis:      localhost:6379"
echo ""
echo -e "${YELLOW}⚠️  NEXT STEPS:${NC}"
echo "1. Edit .env file with your credentials:"
echo "   nano .env"
echo ""
echo "2. Add your application code to /root/leadenforce"
echo "   - Upload via SCP/SFTP"
echo "   - Or clone from GitHub"
echo ""
echo "3. Build and start application:"
echo "   docker-compose build"
echo "   docker-compose up -d"
echo ""
echo "=========================================="
