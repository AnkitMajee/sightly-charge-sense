
import React from 'react';
import { cn } from '@/lib/utils';

interface BatteryIndicatorProps {
  percentage: number;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const BatteryIndicator = ({ percentage, color = 'indigo' }: BatteryIndicatorProps) => {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={cn(
          'h-full transition-all duration-500 ease-out',
          colorClasses[color]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default BatteryIndicator;
