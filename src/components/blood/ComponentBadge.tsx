import React from 'react';
import type { BloodComponent } from '@/types/blood';

export const ComponentBadge: React.FC<{ component: BloodComponent; size?: 'sm' | 'md' }> = ({
  component,
  size = 'md',
}) => {
  const meta: Record<BloodComponent, { label: string; class: string }> = {
    RBC: { label: 'RBC (Red Blood Cells)', class: 'bg-red-50 text-red-700 border-red-200' },
    Platelets: { label: 'Platelets (PLT)', class: 'bg-amber-50 text-amber-800 border-amber-200' },
    Plasma: { label: 'Plasma (FFP)', class: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
    'Whole Blood': { label: 'Whole Blood', class: 'bg-rose-50 text-rose-800 border-rose-200' },
  };

  const current = meta[component] || { label: component, class: 'bg-surface-100 text-surface-700' };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${
        size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'
      } ${current.class}`}
    >
      {current.label}
    </span>
  );
};
