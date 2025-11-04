/**
 * Construction Services Type Definitions
 * Defines the schema for static service definitions in JSON
 */

export interface ServiceBlock {
  id: string;
  type: string; // 'text_field' | 'type_selector' but parsed from JSON as string
  title: string;
  description?: string;
  required: boolean;
  config: {
    placeholder?: string;
    multiSelect?: boolean;
    options?: Array<{
      value: string;
      label: string;
    }>;
  };
}

export interface ConstructionService {
  id: string;
  label: string;
  icon: string;
  description: string;
  budgetRange: { 
    min: number; 
    max: number; 
  };
  blocks: ServiceBlock[];
  promptTemplate: string;
}

export interface ConstructionServicesData {
  services: ConstructionService[];
}
