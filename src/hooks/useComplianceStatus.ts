import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ComplianceFramework {
  id: string;
  framework_name: string;
  framework_code: string;
  description: string;
  requirements: any[];
}

export interface ComplianceStatus {
  framework: string;
  score: number;
  status: string;
  requirements_met: string[];
  requirements_pending: string[];
}

export const useComplianceStatus = () => {
  const queryClient = useQueryClient();

  const { data: frameworks, isLoading: isLoadingFrameworks } = useQuery({
    queryKey: ['compliance-frameworks'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('compliance-checker', {
        body: { action: 'get_frameworks' },
      });

      if (error) throw error;
      return data.frameworks as ComplianceFramework[];
    },
  });

  const { data: userCompliance, isLoading: isLoadingCompliance } = useQuery({
    queryKey: ['user-compliance-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('compliance-checker', {
        body: { action: 'get_user_compliance_status' },
      });

      if (error) throw error;
      return data.statuses;
    },
  });

  const checkCompliance = useMutation({
    mutationFn: async (frameworkCode: string) => {
      const { data, error } = await supabase.functions.invoke('compliance-checker', {
        body: {
          action: 'check_compliance',
          framework_code: frameworkCode,
        },
      });

      if (error) throw error;
      return data.compliance as ComplianceStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-compliance-status'] });
    },
  });

  const generateReport = useMutation({
    mutationFn: async (frameworkCode: string) => {
      const { data, error } = await supabase.functions.invoke('compliance-checker', {
        body: {
          action: 'generate_report',
          framework_code: frameworkCode,
        },
      });

      if (error) throw error;
      return data.report;
    },
  });

  return {
    frameworks,
    userCompliance,
    isLoading: isLoadingFrameworks || isLoadingCompliance,
    checkCompliance: checkCompliance.mutateAsync,
    generateReport: generateReport.mutateAsync,
  };
};
