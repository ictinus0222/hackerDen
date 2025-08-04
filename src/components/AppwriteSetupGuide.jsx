const AppwriteSetupGuide = ({ error }) => {
  const isCollectionError = error.includes('collection') || error.includes('schema');
  
  if (!isCollectionError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">Appwrite Setup Required</h3>
      
      <div className="space-y-4 text-sm text-yellow-700">
        <p className="font-medium">The tasks collection needs to be set up in your Appwrite database:</p>
        
        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">1. Create Tasks Collection</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Go to your Appwrite Console → Database → Collections</li>
            <li>Create a new collection with ID: <code className="bg-gray-100 px-1 rounded">tasks</code></li>
          </ul>
        </div>

        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">2. Add Required Attributes</h4>
          <div className="space-y-2 text-xs">
            <div><code className="bg-gray-100 px-1 rounded">teamId</code> - String, Required</div>
            <div><code className="bg-gray-100 px-1 rounded">title</code> - String, Required</div>
            <div><code className="bg-gray-100 px-1 rounded">description</code> - String, Optional</div>
            <div><code className="bg-gray-100 px-1 rounded">status</code> - String, Required</div>
            <div><code className="bg-gray-100 px-1 rounded">assignedTo</code> - String, Required</div>
            <div><code className="bg-gray-100 px-1 rounded">createdBy</code> - String, Required</div>
          </div>
        </div>

        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">3. Set Permissions</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Create: Users</li>
            <li>Read: Users</li>
            <li>Update: Users</li>
            <li>Delete: Users</li>
          </ul>
        </div>

        <div className="bg-white rounded border p-4">
          <h4 className="font-semibold mb-2">4. Add Indexes (Optional but Recommended)</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Index on <code className="bg-gray-100 px-1 rounded">teamId</code></li>
            <li>Index on <code className="bg-gray-100 px-1 rounded">status</code></li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-700 font-medium mb-1">Quick Access:</p>
          <p className="text-xs text-blue-600">
            Go to your <a href="https://cloud.appwrite.io" target="_blank" rel="noopener noreferrer" className="underline">Appwrite Console</a> → Database → Collections to set this up.
          </p>
        </div>

        <p className="text-xs text-yellow-600 mt-2">
          After creating the collection with the required attributes, refresh this page to continue.
        </p>
      </div>
    </div>
  );
};

export default AppwriteSetupGuide;