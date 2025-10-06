import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MessageCircle } from "lucide-react";

interface RatingSummaryProps {
  summary: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: any;
    category_averages: any;
    response_rate: number;
  };
  showCategories?: boolean;
}

export const RatingSummary = ({ summary, showCategories = true }: RatingSummaryProps) => {
  const { 
    total_reviews, 
    average_rating, 
    rating_distribution,
    category_averages,
    response_rate 
  } = summary;

  const distribution = (rating_distribution || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }) as Record<string, number>;
  const maxCount = Math.max(...Object.values(distribution).map(v => Number(v) || 0));

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-success";
    if (rating >= 3.5) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getRatingColor(average_rating)}`}>
              {average_rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(average_rating)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {total_reviews} {total_reviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating.toString()] || 0;
              const percentage = total_reviews > 0 ? (count / total_reviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-warning text-warning" />
                  </div>
                  <Progress 
                    value={percentage} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Category Ratings */}
      {showCategories && Object.keys(category_averages || {}).length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Category Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(category_averages || {}).map(([category, avg]) => {
              const avgNum = Number(avg) || 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm capitalize">{category}</span>
                    <span className="text-sm font-medium">{avgNum.toFixed(1)}</span>
                  </div>
                  <Progress 
                    value={(avgNum / 5) * 100} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Response Rate */}
      {response_rate > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Response Rate</span>
            </div>
            <Badge variant="secondary">
              {response_rate.toFixed(0)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This professional responds to {response_rate.toFixed(0)}% of reviews
          </p>
        </Card>
      )}
    </div>
  );
};
