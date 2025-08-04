const MessagesSetupGuide = ({ error }) => {
  const isCollectionError = error.includes('collection') || error.includes('schema');
  
  if (!isCollectionError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Chat Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">Messages Collection Setup Required</h3>
      
      <div className="space-y-4 text-sm text-yellow-700">
        <p className="font-medium">The messages collection needs to be set up in your Appwrite database:</p>
        
        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">1. Create Messages Collection</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Go to your Appwrite Console → Database → Collections</li>
            <li>Create a new collection with ID: <code className="bg-gray-100 px-1 rounded">messages</code></li>
          </ul>
        </div>

        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">2. Add Required Attributes</h4>
          <div className="space-y-2 text-xs">
            <div><code className="bg-gray-100 px-1 rounded">teamId</code> - String, Required, Size: 255</div>
            <div><code className="bg-gray-100 px-1 rounded">userId</code> - String, Optional, Size: 255 (null for system messages)</div>
            <div><code className="bg-gray-100 px-1 rounded">content</code> - String, Required, Size: 1000</div>
            <div><code className="bg-gray-100 px-1 rounded">type</code> - String, Required, Size: 50 (values: "user" or "system")</div>
          </div>
        </div>

        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">3. Set Permissions</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Create: Users</li>
            <li>Read: Users</li>
            <li>Update: None (messages are immutable)</li>
            <li>Delete: Users</li>
          </ul>
        </div>

        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">4. Add Indexes (Recommended)</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Index on <code className="bg-gray-100 px-1 rounded">teamId</code> for efficient team queries</li>
            <li>Index on <code className="bg-gray-100 px-1 rounded">$createdAt</code> for chronological ordering</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-700 font-medium mb-1">Quick Access:</p>
          <p className="text-xs text-blue-600">
            Go to your <a href="https://cloud.appwrite.io" target="_blank" rel="noopener noreferrer" className="underline">Appwrite Console</a> → Database → Collections to set this up.
          </p>
        </div>

        <p className="text-xs text-yellow-600 mt-2">
          After creating the messages collection with the required attributes, refresh this page to continue.
        </p>
      </div>
    </div>
  );
};

export default MessagesSetupGuide;