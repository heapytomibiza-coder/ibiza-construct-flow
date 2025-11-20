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
};

/**
 * Get Lucide icon component by name
 * Falls back to Wrench icon if not found
 */
export const getCategoryIcon = (iconName: string): LucideIcon => {
  return ICON_MAP[iconName] || Wrench;
};

/**
 * Get all available icon names
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(ICON_MAP);
};
