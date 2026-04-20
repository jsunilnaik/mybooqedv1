import React from 'react';
import { cn } from '../../lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  showCount?: boolean;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  showCount = false,
  count,
  size = 'md',
  className,
}) => {
  const starSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value);
          const partial = !filled && i < value;
          return (
            <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24">
              {partial ? (
                <>
                  <defs>
                    <linearGradient id={`star-grad-${i}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset={`${(value % 1) * 100}%`} stopColor="#C5FF00" />
                      <stop offset={`${(value % 1) * 100}%`} stopColor="#2A2D35" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill={`url(#star-grad-${i})`}
                    stroke="#2A2D35"
                    strokeWidth="1"
                  />
                </>
              ) : (
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={filled ? '#C5FF00' : '#2A2D35'}
                  stroke={filled ? '#C5FF00' : '#3A3D45'}
                  strokeWidth="1"
                />
              )}
            </svg>
          );
        })}
      </div>
      <span className={cn('font-bold text-[#F3F1EF]', textSize)}>{value.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className={cn('text-[#6B7280]', textSize)}>({count})</span>
      )}
    </div>
  );
};
