import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { salonService } from '../lib/dataService';
import type { Service, Staff, StaffSchedule } from '../types';

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
  name: string;
  slug: string;
  description: string;
  type: 'men' | 'women' | 'unisex';
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  totalReviews: number;
  cancellationPolicy?: string;
  payAtSalon?: boolean;
  acceptedPayments?: string[];
  address: {
    line1: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  coordinates: { lat: number; lng: number };
  openingHours: Record<string, { open: string; close: string; closed?: boolean }>;
  images: { cover: string; gallery: string[] };
  amenities: string[];
  featured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface OwnerBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  salonId: string;
  services: Array<{ serviceId: string; serviceName: string; staffId: string; staffName: string; duration: number; price: number }>;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  totalDuration: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  note?: string;
  createdAt: string;
}

export interface OwnerReview {
  id: string;
  salonId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  flagged?: boolean;
}

export interface OwnerNotification {
  id: string;
  type: 'booking' | 'review' | 'cancellation' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface OwnerSlot {
  id: string;
  salonId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'blocked' | 'booked';
}

export interface OwnerStore {
  owner: Owner | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  salon: OwnedSalon | null;
  services: Service[];
  staff: Staff[];
  bookings: OwnerBooking[];
  slots: OwnerSlot[];
  reviews: OwnerReview[];
  notifications: OwnerNotification[];

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { owner: Owner; salon: OwnedSalon; password: string }) => Promise<void>;
  completeRegistration: (data: { owner: Owner; salon: OwnedSalon; password: string; legalDocs?: unknown; panDetails?: unknown; bankDetails?: unknown }) => Promise<void>;
  updateSalon: (data: Partial<OwnedSalon>) => void;
  addService: (service: Service) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  updateStaffSchedule: (staffId: string, schedule: StaffSchedule) => void;
  updateBookingStatus: (id: string, status: OwnerBooking['status'], note?: string) => void;
  addNote: (id: string, note: string) => void;
  toggleSlot: (date: string, time: string, staffId: string) => void;
  blockDay: (date: string, staffId: string) => void;
  addSlot: (slot: OwnerSlot) => void;
  removeSlot: (id: string) => void;
  replyToReview: (reviewId: string, reply: string) => void;
  flagReview: (reviewId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<OwnerNotification, 'id' | 'createdAt' | 'read'>) => void;
  loadSalonData: (salonId: string) => void;
  getStats: () => {
    totalBookings: number;
    todayBookings: number;
    monthlyRevenue: number;
    avgRating: number;
    completedBookings: number;
    cancelledBookings: number;
    upcomingBookings: number;
  };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const DEFAULT_STAFF_SCHEDULE: StaffSchedule = {
  monday: { open: '09:00', close: '18:00', breaks: [], isClosed: false },
  tuesday: { open: '09:00', close: '18:00', breaks: [], isClosed: false },
  wednesday: { open: '09:00', close: '18:00', breaks: [], isClosed: false },
  thursday: { open: '09:00', close: '18:00', breaks: [], isClosed: false },
  friday: { open: '09:00', close: '18:00', breaks: [], isClosed: false },
  saturday: { open: '10:00', close: '19:00', breaks: [], isClosed: false },
  sunday: { open: '10:00', close: '14:00', breaks: [], isClosed: true },
};

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
const twoDaysLater = new Date(Date.now() + 172800000).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];

const SAMPLE_BOOKINGS: OwnerBooking[] = [
  { id: 'ob_001', customerId: 'usr_001', customerName: 'Rahul Sharma', customerPhone: '+91-9876543210', salonId: 'sal_001', services: [{ serviceId: 'svc_001', serviceName: "Men's Haircut", staffId: 'stf_001', staffName: 'Raju Kumar', duration: 30, price: 200 }], date: today, startTime: '10:00', endTime: '10:30', totalAmount: 200, totalDuration: 30, status: 'confirmed', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'ob_002', customerId: 'usr_002', customerName: 'Priya Singh', customerPhone: '+91-9845678901', salonId: 'sal_001', services: [{ serviceId: 'svc_003', serviceName: "Women's Haircut", staffId: 'stf_002', staffName: 'Sunita Devi', duration: 45, price: 400 }, { serviceId: 'svc_010', serviceName: 'Deep Conditioning', staffId: 'stf_002', staffName: 'Sunita Devi', duration: 30, price: 350 }], date: today, startTime: '11:00', endTime: '12:15', totalAmount: 750, totalDuration: 75, status: 'confirmed', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'ob_003', customerId: 'usr_003', customerName: 'Amit Patel', customerPhone: '+91-9812345678', salonId: 'sal_001', services: [{ serviceId: 'svc_002', serviceName: 'Beard Trim', staffId: 'stf_001', staffName: 'Raju Kumar', duration: 20, price: 100 }], date: today, startTime: '14:00', endTime: '14:20', totalAmount: 100, totalDuration: 20, status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ob_004', customerId: 'usr_004', customerName: 'Kavya Reddy', customerPhone: '+91-9987654321', salonId: 'sal_001', services: [{ serviceId: 'svc_015', serviceName: 'Bridal Makeup', staffId: 'stf_003', staffName: 'Meena Kumari', duration: 120, price: 3500 }], date: tomorrow, startTime: '09:00', endTime: '11:00', totalAmount: 3500, totalDuration: 120, status: 'confirmed', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'ob_005', customerId: 'usr_005', customerName: 'Suresh Kumar', customerPhone: '+91-9765432109', salonId: 'sal_001', services: [{ serviceId: 'svc_005', serviceName: 'Hair Color', staffId: 'stf_001', staffName: 'Raju Kumar', duration: 90, price: 800 }], date: yesterday, startTime: '15:00', endTime: '16:30', totalAmount: 800, totalDuration: 90, status: 'completed', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'ob_006', customerId: 'usr_002', customerName: 'Priya Singh', customerPhone: '+91-9845678901', salonId: 'sal_001', services: [{ serviceId: 'svc_008', serviceName: 'Facial', staffId: 'stf_003', staffName: 'Meena Kumari', duration: 60, price: 600 }], date: twoDaysAgo, startTime: '11:00', endTime: '12:00', totalAmount: 600, totalDuration: 60, status: 'cancelled', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'ob_007', customerId: 'usr_003', customerName: 'Amit Patel', customerPhone: '+91-9812345678', salonId: 'sal_001', services: [{ serviceId: 'svc_001', serviceName: "Men's Haircut", staffId: 'stf_001', staffName: 'Raju Kumar', duration: 30, price: 200 }, { serviceId: 'svc_002', serviceName: 'Beard Trim', staffId: 'stf_001', staffName: 'Raju Kumar', duration: 20, price: 100 }], date: twoDaysLater, startTime: '16:00', endTime: '16:50', totalAmount: 300, totalDuration: 50, status: 'confirmed', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'ob_008', customerId: 'usr_001', customerName: 'Rahul Sharma', customerPhone: '+91-9876543210', salonId: 'sal_001', services: [{ serviceId: 'svc_012', serviceName: 'Spa & Massage', staffId: 'stf_004', staffName: 'Venkat Rao', duration: 60, price: 1200 }], date: threeDaysAgo, startTime: '10:00', endTime: '11:00', totalAmount: 1200, totalDuration: 60, status: 'completed', createdAt: new Date(Date.now() - 345600000).toISOString() }
];

const SAMPLE_REVIEWS: OwnerReview[] = [
  { id: 'rv_001', salonId: 'sal_001', customerId: 'usr_001', customerName: 'Rahul Sharma', rating: 5, comment: 'Best salon in India! Raju is an expert stylist. Very clean and professional setup.', createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 'rv_002', salonId: 'sal_001', customerId: 'usr_002', customerName: 'Priya Singh', rating: 4, comment: 'Good service, loved the ambiance. Sunita did an amazing job with my hair. Slightly pricey but worth it.', createdAt: new Date(Date.now() - 1209600000).toISOString() },
  { id: 'rv_003', salonId: 'sal_001', customerId: 'usr_003', customerName: 'Amit Patel', rating: 5, comment: 'Always my go-to salon. Quick service, no waiting time. The beard trim was perfect.', createdAt: new Date(Date.now() - 1814400000).toISOString() },
  { id: 'rv_004', salonId: 'sal_001', customerId: 'usr_004', customerName: 'Kavya Reddy', rating: 3, comment: 'Average experience. The facial was good but the staff kept me waiting for 20 minutes.', createdAt: new Date(Date.now() - 2419200000).toISOString() },
  { id: 'rv_005', salonId: 'sal_001', customerId: 'usr_005', customerName: 'Suresh Kumar', rating: 5, comment: 'Excellent hair color treatment! Very natural looking results. Will definitely come back.', createdAt: new Date(Date.now() - 3024000000).toISOString() },
  { id: 'rv_006', salonId: 'sal_001', customerId: 'usr_001', customerName: 'Rahul Sharma', rating: 4, comment: 'Great experience overall. The head massage was very relaxing. Friendly staff.', createdAt: new Date(Date.now() - 3628800000).toISOString() }
];

const SAMPLE_NOTIFICATIONS: OwnerNotification[] = [
  { id: 'n_001', type: 'booking', title: 'New Booking!', message: 'Rahul Sharma booked Men\'s Haircut for today at 10:00 AM', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n_002', type: 'booking', title: 'New Booking!', message: 'Priya Singh booked Women\'s Haircut for today at 11:00 AM', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n_003', type: 'review', title: 'New Review', message: 'Suresh Kumar left a 5-star review for your salon', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n_004', type: 'cancellation', title: 'Booking Cancelled', message: 'Priya Singh cancelled her Facial appointment', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'n_005', type: 'booking', title: 'New Booking!', message: 'Kavya Reddy booked Bridal Makeup for tomorrow at 9:00 AM', read: true, createdAt: new Date(Date.now() - 10800000).toISOString() }
];

export const useOwnerStore = create<OwnerStore>()(
  persist(
    (set, get) => ({
      owner: null,
      isAuthenticated: false,
      isLoading: false,
      salon: null,
      services: [],
      staff: [],
      bookings: SAMPLE_BOOKINGS,
      slots: [],
      reviews: SAMPLE_REVIEWS,
      notifications: SAMPLE_NOTIFICATIONS,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));

        // Check registered owner first
        const stored = localStorage.getItem('owner-registration');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.owner.email === email && data.password === password) {
            set({ owner: data.owner, isAuthenticated: true, salon: data.salon, isLoading: false });
            get().loadSalonData(data.salon.id);
            return;
          }
        }

        // Demo credentials: any email + password "demo123" OR "owner123"
        if (password === 'demo123' || password === 'owner123') {
          const result = salonService.getAll({});
          
          // Handle both array and paginated results
          const salons = Array.isArray(result) ? result : (result as any).data;
          
          if (!salons || salons.length === 0) {
            set({ isLoading: false });
            throw new Error('No salons found in the system. Demo login unavailable.');
          }

          const salonData = salons[0] as unknown as OwnedSalon;
          const ownerName = email.includes('@') ? email.split('@')[0].replace(/[^a-zA-Z ]/g, ' ').trim() : 'Demo Owner';
          const formattedName = ownerName.charAt(0).toUpperCase() + ownerName.slice(1);
          const owner: Owner = {
            id: 'own_demo',
            name: formattedName || 'Demo Owner',
            email,
            phone: '+91-9999999999',
            createdAt: new Date().toISOString(),
          };
          set({ owner, isAuthenticated: true, salon: salonData, isLoading: false });
          get().loadSalonData(salonData.id);
          return;
        }

        set({ isLoading: false });
        throw new Error('Invalid credentials. Use password: demo123');
      },

      logout: () => set({ owner: null, isAuthenticated: false, salon: null, services: [], staff: [], bookings: SAMPLE_BOOKINGS, reviews: SAMPLE_REVIEWS, isLoading: false }),

      register: async (data) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 1000));
        localStorage.setItem('owner-registration', JSON.stringify(data));
        set({ owner: data.owner, isAuthenticated: true, salon: data.salon, isLoading: false });
        get().loadSalonData(data.salon.id);
      },

      completeRegistration: async (data) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 1500));
        localStorage.setItem('owner-registration', JSON.stringify(data));
        set({ owner: data.owner, isAuthenticated: true, salon: data.salon, isLoading: false });
        get().loadSalonData(data.salon.id);
      },

      loadSalonData: (salonId: string) => {
        try {
          const salonData = salonService.getById(salonId);
          if (salonData) {
            set({
              services: (salonData.services || []) as Service[],
              staff: (salonData.staff || []) as Staff[],
            });
          }
        } catch {
          // Keep sample data
        }
      },

      getStats: () => {
        const { bookings, reviews } = get();
        const todayStr = new Date().toISOString().split('T')[0];
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const todayBookings = bookings.filter((b) => b.date === todayStr && b.status !== 'cancelled').length;
        const monthlyRevenue = bookings.filter((b) => new Date(b.createdAt) >= monthStart && b.status === 'completed').reduce((sum, b) => sum + b.totalAmount, 0);
        const rawAvg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        const avgRating = Math.round(rawAvg * 10) / 10;
        const completedBookings = bookings.filter((b) => b.status === 'completed').length;
        const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
        const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' && b.date >= todayStr).length;

        return { totalBookings: bookings.length, todayBookings, monthlyRevenue, avgRating, completedBookings, cancelledBookings, upcomingBookings };
      },

      updateSalon: (data) => set((state) => ({ salon: state.salon ? { ...state.salon, ...data } : null })),
      addService: (service) => set((state) => ({ services: [...state.services, service] })),
      updateService: (id, data) => set((state) => ({ services: state.services.map((s) => s.id === id ? { ...s, ...data } : s) })),
      deleteService: (id) => set((state) => ({ services: state.services.filter((s) => s.id !== id) })),
      addStaff: (staff) => set((state) => ({ staff: [...state.staff, staff] })),
      updateStaff: (id, data) => set((state) => ({ staff: state.staff.map((s) => s.id === id ? { ...s, ...data } : s) })),
      deleteStaff: (id) => set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),

      updateStaffSchedule: (staffId, schedule) => set((state) => ({
        staff: state.staff.map((s) => s.id === staffId ? { ...s, schedule } : s)
      })),

      updateBookingStatus: (id, status, note) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === id ? { ...b, status, ...(note ? { note } : {}) } : b)
      })),

      addNote: (id, note) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === id ? { ...b, note } : b)
      })),

      addSlot: (slot) => set((state) => ({ slots: [...state.slots, slot] })),
      removeSlot: (id) => set((state) => ({ slots: state.slots.filter((s) => s.id !== id) })),

      toggleSlot: (date, time, staffId) => set((state) => {
        const existing = state.slots.find((s) => s.date === date && s.startTime === time && s.staffId === staffId);
        if (existing) {
          const nextStatus = existing.status === 'available' ? 'blocked' : 'available';
          return { slots: state.slots.map((s) => s.id === existing.id ? { ...s, status: nextStatus } : s) };
        }
        const newSlot: OwnerSlot = { id: generateId(), salonId: state.salon?.id || '', staffId, date, startTime: time, endTime: '', status: 'blocked' };
        return { slots: [...state.slots, newSlot] };
      }),

      blockDay: (date, staffId) => set((state) => {
        const times = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30'];
        const existing = state.slots.filter((s) => s.date === date && s.staffId === staffId);
        const existingTimes = existing.map((s) => s.startTime);
        const newSlots = times.filter((t) => !existingTimes.includes(t)).map((t) => ({ id: generateId(), salonId: state.salon?.id || '', staffId, date, startTime: t, endTime: '', status: 'blocked' as const }));
        const updated = state.slots.map((s) => s.date === date && s.staffId === staffId ? { ...s, status: 'blocked' as const } : s);
        return { slots: [...updated, ...newSlots] };
      }),

      replyToReview: (reviewId, reply) => set((state) => ({
        reviews: state.reviews.map((r) => r.id === reviewId ? { ...r, reply, repliedAt: new Date().toISOString() } : r)
      })),

      flagReview: (reviewId) => set((state) => ({
        reviews: state.reviews.map((r) => r.id === reviewId ? { ...r, flagged: !r.flagged } : r)
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),

      addNotification: (notification) => set((state) => ({
        notifications: [{ ...notification, id: generateId(), read: false, createdAt: new Date().toISOString() }, ...state.notifications]
      }))
    }),
    {
      name: 'owner-store',
      partialize: (state) => ({
        owner: state.owner,
        isAuthenticated: state.isAuthenticated,
        salon: state.salon,
        services: state.services,
        staff: state.staff,
        reviews: state.reviews,
        notifications: state.notifications
      })
    }
  )
);
