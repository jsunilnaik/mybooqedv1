import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  onRemove,
  icon,
  disabled = false,
  className,
  size = 'md',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all duration-200 whitespace-nowrap',
        size === 'sm' ? 'text-xs px-3 py-1' : 'text-sm px-4 py-2',
        selected
          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
          : 'bg-white text-gray-700 border-[#E5E7EB] hover:border-gray-300 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            'ml-0.5 rounded-full p-0.5 transition-colors',
            selected ? 'hover:bg-white/20' : 'hover:bg-gray-200'
          )}
        >
          <X size={12} />
        </button>
      )}
    </button>
  );
};

// Chip group
interface ChipGroupProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  selected: string | string[];
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  options,
  selected,
  onChange,
  size = 'md',
  className,
}) => {
  const isSelected = (value: string) =>
    Array.isArray(selected) ? selected.includes(value) : selected === value;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          selected={isSelected(opt.value)}
          size={size}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
};
