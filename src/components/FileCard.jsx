import React from 'react';
import { File, Image, FileText, Code, Archive, Download, Eye, Trash2, MessageSquare, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const FileCard = ({ file, onPreview, onDownload, onDelete }) => {
  // File type icons and colors
  const getFileTypeInfo = (fileType) => {
    if (fileType.startsWith('image/')) {
      return { icon: Image, color: 'bg-blue-500', label: 'Image' };
    }
    if (fileType === 'application/pdf') {
      return { icon: FileText, color: 'bg-red-500', label: 'PDF' };
    }
    if (fileType.startsWith('text/') || fileType.includes('markdown')) {
      return { icon: FileText, color: 'bg-green-500', label: 'Text' };
    }
    if (fileType.includes('javascript') || fileType.includes('css') || fileType.includes('html') || fileType.includes('json')) {
      return { icon: Code, color: 'bg-purple-500', label: 'Code' };
    }
    if (fileType.includes('zip')) {
      return { icon: Archive, color: 'bg-orange-500', label: 'Archive' };
    }
    return { icon: File, color: 'bg-gray-500', label: 'File' };
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const { icon: FileIcon, color, label } = getFileTypeInfo(file.fileType);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* File Icon */}
          <div className={cn("p-2 rounded-lg", color)}>
            <FileIcon className="h-5 w-5 text-white" />
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" title={file.fileName}>
                  {file.fileName}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(file.createdAt)}
                </p>
                {file.annotationCount > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {file.annotationCount} annotation{file.annotationCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview(file)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(file)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(file)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Preview thumbnail for images */}
        {file.previewUrl && (
          <div className="mt-3">
            <img
              src={file.previewUrl}
              alt={file.fileName}
              className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPreview(file)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileCard;