// ─── Slugification & Unique ID Utilities ────────────────────────────────────
// Used for generating SEO-friendly, clean business URLs.
// Example: "Golden Shears Salon" → "golden-shears-salon-a1b2c"

/**
 * Generate a clean, SEO-friendly slug from a business name.
 */
export function generateSlug(name) {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate a short, random alphanumeric unique ID.
 */
export function generateUniqueId(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a complete SEO-friendly business URL path.
 * Format: business-name-slug-uniqueId
 */
export function createBusinessUrl(name, uniqueId) {
  const slug = generateSlug(name);
  return `${slug}-${uniqueId}`;
}

/**
 * Parse a business URL parameter back into its components.
 */
export function parseBusinessUrl(urlParam, idLength = 5) {
  const lastHyphenIndex = urlParam.lastIndexOf('-');

  if (lastHyphenIndex === -1 || urlParam.length - lastHyphenIndex - 1 !== idLength) {
    return { slug: urlParam, uniqueId: '' };
  }

  return {
    slug: urlParam.substring(0, lastHyphenIndex),
    uniqueId: urlParam.substring(lastHyphenIndex + 1),
  };
}

/**
 * Create a city slug for location-based SEO pages.
 */
export function createCitySlug(cityName) {
  return generateSlug(cityName);
}
