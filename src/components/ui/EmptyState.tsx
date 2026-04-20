import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'accent' | 'outline';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'py-8 px-4' : size === 'lg' ? 'py-20 px-6' : 'py-12 px-6',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-100 mb-4',
            size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16'
          )}
        >
          <span className={cn('text-gray-400', size === 'lg' ? 'text-4xl' : 'text-2xl')}>
            {icon}
          </span>
        </div>
      )}
      <h3
        className={cn(
          'font-semibold text-[#1A1A1A]',
          size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'text-gray-500 mt-2 max-w-xs',
            size === 'sm' ? 'text-sm' : 'text-base'
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant || 'accent'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};
