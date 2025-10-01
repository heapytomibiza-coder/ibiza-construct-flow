/**
 * Browse and manage question packs
 * Phase 4: Uses generated contract clients from @contracts/clients/packs
 */

import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Play, Archive, Search } from 'lucide-react';
import { useAdminUi } from '@/stores/adminUi';
import {
  useGetAdminPacks,
  usePostAdminPacksApprove,
  usePostAdminPacksActivate,
  usePostAdminPacksRetire,
} from '../../../../packages/@contracts/clients/packs';

export function PackBrowser() {
  // UI state from Zustand (filters, selections, modals)
  const { filters, setFilters } = useAdminUi();

  // Server state from generated contract client
  const { data: packs = [], isLoading } = useGetAdminPacks(filters);

  // Mutations from generated contract client (automatic invalidation built-in)
  const approveMutation = usePostAdminPacksApprove();
  const activateMutation = usePostAdminPacksActivate();
  const retireMutation = usePostAdminPacksRetire();

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
                value={filters.slug || ''}
                onChange={(e) => setFilters({ slug: e.target.value || undefined })}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-48">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(v) => setFilters({ status: v ? (v as any) : undefined })}
            >
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
            <Select 
              value={filters.source || ''} 
              onValueChange={(v) => setFilters({ source: v ? (v as any) : undefined })}
            >
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
                      onClick={() => approveMutation.mutate({ packId: pack.pack_id })}
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
                      onClick={() => activateMutation.mutate({ packId: pack.pack_id })}
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
                      onClick={() => retireMutation.mutate({ packId: pack.pack_id })}
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
