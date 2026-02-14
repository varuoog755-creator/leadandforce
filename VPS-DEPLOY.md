# 🚀 VPS Deployment - One Command Setup

## Prerequisites
- VPS IP: `72.61.235.182`
- Username: `root`
- Password: `Govinda@755755`

---

## 🎯 Quick Deploy (Single Command)

### Step 1: SSH into VPS
```bash
ssh root@72.61.235.182
```
Password: `Govinda@755755`

### Step 2: Run Auto-Deploy Script
```bash
curl -fsSL https://raw.githubusercontent.com/varuoog755-creator/leadandforce/main/deploy-vps.sh | bash
```

**OR manually:**
```bash
# Install git
apt update && apt install -y git

# Clone repository
cd /root
git clone https://github.com/varuoog755-creator/leadandforce.git
cd leadandforce

# Make script executable and run
chmod +x deploy-vps.sh
./deploy-vps.sh
```

---

## ⚙️ Post-Deployment Configuration

### 1. Edit Environment Variables
```bash
cd /root/leadandforce
nano .env
```

**Update these critical values:**
```env
# Database Passwords (CHANGE THESE!)
DATABASE_URL=postgresql://leadenforce_user:YOUR_STRONG_PASSWORD@postgres:5432/leadenforce
MONGODB_URL=mongodb://admin:YOUR_MONGO_PASSWORD@mongodb:27017/leadenforce

# JWT Secret (Generate random string)
JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure

# Proxy Settings (REQUIRED for production)
PROXY_PROVIDER=luminati
PROXY_API_KEY=your_luminati_api_key
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password
```

**Save:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 2. Update Docker Compose Passwords
```bash
nano docker-compose.yml
```

Match the passwords with your `.env` file.

### 3. Restart Services
```bash
docker-compose down
docker-compose up -d
```

---

## 🌐 Access Application

**After deployment:**
- **Frontend:** http://72.61.235.182:3000
- **Backend API:** http://72.61.235.182:3001
- **Health Check:** http://72.61.235.182:3001/health

---

## 🔒 Security Setup (Recommended)

### 1. Configure Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw enable
```

### 2. Install SSL (If you have domain)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## 📊 Monitoring & Management

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f linkedin-worker
```

### Check Service Status
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

### Update Application
```bash
cd /root/leadandforce
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🛠️ Troubleshooting

### Services not starting?
```bash
docker-compose down
docker-compose up  # Run without -d to see errors
```

### Database connection issues?
```bash
docker-compose logs postgres
docker exec -it leadenforce-postgres psql -U leadenforce_user -d leadenforce
```

### Port already in use?
```bash
lsof -i :3000
lsof -i :3001
# Kill the process if needed
kill -9 <PID>
```

### Reset everything?
```bash
docker-compose down -v  # WARNING: Deletes all data
docker-compose up -d
```

---

## 📝 Database Backup

### Backup
```bash
docker exec leadenforce-postgres pg_dump -U leadenforce_user leadenforce > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
docker exec -i leadenforce-postgres psql -U leadenforce_user leadenforce < backup_20260214.sql
```

---

## ✅ Verification Checklist

- [ ] Services running: `docker-compose ps`
- [ ] Frontend accessible: http://72.61.235.182:3000
- [ ] Backend API working: http://72.61.235.182:3001/health
- [ ] Database connected: Check logs
- [ ] Environment variables configured
- [ ] Proxy settings added (for production)
- [ ] Firewall configured
- [ ] SSL installed (if using domain)

---

## 🎯 First Time Setup

1. **Register Account:** Go to http://72.61.235.182:3000
2. **Add Social Account:** LinkedIn credentials + proxy
3. **Create Campaign:** Set target audience & message templates
4. **Monitor Dashboard:** Track leads and analytics

---

## ⚠️ Important Notes

- **Proxies are MANDATORY** for production use
- **Start with warmup mode** for new LinkedIn accounts
- **Monitor action logs** to avoid bans
- **Keep credentials encrypted** (already implemented)
- **Regular backups** recommended
