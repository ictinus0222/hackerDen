# Team Vault Setup Guide

## Quick Setup

The Team Vault feature has been successfully integrated into HackerDen! Choose one of the setup methods below:

## Option 1: Manual Setup (Recommended)

### 1. Create Collections in Appwrite Console

Go to your Appwrite console and create these two collections:

#### Collection 1: `vault_secrets`
Create a collection with ID `vault_secrets` and add these attributes:
- `teamId` (string, required)
- `hackathonId` (string, required)
- `name` (string, required)
- `description` (string, optional)
- `encryptedValue` (string, required)
- `createdBy` (string, required)
- `createdByName` (string, required)
- `accessCount` (integer, default: 0)
- `lastAccessedAt` (datetime, optional)
- `lastAccessedBy` (string, optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

#### Collection 2: `vault_access_requests`
Create a collection with ID `vault_access_requests` and add these attributes:
- `secretId` (string, required)
- `requestedBy` (string, required)
- `requestedByName` (string, required)
- `justification` (string, required)
- `status` (string, required)
- `handledBy` (string, optional)
- `handledByName` (string, optional)
- `requestedAt` (datetime, required)
- `handledAt` (datetime, optional)
- `accessExpiresAt` (datetime, optional)

### 2. Set Permissions
For both collections, set permissions to allow:
- Read access for authenticated users
- Write access for authenticated users

## Option 2: Automated Setup (Advanced)

### 1. Add Server API Key
Add your Appwrite server API key to your `.env` file:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-server-api-key  # Add this line
```

### 2. Run Setup Script
```bash
npm run setup:vault
```

### 3. Access the Vault

Once setup is complete, team members can access the vault at:
```
/hackathon/{hackathonId}/vault
```

Or navigate through the hackathon sidebar: **Team Vault** (available when you're in a hackathon workspace)

## Features Overview

### For Team Leaders/Owners:
- ✅ Create encrypted secrets (API keys, passwords, etc.)
- ✅ Approve/deny access requests from team members
- ✅ View audit trail and access statistics
- ✅ Update and delete secrets
- ✅ Manage temporary access permissions

### For Team Members:
- ✅ View available secrets (names only)
- ✅ Request access with justification
- ✅ View approved secret values
- ✅ Track request status
- ✅ Copy secrets to clipboard

## Security Features

- 🔐 **Encrypted Storage**: All secret values are encrypted before storage
- 👥 **Role-Based Access**: Only team leaders can manage secrets
- ⏰ **Temporary Access**: Approved access expires automatically (2 hours default)
- 📊 **Audit Trail**: Complete tracking of all vault activities
- 🔍 **Access Requests**: Transparent approval workflow

## Usage Example

1. **Team Leader adds a secret:**
   - Name: "OpenAI API Key"
   - Value: "sk-1234567890..."
   - Description: "For our AI chatbot feature"

2. **Team member requests access:**
   - Selects the secret
   - Provides justification: "Need this for implementing the NLP feature"

3. **Team leader approves:**
   - Reviews the request and justification
   - Approves with 2-hour temporary access

4. **Team member accesses secret:**
   - Views the decrypted value
   - Copies to clipboard for use
   - Access is automatically tracked

## Troubleshooting

### Setup Script Fails
- Ensure you have a valid `APPWRITE_API_KEY` (server key, not client key)
- Check that your database exists and is accessible
- Verify network connectivity to your Appwrite instance

### Collections Already Exist
- The setup script will skip existing collections
- You can safely re-run the script if needed

### Permission Issues
- Verify your Appwrite project permissions
- Ensure users have read/write access to the vault collections

## Next Steps

1. **Test the feature** with your team
2. **Review security settings** in your Appwrite console
3. **Customize permissions** if needed for your use case
4. **Read the full documentation** in `docs/TEAM_VAULT_FEATURE.md`

## Production Considerations

⚠️ **Important**: This implementation uses simplified encryption for demonstration. For production use:

- Implement proper AES encryption
- Use secure key management (HSM, key rotation)
- Add rate limiting and additional security measures
- Consider compliance requirements (SOC2, GDPR, etc.)

---

🎉 **You're all set!** The Team Vault is now ready to help your hackathon teams securely manage their credentials.

For detailed technical documentation, see: `docs/TEAM_VAULT_FEATURE.md`