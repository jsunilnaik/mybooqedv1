import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, CheckCircle,
  Eye, EyeOff, Phone, Mail, User, MapPin,
  Bell, RefreshCw, X, MessageCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/useAuthStore';
import { salonService } from '../lib/dataService';
import { SignupSchema, type SignupFields } from '../lib/validation';
import type { SignupData } from '../types';

/* ── India Flag ── */
const IndiaFlag = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="rounded-sm flex-shrink-0">
    <rect width="20" height="4.67" fill="#FF9933" />
    <rect y="4.67" width="20" height="4.67" fill="white" />
    <rect y="9.33" width="20" height="4.67" fill="#138808" />
    <circle cx="10" cy="7" r="1.8" fill="none" stroke="#000080" strokeWidth="0.7" />
    <circle cx="10" cy="7" r="0.4" fill="#000080" />
  </svg>
);

/* ── 6-box OTP Input ── */
const OTPInput: React.FC<{ value: string; onChange: (v: string) => void; hasError?: boolean }> = ({
  value, onChange, hasError,
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, char: string) => {
    const digit = char.replace(/\D/g, '');
    if (!digit) return;
    const arr = value.split('');
    arr[i] = digit[0];
    onChange(arr.join('').slice(0, 6));
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const arr = value.split('');
      if (arr[i]) { arr[i] = ''; onChange(arr.join('')); }
      else if (i > 0) { onChange(value.slice(0, i)); refs.current[i - 1]?.focus(); }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all duration-150
            ${hasError ? 'border-red-400 bg-red-50 text-red-600'
              : value[i] ? 'border-black bg-black text-white'
              : 'border-gray-200 bg-white focus:border-black focus:ring-2 focus:ring-black/10'}`}
        />
      ))}
    </div>
  );
};

/* ── Password strength ── */
const StrengthBar: React.FC<{ password?: string }> = ({ password }) => {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-100'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : score === 3 ? 'text-blue-500' : 'text-green-600'}`}>
        {labels[score]} password
      </p>
    </div>
  );
};

const STEPS = [
  { id: 1, label: 'Contact', icon: Phone },
  { id: 2, label: 'Account', icon: Mail },
  { id: 3, label: 'Profile', icon: User },
  { id: 4, label: 'Prefs', icon: Bell },
];

const SERVICE_PREFS = [
  'Haircut', 'Beard Trim', 'Hair Colour', 'Facial', 'Spa', 'Nail Art', 'Bridal', 'Kids Cut',
];

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Meena',
];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, signup, isLoading, error: authError } = useAuthStore();

  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState('');

  /* Form Setup */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors }
  } = useForm<SignupFields>({
    resolver: zodResolver(SignupSchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: DEFAULT_AVATARS[0],
      city: '',
      gender: '',
      preferences: [],
      notifications: { sms: true, email: true, whatsapp: true },
      agreed: false,
    },
    mode: 'onBlur'
  });

  const watchFields = watch();
  
  /* countdown timer for Resend OTP */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* Load cities from service */
  useEffect(() => {
    const cities = salonService.getCities();
    setAvailableCities(cities);
  }, []);

  const handleSendOTPClick = async () => {
    const isValid = await trigger(['name', 'phone']);
    if (!isValid) return;
    try {
      setGlobalError('');
      await sendOTP(watchFields.phone);
      setOtpSent(true);
      setCountdown(30);
      setOtp('');
      setOtpError('');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTPClick = async () => {
    if (otp.length !== 6) return;
    try {
      setGlobalError('');
      await verifyOTP(watchFields.phone, otp);
      setOtpVerified(true);
      setOtpError('');
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect OTP');
      setOtp('');
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['name', 'phone']);
      if (isValid && !otpVerified) {
        setGlobalError('Please verify your phone number first.');
        return;
      }
    } else if (step === 2) {
      isValid = await trigger(['email', 'password', 'confirmPassword' as 'confirmPassword']);
    } else if (step === 3) {
      isValid = await trigger(['city']);
    }
    
    if (isValid) {
      setStep((s) => s + 1);
      setGlobalError('');
    }
  };

  const onFinalSubmit = async (data: SignupFields) => {
    setGlobalError('');
    try {
      const signupData: SignupData = {
        ...data,
        otp,
        gender: data.gender === '' ? undefined : (data.gender as any),
        dob: data.dob || undefined,
      };
      await signup(signupData);
      navigate('/');
    } catch (err: any) {
      setGlobalError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-10 text-[#374151]">
      
      {/* ── LOGO ── */}
      <Link to="/" className="flex flex-col items-center mb-5 sm:mb-8 group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform overflow-hidden px-1 py-1 border border-gray-100">
          <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-base sm:text-lg text-black leading-none tracking-tighter uppercase text-center">
          <span className="font-medium">My</span><span className="font-black">BOOQED</span>
        </h1>
      </Link>

      <div className="w-full max-w-sm">
        
        {/* ── STEP INDICATOR ── */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step > s.id ? 'bg-black border-black text-white' : 
                  step === s.id ? 'bg-black border-black text-white shadow-lg shadow-black/10' : 
                  'bg-white border-gray-200 text-[#9CA3AF]'
                }`}>
                  {step > s.id ? <CheckCircle size={16} /> : <s.icon size={14} />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step === s.id ? 'text-black' : 'text-[#9CA3AF]'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-2 mb-4 rounded-full transition-all duration-500 ${step > s.id ? 'bg-black' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── MAIN CARD ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] border border-gray-100/50 overflow-hidden">
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              
              {/* ── STEP 1: CONTACT ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-2xl font-black text-black mb-1">Join the family</h2>
                  <p className="text-sm text-[#71717A] mb-8 font-medium">Verify your identity to get started</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-2 px-1">Full Name</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 ${errors.name ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <User size={16} className="ml-4 text-[#9CA3AF]" />
                        <input
                          type="text" {...register('name')}
                          placeholder="Your Name" autoFocus
                          className="flex-1 px-4 text-sm text-black font-semibold outline-none bg-transparent"
                        />
                        {!errors.name && watchFields.name?.length >= 2 && <CheckCircle size={16} className="text-green-500 mr-4" />}
                      </div>
                      {errors.name && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-2 px-1">Mobile Number</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 overflow-hidden ${errors.phone ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <div className="px-4 h-full border-r border-gray-100 flex items-center gap-2 bg-[#F3F4F6] flex-shrink-0">
                          <IndiaFlag />
                          <span className="text-xs font-black text-black">+91</span>
                        </div>
                        <input
                          type="tel" {...register('phone')}
                          placeholder="9876543210" disabled={otpSent}
                          className="flex-1 px-4 text-sm text-black font-semibold outline-none bg-transparent disabled:opacity-50"
                        />
                        {otpVerified && <CheckCircle size={16} className="text-green-500 mr-4" />}
                        {otpSent && !otpVerified && !isLoading && (
                          <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="mr-4 text-[#9CA3AF] hover:text-black transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      {errors.phone && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.phone.message}</p>}
                    </div>
                  </div>

                  {/* OTP Interaction */}
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOTPClick}
                      disabled={isLoading}
                      className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <>Continue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  ) : !otpVerified ? (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <p className="text-[11px] font-bold text-center text-[#9CA3AF] uppercase tracking-widest mb-4">Enter 6-digit OTP</p>
                      <OTPInput value={otp} onChange={(v) => { setOtp(v); setOtpError(''); }} hasError={!!otpError} />
                      {otpError && <p className="text-red-500 text-[10px] text-center mt-3 font-bold">{otpError}</p>}
                      <button
                        type="button"
                        onClick={handleVerifyOTPClick}
                        disabled={isLoading || otp.length !== 6}
                        className="w-full mt-6 bg-black text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none disabled:hover:translate-y-0"
                      >
                        {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'Verify & Continue'}
                      </button>
                      <div className="text-center mt-5">
                        {countdown > 0 ? (
                          <p className="text-[10px] font-bold text-[#9CA3AF]">Resend OTP in <span className="text-black">{countdown}s</span></p>
                        ) : (
                          <button type="button" onClick={handleSendOTPClick} className="text-[10px] font-bold text-black border-b-2 border-black pb-0.5 hover:opacity-70 transition-opacity uppercase tracking-wider">Resend OTP</button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center justify-center gap-2 text-green-600 bg-green-50/50 py-3 rounded-xl border border-green-100">
                      <CheckCircle size={16} />
                      <span className="text-xs font-black uppercase tracking-wider">Contact Verified</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 2: ACCOUNT ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-2xl font-black text-black mb-1">Security first</h2>
                  <p className="text-sm text-[#71717A] mb-8 font-medium">Protect your personal bookings</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-2 px-1">Email Address</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 ${errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <Mail size={16} className="ml-4 text-[#9CA3AF]" />
                        <input
                          type="email" {...register('email')}
                          placeholder="alex@example.com" autoFocus
                          className="flex-1 px-4 text-sm text-black font-semibold outline-none bg-transparent"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-2 px-1">Create Password</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 ${errors.password ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <input
                          type={showPw ? 'text' : 'password'} {...register('password')}
                          placeholder="At least 8 chars"
                          className="flex-1 pl-5 pr-4 text-sm text-black font-semibold outline-none bg-transparent"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="mr-4 text-[#9CA3AF] hover:text-black transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <StrengthBar password={watchFields.password} />
                      {errors.password && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold leading-relaxed">{errors.password.message}</p>}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-2 px-1">Confirm Password</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 ${errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <input
                          type={showCf ? 'text' : 'password'} {...register('confirmPassword')}
                          placeholder="Re-type password"
                          className="flex-1 px-5 text-sm text-black font-semibold outline-none bg-transparent"
                        />
                        <button type="button" onClick={() => setShowCf(!showCf)} className="mr-4 text-[#9CA3AF] hover:text-black transition-colors">
                          {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.confirmPassword?.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: PROFILE ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-2xl font-black text-black mb-1">Your identity</h2>
                  <p className="text-sm text-[#71717A] mb-8 font-medium">Add a personal touch to your profile</p>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-4 px-1 text-center">Choose an Avatar</label>
                      <div className="flex justify-center gap-3">
                        {DEFAULT_AVATARS.map((url, i) => (
                          <button
                            key={i} type="button"
                            onClick={() => setValue('avatar', url)}
                            className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all duration-300 ${watchFields.avatar === url ? 'border-black scale-110 shadow-lg' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                          >
                            <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-3 px-1">Select Gender</label>
                      <div className="flex gap-2">
                        {(['male', 'female', 'other'] as const).map((g) => (
                          <button
                            key={g} type="button"
                            onClick={() => setValue('gender', g)}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all capitalize tracking-wider ${watchFields.gender === g ? 'bg-black text-white border-black scale-[0.98]' : 'bg-[#F9FAFB] text-[#71717A] border-gray-100 hover:border-gray-200'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-3 px-1">Your Location</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 ${errors.city ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                         <MapPin size={16} className="ml-4 text-[#9CA3AF]" />
                         <select
                           {...register('city')}
                           className="flex-1 px-4 text-sm text-black font-semibold outline-none bg-transparent appearance-none"
                         >
                           <option value="">Select City</option>
                           {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                         <ArrowRight size={14} className="mr-4 text-[#9CA3AF] rotate-90" />
                      </div>
                      {errors.city && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.city.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4: PREFERENCES ── */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-2xl font-black text-black mb-1">Favourities</h2>
                  <p className="text-sm text-[#71717A] mb-8 font-medium">Select services you're interested in</p>

                  <div className="grid grid-cols-2 gap-2 mb-8">
                    {SERVICE_PREFS.map((p) => {
                      const isSelected = watchFields.preferences?.includes(p);
                      return (
                        <button
                          key={p} type="button"
                          onClick={() => {
                            const cur = watchFields.preferences || [];
                            setValue('preferences', isSelected ? cur.filter(x => x !== p) : [...cur, p]);
                          }}
                          className={`py-3 px-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between ${isSelected ? 'bg-black text-white border-black ring-4 ring-black/5' : 'bg-[#F9FAFB] text-[#71717A] border-gray-100 hover:border-gray-200'}`}
                        >
                          {p}
                          {isSelected && <CheckCircle size={14} />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Bell size={14} className="text-blue-500" />
                        </div>
                        <span className="text-xs font-bold text-black uppercase tracking-wider">SMS Alerts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue('notifications.sms', !watchFields.notifications.sms)}
                        className={`w-10 h-5 rounded-full transition-all relative ${watchFields.notifications.sms ? 'bg-black' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${watchFields.notifications.sms ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <MessageCircle size={14} className="text-green-500" />
                        </div>
                        <span className="text-xs font-bold text-black uppercase tracking-wider">WhatsApp</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue('notifications.whatsapp', !watchFields.notifications.whatsapp)}
                        className={`w-10 h-5 rounded-full transition-all relative ${watchFields.notifications.whatsapp ? 'bg-black' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${watchFields.notifications.whatsapp ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-start gap-3 mt-8 p-4 bg-[#F9FAFB] rounded-2xl border border-gray-100 cursor-pointer group" onClick={() => setValue('agreed', !watchFields.agreed)}>
                      <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${watchFields.agreed ? 'bg-black border-black' : 'border-gray-200 bg-white group-hover:border-gray-400'}`}>
                        {watchFields.agreed && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <p className="text-[10px] sm:text-xs text-[#71717A] leading-relaxed font-medium">
                        I confirm that I have read and agree to the <span className="text-black font-bold underline">Terms of Service</span> and <span className="text-black font-bold underline">Privacy Policy</span>.
                      </p>
                    </div>
                    {errors.agreed && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.agreed.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── FOOTER ── */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="w-14 h-14 flex items-center justify-center border-2 border-gray-100 rounded-2xl text-[#71717A] hover:bg-[#F9FAFB] hover:border-gray-200 transition-all active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-black text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
              >
                Next Step <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onFinalSubmit as any)}
                disabled={isLoading}
                className="flex-1 bg-black text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <>Complete Signup <CheckCircle size={18} /></>}
              </button>
            )}
          </div>
        </div>

        {globalError && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[11px] font-black text-center mt-5 uppercase tracking-widest bg-red-50 py-3 rounded-xl border border-red-100">
            {globalError}
          </motion.p>
        )}

        {authError && !globalError && (
           <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[11px] font-black text-center mt-5 uppercase tracking-widest bg-red-50 py-3 rounded-xl border border-red-100">
             {authError}
           </motion.p>
        )}

        <p className="text-center text-xs text-[#71717A] mt-8 font-medium">
          Already have an account?{' '}
          <Link to="/account/login" className="text-black font-black hover:underline underline-offset-4 tracking-tighter">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
