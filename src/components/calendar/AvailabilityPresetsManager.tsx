import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvailabilityPresets } from '@/hooks/useAvailabilityPresets';
import { Clock, Loader2, Check, Sparkles, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AvailabilityPresetsManagerProps {
  userId: string;
  professionalId: string;
  onPresetApplied?: () => void;
}

export function AvailabilityPresetsManager({
  userId,
  professionalId,
  onPresetApplied
}: AvailabilityPresetsManagerProps) {
  const { presets, loading, applyPreset, deletePreset } = useAvailabilityPresets(userId);
  const [applying, setApplying] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);

  const handleApplyPreset = async (presetId: string) => {
    setApplying(presetId);
    const success = await applyPreset(presetId, professionalId);
    setApplying(null);
    if (success) {
      onPresetApplied?.();
    }
  };

  const handleDeletePreset = async () => {
    if (!presetToDelete) return;
    await deletePreset(presetToDelete);
    setDeleteDialogOpen(false);
    setPresetToDelete(null);
  };

  const getWorkingDaysText = (workingHours: any) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const enabledDays = days.filter(day => workingHours[day]?.enabled);
    
    if (enabledDays.length === 7) return 'All days';
    if (enabledDays.length === 0) return 'No days';
    
    const dayNames = enabledDays.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3));
    return dayNames.join(', ');
  };

  const getTimeRangeText = (workingHours: any) => {
    const enabledDay = Object.keys(workingHours).find(day => workingHours[day]?.enabled);
    if (!enabledDay) return 'No hours set';
    
    const hours = workingHours[enabledDay];
    return `${hours.start} - ${hours.end}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Availability Presets
          </CardTitle>
          <CardDescription>
            Apply pre-configured schedules to quickly set your availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {presets.map((preset) => (
              <Card key={preset.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{preset.name}</h4>
                        {preset.is_system && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      {preset.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {preset.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeRangeText(preset.working_hours)}
                        </span>
                        <span>•</span>
                        <span>{getWorkingDaysText(preset.working_hours)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApplyPreset(preset.id)}
                        disabled={applying === preset.id}
                        className="gap-2"
                      >
                        {applying === preset.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Apply
                      </Button>
                      
                      {!preset.is_system && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPresetToDelete(preset.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this availability preset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePreset}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
