import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, SignupData } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  
  // Real-world auth actions
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<void>;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// In-memory user database for mock testing
const MOCK_USERS: User[] = [
  {
    id: 'usr_001',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    phone: '9876543210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    city: 'Ballari',
    gender: 'male',
    preferences: ['Haircut', 'Beard Trim'],
    notifications: { sms: true, email: true, whatsapp: true },
    createdAt: '2024-01-15T10:00:00Z',
  },
];

const generateUser = (data: Partial<User>): User => ({
  id: `usr_${Date.now()}`,
  name: data.name || 'User',
  email: data.email || '',
  phone: data.phone || '',
  avatar: data.avatar,
  city: data.city || 'Select City',
  gender: data.gender,
  dob: data.dob,
  preferences: data.preferences || [],
  notifications: data.notifications || { sms: true, email: true, whatsapp: true },
  createdAt: new Date().toISOString(),
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      otpSent: false,
      otpVerified: false,

      clearError: () => set({ error: null }),

      sendOTP: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate network latency
          await new Promise((r) => setTimeout(r, 1500));
          
          if (!/^[6-9]\d{9}$/.test(phone)) {
            throw new Error('Invalid phone number format');
          }
          
          set({ isLoading: false, otpSent: true });
          console.log(`[MOCK AUTH] OTP sent to +91 ${phone} — code: 000000`);
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      verifyOTP: async (_phone: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((r) => setTimeout(r, 1000));
          const isValid = otp === '000000' || otp.length === 6; // Mock allows anything 6 digits
          
          if (!isValid) throw new Error('Incorrect OTP. Please check and try again.');
          
          set({ isLoading: false, otpVerified: true });
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((r) => setTimeout(r, 2000));
          
          // Check if user already exists
          if (MOCK_USERS.some(u => u.email === data.email || u.phone === data.phone)) {
            throw new Error('An account with this email/phone already exists.');
          }

          const newUser = generateUser(data);
          MOCK_USERS.push(newUser);
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false,
            otpSent: false,
            otpVerified: false 
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      login: async (identifier: string, _password?: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((r) => setTimeout(r, 1500));
          
          // Mock login handles both phone (identifier only) and email+password
          const user = MOCK_USERS.find(u => 
            u.email === identifier || u.phone === identifier
          );

          if (!user) {
            // Auto-generate guest if not found (matching current mock behavior but safer)
            const guestUser = generateUser({ 
              phone: identifier.includes('@') ? '' : identifier,
              email: identifier.includes('@') ? identifier : '',
              name: 'Guest'
            });
            set({ user: guestUser, isAuthenticated: true, isLoading: false });
            return;
          }

          // In production, we'd verify password here
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((r) => setTimeout(r, 1000));
          const current = get().user;
          if (!current) throw new Error('No active session.');
          
          const updatedUser = { ...current, ...data };
          set({ user: updatedUser, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 500));
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          error: null,
          otpSent: false, 
          otpVerified: false 
        });
      },
    }),
    {
      name: 'bms-auth-prod',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
