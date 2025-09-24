import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileEdit, Plus, DollarSign, Calendar, CheckCircle, 
  AlertCircle, Clock, Signature, Download, Eye,
  MessageSquare, ArrowUpCircle, ArrowDownCircle,
  Shield, FileText, User, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  category: 'scope_increase' | 'scope_decrease' | 'material_change' | 'timeline_change' | 'other';
  proposedBy: 'client' | 'professional';
  proposerName: string;
  status: 'draft' | 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  costImpact: number; // positive for increase, negative for decrease
  timelineImpact: number; // days
  createdAt: string;
  updatedAt: string;
  jobId: string;
  jobTitle: string;
  professionalName: string;
  requiresSignature: boolean;
  signedByClient: boolean;
  signedByProfessional: boolean;
  documents: Array<{
    id: string;
    name: string;
    type: 'quote' | 'contract' | 'specification' | 'other';
    url: string;
  }>;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }>;
}

const mockChangeOrders: ChangeOrder[] = [
  {
    id: 'co-1',
    title: 'Additional Outlet Installation',
    description: 'Client requested 3 additional electrical outlets in the kitchen area for appliances.',
    category: 'scope_increase',
    proposedBy: 'client',
    proposerName: 'You',
    status: 'under_review',
    costImpact: 450,
    timelineImpact: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    jobId: 'job-1',
    jobTitle: 'Kitchen Renovation',
    professionalName: 'Maria Santos',
    requiresSignature: true,
    signedByClient: false,
    signedByProfessional: false,
    documents: [
      {
        id: 'doc-1',
        name: 'outlet-installation-quote.pdf',
        type: 'quote',
        url: '/api/placeholder/document'
      }
    ],
    comments: [
      {
        id: 'comment-1',
        author: 'Maria Santos',
        content: 'I can add these outlets. Will need to run new circuits from the panel.',
        timestamp: '2024-01-15T12:00:00Z'
      }
    ]
  },
  {
    id: 'co-2',
    title: 'Material Upgrade - Granite Countertops',
    description: 'Upgrade from laminate to granite countertops as discussed.',
    category: 'material_change',
    proposedBy: 'professional',
    proposerName: 'João Silva',
    status: 'approved',
    costImpact: 2200,
    timelineImpact: 3,
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    jobId: 'job-2',
    jobTitle: 'Kitchen Renovation',
    professionalName: 'João Silva',
    requiresSignature: true,
    signedByClient: true,
    signedByProfessional: true,
    documents: [
      {
        id: 'doc-2',
        name: 'granite-specifications.pdf',
        type: 'specification',
        url: '/api/placeholder/document'
      },
      {
        id: 'doc-3',
        name: 'updated-contract.pdf',
        type: 'contract',
        url: '/api/placeholder/document'
      }
    ],
    comments: [
      {
        id: 'comment-2',
        author: 'You',
        content: 'Approved. Please proceed with the granite installation.',
        timestamp: '2024-01-14T16:45:00Z'
      }
    ]
  }
];

export const ChangeOrderSystem = () => {
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'approved' | 'rejected'>('all');
  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    category: 'scope_increase' as ChangeOrder['category'],
    costImpact: 0,
    timelineImpact: 0
  });

  const filteredOrders = mockChangeOrders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return ['draft', 'proposed', 'under_review'].includes(order.status);
    return order.status === filterStatus;
  });

  const activeOrder = mockChangeOrders.find(order => order.id === selectedOrder);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'under_review': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'proposed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'implemented': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scope_increase': return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
      case 'scope_decrease': return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
      case 'material_change': return <FileEdit className="w-4 h-4 text-blue-600" />;
      case 'timeline_change': return <Calendar className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'scope_increase': return 'Scope Increase';
      case 'scope_decrease': return 'Scope Decrease';
      case 'material_change': return 'Material Change';
      case 'timeline_change': return 'Timeline Change';
      default: return 'Other';
    }
  };

  const handleCreateOrder = () => {
    // Create new change order logic
    setShowCreateForm(false);
    setNewOrder({
      title: '',
      description: '',
      category: 'scope_increase',
      costImpact: 0,
      timelineImpact: 0
    });
  };

  const handleSignature = (orderId: string, signatureType: 'client' | 'professional') => {
    // Handle e-signature logic
    console.log(`Signing ${orderId} as ${signatureType}`);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Change Orders List */}
        <Card className="card-luxury lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-copper" />
                Change Orders
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-hero text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
            
            <div className="flex gap-1">
              {(['all', 'active', 'approved', 'rejected'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="text-xs capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-2 p-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order.id)}
                  className={cn(
                    "p-3 cursor-pointer transition-colors hover:bg-sand-light/50 rounded-lg border",
                    selectedOrder === order.id && "bg-sand-light border-copper"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(order.category)}
                      <h4 className="font-medium text-sm text-charcoal truncate">
                        {order.title}
                      </h4>
                    </div>
                    <Badge className={cn("text-xs", getStatusColor(order.status))}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {order.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex items-center gap-1",
                        order.costImpact > 0 ? "text-red-600" : "text-green-600"
                      )}>
                        <DollarSign className="w-3 h-3" />
                        {order.costImpact > 0 ? '+' : ''}€{order.costImpact}
                      </span>
                      {order.timelineImpact !== 0 && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.timelineImpact > 0 ? '+' : ''}{order.timelineImpact}d
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {order.jobTitle}
                    </span>
                    {order.requiresSignature && (
                      <div className="flex items-center gap-1">
                        <Signature className={cn(
                          "w-3 h-3",
                          order.signedByClient && order.signedByProfessional 
                            ? "text-green-500" 
                            : "text-amber-500"
                        )} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Order Details */}
        <Card className="card-luxury lg:col-span-2 flex flex-col">
          {activeOrder ? (
            <>
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(activeOrder.category)}
                      <CardTitle className="text-lg">{activeOrder.title}</CardTitle>
                      <Badge className={cn("text-xs", getStatusColor(activeOrder.status))}>
                        {activeOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activeOrder.jobTitle} • Proposed by {activeOrder.proposerName}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className={cn(
                      "text-lg font-bold",
                      activeOrder.costImpact > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {activeOrder.costImpact > 0 ? '+' : ''}€{activeOrder.costImpact}
                    </div>
                    <div className="text-xs text-muted-foreground">Cost Impact</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-charcoal">
                      {activeOrder.timelineImpact > 0 ? '+' : ''}{activeOrder.timelineImpact}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Impact</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-charcoal">
                      {getCategoryLabel(activeOrder.category)}
                    </div>
                    <div className="text-xs text-muted-foreground">Category</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground bg-sand-light p-3 rounded-lg">
                      {activeOrder.description}
                    </p>
                  </div>

                  {/* Documents */}
                  {activeOrder.documents.length > 0 && (
                    <div>
                      <h4 className="font-medium text-charcoal mb-3">Supporting Documents</h4>
                      <div className="space-y-2">
                        {activeOrder.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-sand-light rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium text-charcoal">{doc.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">{doc.type}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signatures */}
                  {activeOrder.requiresSignature && (
                    <div>
                      <h4 className="font-medium text-charcoal mb-3 flex items-center gap-2">
                        <Signature className="w-4 h-4" />
                        Electronic Signatures
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="text-sm font-medium">Client</span>
                            </div>
                            {activeOrder.signedByClient ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          {activeOrder.signedByClient ? (
                            <div className="text-xs text-green-600">Signed</div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleSignature(activeOrder.id, 'client')}
                            >
                              Sign Now
                            </Button>
                          )}
                        </Card>
                        
                        <Card className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              <span className="text-sm font-medium">Professional</span>
                            </div>
                            {activeOrder.signedByProfessional ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activeOrder.signedByProfessional ? 'Signed' : 'Pending signature'}
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium text-charcoal mb-3">Discussion</h4>
                    <div className="space-y-3">
                      {activeOrder.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-charcoal">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-3 mt-4">
                        <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <Textarea 
                            placeholder="Add a comment..." 
                            className="min-h-[60px] mb-2"
                          />
                          <Button size="sm" className="bg-gradient-hero text-white">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Action Buttons */}
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(activeOrder.createdAt).toLocaleDateString()} • 
                    Updated: {new Date(activeOrder.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeOrder.status === 'proposed' && (
                      <>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                        <Button size="sm" className="bg-gradient-hero text-white">
                          Approve
                        </Button>
                      </>
                    )}
                    {activeOrder.status === 'under_review' && (
                      <Button size="sm" variant="outline">
                        Request Changes
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : showCreateForm ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-copper" />
                  Create Change Order
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-charcoal mb-2 block">Title</label>
                    <Input
                      placeholder="Brief description of the change"
                      value={newOrder.title}
                      onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-charcoal mb-2 block">Category</label>
                    <select 
                      className="w-full p-2 border border-border rounded-lg bg-background"
                      value={newOrder.category}
                      onChange={(e) => setNewOrder({ ...newOrder, category: e.target.value as ChangeOrder['category'] })}
                    >
                      <option value="scope_increase">Scope Increase</option>
                      <option value="scope_decrease">Scope Decrease</option>
                      <option value="material_change">Material Change</option>
                      <option value="timeline_change">Timeline Change</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-charcoal mb-2 block">Cost Impact (€)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newOrder.costImpact}
                        onChange={(e) => setNewOrder({ ...newOrder, costImpact: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal mb-2 block">Timeline Impact (days)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newOrder.timelineImpact}
                        onChange={(e) => setNewOrder({ ...newOrder, timelineImpact: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-charcoal mb-2 block">Description</label>
                    <Textarea
                      placeholder="Detailed description of the change request"
                      value={newOrder.description}
                      onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="border-t border-border p-4 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder} className="bg-gradient-hero text-white">
                  Create Change Order
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileEdit className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-display font-semibold mb-2">Select a change order</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a change order from the list to view details
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-hero text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Change Order
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};