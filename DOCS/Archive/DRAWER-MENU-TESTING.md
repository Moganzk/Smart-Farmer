# Drawer Menu Testing Guide

## How to Test the Fixed Drawer Menu

### 1. Open the Drawer Menu

**Method 1**: Swipe from the left edge of the screen
- Place finger on left edge
- Swipe right

**Method 2**: Tap the hamburger icon (☰)
- Usually located in the top-left corner of screens
- Tap to open drawer

### 2. Verify Header Section

Should display:
- ✅ Green header background
- ✅ Circular avatar with your initials (first letter of name)
- ✅ Your full name (e.g., "brownface bonventure")
- ✅ Your email (e.g., "brownfacebonventure@gmail.com")

**If showing "Guest User"**: 
- User data not loaded properly
- Check AuthContext logs

### 3. Verify Menu Items

Should see these items in order:

1. **🏠 Home**
   - Icon: house outline
   - Navigates to main dashboard with tabs

2. **👤 My Profile**
   - Icon: person outline
   - Navigates to your profile screen

3. **🔔 Notifications**
   - Icon: bell outline
   - Shows your notifications list

4. **⚙️ Settings**
   - Icon: gear outline
   - App settings and preferences

5. **ℹ️ About**
   - Icon: info circle outline
   - About the app information

### 4. Verify Footer Section

At the bottom:
- ✅ Red "Logout" button with exit icon
- ✅ "Smart Farmer v1.0.0" version text

### 5. Test Navigation

**Test Each Menu Item:**

```javascript
// Expected navigation flow:

Home → HomeScreen with bottom tabs
My Profile → ProfileScreen (we just fixed this!)
Notifications → NotificationsScreen with navigation fixes
Settings → SettingsScreen
About → AboutScreen
```

**Test Logout:**
1. Tap "Logout" button
2. Should show confirmation or immediately log out
3. Should return to Login screen
4. Token should be cleared

### 6. Test Drawer Behavior

**Opening:**
- ✅ Swipe from left works
- ✅ Hamburger icon works (if present)
- ✅ Smooth animation

**Closing:**
- ✅ Tap outside drawer (on overlay)
- ✅ Swipe left
- ✅ Navigate to a screen
- ✅ Back button/gesture

**Active State:**
- ✅ Currently selected item is highlighted (light green background)
- ✅ Active item has darker green text

### 7. Visual Checks

**Colors:**
- Header: Green (#2E7D32)
- Avatar background: Same green
- Avatar text: White
- Active item background: Light green (#60ad5e)
- Active item text: Dark green (#2E7D32)
- Inactive item text: Dark gray (#212121)
- Logout button: Red text (#F44336)

**Layout:**
- Header height: ~180px
- Drawer width: 280px
- Icons aligned left
- Text aligned with icons
- Proper spacing between items
- Footer stuck to bottom

### 8. Error Checks

**Watch Console For:**
```bash
# Should NOT see:
❌ "Cannot read property 'split' of undefined"
❌ "DrawerContent is not defined"
❌ "onPrimary is not defined"
❌ "Failed to load image"

# Should see (if debugging):
✅ "🔍 AuthContext: User loaded from database"
✅ User data in drawer header
```

### 9. Expected Console Output

When opening drawer with logged-in user:
```bash
LOG  🔍 AuthContext: User data: {
  "id": 19,
  "name": "brownface bonventure",
  "email": "brownfacebonventure@gmail.com",
  "phone": "+254706074187",
  "role": "farmer"
}
```

### 10. Troubleshooting

**Drawer is empty:**
- ❌ DrawerContent returning null → Fixed!
- ✅ Should now show full content

**User shows as "Guest User":**
- Check: `user` prop being passed correctly
- Check: AuthContext has user data
- Solution: Press `r` to reload

**Avatar shows "?":**
- User name is undefined
- Check AuthContext user mapping
- Should show first letter of name

**Navigation not working:**
- Check screen names match drawer config
- Check nested navigation for tabs
- Refer to FIXES-2025-10-07.md

**Logout not working:**
- Check logout function passed to DrawerContent
- Check AuthContext.logout() exists
- Should clear token and navigate to login

### 11. Success Criteria

✅ All tests pass:
- Drawer opens smoothly
- Header shows user info
- All 5 menu items visible
- Icons display correctly
- Navigation works for all items
- Logout button works
- Version shows at bottom
- No console errors

---

## Quick Test Commands

```bash
# Reload app
Press 'r' in Metro terminal

# Clear cache and reload (if needed)
Press 'Shift+r' in Metro terminal

# Check ADB connection
adb devices

# View logs
# Just watch the Metro terminal
```

---

## Test Results Template

```
Date: October 7, 2025
Tester: [Your Name]

DRAWER MENU TESTS:
[ ] Drawer opens
[ ] User info displays correctly
[ ] All 5 menu items visible
[ ] Home navigation works
[ ] Profile navigation works
[ ] Notifications navigation works
[ ] Settings navigation works
[ ] About navigation works
[ ] Logout button works
[ ] Version info shows
[ ] No console errors

NOTES:
_________________________________
_________________________________
_________________________________

STATUS: ✅ PASS / ❌ FAIL
```

---

**Ready to test!** Press `r` in Metro to reload and try opening the drawer menu! 🎉
