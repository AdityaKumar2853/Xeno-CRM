# Google OAuth Troubleshooting Guide

## Current Issue
You're getting the error: "The given client ID is not found" when trying to sign in with Google.

## Root Cause
The Google OAuth Client ID needs to be properly configured in the Google Cloud Console with the correct redirect URIs and authorized domains.

## Step-by-Step Fix

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project (or create one if you don't have one)
- Go to "APIs & Services" > "Credentials"

### 2. Find Your OAuth 2.0 Client ID
- Look for: `7230563022-th5imecc10i0pgcv4esc0dke1v9s2pf2.apps.googleusercontent.com`
- Click on it to edit

### 3. Configure Authorized JavaScript Origins
Add these URLs to the "Authorized JavaScript origins" section:
```
http://localhost:3000
http://localhost
http://127.0.0.1:3000
http://127.0.0.1
```

### 4. Configure Authorized Redirect URIs
Add these URLs to the "Authorized redirect URIs" section:
```
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/
http://127.0.0.1:3000
http://127.0.0.1:3000/login
http://127.0.0.1:3000/
```

### 5. Enable Required APIs
Go to "APIs & Services" > "Library" and enable:
- Google+ API
- Google OAuth2 API
- Google Identity API

### 6. Save Changes
- Click "Save" in the Google Cloud Console
- Wait 5-10 minutes for changes to propagate

### 7. Test the Application
1. Open your browser and go to: `http://localhost:3000`
2. Click "Sign in with Google"
3. You should now see the Google Sign-In popup

## Alternative: Create a New OAuth Client ID

If the above doesn't work, create a new OAuth 2.0 Client ID:

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add the same origins and redirect URIs as above
5. Copy the new Client ID and update your `.env` file

## Debugging Information

The application now includes enhanced debugging. Check the browser console for:
- Google OAuth Client ID being loaded
- Current origin information
- Detailed error messages

## Common Issues

1. **"Client ID not found"**: OAuth client not properly configured in Google Cloud Console
2. **"Redirect URI mismatch"**: Redirect URIs not added to Google Cloud Console
3. **"Domain not authorized"**: JavaScript origins not added to Google Cloud Console
4. **"API not enabled"**: Required Google APIs not enabled

## Testing Checklist

- [ ] Google Cloud Console OAuth client configured
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] Required APIs enabled
- [ ] Changes saved and propagated (wait 5-10 minutes)
- [ ] Application restarted with new configuration
- [ ] Browser console shows correct Client ID
- [ ] Google Sign-In popup appears when clicking button

## Still Having Issues?

If you're still having problems after following these steps:

1. Check the browser console for specific error messages
2. Verify the Client ID in the console matches your Google Cloud Console
3. Try creating a new OAuth 2.0 Client ID
4. Make sure you're using the correct Google account in the Cloud Console
5. Check if your Google account has the necessary permissions

## Contact Information

If you need further assistance, please provide:
- Screenshot of the browser console errors
- Screenshot of your Google Cloud Console OAuth configuration
- Any specific error messages you're seeing
