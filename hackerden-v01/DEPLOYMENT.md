# Deployment Guide

## Netlify Deployment

This project is configured for easy deployment on Netlify.

### Option 1: Git-based Deployment (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Netlify will automatically detect the build settings from `netlify.toml`
6. Click "Deploy site"

### Option 2: Manual Deployment

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Drag and drop the `dist` folder to Netlify's deploy interface

### Build Settings

The project includes a `netlify.toml` file with the following configuration:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Environment Variables

When you add Appwrite integration later, you'll need to set these environment variables in Netlify:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`

### Verification

After deployment:
1. Visit your Netlify site URL
2. Verify the HackerDen V01 welcome page loads
3. Check that Tailwind CSS styling is applied correctly
4. Confirm the page is responsive on mobile devices