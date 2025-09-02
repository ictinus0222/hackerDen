import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import LoadingSpinner from './LoadingSpinner';
import VaultSetupNotice from './VaultSetupNotice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Key, Plus, Eye, EyeOff, AlertTriangle, Trash2, Edit3, Copy, ExternalLink } from 'lucide-react';

const TeamVault = ({ teamId, hackathonId }) => {
  const {
    secrets,
    loading,
    error,
    createSecret,
    getSecretValue,
    updateSecret,
    deleteSecret
  } = useVault(teamId, hackathonId);

  const [showSecretValue, setShowSecretValue] = useState({});
  const [secretValues, setSecretValues] = useState({});
  const [loadingSecrets, setLoadingSecrets] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSecret, setEditingSecret] = useState(null);

  // Create secret form state
  const [newSecret, setNewSecret] = useState({
    name: '',
    value: '',
    description: ''
  });

  const handleCreateSecret = async (e) => {
    e.preventDefault();
    try {
      await createSecret(newSecret.name, newSecret.value, newSecret.description);
      setNewSecret({ name: '', value: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create secret:', error);
    }
  };

  const handleViewSecret = async (secretId) => {
    if (loadingSecrets[secretId]) return;
    
    try {
      setLoadingSecrets(prev => ({ ...prev, [secretId]: true }));
      
      if (showSecretValue[secretId] && secretValues[secretId]) {
        // Hide the secret if already showing
        setShowSecretValue(prev => ({ ...prev, [secretId]: false }));
      } else {
        // Fetch and show the secret
        const secretData = await getSecretValue(secretId);
        setSecretValues(prev => ({ ...prev, [secretId]: secretData.value }));
        setShowSecretValue(prev => ({ ...prev, [secretId]: true }));
      }
    } catch (error) {
      console.error('Failed to get secret value:', error);
    } finally {
      setLoadingSecrets(prev => ({ ...prev, [secretId]: false }));
    }
  };

  const handleCopySecret = async (secretId) => {
    try {
      if (!secretValues[secretId]) {
        const secretData = await getSecretValue(secretId);
        await navigator.clipboard.writeText(secretData.value);
      } else {
        await navigator.clipboard.writeText(secretValues[secretId]);
      }
      console.log('Secret copied to clipboard');
    } catch (error) {
      console.error('Failed to copy secret:', error);
    }
  };

  const handleEditSecret = (secret) => {
    setEditingSecret({
      id: secret.id,
      name: secret.name,
      value: secretValues[secret.id] || '',
      description: secret.description || ''
    });
  };

  const handleUpdateSecret = async (e) => {
    e.preventDefault();
    if (!editingSecret) return;

    try {
      const updates = {
        name: editingSecret.name,
        description: editingSecret.description
      };
      
      if (editingSecret.value) {
        updates.value = editingSecret.value;
      }

      await updateSecret(editingSecret.id, updates);
      setEditingSecret(null);
      
      // Clear the stored value if it was updated
      if (editingSecret.value) {
        setSecretValues(prev => ({ ...prev, [editingSecret.id]: editingSecret.value }));
      }
    } catch (error) {
      console.error('Failed to update secret:', error);
    }
  };

  const handleDeleteSecret = async (secretId) => {
    if (window.confirm('Are you sure you want to delete this secret? This action cannot be undone.')) {
      try {
        await deleteSecret(secretId);
        // Clean up local state
        setShowSecretValue(prev => ({ ...prev, [secretId]: false }));
        setSecretValues(prev => {
          const newValues = { ...prev };
          delete newValues[secretId];
          return newValues;
        });
      } catch (error) {
        console.error('Failed to delete secret:', error);
      }
    }
  };

  const isUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  if (loading && secrets.length === 0) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
        <CardContent className="p-16 text-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Only show setup notice if there's an actual error
  const shouldShowSetupNotice = error && (error.includes('404') || error.includes('401') || error.includes('collection'));

  if (shouldShowSetupNotice) {
    return <VaultSetupNotice />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Key className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Vault</h1>
            <p className="text-muted-foreground">Store and share API keys, passwords, and important links</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Secret</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/30 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Secrets List */}
      {secrets.length === 0 ? (
        <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
          <CardContent className="p-16 text-center">
            <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No secrets yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first API key, password, or important link.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Secret
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {secrets.map((secret) => (
            <Card key={secret.id} className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-foreground">{secret.name}</h3>
                    </div>
                    {secret.description && (
                      <p className="text-muted-foreground text-sm mb-3">{secret.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Added by {secret.createdByName}</span>
                      <span>•</span>
                      <span>{new Date(secret.createdAt).toLocaleDateString()}</span>
                      {secret.accessCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{secret.accessCount} access{secret.accessCount !== 1 ? 'es' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewSecret(secret.id)}
                      className="h-8 w-8 p-0"
                      disabled={loadingSecrets[secret.id]}
                    >
                      {loadingSecrets[secret.id] ? (
                        <LoadingSpinner size="sm" showMessage={false} />
                      ) : showSecretValue[secret.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopySecret(secret.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSecret(secret)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSecret(secret.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {showSecretValue[secret.id] && secretValues[secret.id] && (
                  <div className="mt-4 p-3 bg-muted/30 rounded border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Value:</span>
                      <div className="flex items-center space-x-2">
                        {isUrl(secretValues[secret.id]) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(secretValues[secret.id], '_blank')}
                            className="h-6 px-2 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopySecret(secret.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-foreground break-all bg-background/50 p-2 rounded border">
                      {secretValues[secret.id]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Secret Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Secret</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSecret} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newSecret.name}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., GitHub API Key, Database URL"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Value *
                  </label>
                  <textarea
                    value={newSecret.value}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter the secret value, API key, password, or URL..."
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newSecret.description}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Optional description or usage notes..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Secret
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Secret Modal */}
      {editingSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Secret</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSecret} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editingSecret.name}
                    onChange={(e) => setEditingSecret(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Value
                  </label>
                  <textarea
                    value={editingSecret.value}
                    onChange={(e) => setEditingSecret(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Leave empty to keep current value"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to keep the current value unchanged
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingSecret.description}
                    onChange={(e) => setEditingSecret(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSecret(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Secret
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamVault;