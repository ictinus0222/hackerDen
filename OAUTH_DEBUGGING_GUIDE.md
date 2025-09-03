# OAuth Authentication Debugging Guide

## 🚨 Current Issue: "User (role: guests) missing scopes"

This error indicates that Google OAuth completed successfully, but **Appwrite is not establishing an authenticated session**. The user remains in "guest" role instead of being properly authenticated.

## 🔍 Root Causes & Solutions

### 1. **Appwrite Project Configuration**

**Check your Appwrite Console:**

1. **Go to your Appwrite project dashboard**
2. **Navigate to Auth > Settings**
3. **Verify Google OAuth provider is enabled**
4. **Check OAuth redirect URLs are correct:**
   - Success URL: `http://localhost:5173/oauth/callback` (for dev)
   - Success URL: `https://yourdomain.com/oauth/callback` (for production)
   - Failure URL: `http://localhost:5173/login`

### 2. **Google OAuth Configuration**

**In Google Cloud Console:**

1. **Go to APIs & Credentials**
2. **Check OAuth 2.0 client configuration**
3. **Verify authorized redirect URIs include:**
   - `https://fra.cloud.appwrite.io/v1/oauth2/success`
   - `https://fra.cloud.appwrite.io/v1/oauth2/failure`

### 3. **Cookie/Session Issues**

**Common problems:**
- **SameSite cookie issues** in development
- **HTTPS requirements** for production
- **Domain mismatch** between OAuth and app domains

### 4. **Debugging Steps**

**Try this simplified OAuth flow:**

```javascript
// Test direct OAuth without callback page
const testOAuth = async () => {
  try {
    // This should redirect to Google and back to Appwrite's success handler
    await account.createOAuth2Session(
      'google',
      'http://localhost:5173/', // Direct to home page
      'http://localhost:5173/login'
    );
  } catch (error) {
    console.error('OAuth failed:', error);
  }
};
```

## 🛠️ Quick Fixes to Try

### Fix 1: Update OAuth Redirect URLs

```javascript
// Try redirecting directly to root instead of callback page
await account.createOAuth2Session(
  'google',
  `${window.location.origin}/`, // Direct to home
  `${window.location.origin}/login`
);
```

### Fix 2: Add Explicit Session Check

```javascript
// After OAuth redirect, check session immediately
window.addEventListener('load', async () => {
  try {
    const user = await account.get();
    if (user) {
      console.log('User authenticated:', user);
      // Redirect to dashboard
    }
  } catch (error) {
    console.log('No session found');
  }
});
```

### Fix 3: Environment Variable Check

**Verify your `.env` file:**
```
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68903528000fba941c6e
VITE_APPWRITE_DATABASE_ID=68903612000c89d5889b
```

## 🔧 Immediate Test

**Try this in your browser console after OAuth:**

```javascript
// Check if session exists
fetch('https://fra.cloud.appwrite.io/v1/account', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

## 📋 Next Steps

1. **Check Appwrite Console** OAuth configuration
2. **Verify Google Cloud Console** redirect URIs
3. **Try simplified OAuth** (direct redirect)
4. **Check browser cookies** after OAuth
5. **Test in incognito mode** to rule out cookie issues

The issue is likely in the Appwrite or Google OAuth configuration rather than the code logic.
