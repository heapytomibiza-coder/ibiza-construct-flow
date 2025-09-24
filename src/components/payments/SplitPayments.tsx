import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building, User, CreditCard, PieChart, 
  ArrowRight, Calculator, Receipt, Settings,
  Euro, Percent, Check, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitRule {
  id: string;
  name: string;
  description: string;
  companyPercentage: number;
  personalPercentage: number;
  isDefault: boolean;
  applicableCategories: string[];
}

interface SplitTransaction {
  id: string;
  jobTitle: string;
  totalAmount: number;
  companyAmount: number;
  personalAmount: number;
  companyCard: string;
  personalCard: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  splitRule: string;
}

const mockSplitRules: SplitRule[] = [
  {
    id: '1',
    name: 'Business Expense',
    description: 'Company pays 80%, personal pays 20%',
    companyPercentage: 80,
    personalPercentage: 20,
    isDefault: true,
    applicableCategories: ['renovation', 'repairs', 'maintenance']
  },
  {
    id: '2',
    name: 'Home Office',
    description: '60% business deductible for home office space',
    companyPercentage: 60,
    personalPercentage: 40,
    isDefault: false,
    applicableCategories: ['electrical', 'plumbing', 'renovation']
  },
  {
    id: '3',
    name: 'Personal Project',
    description: 'Fully personal expense',
    companyPercentage: 0,
    personalPercentage: 100,
    isDefault: false,
    applicableCategories: ['landscaping', 'decoration', 'personal']
  }
];

const mockTransactions: SplitTransaction[] = [
  {
    id: '1',
    jobTitle: 'Office Renovation',
    totalAmount: 2500.00,
    companyAmount: 2000.00,
    personalAmount: 500.00,
    companyCard: 'Business Visa •••• 1234',
    personalCard: 'Personal Visa •••• 5678',
    date: '2024-01-15',
    status: 'completed',
    splitRule: 'Business Expense'
  },
  {
    id: '2',
    jobTitle: 'Kitchen Upgrade',
    totalAmount: 1800.00,
    companyAmount: 1080.00,
    personalAmount: 720.00,
    companyCard: 'Business Mastercard •••• 9012',
    personalCard: 'Personal Visa •••• 5678',
    date: '2024-01-12',
    status: 'pending',
    splitRule: 'Home Office'
  }
];

export const SplitPayments = () => {
  const [splitRules, setSplitRules] = useState(mockSplitRules);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState('');
  const [selectedRule, setSelectedRule] = useState(splitRules[0]);

  const handleSetDefaultRule = (ruleId: string) => {
    setSplitRules(rules =>
      rules.map(rule => ({
        ...rule,
        isDefault: rule.id === ruleId
      }))
    );
  };

  const calculateSplit = (amount: number, rule: SplitRule) => {
    const companyAmount = (amount * rule.companyPercentage) / 100;
    const personalAmount = (amount * rule.personalPercentage) / 100;
    return { companyAmount, personalAmount };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-700">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const SplitCalculator = () => {
    const amount = parseFloat(calculatorAmount) || 0;
    const split = calculateSplit(amount, selectedRule);

    return (
      <Card className="card-luxury border-copper/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-copper" />
            Split Payment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Total Amount (€)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={calculatorAmount}
                onChange={(e) => setCalculatorAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="split-rule">Split Rule</Label>
              <select
                id="split-rule"
                value={selectedRule.id}
                onChange={(e) => {
                  const rule = splitRules.find(r => r.id === e.target.value);
                  if (rule) setSelectedRule(rule);
                }}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
              >
                {splitRules.map(rule => (
                  <option key={rule.id} value={rule.id}>{rule.name}</option>
                ))}
              </select>
            </div>
          </div>

          {amount > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-sand-light/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">Company ({selectedRule.companyPercentage}%)</p>
                  <p className="text-lg font-bold text-blue-600">€{split.companyAmount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">Personal ({selectedRule.personalPercentage}%)</p>
                  <p className="text-lg font-bold text-green-600">€{split.personalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">Split Payments</h2>
          <p className="text-muted-foreground">Manage business and personal payment splits</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowCalculator(!showCalculator)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculator
          </Button>
          <Button className="bg-gradient-hero text-white">
            <PieChart className="w-4 h-4 mr-2" />
            Create Split Rule
          </Button>
        </div>
      </div>

      {/* Split Calculator */}
      {showCalculator && <SplitCalculator />}

      {/* Split Rules */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-copper" />
            Split Rules
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how payments are split between business and personal
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {splitRules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                rule.isDefault 
                  ? "border-copper bg-copper/5" 
                  : "border-sand-dark/20 hover:border-copper/30"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-copper/10 rounded-full flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-copper" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-charcoal">{rule.name}</h4>
                      {rule.isDefault && (
                        <Badge className="bg-copper text-white text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!rule.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefaultRule(rule.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Company: {rule.companyPercentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Personal: {rule.personalPercentage}%</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Applies to:</span> {rule.applicableCategories.join(', ')}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Split Transactions */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>Recent Split Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border border-sand-dark/20 rounded-lg hover:bg-sand-light/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-charcoal">{transaction.jobTitle}</h4>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Split using: {transaction.splitRule}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-charcoal">
                      €{transaction.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Business Payment</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600">€{transaction.companyAmount.toFixed(2)}</p>
                    <p className="text-sm text-blue-600">{transaction.companyCard}</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Personal Payment</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">€{transaction.personalAmount.toFixed(2)}</p>
                    <p className="text-sm text-green-600">{transaction.personalCard}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Benefits Information */}
      <Card className="card-luxury border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-green-600" />
            Tax Benefits & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Automatic Expense Categorization</p>
                <p className="text-sm text-muted-foreground">
                  Business portions automatically tagged for tax deduction
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Audit-Ready Records</p>
                <p className="text-sm text-muted-foreground">
                  Complete documentation for tax authorities
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Professional Advice Required</p>
                <p className="text-sm text-muted-foreground">
                  Consult your accountant for specific deduction rules
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Export for Accounting</p>
                <p className="text-sm text-muted-foreground">
                  CSV/Excel export for your accounting software
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};