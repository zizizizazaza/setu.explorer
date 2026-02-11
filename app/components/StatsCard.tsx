import React from 'react';
import { RollingNumber } from './RollingNumber';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  subValue?: string;
  /** Optional suffix for numeric value (e.g. "s" for seconds). When set, value is rendered with RollingNumber. */
  suffix?: string;
}

export const StatsCard = ({ title, value, icon: Icon, subValue, suffix = '' }: StatsCardProps) => {
  const isNumeric = typeof value === 'number';
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between group hover:border-indigo-300 transition-colors">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
          {isNumeric ? (
            <RollingNumber value={value as number} suffix={suffix} />
          ) : (
            value
          )}
        </h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
        <Icon size={20} />
      </div>
    </div>
  );
};
