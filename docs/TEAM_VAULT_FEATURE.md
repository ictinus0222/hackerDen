# Team Vault Feature Documentation

## Overview

The Team Vault is a secure credential management system designed specifically for hackathon teams. It provides a centralized, permission-based solution for storing and sharing sensitive information like API keys, passwords, and other credentials.

## 🎯 Core Purpose

- **Secure Storage**: Encrypted storage of sensitive team credentials
- **Access Control**: Permission-based access with approval workflows
- **Audit Trail**: Track who accessed what and when
- **Team Collaboration**: Streamlined credential sharing within teams

## 🏗️ Architecture

### Database Collections

#### `vault_secrets`
Stores encrypted secrets with metadata:
- `teamId`: Reference to the team
- `hackathonId`: Reference to the hackathon
- `name`: Human-readable secret name
- `description`: Optional description
- `encryptedValue`: Encrypted secret value
- `createdBy`: User who created the secret
- `createdByName`: Name of the creator
- `accessCount`: Number of times accessed
- `lastAccessedAt`: Timestamp of last access
- `lastAccessedBy`: User who last accessed

#### `vault_access_requests`
Manages access request workflow:
- `secretId`: Reference to the secret
- `requestedBy`: User requesting access
- `requestedByName`: Name of the requester
- `justification`: Reason for access request
- `status`: pending/approved/denied
- `handledBy`: User who approved/denied
- `handledByName`: Name of the handler
- `requestedAt`: Request timestamp
- `handledAt`: Response timestamp
- `accessExpiresAt`: When access expires (optional)

### Security Model

#### Encryption
- Simple XOR encryption for demo purposes
- Production should use AES or similar strong encryption
- Encryption key derived from team and hackathon IDs
- Values are encrypted before storage, decrypted on authorized access

#### Access Control
- **Team Leaders/Owners**: Can create, update, delete secrets and approve access requests
- **Team Members**: Can view secret names, request access, view approved secrets
- **Temporary Access**: Approved access can have expiration times (default: 2 hours)

## 🚀 Features

### 1. Secret Management (Leaders Only)
- **Create Secrets**: Add new encrypted credentials with name and description
- **Update Secrets**: Modify existing secret values and metadata
- **Delete Secrets**: Remove secrets and associated access requests
- **View All Secrets**: See complete list of team secrets

### 2. Access Request Workflow
- **Request Access**: Members can request access with justification
- **Approve/Deny**: Leaders can approve or deny requests
- **Temporary Access**: Approved access expires after set time
- **Audit Trail**: Track all access requests and approvals

### 3. Secure Value Display
- **On-Demand Decryption**: Values only decrypted when explicitly requested
- **Copy to Clipboard**: Easy copying of secret values
- **Auto-Hide**: Values automatically hidden after viewing
- **Access Tracking**: Record each time a secret is accessed

### 4. User Interface
- **Tabbed Interface**: Separate tabs for secrets and access requests
- **Status Indicators**: Visual status for access requests (pending, approved, expired)
- **Modal Forms**: Clean forms for creating secrets and requesting access
- **Responsive Design**: Works on desktop and mobile devices

## 📊 User Workflows

### Team Leader Workflow
1. **Add Secret**: Create new secret with name, value, and description
2. **Manage Requests**: Review and approve/deny access requests from team members
3. **Monitor Usage**: View access counts and last access information
4. **Update/Delete**: Modify or remove secrets as needed

### Team Member Workflow
1. **Browse Secrets**: View available secrets (names only)
2. **Request Access**: Submit access request with justification
3. **View Approved Secrets**: Access secret values once approved
4. **Track Requests**: Monitor status of submitted requests

## 🔧 Technical Implementation

### Service Layer (`vaultService.js`)
- **createSecret()**: Create encrypted secret
- **getTeamSecrets()**: Retrieve team secrets (without values)
- **requestSecretAccess()**: Submit access request
- **handleAccessRequest()**: Approve/deny requests
- **getSecretValue()**: Decrypt and return secret value
- **updateSecret()**: Modify existing secret
- **deleteSecret()**: Remove secret and requests

### React Hook (`useVault.jsx`)
- Manages vault state and operations
- Handles loading states and errors
- Provides CRUD operations for secrets and requests
- Checks user permissions

### Components
- **TeamVault**: Main vault interface component
- **VaultPage**: Full-page vault view
- Integration with existing sidebar navigation

## 🛡️ Security Considerations

### Current Implementation (Demo)
- XOR encryption for simplicity
- Key derived from team/hackathon IDs
- Basic access control based on team roles

### Production Recommendations
- Use AES-256 encryption with proper key management
- Implement key rotation and secure key storage
- Add rate limiting for access requests
- Implement audit logging with tamper protection
- Add two-factor authentication for sensitive operations
- Use HTTPS for all communications
- Implement proper session management

## 🎨 UI/UX Design

### Visual Elements
- Key icon for vault identification
- Color-coded status indicators (green=approved, yellow=pending, red=denied)
- Modal dialogs for forms
- Tabbed interface for organization
- Copy-to-clipboard functionality

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast colors

## 📈 Usage Analytics

### Tracked Metrics
- Secret access frequency
- Request approval rates
- User activity patterns
- Security event logging

### Audit Trail
- Who created what secrets
- Who requested access and when
- Who approved/denied requests
- When secrets were accessed

## 🔮 Future Enhancements

### Advanced Features
- **Secret Versioning**: Track changes to secret values
- **Bulk Operations**: Import/export multiple secrets
- **Secret Templates**: Pre-defined secret types (API keys, databases, etc.)
- **Integration Hooks**: Connect with external secret managers
- **Notification System**: Real-time alerts for requests and approvals

### Security Improvements
- **Hardware Security Modules**: For enterprise deployments
- **Zero-Knowledge Architecture**: Client-side encryption
- **Compliance Features**: SOC2, GDPR compliance tools
- **Advanced Audit**: Detailed security event logging

### User Experience
- **Mobile App**: Dedicated mobile application
- **Browser Extension**: Quick access to secrets
- **CLI Tool**: Command-line interface for developers
- **API Access**: Programmatic secret retrieval

## 🚀 Getting Started

### Setup Requirements
1. Add vault collections to Appwrite database
2. Configure proper permissions for collections
3. Update environment variables if needed
4. Deploy updated application

### Database Setup
```javascript
// Create collections in Appwrite
const vaultSecretsCollection = {
  name: 'vault_secrets',
  permissions: ['read', 'write'], // Configure based on your needs
  attributes: [
    { key: 'teamId', type: 'string', required: true },
    { key: 'hackathonId', type: 'string', required: true },
    { key: 'name', type: 'string', required: true },
    { key: 'description', type: 'string', required: false },
    { key: 'encryptedValue', type: 'string', required: true },
    { key: 'createdBy', type: 'string', required: true },
    { key: 'createdByName', type: 'string', required: true },
    { key: 'accessCount', type: 'integer', default: 0 },
    { key: 'lastAccessedAt', type: 'datetime', required: false },
    { key: 'lastAccessedBy', type: 'string', required: false },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true }
  ]
};

const vaultAccessRequestsCollection = {
  name: 'vault_access_requests',
  permissions: ['read', 'write'],
  attributes: [
    { key: 'secretId', type: 'string', required: true },
    { key: 'requestedBy', type: 'string', required: true },
    { key: 'requestedByName', type: 'string', required: true },
    { key: 'justification', type: 'string', required: true },
    { key: 'status', type: 'string', required: true }, // pending, approved, denied
    { key: 'handledBy', type: 'string', required: false },
    { key: 'handledByName', type: 'string', required: false },
    { key: 'requestedAt', type: 'datetime', required: true },
    { key: 'handledAt', type: 'datetime', required: false },
    { key: 'accessExpiresAt', type: 'datetime', required: false }
  ]
};
```

### Usage Example
```javascript
// Access the vault in a hackathon context
import { useVault } from '../hooks/useVault';

const MyComponent = ({ teamId, hackathonId }) => {
  const {
    secrets,
    accessRequests,
    canManage,
    createSecret,
    requestAccess,
    getSecretValue
  } = useVault(teamId, hackathonId);

  // Create a new secret (leaders only)
  const handleCreateSecret = async () => {
    await createSecret('API Key', 'sk-1234567890', 'OpenAI API Key');
  };

  // Request access to a secret
  const handleRequestAccess = async (secretId) => {
    await requestAccess(secretId, 'Need this for the ML feature');
  };

  // Get secret value (if approved)
  const handleGetSecret = async (secretId) => {
    const secret = await getSecretValue(secretId);
    console.log(secret.value);
  };
};
```

## 🎯 Key Benefits

1. **Security**: Encrypted storage with access controls
2. **Collaboration**: Streamlined credential sharing
3. **Audit**: Complete access tracking
4. **User Experience**: Intuitive interface
5. **Integration**: Seamless with existing HackerDen features
6. **Scalability**: Supports multiple teams and hackathons

The Team Vault feature enhances HackerDen's collaboration capabilities by providing a secure, user-friendly solution for managing sensitive credentials within hackathon teams.