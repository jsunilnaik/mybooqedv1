import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Store, Copy, Check } from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';

const DEMO_EMAIL = 'demo@MyBOOQED.in';
const DEMO_PASSWORD = 'demo123';

export default function OwnerLoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useOwnerStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }
    try {
      await login(email, password);
      navigate('/owner/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Login failed. Please try again.');
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const copyText = (text: string, type: 'email' | 'pass') => {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">MyBOOQED</p>
              <p className="text-white/50 text-xs">India&apos;s Premium Salon Network</p>
            </div>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Grow your salon<br />with smart bookings.
            </h1>
            <p className="text-white/60 mt-4 text-lg leading-relaxed">
              Join many salons already using MyBOOQED to manage their appointments and grow their business.
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/80 text-sm leading-relaxed italic">
              &ldquo;Since joining MyBOOQED, our bookings have increased by 40%. The dashboard makes managing everything so simple.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">RK</div>
              <div>
                <p className="text-white text-sm font-medium">Ravi Kumar</p>
                <p className="text-white/50 text-xs">Owner, Royal Men&rsquo;s Salon</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '20+', label: 'Salons Listed' },
              { value: '500+', label: 'Bookings/Month' },
              { value: '4.8★', label: 'Avg Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white text-2xl font-bold">{stat.value}</p>
                <p className="text-white/50 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-sm">© 2025 MyBOOQED</p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-lg leading-none">MyBOOQED</p>
              <p className="text-[#71717A] text-xs">Owner Portal</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-black">Welcome back</h2>
            <p className="text-[#71717A] mt-2">Sign in to your salon dashboard</p>
          </div>

          {/* Demo Credentials Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Store className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-blue-900 text-sm font-bold">Demo Credentials</p>
              </div>
              <button
                onClick={fillDemo}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Auto Fill
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Email credential */}
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#71717A] font-medium uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-black truncate">{DEMO_EMAIL}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyText(DEMO_EMAIL, 'email')}
                  className="flex-shrink-0 ml-2 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Copy email"
                >
                  {copiedEmail
                    ? <Check className="w-3.5 h-3.5 text-green-500" />
                    : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
                </button>
              </div>

              {/* Password credential */}
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100">
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#71717A] font-medium uppercase tracking-wide">Password</p>
                    <p className="text-sm font-semibold text-black">{DEMO_PASSWORD}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyText(DEMO_PASSWORD, 'pass')}
                  className="flex-shrink-0 ml-2 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Copy password"
                >
                  {copiedPass
                    ? <Check className="w-3.5 h-3.5 text-green-500" />
                    : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-blue-600 mt-2.5 text-center">
              Tip: Any email works with password &ldquo;demo123&rdquo;
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yoursalon.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-100 rounded-xl p-3 flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[#71717A] text-sm">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Register CTA */}
          <Link
            to="/owner/register"
            className="w-full border-2 border-black text-black py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all text-sm"
          >
            <Store className="w-4 h-4" />
            List Your Salon — It’s Free
          </Link>

          <p className="text-center text-[#71717A] text-sm mt-6">
            <Link to="/" className="hover:text-black transition-colors underline underline-offset-2">
              Back to MyBOOQED
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
