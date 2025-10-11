import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Edit } from 'lucide-react';

export function BasePricingTable() {
  const [costTemplates, setCostTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadCostTemplates();
  }, []);

  const loadCostTemplates = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('calculator_cost_templates')
        .select('*')
        .order('project_type, tier_key');

      if (error) throw error;
      setCostTemplates(data || []);
    } catch (error) {
      console.error('Load cost templates error:', error);
      toast({
        title: "Load Failed",
        description: "Unable to load pricing data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    setEditValues(template);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const { error } = await (supabase as any)
        .from('calculator_cost_templates')
        .update(editValues)
        .eq('id', editingId);

      if (error) throw error;

      // Log admin action
      await (supabase as any).from('calculator_admin_actions').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'update',
        entity_type: 'cost_template',
        entity_id: editingId,
        changes: editValues
      });

      toast({
        title: "Saved Successfully",
        description: "Pricing has been updated"
      });

      setEditingId(null);
      await loadCostTemplates();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading pricing data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Type</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Base Rate (€/m²)</TableHead>
              <TableHead>Labour %</TableHead>
              <TableHead>Materials %</TableHead>
              <TableHead>Permits %</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">
                  {template.project_type?.replace('_', ' ')}
                </TableCell>
                <TableCell>{template.tier_key}</TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <Input
                      type="number"
                      value={editValues.base_rate_per_sqm || 0}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        base_rate_per_sqm: parseFloat(e.target.value)
                      })}
                      className="w-24"
                    />
                  ) : (
                    `€${template.base_rate_per_sqm?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <Input
                      type="number"
                      value={editValues.labour_percentage || 0}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        labour_percentage: parseFloat(e.target.value)
                      })}
                      className="w-20"
                    />
                  ) : (
                    `${template.labour_percentage || 0}%`
                  )}
                </TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <Input
                      type="number"
                      value={editValues.materials_percentage || 0}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        materials_percentage: parseFloat(e.target.value)
                      })}
                      className="w-20"
                    />
                  ) : (
                    `${template.materials_percentage || 0}%`
                  )}
                </TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <Input
                      type="number"
                      value={editValues.permits_percentage || 0}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        permits_percentage: parseFloat(e.target.value)
                      })}
                      className="w-20"
                    />
                  ) : (
                    `${template.permits_percentage || 0}%`
                  )}
                </TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        * Changes are logged for audit purposes. Refresh the calculator to see updates.
      </p>
    </div>
  );
}
