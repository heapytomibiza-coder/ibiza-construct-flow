import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, MessageSquare, Heart, Share, 
  TrendingUp, Award, Camera, Reply
} from 'lucide-react';
import { toast } from 'sonner';

interface ReviewsScreenProps {
  user: any;
}

export const ReviewsScreen = ({ user }: ReviewsScreenProps) => {
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const overallStats = {
    averageRating: 4.8,
    totalReviews: 47,
    distribution: {
      5: 38,
      4: 7,
      3: 1,
      2: 1,
      1: 0
    },
    recentTrend: '+0.2 this month'
  };

  const reviews = [
    {
      id: '1',
      client: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      date: '2 days ago',
      job: 'Kitchen Installation',
      review: 'Absolutely fantastic work! Professional, punctual, and the quality exceeded my expectations. The kitchen looks amazing and everything was completed on time.',
      photos: ['kitchen1.jpg', 'kitchen2.jpg'],
      helpful: 12,
      responded: false,
      featured: true
    },
    {
      id: '2', 
      client: 'Michael Chen',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      date: '1 week ago',
      job: 'Bathroom Renovation',
      review: 'Great communication throughout the project. Very clean work area and attention to detail. Highly recommend!',
      photos: [],
      helpful: 8,
      responded: true,
      response: 'Thank you Michael! It was a pleasure working with you. Enjoy your new bathroom!',
      featured: false
    },
    {
      id: '3',
      client: 'Emma Wilson', 
      avatar: '/api/placeholder/40/40',
      rating: 4,
      date: '2 weeks ago',
      job: 'Plumbing Repair',
      review: 'Quick response for emergency repair. Fixed the issue efficiently. Only minor complaint is the cleanup could have been slightly better.',
      photos: [],
      helpful: 5,
      responded: true,
      response: 'Thanks Emma! I apologize about the cleanup - I\'ve improved my process since then. Will do better next time!',
      featured: false
    },
    {
      id: '4',
      client: 'David Brown',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      date: '3 weeks ago',
      job: 'Tile Installation',
      review: 'Perfect tile work! Love the pattern and finish. Very patient explaining the process and options.',
      photos: ['tiles1.jpg'],
      helpful: 15,
      responded: false,
      featured: false
    }
  ];

  const badges = [
    { name: 'On-Time Pro', description: '95%+ punctuality rate', earned: true },
    { name: 'Clean Workspace', description: 'Consistently clean job sites', earned: true },
    { name: '5-Star Specialist', description: '90%+ 5-star reviews', earned: true },
    { name: '50 Jobs Club', description: 'Completed 50+ successful jobs', earned: false, progress: 94 }
  ];

  const quickResponses = [
    'Thank you so much for the kind review!',
    'It was a pleasure working with you!', 
    'I\'m glad you\'re happy with the results!',
    'Thanks for choosing my services!'
  ];

  const handleQuickResponse = (reviewId: string, response: string) => {
    toast.success('Response sent!');
    setSelectedResponse(null);
  };

  const handleCustomResponse = (reviewId: string) => {
    toast.info('Custom response editor opened');
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="p-4 space-y-6">
      {/* Overall Rating Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Review Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{overallStats.averageRating}</div>
              <div className="flex justify-center gap-1 my-1">
                {renderStars(Math.floor(overallStats.averageRating))}
              </div>
              <div className="text-sm text-muted-foreground">
                {overallStats.totalReviews} reviews
              </div>
              <div className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {overallStats.recentTrend}
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(overallStats.distribution).reverse().map(([stars, count]) => (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span>{stars}★</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded">
                    <div 
                      className="bg-yellow-500 h-2 rounded" 
                      style={{ width: `${(count / overallStats.totalReviews) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Highlights & Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Profile Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${badge.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    badge.earned ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {badge.earned ? (
                      <Award className="w-3 h-3 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{badge.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {!badge.earned && badge.progress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{badge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full" 
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Reviews
            </span>
            <Badge variant="secondary">{reviews.filter(r => !r.responded).length} need response</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className={`border rounded-lg p-4 ${review.featured ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              {review.featured && (
                <Badge variant="default" className="mb-2 bg-yellow-500">
                  ⭐ Featured Review
                </Badge>
              )}
              
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback>{review.client[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.client}</span>
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-muted-foreground">• {review.date}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">{review.job}</p>
                  <p className="text-sm mb-3">{review.review}</p>
                  
                  {review.photos.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.photos.map((photo, index) => (
                        <div key={index} className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Camera className="w-4 h-4 text-gray-500" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {review.helpful} helpful
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Share className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>
                  
                  {review.responded ? (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Reply className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Your Response</span>
                      </div>
                      <p className="text-xs text-blue-700">{review.response}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedResponse === review.id ? (
                        <div className="space-y-2">
                          <div className="text-xs font-medium">Quick Responses:</div>
                          {quickResponses.map((response, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 mr-2 mb-1"
                              onClick={() => handleQuickResponse(review.id, response)}
                            >
                              {response}
                            </Button>
                          ))}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCustomResponse(review.id)}
                            >
                              Custom Response
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedResponse(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedResponse(review.id)}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Respond
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};