import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Professional {
  id: string;
  full_name: string | null;
  display_name: string | null;
  preferred_language: string | null;
  roles: any;
  created_at: string | null;
  updated_at: string | null;
  // Professional-specific fields (may be null if not set)
  bio?: string | null;
  specializations?: string[] | null;
  experience_years?: number | null;
  hourly_rate?: number | null;
  location?: string | null;
  profile_image_url?: string | null;
  phone?: string | null;
  rating?: number | null;
  total_jobs_completed?: number | null;
  total_reviews?: number | null;
  availability_status?: string | null;
  verification_status?: string | null;
}

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .contains('roles', ['professional']);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getProfessionalById = async (id: string): Promise<Professional | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .contains('roles', ['professional'])
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching professional:', err);
      return null;
    }
  };

  const getProfessionalsBySpecialization = (specialization: string) => {
    return professionals.filter(professional => {
      const specs = professional.specializations;
      if (Array.isArray(specs)) {
        return specs.includes(specialization.toLowerCase());
      }
      return false;
    });
  };

  useEffect(() => {
    loadProfessionals();
  }, []);

  return {
    professionals,
    loading,
    error,
    getProfessionalById,
    getProfessionalsBySpecialization,
    refetch: loadProfessionals
  };
};