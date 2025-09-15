# Vercel Deployment Guide for Xeno CRM Frontend

## 🚀 **Step-by-Step Vercel Deployment**

### **Step 1: Get Your Railway Backend URL**
1. Go to your Railway dashboard
2. Click on your backend project
3. Go to the "Deployments" tab
4. Copy the **public URL** (it should look like: `https://your-project-name.railway.app`)

### **Step 2: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository: `AdityaKumar2853/Xeno-CRM`
4. Set the **Root Directory** to: `frontend`
5. Click **"Deploy"**

#### **Option B: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: xeno-crm-frontend
# - Directory: ./
```

### **Step 3: Configure Environment Variables**

In your Vercel dashboard:
1. Go to your project settings
2. Click **"Environment Variables"**
3. Add these variables:

```
NEXT_PUBLIC_API_URL = https://your-railway-backend-url.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID = your-google-client-id
```

### **Step 4: Update Google OAuth Settings**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add your Vercel domain to **Authorized JavaScript origins**:
   - `https://your-vercel-app.vercel.app`
   - `https://your-vercel-app.vercel.app/`
6. Add to **Authorized redirect URIs**:
   - `https://your-vercel-app.vercel.app/login`

### **Step 5: Redeploy**

After setting environment variables:
1. Go to Vercel dashboard
2. Click **"Redeploy"** on your latest deployment
3. Or push a new commit to trigger automatic deployment

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **API Connection Failed**
   - Check if `NEXT_PUBLIC_API_URL` is correct
   - Ensure Railway backend is running
   - Check CORS settings in backend

2. **Google OAuth Not Working**
   - Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
   - Check Google Console redirect URIs
   - Ensure domain is added to authorized origins

3. **Build Errors**
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

## 📊 **Expected Result**

After successful deployment:
- ✅ Frontend accessible at `https://your-app.vercel.app`
- ✅ Backend API calls working
- ✅ Google OAuth login functional
- ✅ All CRM features working

## 🔗 **Useful Links**

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
