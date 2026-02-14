#!/bin/bash

# Complete VPS Setup Script - Run this on VPS
# This will create the entire LeadEnforce structure

echo "🚀 LeadEnforce - Complete VPS Setup"
echo "===================================="

# Update system
echo "📦 Updating system..."
apt update -y && apt upgrade -y

# Install required packages
echo "📥 Installing dependencies..."
apt install -y git curl wget unzip nano

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Python
echo "🐍 Installing Python..."
apt install -y python3 python3-pip

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Upload your project files to /root/leadenforce"
echo "2. Or clone from GitHub: git clone https://github.com/varuoog755-creator/leadandforce.git"
echo "3. cd leadenforce && docker-compose up -d"
