import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export function LeaderboardCard() {
  const [selectedBoard, setSelectedBoard] = useState<string>();
  const { leaderboards, entries, userRank, loading, fetchLeaderboardEntries } = useLeaderboard(selectedBoard);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading leaderboard...</div>;
  }

  const handleBoardChange = (boardId: string) => {
    setSelectedBoard(boardId);
    fetchLeaderboardEntries(boardId);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Leaderboard
            </CardTitle>
            <Select value={selectedBoard} onValueChange={handleBoardChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select leaderboard" />
              </SelectTrigger>
              <SelectContent>
                {leaderboards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* User's Rank */}
      {userRank && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <span className="font-bold text-primary">#{userRank.rank}</span>
                </div>
                <div>
                  <p className="font-semibold">Your Rank</p>
                  <p className="text-sm text-muted-foreground">
                    {userRank.user?.full_name || 'You'}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="text-lg">
                {userRank.score.toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Entries */}
      <Card>
        <CardContent className="p-0">
          {entries.length > 0 ? (
            <div className="divide-y">
              {entries.map((entry) => {
                const isUser = userRank?.user_id === entry.user_id;
                const isTopThree = entry.rank <= 3;

                return (
                  <div
                    key={entry.id}
                    className={`p-4 flex items-center gap-4 ${
                      isUser ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(entry.rank) || (
                        <span className={`font-bold ${isTopThree ? 'text-primary' : 'text-muted-foreground'}`}>
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar and Name */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(entry.user?.full_name || entry.user?.display_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.user?.full_name || entry.user?.display_name || 'Anonymous'}
                        {isUser && <Badge variant="outline" className="ml-2">You</Badge>}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No entries yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to get on the leaderboard!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
