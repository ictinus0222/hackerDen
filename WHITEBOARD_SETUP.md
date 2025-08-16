# Whiteboard Setup Guide

## Quick Start

### 1. Install Dependencies
The whiteboard feature uses the existing Appwrite setup. Make sure you have your `.env` file configured with:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
```

### 2. Setup Database Collection
Run the setup script to create the required Appwrite collection:

```bash
npm run setup:whiteboard
```

This creates a collection called `whiteboard_objects` with all necessary attributes.

### 3. Access the Whiteboard
- Navigate to any hackathon workspace
- Click "Whiteboard" in the sidebar navigation
- Start collaborating in real-time!

## Features Available

### Drawing Tools
- **Pen Tool**: Freeform drawing with customizable color and stroke width
- **Select Tool**: Move, resize, and delete objects
- **Pan Tool**: Navigate around the infinite canvas

### Shapes
- **Rectangle**: Add rectangular shapes
- **Circle**: Add circular shapes

### Images
- **File Upload**: Click "Add Image" to upload from files
- **Clipboard Paste**: Copy any image and paste with Ctrl+V (Cmd+V on Mac)

### Navigation
- **Zoom**: Mouse wheel to zoom in/out
- **Pan**: Drag with pan tool or middle mouse button
- **Reset**: Return to default view

### Real-time Collaboration
- Each team gets their own private whiteboard per hackathon
- All changes sync instantly across team members
- See other team members' drawings appear in real-time
- No conflicts - everything is synchronized through Appwrite
- Teams cannot see other teams' whiteboards

## Troubleshooting

### Setup Script Fails
If the automated setup fails, manually create the collection:

1. Go to your Appwrite Console
2. Navigate to Databases → Your Database
3. Create a new collection named `whiteboard_objects`
4. Add these attributes:
   - `type` (String, 50 chars, required)
   - `teamId` (String, 50 chars, required)
   - `hackathonId` (String, 50 chars, required)
   - `x` (Float, required)
   - `y` (Float, required)
   - `width` (Float, optional)
   - `height` (Float, optional)
   - `color` (String, 20 chars, optional)
   - `strokeWidth` (Integer, optional)
   - `points` (String, 10000 chars, optional)
   - `imageUrl` (String, 2000 chars, optional)

### Real-time Not Working
- Check your Appwrite project has real-time enabled
- Verify your environment variables are correct
- Ensure network connectivity to Appwrite

### Performance Issues
- Large images may slow down the canvas
- Consider reducing image sizes before uploading
- Clear old whiteboard data if performance degrades

## Technical Details

The whiteboard is built with:
- **HTML5 Canvas** for rendering
- **React** for component management
- **Appwrite Database** for real-time data sync
- **Tailwind CSS** for styling

All drawing data is stored in Appwrite and synchronized in real-time across all connected users.