# Heroku Deployment Guide

This guide covers deploying HippieKit to Heroku with two separate applications:
1. **Node.js API Server** (hippiekit-api)
2. **Python AI Service** (hippiekit-ai)

## Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Heroku account created
- Git repository initialized
- All environment variables ready

## Step 1: Create Heroku Apps

`ash
# Login to Heroku
heroku login

# Create Node.js API app
heroku create hippiekit-api

# Create Python AI service app
heroku create hippiekit-ai
`

## Step 2: Deploy Node.js API Server

### Configure Environment Variables

`ash
heroku config:set ATLAS_URL="your-mongodb-atlas-url" --app hippiekit-api
heroku config:set JWT_SECRET="your-jwt-secret" --app hippiekit-api
heroku config:set SENDGRID_API_KEY="your-sendgrid-key" --app hippiekit-api
heroku config:set APP_URL="https://hippiekit-api.herokuapp.com" --app hippiekit-api
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id" --app hippiekit-api
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret" --app hippiekit-api
heroku config:set WORDPRESS_BASE_URL="https://your-wordpress-site.com" --app hippiekit-api
heroku config:set WORDPRESS_USERNAME="your-wp-username" --app hippiekit-api
heroku config:set WORDPRESS_APP_PASSWORD="your-wp-app-password" --app hippiekit-api
`

### Deploy

`ash
# Navigate to server directory
cd server

# Initialize git if not already done
git init
git add .
git commit -m "Initial Heroku deployment"

# Add Heroku remote and deploy
heroku git:remote -a hippiekit-api
git push heroku main
`

## Step 3: Deploy Python AI Service

### Configure Environment Variables

`ash
heroku config:set PINECONE_API_KEY="your-pinecone-key" --app hippiekit-ai
heroku config:set PINECONE_ENVIRONMENT="your-pinecone-env" --app hippiekit-ai
heroku config:set PINECONE_INDEX_NAME="your-index-name" --app hippiekit-ai
`

### Deploy

`ash
# Navigate to Python AI service directory
cd python-ai-service

# Initialize git if not already done
git init
git add .
git commit -m "Initial Heroku deployment"

# Add Heroku remote and deploy
heroku git:remote -a hippiekit-ai
git push heroku main
`

## Step 4: Update Client Configuration

Create or update .env file in the client directory:

`env
VITE_API_URL=https://hippiekit-api.herokuapp.com
VITE_AI_SERVICE_URL=https://hippiekit-ai.herokuapp.com
`

## Step 5: Update Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your project > APIs & Services > Credentials
3. Update authorized redirect URIs:
   - Add: https://hippiekit-api.herokuapp.com/api/auth/google/callback
   - Add: capacitor://localhost (for mobile app)

## Step 6: Verify Deployment

### Test Node.js API

`ash
curl https://hippiekit-api.herokuapp.com/
# Expected: {"message":"API is running..."}

# Check logs
heroku logs --tail --app hippiekit-api
`

### Test Python AI Service

`ash
curl https://hippiekit-ai.herokuapp.com/
# Expected: Python API response

# Check logs
heroku logs --tail --app hippiekit-ai
`

## Post-Deployment Checklist

- [ ] Verify MongoDB Atlas connection (check server logs)
- [ ] Test authentication endpoints
- [ ] Test Google OAuth flow
- [ ] Test email verification (SendGrid)
- [ ] Test AI search functionality
- [ ] Test favorites functionality
- [ ] Update mobile app API URLs in Capacitor config
- [ ] Test mobile app with production APIs

## Environment Variables Reference

### Node.js API (hippiekit-api)
- ATLAS_URL - MongoDB Atlas connection string
- JWT_SECRET - Secret for JWT token signing
- SENDGRID_API_KEY - SendGrid API key for emails
- APP_URL - Base URL of the API (for CORS)
- GOOGLE_CLIENT_ID - Google OAuth client ID
- GOOGLE_CLIENT_SECRET - Google OAuth client secret
- WORDPRESS_BASE_URL - WordPress site URL
- WORDPRESS_USERNAME - WordPress username
- WORDPRESS_APP_PASSWORD - WordPress application password
- PORT - Auto-set by Heroku

### Python AI Service (hippiekit-ai)
- PINECONE_API_KEY - Pinecone vector database API key
- PINECONE_ENVIRONMENT - Pinecone environment
- PINECONE_INDEX_NAME - Pinecone index name
- PORT - Auto-set by Heroku

## Troubleshooting

### Build Failures

**Node.js API:**
`ash
# Check if TypeScript compiled successfully
heroku run "ls -la dist/" --app hippiekit-api

# Check build logs
heroku logs --tail --app hippiekit-api
`

**Python AI:**
`ash
# Check if dependencies installed
heroku run "pip list" --app hippiekit-ai

# Check Python version
heroku run "python --version" --app hippiekit-ai
`

### Database Connection Issues

`ash
# Test MongoDB connection
heroku run "node -e 'console.log(process.env.ATLAS_URL)'" --app hippiekit-api

# Check if IP is whitelisted in MongoDB Atlas
# Add 0.0.0.0/0 to Atlas Network Access for Heroku
`

### CORS Issues

If getting CORS errors:
1. Verify APP_URL is set correctly
2. Check that client is using VITE_API_URL from environment
3. Review server logs for origin rejections

### OAuth Issues

If Google OAuth fails:
1. Verify redirect URI in Google Console matches Heroku URL
2. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
3. Ensure APP_URL is correct

## Scaling

### Node.js API
`ash
# Scale to multiple dynos
heroku ps:scale web=2 --app hippiekit-api

# Check dyno status
heroku ps --app hippiekit-api
`

### Python AI Service
`ash
# Scale to multiple dynos
heroku ps:scale web=2 --app hippiekit-ai

# Monitor performance
heroku ps --app hippiekit-ai
`

## Updating Deployment

When you make changes:

`ash
# Node.js API
cd server
git add .
git commit -m "Update description"
git push heroku main

# Python AI Service
cd python-ai-service
git add .
git commit -m "Update description"
git push heroku main
`

## Monitoring

`ash
# View logs
heroku logs --tail --app hippiekit-api
heroku logs --tail --app hippiekit-ai

# View metrics (requires paid dyno)
heroku ps:metrics --app hippiekit-api
`

## Cost Optimization

- Use Eco dynos for development (\$5/month)
- Upgrade to Basic/Standard for production
- Consider Heroku Postgres add-on if needed
- Monitor dyno hours and scale as needed

## Additional Resources

- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/deploying-nodejs)
- [Heroku Python Deployment](https://devcenter.heroku.com/articles/deploying-python)
- [Managing Config Vars](https://devcenter.heroku.com/articles/config-vars)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)
