# Vercel Deployment Troubleshooting Guide

## 🚨 **"Environment Variable references Secret" Error**

### **Problem:**
```
Environment Variable "NEXT_PUBLIC_API_URL" references Secret "next_public_api_url", which does not exist.
```

### **Root Cause:**
Vercel is interpreting your environment variable as a secret reference instead of a plain text value.

### **Solution Steps:**

#### **Step 1: Delete Current Project**
1. Go to Vercel dashboard
2. Find your project
3. Go to Settings → General
4. Click "Delete Project"
5. Confirm deletion

#### **Step 2: Create Fresh Project**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import: `AdityaKumar2853/Xeno-CRM`
4. Set **Root Directory**: `frontend`
5. **DO NOT** set environment variables yet

#### **Step 3: Deploy First (Without Environment Variables)**
1. Click "Deploy" without setting any environment variables
2. Wait for deployment to complete
3. Note the deployment URL

#### **Step 4: Add Environment Variables After Deployment**
1. Go to Project Settings → Environment Variables
2. Add these **exactly** as shown:

```
Key: NEXT_PUBLIC_API_URL
Value: https://xeno-crm-production.up.railway.app
```

```
Key: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: 0dke1v9s2pf2.apps.googleusercontent.com
```

3. **Important**: 
   - ✅ No `@` symbols
   - ✅ No quotes around values
   - ✅ Values are plain text
   - ✅ No secret references

#### **Step 5: Redeploy**
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Wait for completion

### **Alternative: Use Vercel CLI**

If dashboard keeps causing issues:

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://xeno-crm-production.up.railway.app

vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
# Enter: 0dke1v9s2pf2.apps.googleusercontent.com

# Redeploy
vercel --prod
```

### **What I Fixed in the Code:**

1. **Removed `env` section** from `next.config.js` - this was causing Vercel to interpret variables as secrets
2. **Simplified configuration** - environment variables are now handled directly by Next.js
3. **Removed `vercel.json`** - not needed for basic deployment

### **Expected Result:**
- ✅ No secret reference errors
- ✅ Environment variables work correctly
- ✅ Frontend connects to Railway backend
- ✅ Google OAuth works

### **If Still Having Issues:**
1. Check Vercel build logs for specific errors
2. Verify Railway backend is running
3. Test API endpoints directly
4. Check browser console for errors
