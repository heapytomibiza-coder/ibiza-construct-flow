/**
 * Professional Service Preferences Hook
 * Handles batch CRUD operations for professional service selections
 * 
 * Key architecture: Tracks "deltas" (adds/removes) from existing DB state
 * to prevent accidental mass deactivation and correctly show existing selections.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServicePreference {
  id?: string;
  professional_id: string;
  micro_service_id: string;
  is_active: boolean;
  min_budget?: number;
  can_work_solo?: boolean;
  requires_helper?: boolean;
  tools_available?: string[];
  certifications_required?: string[];
  service_areas?: Record<string, any>;
  pricing_structure?: Record<string, any>;
}

export interface ServiceSelection {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  microServiceId: string;
  microServiceName: string;
}

export const useProfessionalServicePreferences = (professionalId?: string) => {
  // Display metadata for UI rendering
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  
  // Database state
  const [existingServices, setExistingServices] = useState<ServicePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  
  // Session delta tracking
  const [addedMicroIds, setAddedMicroIds] = useState<Set<string>>(new Set());
  const [removedMicroIds, setRemovedMicroIds] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();

  // Computed: IDs of currently active services in DB
  const existingActiveIds = useMemo(() => 
    new Set(existingServices.filter(s => s.is_active).map(s => s.micro_service_id)),
    [existingServices]
  );

  // Computed: Final selected IDs = (existing active + added) - removed
  const finalSelectedIds = useMemo(() => {
    const result = new Set(existingActiveIds);
    addedMicroIds.forEach(id => result.add(id));
    removedMicroIds.forEach(id => result.delete(id));
    return result;
  }, [existingActiveIds, addedMicroIds, removedMicroIds]);

  // Fetch existing service preferences from DB
  const fetchExistingServices = useCallback(async () => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('professional_services')
        .select(`
          id,
          professional_id,
          micro_service_id,
          is_active,
          min_budget,
          can_work_solo,
          requires_helper,
          tools_available,
          certifications_required,
          service_areas,
          pricing_structure
        `)
        .eq('professional_id', professionalId);

      if (error) throw error;
      
      setExistingServices((data || []) as ServicePreference[]);
    } catch (error) {
      console.error('Error fetching existing services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your service preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [professionalId, toast]);

  useEffect(() => {
    fetchExistingServices();
  }, [fetchExistingServices]);

  // Load display metadata for existing active services
  useEffect(() => {
    const loadExistingMetadata = async () => {
      if (existingServices.length === 0 || metadataLoaded) return;
      
      const activeIds = existingServices
        .filter(s => s.is_active)
        .map(s => s.micro_service_id);
      
      if (activeIds.length === 0) {
        setMetadataLoaded(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('service_micro_categories')
          .select(`
            id, name,
            subcategory:service_subcategories!inner(
              id, name,
              category:service_categories!inner(id, name)
            )
          `)
          .in('id', activeIds);

        if (error) throw error;

        if (data) {
          const selections: ServiceSelection[] = data.map((m: any) => ({
            microServiceId: m.id,
            microServiceName: m.name,
            subcategoryId: m.subcategory.id,
            subcategoryName: m.subcategory.name,
            categoryId: m.subcategory.category.id,
            categoryName: m.subcategory.category.name
          }));
          setSelectedServices(selections);
        }
      } catch (error) {
        console.error('Error loading service metadata:', error);
      } finally {
        setMetadataLoaded(true);
      }
    };

    loadExistingMetadata();
  }, [existingServices, metadataLoaded]);

  // Toggle a micro-service selection (handles both new and existing services)
  const toggleMicroService = useCallback((selection: ServiceSelection) => {
    const { microServiceId } = selection;
    const isExistingActive = existingActiveIds.has(microServiceId);
    const isAdded = addedMicroIds.has(microServiceId);
    const isRemoved = removedMicroIds.has(microServiceId);
    const isCurrentlySelected = (isExistingActive && !isRemoved) || isAdded;

    if (isCurrentlySelected) {
      // Deselecting
      if (isExistingActive) {
        // Mark as removed (was from DB)
        setRemovedMicroIds(prev => new Set(prev).add(microServiceId));
      }
      if (isAdded) {
        // Remove from session additions
        setAddedMicroIds(prev => {
          const next = new Set(prev);
          next.delete(microServiceId);
          return next;
        });
      }
      // Remove from display array
      setSelectedServices(prev => prev.filter(s => s.microServiceId !== microServiceId));
    } else {
      // Selecting
      if (isRemoved) {
        // Un-remove (restore DB selection)
        setRemovedMicroIds(prev => {
          const next = new Set(prev);
          next.delete(microServiceId);
          return next;
        });
        // Re-add to display array (if not already there)
        if (!selectedServices.some(s => s.microServiceId === microServiceId)) {
          setSelectedServices(prev => [...prev, selection]);
        }
      } else if (!isExistingActive) {
        // New addition
        setAddedMicroIds(prev => new Set(prev).add(microServiceId));
        setSelectedServices(prev => [...prev, selection]);
      }
    }
  }, [existingActiveIds, addedMicroIds, removedMicroIds, selectedServices]);

  // Check if a micro-service is currently selected
  const isMicroServiceSelected = useCallback((microServiceId: string) => {
    return finalSelectedIds.has(microServiceId);
  }, [finalSelectedIds]);

  // Bulk select/deselect all micro-services in a subcategory
  const toggleSubcategoryServices = useCallback((
    subcategoryId: string,
    subcategoryName: string,
    categoryId: string,
    categoryName: string,
    microServices: Array<{ id: string; name: string }>
  ) => {
    const allSelected = microServices.every(ms => finalSelectedIds.has(ms.id));
    
    if (allSelected) {
      // Deselect all in this subcategory
      microServices.forEach(ms => {
        if (existingActiveIds.has(ms.id)) {
          setRemovedMicroIds(prev => new Set(prev).add(ms.id));
        }
        setAddedMicroIds(prev => {
          const next = new Set(prev);
          next.delete(ms.id);
          return next;
        });
      });
      setSelectedServices(prev => 
        prev.filter(s => !microServices.some(ms => ms.id === s.microServiceId))
      );
    } else {
      // Select all in this subcategory
      microServices.forEach(ms => {
        if (!finalSelectedIds.has(ms.id)) {
          if (existingActiveIds.has(ms.id)) {
            // Was removed, un-remove it
            setRemovedMicroIds(prev => {
              const next = new Set(prev);
              next.delete(ms.id);
              return next;
            });
          } else {
            // New addition
            setAddedMicroIds(prev => new Set(prev).add(ms.id));
          }
          // Add to display array if not present
          setSelectedServices(prev => {
            if (prev.some(s => s.microServiceId === ms.id)) return prev;
            return [...prev, {
              categoryId,
              categoryName,
              subcategoryId,
              subcategoryName,
              microServiceId: ms.id,
              microServiceName: ms.name
            }];
          });
        }
      });
    }
  }, [existingActiveIds, finalSelectedIds]);

  // Save all selected services to database
  const saveServices = useCallback(async () => {
    if (!professionalId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save services',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      const finalIds = [...finalSelectedIds];
      const existingIds = existingServices.map(s => s.micro_service_id);
      
      // Services to INSERT (new, never existed in DB)
      const toInsert = finalIds.filter(id => !existingIds.includes(id));
      
      // Services to REACTIVATE (existed but was inactive, now selected)
      const toReactivate = finalIds.filter(id => {
        const existing = existingServices.find(s => s.micro_service_id === id);
        return existing && !existing.is_active;
      });
      
      // Services to DEACTIVATE (was active, now not selected)
      const toDeactivate = existingServices
        .filter(s => s.is_active && !finalSelectedIds.has(s.micro_service_id))
        .map(s => s.micro_service_id);

      // Batch operations
      const operations = [];

      // Insert new services
      if (toInsert.length > 0) {
        const insertData = toInsert.map(microId => ({
          professional_id: professionalId,
          micro_service_id: microId,
          is_active: true
        }));
        operations.push(
          supabase.from('professional_services').insert(insertData)
        );
      }

      // Reactivate services
      if (toReactivate.length > 0) {
        operations.push(
          supabase
            .from('professional_services')
            .update({ is_active: true })
            .eq('professional_id', professionalId)
            .in('micro_service_id', toReactivate)
        );
      }

      // Deactivate removed services
      if (toDeactivate.length > 0) {
        operations.push(
          supabase
            .from('professional_services')
            .update({ is_active: false })
            .eq('professional_id', professionalId)
            .in('micro_service_id', toDeactivate)
        );
      }

      // Execute all operations
      const results = await Promise.all(operations);
      
      // Check for errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.error?.message).join(', '));
      }

      // After saving services, mark onboarding as complete (only if at least 1 active service)
      // Use UPSERT to guarantee the row exists (prevents silent 0-row update if profile doesn't exist yet)
      if (finalIds.length > 0) {
        await supabase
          .from('professional_profiles')
          .upsert(
            { user_id: professionalId, onboarding_phase: 'complete' },
            { onConflict: 'user_id' }
          );
      }

      toast({
        title: 'Success',
        description: `Saved ${finalIds.length} service preferences`
      });

      // Clear session state after save
      setAddedMicroIds(new Set());
      setRemovedMicroIds(new Set());
      setMetadataLoaded(false); // Allow re-fetch of metadata

      // Refresh existing services
      await fetchExistingServices();
      return true;
    } catch (error) {
      console.error('Error saving services:', error);
      toast({
        title: 'Error',
        description: 'Failed to save service preferences',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [professionalId, finalSelectedIds, existingServices, toast, fetchExistingServices]);

  // Get count of selected services by category
  const getSelectionCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    selectedServices.forEach(s => {
      if (finalSelectedIds.has(s.microServiceId)) {
        counts[s.categoryId] = (counts[s.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [selectedServices, finalSelectedIds]);

  // Clear all selections (including marking existing as removed)
  const clearSelections = useCallback(() => {
    setAddedMicroIds(new Set());
    setRemovedMicroIds(new Set(existingActiveIds));
    setSelectedServices([]);
  }, [existingActiveIds]);

  return {
    selectedServices,
    existingServices,
    finalSelectedIds,
    existingActiveIds,
    loading,
    saving,
    toggleMicroService,
    isMicroServiceSelected,
    toggleSubcategoryServices,
    saveServices,
    getSelectionCounts,
    clearSelections,
    refetch: fetchExistingServices
  };
};
