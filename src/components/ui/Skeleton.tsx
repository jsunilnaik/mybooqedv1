import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded = 'md' }) => {
  const roundedMap = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100',
        'bg-[length:200%_100%]',
        'animate-[shimmer_1.5s_infinite]',
        roundedMap[rounded],
        className
      )}
      style={{
        animation: 'shimmer 1.5s infinite',
        background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
};

// Salon card skeleton
export const SalonCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl overflow-hidden shadow-sm', className)}>
    <Skeleton className="w-full h-48" rounded="sm" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" rounded="full" />
        <Skeleton className="h-4 w-20" rounded="full" />
      </div>
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

// Service item skeleton
export const ServiceItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-8 w-16" rounded="lg" />
    </div>
  </div>
);

// Review skeleton
export const ReviewSkeleton: React.FC = () => (
  <div className="space-y-3 py-4 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10" rounded="full" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);
