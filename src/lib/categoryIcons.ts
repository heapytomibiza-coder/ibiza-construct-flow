/**
 * Category Icon Mapping
 * Maps icon names from database to Lucide React components
 */
import {
  Home,
  Wrench,
  Paintbrush,
  Zap,
  Droplet,
  Hammer,
  Waves,
  Wind,
  Ruler,
  Square,
  Leaf,
  HardHat,
  Building,
  Building2,
  DoorOpen,
  Bath,
  FileText,
  Layers,
  Sparkles,
  Truck,
  Armchair,
  Boxes,
  TreeDeciduous,
  AlertTriangle,
  Cable,
  DoorClosed,
  Droplets,
  Fan,
  Gauge,
  Flame,
  FileBadge2,
  Lightbulb,
  MapPinned,
  LayoutDashboard,
  PanelLeft,
  PanelTop,
  PlugZap,
  Scissors,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Store,
  Utensils,
  Warehouse,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Wrench,
  Paintbrush,
  Zap,
  Droplet,
  Hammer,
  Waves,
  Wind,
  Ruler,
  Square,
  Leaf,
  HardHat,
  Building,
  Building2,
  DoorOpen,
  Bath,
  FileText,
  Layers,
  Sparkles,
  Truck,
  Armchair,
  Boxes,
  TreeDeciduous,
  AlertTriangle,
  Cable,
  DoorClosed,
  Droplets,
  Fan,
  Gauge,
  Flame,
  FileBadge2,
  Lightbulb,
  MapPinned,
  LayoutDashboard,
  PanelLeft,
  PanelTop,
  PlugZap,
  Scissors,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Store,
  Utensils,
  Warehouse,
};

/**
 * Get Lucide icon component by name
 * Falls back to Wrench icon if not found
 * Supports case-insensitive lookups for robustness
 */
export const getCategoryIcon = (iconName: string): LucideIcon => {
  // Try exact match first
  if (ICON_MAP[iconName]) return ICON_MAP[iconName];
  
  // Try case-insensitive match as fallback
  const key = Object.keys(ICON_MAP).find(
    k => k.toLowerCase() === iconName.toLowerCase()
  );
  
  return key ? ICON_MAP[key] : Wrench;
};

/**
 * Get all available icon names
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(ICON_MAP);
};
