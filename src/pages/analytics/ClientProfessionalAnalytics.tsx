import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/navigation/BackButton';
import { Users, Star, Repeat, TrendingUp } from 'lucide-react';

export default function ClientProfessionalAnalytics() {
  const { user } = useAuth();

  // Placeholder data - will be connected to real data
  const stats = {
    totalProfessionals: 12,
    repeatCollaborations: 5,
    avgRating: 4.7,
    topCategory: 'Web Development'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton fallbackPath="/dashboard/client/analytics" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-600" />
            Professional Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare professionals and track your collaboration history
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Professionals Hired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.totalProfessionals}</div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Repeat Collaborations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{stats.repeatCollaborations}</div>
              <Repeat className="h-8 w-8 text-green-600 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">42% repeat hire rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-yellow-600">{stats.avgRating}</div>
              <Star className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 0.3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{stats.topCategory}</div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Professionals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'John Smith', category: 'Web Dev', rating: 4.9, jobs: 3, onTime: '100%' },
              { name: 'Sarah Johnson', category: 'Design', rating: 4.8, jobs: 2, onTime: '100%' },
              { name: 'Mike Chen', category: 'Marketing', rating: 4.7, jobs: 4, onTime: '95%' },
            ].map((pro, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {pro.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{pro.name}</h3>
                    <p className="text-sm text-muted-foreground">{pro.category}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {pro.rating}
                    </div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{pro.jobs}</div>
                    <div className="text-xs text-muted-foreground">Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{pro.onTime}</div>
                    <div className="text-xs text-muted-foreground">On Time</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiring by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: 'Web Development', percentage: 42, count: 5 },
                { category: 'Design', percentage: 25, count: 3 },
                { category: 'Marketing', percentage: 17, count: 2 },
                { category: 'Writing', percentage: 16, count: 2 },
              ].map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="text-muted-foreground">{item.count} professionals ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${item.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaboration Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Project Duration</span>
                  <span className="text-xl font-bold text-primary">3.2 weeks</span>
                </div>
                <p className="text-xs text-muted-foreground">Across all completed projects</p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Communication Response Time</span>
                  <span className="text-xl font-bold text-green-600">2.4 hours</span>
                </div>
                <p className="text-xs text-muted-foreground">Average response from professionals</p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Milestone Completion Rate</span>
                  <span className="text-xl font-bold text-blue-600">96%</span>
                </div>
                <p className="text-xs text-muted-foreground">On-time milestone deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
