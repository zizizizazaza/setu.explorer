import React from 'react';

export const Badge = ({ children, status }: { children?: React.ReactNode; status?: string }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'finalized': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStyles()}`}>
      {children}
    </span>
  );
};
