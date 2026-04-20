export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  city: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  preferences?: string[];
  notifications?: { sms: boolean; email: boolean; whatsapp: boolean };
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignupData {
  name: string;
  phone: string;
  otp: string;
  email: string;
  password: string;
  avatar?: string;
  city: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  preferences: string[];
  notifications: { sms: boolean; email: boolean; whatsapp: boolean };
}
