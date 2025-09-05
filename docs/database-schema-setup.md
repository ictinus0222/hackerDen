# Database Schema Setup Guide

This guide helps you set up the required database schema for HackerDen, including the missing "status" attributes.

## Error: "Unknown attribute: status"

If you're seeing this error, it means one or more collections are missing the "status" attribute in your Appwrite database schema.

## Required Collections and Attributes

### 1. Ideas Collection (`ideas`)

**Required Attributes:**
- `teamId` (String, required)
- `hackathonId` (String, required) 
- `title` (String, required)
- `description` (String, optional)
- `tags` (String Array, optional)
- **`status` (String, required)** ← This is likely missing
- `createdBy` (String, required)
- `voteCount` (Integer, default: 0)
- `createdAt` (DateTime, optional)
- `updatedAt` (DateTime, optional)

**Status Values:** `submitted`, `approved`, `in_progress`, `completed`, `rejected`

### 2. Tasks Collection (`tasks`)

**Required Attributes:**
- `teamId` (String, required)
- `hackathonId` (String, required)
- `title` (String, required)
- `description` (String, optional)
- **`status` (String, required)** ← Check if this exists
- `assignedTo` (String, optional)
- `assigned_to` (String, optional) - Display name
- `createdBy` (String, required)
- `created_by` (String, optional) - Display name
- `priority` (String, optional)
- `labels` (String Array, optional)

**Status Values:** `todo`, `in_progress`, `completed`, `blocked`

### 3. Hackathons Collection (`hackathons`)

**Required Attributes:**
- `name` (String, required)
- `description` (String, optional)
- `startDate` (DateTime, required)
- `endDate` (DateTime, required)
- **`status` (String, required)** ← Check if this exists
- `rules` (String Array, optional)
- `createdBy` (String, required)

**Status Values:** `upcoming`, `ongoing`, `completed`

## How to Add Missing Attributes

### Step 1: Access Appwrite Console
1. Go to your Appwrite console
2. Navigate to **Databases** → Your Database → **Collections**

### Step 2: Add Status Attribute to Ideas Collection
1. Click on the **`ideas`** collection
2. Go to the **Attributes** tab
3. Click **"Add Attribute"**
4. Select **"String"**
5. Configure:
   - **Key:** `status`
   - **Size:** 20
   - **Required:** Yes
   - **Default:** `submitted`
   - **Array:** No

### Step 3: Add Status Attribute to Tasks Collection (if missing)
1. Click on the **`tasks`** collection
2. Go to the **Attributes** tab
3. Click **"Add Attribute"**
4. Select **"String"**
5. Configure:
   - **Key:** `status`
   - **Size:** 20
   - **Required:** Yes
   - **Default:** `todo`
   - **Array:** No

### Step 4: Add Status Attribute to Hackathons Collection (if missing)
1. Click on the **`hackathons`** collection
2. Go to the **Attributes** tab
3. Click **"Add Attribute"**
4. Select **"String"**
5. Configure:
   - **Key:** `status`
   - **Size:** 20
   - **Required:** Yes
   - **Default:** `upcoming`
   - **Array:** No

## Quick Fix Script

If you have access to Appwrite CLI or server SDK, you can use this script to add the missing attributes:

```javascript
// Add status attribute to ideas collection
await databases.createStringAttribute(
  DATABASE_ID,
  'ideas',
  'status',
  20,
  true, // required
  'submitted' // default
);

// Add status attribute to tasks collection (if missing)
await databases.createStringAttribute(
  DATABASE_ID,
  'tasks', 
  'status',
  20,
  true, // required
  'todo' // default
);

// Add status attribute to hackathons collection (if missing)
await databases.createStringAttribute(
  DATABASE_ID,
  'hackathons',
  'status', 
  20,
  true, // required
  'upcoming' // default
);
```

## Verification

After adding the attributes, verify they exist:

1. Go to each collection in the Appwrite console
2. Check the **Attributes** tab
3. Confirm the `status` attribute is listed with the correct configuration

## Common Issues

### Issue: "Attribute already exists"
- This means the attribute exists but might have different configuration
- Check the attribute size and requirements match what's expected

### Issue: "Collection not found"
- Make sure you've created all required collections first
- Check that collection names match exactly (case-sensitive)

### Issue: "Permission denied"
- Ensure your API key has database write permissions
- Check that you're using the correct database ID

## Collection Creation Order

If you need to create collections from scratch:

1. **hackathons** (base collection)
2. **teams** (references hackathons)
3. **team_members** (references teams)
4. **tasks** (references teams and hackathons)
5. **ideas** (references teams and hackathons)
6. **idea_votes** (references ideas)
7. **messages** (references teams and hackathons)

## Next Steps

After fixing the schema:

1. Test creating an idea to verify the status attribute works
2. Test task creation and status updates
3. Test hackathon creation and status changes
4. Run the application tests to ensure everything works

## Support

If you continue to have issues:

1. Check the Appwrite console logs for detailed error messages
2. Verify your database permissions allow read/write access
3. Ensure all required environment variables are set correctly
4. Test with a simple document creation to isolate the issue