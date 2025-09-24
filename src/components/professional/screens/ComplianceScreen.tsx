import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, FileText, Calendar, AlertTriangle, 
  CheckCircle2, Upload, ExternalLink, Camera,
  Clock, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface ComplianceScreenProps {
  user: any;
}

export const ComplianceScreen = ({ user }: ComplianceScreenProps) => {
  const [documents, setDocuments] = useState([
    {
      id: '1',
      type: 'Public Liability Insurance',
      status: 'approved',
      expiryDate: '2024-12-15',
      daysUntilExpiry: 82,
      required: true,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2', 
      type: 'Professional Indemnity Insurance',
      status: 'approved',
      expiryDate: '2024-11-30',
      daysUntilExpiry: 67,
      required: true,
      lastUpdated: '2024-02-01'
    },
    {
      id: '3',
      type: 'Trade License - Plumbing',
      status: 'approved',
      expiryDate: '2025-06-20',
      daysUntilExpiry: 269,
      required: true,
      lastUpdated: '2024-06-20'
    },
    {
      id: '4',
      type: 'Health & Safety Certification',
      status: 'expiring_soon',
      expiryDate: '2024-10-05',
      daysUntilExpiry: 11,
      required: true,
      lastUpdated: '2023-10-05'
    },
    {
      id: '5',
      type: 'Van Insurance',
      status: 'pending_renewal',
      expiryDate: '2024-09-28',
      daysUntilExpiry: 4,
      required: false,
      lastUpdated: '2023-09-28'
    }
  ]);

  const complianceOverview = {
    overallStatus: 'warning', // 'good', 'warning', 'critical'
    documentsApproved: documents.filter(d => d.status === 'approved').length,
    totalRequired: documents.filter(d => d.required).length,
    expiringCount: documents.filter(d => d.daysUntilExpiry <= 30).length,
    blockedBookings: false
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expiring_soon': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending_renewal': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'expiring_soon': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'expired': 
      case 'pending_renewal': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleUploadDocument = (docId: string) => {
    toast.success('Document upload started');
  };

  const handleRenewDocument = (docId: string) => {
    toast.info('Renewal process initiated');
  };

  const handleTextPhoto = (docId: string) => {
    toast.info('Text a photo feature activated');
  };

  const getUrgencyMessage = () => {
    const criticalDocs = documents.filter(d => d.daysUntilExpiry <= 7 && d.required);
    if (criticalDocs.length > 0) {
      return {
        level: 'critical',
        message: `${criticalDocs.length} critical documents expire within 7 days. Auto-bidding disabled.`,
        action: 'Renew immediately'
      };
    }
    
    const expiringDocs = documents.filter(d => d.daysUntilExpiry <= 30);
    if (expiringDocs.length > 0) {
      return {
        level: 'warning', 
        message: `${expiringDocs.length} documents expire within 30 days.`,
        action: 'Schedule renewals'
      };
    }
    
    return {
      level: 'good',
      message: 'All documents are up to date.',
      action: null
    };
  };

  const urgency = getUrgencyMessage();

  return (
    <div className="p-4 space-y-6">
      {/* Compliance Overview */}
      <Card className={`${urgency.level === 'critical' ? 'border-red-300 bg-red-50' : urgency.level === 'warning' ? 'border-orange-300 bg-orange-50' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold">{complianceOverview.documentsApproved}</div>
              <div className="text-xs text-muted-foreground">of {complianceOverview.totalRequired} required</div>
              <Progress 
                value={(complianceOverview.documentsApproved / complianceOverview.totalRequired) * 100} 
                className="mt-2 h-2" 
              />
            </div>
            <div className="text-center p-3 border rounded">
              <div className={`text-2xl font-bold ${urgency.level === 'critical' ? 'text-red-600' : urgency.level === 'warning' ? 'text-orange-600' : 'text-green-600'}`}>
                {complianceOverview.expiringCount}
              </div>
              <div className="text-xs text-muted-foreground">expiring soon</div>
            </div>
          </div>

          <div className={`p-3 rounded border ${
            urgency.level === 'critical' ? 'bg-red-100 border-red-300' : 
            urgency.level === 'warning' ? 'bg-orange-100 border-orange-300' : 
            'bg-green-100 border-green-300'
          }`}>
            <div className="flex items-start gap-2">
              {urgency.level === 'critical' ? (
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              ) : urgency.level === 'warning' ? (
                <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium">{urgency.message}</p>
                {urgency.action && (
                  <p className="text-xs mt-1 opacity-80">{urgency.action}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documents & Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(doc.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{doc.type}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>Expires: {doc.expiryDate}</span>
                      {doc.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(doc.status)} variant="outline">
                  {doc.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Days until expiry</span>
                  <span className={`font-medium ${
                    doc.daysUntilExpiry <= 7 ? 'text-red-600' : 
                    doc.daysUntilExpiry <= 30 ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {doc.daysUntilExpiry} days
                  </span>
                </div>
                <Progress 
                  value={Math.max(0, (doc.daysUntilExpiry / 365) * 100)} 
                  className="h-1"
                />
              </div>

              <div className="flex gap-2">
                {doc.status === 'approved' && doc.daysUntilExpiry <= 60 && (
                  <Button size="sm" variant="outline" onClick={() => handleRenewDocument(doc.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Renew
                  </Button>
                )}
                
                {(doc.status === 'expired' || doc.status === 'pending_renewal') && (
                  <>
                    <Button size="sm" onClick={() => handleUploadDocument(doc.id)}>
                      <Upload className="w-3 h-3 mr-1" />
                      Upload New
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleTextPhoto(doc.id)}>
                      <Camera className="w-3 h-3 mr-1" />
                      Text Photo
                    </Button>
                  </>
                )}
                
                <Button size="sm" variant="ghost">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>

              {doc.daysUntilExpiry <= 7 && doc.required && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                  <strong>Action Required:</strong> This document expires very soon. Auto-bidding will be disabled until renewed.
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-12">
            <Camera className="w-4 h-4 mr-2" />
            Text a photo of your documents for quick OCR processing
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-12">
            <Calendar className="w-4 h-4 mr-2" />
            Set renewal reminders (30, 60, 90 days before expiry)
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-12">
            <RefreshCw className="w-4 h-4 mr-2" />
            Check for document updates
          </Button>
        </CardContent>
      </Card>

      {/* Compliance Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-full p-2">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-sm">Compliance Tips</h4>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Set up auto-renewals where possible to avoid gaps</li>
                <li>• Keep digital copies accessible on your phone</li>
                <li>• Insurance expires in 7 days = auto-bidding paused</li>
                <li>• Required docs missing = booking restrictions apply</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};