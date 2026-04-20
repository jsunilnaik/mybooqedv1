import { useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const PAGE_NAMES: Record<string, string> = {
  '/owner/salon': 'Salon Profile',
  '/owner/services': 'Services',
  '/owner/staff': 'Staff',
  '/owner/bookings': 'Bookings',
  '/owner/slots': 'Availability',
  '/owner/reviews': 'Reviews',
  '/owner/analytics': 'Analytics',
  '/owner/settings': 'Settings',
};

export default function OwnerPlaceholderPage() {
  const { pathname } = useLocation();
  const name = PAGE_NAMES[pathname] || 'Page';
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 bg-[#F7F9FA] rounded-2xl flex items-center justify-center mb-4">
        <Wrench className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-black">{name}</h2>
      <p className="text-[#71717A] text-sm mt-2 text-center">
        This section is being built in the next session.
      </p>
    </div>
  );
}
