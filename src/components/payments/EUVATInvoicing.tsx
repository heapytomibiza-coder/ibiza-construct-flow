import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, Download, Eye, RefreshCw, Calculator,
  Building, MapPin, Euro, Calendar, CheckCircle,
  AlertTriangle, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  jobTitle: string;
  professionalName: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  vatNumber?: string;
  billingAddress: {
    companyName?: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    vatNumber?: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface VATCalculation {
  isEUBusiness: boolean;
  hasVATNumber: boolean;
  reverseCharge: boolean;
  vatRate: number;
  vatAmount: number;
  totalWithVAT: number;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    jobTitle: 'Bathroom Renovation',
    professionalName: 'Maria Santos',
    subtotal: 850.00,
    vatRate: 23,
    vatAmount: 195.50,
    totalAmount: 1045.50,
    currency: 'EUR',
    status: 'paid',
    dueDate: '2024-01-30',
    paidDate: '2024-01-15',
    billingAddress: {
      companyName: 'Santos Construction Lda',
      street: 'Rua do Comércio 123',
      city: 'Porto',
      country: 'Portugal',
      postalCode: '4000-123',
      vatNumber: 'PT123456789'
    },
    lineItems: [
      { description: 'Bathroom tile installation', quantity: 1, unitPrice: 650.00, total: 650.00 },
      { description: 'Materials and fixtures', quantity: 1, unitPrice: 200.00, total: 200.00 }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    jobTitle: 'Kitchen Plumbing',
    professionalName: 'João Silva',
    subtotal: 450.00,
    vatRate: 23,
    vatAmount: 103.50,
    totalAmount: 553.50,
    currency: 'EUR',
    status: 'sent',
    dueDate: '2024-02-15',
    billingAddress: {
      street: 'Av. da República 456',
      city: 'Lisbon',
      country: 'Portugal',
      postalCode: '1050-123'
    },
    lineItems: [
      { description: 'Plumbing consultation and repair', quantity: 3, unitPrice: 150.00, total: 450.00 }
    ]
  }
];

export const EUVATInvoicing = () => {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showVATCalculator, setShowVATCalculator] = useState(false);

  const handleRegenerateInvoice = (invoiceId: string) => {
    // Simulate invoice regeneration with updated VAT calculation
    console.log('Regenerating invoice:', invoiceId);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log('Downloading invoice:', invoiceId);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case 'sent': return <Badge className="bg-blue-100 text-blue-700">Sent</Badge>;
      case 'draft': return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const VATCalculator = () => (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-copper" />
          EU VAT Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate VAT based on EU regulations and business location
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-country">Business Country</Label>
            <select id="business-country" className="w-full mt-1 px-3 py-2 border border-border rounded-lg">
              <option value="PT">Portugal (23%)</option>
              <option value="ES">Spain (21%)</option>
              <option value="FR">France (20%)</option>
              <option value="DE">Germany (19%)</option>
              <option value="NL">Netherlands (21%)</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="vat-number">VAT Number (Optional)</Label>
            <Input
              id="vat-number"
              placeholder="PT123456789"
              className="mt-1"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">EU VAT Rules</p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• B2B with valid VAT number: 0% VAT (reverse charge)</li>
                <li>• B2B without VAT number: Home country VAT rate</li>
                <li>• B2C: Service location VAT rate applies</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">EU VAT & Invoicing</h2>
          <p className="text-muted-foreground">Manage VAT-compliant invoices and tax documents</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowVATCalculator(!showVATCalculator)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            VAT Calculator
          </Button>
          <Button className="bg-gradient-hero text-white">
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* VAT Calculator */}
      {showVATCalculator && <VATCalculator />}

      {/* Invoices List */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 border border-sand-dark/20 rounded-lg hover:bg-sand-light/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-copper/10 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-copper" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-charcoal">{invoice.invoiceNumber}</h4>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.jobTitle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-charcoal">
                      €{invoice.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      VAT: €{invoice.vatAmount.toFixed(2)} ({invoice.vatRate}%)
                    </div>
                  </div>
                </div>

                {/* VAT Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-sand-light/20 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">SUBTOTAL</p>
                    <p className="text-sm font-medium">€{invoice.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">VAT ({invoice.vatRate}%)</p>
                    <p className="text-sm font-medium">€{invoice.vatAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">TOTAL</p>
                    <p className="text-sm font-semibold">€{invoice.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Billing Address */}
                {invoice.billingAddress && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Billing Address</span>
                    </div>
                    <div className="text-sm text-muted-foreground pl-6">
                      {invoice.billingAddress.companyName && (
                        <p className="font-medium">{invoice.billingAddress.companyName}</p>
                      )}
                      <p>{invoice.billingAddress.street}</p>
                      <p>{invoice.billingAddress.city}, {invoice.billingAddress.postalCode}</p>
                      <p>{invoice.billingAddress.country}</p>
                      {invoice.billingAddress.vatNumber && (
                        <p className="mt-1 font-medium">VAT: {invoice.billingAddress.vatNumber}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-sand-dark/20">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRegenerateInvoice(invoice.id)}
                    className="text-copper hover:text-copper/80"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* EU VAT Compliance Information */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            EU VAT Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-medium text-green-800 mb-1">VIES Validated</h4>
              <p className="text-sm text-green-600">VAT numbers automatically verified</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-medium text-blue-800 mb-1">OSS Ready</h4>
              <p className="text-sm text-blue-600">One-Stop Shop compliant invoicing</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-medium text-orange-800 mb-1">Audit Trail</h4>
              <p className="text-sm text-orange-600">Complete transaction records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};