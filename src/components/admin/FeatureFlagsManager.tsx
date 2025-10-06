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
import { Slider } from '@/components/ui/slider';
import { Plus, Flag, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FeatureFlagsManager() {
  const { t } = useTranslation('admin');
  const { flags, loading, createFlag, updateFlag, toggleFlag, deleteFlag } = useFeatureFlags();
  const [showDialog, setShowDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rollout_percentage: 0,
  });

  const handleCreateOrUpdate = async () => {
    if (editingFlag) {
      await updateFlag(editingFlag.id, formData);
    } else {
      await createFlag(formData.name, formData.description);
    }
    setShowDialog(false);
    setEditingFlag(null);
    setFormData({ name: '', description: '', rollout_percentage: 0 });
  };

  const handleEdit = (flag: any) => {
    setEditingFlag(flag);
    setFormData({
      name: flag.name,
      description: flag.description || '',
      rollout_percentage: flag.rollout_percentage,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      await deleteFlag(id);
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
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      <span className="font-medium">{flag.name}</span>
                      {flag.is_enabled && (
                        <Badge variant="default">{t('featureFlags.active')}</Badge>
                      )}
                    </div>
                    {flag.description && (
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Rollout: {flag.rollout_percentage}%</span>
                      {flag.target_roles && flag.target_roles.length > 0 && (
                        <span>Roles: {flag.target_roles.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flag.is_enabled}
                      onCheckedChange={(checked) => toggleFlag(flag.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(flag)}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(flag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
              <Label htmlFor="name">Flag Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., new_dashboard"
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

            {editingFlag && (
              <div>
                <Label htmlFor="rollout">Rollout Percentage: {formData.rollout_percentage}%</Label>
                <Slider
                  id="rollout"
                  value={[formData.rollout_percentage]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, rollout_percentage: value })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate} disabled={!formData.name}>
              {editingFlag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
