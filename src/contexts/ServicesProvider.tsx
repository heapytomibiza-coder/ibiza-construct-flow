import React, { createContext, useContext, useState, useEffect } from 'react';

interface ServicesContextType {
  services: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider = ({ children }: { children: React.ReactNode }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      const mockServices = [
        { id: 1, name: 'Plumbing', category: 'maintenance' },
        { id: 2, name: 'Electrical', category: 'maintenance' },
        { id: 3, name: 'Construction', category: 'building' }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setServices(mockServices);
    } catch (err) {
      setError('Failed to load services');
      console.error('Services loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const value = {
    services,
    loading,
    error,
    refetch: loadServices
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};