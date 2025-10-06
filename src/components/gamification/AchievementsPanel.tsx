import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock, CheckCircle, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AchievementsPanel() {
  const { achievements, availableAchievements, loading, claimAchievement } = useAchievements();

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading achievements...</div>;
  }

  const completedCount = achievements.filter(a => a.completed_at).length;
  const unclaimedCount = achievements.filter(a => a.completed_at && !a.claimed_at).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{unclaimedCount}</p>
              <p className="text-sm text-muted-foreground">Unclaimed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{availableAchievements.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="in-progress">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {achievements
            .filter(a => !a.completed_at)
            .map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{achievement.achievement.name}</h3>
                        <Badge variant="outline">{achievement.achievement.points_reward} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {achievement.achievement.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.progress} / {achievement.achievement.requirement_value}
                          </span>
                        </div>
                        <Progress
                          value={(achievement.progress / achievement.achievement.requirement_value) * 100}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          {achievements.filter(a => !a.completed_at).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No achievements in progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {achievements
            .filter(a => a.completed_at)
            .map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold">{achievement.achievement.name}</h3>
                        <Badge variant="outline">{achievement.achievement.points_reward} pts</Badge>
                        {!achievement.claimed_at && (
                          <Badge variant="default" className="ml-auto">
                            <Gift className="h-3 w-3 mr-1" />
                            Unclaimed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed on {new Date(achievement.completed_at!).toLocaleDateString()}
                      </p>
                    </div>
                    {!achievement.claimed_at && (
                      <Button
                        size="sm"
                        onClick={() => claimAchievement(achievement.achievement_id)}
                      >
                        Claim Reward
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          {achievements.filter(a => a.completed_at).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No completed achievements yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {availableAchievements.map((achievement) => {
            const userAchievement = achievements.find(a => a.achievement_id === achievement.id);
            const isLocked = !userAchievement;
            const isCompleted = userAchievement?.completed_at;

            return (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isLocked ? 'bg-muted' : isCompleted ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                      {isLocked ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Trophy className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <Badge variant="outline">{achievement.points_reward} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {userAchievement && !isCompleted && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span>
                              {userAchievement.progress} / {achievement.requirement_value}
                            </span>
                          </div>
                          <Progress
                            value={(userAchievement.progress / achievement.requirement_value) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
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
