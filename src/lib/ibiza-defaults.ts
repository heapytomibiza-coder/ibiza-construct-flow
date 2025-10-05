/**
 * Ibiza-First Locale Defaults
 * Smart defaults for the Ibiza market
 */

export const IBIZA_DEFAULTS = {
  locale: 'es',
  currency: 'EUR',
  currencySymbol: '€',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  timezone: 'Europe/Madrid',
  defaultLocation: {
    city: 'Ibiza',
    region: 'Balearic Islands',
    country: 'Spain',
    coordinates: { lat: 38.9067, lng: 1.4206 }
  },
  phonePrefix: '+34',
  language: 'es-ES'
} as const;

export const QUICK_REPLIES = {
  en: {
    accept: "Sounds good 👍",
    requestPhotos: "Can you send photos?",
    availableTomorrow: "Available tomorrow 10–14h",
    needMoreInfo: "Need more details",
    almostThere: "Almost done, just a few more details",
    checkingSchedule: "Let me check my schedule",
    confirmed: "Confirmed ✓",
    thankYou: "Thank you!",
  },
  es: {
    accept: "De acuerdo 👍",
    requestPhotos: "¿Puedes enviar fotos?",
    availableTomorrow: "Disponible mañana 10–14h",
    needMoreInfo: "Necesito más detalles",
    almostThere: "Casi listo, solo unos detalles más",
    checkingSchedule: "Déjame revisar mi agenda",
    confirmed: "Confirmado ✓",
    thankYou: "¡Gracias!",
  }
} as const;

export const MATERIAL_OPTIONS = [
  { id: 'ceramic', label: { en: 'Ceramic Tile', es: 'Azulejo Cerámico' }, icon: '🟫' },
  { id: 'porcelain', label: { en: 'Porcelain', es: 'Porcelana' }, icon: '⬜' },
  { id: 'natural_stone', label: { en: 'Natural Stone', es: 'Piedra Natural' }, icon: '🪨' },
  { id: 'wood', label: { en: 'Wood', es: 'Madera' }, icon: '🪵' },
  { id: 'marble', label: { en: 'Marble', es: 'Mármol' }, icon: '💎' },
  { id: 'granite', label: { en: 'Granite', es: 'Granito' }, icon: '⬛' },
] as const;

export const FINISH_OPTIONS = [
  { id: 'matte', label: { en: 'Matte', es: 'Mate' }, icon: '◻️' },
  { id: 'glossy', label: { en: 'Glossy', es: 'Brillante' }, icon: '✨' },
  { id: 'textured', label: { en: 'Textured', es: 'Texturizado' }, icon: '🔲' },
  { id: 'polished', label: { en: 'Polished', es: 'Pulido' }, icon: '💫' },
] as const;

export const QUANTITY_UNITS = [
  { id: 'm2', label: { en: 'm²', es: 'm²' }, type: 'area' },
  { id: 'linear_m', label: { en: 'Linear m', es: 'm lineales' }, type: 'length' },
  { id: 'pieces', label: { en: 'Pieces', es: 'Piezas' }, type: 'count' },
  { id: 'hours', label: { en: 'Hours', es: 'Horas' }, type: 'time' },
] as const;

export const RATING_LABELS = {
  en: ['Poor', 'Fair', 'Good', 'Great', 'Excellent'],
  es: ['Malo', 'Regular', 'Bueno', 'Muy Bueno', 'Excelente']
} as const;

export const DECLINE_REASONS = {
  en: [
    'Not available for these dates',
    'Outside service area',
    'Different specialty required',
    'Budget doesn\'t match',
    'Schedule too tight',
  ],
  es: [
    'No disponible para estas fechas',
    'Fuera del área de servicio',
    'Se requiere otra especialidad',
    'Presupuesto no coincide',
    'Agenda muy ajustada',
  ]
} as const;

export function detectIbizaUser(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check browser language
  const browserLang = navigator.language?.toLowerCase();
  if (browserLang?.includes('es')) return true;
  
  // Check timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === 'Europe/Madrid') return true;
  } catch (e) {
    console.warn('Timezone detection failed:', e);
  }
  
  return false;
}

export function formatCurrency(amount: number, locale: string = 'es-ES'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date, locale: string = 'es-ES'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatTime(date: Date, locale: string = 'es-ES'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
