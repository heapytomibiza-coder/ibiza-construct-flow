import { useState } from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Flag, Trash2, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FeatureFlag } from '@/hooks/useFeatureFlags';

export default function FeatureFlagsManager() {
  const { t } = useTranslation('admin');
  const { flags, loading, createFlag, updateFlag, toggleFlag, deleteFlag } = useFeatureFlags();
  const [showDialog, setShowDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    description: '',
    audienceRoles: '',
  });

  const handleCreateOrUpdate = async () => {
    const audience = formData.audienceRoles.trim() 
      ? { roles: formData.audienceRoles.split(',').map(r => r.trim()) }
      : {};

    if (editingFlag) {
      await updateFlag(editingFlag.key, {
        description: formData.description || null,
        audience,
      });
    } else {
      await createFlag(formData.key, formData.description || undefined, false, audience);
    }
    setShowDialog(false);
    setEditingFlag(null);
    setFormData({ key: '', description: '', audienceRoles: '' });
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    const roles = flag.audience?.roles ? (flag.audience.roles as string[]).join(', ') : '';
    setFormData({
      key: flag.key,
      description: flag.description || '',
      audienceRoles: roles,
    });
    setShowDialog(true);
  };

  const handleDelete = async (key: string) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      await deleteFlag(key);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('featureFlags.title')}</h2>
          <p className="text-muted-foreground">Manage feature rollouts and experiments</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Flag
        </Button>
      </div>

      {loading && !flags.length ? (
        <p className="text-center text-muted-foreground py-8">{t('featureFlags.loading')}</p>
      ) : (
        <div className="grid gap-4">
          {flags.map((flag) => {
            const roles = flag.audience?.roles as string[] | undefined;
            return (
              <Card key={flag.key}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        <span className="font-medium">{flag.key}</span>
                        {flag.enabled && (
                          <Badge variant="default">{t('featureFlags.active')}</Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {roles && roles.length > 0 && (
                          <span>Roles: {roles.join(', ')}</span>
                        )}
                        {(!roles || roles.length === 0) && (
                          <span>All users</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={(checked) => toggleFlag(flag.key, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(flag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(flag.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="key">Flag Key</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="e.g., analytics_v1"
                disabled={!!editingFlag}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this flag control?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="roles">Target Roles (comma-separated)</Label>
              <Input
                id="roles"
                value={formData.audienceRoles}
                onChange={(e) => setFormData({ ...formData, audienceRoles: e.target.value })}
                placeholder="e.g., admin, moderator"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to allow all users. Separate multiple roles with commas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate} disabled={!formData.key}>
              {editingFlag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
