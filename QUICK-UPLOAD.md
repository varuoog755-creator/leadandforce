# Quick VPS Upload Commands

## Step 1: Compress Project (Run on Windows)
```powershell
cd D:\CODE
Compress-Archive -Path leadenforce-clone -DestinationPath leadenforce-clone.zip
```

## Step 2: Upload to VPS
```powershell
scp D:\CODE\leadenforce-clone.zip root@72.61.235.182:/root/
```
Password: `Govinda@755755`

## Step 3: SSH into VPS
```powershell
ssh root@72.61.235.182
```
Password: `Govinda@755755`

## Step 4: Extract and Deploy
```bash
cd /root
apt install unzip -y
unzip leadenforce-clone.zip
cd leadenforce-clone
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## Step 5: Configure
```bash
nano .env
# Update passwords and proxy settings
# Save: Ctrl+O, Enter, Ctrl+X
```

## Step 6: Access
Open browser: `http://72.61.235.182:3000`

---

## Alternative: Manual Upload via WinSCP
1. Download WinSCP: https://winscp.net/
2. Connect to: 72.61.235.182
3. Username: root
4. Password: Govinda@755755
5. Drag & drop `leadenforce-clone` folder to `/root/`
6. Follow Step 3-6 above
