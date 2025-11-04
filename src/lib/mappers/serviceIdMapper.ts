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
  
  // Custom mappings for edge cases where naming differs
  const customMappings: Record<string, string> = {
    'excavation_groundworks': 'excavation-groundworks',
    'earthworks_excavation': 'earthworks-excavation',
    'trenching_utilities': 'trenching-utilities',
    'foundations_footings': 'foundations-footings',
    'drainage_stormwater': 'drainage-stormwater',
    'soil_stabilisation': 'soil-stabilisation-compaction',
    'retaining_excavations': 'retaining-excavations-shoring',
  };
  
  return customMappings[microId] || directMatch;
}

/**
 * Reverse mapping: JSON service id to potential micro_id values
 */
export function mapServiceIdToMicroId(serviceId: string): string {
  return serviceId.toLowerCase().replace(/-/g, '_');
}
