// Service category visual mappings
export const serviceCategoryImages = {
  Builder: {
    hero: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    color: 'from-orange-500 to-amber-600',
    icon: '🏗️'
  },
  Plumber: {
    hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
    color: 'from-blue-500 to-cyan-600',
    icon: '🔧'
  },
  Electrician: {
    hero: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    color: 'from-yellow-500 to-orange-500',
    icon: '⚡'
  },
  Cleaner: {
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    color: 'from-green-500 to-emerald-600',
    icon: '✨'
  },
  Painter: {
    hero: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    color: 'from-purple-500 to-pink-600',
    icon: '🎨'
  },
  Landscaper: {
    hero: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80',
    color: 'from-green-600 to-lime-600',
    icon: '🌿'
  },
  Carpenter: {
    hero: 'https://images.unsplash.com/photo-1602899561070-b135f7aed671?w=800&q=80',
    color: 'from-amber-600 to-yellow-700',
    icon: '🪚'
  },
  'Pool Specialist': {
    hero: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
    color: 'from-cyan-500 to-blue-600',
    icon: '🏊'
  },
  Handyman: {
    hero: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
    color: 'from-slate-600 to-gray-700',
    icon: '🛠️'
  },
  default: {
    hero: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    color: 'from-indigo-500 to-purple-600',
    icon: '💼'
  }
};

export const getServiceVisuals = (category?: string) => {
  if (!category) return serviceCategoryImages.default;
  return serviceCategoryImages[category as keyof typeof serviceCategoryImages] || serviceCategoryImages.default;
};
