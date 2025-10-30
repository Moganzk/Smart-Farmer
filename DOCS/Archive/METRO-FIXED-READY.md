# ✅ Metro Connection Fixed!

## What Was Fixed

### Problem
Your IP address changed from `192.168.100.22` to `172.20.106.222`, causing Metro/Expo connection failures.

### Solution Applied
✅ **Updated frontend config** with new IP address
✅ **Backend verified** working on new IP
✅ **Ready to connect** from mobile device

---

## Current Status

### Backend Server ✅
- **Status**: Running
- **URL**: http://172.20.106.222:3001
- **Health Check**: ✅ Passing

### Frontend/Metro ⏳
- **Status**: Needs restart
- **Port**: 19000 (Expo) or 8081 (Metro)
- **Config**: ✅ Updated with new IP

---

## Next Steps - Start Metro

### Open a new terminal for frontend:

```bash
# Navigate to frontend folder
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"

# Start Metro with clean cache
npx expo start -c
```

**Expected output:**
```
Metro waiting on exp://172.20.106.222:8081
› Press a │ open Android
› Press w │ open web

QR Code will appear here
```

---

## Connect Your Mobile Device

### Method 1: Scan QR Code (Easiest)
1. **Open Expo Go** app on your phone
2. **Scan QR code** shown in terminal
3. **Wait** for app to load

### Method 2: Manual URL Entry
1. **Open Expo Go** app
2. **Tap** "Enter URL manually"
3. **Enter**: `exp://172.20.106.222:19000`
4. **Tap** "Connect"

### Method 3: Tunnel Mode (If same network doesn't work)
```bash
npx expo start --tunnel
```
Then scan QR code (works through internet, no network issues)

---

## Troubleshooting

### If Metro won't start:
```bash
# Kill all Node processes first
taskkill /F /IM node.exe

# Then start fresh
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start -c
```

### If app can't connect:
1. **Verify same network**: Phone and computer must be on same WiFi
2. **Check firewall**: Temporarily disable Windows Firewall to test
3. **Use tunnel**: `npx expo start --tunnel` (bypasses network issues)

### If you see "Cannot connect to Metro":
```bash
# Use tunnel mode:
npx expo start --tunnel -c
```

---

## Quick Test Commands

**Test backend:**
```powershell
Invoke-WebRequest -Uri "http://172.20.106.222:3001/health" -UseBasicParsing
```
Should return: `{"status":"ok",...}`

**Test Metro (after starting):**
```powershell
Invoke-WebRequest -Uri "http://172.20.106.222:19000" -UseBasicParsing
```
Should return: Status 200

---

## Complete Startup Sequence

### Terminal 1: Backend (ALREADY RUNNING ✅)
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
npm start
```

### Terminal 2: Frontend (START THIS NOW)
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start -c
```

### Terminal 3: Watch logs (optional)
Keep this terminal open to see Metro logs

---

## Important Notes

### Your Network Setup
- **Current IP**: `172.20.106.222`
- **Network Type**: Appears to be mobile hotspot or non-standard WiFi
- **IP Range**: `172.20.x.x` is typical for mobile hotspots

### If IP Changes Again
This will happen if:
- You reconnect to WiFi
- You switch networks
- Your router reassigns IP (DHCP)

**Quick fix when IP changes:**
1. Check new IP: `ipconfig | Select-String "IPv4"`
2. Update `FRONTEND/src/constants/config.js`
3. Restart both servers

**OR use tunnel mode** to avoid IP issues:
```bash
npx expo start --tunnel
```

---

## Files Updated

1. ✅ `FRONTEND/src/constants/config.js`
   - Updated API_URL to `http://172.20.106.222:3001/api`
   - Updated SOCKET_URL to `http://172.20.106.222:3001`

---

## What to Do Now

1. **Open new terminal**
2. **Run**: 
   ```bash
   cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
   npx expo start -c
   ```
3. **Scan QR code** with Expo Go app
4. **Test registration** on mobile device

---

## Expected Result

After starting Metro:
```
› Metro waiting on exp://172.20.106.222:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web
› Press r │ reload app
› Press m │ toggle menu

Logs for your project will appear below. Press Ctrl+C to exit.
```

**Then on your phone:**
- App should load
- Registration should work (no timeout)
- Backend should respond quickly

---

## Still Having Issues?

If Metro still won't connect after starting:

**Option 1: Use Tunnel (Recommended)**
```bash
npx expo start --tunnel -c
```
This will work even if network is complex.

**Option 2: Check Firewall**
```powershell
# Temporarily disable (test only)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable after testing
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

**Option 3: Use Android Emulator**
If you have Android Studio installed:
```bash
npx expo start --android
```
Emulator doesn't have network issues.

---

## Summary

✅ **Backend**: Running on http://172.20.106.222:3001  
⏳ **Frontend**: Ready to start  
✅ **Config**: Updated with new IP  
📱 **Next**: Start Metro and connect mobile device

---

**START METRO NOW:**
```bash
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start -c
```

🎉 **Everything is ready!**
