# LeadEnforce VPS Deployment Guide

## 📋 Prerequisites

Your VPS needs:
- Ubuntu 20.04+ or Debian 11+
- 2GB+ RAM
- 20GB+ storage
- Root or sudo access

## 🚀 Deployment Steps

### Option 1: Using SCP (Recommended)

**1. Compress the project on your local machine:**
```powershell
# On Windows (PowerShell)
Compress-Archive -Path D:\CODE\leadenforce-clone\* -DestinationPath D:\CODE\leadenforce-clone.zip
```

**2. Upload to VPS:**
```powershell
scp D:\CODE\leadenforce-clone.zip root@72.61.235.182:/root/
```

**3. SSH into VPS:**
```powershell
ssh root@72.61.235.182
# Password: Govinda@755755
```

**4. Extract and deploy:**
```bash
cd /root
unzip leadenforce-clone.zip -d leadenforce-clone
cd leadenforce-clone
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Option 2: Using Git (If you have GitHub)

**1. Create GitHub repository**
- Go to https://github.com/new
- Name: `leadenforce-clone`
- Make it private

**2. Push code (from local machine with Git):**
```bash
cd D:\CODE\leadenforce-clone
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/leadenforce-clone.git
git push -u origin main
```

**3. Clone on VPS:**
```bash
ssh root@72.61.235.182
cd /root
git clone https://github.com/YOUR_USERNAME/leadenforce-clone.git
cd leadenforce-clone
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## ⚙️ Configuration

**1. Edit environment variables:**
```bash
nano .env
```

**Update these critical values:**
```env
# Database passwords
DATABASE_URL=postgresql://leadenforce_user:CHANGE_THIS_PASSWORD@postgres:5432/leadenforce
MONGODB_URL=mongodb://admin:CHANGE_THIS_PASSWORD@mongodb:27017/leadenforce

# JWT Secret
JWT_SECRET=GENERATE_RANDOM_SECRET_HERE

# Proxy (REQUIRED for production)
PROXY_PROVIDER=luminati
PROXY_API_KEY=your_luminati_api_key
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password
```

**2. Update Docker Compose for production:**
```bash
nano docker-compose.yml
```

Change passwords in the file to match your .env

## 🔒 Security Setup

**1. Configure firewall:**
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

**2. Install SSL certificate (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**3. Set up Nginx reverse proxy:**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/leadenforce
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/leadenforce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📊 Monitoring

**View logs:**
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f linkedin-worker
```

**Check service status:**
```bash
docker-compose ps
```

**Restart services:**
```bash
docker-compose restart
```

## 🔄 Updates

**To update the application:**
```bash
cd /root/leadenforce-clone
git pull origin main  # If using Git
docker-compose down
docker-compose build
docker-compose up -d
```

## 🛑 Troubleshooting

**Services not starting:**
```bash
docker-compose down
docker-compose up  # Run without -d to see errors
```

**Database connection issues:**
```bash
docker-compose logs postgres
docker exec -it leadenforce-postgres psql -U leadenforce_user -d leadenforce
```

**Port already in use:**
```bash
sudo lsof -i :3000
sudo lsof -i :3001
# Kill the process using the port
```

## 📝 Maintenance

**Backup database:**
```bash
docker exec leadenforce-postgres pg_dump -U leadenforce_user leadenforce > backup.sql
```

**Restore database:**
```bash
docker exec -i leadenforce-postgres psql -U leadenforce_user leadenforce < backup.sql
```

## 🎯 Access Points

After deployment:
- **Frontend**: http://YOUR_VPS_IP:3000
- **Backend API**: http://YOUR_VPS_IP:3001
- **Health Check**: http://YOUR_VPS_IP:3001/health

With domain and SSL:
- **Frontend**: https://yourdomain.com
- **Backend API**: https://yourdomain.com/api
