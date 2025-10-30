# 🚨 URGENT: IP Address Changed - Fix Metro Connection

## Problem Identified

Your IP address has **CHANGED**:
- ❌ **Old IP**: `192.168.100.22` (configured in app)
- ✅ **New IP**: `172.20.106.222` (current IP)

**This is why Metro cannot connect!**

---

## Quick Fix

### Option 1: Update Frontend Config (RECOMMENDED)

Update the API URL in your frontend config:

**File**: `FRONTEND/src/constants/config.js`

Change:
```javascript
export const API_URL = getEnv('API_URL', 'http://192.168.100.22:3001/api');
```

To:
```javascript
export const API_URL = getEnv('API_URL', 'http://172.20.106.222:3001/api');
```

### Option 2: Use Tunnel Mode (NO CONFIG CHANGE NEEDED)

This works regardless of IP changes:

```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --tunnel
```

Tunnel mode routes through Expo's servers, so IP changes don't matter.

---

## Complete Fix Steps

### Step 1: Stop Current Metro
Press `Ctrl+C` in the frontend terminal

### Step 2: Update Config File

**Open**: `FRONTEND/src/constants/config.js`

**Replace IP address**:
```javascript
// Update this line:
export const API_URL = getEnv('API_URL', 'http://172.20.106.222:3001/api');
//                                            ↑ New IP address
```

### Step 3: Restart Backend with New IP

The backend needs to accept connections from the new IP:

```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
npm start
```

Backend should show:
```
🚀 Server is accessible at:
   - http://localhost:3001
   - http://127.0.0.1:3001
   - http://172.20.106.222:3001  ← Your new IP
```

### Step 4: Restart Metro

```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start -c
```

### Step 5: Connect from Mobile Device

**Make sure your phone is on the same network!**

**In Expo Go app:**
1. Scan QR code shown in terminal
2. Or manually enter: `exp://172.20.106.222:19000`

---

## Why Did IP Change?

Common reasons:
1. **Router DHCP**: Your router assigned a new IP
2. **Network Switch**: You switched from WiFi to mobile hotspot (or vice versa)
3. **VPN**: VPN connection changed your IP
4. **WiFi Network**: Connected to different WiFi network

---

## Prevent Future IP Changes

### Option 1: Set Static IP (BEST)

**In Windows:**
1. Open Network Settings
2. Click "Change adapter options"
3. Right-click your network adapter → Properties
4. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
5. Choose "Use the following IP address"
6. Enter:
   - IP address: `172.20.106.222`
   - Subnet mask: `255.255.255.0`
   - Default gateway: (your router IP, usually `172.20.106.1`)
   - DNS: `8.8.8.8` (Google DNS)

### Option 2: Reserve IP in Router

**In your router settings:**
1. Login to router (usually http://192.168.1.1)
2. Find DHCP settings
3. Add MAC address reservation
4. Bind your MAC address to `172.20.106.222`

### Option 3: Use Tunnel Mode Always

Add to `package.json`:
```json
{
  "scripts": {
    "start": "expo start --tunnel",
    "android": "expo start --android --tunnel",
    "ios": "expo start --ios --tunnel"
  }
}
```

Then just run: `npm start`

---

## Current Status Check

Let me verify everything is working with the new IP:

**Test Backend:**
```powershell
Invoke-WebRequest -Uri "http://172.20.106.222:3001/health"
```

**Test Metro:**
```powershell
Invoke-WebRequest -Uri "http://172.20.106.222:19000"
```

**Both should return status 200.**

---

## Quick Commands Reference

**Update config and restart everything:**

```bash
# Terminal 1: Backend
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
npm start

# Terminal 2: Frontend
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
# First update config.js with new IP, then:
npx expo start -c
```

---

## Alternative: Use Localhost with Android Emulator

If you're using Android Emulator (not physical device):

**No config change needed!** Use `adb reverse`:

```bash
# Forward port from emulator to computer
adb reverse tcp:3001 tcp:3001
adb reverse tcp:19000 tcp:19000

# Then use localhost in config:
export const API_URL = 'http://localhost:3001/api';
```

This only works with Android Emulator, not with physical devices.

---

## What to Do Now

### Immediate Action:

1. **Update the config file** with new IP: `172.20.106.222`
2. **Restart both servers** (backend and Metro)
3. **Reconnect Expo Go app** to new IP

### Or Use Tunnel (Easier):

```bash
# Just restart with tunnel mode:
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --tunnel
```

No config changes needed!

---

## Need Help?

I can update the config file for you. Just confirm and I'll make the change automatically.

Or if you prefer tunnel mode, I can update your package.json to always use tunnel.

**Which would you prefer?**
1. Update IP in config (requires change when IP changes again)
2. Use tunnel mode (works always, slightly slower)
3. Set up static IP (best long-term solution)
