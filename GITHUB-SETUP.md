# GitHub Setup & Push Instructions

## Method 1: Using GitHub Desktop (Easiest)

### Step 1: Install GitHub Desktop
Download from: https://desktop.github.com/

### Step 2: Sign in to GitHub
Open GitHub Desktop → File → Options → Accounts → Sign in

### Step 3: Add Repository
1. File → Add Local Repository
2. Choose: `D:\CODE\leadenforce-clone`
3. Click "create a repository" if prompted
4. Click "Create Repository"

### Step 4: Publish to GitHub
1. Click "Publish repository" button
2. Name: `leadandforce`
3. Uncheck "Keep this code private" if you want public
4. Click "Publish repository"

### Step 5: Push Changes
1. Write commit message: "Initial commit: LeadEnforce Clone"
2. Click "Commit to main"
3. Click "Push origin"

✅ Done! Your code is now on GitHub: https://github.com/varuoog755-creator/leadandforce

---

## Method 2: Using Git Command Line

### Install Git First
Download from: https://git-scm.com/download/win

### Then run these commands:
```bash
cd D:\CODE\leadenforce-clone

# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: LeadEnforce Clone - Social Automation Platform"

# Add remote
git remote add origin https://github.com/varuoog755-creator/leadandforce.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Method 3: Manual Upload via GitHub Web

1. Go to: https://github.com/varuoog755-creator/leadandforce
2. Click "uploading an existing file"
3. Drag and drop all folders/files from `D:\CODE\leadenforce-clone`
4. Commit changes

---

## After Pushing to GitHub

Once code is on GitHub, run these commands to deploy to VPS:

```bash
# SSH into VPS
ssh root@72.61.235.182
# Password: Govinda@755755

# Clone repository
cd /root
git clone https://github.com/varuoog755-creator/leadandforce.git
cd leadandforce

# Make deploy script executable
chmod +x deploy-vps.sh

# Run deployment
./deploy-vps.sh

# Configure environment
nano .env
# Update passwords and proxy settings
# Save: Ctrl+O, Enter, Exit: Ctrl+X

# Restart services
docker-compose restart
```

## Access Application
- Frontend: http://72.61.235.182:3000
- Backend API: http://72.61.235.182:3001

## Troubleshooting

**If git command not found on VPS:**
```bash
apt update
apt install git -y
```

**If Docker not installed:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

**View logs:**
```bash
docker-compose logs -f
```
