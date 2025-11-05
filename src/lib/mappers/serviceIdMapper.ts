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
    
    // NEW: 8 Advanced Construction & Steel services (database → JSON)
    'core_drilling_cutting': 'core-drilling-cutting',
    'structural_crack_repairs': 'structural-crack-repairs',
    'concrete_waterproofing': 'concrete-waterproofing',
    'structural_steel_fabrication': 'structural-steel-fabrication',
    'rebar_cutting_bending_fixing': 'rebar-cutting-bending-fixing',
    'welding_on_site_assembly': 'welding-on-site-assembly',
    'beams_columns_trusses': 'beams-columns-trusses',
    'composite_floor_decking': 'composite-floor-decking',
    
    // NEW: 8 Steelwork, Demolition & Carpentry services (database → JSON)
    'metal_staircases_balustrades': 'metal-staircases-balustrades',
    'corrosion_protection_painting': 'corrosion-protection-painting',
    'structure_demolition': 'structure-demolition',
    'interior_strip_outs': 'interior-strip-outs',
    'concrete_cutting_removal': 'concrete-cutting-removal',
    'waste_segregation_recycling': 'waste-segregation-recycling',
    'site_leveling_soil_replacement': 'site-leveling-soil-replacement',
    'skirting_architraves': 'skirting-architraves',
    
    // NEW: 8 Carpentry & Bespoke Joinery services (database → JSON)
    'doors_frames_thresholds': 'doors-frames-thresholds',
    'window_boards_trims': 'window-boards-trims',
    'wall_panelling_feature_cladding': 'wall-panelling-feature-cladding',
    'ceiling_beams_details': 'ceiling-beams-details',
    'built_in_wardrobes_storage': 'built-in-wardrobes-storage',
    'bar_counter_reception_builds': 'bar-counter-reception-builds',
    'media_walls_entertainment_units': 'media-walls-entertainment-units',
    'floating_shelves_bookcases': 'floating-shelves-bookcases',
  };
  
  return customMappings[microId] || directMatch;
}

/**
 * Reverse mapping: JSON service id to potential micro_id values
 */
export function mapServiceIdToMicroId(serviceId: string): string {
  return serviceId.toLowerCase().replace(/-/g, '_');
}
