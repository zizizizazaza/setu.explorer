import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  subValue?: string;
}

export const StatsCard = ({ title, value, icon: Icon, subValue }: StatsCardProps) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
    </div>
    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
      <Icon size={20} />
    </div>
  </div>
);
