// App-wide constants for MyBOOQED

export const APP_NAME = 'MyBOOQED';
export const APP_COUNTRY = 'India';
export const APP_TAGLINE = 'Discover and book the best salons & spas in India';

export const API_BASE_URL = 'http://localhost:5000/api/v1';

// Sample areas (for demonstration)
export const POPULAR_AREAS = [
  'Gandhi Nagar, Ballari',
  'Cowl Bazaar, Ballari',
  'Kappagal Road, Ballari',
  'Jubilee Hills, Hyderabad',
  'Bandra, Mumbai',
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'South Extension, Delhi',
  'Anna Nagar, Chennai',
  'Salt Lake, Kolkata',
  'Kalyani Nagar, Pune',
] as const;

export type PopularArea = (typeof POPULAR_AREAS)[number];

// Salon types
export const SALON_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'name', label: 'Name A–Z' },
] as const;

// Rating filter options
export const RATING_OPTIONS = [
  { value: '4', label: '4.0+' },
  { value: '3', label: '3.0+' },
  { value: '2', label: '2.0+' },
] as const;

// Price ranges
export const PRICE_RANGES = [
  { value: '0-200', label: 'Under ₹200' },
  { value: '200-500', label: '₹200 – ₹500' },
  { value: '500-1000', label: '₹500 – ₹1,000' },
  { value: '1000+', label: 'Above ₹1,000' },
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unisex', label: 'Unisex' },
] as const;

// Popular search terms
export const POPULAR_SEARCHES = [
  'Haircut',
  'Facial',
  'Beard Trim',
  'Hair Color',
  'Bridal Makeup',
  'Spa',
  'Manicure',
  'Kids Haircut',
];

// Amenity icons mapping (lucide-react icon names)
export const AMENITY_ICONS: Record<string, string> = {
  AC: 'Wind',
  WiFi: 'Wifi',
  Parking: 'Car',
  'Card Payment': 'CreditCard',
  'Online Booking': 'Smartphone',
  Wheelchair: 'Accessibility',
  'Private Rooms': 'Lock',
  'Kids Area': 'Baby',
  Cafe: 'Coffee',
  TV: 'Tv',
};

// Day names
export const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type DayName = (typeof DAY_NAMES)[number];

// Booking steps
export const BOOKING_STEPS = [
  { step: 1, label: 'Services', short: 'Services' },
  { step: 2, label: 'Stylist', short: 'Staff' },
  { step: 3, label: 'Date & Time', short: 'Time' },
  { step: 4, label: 'Confirm', short: 'Confirm' },
] as const;

// Time groups for slot picker
export const TIME_GROUPS = [
  { label: 'Morning', start: 9, end: 12 },
  { label: 'Afternoon', start: 12, end: 17 },
  { label: 'Evening', start: 17, end: 21 },
] as const;

// Status colors
export const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  confirmed: {
    label: 'Confirmed',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  completed: {
    label: 'Completed',
    color: '#6B7280',
    bgColor: '#F9FAFB',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#DC2626',
    bgColor: '#FEF2F2',
  },
};


// Category icons mapping
// Removed: CATEGORY_ICONS and CATEGORY_EMOJI have been replaced by centralized metadata in constants/categoryMeta.ts
