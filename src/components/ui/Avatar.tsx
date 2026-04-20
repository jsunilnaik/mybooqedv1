import React from 'react';
import { cn, getInitials, stringToColor } from '../../lib/utils';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'md',
  className,
  alt,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt || name}
        onError={() => setImgError(true)}
        className={cn(
          'rounded-full object-cover flex-shrink-0 aspect-square',
          sizeClasses[size],
          className
        )}
        style={{ borderRadius: '9999px' }}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center flex-shrink-0 font-semibold text-white aspect-square',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bgColor, borderRadius: '9999px' }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
