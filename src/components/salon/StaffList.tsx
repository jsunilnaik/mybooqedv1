import React from 'react';
import { StaffCard } from './StaffCard';
import type { Staff } from '../../types';

interface StaffListProps {
  staff: Staff[];
  selectable?: boolean;
  selectedStaff?: Staff | null;
  onSelect?: (staff: Staff) => void;
}

export const StaffList: React.FC<StaffListProps> = ({
  staff,
  selectable = false,
  selectedStaff,
  onSelect,
}) => {
  if (!staff || staff.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#71717A] text-sm">No staff information available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {staff.map((member) => (
        <StaffCard
          key={member.id}
          staff={member}
          selectable={selectable}
          selected={selectedStaff?.id === member.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
