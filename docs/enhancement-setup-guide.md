# HackerDen Enhancement Setup Guide

This guide walks you through setting up the HackerDen enhancement features on top of the existing MVP foundation.

## Quick Start

### 1. Prerequisites Check
Ensure you have the MVP working first:
```bash
# Verify MVP is running
npm run dev

# Check that you can:
# - Register/login users
# - Create and join teams
# - Create and manage tasks
# - Send chat messages
# - View real-time updates
```

**Note**: The enhancement foundation is complete with all collections and storage buckets configured. Core enhancement features are implemented and ready for use, with real-time integration and advanced features in active development.

### 2. Environment Configuration
Add enhancement-specific environment variables to your `.env` file:

```env
# Existing MVP variables (keep these)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id

# New: Required for enhancement setup script
APPWRITE_API_KEY=your-server-api-key

# Optional: Enhancement feature flags
VITE_ENABLE_FILE_SHARING=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_IDEA_BOARD=true
VITE_ENABLE_POLLING=true
VITE_ENABLE_BOT_FEATURES=true
VITE_ENABLE_SOUND_EFFECTS=true
VITE_ENABLE_ANIMATIONS=true
```

### 3. Install Enhancement Dependencies
```bash
# Install additional packages for enhancements
npm install react-markdown remark-gfm rehype-highlight
```

### 4. Run Enhancement Setup Script
```bash
# Create all enhancement collections and storage buckets
npm run setup:enhancements
```

This script creates:
- **10 new database collections** for enhancement features
- **2 storage buckets** for file uploads and custom emoji
- **Proper permissions** for team-based access control
- **Indexes** for optimal query performance

### 5. Verify Setup
```bash
# Run enhancement-specific tests
npm run test:run -- src/services/__tests__/enhancementServices.test.js

# Start development server with enhancements
npm run dev
```

## Feature-by-Feature Setup

### File Sharing System
**Collections Created:**
- `files` - File metadata and storage references
- `file_annotations` - Comments and annotations on files

**Storage Buckets:**
- `team-files` - Team file uploads (10MB limit per file)

**Verification:**
```bash
# Test file upload functionality
npm run test:run -- src/services/__tests__/fileService.test.js
```

### Idea Management & Voting
**Collections Created:**
- `ideas` - Team idea submissions with descriptions and tags
- `idea_votes` - Voting records for democratic decision-making

**Verification:**
```bash
# Test idea submission and voting
npm run test:run -- src/services/__tests__/ideaService.test.js
```

### Gamification System
**Collections Created:**
- `user_points` - Point tracking for various user actions
- `achievements` - Achievement records and badge unlocks

**Point System:**
- Task completion: 10 points
- Chat messages: 1 point each
- File uploads: 5 points each
- Idea submissions: 3 points each
- Votes given: 1 point each

**Verification:**
```bash
# Test point calculation and achievements
npm run test:run -- src/services/__tests__/gamificationService.test.js
```

### Judge Submission System
**Collections Created:**
- `submissions` - Hackathon judge submission data with public URLs

**Features:**
- Public submission pages (no authentication required)
- Auto-save functionality
- Project data aggregation from tasks and files

**Verification:**
```bash
# Test submission creation and public page generation
npm run test:run -- src/services/__tests__/submissionService.test.js
```

### Polling System
**Collections Created:**
- `polls` - Team polling system with multiple choice options
- `poll_votes` - Individual vote records with real-time updates

**Verification:**
```bash
# Test poll creation and voting
npm run test:run -- src/services/__tests__/pollService.test.js
```

### Reaction System
**Collections Created:**
- `reactions` - Emoji reactions for messages and tasks

**Storage Buckets:**
- `custom-emoji` - Custom emoji uploads (1MB limit per file)

**Verification:**
```bash
# Test reaction system
npm run test:run -- src/services/__tests__/reactionService.test.js
```

## Troubleshooting

### Setup Script Issues

#### "API Key Invalid" Error
```bash
# Verify your API key has the correct permissions
# In Appwrite Console:
# 1. Go to Settings > API Keys
# 2. Ensure your key has "Database", "Storage", and "Collections" scopes
# 3. Copy the key exactly (no extra spaces)
```

#### "Database Not Found" Error
```bash
# Ensure your database exists and ID is correct
# Check VITE_APPWRITE_DATABASE_ID in your .env file
```

#### "Permission Denied" Error
```bash
# Your API key needs admin permissions for setup
# Create a new API key with full permissions for setup
# You can use a restricted key for production
```

### File Upload Issues

#### "File Too Large" Error
- Maximum file size is 10MB for team files
- Maximum file size is 1MB for custom emoji
- Compress large files before uploading

#### "File Type Not Supported" Error
Supported file types:
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Documents**: PDF, TXT, MD, CSV
- **Code**: JS, TS, JSX, TSX, CSS, HTML, XML, JSON

### Real-time Update Issues

#### Updates Not Appearing
```bash
# Check browser console for WebSocket errors
# Verify Appwrite endpoint is accessible
# Test with multiple browser tabs/windows
```

#### Performance Issues
```bash
# Disable animations if needed
VITE_ENABLE_ANIMATIONS=false

# Reduce real-time subscriptions
# Check browser developer tools for memory usage
```

## Development Workflow

### Adding New Enhancement Features

1. **Define Data Model**
   ```javascript
   // Add to setup script: scripts/setup-enhancements.js
   const newCollection = {
     name: 'feature_name',
     attributes: [
       { key: 'teamId', type: 'string', required: true },
       // ... other attributes
     ]
   };
   ```

2. **Create Service Methods**
   ```javascript
   // Create: src/services/featureService.js
   export const createFeature = async (data) => {
     // Implementation with error handling
   };
   ```

3. **Add Tests**
   ```javascript
   // Create: src/services/__tests__/featureService.test.js
   describe('FeatureService', () => {
     // Comprehensive test coverage
   });
   ```

4. **Build UI Components**
   ```jsx
   // Use shadcn/ui components exclusively
   import { Card, Button, Dialog } from '@/components/ui';
   ```

### Testing Strategy

```bash
# Run all tests
npm run test

# Run specific enhancement tests
npm run test:run -- src/services/__tests__/enhancementServices.test.js

# Run with coverage
npm run test:coverage

# Test mobile responsiveness
npm run test:responsive
```

### Performance Monitoring

```bash
# Build and analyze bundle size
npm run build
npm run preview

# Check for memory leaks
# Use browser dev tools Performance tab
# Monitor WebSocket connections
```

## Production Deployment

### Environment Variables for Production
```env
# Production Appwrite endpoint
VITE_APPWRITE_ENDPOINT=https://your-production-appwrite.com/v1

# Production project and database IDs
VITE_APPWRITE_PROJECT_ID=prod-project-id
VITE_APPWRITE_DATABASE_ID=prod-database-id

# Feature flags for gradual rollout
VITE_ENABLE_FILE_SHARING=true
VITE_ENABLE_GAMIFICATION=false  # Disable for initial rollout
VITE_ENABLE_IDEA_BOARD=true
VITE_ENABLE_POLLING=true
VITE_ENABLE_BOT_FEATURES=false  # Enable after testing
```

### Gradual Feature Rollout
1. Deploy with core enhancements only (file sharing, idea board)
2. Monitor performance and user feedback
3. Gradually enable gamification and bot features
4. Full rollout after stability confirmation

### Monitoring and Maintenance
- Monitor Appwrite storage usage and costs
- Track real-time connection counts
- Monitor file upload success rates
- Review user engagement with gamification features

## Support

### Getting Help
1. **Documentation**: Check `docs/enhancement-foundation.md` for detailed technical information
2. **Tests**: Review test files for usage examples and expected behavior
3. **Appwrite Docs**: Consult [Appwrite documentation](https://appwrite.io/docs) for backend issues
4. **Community**: Check project issues and discussions

### Reporting Issues
When reporting enhancement-related issues, include:
- Steps to reproduce the problem
- Browser and device information
- Console error messages
- Network tab information for API failures
- Current feature flag settings

The enhancement setup transforms HackerDen from a functional tool into an engaging, gamified collaboration platform that makes hackathon participation more fun and productive.