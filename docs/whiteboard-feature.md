# Real-time Collaborative Whiteboard Feature

## Overview
A real-time, multi-user collaborative whiteboard application built with HTML Canvas and Appwrite for real-time synchronization. Each team gets their own private whiteboard per hackathon where team members can draw, add shapes, and paste images together on a shared infinite canvas.

## Features

### Core Functionality
- **Infinite Canvas**: Pan and zoom around a large drawing area
- **Real-time Collaboration**: All changes sync instantly across all connected users
- **Drawing Tools**: Freeform pen tool with customizable color and stroke width
- **Shape Tools**: Rectangle and circle shapes
- **Image Support**: Upload images or paste from clipboard
- **Object Manipulation**: Select, move, resize, and delete objects

### Tools Available
1. **Select/Move Tool** (↖️): Select and manipulate existing objects
2. **Pen Tool** (✏️): Freeform drawing with customizable properties
3. **Pan Tool** (✋): Navigate around the canvas
4. **Shape Tools**: Add rectangles (⬜) and circles (⭕)
5. **Image Tool** (📷): Upload images from files
6. **Delete Tool** (🗑️): Remove selected objects

### Canvas Controls
- **Panning**: Click and drag with pan tool or middle mouse button
- **Zooming**: Mouse wheel to zoom in/out
- **Reset View**: Button to return to 100% zoom and center position

## Technical Implementation

### Technology Stack
- **Frontend**: React with HTML5 Canvas
- **Backend**: Appwrite Database with real-time subscriptions
- **Styling**: Tailwind CSS

### Database Schema
The whiteboard uses an Appwrite collection called `whiteboard_objects` with the following structure:

```javascript
{
  "id": "unique_object_id",
  "type": "path" | "rectangle" | "circle" | "image",
  "teamId": "team_id_here",
  "hackathonId": "hackathon_id_here", 
  "x": 150,
  "y": 200,
  "width": 100,
  "height": 100,
  "color": "#FF0000",
  "strokeWidth": 5,
  "points": "[{\"x\": 10, \"y\": 15}, {\"x\": 12, \"y\": 18}]",
  "imageUrl": "data:image/..."
}
```

Each whiteboard is isolated per team per hackathon, ensuring teams can collaborate privately on their own canvas.

### Real-time Synchronization
- Uses Appwrite's real-time subscriptions to listen for database changes
- All drawing actions are immediately saved to the database
- Changes from other users appear instantly on all connected canvases

## Setup Instructions

### 1. Install Dependencies
```bash
npm install dotenv
```

### 2. Setup Appwrite Collection
Run the setup script to create the required database collection:
```bash
npm run setup:whiteboard
```

This will create the `whiteboard_objects` collection with all necessary attributes.

### 3. Access the Whiteboard
Navigate to `/whiteboard` in your application to start using the collaborative whiteboard.

## Usage Guide

### Getting Started
1. Navigate to `/whiteboard`
2. Select a tool from the floating toolbar
3. Start drawing, adding shapes, or uploading images
4. Share the URL with team members for real-time collaboration

### Drawing
1. Select the Pen Tool (✏️)
2. Choose your color and stroke width
3. Click and drag on the canvas to draw

### Adding Shapes
1. Click the Rectangle (⬜) or Circle (⭕) button
2. Shapes appear at the center of your current view
3. Use the Select tool to move and resize them

### Adding Images
- **File Upload**: Click the "📷 Add Image" button and select a file
- **Clipboard Paste**: Copy an image and press Ctrl+V (or Cmd+V on Mac)

### Navigation
- **Pan**: Select the Pan tool (✋) and drag, or use middle mouse button
- **Zoom**: Use mouse wheel to zoom in/out
- **Reset**: Click the "Reset" button to return to default view

### Object Management
1. Select the Select/Move tool (↖️)
2. Click on any object to select it
3. Drag to move, or click Delete (🗑️) to remove

## File Structure
```
src/
├── components/
│   └── Whiteboard.jsx          # Main whiteboard component
├── pages/
│   └── WhiteboardPage.jsx      # Whiteboard page wrapper
└── lib/
    └── appwrite.js             # Appwrite configuration

scripts/
└── setup-whiteboard.js        # Database setup script

docs/
└── whiteboard-feature.md       # This documentation
```

## Performance Considerations
- Images are stored as base64 data URLs for simplicity
- For production use, consider using Appwrite Storage for large images
- Canvas rendering is optimized for smooth drawing experience
- Real-time updates are debounced to prevent excessive database writes

## Future Enhancements
- Text tool for adding labels
- Line tool for straight lines
- Layers support
- Export functionality (PNG, PDF)
- User cursors showing other participants
- Undo/Redo functionality
- Shape fill colors
- More advanced selection tools (multi-select, group operations)

## Troubleshooting

### Collection Setup Issues
If the setup script fails, manually create the collection in Appwrite console:
1. Go to your Appwrite console
2. Navigate to Databases → Your Database
3. Create a new collection named `whiteboard_objects`
4. Add the attributes as defined in the schema above

### Real-time Not Working
- Ensure your Appwrite project has real-time enabled
- Check that your environment variables are correctly set
- Verify network connectivity to Appwrite endpoint

### Performance Issues
- Large numbers of objects may slow down rendering
- Consider implementing object culling for better performance
- Reduce image sizes before uploading