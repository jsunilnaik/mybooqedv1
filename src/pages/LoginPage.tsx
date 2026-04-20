import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Shield, Eye, EyeOff,
  Phone, Mail, RefreshCw, X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/useAuthStore';
import { LoginSchema, type LoginFields } from '../lib/validation';

type Tab = 'phone' | 'email';
type PhaseOTP = 'input' | 'otp';

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
              : 'border-gray-200 bg-white text-black focus:border-black focus:ring-2 focus:ring-black/10'}`}
        />
      ))}
    </div>
  );
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOTP, verifyOTP, login, isLoading, error: authError } = useAuthStore();

  const [tab, setTab] = useState<Tab>('phone');
  const [phase, setPhase] = useState<PhaseOTP>('input');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const from = (location.state as { from?: string })?.from || '/';

  /* Form Setup */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<LoginFields>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
    mode: 'onBlur'
  });

  const watchIdentifier = watch('identifier');

  /* countdown timer */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!watchIdentifier || watchIdentifier.length !== 10) {
      setGlobalError('Enter a valid 10-digit number');
      return;
    }
    try {
      setGlobalError('');
      await sendOTP(watchIdentifier);
      setPhase('otp');
      setCountdown(30);
      setOtp('');
      setOtpError('');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    try {
      setGlobalError('');
      await verifyOTP(watchIdentifier, otp);
      await login(watchIdentifier);
      navigate(from, { replace: true });
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect OTP');
      setOtp('');
    }
  };

  const onEmailSubmit = async (data: LoginFields) => {
    setGlobalError('');
    try {
      await login(data.identifier, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setGlobalError(err.message || 'Login failed');
    }
  };

  const maskPhone = (p: string) => `+91 ${p.slice(0, 2)}${'*'.repeat(6)}${p.slice(-2)}`;

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-10 text-[#374151]">

      {/* ── LOGO ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center mb-6 sm:mb-10"
      >
        <Link to="/" className="flex flex-col items-center group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 transition-transform overflow-hidden px-1.5 py-1.5 border border-gray-100">
            <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl text-black leading-none tracking-tighter uppercase text-center">
            <span className="font-medium">My</span><span className="font-black">BOOQED</span>
          </h1>
          <p className="text-xs text-[#71717A] mt-2 font-bold tracking-widest uppercase opacity-60">India's Choice for Luxury</p>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-[0_2px_45px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          
          {/* ── TABS ── */}
          <div className="flex bg-[#F9FAFB] p-1.5 m-2 rounded-2xl border border-gray-100">
            {(['phone', 'email'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPhase('input'); setGlobalError(''); setOtpError(''); setValue('identifier', ''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${
                  tab === t ? 'bg-black text-white shadow-lg' : 'text-[#71717A] hover:bg-gray-100'
                }`}
              >
                {t === 'phone' ? <Phone size={14} /> : <Mail size={14} />}
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-9 pt-6">
            <AnimatePresence mode="wait">
              {tab === 'phone' ? (
                <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  {phase === 'input' ? (
                    <div>
                      <h2 className="text-2xl font-black text-black mb-1">Welcome back</h2>
                      <p className="text-sm text-[#71717A] mb-8 font-medium">Glad to see you again!</p>

                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-2 px-1">Mobile Number</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 overflow-hidden ${globalError ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <div className="px-4 h-full border-r border-gray-100 flex items-center gap-2 bg-[#F3F4F6] flex-shrink-0">
                          <IndiaFlag />
                          <span className="text-xs font-black text-black">+91</span>
                        </div>
                        <input
                          type="tel"
                          {...register('identifier')}
                          placeholder="9876543210"
                          autoFocus
                          className="flex-1 px-4 text-sm text-black font-semibold outline-none bg-transparent"
                        />
                      </div>

                      <button
                        onClick={handleSendOTP}
                        disabled={isLoading || !watchIdentifier || watchIdentifier.length !== 10}
                        className="w-full mt-8 bg-black text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                      >
                        {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <>Send OTP <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => { setPhase('input'); setOtp(''); }} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] hover:text-black mb-6 transition-colors">
                        <X size={12} /> Change number
                      </button>

                      <div className="text-center mb-8">
                        <h2 className="text-xl font-black text-black mb-2">Check your phone</h2>
                        <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                          We've sent a code to<br />
                          <span className="text-black font-black mt-1 block tracking-wider">{maskPhone(watchIdentifier)}</span>
                        </p>
                      </div>

                      <OTPInput value={otp} onChange={(v) => { setOtp(v); setOtpError(''); }} hasError={!!otpError} />
                      {otpError && <p className="text-red-500 text-[10px] text-center mt-4 font-bold uppercase tracking-wider">{otpError}</p>}

                      <button
                        onClick={handleVerifyOTP}
                        disabled={isLoading || otp.length !== 6}
                        className="w-full mt-8 bg-black text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none"
                      >
                        {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'Verify & Sign In'}
                      </button>

                      <div className="text-center mt-6">
                        {countdown > 0 ? (
                          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Resend in <span className="text-black">{countdown}s</span></p>
                        ) : (
                          <button onClick={handleSendOTP} className="text-[10px] font-bold text-black border-b-2 border-black pb-0.5 hover:opacity-70 transition-opacity uppercase tracking-widest">Resend OTP</button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-2xl font-black text-black mb-1">Sign in</h2>
                  <p className="text-sm text-[#71717A] mb-8 font-medium">Use your registered email</p>

                  <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-5">
                    <div>
                      <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest block mb-2 px-1">Email Address</label>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 ${errors.identifier ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <Mail size={16} className="ml-4 text-[#9CA3AF]" />
                        <input
                          type="email" {...register('identifier')}
                          placeholder="alex@example.com" autoFocus
                          className="flex-1 px-4 text-sm text-black font-semibold outline-none bg-transparent"
                        />
                      </div>
                      {errors.identifier && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.identifier.message}</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2 px-1">
                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest">Password</label>
                        <Link to="/account/forgot" className="text-[10px] font-bold text-black uppercase tracking-widest hover:underline underline-offset-4">Forgot?</Link>
                      </div>
                      <div className={`flex items-center border-2 rounded-2xl transition-all h-14 ${errors.password ? 'border-red-400 bg-red-50/20' : 'border-gray-100 bg-[#F9FAFB] focus-within:border-black focus-within:bg-white'}`}>
                        <input
                          type={showPw ? 'text' : 'password'} {...register('password')}
                          placeholder="••••••••"
                          className="flex-1 px-5 text-sm text-black font-semibold outline-none bg-transparent"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="mr-4 text-[#9CA3AF] hover:text-black transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.password.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-4 bg-black text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={16} /></>}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {globalError && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[11px] font-black text-center mt-6 uppercase tracking-widest bg-red-50 py-3.5 rounded-2xl border border-red-100">
            {globalError}
          </motion.p>
        )}

        {authError && !globalError && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[11px] font-black text-center mt-6 uppercase tracking-widest bg-red-50 py-3.5 rounded-2xl border border-red-100">
            {authError}
          </motion.p>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#9CA3AF]">
            <Shield size={12} className="text-green-500 fill-green-500/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Login</span>
          </div>
          
          <p className="text-center text-xs text-[#71717A] font-medium">
            New to MyBOOQED?{' '}
            <Link to="/account/signup" className="text-black font-black hover:underline underline-offset-4 tracking-tighter ml-1">Create Account</Link>
          </p>
        </motion.div>

        <p className="text-center text-[10px] text-[#9CA3AF] mt-8 uppercase tracking-[0.15em] font-medium px-4 leading-relaxed">
          By signing in, you agree to our <Link to="/terms" className="text-black font-bold">Terms</Link> & <Link to="/privacy" className="text-black font-bold">Privacy</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
