# GitHub OAuth Setup Guide

This guide explains how to set up GitHub OAuth authentication for HackerDen.

## Prerequisites

- Appwrite project with authentication enabled
- GitHub account
- Admin access to your Appwrite console

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: HackerDen (or your preferred name)
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:5173` for development)
   - **Authorization callback URL**: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/[PROJECT_ID]`
     - Replace `[PROJECT_ID]` with your Appwrite project ID
     - For self-hosted Appwrite, replace the domain accordingly

4. Click "Register application"
5. Note down the **Client ID** and generate a **Client Secret**

## Step 2: Configure Appwrite

1. Open your Appwrite console
2. Navigate to **Auth** → **Settings**
3. Scroll down to **OAuth2 Providers**
4. Find **GitHub** and click to configure
5. Enter your GitHub OAuth credentials:
   - **App ID**: Your GitHub Client ID
   - **App Secret**: Your GitHub Client Secret
6. Save the configuration

## Step 3: Update Environment Variables (if needed)

No additional environment variables are required for GitHub OAuth as it uses the same Appwrite configuration as Google OAuth.

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with GitHub"
4. You should be redirected to GitHub for authorization
5. After authorization, you'll be redirected back to HackerDen and logged in

## Troubleshooting

### Common Issues

1. **"OAuth app not found" error**
   - Verify your GitHub OAuth app is properly configured
   - Check that the callback URL matches exactly

2. **"Invalid redirect URI" error**
   - Ensure the callback URL in GitHub matches your Appwrite project
   - For development, make sure you're using the correct localhost port

3. **"Authentication failed" error**
   - Check your Appwrite project ID is correct
   - Verify the Client ID and Secret are properly configured in Appwrite
   - Ensure the GitHub OAuth app is not suspended

### Development vs Production

- **Development**: Use `http://localhost:5173` as the homepage URL
- **Production**: Use your actual domain (e.g., `https://hackerden.com`)

The callback URL should always point to your Appwrite instance, not your frontend application.

## Security Considerations

1. **Client Secret**: Keep your GitHub Client Secret secure and never expose it in frontend code
2. **Callback URL**: Ensure the callback URL is exactly as configured to prevent redirect attacks
3. **Scopes**: GitHub OAuth will request basic profile information by default
4. **Rate Limits**: Be aware of GitHub's API rate limits for OAuth applications

## Features Enabled

With GitHub OAuth enabled, users can:

- Sign in with their GitHub account
- Register new accounts using GitHub
- Access all HackerDen features without separate password management
- Maintain their GitHub profile information in HackerDen

## Next Steps

After setting up GitHub OAuth:

1. Test the authentication flow thoroughly
2. Consider adding additional OAuth providers (Discord, Microsoft, etc.)
3. Implement user profile synchronization if needed
4. Set up proper error handling for OAuth failures