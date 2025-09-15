# Vercel Domain Setup for Stable OAuth

## 🎯 **Problem Solved**
Vercel generates new subdomains for each deployment (like `xeno-crm-v5-31mxdvabo-aditya-kumars-projects-9c44bbfe.vercel.app`), which breaks OAuth configuration.

## ✅ **Solution: Use Stable Vercel Domain**

### **Step 1: Configure Vercel Project**
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project "Xeno-CRM"
3. Go to **Settings** → **Domains**
4. Ensure `xeno-crm-v5.vercel.app` is set as your **Production Domain**
5. If not, add it as a domain

### **Step 2: Update Google OAuth Configuration**
In your [Google Cloud Console](https://console.cloud.google.com/):

**Authorized JavaScript Origins:**
- `https://xeno-crm-v5.vercel.app`
- `http://localhost:3000`

**Authorized Redirect URIs:**
- `https://xeno-crm-v5.vercel.app`
- `http://localhost:3000`

### **Step 3: Deploy the Changes**
The code has been updated to use the stable domain. Deploy these changes:

```bash
git add .
git commit -m "Configure stable Vercel domain for OAuth"
git push origin main
```

### **Step 4: Test**
1. Wait for Vercel to redeploy (2-5 minutes)
2. Go to `https://xeno-crm-v5.vercel.app`
3. Try Google login - it should work now!

## 🔄 **Future Deployments**
- All future deployments will automatically use `xeno-crm-v5.vercel.app`
- No need to update Google OAuth settings again
- OAuth will work consistently across all deployments

## 🚨 **If You Still Get Errors**
1. Clear your browser cache
2. Try in incognito mode
3. Check that `xeno-crm-v5.vercel.app` is your production domain in Vercel
4. Verify the URLs in Google Cloud Console match exactly
