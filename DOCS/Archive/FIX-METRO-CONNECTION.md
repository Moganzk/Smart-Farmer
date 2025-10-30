# 🔧 Fix: Cannot Connect to Metro Bundler

## Common Symptoms

```
Unable to connect to Metro
Could not connect to development server
Connection refused
ERR_CONNECTION_REFUSED
Metro bundler is not running
```

## Quick Fixes (Try in Order)

### Fix #1: Restart Metro Bundler
```bash
# In terminal 1 (frontend terminal)
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --clear
```

**Or if using npm:**
```bash
npm start -- --reset-cache
```

### Fix #2: Clear Metro Cache
```bash
# Stop Metro (Ctrl+C), then:
npx expo start -c
# or
npx react-native start --reset-cache
```

### Fix #3: Clear All Caches
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"

# Clear watchman cache
watchman watch-del-all

# Clear Metro cache
del /s /q %TEMP%\metro-*
del /s /q %TEMP%\haste-map-*

# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rmdir /s /q node_modules
npm install

# Start fresh
npx expo start -c
```

### Fix #4: Check Metro is Running
Metro should be running on port **8081** or **19000** (Expo).

**Check if port is in use:**
```powershell
# Check port 8081
netstat -ano | findstr :8081

# Check port 19000
netstat -ano | findstr :19000
```

**If port is blocked, kill the process:**
```powershell
# Find the PID from netstat output, then:
taskkill /PID <PID_NUMBER> /F

# Or kill all Node processes:
taskkill /F /IM node.exe
```

### Fix #5: Network Configuration

**Check IP Address:**
```powershell
ipconfig
```

Look for your IPv4 address. Should be something like `192.168.100.22`.

**Update Metro Configuration** if IP changed:

Create/edit `FRONTEND/metro.config.js`:
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

### Fix #6: Firewall/Antivirus
Metro might be blocked by Windows Firewall or antivirus.

**Allow Metro in Windows Firewall:**
1. Open Windows Firewall
2. Click "Allow an app through firewall"
3. Add Node.js if not listed
4. Check both Private and Public networks

**Or temporarily disable firewall for testing:**
```powershell
# Run as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable after testing:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### Fix #7: Expo CLI Issues (If using Expo)

**Reinstall Expo CLI:**
```bash
npm uninstall -g expo-cli
npm install -g expo-cli
```

**Update Expo dependencies:**
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo install --fix
```

### Fix #8: Device Connection Issues

**Ensure device and computer are on same network:**
- Both should be on same WiFi
- No VPN running
- No proxy settings

**Test connection from device:**
```
Open browser on mobile device
Navigate to: http://192.168.100.22:8081
```

If you see Metro bundler page, connection is working.

### Fix #9: Change Connection Method

**Try different connection methods:**

**Method 1: Tunnel (works through internet)**
```bash
npx expo start --tunnel
```

**Method 2: LAN (local network)**
```bash
npx expo start --lan
```

**Method 3: Localhost (emulator only)**
```bash
npx expo start --localhost
```

### Fix #10: Check package.json Scripts

Verify your start scripts in `package.json`:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "clear": "expo start -c"
  }
}
```

---

## Complete Reset (Nuclear Option)

If nothing else works:

```bash
# 1. Stop all Node processes
taskkill /F /IM node.exe

# 2. Navigate to frontend
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"

# 3. Remove everything
rmdir /s /q node_modules
rmdir /s /q .expo
del package-lock.json
del yarn.lock

# 4. Clear all caches
npm cache clean --force
del /s /q %TEMP%\metro-*
del /s /q %TEMP%\haste-map-*
del /s /q %TEMP%\react-*

# 5. Reinstall
npm install

# 6. Start fresh
npx expo start -c
```

---

## Verify Metro is Working

**Expected output when Metro starts:**
```
Metro waiting on exp://192.168.100.22:8081
› Press a │ open Android
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to exit.
```

**If you see this, Metro is running correctly!**

---

## Test Connection

**From PowerShell:**
```powershell
# Test if Metro is accessible
Invoke-WebRequest -Uri "http://192.168.100.22:8081/status"
```

**Expected response:**
```json
{"packager":"running"}
```

---

## Expo Go App Settings

**In Expo Go mobile app:**
1. Shake device (or three-finger tap)
2. Tap "Settings"
3. Check "Use Developer Menu"
4. Go back
5. Shake again
6. Tap "Reload"

**Manual connection:**
1. Open Expo Go
2. Tap "Enter URL manually"
3. Enter: `exp://192.168.100.22:19000`
4. Tap "Connect"

---

## Common Error Messages & Solutions

### "Could not connect to Metro"
```bash
# Solution:
npx expo start -c --lan
```

### "Unable to resolve module"
```bash
# Solution:
npm install
npx expo start -c
```

### "Port 8081 already in use"
```powershell
# Solution:
netstat -ano | findstr :8081
taskkill /PID <PID> /F
npx expo start
```

### "Network request failed"
```bash
# Solution:
# Check firewall
# Try tunnel mode:
npx expo start --tunnel
```

### "Metro Bundler process exited"
```bash
# Solution:
watchman watch-del-all
npm start -- --reset-cache
```

---

## Recommended Workflow

**Terminal Setup:**

**Terminal 1: Backend**
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
npm start
```

**Terminal 2: Frontend (Metro)**
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start -c
```

**Keep both terminals running during development!**

---

## Metro Configuration (Advanced)

Create `FRONTEND/metro.config.js` with custom settings:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Increase timeout
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Increase timeout
      res.setTimeout(300000); // 5 minutes
      return middleware(req, res, next);
    };
  },
};

// Add custom resolver
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;
```

---

## Environment Variables

Create `FRONTEND/.env` if not exists:

```env
EXPO_PUBLIC_API_URL=http://192.168.100.22:3001/api
EXPO_DEVTOOLS=true
EXPO_DEBUG=true
```

---

## Quick Diagnostic Script

Save as `check-metro.ps1` and run:

```powershell
# Check Metro Diagnostic Script

Write-Host "=== Metro Bundler Diagnostic ===" -ForegroundColor Cyan

# Check Node version
Write-Host "`nNode Version:" -ForegroundColor Yellow
node --version

# Check npm version
Write-Host "`nNpm Version:" -ForegroundColor Yellow
npm --version

# Check Expo CLI
Write-Host "`nExpo CLI:" -ForegroundColor Yellow
npx expo --version

# Check if Metro ports are in use
Write-Host "`nChecking Ports:" -ForegroundColor Yellow
Write-Host "Port 8081 (Metro):"
netstat -ano | findstr :8081
Write-Host "Port 19000 (Expo):"
netstat -ano | findstr :19000
Write-Host "Port 19001 (Expo Dev Tools):"
netstat -ano | findstr :19001

# Check IP address
Write-Host "`nIP Address:" -ForegroundColor Yellow
ipconfig | findstr IPv4

# Check firewall status
Write-Host "`nFirewall Status:" -ForegroundColor Yellow
Get-NetFirewallProfile | Select-Object Name, Enabled

# Check if frontend exists
Write-Host "`nFrontend Directory:" -ForegroundColor Yellow
Test-Path "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Cyan
```

---

## Most Common Solution

**90% of Metro issues are fixed by:**

```bash
# Stop everything
taskkill /F /IM node.exe

# Clear and restart
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start -c

# Scan QR code in Expo Go app
```

---

## Still Not Working?

1. **Check if backend is blocking frontend**:
   - Try stopping backend temporarily
   - Start Metro alone
   - See if it works

2. **Check antivirus logs**:
   - Some antivirus software blocks Metro
   - Add exception for Node.js

3. **Try different network**:
   - Switch to mobile hotspot
   - Try different WiFi network

4. **Check Windows updates**:
   - Pending Windows updates can interfere
   - Restart computer after updates

5. **Reinstall Node.js**:
   - Download latest LTS from nodejs.org
   - Uninstall old version first
   - Reinstall, restart computer

---

## Quick Reference Commands

```bash
# Start Metro (clean)
npx expo start -c

# Start with tunnel
npx expo start --tunnel

# Clear all caches
npx expo start -c --reset-cache

# Kill all Node processes
taskkill /F /IM node.exe

# Check Metro status
curl http://localhost:8081/status
```

---

## Need Immediate Help?

**Most reliable method (tunnel mode):**
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --tunnel --clear
```

This routes through Expo servers and works even with complex network setups.

---

**Let me know what error message you're seeing and I can provide more specific help!**
