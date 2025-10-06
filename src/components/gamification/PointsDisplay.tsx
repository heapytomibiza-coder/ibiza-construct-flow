import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PointsDisplay() {
  const { userPoints, transactions, allTiers, loading, getNextTier, getProgressToNextTier } = useLoyaltyPoints();

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading points...</div>;
  }

  const nextTier = getNextTier();
  const progress = getProgressToNextTier();
  const currentTier = userPoints?.tier;

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Loyalty Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold">{userPoints?.current_balance || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Points</p>
                <p className="text-3xl font-bold">{userPoints?.total_points || 0}</p>
              </div>
            </div>

            {/* Tier Information */}
            {currentTier && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" style={{ color: currentTier.color || undefined }} />
                    <span className="font-semibold">{currentTier.name} Tier</span>
                  </div>
                  <Badge variant="outline">Level {currentTier.level}</Badge>
                </div>
                
                {nextTier && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress to {nextTier.name}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground">
                      {nextTier.points_required - (userPoints?.total_points || 0)} points to next tier
                    </p>
                  </div>
                )}

                {/* Current Perks */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Your Perks:</p>
                  <ul className="space-y-1">
                    {currentTier.perks.map((perk, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Transactions and Tiers */}
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
          <TabsTrigger value="tiers">All Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {transactions.length > 0 ? (
                <div className="divide-y">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {transaction.description || transaction.source}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={transaction.transaction_type === 'spend' ? 'destructive' : 'default'}
                        >
                          {transaction.transaction_type === 'spend' ? '-' : '+'}
                          {Math.abs(transaction.points)}
                        </Badge>
                        <TrendingUp
                          className={`h-4 w-4 ${
                            transaction.transaction_type === 'spend'
                              ? 'text-destructive rotate-180'
                              : 'text-green-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          {allTiers.map((tier) => {
            const isCurrentTier = currentTier?.id === tier.id;
            const isUnlocked = (userPoints?.total_points || 0) >= tier.points_required;

            return (
              <Card
                key={tier.id}
                className={isCurrentTier ? 'border-primary' : ''}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${tier.color}20` }}
                      >
                        <Award className="h-6 w-6" style={{ color: tier.color || undefined }} />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {tier.name}
                          {isCurrentTier && <Badge>Current</Badge>}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tier.points_required.toLocaleString()} points required
                        </p>
                      </div>
                    </div>
                    {isUnlocked && !isCurrentTier && (
                      <Badge variant="outline">Unlocked</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Perks:</p>
                    <ul className="space-y-1">
                      {tier.perks.map((perk, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
