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
- `teamId` (string, required) - Reference to teams collection
- `title` (string, required) - Task title
- `description` (string, optional) - Task description
- `status` (string, required) - One of: "todo", "in_progress", "blocked", "done"
- `assignedTo` (string, required) - User ID of assigned team member
- `createdBy` (string, required) - User ID of task creator

**Indexes:**
- `teamId` (index on teamId field)
- `assignedTo` (index on assignedTo field)
- `status` (index on status field)

**Permissions:**
- Create: Users
- Read: Users
- Update: Users (with conditions for team members)
- Delete: Users (with conditions for team members)

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