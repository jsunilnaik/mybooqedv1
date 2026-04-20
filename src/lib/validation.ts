import { z } from 'zod';

/**
 * Common regex and validation rules
 */
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Login Schema
 */
export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Step 1: Contact Info
 */
export const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'),
});

/**
 * Step 2: Account Security
 */
export const AccountSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().regex(
    passwordRegex,
    'Password must be 8+ chars, include uppercase, lowercase, number, and special character'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Step 3: Profile Details
 */
export const ProfileSchema = z.object({
  avatar: z.string().url().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  dob: z.string().optional(),
  city: z.string().min(1, 'Please select your city'),
});

/**
 * Step 4: Preferences & Terms
 */
export const PreferencesSchema = z.object({
  preferences: z.array(z.string()).default([]),
  notifications: z.object({
    sms: z.boolean().default(true),
    email: z.boolean().default(true),
    whatsapp: z.boolean().default(true),
  }),
  agreed: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms to continue',
  }),
});

/**
 * Full Signup Schema (Union of steps)
 */
export const SignupSchema = ContactSchema
  .merge(AccountSchema)
  .merge(ProfileSchema)
  .merge(PreferencesSchema);

export type LoginFields = z.infer<typeof LoginSchema>;
export type ContactFields = z.infer<typeof ContactSchema>;
export type AccountFields = z.infer<typeof AccountSchema>;
export type ProfileFields = z.infer<typeof ProfileSchema>;
export type PreferencesFields = z.infer<typeof PreferencesSchema>;
export type SignupFields = z.infer<typeof SignupSchema>;
