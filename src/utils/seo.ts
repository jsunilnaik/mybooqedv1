// ─── Frontend SEO URL Utilities ─────────────────────────────────────────────
// These mirror the backend slugify.js logic for client-side URL generation.
// Used throughout the React app to build clean, SEO-friendly links.
import { CITY_NEIGHBORHOODS } from '../data/cityNeighborhoods';

/**
 * Generate a clean slug from a string.
 * Mirrors server/utils/slugify.js → generateSlug()
 */
export function generateSlug(text: string): string {
  return text
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
 * Parse a business URL parameter into slug and uniqueId.
 * The uniqueId is always the last 5 characters after the final hyphen.
 */
export function parseBusinessUrl(urlParam: string, idLength = 5): { slug: string; uniqueId: string } {
  const lastHyphenIndex = urlParam.lastIndexOf('-');

  if (lastHyphenIndex === -1 || urlParam.length - lastHyphenIndex - 1 !== idLength) {
    return { slug: urlParam, uniqueId: '' };
  }

  return {
    slug: urlParam.substring(0, lastHyphenIndex),
    uniqueId: urlParam.substring(lastHyphenIndex + 1),
  };
}

// ─── URL Builders ───────────────────────────────────────────────────────────

/**
 * Internal helper to get state slug for a city if not provided.
 * Uses CITY_NEIGHBORHOODS registry as a fallback.
 */
function getStateSlug(cityName?: string, providedState?: string): string {
  if (!cityName) return 'india';
  
  const cityKey = cityName.toLowerCase();
  const metadata = CITY_NEIGHBORHOODS[cityKey] || 
                   CITY_NEIGHBORHOODS[generateSlug(cityName)];
  
  if (metadata) return metadata.stateCode.toLowerCase();
  
  // Last resort fallback
  return providedState ? generateSlug(providedState) : 'india';
}

/**
 * Build a salon detail page URL.
 * @example "/salons-in/maharashtra/mumbai/andheri/looks-salon-x7k2m"
 */
export function buildSalonUrl(salon: { 
  slug: string; 
  uniqueId?: string; 
  address?: { city: string; state: string; area: string } 
}): string {
  const stateSlug = getStateSlug(salon.address?.city, salon.address?.state);
  const citySlug = salon.address?.city ? generateSlug(salon.address.city) : 'unknown-city';
  const areaSlug = salon.address?.area ? generateSlug(salon.address.area) : 'general';
  
  return `/salons-in/${stateSlug}/${citySlug}/${areaSlug}/${salon.slug}${salon.uniqueId ? `-${salon.uniqueId}` : ''}`;
}

/**
 * Build a booking flow URL for a salon.
 * @example "/salons-in/maharashtra/mumbai/andheri/looks-salon-x7k2m/book"
 */
export function buildBookingUrl(salon: {
  slug: string;
  uniqueId: string;
  address?: { city: string; state: string; area: string };
}): string {
  const stateSlug = getStateSlug(salon.address?.city, salon.address?.state);
  const citySlug = salon.address?.city ? generateSlug(salon.address.city) : 'unknown-city';
  const areaSlug = salon.address?.area ? generateSlug(salon.address.area) : 'general';
  
  return `/salons-in/${stateSlug}/${citySlug}/${areaSlug}/${salon.slug}-${salon.uniqueId}/book`;
}

/**
 * Build a location-based SEO page URL.
 * @example buildLocationUrl("Mumbai") → "/salons-in/maharashtra/mumbai"
 */
export function buildLocationUrl(cityName: string, stateName?: string): string {
  const stateSlug = getStateSlug(cityName, stateName);
  return `/salons-in/${stateSlug}/${generateSlug(cityName)}`;
}

/**
 * Build a neighborhood-based SEO page URL.
 * @example buildNeighborhoodUrl("Mumbai", "Andheri West") → "/salons-in/maharashtra/mumbai/andheri-west"
 */
export function buildNeighborhoodUrl(cityName: string, neighborhoodName: string, stateName?: string): string {
  const stateSlug = getStateSlug(cityName, stateName);
  return `/salons-in/${stateSlug}/${generateSlug(cityName)}/${generateSlug(neighborhoodName)}`;
}

/**
 * Build a neighborhood + service based SEO page URL.
 * @example buildNeighborhoodServiceUrl("Mumbai", "Andheri West", "Hair Color") 
 *          → "/salons-in/maharashtra/mumbai/andheri-west/hair-color"
 */
export function buildNeighborhoodServiceUrl(cityName: string, neighborhoodName: string, serviceName: string, stateName?: string): string {
  const stateSlug = getStateSlug(cityName, stateName);
  return `/salons-in/${stateSlug}/${generateSlug(cityName)}/${generateSlug(neighborhoodName)}/${generateSlug(serviceName)}`;
}

/**
 * Build a search URL with clean query parameters.
 * @example buildSearchUrl({ q: "haircut", location: "mumbai", sort: "rating" })
 *          → "/search?q=haircut&location=mumbai&sort=rating"
 */
export function buildSearchUrl(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `/search?${queryString}` : '/search';
}

/**
 * Get the canonical URL for the current page.
 * Strips query parameters and trailing slashes for canonical consistency.
 */
export function getCanonicalUrl(pathname: string): string {
  const baseUrl = window.location.origin;
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return `${baseUrl}${cleanPath}`;
}
