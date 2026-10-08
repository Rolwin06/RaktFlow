import React from 'react';
import type { BloodGroup } from '@/types/blood';

export interface BloodGroupBadgeProps {
  group: BloodGroup;
  size?: 'sm' | 'md' | 'lg';
  showDrop?: boolean;
}

export const BloodGroupBadge: React.FC<BloodGroupBadgeProps> = ({
  group,
  size = 'md',
  showDrop = true,
}) => {
  const isNegative = group.endsWith('-');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-2.5 py-1 font-bold',
    lg: 'text-base px-3.5 py-1.5 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-mono tracking-tight select-none ${
        isNegative
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-red-50 text-red-700 border-red-200'
      } ${sizeClasses[size]}`}
    >
      {showDrop && <span className="text-red-600 text-xs">🩸</span>}
      <span>{group}</span>
    </span>
  );
};
