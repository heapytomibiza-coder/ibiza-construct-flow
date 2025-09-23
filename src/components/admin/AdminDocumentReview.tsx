import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, CheckCircle, XCircle, AlertCircle, User, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalDocument {
  id: string;
  professional_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  // Professional info
  professional_name?: string;
  professional_email?: string;
}

export function AdminDocumentReview() {
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<ProfessionalDocument | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get professional info for each document
      const documentsWithProfessionalInfo = await Promise.all(
        data.map(async (doc) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, id')
            .eq('id', doc.professional_id)
            .single();

          return {
            ...doc,
            professional_name: profileData?.full_name || 'Unknown',
            professional_email: profileData?.id || '',
            verification_status: doc.verification_status as 'pending' | 'approved' | 'rejected'
          };
        })
      );

      setDocuments(documentsWithProfessionalInfo);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents for review.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (documentId: string, status: 'approved' | 'rejected', notes?: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('professional_documents')
        .update({
          verification_status: status,
          verification_notes: notes || null,
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: `Document ${status}`,
        description: `Document has been ${status} successfully.`,
      });

      loadDocuments();
      setSelectedDocument(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update document status.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'tax_certificate': 'Tax Certificate',
      'insurance': 'Insurance Policy',
      'business_license': 'Business License',
      'id_document': 'ID Document',
      'qualification': 'Qualification Certificate'
    };
    return types[type] || type.replace('_', ' ').toUpperCase();
  };

  const filterDocuments = (status: string) => {
    if (status === 'all') return documents;
    return documents.filter(doc => doc.verification_status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Review</h2>
          <p className="text-muted-foreground">Review and approve professional verification documents</p>
        </div>
        <Button onClick={loadDocuments} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({filterDocuments('pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({filterDocuments('approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({filterDocuments('rejected').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({documents.length})
          </TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterDocuments(status).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterDocuments(status).map((document) => (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-sm">
                              {getDocumentTypeLabel(document.document_type)}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {document.file_name}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(document.verification_status)}>
                          {getStatusIcon(document.verification_status)}
                          <span className="ml-1 capitalize">{document.verification_status}</span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{document.professional_name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(document.created_at).toLocaleDateString()}</span>
                      </div>

                      {document.verification_notes && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <strong>Notes:</strong> {document.verification_notes}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Document Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Professional:</strong> {document.professional_name}
                                </div>
                                <div>
                                  <strong>Type:</strong> {getDocumentTypeLabel(document.document_type)}
                                </div>
                                <div>
                                  <strong>Uploaded:</strong> {new Date(document.created_at).toLocaleDateString()}
                                </div>
                                <div>
                                  <strong>Status:</strong>
                                  <Badge variant={getStatusVariant(document.verification_status)} className="ml-2">
                                    {document.verification_status}
                                  </Badge>
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-muted/50">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">Document File</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(document.file_url, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">{document.file_name}</p>
                              </div>

                              {document.verification_status === 'pending' && (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium">Review Notes (Optional)</label>
                                    <Textarea
                                      placeholder="Add any notes about the document review..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleReview(document.id, 'rejected', reviewNotes)}
                                      variant="destructive"
                                      disabled={processing}
                                      className="flex-1"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => handleReview(document.id, 'approved', reviewNotes)}
                                      disabled={processing}
                                      className="flex-1"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}