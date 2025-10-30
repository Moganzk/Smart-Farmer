# 🔴 REGISTRATION TIMEOUT - Network Connection Issue

## Problem Analysis

### What's Working ✅
- Backend server is running on port 3001
- Backend responds in **0.27 seconds** when tested from your computer
- Registration endpoint is fully functional
- Frontend sends correct data: `{"email": "test@smartfarmer.com"}`

### What's Failing ❌
- Mobile device **cannot connect** to backend
- Request times out after 60 seconds
- Error: `ECONNABORTED` (connection aborted)

### Root Cause
**Your mobile device cannot reach your computer's IP address (172.20.106.222)**

This happens when:
1. Mobile device is on **different network** than computer
2. **Firewall** is blocking incoming connections
3. **Router** is blocking device-to-device communication
4. Using **mobile data** instead of WiFi

---

## SOLUTION 1: Verify Network Connection (RECOMMENDED)

### Step 1: Check Both Devices Are on Same WiFi

**On Computer:**
```powershell
# Check your WiFi network name
netsh wlan show interfaces | Select-String "SSID"
```

**On Mobile Device:**
- Go to **Settings > WiFi**
- Check WiFi network name
- **MUST match computer's network!**

### Step 2: Test Connection from Mobile Device

**Open browser on your phone and visit:**
```
http://172.20.106.222:3001/health
```

**Expected result:**
```json
{"status":"ok","timestamp":"..."}
```

**If you see this:** ✅ Network is working, continue to Step 3

**If timeout/error:** ❌ Network issue, try Solution 2

### Step 3: Restart Metro with Correct Network

```bash
# Stop Metro (Ctrl+C in frontend terminal)

# Restart with LAN mode
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --lan
```

---

## SOLUTION 2: Use Tunnel Mode (EASIEST - ALWAYS WORKS)

This bypasses all network issues by routing through Expo's servers.

### Stop Metro and Restart with Tunnel

```bash
# In frontend terminal
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --tunnel
```

**Advantages:**
- ✅ Works on any network
- ✅ No firewall issues
- ✅ No IP address configuration needed
- ✅ Works with mobile data

**Disadvantages:**
- ⚠️ Slightly slower (routes through internet)
- ⚠️ Requires internet connection

### Make Tunnel Mode Default

Update `package.json`:
```json
{
  "scripts": {
    "start": "expo start --tunnel",
    "android": "expo start --android --tunnel",
    "ios": "expo start --ios --tunnel"
  }
}
```

---

## SOLUTION 3: Disable Windows Firewall (TEMPORARY TEST)

### Test if Firewall is Blocking

```powershell
# Run as Administrator
# Disable firewall temporarily
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Test registration from mobile app

# Re-enable firewall immediately after testing
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### If This Works: Add Firewall Rule Permanently

```powershell
# Run as Administrator
# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Node.js for Smart Farmer" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow

# Allow specific port
New-NetFirewallRule -DisplayName "Smart Farmer Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

---

## SOLUTION 4: Use Android Emulator Instead

If you have Android Studio installed:

### Start Android Emulator

```bash
# Start Metro
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --android
```

### Configure for Emulator

No network issues with emulator! Use localhost:

```bash
# Forward ports to emulator
adb reverse tcp:3001 tcp:3001
```

Update config for emulator:
```javascript
// FRONTEND/src/constants/config.js
export const API_URL = 'http://10.0.2.2:3001/api';
// 10.0.2.2 is the host machine from Android emulator's perspective
```

---

## SOLUTION 5: Check Router Settings

### Some Routers Block Device-to-Device Communication

**Check Router Settings:**
1. Open router admin page (usually http://192.168.1.1)
2. Look for "AP Isolation" or "Client Isolation"
3. **Disable** if enabled
4. Restart router
5. Reconnect both devices

**Common on:**
- Public WiFi
- Guest networks
- Corporate networks

---

## DIAGNOSTIC COMMANDS

### Check Current IP
```powershell
ipconfig | Select-String "IPv4"
```

### Check Backend Port
```powershell
netstat -ano | findstr :3001
```

### Test Backend from Computer
```powershell
Invoke-WebRequest -Uri "http://172.20.106.222:3001/health" -UseBasicParsing
```

### Check Firewall Status
```powershell
Get-NetFirewallProfile | Select-Object Name, Enabled
```

### Test Registration from Computer
```powershell
$testUser = @{
    username="test$(Get-Random)"
    email="test$(Get-Random)@test.com"
    password="Test123!"
    role="farmer"
    fullName="Test User"
    phoneNumber="+256701234567"
    location=""
    preferredLanguage="en"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://172.20.106.222:3001/api/auth/register" -Method POST -Body $testUser -ContentType "application/json" -UseBasicParsing
```

---

## QUICK FIX: Just Use Tunnel Mode

**This is the simplest solution that works 99% of the time:**

### Step 1: Stop Metro
Press `Ctrl+C` in frontend terminal

### Step 2: Start with Tunnel
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --tunnel --clear
```

### Step 3: Wait for QR Code
It will take 30-60 seconds to establish tunnel connection.

### Step 4: Scan QR Code
Use Expo Go app on your phone.

### Step 5: Test Registration
Should work immediately!

---

## Troubleshooting Each Error

### Error: "ECONNABORTED" or "timeout"
**Cause:** Mobile device cannot reach backend
**Fix:** Use tunnel mode or check network

### Error: "Network request failed"
**Cause:** No internet or backend not running
**Fix:** Check backend is running, check internet

### Error: "ECONNREFUSED"
**Cause:** Backend not listening on that port
**Fix:** Restart backend, check port 3001

### Error: Response never arrives
**Cause:** Firewall blocking
**Fix:** Disable firewall temporarily or add exception

---

## Recommended Setup

For consistent development experience:

### 1. Make Tunnel Mode Default
```json
// package.json
{
  "scripts": {
    "start": "expo start --tunnel -c"
  }
}
```

### 2. Or Use Android Emulator
- Install Android Studio
- Create AVD (Android Virtual Device)
- Use `npx expo start --android`
- No network issues!

### 3. Or Set Static IP
- Configure router to always assign same IP
- Update config once
- No IP changes

---

## Test Checklist

Before testing registration:

- [ ] Backend running (check with `netstat -ano | findstr :3001`)
- [ ] Backend accessible (test `/health` endpoint)
- [ ] Metro running (should see QR code)
- [ ] Mobile device on same WiFi (check network name)
- [ ] Can open `http://YOUR_IP:3001/health` in phone browser
- [ ] Firewall allows Node.js (or temporarily disabled)
- [ ] Using tunnel mode (if network is complex)

---

## Current Status

### Backend ✅
- Running on: `http://172.20.106.222:3001`
- Health: ✅ Responding in 0.27s
- Registration: ✅ Working perfectly

### Network ❌
- Mobile → Computer: ❌ Timeout (60s)
- Computer → Computer: ✅ Works fine (0.27s)
- **Diagnosis**: Network isolation or firewall issue

### Solution
**Use tunnel mode immediately:**
```bash
npx expo start --tunnel -c
```

This will work regardless of network configuration!

---

## Expected Result After Fix

### Logs Should Show:
```
LOG  🔍 AuthContext: Starting registration... {"email": "test@smartfarmer.com"}
LOG  ✅ AuthContext: Registration successful
LOG  🔍 AppNavigator: isLoading = false ... isAuthenticated = true
```

### Timeline:
- Request sent: 0s
- Backend processes: ~0.3s
- Response received: ~0.5s
- Total time: **< 1 second**

---

## TL;DR - FASTEST FIX

```bash
# 1. Stop Metro (Ctrl+C)

# 2. Use tunnel mode
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --tunnel

# 3. Scan QR code in Expo Go

# 4. Test registration

# Done! Should work immediately.
```

---

## Need More Help?

Share:
1. Can you open `http://172.20.106.222:3001/health` in phone browser?
2. Are phone and computer on same WiFi network?
3. Which solution did you try?

I can provide more specific guidance based on your setup!
