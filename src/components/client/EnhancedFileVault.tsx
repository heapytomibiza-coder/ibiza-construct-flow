import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, Upload, Filter, Grid, List, FileText, Image, File, 
  Download, Eye, Share, Trash2, Folder, FolderOpen, Calendar,
  User, MoreHorizontal, Mic, Camera, Video, Archive, Lock,
  Tag, Star, Clock, Shield, CheckCircle, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'voice' | 'video' | 'archive';
  size: string;
  uploadedBy: 'client' | 'professional';
  uploaderName: string;
  uploadDate: string;
  jobTitle: string;
  jobId: string;
  url: string;
  tags: string[];
  thumbnail?: string;
  isEncrypted: boolean;
  isStarred: boolean;
  shareStatus: 'private' | 'shared_with_pro' | 'public';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

interface FileCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  count: number;
  description: string;
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
    tags: ['inspiration', 'tiles', 'design'],
    thumbnail: '/api/placeholder/80/60',
    isEncrypted: false,
    isStarred: true,
    shareStatus: 'shared_with_pro',
    verificationStatus: 'verified',
    notes: 'Reference image for tile selection'
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
    tags: ['quote', 'plumbing', 'contract'],
    isEncrypted: true,
    isStarred: false,
    shareStatus: 'shared_with_pro',
    verificationStatus: 'verified'
  },
  {
    id: '3',
    name: 'site-walkthrough.mp3',
    type: 'voice',
    size: '4.2 MB',
    uploadedBy: 'client',
    uploaderName: 'You',
    uploadDate: '2024-01-13',
    jobTitle: 'Kitchen Plumbing',
    jobId: 'job-2',
    url: '/api/placeholder/audio',
    tags: ['walkthrough', 'notes', 'requirements'],
    isEncrypted: false,
    isStarred: false,
    shareStatus: 'private',
    notes: 'Voice notes from initial site visit'
  },
  {
    id: '4',
    name: 'progress-video.mp4',
    type: 'video',
    size: '45.8 MB',
    uploadedBy: 'professional',
    uploaderName: 'Maria Santos',
    uploadDate: '2024-01-12',
    jobTitle: 'Bathroom Renovation',
    jobId: 'job-1',
    url: '/api/placeholder/video',
    tags: ['progress', 'update', 'work'],
    thumbnail: '/api/placeholder/120/80',
    isEncrypted: false,
    isStarred: true,
    shareStatus: 'shared_with_pro',
    verificationStatus: 'pending'
  }
];

const categories: FileCategory[] = [
  { 
    id: 'all', 
    name: 'All Files', 
    icon: Archive, 
    color: 'text-gray-600', 
    count: mockFiles.length,
    description: 'All your project files'
  },
  { 
    id: 'images', 
    name: 'Photos', 
    icon: Image, 
    color: 'text-blue-600', 
    count: mockFiles.filter(f => f.type === 'image').length,
    description: 'Photos and images'
  },
  { 
    id: 'documents', 
    name: 'Documents', 
    icon: FileText, 
    color: 'text-red-600', 
    count: mockFiles.filter(f => f.type === 'document').length,
    description: 'PDFs and documents'
  },
  { 
    id: 'voice', 
    name: 'Voice Notes', 
    icon: Mic, 
    color: 'text-green-600', 
    count: mockFiles.filter(f => f.type === 'voice').length,
    description: 'Audio recordings'
  },
  { 
    id: 'videos', 
    name: 'Videos', 
    icon: Video, 
    color: 'text-purple-600', 
    count: mockFiles.filter(f => f.type === 'video').length,
    description: 'Video files'
  },
  { 
    id: 'starred', 
    name: 'Starred', 
    icon: Star, 
    color: 'text-yellow-600', 
    count: mockFiles.filter(f => f.isStarred).length,
    description: 'Your favorite files'
  }
];

export const EnhancedFileVault = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (file.notes && file.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || 
                           (activeCategory === 'images' && file.type === 'image') ||
                           (activeCategory === 'documents' && file.type === 'document') ||
                           (activeCategory === 'voice' && file.type === 'voice') ||
                           (activeCategory === 'videos' && file.type === 'video') ||
                           (activeCategory === 'starred' && file.isStarred);
    
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (file: FileItem) => {
    const iconProps = "w-5 h-5";
    switch (file.type) {
      case 'image': return <Image className={cn(iconProps, "text-blue-500")} />;
      case 'document': return <FileText className={cn(iconProps, "text-red-500")} />;
      case 'voice': return <Mic className={cn(iconProps, "text-green-500")} />;
      case 'video': return <Video className={cn(iconProps, "text-purple-500")} />;
      case 'archive': return <Archive className={cn(iconProps, "text-gray-500")} />;
      default: return <File className={cn(iconProps, "text-gray-500")} />;
    }
  };

  const getShareStatusColor = (status: string) => {
    switch (status) {
      case 'public': return 'text-blue-600 bg-blue-50';
      case 'shared_with_pro': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'rejected': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'pending': return <Clock className="w-3 h-3 text-amber-500" />;
      default: return null;
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleStarred = (fileId: string) => {
    // Toggle starred status logic here
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Handle file upload logic
    }
  };

  const handleUpload = (type: 'file' | 'voice' | 'camera') => {
    switch (type) {
      case 'file':
        fileInputRef.current?.click();
        break;
      case 'voice':
        // Start voice recording
        break;
      case 'camera':
        // Open camera
        break;
    }
    setShowUploadModal(false);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Enhanced Sidebar */}
        <Card className="card-luxury lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-copper" />
                File Vault
              </span>
              <div className="relative">
                <Button 
                  size="sm" 
                  className="bg-gradient-hero text-white"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                
                {showUploadModal && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-luxury p-2 z-10 min-w-[160px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpload('file')}
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpload('camera')}
                      className="w-full justify-start"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpload('voice')}
                      className="w-full justify-start"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Record Voice
                    </Button>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 p-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-sand-light/50 rounded-lg",
                      activeCategory === category.id && "bg-sand-light border border-copper/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn(
                        "w-4 h-4",
                        activeCategory === category.id ? "text-copper" : category.color
                      )} />
                      <div>
                        <span className={cn(
                          "text-sm block",
                          activeCategory === category.id ? "font-medium text-copper" : "text-muted-foreground"
                        )}>
                          {category.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{category.description}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Main Content */}
        <Card 
          className={cn(
            "card-luxury lg:col-span-3 flex flex-col",
            dragActive && "border-copper border-dashed bg-copper/5"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>
                  {categories.find(c => c.id === activeCategory)?.name || 'All Files'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredFiles.length} files • {selectedFiles.length} selected
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search files, notes, tags..."
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
            {dragActive && (
              <div className="border-2 border-dashed border-copper rounded-lg p-8 text-center mb-4">
                <Upload className="w-12 h-12 mx-auto mb-4 text-copper" />
                <p className="text-lg font-medium text-copper mb-2">Drop files here to upload</p>
                <p className="text-sm text-muted-foreground">Photos, documents, voice notes, and videos are supported</p>
              </div>
            )}

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
                    <Tag className="w-4 h-4 mr-2" />
                    Add Tags
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
                      "cursor-pointer transition-all duration-200 hover:shadow-elegant group",
                      selectedFiles.includes(file.id) && "border-copper shadow-luxury"
                    )}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          {file.isEncrypted && <Lock className="w-3 h-3 text-amber-500" />}
                          {getVerificationIcon(file.verificationStatus)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarred(file.id);
                            }}
                          >
                            <Star className={cn(
                              "w-4 h-4",
                              file.isStarred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                            )} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {file.thumbnail && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img 
                            src={file.thumbnail} 
                            alt={file.name}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      )}
                      
                      <h4 className="font-medium text-sm text-charcoal mb-1 truncate">
                        {file.name}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {file.jobTitle}
                      </p>

                      {file.notes && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {file.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{file.size}</span>
                        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{file.uploaderName}</span>
                        </div>
                        <Badge className={cn("text-xs px-1 py-0", getShareStatusColor(file.shareStatus))}>
                          {file.shareStatus.replace('_', ' ')}
                        </Badge>
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
                      "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-sand-light/50 group",
                      selectedFiles.includes(file.id) && "bg-sand-light border border-copper/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      {file.isEncrypted && <Lock className="w-3 h-3 text-amber-500" />}
                      {getVerificationIcon(file.verificationStatus)}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-2">
                        <h4 className="font-medium text-sm text-charcoal">{file.name}</h4>
                        <p className="text-xs text-muted-foreground">{file.jobTitle}</p>
                        {file.notes && (
                          <p className="text-xs text-muted-foreground truncate">{file.notes}</p>
                        )}
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

                      <div className="flex items-center justify-between">
                        <Badge className={cn("text-xs", getShareStatusColor(file.shareStatus))}>
                          {file.shareStatus.replace('_', ' ')}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarred(file.id);
                          }}
                        >
                          <Star className={cn(
                            "w-4 h-4",
                            file.isStarred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                          )} />
                        </Button>
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
                <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-display font-semibold mb-2">No files found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Upload files to build your project vault'
                  }
                </p>
                <Button 
                  className="bg-gradient-hero text-white"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.zip"
        multiple
        onChange={() => {}}
      />
      
      <input
        type="file"
        ref={voiceInputRef}
        className="hidden"
        accept="audio/*"
        onChange={() => {}}
      />

      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowUploadModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {/* Upload modal content would go here */}
          </div>
        </div>
      )}
    </div>
  );
};