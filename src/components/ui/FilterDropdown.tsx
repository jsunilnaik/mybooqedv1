import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterDropdownProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  isOpen: boolean;
  onClick: (e: React.MouseEvent) => void;
  onClose: () => void;
  className?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  icon,
  children,
  isActive,
  isOpen,
  onClick,
  onClose,
  className,
  menuClassName,
  align = 'left'
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        // We use position: fixed for the portal to avoid overflow-x clipping
        // We calculate position relative to the viewport
        setCoords({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    };

    updatePosition();
    if (isOpen) {
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true); // true for capture to catch all scrolls
    }
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Handle closing on scroll if it moves too much (optional, but safer)
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => {
       // Close on scroll to prevent menus floating away from their buttons
       onClose();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, onClose]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all whitespace-nowrap flex-shrink-0 select-none",
          isActive 
            ? "bg-black text-white border-black" 
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400",
          className
        )}
      >
        {icon}
        <span className="truncate max-w-[120px]">{label}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && coords && createPortal(
        <>
          {/* Backdrop/Overlay to close */}
          <div className="fixed inset-0 z-[1000] bg-transparent" onClick={onClose} />
          
          <div 
            className={cn(
              "fixed z-[1001] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-scaleIn overflow-hidden",
              align === 'right' ? 'origin-top-right' : 'origin-top-left',
              menuClassName
            )}
            style={{ 
              top: `${coords.top + 8}px`, 
              left: align === 'left' ? `${coords.left}px` : 'auto',
              right: align === 'right' ? `${window.innerWidth - (coords.left + coords.width)}px` : 'auto',
            }}
          >
            {children}
          </div>
        </>,
        document.body
      )}
    </>
  );
};
