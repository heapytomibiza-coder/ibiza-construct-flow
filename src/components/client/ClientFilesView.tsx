import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Upload, Filter, Grid, List, FileText, 
  Image, File, Download, Eye, Share, Trash2,
  Folder, FolderOpen, Calendar, User, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'other';
  size: string;
  uploadedBy: 'client' | 'professional';
  uploaderName: string;
  uploadDate: string;
  jobTitle: string;
  jobId: string;
  url: string;
  tags: string[];
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'bathroom-inspiration.jpg',
    type: 'image',
    size: '2.4 MB',
    uploadedBy: 'client',
    uploaderName: 'You',
    uploadDate: '2024-01-15',
    jobTitle: 'Bathroom Renovation',
    jobId: 'job-1',
    url: '/api/placeholder/200/150',
    tags: ['inspiration', 'tiles']
  },
  {
    id: '2',
    name: 'plumbing-quote.pdf',
    type: 'document',
    size: '156 KB',
    uploadedBy: 'professional',
    uploaderName: 'João Silva',
    uploadDate: '2024-01-14',
    jobTitle: 'Kitchen Plumbing',
    jobId: 'job-2',
    url: '/api/placeholder/document',
    tags: ['quote', 'plumbing']
  },
  {
    id: '3',
    name: 'electrical-diagram.pdf',
    type: 'document',
    size: '890 KB',
    uploadedBy: 'professional',
    uploaderName: 'Maria Santos',
    uploadDate: '2024-01-13',
    jobTitle: 'Electrical Upgrade',
    jobId: 'job-3',
    url: '/api/placeholder/document',
    tags: ['diagram', 'electrical']
  },
  {
    id: '4',
    name: 'before-photos.zip',
    type: 'other',
    size: '12.8 MB',
    uploadedBy: 'client',
    uploaderName: 'You',
    uploadDate: '2024-01-12',
    jobTitle: 'Full Renovation',
    jobId: 'job-4',
    url: '/api/placeholder/archive',
    tags: ['before', 'photos']
  }
];

const folders = [
  { id: 'all', name: 'All Files', count: mockFiles.length },
  { id: 'images', name: 'Images', count: mockFiles.filter(f => f.type === 'image').length },
  { id: 'documents', name: 'Documents', count: mockFiles.filter(f => f.type === 'document').length },
  { id: 'shared', name: 'Shared with Pros', count: 3 },
  { id: 'recent', name: 'Recent', count: 5 }
];

export const ClientFilesView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFolder = activeFolder === 'all' || 
                         (activeFolder === 'images' && file.type === 'image') ||
                         (activeFolder === 'documents' && file.type === 'document') ||
                         (activeFolder === 'recent' && new Date(file.uploadDate) > new Date('2024-01-14'));
    
    return matchesSearch && matchesFolder;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      case 'document': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <File className="w-5 h-5 text-purple-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <Card className="card-luxury lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-copper" />
                Files
              </span>
              <Button size="sm" className="bg-gradient-hero text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={cn(
                    "flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-sand-light/50 rounded-lg mx-3",
                    activeFolder === folder.id && "bg-sand-light border border-copper/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {activeFolder === folder.id ? (
                      <FolderOpen className="w-4 h-4 text-copper" />
                    ) : (
                      <Folder className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-sm",
                      activeFolder === folder.id ? "font-medium text-copper" : "text-muted-foreground"
                    )}>
                      {folder.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {folder.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="card-luxury lg:col-span-3 flex flex-col">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>
                  {folders.find(f => f.id === activeFolder)?.name || 'All Files'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredFiles.length} files • {selectedFiles.length} selected
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <div className="flex border border-border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto">
            {selectedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-sand-light rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">{selectedFiles.length} files selected</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card 
                    key={file.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-elegant",
                      selectedFiles.includes(file.id) && "border-copper shadow-luxury"
                    )}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        {getFileIcon(file.type)}
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <h4 className="font-medium text-sm text-charcoal mb-1 truncate">
                        {file.name}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {file.jobTitle}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{file.size}</span>
                        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <User className="w-3 h-3" />
                        <span>{file.uploaderName}</span>
                      </div>
                      
                      {file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {file.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{file.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-sand-light/50",
                      selectedFiles.includes(file.id) && "bg-sand-light border border-copper/20"
                    )}
                  >
                    {getFileIcon(file.type)}
                    
                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <h4 className="font-medium text-sm text-charcoal">{file.name}</h4>
                        <p className="text-xs text-muted-foreground">{file.jobTitle}</p>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {file.size}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {file.uploaderName}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-display font-semibold mb-2">No files found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Upload files to get started with your projects'
                  }
                </p>
                <Button className="bg-gradient-hero text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};