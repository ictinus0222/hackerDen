# File Upload System

The HackerDen file upload system allows team members to share files, images, documents, and other resources during hackathons.

## Features

- **File Upload**: Upload various file types including images, documents, code files, and archives
- **File Management**: View, download, and delete uploaded files
- **File Annotations**: Add comments and annotations to files (future feature)
- **Real-time Updates**: See new files uploaded by team members instantly
- **Gamification**: Earn 5 points for each file uploaded
- **File Previews**: Automatic image previews for supported formats

## Supported File Types

### Images
- JPEG, JPG, PNG, GIF, WebP, SVG

### Documents
- PDF, TXT, Markdown (MD), CSV, JSON

### Code Files
- JavaScript (JS), TypeScript (TS), JSX, TSX
- CSS, HTML, XML

### Archives
- ZIP, TAR, GZ

## File Size Limits

- Maximum file size: **10MB**
- Storage is managed through Appwrite Cloud Storage

## How to Use

### Accessing Files
1. Navigate to your hackathon workspace
2. Click on "Files" in the sidebar
3. You'll see all files uploaded by your team

### Uploading Files
1. Click the "Upload File" button
2. Select a file from your computer
3. The file will be uploaded and appear in the team files list
4. You'll earn 5 points for the upload

### Managing Files
- **View**: Click the eye icon to view the file in a new tab
- **Download**: Click the download icon to save the file locally
- **Delete**: Click the trash icon to delete files you uploaded (only file owners can delete)

### File Information
Each file displays:
- File name and type
- Upload date and uploader name
- File size
- Preview thumbnail (for images)
- Number of annotations (future feature)

## Technical Implementation

### Services
- **FileService**: Handles file operations (upload, download, delete, annotations)
- **GamificationService**: Awards points for file uploads
- **Real-time Updates**: Automatic refresh when team members upload files

### Database Collections
- **files**: Stores file metadata and references
- **file_annotations**: Stores file comments and annotations (future feature)

### Storage
- Files are stored in Appwrite Cloud Storage
- Secure access with team-based permissions
- Automatic file compression and optimization

## API Reference

### FileService Methods

```javascript
// Upload a file
await fileService.uploadFile(teamId, file, uploadedBy);

// Get team files
const files = await fileService.getTeamFiles(teamId);

// Delete a file
await fileService.deleteFile(fileId, userId);

// Get file URLs
const downloadUrl = fileService.getFileDownloadUrl(storageId);
const viewUrl = fileService.getFileViewUrl(storageId);

// Add annotation (future feature)
await fileService.addAnnotation(fileId, userId, annotationData);
```

### React Integration

```javascript
import { fileService } from '../services/fileService';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';

// In your component
const { user } = useAuth();
const { team } = useHackathonTeam(hackathonId);

// Upload file
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  await fileService.uploadFile(team.$id, file, user.$id);
};
```

## Security & Permissions

- Only team members can upload files to their team
- Only file owners can delete their uploaded files
- All team members can view and download team files
- Files are scanned for viruses automatically
- File types are validated on upload

## Future Enhancements

### File Annotations
- Add comments and notes to specific parts of files
- Collaborative review and feedback system
- Visual annotations for images and documents

### Advanced File Management
- File versioning and history
- Folder organization
- File sharing with other teams
- Bulk file operations

### Enhanced Previews
- Code syntax highlighting
- PDF viewer integration
- Video and audio file support
- 3D model previews

## Troubleshooting

### Upload Issues
- **File too large**: Reduce file size to under 10MB
- **Unsupported format**: Check the supported file types list
- **Upload failed**: Check your internet connection and try again

### Permission Issues
- **Can't delete file**: Only file owners can delete their uploads
- **Can't access files**: Ensure you're a member of the team

### Performance
- Large files may take longer to upload
- Image previews are automatically optimized
- Files are compressed during storage

## Integration with Gamification

The file upload system is integrated with the gamification system:
- **5 points** awarded for each file upload
- Points contribute to team leaderboard
- Achievements available for file sharing milestones

## Best Practices

1. **Organize Files**: Use descriptive file names
2. **File Size**: Compress large files before uploading
3. **Security**: Don't upload sensitive credentials or personal data
4. **Collaboration**: Use files to share resources, mockups, and documentation
5. **Clean Up**: Delete unnecessary files to keep the workspace organized