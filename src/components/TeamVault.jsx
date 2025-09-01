import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import LoadingSpinner from './LoadingSpinner';
import VaultSetupNotice from './VaultSetupNotice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Key, Plus, Eye, EyeOff, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, Edit3 } from 'lucide-react';

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

  // Create secret form state
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateSecret = async (e) => {
    e.preventDefault();
    try {
      await createSecret(newSecret);
      setNewSecret({ name: '', value: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create secret:', error);
    }
  };

  const handleRequestAccess = async (secretId) => {
    if (!accessJustification.trim()) return;
    
    try {
      await requestAccess(secretId, accessJustification);
      setAccessJustification('');
      setShowAccessForm(null);
    } catch (error) {
      console.error('Failed to request access:', error);
    }
  };

  const getRequestStatus = (secretId) => {
    const request = userRequests.find(r => r.secretId === secretId);
    if (!request) return null;
    
    if (request.status === 'denied') return 'denied';
    if (request.status === 'approved') {
      if (!request.accessExpiresAt) return 'approved';
      if (new Date(request.accessExpiresAt) > new Date()) return 'approved';
      return 'expired';
    }
    
    return null;
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

  // Only show setup notice if there's an actual error or if we're still loading and have no data
  const shouldShowSetupNotice = error && (error.includes('404') || error.includes('401') || error.includes('collection'));

  if (shouldShowSetupNotice) {
    return <VaultSetupNotice />;
  }

  return (
    <div className="space-y-6">
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

      {/* Tabs and Add Secret Button */}
      <div className="flex items-center justify-between mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn(
          "w-full",
          canManage ? "" : "flex justify-center"
        )}>
          <TabsList className={cn(
            "grid",
            canManage ? "w-full grid-cols-2" : "grid-cols-1"
          )}>
            <TabsTrigger value="secrets" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Secrets ({secrets.length})</span>
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="requests" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Access Requests ({accessRequests.length})</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Add Secret Button */}
          {canManage && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Secret</span>
              </Button>
            </div>
          )}

          {/* Secrets Tab */}
          <TabsContent value="secrets" className="space-y-4 mt-6">
          {secrets.length === 0 ? (
            <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
              <CardContent className="p-16 text-center">
                <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No secrets yet</h3>
                <p className="text-muted-foreground">
                  {canManage 
                    ? "Create your first secret to securely store API keys and credentials."
                    : "Your team leaders haven't added any secrets yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {secrets.map((secret) => {
                const requestStatus = getRequestStatus(secret.id);
                
                return (
                  <Card key={secret.$id} className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-foreground">{secret.name}</h3>
                            {requestStatus && (
                              <Badge 
                                variant={requestStatus === 'approved' ? 'default' : requestStatus === 'denied' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {requestStatus === 'approved' ? 'Access Granted' : requestStatus === 'denied' ? 'Access Denied' : 'Expired'}
                              </Badge>
                            )}
                          </div>
                          {secret.description && (
                            <p className="text-muted-foreground text-sm mb-3">{secret.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Created {new Date(secret.$createdAt).toLocaleDateString()}</span>
                            {secret.$updatedAt !== secret.$createdAt && (
                              <span>Updated {new Date(secret.$updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {canManage ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSecretValue(prev => ({ ...prev, [secret.$id]: !prev[secret.$id] }))}
                                className="h-8 w-8 p-0"
                              >
                                {showSecretValue[secret.$id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* Edit functionality */}}
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSecret(secret.$id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => setShowAccessForm(secret.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Request Access
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {showSecretValue[secret.$id] && (
                        <div className="mt-4 p-3 bg-muted/30 rounded border border-border">
                          <p className="text-sm font-mono text-foreground break-all">{secret.value}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Access Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {canManage && (
            <>
              {accessRequests.length === 0 ? (
                <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
                  <CardContent className="p-16 text-center">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">Access requests will appear here for your approval.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {accessRequests.map((request) => (
                    <Card key={request.$id} className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-1">
                              Access Request for "{request.secretName}"
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Requested by {request.requestedByName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleAccessRequest(request.$id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleAccessRequest(request.$id, 'denied')}
                              variant="destructive"
                              size="sm"
                            >
                              Deny
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 rounded p-3 border border-border">
                          <h4 className="text-sm font-medium text-foreground mb-2">Justification:</h4>
                          <p className="text-muted-foreground text-sm">{request.justification}</p>
                        </div>
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          Requested {new Date(request.requestedAt).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      </div>

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
                    Secret Name *
                  </label>
                  <input
                    type="text"
                    value={newSecret.name}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., GitHub API Key"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Secret Value *
                  </label>
                  <textarea
                    value={newSecret.value}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter the secret value..."
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
                    placeholder="Optional description..."
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
                    Create Secret
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Access Request Modal */}
      {showAccessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Request Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Justification *
                  </label>
                  <textarea
                    value={accessJustification}
                    onChange={(e) => setAccessJustification(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Explain why you need access to this secret..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAccessForm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRequestAccess(showAccessForm)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamVault;