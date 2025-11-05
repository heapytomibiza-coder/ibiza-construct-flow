/**
 * Hook for importing construction services to question packs
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConstructionService } from '@/types/construction-services';
import type { PackStatus } from '@/types/packs';
import { importServiceToQuestionPack } from '@/lib/questionPacks/importService';
import { mapServiceIdToMicroSlug, LOGISTICS_QUESTION_IDS } from '@/lib/questionPacks/transformJsonToContent';
import constructionServicesData from '@/data/construction-services.json';
import { supabase } from '@/integrations/supabase/client';

export function useImportServices() {
  const queryClient = useQueryClient();
  const [importedServices, setImportedServices] = useState<Set<string>>(new Set());
  const [skippedServices, setSkippedServices] = useState<Set<string>>(new Set());
  
  // Get all services from JSON
  const services = constructionServicesData.services as ConstructionService[];
  
  // Check which services are already imported
  const { data: existingSlugs } = useQuery({
    queryKey: ['imported-service-slugs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('question_packs')
        .select('micro_slug')
        .eq('is_active', true);
      return new Set(data?.map(p => p.micro_slug) || []);
    },
  });
  
  // Import mutation
  const importMutation = useMutation({
    mutationFn: async ({
      service,
      microSlug,
      status,
    }: {
      service: ConstructionService;
      microSlug: string;
      status: PackStatus;
    }) => {
      return importServiceToQuestionPack(service, microSlug, status, 'manual');
    },
    onSuccess: (_, variables) => {
      setImportedServices(prev => new Set(prev).add(variables.service.id));
      queryClient.invalidateQueries({ queryKey: ['question-packs'] });
      queryClient.invalidateQueries({ queryKey: ['imported-service-slugs'] });
    },
  });
  
  // Get service status
  const getServiceStatus = (serviceId: string): 'pending' | 'imported' | 'skipped' => {
    if (importedServices.has(serviceId)) return 'imported';
    if (skippedServices.has(serviceId)) return 'skipped';
    
    const slug = mapServiceIdToMicroSlug(serviceId);
    if (existingSlugs?.has(slug)) return 'imported';
    
    return 'pending';
  };
  
  // Get filtered question count
  const getFilteredQuestionCount = (service: ConstructionService): number => {
    return service.blocks.filter(
      block => !LOGISTICS_QUESTION_IDS.includes(block.id)
    ).length;
  };
  
  // Skip service
  const skipService = (serviceId: string) => {
    setSkippedServices(prev => new Set(prev).add(serviceId));
  };
  
  // Progress stats
  const totalServices = services.length;
  const importedCount = services.filter(s => getServiceStatus(s.id) === 'imported').length;
  const skippedCount = skippedServices.size;
  const pendingCount = totalServices - importedCount - skippedCount;
  const progress = totalServices > 0 ? Math.round((importedCount / totalServices) * 100) : 0;
  
  return {
    services,
    importedServices,
    skippedServices,
    importService: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
    skipService,
    getServiceStatus,
    getFilteredQuestionCount,
    stats: {
      total: totalServices,
      imported: importedCount,
      skipped: skippedCount,
      pending: pendingCount,
      progress,
    },
  };
}
