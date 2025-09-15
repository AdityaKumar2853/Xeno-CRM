#!/bin/bash

# Xeno CRM Deployment Script
echo "🚀 Starting Xeno CRM Deployment..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Git working directory is not clean. Please commit or stash changes first."
  exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Prepare for deployment"
git push origin main

echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🔧 Next Steps:"
echo "1. Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Deploy the backend folder"
echo "   - Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "2. Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to 'frontend'"
echo "   - Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "3. Update Google OAuth settings with your new domains"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
