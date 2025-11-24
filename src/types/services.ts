export type PricingType =
  | 'fixed'
  | 'flat_rate'
  | 'per_hour'
  | 'per_unit'
  | 'per_square_meter'
  | 'per_project'
  | 'range'
  | 'quote_required';

export interface ServiceMaterial {
  id: string;
  service_id: string;
  material_category: string;
  material_name: string;
  material_icon?: string | null;
  is_default: boolean;
  display_order: number;
}

export interface ServicePricingAddon {
  id: string;
  service_id: string;
  addon_name: string;
  addon_description?: string | null;
  addon_price: number;
  is_included_in_base: boolean;
  is_optional: boolean;
  display_order: number;
}

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
  professional_id?: string;
  portfolio_images?: string[];
  featured_image?: string | null;
  materials?: ServiceMaterial[];
  pricing_addons?: ServicePricingAddon[];
}
