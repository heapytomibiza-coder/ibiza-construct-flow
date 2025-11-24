import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, TrendingUp, Target, Calendar, 
  FileText, Download, ExternalLink, Trophy,
  Zap, Clock
} from 'lucide-react';
import { EarningsChart } from '../dashboard/EarningsChart';
import { MetricCard } from '../dashboard/MetricCard';

interface EarningsScreenProps {
  user: any;
  stats: any;
}

export const EarningsScreen = ({ user, stats }: EarningsScreenProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const earnings = {
    today: { amount: 280, target: 143, progress: 196 },
    week: { amount: 1240, target: 1000, progress: 124 },
    month: { amount: 4850, target: 4000, progress: 121 }
  };

  const upcomingPayouts = [
    { client: 'Sarah Johnson', amount: 450, date: 'Tomorrow', status: 'confirmed' },
    { client: 'Michael Chen', amount: 230, date: 'Friday', status: 'pending' },
    { client: 'Emma Wilson', amount: 680, date: 'Next week', status: 'in_escrow' }
  ];

  const invoices = [
    { id: 'INV-001', client: 'David Brown', amount: 450, date: '2024-09-23', status: 'paid' },
    { id: 'INV-002', client: 'Lisa Garcia', amount: 320, date: '2024-09-22', status: 'sent' },
    { id: 'INV-003', client: 'John Smith', amount: 180, date: '2024-09-21', status: 'paid' }
  ];

  const milestones = [
    { title: '5-Day Streak', description: 'Hit daily target 5 days in a row', achieved: true, date: 'Today' },
    { title: '€1K Week', description: 'Earn €1,000+ in a single week', achieved: true, date: '2 days ago' },
    { title: '€5K Month', description: 'Monthly earnings milestone', achieved: false, progress: 97 },
    { title: '50 Jobs', description: 'Complete 50 successful jobs', achieved: false, progress: 78 }
  ];

  const getCurrentEarnings = () => earnings[selectedPeriod as keyof typeof earnings];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_escrow': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Earnings Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Today"
          value={`€${earnings.today.amount}`}
          subtitle={`€${earnings.today.target} target`}
          icon={DollarSign}
          trend={{
            value: earnings.today.progress - 100,
            label: 'of target',
            positive: earnings.today.progress >= 100
          }}
          gradient="from-green-500/10 to-emerald-500/5"
        />
        
        <MetricCard
          title="This Week"
          value={`€${earnings.week.amount}`}
          subtitle={`€${earnings.week.target} target`}
          icon={TrendingUp}
          trend={{
            value: earnings.week.progress - 100,
            label: 'of target',
            positive: earnings.week.progress >= 100
          }}
          badge={earnings.week.progress >= 100 ? { text: 'Target Met! 🎉', variant: 'default' } : undefined}
          gradient="from-blue-500/10 to-cyan-500/5"
        />
        
        <MetricCard
          title="This Month"
          value={`€${earnings.month.amount}`}
          subtitle={`€${earnings.month.target} target`}
          icon={Target}
          trend={{
            value: earnings.month.progress - 100,
            label: 'of target',
            positive: earnings.month.progress >= 100
          }}
          gradient="from-purple-500/10 to-pink-500/5"
        />
      </div>

      {/* Earnings Chart */}
      <EarningsChart
        weeklyTarget={earnings.week.target}
      />

      {/* Tabs for different earning views */}
      <Tabs defaultValue="payouts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* Upcoming Payouts */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayouts.map((payout, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{payout.client}</h4>
                      <p className="text-xs text-muted-foreground">Due {payout.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">€{payout.amount}</div>
                      <Badge className={getStatusColor(payout.status)} variant="outline">
                        {payout.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total Expected:</span>
                    <span className="text-green-600">€{upcomingPayouts.reduce((sum, p) => sum + p.amount, 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Center */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Invoice Center</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button size="sm">
                    <FileText className="w-3 h-3 mr-1" />
                    New Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{invoice.id}</h4>
                      <p className="text-xs text-muted-foreground">{invoice.client} • {invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium">€{invoice.amount}</div>
                        <Badge className={getStatusColor(invoice.status)} variant="outline">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targets */}
        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Earnings Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(earnings).map(([period, data]) => (
                  <div key={period} className="text-center p-3 border rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase mb-1">{period}</div>
                    <div className="font-bold text-lg">€{data.amount}</div>
                    <div className="text-xs text-muted-foreground">of €{data.target}</div>
                    <Progress value={Math.min(data.progress, 100)} className="mt-2 h-1" />
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Adjust Targets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks & Milestones */}
        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Milestones & Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      milestone.achieved ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      {milestone.achieved ? (
                        <Trophy className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      {!milestone.achieved && milestone.progress && (
                        <div className="mt-1">
                          <Progress value={milestone.progress} className="h-1" />
                          <span className="text-xs text-muted-foreground">{milestone.progress}%</span>
                        </div>
                      )}
                    </div>
                    {milestone.achieved && (
                      <div className="text-right">
                        <Badge variant="default" className="bg-green-500">✓</Badge>
                        <div className="text-xs text-muted-foreground mt-1">{milestone.date}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};