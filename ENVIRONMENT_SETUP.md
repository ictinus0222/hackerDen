# Environment Setup Guide

## Quick Fix for WebSocket and Trim Errors

The errors you're experiencing are likely due to missing or incorrect environment variables. Follow these steps to fix them:

## 1. Create Environment File

Create a `.env` file in your project root with the following content:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
VITE_APPWRITE_DATABASE_ID=your-database-id-here
```

## 2. Get Your Appwrite Configuration

1. **Go to your Appwrite Console**: https://cloud.appwrite.io/console
2. **Select your project**
3. **Get Project ID**: 
   - Go to Settings → Overview
   - Copy the Project ID
4. **Get Database ID**:
   - Go to Databases
   - Select your database or create a new one
   - Copy the Database ID

## 3. Update Your .env File

Replace the placeholder values in your `.env` file:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6890352... # Your actual project ID
VITE_APPWRITE_DATABASE_ID=6890361... # Your actual database ID
```

## 4. Restart Your Development Server

After updating the `.env` file:

```bash
npm run dev
```

## Common Issues Fixed

### ❌ "n.trim is not a function" Error
- **Cause**: Missing user authentication data or undefined parameters
- **Fixed**: Added proper validation in vault service and hooks

### ❌ WebSocket Connection Failed
- **Cause**: Missing or incorrect environment variables
- **Fixed**: Enhanced error messages and validation in Appwrite configuration

### ❌ Realtime Disconnections
- **Cause**: Network issues or invalid channel subscriptions
- **Fixed**: Added better error handling and retry logic in realtime service

## Troubleshooting

If you're still experiencing issues:

1. **Check Browser Console**: Look for specific error messages
2. **Verify Environment Variables**: Make sure all required variables are set
3. **Check Network**: Ensure you can access https://cloud.appwrite.io/v1
4. **Restart Browser**: Clear cache and restart your browser
5. **Check Appwrite Status**: Visit https://status.appwrite.io/ for service status

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APPWRITE_ENDPOINT` | Appwrite server endpoint | `https://cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Your project identifier | `6890352abc123def456` |
| `VITE_APPWRITE_DATABASE_ID` | Your database identifier | `6890361xyz789ghi012` |

## Next Steps

After setting up your environment:

1. **Test the connection**: Check if WebSocket errors are resolved
2. **Try creating a task**: Test if the trim errors are fixed
3. **Check real-time sync**: Verify that updates sync across browser tabs
4. **Test vault features**: Try creating secrets in the team vault

If you continue to experience issues, please check the browser console for specific error messages and refer to the troubleshooting section above.


