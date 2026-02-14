# 🚀 FINAL DEPLOYMENT INSTRUCTIONS

## Network Issue Detected
VPS connection is slow. Here's the **EASIEST** method to deploy:

---

## ✅ Method 1: One-Command Deploy (Recommended)

### Step 1: Open PuTTY or any SSH client
- Host: `72.61.235.182`
- Username: `root`
- Password: `Govinda@755755`

### Step 2: Copy-paste this ONE command:
```bash
curl -fsSL https://raw.githubusercontent.com/varuoog755-creator/leadandforce/main/auto-deploy-vps.sh | bash
```

**OR if GitHub is not set up yet:**

### Step 3: Manual Script Execution
```bash
# Create and run deployment script
cat > /root/deploy.sh << 'SCRIPT_END'
#!/bin/bash
apt update -y && apt install -y docker.io docker-compose git
systemctl enable docker && systemctl start docker
cd /root
git clone https://github.com/varuoog755-creator/leadandforce.git || mkdir -p leadenforce
cd leadenforce
docker-compose up -d
SCRIPT_END

chmod +x /root/deploy.sh
bash /root/deploy.sh
```

---

## ✅ Method 2: GitHub Desktop Upload (If you want version control)

### Step 1: Install GitHub Desktop
Download: https://desktop.github.com/

### Step 2: Open GitHub Desktop
1. File → Add Local Repository
2. Choose: `D:\CODE\leadenforce-clone`
3. Click "Publish repository"
4. Repository name: `leadandforce`
5. Click "Publish"

### Step 3: Deploy from GitHub
SSH into VPS and run:
```bash
ssh root@72.61.235.182
cd /root
git clone https://github.com/varuoog755-creator/leadandforce.git
cd leadandforce
chmod +x deploy-vps.sh
./deploy-vps.sh
```

---

## ✅ Method 3: WinSCP Upload (Fastest - No GitHub needed)

### Step 1: Download WinSCP
https://winscp.net/eng/download.php

### Step 2: Connect
- Host: `72.61.235.182`
- Username: `root`
- Password: `Govinda@755755`

### Step 3: Upload
Drag `D:\CODE\leadenforce-clone.zip` to `/root/`

### Step 4: Extract and Deploy (via SSH)
```bash
ssh root@72.61.235.182
cd /root
apt install -y unzip
unzip leadenforce-clone.zip
cd leadenforce-clone
chmod +x deploy-vps.sh
./deploy-vps.sh
```

---

## 🎯 After Deployment

### Access Application:
- **Frontend:** http://72.61.235.182:3000
- **Backend API:** http://72.61.235.182:3001

### Configure:
```bash
cd /root/leadenforce
nano .env
# Update passwords and proxy settings
docker-compose restart
```

### View Logs:
```bash
docker-compose logs -f
```

---

## 📝 Quick Reference

**Check Status:**
```bash
docker-compose ps
```

**Restart Services:**
```bash
docker-compose restart
```

**Stop Services:**
```bash
docker-compose down
```

**Update Application:**
```bash
git pull
docker-compose restart
```

---

## 🆘 If Nothing Works

**Simplest possible deployment:**

1. SSH into VPS: `ssh root@72.61.235.182`
2. Run these commands one by one:

```bash
apt update
apt install -y docker.io docker-compose
systemctl start docker
mkdir -p /root/leadenforce
cd /root/leadenforce

# Create minimal docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
EOF

docker-compose up -d
docker-compose ps
```

This will at least get the databases running!

---

## 💡 Recommendation

**Use Method 3 (WinSCP)** - It's the most reliable when network is slow:
1. Download WinSCP (2 minutes)
2. Upload file (5-10 minutes)
3. SSH and extract (2 minutes)
4. Deploy (5 minutes)

**Total time: ~15 minutes**
