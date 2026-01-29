/**
 * Professional Service Preferences Hook
 * Handles batch CRUD operations for professional service selections
 */

import { useState, useEffect, useCallback } from 'react';
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
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [existingServices, setExistingServices] = useState<ServicePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch existing service preferences
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
      
      // Type assertion to handle the new columns
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

  // Toggle a micro-service selection
  const toggleMicroService = useCallback((selection: ServiceSelection) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.microServiceId === selection.microServiceId);
      if (exists) {
        return prev.filter(s => s.microServiceId !== selection.microServiceId);
      } else {
        return [...prev, selection];
      }
    });
  }, []);

  // Check if a micro-service is selected
  const isMicroServiceSelected = useCallback((microServiceId: string) => {
    return selectedServices.some(s => s.microServiceId === microServiceId) ||
           existingServices.some(s => s.micro_service_id === microServiceId && s.is_active);
  }, [selectedServices, existingServices]);

  // Bulk select/deselect all micro-services in a subcategory
  const toggleSubcategoryServices = useCallback((
    subcategoryId: string,
    subcategoryName: string,
    categoryId: string,
    categoryName: string,
    microServices: Array<{ id: string; name: string }>
  ) => {
    const allSelected = microServices.every(ms => isMicroServiceSelected(ms.id));
    
    if (allSelected) {
      // Deselect all
      setSelectedServices(prev => 
        prev.filter(s => !microServices.some(ms => ms.id === s.microServiceId))
      );
    } else {
      // Select all not already selected
      const newSelections = microServices
        .filter(ms => !isMicroServiceSelected(ms.id))
        .map(ms => ({
          categoryId,
          categoryName,
          subcategoryId,
          subcategoryName,
          microServiceId: ms.id,
          microServiceName: ms.name
        }));
      setSelectedServices(prev => [...prev, ...newSelections]);
    }
  }, [isMicroServiceSelected]);

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
      // Get current micro_service_ids from selections
      const selectedMicroIds = selectedServices.map(s => s.microServiceId);
      const existingMicroIds = existingServices.map(s => s.micro_service_id);
      
      // New services to insert
      const toInsert = selectedMicroIds.filter(id => !existingMicroIds.includes(id));
      
      // Services to deactivate (removed from selection)
      const toDeactivate = existingMicroIds.filter(id => 
        !selectedMicroIds.includes(id) && 
        existingServices.find(s => s.micro_service_id === id)?.is_active
      );
      
      // Services to reactivate (previously deactivated, now selected again)
      const toReactivate = selectedMicroIds.filter(id => {
        const existing = existingServices.find(s => s.micro_service_id === id);
        return existing && !existing.is_active;
      });

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

      // Execute all operations
      const results = await Promise.all(operations);
      
      // Check for errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.error?.message).join(', '));
      }

      toast({
        title: 'Success',
        description: `Saved ${selectedMicroIds.length} service preferences`
      });

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
  }, [professionalId, selectedServices, existingServices, toast, fetchExistingServices]);

  // Initialize selected services from existing active services
  useEffect(() => {
    if (existingServices.length > 0 && selectedServices.length === 0) {
      // We'll populate this when the wizard loads micro-service details
      // For now, just track the IDs
    }
  }, [existingServices]);

  // Get count of selected services by category
  const getSelectionCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    selectedServices.forEach(s => {
      counts[s.categoryId] = (counts[s.categoryId] || 0) + 1;
    });
    return counts;
  }, [selectedServices]);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedServices([]);
  }, []);

  return {
    selectedServices,
    existingServices,
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
