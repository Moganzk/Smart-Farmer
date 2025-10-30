# 🔴 NETWORK ERRORS - COMPLETE FIX

## Current Issue
```
ERROR  Error loading featured content: [AxiosError: Network Error]
ERROR  Error loading recent detections: [AxiosError: Network Error]
ERROR  Error fetching group details: [AxiosError: Network Error]
```

## Root Cause Found ✅

1. ✅ **Backend IS running** (port 3001 already in use - good!)
2. ❌ **ADB device NOT connected** (no devices found)
3. ❌ **Port forwarding NOT set up**

---

## SOLUTION: Connect Your Phone via ADB

### Step 1: Enable USB Debugging on Your Phone

**On your Infinix phone:**
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (enables Developer Options)
3. Go back to **Settings** → **System** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **USB Debugging (Security Settings)** (if available)

### Step 2: Connect Phone to Computer

1. Connect your phone via USB cable
2. On your phone, you'll see a prompt: **"Allow USB debugging?"**
3. Tap **"Always allow from this computer"**
4. Tap **"OK"**

### Step 3: Verify Connection

Run in PowerShell:
```powershell
adb devices
```

**Should show:**
```
List of devices attached
ABCD1234567890    device
```

**If shows "unauthorized":**
- Check your phone screen for the prompt
- Tap "Always allow"
- Run `adb devices` again

**If shows nothing:**
- Unplug and replug USB cable
- Try a different USB port
- Try a different USB cable
- Restart ADB: `adb kill-server` then `adb start-server`

### Step 4: Setup Port Forwarding

Once device is connected:
```powershell
adb reverse tcp:3001 tcp:3001
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

**Should show:**
```
3001
8081
19000
```

### Step 5: Verify Port Forwarding

```powershell
adb reverse --list
```

**Should show:**
```
tcp:3001 -> tcp:3001
tcp:8081 -> tcp:8081
tcp:19000 -> tcp:19000
```

### Step 6: Reload App

In Metro terminal, press **`r`** to reload.

**Network errors should disappear!** 🎉

---

## Alternative: Use WiFi ADB (No USB Cable)

If you don't have a USB cable handy:

### Option 1: WiFi ADB (Android 11+)

1. **On phone**: Settings → Developer Options → Wireless debugging → ON
2. **On phone**: Tap "Wireless debugging" → See IP address and port (e.g., 192.168.100.22:12345)
3. **On computer**:
   ```powershell
   adb pair 192.168.100.22:12345
   # Enter pairing code from phone
   
   adb connect 192.168.100.22:12345
   ```

### Option 2: Change API URL to Use WiFi

If ADB is too complicated, change the API URL:

**File**: `FRONTEND/src/constants/config.js`

Change:
```javascript
export const API_URL = 'http://localhost:3001/api';
```

To:
```javascript
// Use your computer's IP address on the network
export const API_URL = 'http://192.168.100.X:3001/api';
```

**To find your IP:**
```powershell
ipconfig | findstr IPv4
```

Look for something like: `192.168.100.42`

Then update config:
```javascript
export const API_URL = 'http://192.168.100.42:3001/api';
```

**Important:** Your phone and computer must be on the same WiFi network!

---

## Quick Troubleshooting

### "adb: command not found"

ADB is not installed or not in PATH.

**Fix:**
1. Make sure Android Studio is installed
2. Add ADB to PATH:
   ```
   C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
   ```

Or use full path:
```powershell
C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

### "no devices/emulators found"

Your phone is not connected.

**Fix:**
- Connect USB cable
- Enable USB debugging
- Accept prompt on phone
- Try `adb devices` again

### "device unauthorized"

You haven't accepted the USB debugging prompt.

**Fix:**
- Check your phone screen
- Accept the prompt
- Run `adb devices` again

### "ECONNREFUSED" or "Network Error"

Port forwarding not set up.

**Fix:**
```powershell
adb reverse tcp:3001 tcp:3001
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

### "EADDRINUSE: address already in use"

Backend is already running (this is GOOD!).

**Fix:**
- Nothing to fix!
- Backend is running
- Just set up ADB forwarding

---

## Step-by-Step Checklist

- [ ] USB debugging enabled on phone
- [ ] Phone connected to computer via USB
- [ ] USB debugging prompt accepted on phone
- [ ] `adb devices` shows your device
- [ ] Port forwarding set up with `adb reverse`
- [ ] Ports verified with `adb reverse --list`
- [ ] App reloaded with `r` in Metro
- [ ] No more network errors!

---

## Expected Result

### Before (Current):
```bash
ERROR  Error loading featured content: [AxiosError: Network Error]
ERROR  Error loading recent detections: [AxiosError: Network Error]
```

### After (Fixed):
```bash
LOG  📡 Fetching featured content...
LOG  ✅ Featured content loaded
LOG  📡 Fetching recent detections...
LOG  ✅ Recent detections loaded
```

Or at least:
```bash
ERROR  Error loading featured content: [AxiosError: Request failed with status code 404]
```
(404 is better than Network Error - means connection works, just endpoint missing)

---

## Missing Endpoint Fix (Optional)

If you still get errors after ADB setup, add the missing endpoint:

**File**: `BACKEND/src/routes/advisory.js`

Add after line 17 (before other routes):
```javascript
// Get featured advisory content (for home screen)
router.get('/featured', auth, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  
  // Return empty array for now (or add real data later)
  res.json({
    success: true,
    data: []
  });
}));
```

Restart backend and reload app.

---

## Summary

**The Problem:**
- Backend IS running ✅
- ADB device NOT connected ❌
- Port forwarding NOT set up ❌

**The Solution:**
1. Connect phone via USB
2. Enable USB debugging
3. Accept prompt on phone
4. Run `adb reverse tcp:3001 tcp:3001`
5. Reload app

**Time needed:** 2-3 minutes

**Result:** Network errors disappear! 🎉

---

## Still Not Working?

If you've done everything and still get network errors:

1. **Check firewall**: Windows Firewall might block connections
2. **Check antivirus**: Some AV software blocks local connections
3. **Try WiFi instead**: Use computer's IP in config
4. **Check logs**: Look at backend terminal for errors
5. **Restart everything**:
   ```powershell
   adb kill-server
   adb start-server
   # Restart backend
   # Reload app
   ```

---

**Quick Action:** Connect your phone via USB, enable USB debugging, accept the prompt, run `adb reverse tcp:3001 tcp:3001`, and press `r` to reload! 📱🔌
