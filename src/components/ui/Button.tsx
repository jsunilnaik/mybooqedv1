import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#C5FF00] text-[#060911] font-black hover:bg-[#d4ff26] hover:shadow-[0_8px_24px_rgba(197,255,0,0.25)] disabled:bg-[#2A2D35] disabled:text-[#6B7280]',
  accent:  'bg-[#7B69FF] text-white font-semibold hover:bg-[#6B59EF] hover:shadow-[0_8px_24px_rgba(123,105,255,0.3)] disabled:bg-[#2A2D35] disabled:text-[#6B7280]',
  outline: 'bg-transparent text-[#F3F1EF] font-semibold border border-[#2A2D35] hover:bg-[#1A1D24] hover:border-[#3A3D45] disabled:opacity-40',
  ghost:   'bg-transparent text-[#9CA3AF] font-medium hover:bg-[#1A1D24] hover:text-[#F3F1EF] disabled:opacity-40',
  danger:  'bg-[#FA3951] text-white font-semibold hover:bg-[#E02942] hover:shadow-[0_8px_24px_rgba(250,57,81,0.3)] disabled:opacity-40',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

const spinnerColor: Record<Variant, string> = {
  primary: '#060911',
  accent:  '#ffffff',
  outline: '#F3F1EF',
  ghost:   '#9CA3AF',
  danger:  '#ffffff',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] whitespace-nowrap select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 18 : 15} color={spinnerColor[variant]} />
      ) : icon ? (
        icon
      ) : null}
      {children}
      {!loading && iconRight}
    </button>
  );
};
