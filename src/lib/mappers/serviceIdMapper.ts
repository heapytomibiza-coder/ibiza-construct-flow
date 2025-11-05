/**
 * Service ID Mapper
 * Maps database micro_id values to JSON service IDs
 */

/**
 * Maps database micro_id to JSON service id
 * Handles differences between database slugs and JSON service IDs
 */
export function mapMicroIdToServiceId(microId: string): string | null {
  if (!microId) return null;
  
  // Direct match attempt - convert underscores to hyphens
  const directMatch = microId.toLowerCase().replace(/_/g, '-');
  
  // Custom mappings for all 16 JSON services to database micro_id
  const customMappings: Record<string, string> = {
    // Exact matches (database → JSON)
    'excavation_groundworks': 'excavation-groundworks',
    'concrete_foundations': 'concrete-foundations',
    'demolition_site_clearance': 'demolition-site-clearance',
    'concrete_block_walls': 'concrete-block-walls',
    'brickwork_cavity_walls': 'brickwork-cavity-walls',
    'scaffolding_access': 'scaffolding-access',
    
    // Close matches requiring custom mapping
    'drainage_stormwater': 'drainage-systems',
    'retaining_excavations': 'retaining-walls',
    'soil_stabilisation': 'soil-stabilisation-compaction',
    'septic_tank_installation': 'septic-water-tank-installation',
    'ground_beams_slabs': 'ground-beams-reinforced-slabs',
    
    // NEW: 5 Masonry & Concrete services (database → JSON)
    'natural_stone_masonry': 'natural-stone-masonry',
    'load_bearing_partitions': 'load-bearing-partitions',
    'rendered_walls': 'rendered-decorative-walls',
    'pointing_repointing': 'pointing-joint-finishing',
  };
  
  return customMappings[microId] || directMatch;
}

/**
 * Reverse mapping: JSON service id to potential micro_id values
 */
export function mapServiceIdToMicroId(serviceId: string): string {
  return serviceId.toLowerCase().replace(/-/g, '_');
}
