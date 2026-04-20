import { create } from 'zustand';
import { generateBookingToken } from '../utils/bookingToken';
import type { Service, Staff } from '../types';

interface BookingStore {
  salonId: string;
  salonName: string;
  salonSlug: string;
  salonImage: string;
  salonArea: string;
  currentStep: 1 | 2 | 3 | 4;
  selectedServices: Service[];
  selectedStaff: Staff | null;
  selectedDate: string;
  selectedTime: string;
  totalAmount: number;
  totalDuration: number;
  confirmationToken: string;

  // Actions
  initBooking: (salon: { id: string; name: string; slug: string; image: string; area: string }) => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  toggleService: (service: Service) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  setStaff: (staff: Staff | null) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  calculateTotals: () => void;
  resetBooking: () => void;
  /** Generate a short-lived single-use token and return it. */
  generateToken: () => string;
}

const initialState = {
  salonId: '',
  salonName: '',
  salonSlug: '',
  salonImage: '',
  salonArea: '',
  currentStep: 1 as const,
  selectedServices: [],
  selectedStaff: null,
  selectedDate: '',
  selectedTime: '',
  totalAmount: 0,
  totalDuration: 0,
  confirmationToken: '',
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  initBooking: (salon) => {
    set({
      ...initialState,
      salonId: salon.id,
      salonName: salon.name,
      salonSlug: salon.slug,
      salonImage: salon.image,
      salonArea: salon.area,
    });
  },

  setStep: (step) => set({ currentStep: step }),

  toggleService: (service) => {
    const { selectedServices } = get();
    const exists = selectedServices.find((s) => s.id === service.id);
    const updated = exists
      ? selectedServices.filter((s) => s.id !== service.id)
      : [...selectedServices, service];
    const totalAmount = updated.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);
    const totalDuration = updated.reduce((sum, s) => sum + s.duration, 0);
    set({ selectedServices: updated, totalAmount, totalDuration });
  },

  addService: (service) => {
    const { selectedServices } = get();
    if (selectedServices.find((s) => s.id === service.id)) return;
    const updated = [...selectedServices, service];
    const totalAmount = updated.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);
    const totalDuration = updated.reduce((sum, s) => sum + s.duration, 0);
    set({ selectedServices: updated, totalAmount, totalDuration });
  },

  removeService: (serviceId) => {
    const { selectedServices } = get();
    const updated = selectedServices.filter((s) => s.id !== serviceId);
    const totalAmount = updated.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);
    const totalDuration = updated.reduce((sum, s) => sum + s.duration, 0);
    set({ selectedServices: updated, totalAmount, totalDuration });
  },

  setStaff: (staff) => set({ selectedStaff: staff }),
  setDate: (date) => set({ selectedDate: date, selectedTime: '' }),
  setTime: (time) => set({ selectedTime: time }),

  calculateTotals: () => {
    const { selectedServices } = get();
    const totalAmount = selectedServices.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    set({ totalAmount, totalDuration });
  },

  resetBooking: () => set(initialState),

  generateToken: () => {
    const token = generateBookingToken();
    set({ confirmationToken: token });
    return token;
  },
}));
