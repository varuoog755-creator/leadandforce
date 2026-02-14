# 🚀 Quick Deploy Guide - LeadEnforce to VPS

## ⚡ Fastest Method: Direct VPS Upload (No GitHub Needed)

Since Git is not installed locally, we'll upload directly to VPS using the compressed file.

### Step 1: Upload to VPS (Choose One Method)

#### Method A: Using PowerShell SCP (Recommended)
```powershell
# The file is already compressed at: D:\CODE\leadenforce-clone.zip
# Upload it:
scp D:\CODE\leadenforce-clone.zip root@72.61.235.182:/root/
```
Password: `Govinda@755755`

#### Method B: Using WinSCP (GUI - Easiest)
1. Download WinSCP: https://winscp.net/eng/download.php
2. Install and open WinSCP
3. Create new connection:
   - Host: `72.61.235.182`
   - Username: `root`
   - Password: `Govinda@755755`
4. Click "Login"
5. Drag `D:\CODE\leadenforce-clone.zip` to `/root/` folder
6. Wait for upload to complete

### Step 2: SSH into VPS
```powershell
ssh root@72.61.235.182
```
Password: `Govinda@755755`

### Step 3: Extract and Deploy
```bash
cd /root

# Install unzip if not available
apt update && apt install -y unzip

# Extract files
unzip leadenforce-clone.zip -d leadenforce
cd leadenforce

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Setup environment
cp .env.example .env

# IMPORTANT: Edit .env file
nano .env
# Update passwords and proxy settings
# Save: Ctrl+O, Enter, Exit: Ctrl+X

# Build and start
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

### Step 4: Access Application
- Frontend: http://72.61.235.182:3000
- Backend API: http://72.61.235.182:3001

---

## 🔄 Alternative: Upload to GitHub First (For Future Updates)

If you want to use GitHub for version control:

### Option 1: GitHub Desktop (Easiest)
1. Download: https://desktop.github.com/
2. Install and sign in
3. File → Add Local Repository → Choose `D:\CODE\leadenforce-clone`
4. Publish to: `varuoog755-creator/leadandforce`

### Option 2: GitHub Web Upload
1. Go to: https://github.com/varuoog755-creator/leadandforce
2. Click "uploading an existing file"
3. Drag all folders from `D:\CODE\leadenforce-clone`
4. Commit changes

### Then Deploy from GitHub:
```bash
ssh root@72.61.235.182
cd /root
git clone https://github.com/varuoog755-creator/leadandforce.git
cd leadandforce
chmod +x deploy-vps.sh
./deploy-vps.sh
```

---

## ⚙️ Post-Deployment Configuration

### 1. Edit Environment Variables
```bash
nano .env
```

Update these:
```env
DATABASE_URL=postgresql://leadenforce_user:STRONG_PASSWORD@postgres:5432/leadenforce
MONGODB_URL=mongodb://admin:STRONG_PASSWORD@mongodb:27017/leadenforce
JWT_SECRET=generate_random_secret_key_here
PROXY_API_KEY=your_luminati_or_smartproxy_key
```

### 2. Restart Services
```bash
docker-compose restart
```

### 3. View Logs
```bash
docker-compose logs -f
```

---

## 🎯 Quick Commands Reference

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Start services
docker-compose up -d

# Check status
docker-compose ps

# Update application
cd /root/leadenforce
git pull  # if using GitHub
docker-compose restart
```

---

## ✅ Verification

After deployment, verify:
1. ✅ Frontend loads: http://72.61.235.182:3000
2. ✅ Can register account
3. ✅ Can login
4. ✅ Dashboard loads
5. ✅ Backend API responds: http://72.61.235.182:3001/health

---

## 🆘 Troubleshooting

**Services not starting?**
```bash
docker-compose up  # without -d to see errors
```

**Port already in use?**
```bash
lsof -i :3000
lsof -i :3001
kill -9 <PID>
```

**Database issues?**
```bash
docker-compose logs postgres
docker-compose restart postgres
```

**Reset everything?**
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📝 Important Notes

⚠️ **CRITICAL:**
- Proxies are MANDATORY for production
- Start with account warmup mode
- Monitor action logs regularly
- Keep .env file secure
- Regular database backups recommended

🎯 **First Steps After Deploy:**
1. Register your account
2. Add LinkedIn account with proxy
3. Create test campaign
4. Monitor dashboard for activity
