import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

type Phase = 'email' | 'sent' | 'reset' | 'done';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();

  const [phase, setPhase] = useState<Phase>('email');
  const [email, setEmail] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState('');

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return; }
    setError('');
    await resetPassword(email);
    setPhase('sent');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }
    setError('');
    // Mock reset
    setTimeout(() => setPhase('done'), 800);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <Link to="/" className="flex flex-col items-center mb-8 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:scale-105 transition-transform overflow-hidden px-1.5 py-1.5 border border-gray-100">
            <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg sm:text-xl text-black leading-none tracking-tighter uppercase text-center">
            <span className="font-medium">Book My</span> <span className="font-black">Salon</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-[#71717A] mt-1.5 font-medium tracking-tight uppercase">Security Center</p>
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] p-8">
          <AnimatePresence mode="wait">

            {/* Phase 1: Enter email */}
            {phase === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}>
                <div className="w-14 h-14 bg-[#F7F9FA] rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
                  <Lock size={26} className="text-black" />
                </div>
                <h2 className="text-2xl font-bold text-black mb-1">Forgot password?</h2>
                <p className="text-sm text-[#71717A] mb-6">
                  No worries. Enter your email and we will send you a reset link.
                </p>

                <form onSubmit={handleSendReset} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#374151] block mb-2">Email Address</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-2xl focus-within:border-black transition-all">
                      <Mail size={15} className="ml-4 text-[#9CA3AF] flex-shrink-0" />
                      <input
                        type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@example.com"
                        autoFocus
                        className="flex-1 px-3 py-3.5 text-sm text-black placeholder-[#9CA3AF] outline-none bg-transparent"
                      />
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-red-500 text-xs mt-1.5">{error}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className={`w-full py-4 text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-200 ${
                      !email ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                    }`}
                  >
                    {isLoading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>Send Reset Link <ArrowRight size={15} /></>
                    }
                  </button>
                </form>
              </motion.div>
            )}

            {/* Phase 2: Email sent */}
            {phase === 'sent' && (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <Mail size={30} className="text-green-500" />
                </motion.div>

                <h2 className="text-2xl font-bold text-black text-center mb-2">Check your email</h2>
                <p className="text-sm text-[#71717A] text-center mb-2">
                  We sent a reset link to
                </p>
                <p className="text-sm font-bold text-black text-center mb-6">{email}</p>

                <div className="bg-[#F7F9FA] rounded-2xl p-4 mb-6 space-y-2">
                  {['Check your inbox and spam folder', 'Click the reset link in the email', 'Create a new secure password'].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-[#374151]">
                      <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white">{i + 1}</span>
                      </div>
                      {tip}
                    </div>
                  ))}
                </div>

                {/* Mock: go directly to reset for demo */}
                <button
                  onClick={() => setPhase('reset')}
                  className="w-full py-4 text-sm font-bold rounded-full bg-black text-white hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Set New Password (Demo) <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => { setPhase('email'); setEmail(''); }}
                  className="w-full mt-3 py-3 text-sm font-semibold text-[#71717A] hover:text-black transition-colors"
                >
                  Use a different email
                </button>
              </motion.div>
            )}

            {/* Phase 3: Set new password */}
            {phase === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <div className="w-14 h-14 bg-[#F7F9FA] rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
                  <Lock size={26} className="text-black" />
                </div>
                <h2 className="text-2xl font-bold text-black mb-1">New password</h2>
                <p className="text-sm text-[#71717A] mb-6">Must be at least 8 characters</p>

                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#374151] block mb-2">New Password</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-2xl focus-within:border-black transition-all">
                      <input
                        type={showPw ? 'text' : 'password'} value={newPw}
                        onChange={(e) => { setNewPw(e.target.value); setError(''); }}
                        placeholder="Min. 8 characters"
                        autoFocus
                        className="flex-1 pl-4 pr-3 py-3.5 text-sm text-black placeholder-[#9CA3AF] outline-none bg-transparent"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="mr-4 text-[#9CA3AF] hover:text-black">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#374151] block mb-2">Confirm Password</label>
                    <div className={`flex items-center border-2 rounded-2xl transition-all ${
                      confirmPw && confirmPw !== newPw ? 'border-red-300' : 'border-gray-200 focus-within:border-black'
                    }`}>
                      <input
                        type={showCf ? 'text' : 'password'} value={confirmPw}
                        onChange={(e) => { setConfirmPw(e.target.value); setError(''); }}
                        placeholder="Re-enter password"
                        className="flex-1 pl-4 pr-3 py-3.5 text-sm text-black placeholder-[#9CA3AF] outline-none bg-transparent"
                      />
                      <button type="button" onClick={() => setShowCf(!showCf)} className="mr-4 text-[#9CA3AF] hover:text-black">
                        {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPw && confirmPw === newPw && (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1"><CheckCircle size={11} /> Passwords match</p>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs">{error}</motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={!newPw || !confirmPw}
                    className={`w-full py-4 text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-200 ${
                      !newPw || !confirmPw ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                    }`}
                  >
                    Reset Password <ArrowRight size={15} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Phase 4: Done */}
            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle size={32} className="text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-black mb-2">Password reset!</h2>
                <p className="text-sm text-[#71717A] mb-8">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => navigate('/account/login')}
                  className="w-full py-4 text-sm font-bold rounded-full bg-black text-white hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Back to Sign In <ArrowRight size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back to login */}
        {phase !== 'done' && (
          <Link
            to="/account/login"
            className="flex items-center justify-center gap-1.5 mt-5 text-sm font-semibold text-[#71717A] hover:text-black transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
