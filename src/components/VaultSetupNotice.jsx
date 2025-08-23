import { useState } from 'react';

// SVG Icons
const KeyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CogIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const VaultSetupNotice = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  const manualSetupSteps = [
    {
      title: "Create vault_secrets Collection",
      description: "In your Appwrite console, create a new collection named 'vault_secrets'",
      attributes: [
        "teamId (string, required)",
        "hackathonId (string, required)", 
        "name (string, required)",
        "description (string, optional)",
        "encryptedValue (string, required)",
        "createdBy (string, required)",
        "createdByName (string, required)",
        "accessCount (integer, default: 0)",
        "lastAccessedAt (datetime, optional)",
        "lastAccessedBy (string, optional)",
        "createdAt (datetime, required)",
        "updatedAt (datetime, required)"
      ]
    },
    {
      title: "Create vault_access_requests Collection", 
      description: "Create another collection named 'vault_access_requests'",
      attributes: [
        "secretId (string, required)",
        "requestedBy (string, required)",
        "requestedByName (string, required)",
        "justification (string, required)",
        "status (string, required)",
        "handledBy (string, optional)",
        "handledByName (string, optional)",
        "requestedAt (datetime, required)",
        "handledAt (datetime, optional)",
        "accessExpiresAt (datetime, optional)"
      ]
    },
    {
      title: "Set Permissions",
      description: "Configure read/write permissions for authenticated users on both collections",
      attributes: [
        "Read: Any authenticated user",
        "Create: Any authenticated user", 
        "Update: Any authenticated user",
        "Delete: Any authenticated user"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <KeyIcon className="h-16 w-16 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Team Vault Setup Required</h1>
        <p className="text-xl text-gray-400">
          The Team Vault feature needs to be set up before you can start managing secrets.
        </p>
      </div>

      {/* Setup Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Automatic Setup */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <CogIcon className="h-8 w-8 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Automatic Setup</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Run the setup script to automatically create the required database collections.
          </p>
          <div className="bg-gray-900 rounded p-3 mb-4 border border-gray-600">
            <code className="text-green-300 font-mono text-sm">npm run setup:vault</code>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> You'll need to add your Appwrite server API key to the .env file first. 
                  If you see "Unauthorized" errors, check collection permissions in your Appwrite console.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Setup */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <CogIcon className="h-8 w-8 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Manual Setup</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Create the collections manually in your Appwrite console.
          </p>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </button>
        </div>
      </div>

      {/* Manual Setup Instructions */}
      {showInstructions && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Manual Setup Instructions</h3>
          <div className="space-y-6">
            {manualSetupSteps.map((step, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-white mb-2">
                  {index + 1}. {step.title}
                </h4>
                <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                {step.attributes && (
                  <div className="bg-gray-900 rounded p-3 border border-gray-600">
                    <p className="text-sm text-gray-300 mb-2">Required attributes:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {step.attributes.map((attr, attrIndex) => (
                        <li key={attrIndex} className="font-mono">• {attr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-red-300 mb-3">Troubleshooting</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-red-200 font-medium mb-1">Getting "Unauthorized" errors?</h4>
            <p className="text-red-200 text-sm">
              The collections exist but don't have proper permissions. In your Appwrite console:
            </p>
            <ol className="text-red-200 text-sm mt-2 ml-4 space-y-1">
              <li>1. Go to your database → Collections</li>
              <li>2. Click on each vault collection (vault_secrets, vault_access_requests)</li>
              <li>3. Go to Settings → Permissions</li>
              <li>4. Add "Any authenticated user" with Read, Create, Update, Delete permissions</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-300 mb-3">After Setup</h3>
        <p className="text-green-200 text-sm mb-3">
          Once you've completed the setup, refresh this page to start using the Team Vault:
        </p>
        <ul className="text-green-200 text-sm space-y-1">
          <li>• Team leaders can create and manage secrets</li>
          <li>• Team members can request access to secrets</li>
          <li>• All vault activity is tracked and audited</li>
          <li>• Secrets are encrypted and stored securely</li>
        </ul>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default VaultSetupNotice;