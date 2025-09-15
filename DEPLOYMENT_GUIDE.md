# 🚀 Xeno CRM Deployment Guide

## Overview
This guide will help you deploy your Xeno CRM application to production using Vercel for the frontend and Railway for the backend.

## Architecture
- **Frontend (Next.js)**: Vercel
- **Backend (Node.js + Docker)**: Railway
- **Database (MySQL)**: Railway
- **Redis**: Railway

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your repository

### 1.2 Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your Xeno-CRM repository
4. Select the `backend` folder
5. Railway will automatically detect it's a Docker project

### 1.3 Configure Environment Variables
In Railway dashboard, add these environment variables:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=mysql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 1.4 Add MySQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "MySQL"
3. Railway will provide the DATABASE_URL automatically

### 1.5 Add Redis
1. In Railway dashboard, click "New"
2. Select "Database" → "Redis"
3. Railway will provide the REDIS_URL automatically

### 1.6 Run Database Migrations
1. In Railway dashboard, go to your backend service
2. Click "Deploy Logs"
3. Run: `npx prisma migrate deploy`

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your repository

### 2.2 Deploy Frontend
1. Click "New Project"
2. Import your Xeno-CRM repository
3. Set Root Directory to `frontend`
4. Framework Preset: Next.js
5. Click "Deploy"

### 2.3 Configure Environment Variables
In Vercel dashboard, add these environment variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Step 3: Update Google OAuth Settings

### 3.1 Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://your-frontend-url.vercel.app`
   - `https://your-frontend-url.vercel.app/login`

## Step 4: Update CORS Settings

### 4.1 Update Backend CORS
In your backend code, update CORS to allow your Vercel domain:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
};
```

## Step 5: Test Deployment

### 5.1 Test Backend
1. Visit your Railway backend URL
2. Test API endpoints: `https://your-backend-url.railway.app/api/customers`

### 5.2 Test Frontend
1. Visit your Vercel frontend URL
2. Test login functionality
3. Test all CRUD operations

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain to Vercel
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS settings

### 6.2 Add Custom Domain to Railway
1. In Railway dashboard, go to your backend service
2. Click "Settings" → "Domains"
3. Add your custom domain

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS settings in backend
   - Check environment variables

2. **Database Connection Issues**
   - Verify DATABASE_URL in Railway
   - Run migrations: `npx prisma migrate deploy`

3. **Google OAuth Issues**
   - Update authorized redirect URIs
   - Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names (case-sensitive)

### Useful Commands

```bash
# Test backend locally
docker-compose up backend

# Test frontend locally
cd frontend && npm run dev

# Check Railway logs
railway logs

# Check Vercel logs
vercel logs
```

## Cost Estimation

### Railway
- Backend: $5/month (Hobby plan)
- MySQL: $5/month
- Redis: $5/month
- **Total: ~$15/month**

### Vercel
- Frontend: Free (Hobby plan)
- **Total: $0/month**

### **Grand Total: ~$15/month**

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Railway and Vercel environment variables

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections

3. **API Security**
   - Implement rate limiting
   - Add request validation

## Monitoring

1. **Railway Metrics**
   - CPU, Memory, Network usage
   - Database performance

2. **Vercel Analytics**
   - Page views, performance
   - Error tracking

3. **Application Logs**
   - Backend logs in Railway
   - Frontend logs in Vercel

## Next Steps

1. Set up monitoring and alerts
2. Configure automated backups
3. Implement CI/CD pipeline
4. Add performance monitoring
5. Set up error tracking (Sentry)

---

**Need Help?**
- Railway Documentation: https://docs.railway.app
- Vercel Documentation: https://vercel.com/docs
- Prisma Documentation: https://www.prisma.io/docs
