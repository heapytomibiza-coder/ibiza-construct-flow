import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, Plus, Trash2, Star, MapPin, 
  Wallet, Shield, Euro, Calendar, Settings,
  Check, AlertCircle, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand: string;
  lastFour: string;
  expiresMonth?: number;
  expiresYear?: number;
  isDefault: boolean;
  billingAddress: {
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
}

interface WalletBalance {
  available: number;
  pendingEscrow: number;
  monthlySpent: number;
  totalLifetime: number;
  currency: string;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    brand: 'Visa',
    lastFour: '4242',
    expiresMonth: 12,
    expiresYear: 2027,
    isDefault: true,
    billingAddress: {
      street: 'Rua Augusta 123',
      city: 'Lisbon',
      country: 'Portugal',
      postalCode: '1100-048'
    }
  },
  {
    id: '2',
    type: 'card',
    brand: 'Mastercard',
    lastFour: '8888',
    expiresMonth: 8,
    expiresYear: 2026,
    isDefault: false,
    billingAddress: {
      street: 'Av. da Liberdade 456',
      city: 'Porto',
      country: 'Portugal',
      postalCode: '4000-322'
    }
  }
];

const mockBalance: WalletBalance = {
  available: 150.00,
  pendingEscrow: 2850.00,
  monthlySpent: 1245.00,
  totalLifetime: 12750.00,
  currency: 'EUR'
};

export const EnhancedWallet = () => {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [showAddCard, setShowAddCard] = useState(false);

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const handleDeleteMethod = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.filter(method => method.id !== methodId)
    );
  };

  const getCardIcon = (brand: string) => {
    return <CreditCard className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-luxury border-copper/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-copper" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">
              €{mockBalance.available.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ready for instant use</p>
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
            <div className="text-2xl font-bold text-charcoal">
              €{mockBalance.pendingEscrow.toFixed(2)}
            </div>
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
            <div className="text-2xl font-bold text-charcoal">
              €{mockBalance.monthlySpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="w-4 h-4 text-green-500" />
              Lifetime Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">
              €{mockBalance.totalLifetime.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-copper" />
                Payment Methods
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your saved payment methods
              </p>
            </div>
            <Button 
              onClick={() => setShowAddCard(true)}
              className="bg-gradient-hero text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                method.isDefault 
                  ? "border-copper bg-copper/5" 
                  : "border-sand-dark/20 hover:border-copper/30"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                    {getCardIcon(method.brand)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal">
                        {method.brand} •••• {method.lastFour}
                      </span>
                      {method.isDefault && (
                        <Badge className="bg-copper text-white text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {method.expiresMonth && method.expiresYear && (
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiresMonth.toString().padStart(2, '0')}/{method.expiresYear}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMethod(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {method.billingAddress && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {method.billingAddress.street}, {method.billingAddress.city}, {method.billingAddress.country}
                  </span>
                </div>
              )}
            </div>
          ))}

          {paymentMethods.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-display font-semibold mb-2">No payment methods</h3>
              <p className="text-muted-foreground mb-4">
                Add a payment method to get started with secure transactions
              </p>
              <Button 
                onClick={() => setShowAddCard(true)}
                className="bg-gradient-hero text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Security & Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Escrow Protection Active</p>
              <p className="text-sm text-green-600">Your payments are protected until work is completed</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">PCI DSS Compliant</p>
              <p className="text-sm text-blue-600">Bank-level security for all payment data</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Dispute Protection</p>
              <p className="text-sm text-orange-600">48-72 hour resolution guarantee for payment disputes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};