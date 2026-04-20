import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  interactive = false,
  padding = 'none',
  border = false,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)]',
        'transition-shadow duration-200',
        border && 'border border-[#E5E7EB]',
        interactive && [
          'cursor-pointer',
          'hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),_0_2px_4px_rgba(0,0,0,0.06)]',
          'hover:-translate-y-0.5',
          'transition-all duration-200',
        ],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
