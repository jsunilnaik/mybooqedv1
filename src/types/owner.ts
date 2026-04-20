import type { OpeningHours, SalonType, Service, Staff, Review, TimeSlot } from './salon';
import type { Booking } from './booking';

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface OwnedSalon {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  type: SalonType;
  rating: number;
  totalReviews: number;
  address: {
    line1: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  coordinates: { lat: number; lng: number };
  phone: string;
  email?: string;
  openingHours: OpeningHours;
  images: {
    cover: string;
    gallery: string[];
  };
  amenities: string[];
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  cancellationPolicy?: string;
  payAtSalon: boolean;
  acceptedPayments: string[];
}

export interface OwnerNotification {
  id: string;
  type: 'new_booking' | 'cancellation' | 'new_review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  bookingId?: string;
}

export interface OwnerStats {
  totalBookings: number;
  todayBookings: number;
  monthlyRevenue: number;
  avgRating: number;
  totalReviews: number;
  completedBookings: number;
  cancelledBookings: number;
  upcomingBookings: number;
}

export interface OwnerStore {
  // Auth
  owner: Owner | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Salon data
  salon: OwnedSalon | null;
  services: Service[];
  staff: Staff[];
  bookings: Booking[];
  slots: TimeSlot[];
  reviews: Review[];
  notifications: OwnerNotification[];

  // Registration wizard state
  registrationStep: number;
  registrationData: Partial<OwnerRegistrationData>;

  // Actions — Auth
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // Actions — Registration
  setRegistrationStep: (step: number) => void;
  setRegistrationData: (data: Partial<OwnerRegistrationData>) => void;
  completeRegistration: () => Promise<void>;

  // Actions — Salon
  updateSalon: (data: Partial<OwnedSalon>) => void;

  // Actions — Services
  addService: (service: Service) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Actions — Staff
  addStaff: (member: Staff) => void;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // Actions — Bookings
  updateBookingStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') => void;

  // Actions — Slots
  toggleSlot: (date: string, time: string, staffId: string) => void;

  // Actions — Reviews
  replyToReview: (reviewId: string, reply: string) => void;

  // Actions — Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Computed
  getStats: () => OwnerStats;
}

export interface OwnerRegistrationData {
  // Step 1 — Personal details
  ownerName: string;
  email: string;
  phone: string;
  password: string;

  // Step 2 — Salon basic info
  salonName: string;
  salonType: SalonType;
  description: string;
  categories: string[];

  // Step 3 — Location
  line1: string;
  area: string;
  city: string;
  state: string;
  pincode: string;

  // Step 4 — Opening hours
  openingHours: OpeningHours;

  // Step 5 — Photos & amenities
  coverImage: string;
  galleryImages: string[];
  amenities: string[];
}
