import React from 'react';

export const Badge = ({ children, status }: { children?: React.ReactNode; status?: string }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'finalized': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'confirmed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'failed': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-white/5 text-white/50 border-white/10';
    }
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStyles()}`}>
      {children}
    </span>
  );
};
