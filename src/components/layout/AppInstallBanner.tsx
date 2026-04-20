import { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

// Insert your App Store or Play Store link here
const APP_INSTALL_LINK = 'https://play.google.com/store/apps/details?id=com.MyBOOQED.app';

export const AppInstallBanner = () => {
  const [show, setShow] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if running in browser vs standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true);
    
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Remember if user dismissed it this session
    const bannerClosed = sessionStorage.getItem('bms-app-banner-closed') === 'true';

    if (isMobile && !isStandalone && !bannerClosed) {
      setShow(true);
    }

    // Theme detection
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      updateFavicon(e.matches);
    };

    updateFavicon(darkModeMediaQuery.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  // Helper to switch browser favicon
  const updateFavicon = (isDark: boolean) => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      // You can point these to specific light/dark versions of your logo if you have them
      // For now, I'm keeping it as /logo.svg but this is where you'd swap them
      // favicon.setAttribute('href', isDark ? '/logo-white.svg' : '/logo.svg');
    }
  };

  if (!show) return null;

  return (
    <div className="bg-[#0D0D0E] text-white px-3 py-2 flex items-center justify-between border-b border-[#1A1A1B] shadow-lg relative z-[150] transition-all duration-300">
      <button 
        onClick={() => {
          setShow(false);
          sessionStorage.setItem('bms-app-banner-closed', 'true');
        }}
        className="p-1 mr-1 text-gray-500 hover:text-white transition-colors flex-shrink-0"
        aria-label="Close banner"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md transition-colors duration-300",
          isDarkMode ? "bg-white" : "bg-[#1A1A1B] border border-gray-800"
        )}>
          <Smartphone size={18} className={isDarkMode ? "text-black" : "text-white"} />
        </div>
        <div className="flex flex-col justify-center min-w-0 pr-2">
          <h3 className="text-[11px] font-black tracking-widest text-[#F9F9F9] uppercase leading-tight">MyBOOQED APP</h3>
          <p className="text-[9px] text-gray-500 mt-0.5 truncate font-medium">Get the mobile app right now!</p>
        </div>
      </div>
      <a 
        href={APP_INSTALL_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#FF385C] hover:bg-[#D70466] text-white text-[9px] font-black px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-md transition-all flex items-center gap-1 flex-shrink-0 active:scale-[0.96]"
      >
        <Download size={11} />
        INSTALL
      </a>
    </div>
  );
};

// Helper function locally if 'cn' is not available in current context, or I'll just use string template
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

