# Network Errors Fix Guide - AxiosError: Network Error

## Current Status

You're seeing these errors:
```
ERROR  Error loading featured content: [AxiosError: Network Error]
ERROR  Error loading recent detections: [AxiosError: Network Error]
ERROR  Error fetching group details: [AxiosError: Network Error]
ERROR  Error creating group: [AxiosError: Network Error]
```

## Root Cause

**The backend server is NOT running!** 🚫

The frontend is trying to connect to `http://localhost:3001/api` but nothing is listening on that port.

---

## Solution 1: Start the Backend Server (Recommended)

### Step 1: Check if Backend is Running

Open a new terminal and run:
```bash
# PowerShell
netstat -ano | findstr :3001

# Should show something like:
# TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING       12345
```

If nothing appears, the backend is **NOT running**.

### Step 2: Start the Backend

**Option A: Using the backend terminal**
```bash
cd C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND
npm start
```

**Option B: Using npm scripts**
```bash
cd BACKEND
npm run dev
```

### Step 3: Verify Backend is Running

You should see:
```bash
✓ Server running on port 3001
✓ Database connected
✓ Ready to accept requests
```

### Step 4: Test Backend Endpoint

In PowerShell:
```powershell
curl http://localhost:3001/api/auth/test
```

Or in browser:
```
http://localhost:3001/api/auth/test
```

Should return a response (not "connection refused").

### Step 5: Verify ADB Port Forwarding

```bash
adb reverse tcp:3001 tcp:3001
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

### Step 6: Reload App

Press `r` in Metro terminal.

---

## Solution 2: Add Missing Backend Endpoints (If Backend is Running)

If the backend **IS** running but you still get errors, some endpoints are missing.

### Missing Endpoint: `/api/advisory/featured`

**File**: `BACKEND/src/routes/advisory.js`

Add this route:
```javascript
// Get featured advisory content
router.get('/featured', auth, asyncHandler(controller.getFeatured));
```

**File**: `BACKEND/src/controllers/advisory/advisory.controller.js`

Add this function:
```javascript
exports.getFeatured = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const query = `
      SELECT 
        id, title, content, category, 
        image_url, created_at
      FROM advisory_content
      WHERE is_published = true
      ORDER BY views DESC, created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching featured advisory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured advisory content'
    });
  }
};
```

---

## Solution 3: Suppress Network Errors (Quick Fix)

If you want the app to work **without** the backend for now:

### Update Error Logging to be Silent

**File**: `FRONTEND/src/screens/home/HomeScreen.js`

Change:
```javascript
} catch (error) {
  console.error('Error loading featured content:', error);
  setFeaturedContent([]);
}
```

To:
```javascript
} catch (error) {
  // Silent fail - backend not required for core features
  if (__DEV__) {
    console.warn('Featured content unavailable (backend offline)');
  }
  setFeaturedContent([]);
}
```

Do the same for other network calls.

---

## Understanding the Network Errors

### Which Endpoints Are Called?

**From HomeScreen:**
1. ✅ `/api/advisory/featured` - **MISSING** (needs to be added)
2. ✅ `/api/diseases/history` - **EXISTS** (but backend not running)

**From GroupsScreen:**
3. ✅ `/api/groups` - **EXISTS** (but backend not running)
4. ✅ `/api/groups/:id` - **EXISTS** (but backend not running)

**From NotificationsScreen:**
5. ✅ `/api/notifications` - **EXISTS** (but backend not running)

### Are These Errors Critical?

**NO!** The app handles them gracefully:

```javascript
catch (error) {
  console.error('Error:', error);
  setData([]); // ← Sets empty array as fallback
}
```

The app will:
- ✅ Still navigate
- ✅ Still show UI
- ✅ Still function for auth
- ❌ Just won't show server data

---

## Quick Decision Tree

```
Are you getting Network Errors?
│
├─ YES → Is backend server running?
│   │
│   ├─ NO → Start backend with `npm start` in BACKEND folder
│   │   └─ Still errors? → Check ADB port forwarding
│   │
│   └─ YES → Is endpoint implemented?
│       │
│       ├─ NO → Add the endpoint OR ignore (app works anyway)
│       │
│       └─ YES → Check ADB forwarding
│           └─ Check API_URL in config
│
└─ NO → You're good! 🎉
```

---

## Testing Backend Connection

### Test Script

Create: `BACKEND/test-connection.js`

```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running! Status: ${res.statusCode}`);
});

req.on('error', (error) => {
  console.error('❌ Backend is NOT running:', error.message);
});

req.end();
```

Run:
```bash
node test-connection.js
```

---

## Commands Reference

### Start Backend
```bash
# Navigate to backend
cd C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND

# Install dependencies (first time only)
npm install

# Start server
npm start
# OR for development with auto-restart
npm run dev
```

### Check Backend Status
```powershell
# PowerShell
netstat -ano | findstr :3001

# Should show TCP listening on 3001
```

### Check ADB Port Forwarding
```bash
adb reverse --list

# Should show:
# tcp:3001 -> tcp:3001
# tcp:8081 -> tcp:8081
# tcp:19000 -> tcp:19000
```

### Restart ADB Forwarding
```bash
adb kill-server
adb start-server
adb devices
adb reverse tcp:3001 tcp:3001
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

### View Backend Logs
```bash
# If running in terminal, logs show automatically

# If running as service, check logs folder
cd BACKEND/logs
dir
type error.log
```

---

## Expected vs Actual Behavior

### ✅ Expected (Backend Running)
```bash
LOG  📡 Loading featured content...
LOG  ✅ Featured content loaded: 5 items
LOG  📡 Loading recent detections...
LOG  ✅ Recent detections loaded: 3 items
```

### ⚠️ Current (Backend NOT Running)
```bash
ERROR  Error loading featured content: [AxiosError: Network Error]
ERROR  Error loading recent detections: [AxiosError: Network Error]
# App still works, just shows empty states
```

---

## Backend Startup Checklist

- [ ] Navigate to BACKEND folder
- [ ] Run `npm install` (first time)
- [ ] Check `.env` file exists
- [ ] Run `npm start` or `npm run dev`
- [ ] See "Server running on port 3001"
- [ ] Test: `curl http://localhost:3001/api/auth/test`
- [ ] Setup ADB forwarding: `adb reverse tcp:3001 tcp:3001`
- [ ] Reload app: Press `r` in Metro
- [ ] Verify: No more network errors!

---

## Summary

### The Issue
Backend server is **not running** → Frontend can't connect → Network Errors

### The Fix
**Option 1**: Start the backend (best for full functionality)
```bash
cd BACKEND
npm start
```

**Option 2**: Ignore the errors (app still works for auth)
- The errors are non-critical
- App handles them gracefully
- Core features (auth, profile, navigation) work fine

**Option 3**: Add missing endpoints (only if needed)
- Add `/api/advisory/featured` route
- Restart backend

### Recommended Action
**Start the backend server!** It takes 30 seconds and gives you full functionality.

```bash
# In a new terminal:
cd C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND
npm start
```

Then press `r` in Metro to reload the app. Network errors will disappear! 🎉

---

## Still Having Issues?

1. **Check firewall**: Windows Firewall might be blocking port 3001
2. **Check antivirus**: Some AV software blocks localhost connections
3. **Check .env file**: Make sure DATABASE_URL and PORT are set
4. **Check database**: Make sure PostgreSQL is running
5. **Check logs**: Look at `BACKEND/logs/error.log`

---

**Bottom line**: The Network Errors are because the backend isn't running. Start it, and they'll go away! 🚀
