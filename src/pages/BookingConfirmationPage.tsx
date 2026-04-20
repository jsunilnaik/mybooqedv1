import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Calendar, Clock, MapPin, Phone,
  Star, ArrowRight, Home, Navigation, ChevronLeft,
  Scissors, User, CreditCard, Copy, Check
} from 'lucide-react';
import OSMMap from '../components/map/OSMMap';
import { salonService } from '../lib/dataService';
import type { Salon } from '../types';
import { playSuccessSound } from '../lib/audio';
import { consumeBookingToken } from '../utils/bookingToken';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams<{ token: string }>();
  const booking = location.state?.booking;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate booking reference - useMemo to prevent changing on re-render
  const bookingRef = useMemo(() => `BMS${Date.now().toString().slice(-6)}`, []);

  useEffect(() => {
    // Consume the token on first mount — makes it single-use.
    // If for any reason the token is already gone (e.g. double-mount in dev StrictMode),
    // the guard in App.tsx has already validated it so we still render.
    if (token) consumeBookingToken(token);

    if (booking?.salonId) {
      const salonData = salonService.getById(booking.salonId);
      if (salonData) setSalon(salonData as unknown as Salon);
    }
    // ── No demo fallback: without a legit booking there is nothing to show. ──

    // Play the success sound synced with the checkmark animation pop (delay: 0.1s -> 100ms)
    const timer = setTimeout(() => {
      playSuccessSound();
    }, 150);

    return () => clearTimeout(timer);
  }, [booking, token]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(bookingRef);
        setCopied(true);
      } else {
        // Fallback for mobile/non-secure context
        const textArea = document.createElement("textarea");
        textArea.value = bookingRef;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        if (successful) setCopied(true);
        document.body.removeChild(textArea);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Today';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '10:00 AM'; // Default fallback
    // Handle both "10:00" and "10:00 AM" formats
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h || '10');
    const mins = m || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${mins} ${ampm}`;
  };



  return (
    <div className="min-h-screen bg-[#F7F9FA]">

      {/* Minimal top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-900">Booking Confirmed</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── SUCCESS ANIMATION ── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="bg-white rounded-2xl p-8 text-center shadow-sm"
        >
          {/* Green check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={2} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-black mb-2"
          >
            Booking Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#71717A] text-sm mb-6"
          >
            Your appointment has been successfully booked.
            <br />We look forward to seeing you!
          </motion.p>

          {/* Booking reference */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5"
          >
            <span className="text-xs text-[#71717A]">Booking ID</span>
            <span className="font-mono font-bold text-black text-sm">{bookingRef}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              {copied
                ? <Check className="w-3.5 h-3.5 text-green-500" />
                : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </motion.div>
        </motion.div>

        {/* ── SALON IMAGE + INFO ── */}
        {salon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Cover image */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={salon.images.cover}
                alt={salon.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              {/* Salon name on image */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-white font-bold text-lg leading-tight">{salon.name}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" />
                  <span className="text-white text-sm font-medium">{salon.rating}</span>
                  <span className="text-white/70 text-xs">({salon.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Booking details */}
            <div className="p-5 space-y-4">
              <h3 className="font-semibold text-black text-sm uppercase tracking-wide">Appointment Details</h3>

              <div className="space-y-3">
                {/* Services */}
                {booking?.services && booking.services.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Scissors className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#71717A] mb-0.5">Services</p>
                      <div className="space-y-0.5">
                        {booking.services.map((svc: { name: string; price: number }, idx: number) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-black">{svc.name}</span>
                            <span className="text-sm text-[#71717A]">₹{svc.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff */}
                {booking?.staffName && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#71717A]">Stylist</p>
                      <p className="text-sm font-medium text-black">{booking.staffName}</p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#71717A]">Date</p>
                    <p className="text-sm font-medium text-black">{formatDate(booking?.date)}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#71717A]">Time</p>
                    <p className="text-sm font-medium text-black">
                      {formatTime(booking?.time || booking?.startTime)}
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#71717A]">Total Amount</p>
                      <p className="text-base font-bold text-black">₹{booking?.totalAmount ?? salon.startingPrice}</p>
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-full font-medium">Pay at salon</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#71717A] mb-0.5">Location</p>
                  <p className="text-sm font-medium text-black">{salon.address.line1}</p>
                  <p className="text-xs text-[#71717A]">{salon.address.area}, {salon.address.city}</p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${salon.coordinates.lat},${salon.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-black border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <Navigation className="w-3 h-3" />
                  Directions
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#71717A]">Salon Phone</p>
                  <p className="text-sm font-medium text-black">{salon.phone}</p>
                </div>
                <a
                  href={`tel:${salon.phone}`}
                  className="text-xs font-medium text-black border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  Call
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MAP LOCATION ── */}
        {salon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-black">Find Us Here</h3>
              <p className="text-xs text-[#71717A] mt-0.5">{salon.address.line1}, {salon.address.area}, {salon.address.city} — {salon.address.pincode}</p>
            </div>

            {/* OSM Map with Leaflet */}
            <div className="p-4">
              <OSMMap
                lat={salon.coordinates.lat}
                lng={salon.coordinates.lng}
                zoom={16}
                height="200px"
                name={salon.name}
                address={`${salon.address.line1}, ${salon.address.area}`}
              />
            </div>
          </motion.div>
        )}



        {/* ── WHAT'S NEXT ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-semibold text-black mb-4">What&apos;s Next?</h3>
          <div className="space-y-3">
            {[
              { dot: 'bg-green-400', text: 'You will receive a confirmation SMS shortly' },
              { dot: 'bg-blue-400', text: 'Arrive 5 minutes before your appointment time' },
              { dot: 'bg-amber-400', text: 'Payment is done at the salon after your service' },
              { dot: 'bg-purple-400', text: 'You can cancel up to 2 hours before your appointment' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 flex-shrink-0`} />
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── ACTION BUTTONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 pb-8"
        >
          <button
            onClick={() => navigate('/bookings')}
            className="w-full bg-black text-white font-semibold py-4 rounded-full text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
          >
            View My Bookings
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-white text-black font-semibold py-4 rounded-full text-sm border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
