# Troubleshooting: "Unknown attribute: status" Error

## Quick Fix Guide

If you're seeing the error `Database validation error: Invalid document structure: Unknown attribute: "status"`, follow these steps:

### Step 1: Identify the Problem Collection

The error occurs when trying to create or update a document in a collection that doesn't have the "status" attribute defined in its schema.

**Most likely collections missing the status attribute:**
- `ideas` collection
- `tasks` collection  
- `hackathons` collection

### Step 2: Quick Test (Optional)

Run this command to test which collection is causing the issue:

```bash
# Set your Appwrite API key first
export APPWRITE_API_KEY="your-server-api-key-here"

# Test database operations
npm run test:database
```

This will tell you exactly which collection is missing the status attribute.

### Step 3: Fix the Schema

#### For Ideas Collection (Most Common Issue)

1. Go to your **Appwrite Console**
2. Navigate to **Databases** → **Your Database** → **Collections**
3. Click on the **`ideas`** collection
4. Go to the **Attributes** tab
5. Click **"Add Attribute"**
6. Select **"String"**
7. Configure:
   - **Key:** `status`
   - **Size:** `20`
   - **Required:** `Yes`
   - **Default:** `submitted`
   - **Array:** `No`
8. Click **"Create"**

#### For Tasks Collection

Same steps as above, but use:
- **Default:** `todo`

#### For Hackathons Collection

Same steps as above, but use:
- **Default:** `upcoming`

### Step 4: Verify the Fix

After adding the status attribute:

1. Try the operation that was failing again
2. Or run: `npm run test:database` to verify all collections work

## Manual Schema Check

If you prefer to check manually:

1. Go to **Appwrite Console** → **Databases** → **Your Database**
2. Click on each collection (`ideas`, `tasks`, `hackathons`)
3. Check the **Attributes** tab
4. Verify that `status` is listed as a **String** attribute

## Expected Status Values

- **Ideas:** `submitted`, `approved`, `in_progress`, `completed`, `rejected`
- **Tasks:** `todo`, `in_progress`, `completed`, `blocked`
- **Hackathons:** `upcoming`, `ongoing`, `completed`

## Still Having Issues?

### Check Collection Names

Make sure your collections are named exactly:
- `ideas` (not `Ideas` or `idea`)
- `tasks` (not `Tasks` or `task`)
- `hackathons` (not `Hackathons` or `hackathon`)

### Check Database ID

Verify your `.env` file has the correct:
```env
VITE_APPWRITE_DATABASE_ID=your-actual-database-id
```

### Check Permissions

Ensure your collections have proper read/write permissions:
1. Go to collection → **Settings** → **Permissions**
2. Add appropriate permissions for your users

## Common Mistakes

❌ **Wrong attribute type** - Make sure it's "String", not "Enum"  
❌ **Wrong size** - Use size 20 or larger  
❌ **Not required** - The status attribute should be required  
❌ **Typo in key name** - Must be exactly `status`  

## Need More Help?

1. Check the full error message for the specific collection name
2. Look at `docs/database-schema-setup.md` for complete schema requirements
3. Run `npm run validate:schema` for detailed validation (requires API key)

## Prevention

To avoid this issue in the future:
1. Always check the database schema before deploying new features
2. Use the validation scripts before making changes
3. Keep your database schema documentation up to date