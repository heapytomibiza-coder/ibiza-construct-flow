import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, CreditCard, Download, Eye, 
  Euro, Clock, CheckCircle, AlertTriangle,
  Receipt, Wallet, Shield, Calendar, FileText,
  Settings, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedWallet } from '@/components/payments/EnhancedWallet';
import { EUVATInvoicing } from '@/components/payments/EUVATInvoicing';
import { SplitPayments } from '@/components/payments/SplitPayments';
import { EscrowTimeline } from '@/components/payments/EscrowTimeline';
import { DisputeWizard } from '@/components/disputes/DisputeWizard';
import { DisputeTracker } from '@/components/disputes/DisputeTracker';

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'escrow_deposit' | 'escrow_release';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'disputed';
  date: string;
  description: string;
  jobTitle: string;
  professionalName: string;
  paymentMethod: string;
  invoiceNumber?: string;
}

interface Wallet {
  balance: number;
  pendingEscrow: number;
  monthlySpent: number;
  totalSpent: number;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'escrow_deposit',
    amount: 850.00,
    currency: 'EUR',
    status: 'completed',
    date: '2024-01-15',
    description: 'Escrow deposit for bathroom renovation',
    jobTitle: 'Bathroom Renovation',
    professionalName: 'Maria Santos',
    paymentMethod: 'Visa •••• 4242',
    invoiceNumber: 'INV-2024-001'
  },
  {
    id: '2',
    type: 'payment',
    amount: 450.00,
    currency: 'EUR',
    status: 'completed',
    date: '2024-01-14',
    description: 'Plumbing consultation and initial work',
    jobTitle: 'Kitchen Plumbing',
    professionalName: 'João Silva',
    paymentMethod: 'Mastercard •••• 8888',
    invoiceNumber: 'INV-2024-002'
  },
  {
    id: '3',
    type: 'escrow_release',
    amount: 1200.00,
    currency: 'EUR',
    status: 'pending',
    date: '2024-01-13',
    description: 'Final payment release for electrical work',
    jobTitle: 'Electrical Upgrade',
    professionalName: 'Ahmed Al-Rashid',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: '4',
    type: 'refund',
    amount: 75.00,
    currency: 'EUR',
    status: 'completed',
    date: '2024-01-12',
    description: 'Partial refund - materials not used',
    jobTitle: 'Tiling Project',
    professionalName: 'Carlos Rodriguez',
    paymentMethod: 'Visa •••• 4242'
  }
];

const mockWallet: Wallet = {
  balance: 150.00,
  pendingEscrow: 2050.00,
  monthlySpent: 2495.00,
  totalSpent: 8750.00
};

export const ClientPaymentsView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDisputeWizard, setShowDisputeWizard] = useState(false);

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.professionalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'refund': return <Receipt className="w-4 h-4 text-green-500" />;
      case 'escrow_deposit': return <Shield className="w-4 h-4 text-orange-500" />;
      case 'escrow_release': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Euro className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-700">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      case 'disputed': return <Badge className="bg-yellow-100 text-yellow-700">Disputed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'payment': return 'Direct Payment';
      case 'refund': return 'Refund';
      case 'escrow_deposit': return 'Escrow Deposit';
      case 'escrow_release': return 'Escrow Release';
      default: return type;
    }
  };

  const handleDisputeSubmit = (dispute: any) => {
    console.log('Dispute submitted:', dispute);
    setShowDisputeWizard(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'wallet', label: 'Wallet', icon: CreditCard },
    { id: 'invoicing', label: 'EU VAT & Invoicing', icon: FileText },
    { id: 'split', label: 'Split Payments', icon: Settings },
    { id: 'escrow', label: 'Escrow Timeline', icon: Shield },
    { id: 'disputes', label: 'Disputes', icon: AlertTriangle }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet': return <EnhancedWallet />;
      case 'invoicing': return <EUVATInvoicing />;
      case 'split': return <SplitPayments />;
      case 'escrow': return <EscrowTimeline />;
      case 'disputes': return <DisputeTracker />;
      default: return <OverviewContent />;
    }
  };

  const OverviewContent = () => (
    <>
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-copper" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">€{mockWallet.balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card className="card-luxury border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              Escrow Protected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">€{mockWallet.pendingEscrow.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Held securely</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">€{mockWallet.monthlySpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="w-4 h-4 text-green-500" />
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">€{mockWallet.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Preview */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.slice(0, 3).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-sand-dark/20 rounded-lg hover:bg-sand-light/30 transition-colors mb-3 last:mb-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-sand-light rounded-full flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-charcoal">{transaction.description}</h4>
                    {getStatusBadge(transaction.status)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>{getTransactionLabel(transaction.type)} • {transaction.jobTitle}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={cn(
                  "text-lg font-semibold mb-1",
                  transaction.type === 'refund' ? "text-green-600" : "text-charcoal"
                )}>
                  {transaction.type === 'refund' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-luxury border-copper/20 cursor-pointer hover:bg-copper/5 transition-colors" onClick={() => setActiveTab('escrow')}>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-3 text-copper" />
            <h3 className="font-display font-semibold mb-2">Escrow Timeline</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track milestone progress and payment releases
            </p>
            <Button variant="outline" size="sm" className="border-copper text-copper">
              View Timeline
            </Button>
          </CardContent>
        </Card>

        <Card className="card-luxury cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setActiveTab('invoicing')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-display font-semibold mb-2">EU VAT & Invoicing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage VAT-compliant invoices and tax documents
            </p>
            <Button variant="outline" size="sm">
              Manage Invoices
            </Button>
          </CardContent>
        </Card>

        <Card className="card-luxury cursor-pointer hover:bg-orange-50 transition-colors" onClick={() => setShowDisputeWizard(true)}>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-orange-500" />
            <h3 className="font-display font-semibold mb-2">Dispute Resolution</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Need help with a payment or work quality issue?
            </p>
            <Button variant="outline" size="sm" className="border-orange-500 text-orange-500">
              File Dispute
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">Payments & Financial Management</h2>
          <p className="text-muted-foreground">Complete payment system with EU VAT, escrow protection, and dispute resolution</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-gradient-hero text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-sand-dark/20">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-copper text-copper"
                    : "border-transparent text-muted-foreground hover:text-charcoal hover:border-sand-dark/30"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

      {/* Dispute Wizard Modal */}
      {showDisputeWizard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <DisputeWizard 
            onClose={() => setShowDisputeWizard(false)}
            onSubmit={handleDisputeSubmit}
          />
        </div>
      )}
    </div>
  );
};