# Authentication Update Guide

## Summary
All frontend components need to use `getAuthHeaders()` from `utils/auth.js` to send the Authorization header with API requests.

## Pattern to Follow

### 1. Import the utility
```javascript
import { getAuthHeaders } from '../../utils/auth';
```

### 2. Replace headers in fetch calls

**Before:**
```javascript
fetch(`${apiUrl}/endpoint`, {
  method: "GET",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
})
```

**After:**
```javascript
fetch(`${apiUrl}/endpoint`, {
  method: "GET",
  credentials: "include",
  headers: getAuthHeaders(),
})
```

### 3. For POST requests with body

**Before:**
```javascript
fetch(`${apiUrl}/endpoint`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
})
```

**After:**
```javascript
fetch(`${apiUrl}/endpoint`, {
  method: "POST",
  credentials: "include",
  headers: getAuthHeaders(),
  body: JSON.stringify(data),
})
```

## Files Already Updated
✅ App.jsx
✅ Auth.jsx  
✅ Profile.jsx
✅ Wardrobe.jsx
✅ utils/auth.js (created)

## Files That Need Updates

### High Priority (Authentication Required)
1. Shop/shomain.jsx (6 fetch calls)
2. Recommendations/Recommendations.jsx (5 fetch calls)
3. Planner/Planner.jsx (3 fetch calls)
4. Wishlist/Wishlist.jsx (2 fetch calls)
5. Chatbot/Chatbot.jsx (1 fetch call)

### Medium Priority (User Data)
6. Sellcloth/Sellcloth.jsx (4 fetch calls)
7. ShareClothes/ShareClothes.jsx (4 fetch calls)
8. message/message.jsx (4 fetch calls)
9. social_sharing/social_collections.jsx (1 fetch call)

### Lower Priority (May work without auth)
10. AR/AR_try.jsx (2 fetch calls)
11. AR/SavedAvatar.jsx (1 fetch call)
12. Image/Image.jsx (1 fetch call)
13. VirtualTryOn/ClothingMapper.jsx (1 fetch call)
14. Navbar/Navbar.jsx (1 fetch call)

## Quick Update Script

For each file:
1. Add import: `import { getAuthHeaders } from '../../utils/auth';`
2. Find all `fetch(` calls
3. Replace `headers: { "Content-Type": "application/json" }` with `headers: getAuthHeaders()`
4. Keep `credentials: "include"` as is

## Testing
After updates, test:
1. Login with email/password
2. Login with Google OAuth
3. Login with Facebook OAuth
4. Access protected routes (Profile, Wardrobe, Shop, etc.)
5. Check browser console for "Token found: Yes" in backend logs
