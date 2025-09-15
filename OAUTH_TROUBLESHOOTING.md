# Google OAuth Troubleshooting Guide

## Current Issue: origin_mismatch Error

The error `origin_mismatch` occurs when the Google OAuth configuration doesn't match the current deployment URL.

## Current Vercel URL
```
https://xeno-crm-v5-31mxdvabo-aditya-kumars-projects-9c44bbfe.vercel.app
```

## Required Google OAuth Configuration

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add these authorized origins:
   - `https://xeno-crm-v5-31mxdvabo-aditya-kumars-projects-9c44bbfe.vercel.app`
   - `https://xeno-crm-v5.vercel.app`
   - `http://localhost:3000` (for development)

### 2. Vercel Environment Variables
Set these in your Vercel dashboard:
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Same as above
- `DATABASE_URL`: Your Railway database URL

### 3. Code Changes Made
- Updated `googleOAuthConfig` with proper origin validation
- Added comprehensive error logging
- Fixed Prisma client configuration
- Added proper OAuth initialization parameters

## Testing Steps
1. Verify Google OAuth configuration in Google Cloud Console
2. Check Vercel environment variables
3. Test login flow
4. Check browser console for detailed error logs
5. Verify database connection via `/api/debug/database`

## Common Issues
- **origin_mismatch**: Google OAuth origins not configured correctly
- **Database connection**: Prisma client not configured with correct DATABASE_URL
- **Environment variables**: Missing or incorrect environment variables in Vercel
