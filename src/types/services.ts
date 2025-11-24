export type PricingType =
  | 'fixed'
  | 'flat_rate'
  | 'per_hour'
  | 'per_unit'
  | 'per_square_meter'
  | 'per_project'
  | 'range'
  | 'quote_required';

export interface ServiceMenuItem {
  id: string;
  name: string;
  description?: string | null;
  long_description?: string | null;
  price: number;
  pricing_type: PricingType;
  unit_label?: string | null;
  group_name?: string | null;
  whats_included?: string[];
  specifications?: Record<string, string>;
}
