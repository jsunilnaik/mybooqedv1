import type { Service, Staff } from './salon';

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export interface BookingService {
  serviceId: string;
  staffId: string;
  serviceName: string;
  staffName: string;
  price: number;
  duration: number;
}

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  salonName: string;
  salonImage?: string;
  salonArea?: string;
  services: BookingService[];
  staffName?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  totalDuration: number;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingFormState {
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
}
