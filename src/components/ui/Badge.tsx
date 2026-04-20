import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'lime' | 'prince' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#2A2D35] text-[#9CA3AF] border border-[#3A3D45]',
  success: 'bg-[rgba(90,196,59,0.12)] text-[#5AC43B] border border-[rgba(90,196,59,0.3)]',
  warning: 'bg-[rgba(252,82,1,0.12)] text-[#FC6A20] border border-[rgba(252,82,1,0.3)]',
  error:   'bg-[rgba(250,57,81,0.12)] text-[#FA3951] border border-[rgba(250,57,81,0.3)]',
  lime:    'bg-[rgba(197,255,0,0.12)] text-[#C5FF00] border border-[rgba(197,255,0,0.3)]',
  prince:  'bg-[rgba(123,105,255,0.12)] text-[#7B69FF] border border-[rgba(123,105,255,0.3)]',
  info:    'bg-[rgba(64,58,250,0.12)] text-[#7B78FC] border border-[rgba(64,58,250,0.3)]',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
  size = 'sm',
}) => (
  <span
    className={cn(
      'inline-flex items-center font-bold rounded-full',
      size === 'sm' ? 'px-2.5 py-0.5 text-[10px] tracking-wide uppercase' : 'px-3 py-1 text-xs',
      variantStyles[variant],
      className
    )}
  >
    {children}
  </span>
);
