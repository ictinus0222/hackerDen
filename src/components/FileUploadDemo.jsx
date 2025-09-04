import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import FileUpload from './FileUpload';
import FileLibrary from './FileLibrary';
import fileService from '@/services/fileService';

const FileUploadDemo = () => {
  const [demoTeamId] = useState('demo-team-123');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Mock file upload handler for demo
  const handleFileUpload = async (file, teamId) => {
    setIsUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock file document
      const mockFileDoc = {
        $id: `file-${Date.now()}`,
        teamId,
        uploadedBy: 'demo-user',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageId: `storage-${Date.now()}`,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        annotationCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setUploadedFiles(prev => [mockFileDoc, ...prev]);
      
      console.log('Demo file uploaded:', mockFileDoc);
    } catch (error) {
      console.error('Demo upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const clearDemoFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            File Upload & Library Demo
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Demo Mode</Badge>
              {uploadedFiles.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearDemoFiles}>
                  Clear Demo Files
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This demo showcases the file upload and library components. Files uploaded here are stored in memory 
            for demonstration purposes and will not persist after page refresh.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileUpload={handleFileUpload}
              teamId={demoTeamId}
              disabled={isUploading}
              maxFiles={5}
            />
            
            {isUploading && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Uploading file... (simulated delay)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Library Section */}
        <Card>
          <CardHeader>
            <CardTitle>File Library</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedFiles.length > 0 ? (
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.$id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {file.fileType.split('/')[0]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    {file.previewUrl && (
                      <img
                        src={file.previewUrl}
                        alt={file.fileName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No files uploaded yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload some files to see them appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">FileUpload Component</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Drag and drop file upload</li>
                <li>• File type validation (images, PDFs, text, code)</li>
                <li>• File size validation (10MB limit)</li>
                <li>• Progress indicators during upload</li>
                <li>• Multiple file support with limits</li>
                <li>• Error handling and user feedback</li>
                <li>• Responsive design for mobile</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">FileLibrary Component</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Grid layout for file browsing</li>
                <li>• File type icons and metadata display</li>
                <li>• Preview generation for images</li>
                <li>• Download and delete functionality</li>
                <li>• Real-time updates via subscriptions</li>
                <li>• File annotation support</li>
                <li>• Search and filtering capabilities</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Integration with FileService</h4>
            <p className="text-sm text-muted-foreground">
              The components integrate with the FileService which handles Appwrite Storage operations, 
              file validation, metadata management, and real-time synchronization across team members.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadDemo;