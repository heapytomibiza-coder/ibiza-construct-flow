/**
 * Browse and manage question packs
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listPacks, approvePack, activatePack, retirePack } from '@/lib/api/questionPacks';
import { Check, X, Play, Archive, Search } from 'lucide-react';
import { toast } from 'sonner';

export function PackBrowser() {
  const [filters, setFilters] = useState({ status: '', source: '', slug: '' });
  const queryClient = useQueryClient();

  const { data: packs = [], isLoading } = useQuery({
    queryKey: ['question-packs', filters],
    queryFn: () => listPacks(filters),
  });

  const approveMutation = useMutation({
    mutationFn: approvePack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-packs'] });
      toast.success('Pack approved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const activateMutation = useMutation({
    mutationFn: activatePack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-packs'] });
      toast.success('Pack activated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to activate: ${error.message}`);
    },
  });

  const retireMutation = useMutation({
    mutationFn: retirePack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-packs'] });
      toast.success('Pack retired successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to retire: ${error.message}`);
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search Slug</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="tiler-floor-tiling..."
                value={filters.slug}
                onChange={(e) => setFilters(f => ({ ...f, slug: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-48">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-sm font-medium mb-2 block">Source</label>
            <Select value={filters.source} onValueChange={(v) => setFilters(f => ({ ...f, source: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Pack List */}
      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading packs...</Card>
      ) : packs.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No packs found. Import your first pack to get started.
        </Card>
      ) : (
        <div className="grid gap-4">
          {packs.map((pack) => (
            <Card key={pack.pack_id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{pack.micro_slug}</h3>
                    <Badge variant="outline">v{pack.version}</Badge>
                    <Badge variant={
                      pack.status === 'approved' ? 'default' :
                      pack.status === 'draft' ? 'secondary' : 'destructive'
                    }>
                      {pack.status}
                    </Badge>
                    <Badge variant="outline">{pack.source}</Badge>
                    {pack.is_active && (
                      <Badge className="bg-green-500">ACTIVE</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {pack.content.questions.length} questions • {pack.content.category} › {pack.content.name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Created {new Date(pack.created_at).toLocaleDateString()}
                    {pack.approved_at && ` • Approved ${new Date(pack.approved_at).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="flex gap-2">
                  {pack.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(pack.pack_id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  
                  {pack.status === 'approved' && !pack.is_active && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => activateMutation.mutate(pack.pack_id)}
                      disabled={activateMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                  )}

                  {pack.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retireMutation.mutate(pack.pack_id)}
                      disabled={retireMutation.isPending}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Retire
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                  >
                    <Link to={`/admin/questions/compare/${pack.micro_slug}`}>
                      Compare
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
