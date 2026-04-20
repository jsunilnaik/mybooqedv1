export interface SalonAddress {
  line1: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  [key: string]: DayHours;
}

export interface SalonImages {
  cover: string;
  gallery: string[];
}

export interface GalleryItem {
  id: string;
  salonId: string;
  imageUrl: string;
  caption: string;
  date: string;
}

export type SalonType = 'unisex' | 'men' | 'women';

export interface Salon {
  id: string;
  name: string;
  slug: string;
  uniqueId?: string;
  description: string;
  type: SalonType;
  rating: number;
  totalReviews: number;
  address: SalonAddress;
  coordinates: Coordinates;
  phone: string;
  openingHours: OpeningHours;
  images: SalonImages;
  amenities: string[];
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  priceRange?: string;
  startingPrice?: number;
  distance?: number;
  gallery?: GalleryItem[];
  hasImmediateSlots?: boolean;
  hasAIDiscounts?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  serviceCount: number;
}

export type ServiceGender = 'male' | 'female' | 'unisex';

export interface Service {
  id: string;
  salonId: string;
  categoryId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  discountPrice: number | null;
  gender: ServiceGender;
  isPopular: boolean;
  isActive: boolean;
}

export interface StaffBreak {
  start: string; // "13:00"
  end: string;   // "14:00"
}

export interface StaffWorkDay {
  open: string;  // "09:00"
  close: string; // "18:00"
  breaks: StaffBreak[];
  isClosed: boolean;
}

export interface StaffSchedule {
  monday: StaffWorkDay;
  tuesday: StaffWorkDay;
  wednesday: StaffWorkDay;
  thursday: StaffWorkDay;
  friday: StaffWorkDay;
  saturday: StaffWorkDay;
  sunday: StaffWorkDay;
}

export interface Staff {
  id: string;
  salonId: string;
  name: string;
  role: string;
  avatar: string;
  experience: number;
  specializations: string[];
  rating: number;
  isAvailable: boolean;
  schedule?: StaffSchedule;
  bio?: string;
  upiId?: string;
  portfolioImages?: string[];
}

export interface Review {
  id: string;
  salonId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  salonId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  discountPercentage?: number; // AI-driven dynamic discount
  marketingHook?: string;       // AI-driven urgency message
  valueAdd?: string;            // AI-driven bonus/service addition
}

export interface SalonDetail extends Salon {
  services: Service[];
  staff: Staff[];
  reviews: Review[];
}
