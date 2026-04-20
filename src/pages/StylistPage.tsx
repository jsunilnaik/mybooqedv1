import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { salonService } from '../lib/dataService';
import { Staff, Salon } from '../types';
import { ChevronLeft, MapPin, Instagram, Link2, Share2, Star, Camera, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export default function StylistPage() {
  const { slug } = useParams<{ slug: string }>();
  // Extract the unique ID from the end of the SEO friendly slug (e.g., rohan-kumar-stf_001 -> stf_001)
  const id = slug?.split('-').pop();

  const [stylist, setStylist] = useState<Staff | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(100);
  const [customTip, setCustomTip] = useState<string>('');
  const { success } = useToast();

  useEffect(() => {
    if (id) {
      const staffMember = salonService.getStaffById(id);
      if (staffMember) {
        setStylist(staffMember);
        const salonData = salonService.getById(staffMember.salonId);
        if (salonData) setSalon(salonData);
      }
    }
  }, [id]);

  // Handle Dynamic SEO Tags
  useEffect(() => {
    if (stylist && salon) {
      document.title = `${stylist.name} | Professional Stylist at ${salon.name} | BookMySalon`;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', `View ${stylist.name}'s stunning portfolio, leave a direct tip via UPI, and book your next appointment seamlessly at ${salon.name}.`);
      
      // Cleanup on unmount
      return () => {
        document.title = 'BookMySalon | Ultimate Booking platform';
      };
    }
  }, [stylist, salon]);

  if (!stylist || !salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stylist Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find the profile you're looking for.</p>
          <Link to="/" className="bg-black text-white px-6 py-3 rounded-full font-medium">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Generate the direct UPI Deep Link
  // Wait, encodeURIComponent doesn't always work perfectly for spaces in UPI params, %20 is best.
  // We'll use URLSearchParams for safest encoding.
  const getUpiUrl = (amount: number) => {
    const activeUpi = stylist.upiId || 'demo@okhdfcbank';
    const pn = encodeURIComponent(stylist.name);
    const tn = encodeURIComponent('Tip for Great Haircut');
    return `upi://pay?pa=${activeUpi}&pn=${pn}&cu=INR&am=${amount}&tn=${tn}`;
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomTip(val);
    setTipAmount(val ? parseInt(val, 10) : 0);
  };

  const handleShare = async () => {
    if (!stylist) return;
    const shareData = {
      title: `${stylist.name}'s Portfolio`,
      text: `Check out ${stylist.name}'s amazing portfolio!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        success('Link copied to clipboard!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        success('Link copied to clipboard!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 md:pb-0 font-sans selection:bg-black selection:text-white">
      {/* Mobile-style Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <Link to={`/${salon.slug}`} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </Link>
        <span className="font-semibold text-gray-900">{stylist.name}</span>
        <button onClick={handleShare} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
          <Share2 className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full pb-10">
        {/* Profile Card */}
        <div className="px-5 pt-8 pb-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white mb-4">
              <img src={stylist.avatar} alt={stylist.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-4 right-0 bg-black text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              {stylist.rating}
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{stylist.name}</h1>
          <p className="text-indigo-600 font-medium mb-3">{stylist.role}</p>

          <Link to={`/${salon.slug}`} className="flex items-center gap-1.5 text-gray-500 hover:text-black transition-colors text-sm bg-gray-100/50 px-4 py-2 rounded-full mb-5">
            <MapPin className="w-4 h-4" />
            Stylist at <span className="font-semibold">{salon.name}</span>
          </Link>

          {stylist.bio && (
            <p className="text-center text-gray-600 leading-relaxed max-w-sm">
              "{stylist.bio}"
            </p>
          )}

          {/* Book Appointment CTA */}
          <Link to={`/${salon.slug}/book`} className="mt-8 w-full bg-black text-white rounded-2xl py-4 font-semibold text-center hover:bg-gray-900 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-xl shadow-black/10">
            Book Appointment
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        <div className="h-2 w-full bg-gray-50" />

        {/* Tipping Engine Section - Ultra Compact */}
        <div className="mx-4 my-2 p-3 bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Direct Tip</h2>
              <p className="text-[10px] text-gray-500">Zero commission to {stylist.name.split(' ')[0]}</p>
            </div>
            {/* Quick Tip Selection */}
            <div className="flex gap-1.5">
              {[50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setTipAmount(amount); setCustomTip(''); }}
                  className={`py-1 w-11 rounded-md border text-xs font-semibold transition-all ${
                    tipAmount === amount && !customTip ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {/* QR Code */}
            <div className="p-1 border border-gray-100 rounded-lg flex items-center justify-center -mb-1 shrink-0">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(getUpiUrl(tipAmount))}`} 
                alt="QR Code" 
                className="w-[60px] h-[60px]"
              />
            </div>
            
            <div className="flex flex-col flex-1 justify-center gap-1.5">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xs">₹</span>
                <input
                  type="text"
                  placeholder="Custom"
                  value={customTip}
                  onChange={handleCustomTipChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md py-1 pl-5 pr-2 outline-none focus:border-black transition-all text-xs font-medium"
                />
              </div>
              <a href={getUpiUrl(tipAmount)} className="w-full bg-[#1A73E8] text-white rounded-md py-1.5 text-[11px] font-semibold text-center hover:bg-[#155fc2] transition-colors md:hidden">
                Pay on Mobile
              </a>
              <span className="hidden md:inline-block w-full bg-gray-800 text-white rounded-md py-1.5 text-[11px] font-semibold text-center">
                Scan via UPI App
              </span>
            </div>
          </div>
          {!stylist.upiId && <p className="text-[9px] text-orange-500 mt-2 text-center">*Demo Mode: Fallback UPI ID active</p>}
        </div>

        <div className="h-2 w-full bg-gray-50" />

        {/* Portfolio Builder Section */}
        <div className="px-5 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
            <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {stylist.portfolioImages?.length || 0} Cuts
            </div>
          </div>

          {stylist.portfolioImages && stylist.portfolioImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {stylist.portfolioImages.map((img, i) => (
                <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 group relative">
                  <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-xs font-medium">Fresh Cut</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center mb-6">
              <Camera className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No photos uploaded yet.</p>
            </div>
          )}

          {/* Automated Workflow Webhook Trigger Info */}
          <div className="bg-[#E7FDF2] border border-[#C1F4D8] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#C1F4D8] rounded-full opacity-50 blur-xl" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Were you a client?</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Show off your new look! Reply to our WhatsApp message with a selfie, and it will automatically appear here on {stylist.name.split(' ')[0]}'s profile.
                </p>
                <a 
                  href="https://wa.me/911234567890?text=Hi!%20Here%20is%20my%20photo%20for%20Rohan's%20portfolio" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#10B981] font-semibold text-sm hover:underline"
                >
                  Message us on WhatsApp
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
