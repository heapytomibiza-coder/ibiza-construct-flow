import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, AlertCircle, Plus } from 'lucide-react';
import { projectTypes, type ProjectType } from '@/lib/calculator/data-model';

interface VarianceSummary {
  project_type: string;
  total_projects: number;
  avg_variance: number;
  avg_estimated: number;
  avg_actual: number;
  earliest_completion: string;
  latest_completion: string;
}

const PROJECT_LABELS: Record<ProjectType, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  extension: "Extension",
  pool_outdoor: "Pool & Outdoor Kitchen",
  terrace_decking: "Terrace & Decking",
  electrical_rewire: "Electrical Rewire",
  ac_installation: "Climate Control",
  garden_structures: "Garden & Structures",
};

export function PricingInsights() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    session_id: '',
    project_type: '',
    estimated_cost: '',
    actual_cost: '',
    completion_date: '',
    notes: ''
  });

  // Fetch variance summary
  const { data: variances, isLoading, refetch } = useQuery({
    queryKey: ['pricing-variance-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_variance_summary')
        .select('*')
        .order('total_projects', { ascending: false });
      
      if (error) throw error;
      return data as VarianceSummary[];
    }
  });

  // Fetch recent completions
  const { data: recentCompletions } = useQuery({
    queryKey: ['recent-completions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_completions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const estimated = parseFloat(formData.estimated_cost);
    const actual = parseFloat(formData.actual_cost);
    const variance = ((actual - estimated) / estimated) * 100;

    try {
      const { error } = await supabase
        .from('project_completions')
        .insert({
          session_id: formData.session_id || `manual-${Date.now()}`,
          project_type: formData.project_type,
          estimated_cost: estimated,
          actual_cost: actual,
          variance_percentage: variance,
          completion_date: formData.completion_date || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast.success('Project completion recorded successfully');
      setShowAddForm(false);
      setFormData({
        session_id: '',
        project_type: '',
        estimated_cost: '',
        actual_cost: '',
        completion_date: '',
        notes: ''
      });
      refetch();
    } catch (error) {
      console.error('Error recording completion:', error);
      toast.error('Failed to record project completion');
    }
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) < 5) return 'text-green-600';
    if (Math.abs(variance) < 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProjectLabel = (type: string) => {
    return PROJECT_LABELS[type as ProjectType] || type;
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Completion Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Pricing Accuracy Insights</h3>
          <p className="text-sm text-muted-foreground">
            Track actual vs estimated costs to improve calculator accuracy
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Record Completion
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record Completed Project</CardTitle>
            <CardDescription>
              Enter actual project costs to track pricing accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_type">Project Type *</Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value) => setFormData({ ...formData, project_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {PROJECT_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="session_id">Session ID (Optional)</Label>
                  <Input
                    id="session_id"
                    placeholder="e.g., calc_session_123"
                    value={formData.session_id}
                    onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_cost">Estimated Cost (€) *</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    step="0.01"
                    placeholder="20000"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="actual_cost">Actual Cost (€) *</Label>
                  <Input
                    id="actual_cost"
                    type="number"
                    step="0.01"
                    placeholder="22500"
                    value={formData.actual_cost}
                    onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional context about variance..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Completion</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Variance Summary Cards */}
      {variances && variances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variances.map((variance) => (
            <Card key={variance.project_type}>
              <CardHeader>
                <CardTitle className="text-base">
                  {getProjectLabel(variance.project_type)}
                </CardTitle>
                <CardDescription>
                  {variance.total_projects} completed project{variance.total_projects > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Variance:</span>
                  <span className={`font-semibold flex items-center gap-1 ${getVarianceColor(variance.avg_variance)}`}>
                    {variance.avg_variance > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {variance.avg_variance.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Estimated:</span>
                  <span>€{variance.avg_estimated.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Actual:</span>
                  <span>€{variance.avg_actual.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start recording completed projects to see pricing accuracy insights
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Record First Completion
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Completions */}
      {recentCompletions && recentCompletions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCompletions.map((completion: any) => (
                <div key={completion.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{getProjectLabel(completion.project_type)}</p>
                    <p className="text-sm text-muted-foreground">
                      Est: €{completion.estimated_cost} → Actual: €{completion.actual_cost}
                    </p>
                  </div>
                  <div className={`font-semibold ${getVarianceColor(completion.variance_percentage)}`}>
                    {completion.variance_percentage > 0 ? '+' : ''}
                    {completion.variance_percentage?.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
