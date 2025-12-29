/**
 * Stable mapping: preset key → category/micro identifiers
 * This ensures navigation works regardless of language/translation changes
 */
export const PRESET_SERVICE_MAP: Record<string, { category: string; micro: string }> = {
  leakyTap: { category: "Plumbing", micro: "Leak Repair" },
  hangPictures: { category: "Handyman", micro: "Hanging & Mounting" },
  doorLock: { category: "Handyman", micro: "Locks & Doors" },
  lightFixture: { category: "Electrical", micro: "Lighting Installation" },
};

export const PRESET_KEYS = Object.keys(PRESET_SERVICE_MAP) as Array<keyof typeof PRESET_SERVICE_MAP>;
