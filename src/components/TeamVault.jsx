import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import LoadingSpinner from './LoadingSpinner';
import VaultSetupNotice from './VaultSetupNotice';

// SVG Icons
const KeyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeSlashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TeamVault = ({ teamId, hackathonId }) => {
  const {
    secrets,
    accessRequests,
    userRequests,
    loading,
    error,
    canManage,
    createSecret,
    requestAccess,
    handleAccessRequest,
    getSecretValue,
    updateSecret,
    deleteSecret
  } = useVault(teamId, hackathonId);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAccessForm, setShowAccessForm] = useState(null);
  const [showSecretValue, setShowSecretValue] = useState({});
  const [secretValues, setSecretValues] = useState({});
  const [activeTab, setActiveTab] = useState('secrets');

  // Create secret form state
  const [newSecret, setNewSecret] = useState({
    name: '',
    value: '',
    description: ''
  });

  // Access request form state
  const [accessJustification, setAccessJustification] = useState('');

  const handleCreateSecret = async (e) => {
    e.preventDefault();
    if (!newSecret.name.trim() || !newSecret.value.trim()) return;

    try {
      await createSecret(newSecret.name, newSecret.value, newSecret.description);
      setNewSecret({ name: '', value: '', description: '' });
      setShowCreateForm(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleRequestAccess = async (secretId) => {
    if (!accessJustification.trim()) return;

    try {
      await requestAccess(secretId, accessJustification);
      setAccessJustification('');
      setShowAccessForm(null);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleViewSecret = async (secretId) => {
    try {
      const secret = await getSecretValue(secretId);
      setSecretValues(prev => ({ ...prev, [secretId]: secret.value }));
      setShowSecretValue(prev => ({ ...prev, [secretId]: true }));
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const hideSecretValue = (secretId) => {
    setShowSecretValue(prev => ({ ...prev, [secretId]: false }));
    setSecretValues(prev => {
      const newValues = { ...prev };
      delete newValues[secretId];
      return newValues;
    });
  };

  const getRequestStatus = (secretId) => {
    const request = userRequests.find(req => 
      req.secretId === secretId && 
      ['pending', 'approved'].includes(req.status)
    );
    
    if (!request) return null;
    
    if (request.status === 'pending') return 'pending';
    if (request.status === 'approved') {
      if (!request.accessExpiresAt) return 'approved';
      if (new Date(request.accessExpiresAt) > new Date()) return 'approved';
      return 'expired';
    }
    
    return null;
  };

  if (loading && secrets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Only show setup notice if there's an actual error or if we're still loading and have no data
  // Don't show setup notice just because vault is empty - that's normal for new vaults
  const shouldShowSetupNotice = error && (error.includes('404') || error.includes('401') || error.includes('collection'));

  // Debug logging
  console.log('Vault Debug:', { loading, secretsLength: secrets.length, error, canManage, shouldShowSetupNotice });

  if (shouldShowSetupNotice) {
    return <VaultSetupNotice />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <KeyIcon className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Team Vault</h2>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Secret</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('secrets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'secrets'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Secrets ({secrets.length})
          </button>
          {canManage && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Access Requests ({accessRequests.length})
            </button>
          )}
        </nav>
      </div>

      {/* Secrets Tab */}
      {activeTab === 'secrets' && (
        <div className="space-y-4">
          {secrets.length === 0 ? (
            <div className="text-center py-12">
              <KeyIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No secrets yet</h3>
              <p className="text-gray-500">
                {canManage 
                  ? "Create your first secret to securely store API keys and credentials."
                  : "Your team leaders haven't added any secrets yet."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {secrets.map((secret) => {
                const requestStatus = getRequestStatus(secret.id);
                const canView = requestStatus === 'approved';
                const isVisible = showSecretValue[secret.id];
                
                return (
                  <div key={secret.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">{secret.name}</h3>
                        {secret.description && (
                          <p className="text-gray-400 text-sm">{secret.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {canView && (
                          <button
                            onClick={() => isVisible ? hideSecretValue(secret.id) : handleViewSecret(secret.id)}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                            title={isVisible ? "Hide value" : "Show value"}
                          >
                            {isVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                          </button>
                        )}
                        {canManage && (
                          <>
                            <button
                              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                              title="Edit secret"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deleteSecret(secret.id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete secret"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Secret Value Display */}
                    {isVisible && secretValues[secret.id] && (
                      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Secret Value:</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(secretValues[secret.id])}
                            className="text-xs text-green-400 hover:text-green-300"
                          >
                            Copy
                          </button>
                        </div>
                        <code className="text-green-300 font-mono text-sm break-all">
                          {secretValues[secret.id]}
                        </code>
                      </div>
                    )}

                    {/* Access Status */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-gray-400">
                        <span>Created by {secret.createdByName}</span>
                        <span>•</span>
                        <span>Accessed {secret.accessCount} times</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {requestStatus === 'pending' && (
                          <div className="flex items-center space-x-1 text-yellow-400">
                            <ClockIcon className="h-4 w-4" />
                            <span>Access Pending</span>
                          </div>
                        )}
                        {requestStatus === 'approved' && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Access Granted</span>
                          </div>
                        )}
                        {requestStatus === 'expired' && (
                          <div className="flex items-center space-x-1 text-red-400">
                            <XCircleIcon className="h-4 w-4" />
                            <span>Access Expired</span>
                          </div>
                        )}
                        {!requestStatus && !canManage && (
                          <button
                            onClick={() => setShowAccessForm(secret.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Request Access
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Access Requests Tab */}
      {activeTab === 'requests' && canManage && (
        <div className="space-y-4">
          {accessRequests.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No pending requests</h3>
              <p className="text-gray-500">Access requests will appear here for your approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accessRequests.map((request) => (
                <div key={request.$id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">
                        Access Request for "{request.secretName}"
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Requested by {request.requestedByName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAccessRequest(request.$id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAccessRequest(request.$id, 'denied')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-3 border border-gray-600">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Justification:</h4>
                    <p className="text-gray-400 text-sm">{request.justification}</p>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Requested {new Date(request.requestedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Secret Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Add New Secret</h3>
            
            <form onSubmit={handleCreateSecret} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secret Name *
                </label>
                <input
                  type="text"
                  value={newSecret.name}
                  onChange={(e) => setNewSecret(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., GitHub API Key"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secret Value *
                </label>
                <textarea
                  value={newSecret.value}
                  onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter the secret value..."
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newSecret.description}
                  onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Secret
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Request Modal */}
      {showAccessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Request Access</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Justification *
                </label>
                <textarea
                  value={accessJustification}
                  onChange={(e) => setAccessJustification(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Explain why you need access to this secret..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAccessForm(null)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestAccess(showAccessForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamVault;