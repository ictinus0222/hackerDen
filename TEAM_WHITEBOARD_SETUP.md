# Team-Specific Whiteboard Setup Guide

## Overview
Each team gets their own private whiteboard per hackathon. Teams can collaborate on their own canvas without seeing other teams' work.

## Manual Appwrite Database Setup

### Step 1: Create the Collection

1. **Open Appwrite Console** → Go to your Appwrite dashboard
2. **Navigate to Databases** → Click on your database
3. **Create Collection**:
   - Click **"Create Collection"**
   - **Name**: `Whiteboard Objects`
   - **Collection ID**: `whiteboard_objects` (exactly this - the code expects this ID)
   - Click **"Create"**

### Step 2: Set Collection Permissions

1. **Click on your new collection**
2. **Go to Settings tab**
3. **Set Permissions**:
   - **Read**: `users` (authenticated users only)
   - **Create**: `users`
   - **Update**: `users` 
   - **Delete**: `users`
4. **Save**

### Step 3: Add Attributes (One by One)

Click **"Create Attribute"** for each of these **11 attributes**:

#### 1. Object Type
- **Type**: String
- **Key**: `type`
- **Size**: 50
- **Required**: ✅ Yes

#### 2. Team ID (NEW - for team isolation)
- **Type**: String
- **Key**: `teamId`
- **Size**: 50
- **Required**: ✅ Yes

#### 3. Hackathon ID (NEW - for hackathon isolation)
- **Type**: String
- **Key**: `hackathonId`
- **Size**: 50
- **Required**: ✅ Yes

#### 4. X Coordinate  
- **Type**: Float
- **Key**: `x`
- **Required**: ✅ Yes

#### 5. Y Coordinate
- **Type**: Float  
- **Key**: `y`
- **Required**: ✅ Yes

#### 6. Width
- **Type**: Float
- **Key**: `width`
- **Required**: ❌ No

#### 7. Height
- **Type**: Float
- **Key**: `height` 
- **Required**: ❌ No

#### 8. Color
- **Type**: String
- **Key**: `color`
- **Size**: 20
- **Required**: ❌ No

#### 9. Fill Color
- **Type**: String
- **Key**: `fillColor`
- **Size**: 20
- **Required**: ❌ No

#### 10. Stroke Width
- **Type**: Integer
- **Key**: `strokeWidth`
- **Required**: ❌ No

#### 11. Drawing Points
- **Type**: String
- **Key**: `points`
- **Size**: 10000
- **Required**: ❌ No

#### 12. Image URL
- **Type**: String
- **Key**: `imageUrl`
- **Size**: 100000
- **Required**: ❌ No

### Step 4: Verify Setup

After creating all attributes, your collection should have:
- ✅ **12 total attributes** (including teamId, hackathonId, and fillColor)
- ✅ Collection ID: `whiteboard_objects`
- ✅ Proper permissions set for authenticated users
- ✅ All attribute types match exactly

## How Team Isolation Works

### Database Filtering
- Each whiteboard object is tagged with `teamId` and `hackathonId`
- The app only loads objects matching the current team and hackathon
- Teams cannot see or interact with other teams' whiteboard data

### Real-time Sync
- Real-time updates are filtered by team and hackathon
- Only team members see each other's changes
- Complete privacy between teams

### Access Control
- Users must be part of a team to access the whiteboard
- If no team is found, users see a message to join/create a team
- Whiteboard is only accessible within hackathon workspaces

## Testing the Setup

1. **Start your dev server**: `npm run dev`
2. **Create or join a team** in a hackathon
3. **Navigate to whiteboard**: `/hackathon/{id}/whiteboard`
4. **Try drawing** - it should work and sync in real-time with team members
5. **Test with multiple teams** - each should have their own isolated canvas

## Troubleshooting

### "No Team Found" Message
- User needs to create or join a team first
- Go back to hackathon dashboard to manage team membership

### Objects Not Syncing
- Check that `teamId` and `hackathonId` attributes exist and are required
- Verify Appwrite real-time is enabled for your project
- Check browser console for any database errors

### Performance Issues
- Each team's whiteboard is isolated, so performance scales per team
- Large images may still impact performance - consider resizing before upload
- Monitor Appwrite usage if you have many active teams

## Database Schema Summary

```javascript
{
  "id": "unique_object_id",
  "type": "path" | "rectangle" | "circle" | "image",
  "teamId": "team_abc123",           // NEW: Isolates by team
  "hackathonId": "hackathon_xyz789", // NEW: Isolates by hackathon
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

This ensures complete isolation: **Team A in Hackathon 1** cannot see **Team B in Hackathon 1** or **Team A in Hackathon 2**.