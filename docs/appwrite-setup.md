# Appwrite Setup Instructions

## Environment Variables

Before running the application, you need to set up your Appwrite project and update the environment variables in `.env`:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
```

## Required Collections

Create the following collections in your Appwrite database:

### 1. Teams Collection (ID: `teams`)

**Attributes:**
- `name` (string, required) - Team name
- `joinCode` (string, required, unique) - 6-character unique join code
- `ownerId` (string, required) - User ID of team owner

**Indexes:**
- `joinCode` (unique index on joinCode field)
- `ownerId` (index on ownerId field)

**Permissions:**
- Create: Users
- Read: Users
- Update: Users (with conditions for team members)
- Delete: Users (with conditions for team owner)

### 2. Team Members Collection (ID: `team_members`)

**Attributes:**
- `teamId` (string, required) - Reference to teams collection
- `userId` (string, required) - User ID of team member
- `role` (string, required) - Either "owner" or "member"
- `joinedAt` (datetime, required) - When user joined the team

**Indexes:**
- `teamId` (index on teamId field)
- `userId` (index on userId field)
- `teamId_userId` (unique compound index on teamId and userId)

**Permissions:**
- Create: Users
- Read: Users
- Update: Users (with conditions for team members)
- Delete: Users (with conditions for team owner)

### 3. Tasks Collection (ID: `tasks`)

**Attributes:**
- `teamId` (string, required, size: 255) - Reference to teams collection
- `title` (string, required, size: 255) - Task title
- `description` (string, optional, size: 1000) - Task description
- `status` (string, required, size: 50) - One of: "todo", "in_progress", "blocked", "done"
- `assignedTo` (string, required, size: 255) - User ID of assigned team member
- `createdBy` (string, required, size: 255) - User ID of task creator

**Indexes:**
- `teamId` (index on teamId field) - For efficient team-based queries
- `assignedTo` (index on assignedTo field) - For user-specific task queries
- `status` (index on status field) - For status-based filtering

**Permissions:**
- Create: Users
- Read: Users
- Update: Users (with conditions for team members)
- Delete: Users (with conditions for team members)

**Status Values:**
- `todo` - Tasks that haven't been started
- `in_progress` - Tasks currently being worked on
- `blocked` - Tasks that are blocked by dependencies or issues
- `done` - Completed tasks

**Real-time Features:**
- Automatic updates when tasks are created, updated, or deleted
- Live synchronization across all team members
- No additional configuration required

### 4. Messages Collection (ID: `messages`)

**Attributes:**
- `teamId` (string, required) - Reference to teams collection
- `userId` (string, optional) - User ID of message sender (null for system messages)
- `content` (string, required) - Message content
- `type` (string, required) - Either "user" or "system"

**Indexes:**
- `teamId` (index on teamId field)
- `createdAt` (index on $createdAt field for chronological ordering)

**Permissions:**
- Create: Users
- Read: Users
- Update: None (messages are immutable)
- Delete: Users (with conditions for team members)

## Authentication Setup

Enable Email/Password authentication in your Appwrite project settings.

## Real-time Setup

Real-time subscriptions are automatically enabled for all collections. No additional setup required.

## Collection Setup Troubleshooting

### Common Issues

#### Tasks Collection Not Found
**Error:** `Collection with the requested ID could not be found`
**Solution:** Create the tasks collection with ID `tasks` in your Appwrite database

#### Schema Attribute Missing
**Error:** `Attribute not found in schema: teamId`
**Solution:** Add the missing attribute to the tasks collection with the correct type and constraints

#### Permission Denied
**Error:** `Unauthorized access to tasks`
**Solution:** Verify that all permission levels (Create, Read, Update, Delete) are set to "Users"

#### Real-time Not Working
**Issue:** Tasks don't update in real-time
**Solution:** Ensure real-time is enabled in your Appwrite project settings (it's enabled by default)

### Setup Verification

After creating the collections, you can verify the setup by:

1. **Check Collection Exists:** Go to Database → Collections and verify all collections are present
2. **Verify Attributes:** Click on each collection and ensure all required attributes are configured
3. **Test Permissions:** Try creating a test document through the Appwrite console
4. **Check Indexes:** Verify that recommended indexes are created for better performance

### Development Testing

Use the built-in test data utility to populate your collections:

1. **Create Test Tasks:** Click "Add Test Tasks" in the Kanban board
2. **Verify Real-time:** Open multiple browser tabs to see real-time updates
3. **Test Status Changes:** Modify task statuses through the Appwrite console
4. **Check Error Handling:** Temporarily disable a collection to test error states

### Production Considerations

#### Security Rules
- Consider implementing more restrictive permissions based on team membership
- Add validation rules for task status values
- Implement rate limiting for task creation

#### Performance Optimization
- Monitor query performance and add additional indexes as needed
- Consider implementing pagination for teams with many tasks
- Set up database backups and monitoring

#### Scaling Considerations
- Plan for increased real-time connections as team size grows
- Consider implementing task archiving for completed tasks
- Monitor database storage usage and plan for growth