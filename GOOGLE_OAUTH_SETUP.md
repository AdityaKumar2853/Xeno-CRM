# Google OAuth Setup Instructions

## Current Issue
The Google OAuth is failing with a 400 error because the `GOOGLE_CLIENT_ID` is set to a placeholder value.

## Solution

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `http://localhost:3000/login` (for development)
7. Copy the Client ID

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory with:

```env
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

### Step 3: Rebuild and Restart

```bash
docker-compose down
docker-compose up --build -d
```

## Alternative: Use Test Login (Current Working Solution)

The test login bypass is currently working and will continue to work. You can use either:
1. Google OAuth (once properly configured)
2. Test Login button (always available)

## Current Status
- ✅ Test Login: Working
- ❌ Google OAuth: Needs proper client ID configuration
- ✅ All CRUD operations: Working
- ✅ Dashboard: Working with real data
