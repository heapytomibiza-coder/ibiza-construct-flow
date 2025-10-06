import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Award, TrendingUp, Activity } from "lucide-react";

export default function QualityScoreDetail() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQualityScore() {
      try {
        const { data: score, error } = await supabase.rpc('get_my_quality' as any);
        if (error) throw error;
        setData(score);
      } catch (error) {
        console.error('Failed to load quality score:', error);
      } finally {
        setLoading(false);
      }
    }

    loadQualityScore();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Quality Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Quality Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quality score available yet</p>
            <p className="text-sm mt-2">Your score will appear after your first dispute interaction</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = data.score;
  const breakdown = data.breakdown || {};

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Quality Score</CardTitle>
            <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
              {getScoreLabel()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold ${getScoreColor()}`}>
              {score.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Out of 100 · Last updated {new Date(data.last_recalculated_at).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Score Breakdown
            </h3>

            <div className="space-y-3">
              {[
                { key: 'response_timeliness', label: 'Response Timeliness', weight: 25 },
                { key: 'dispute_frequency', label: 'Dispute Frequency', weight: 25 },
                { key: 'cooperation', label: 'Cooperation', weight: 20 },
                { key: 'review_reliability', label: 'Review Reliability', weight: 15 },
                { key: 'sentiment_health', label: 'Sentiment Health', weight: 15 },
              ].map(({ key, label, weight }) => {
                const value = breakdown[key] || 0;
                const percent = (value / 100) * 100;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{label} ({weight}%)</span>
                      <span className="font-medium">{value.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          value >= 80 ? 'bg-green-600' :
                          value >= 60 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How to Improve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="font-semibold min-w-[40px]">1.</div>
              <div>
                <span className="font-medium">Respond promptly</span> to messages and inquiries. Quick responses improve your timeliness score.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold min-w-[40px]">2.</div>
              <div>
                <span className="font-medium">Resolve disputes amicably</span> when possible. Mutual resolutions boost your cooperation score.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold min-w-[40px]">3.</div>
              <div>
                <span className="font-medium">Communicate professionally</span> and maintain a positive tone in all interactions.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold min-w-[40px]">4.</div>
              <div>
                <span className="font-medium">Avoid disputes</span> by setting clear expectations and following through on commitments.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
