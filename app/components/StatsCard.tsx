import React from 'react';
import { RollingNumber } from './RollingNumber';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subValue?: string;
  /** Optional suffix for numeric value (e.g. "s" for seconds). When set, value is rendered with RollingNumber. */
  suffix?: string;
  color?: 'indigo' | 'cyan' | 'amber' | 'emerald' | 'rose' | 'fuchsia';
}

const colorMap = {
  indigo: 'bg-indigo-400 shadow-indigo-500/50',
  cyan: 'bg-cyan-400 shadow-cyan-500/50',
  amber: 'bg-amber-400 shadow-amber-500/50',
  emerald: 'bg-emerald-400 shadow-emerald-500/50',
  rose: 'bg-rose-400 shadow-rose-500/50',
  fuchsia: 'bg-fuchsia-400 shadow-fuchsia-500/50',
};

export const StatsCard = ({ title, value, icon: Icon, subValue, suffix = '', color = 'indigo' }: StatsCardProps) => {
  const isNumeric = typeof value === 'number';
  const glowTheme = colorMap[color];

  return (
    <div className="group transition-all duration-700 relative bg-white/[0.04] backdrop-blur-3xl p-6 rounded-2xl border border-white/10 flex flex-col justify-center min-h-[120px] shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="text-white/20 group-hover:text-white/50 transition-colors duration-500">
            <Icon size={14} strokeWidth={1.5} />
          </div>
          <p className="text-white/30 text-[9px] font-black tracking-[0.25em] uppercase group-hover:text-white/50 transition-colors">
            {title}
          </p>
        </div>

        {/* Minimal Status Indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${glowTheme.split(' ')[0]} opacity-30 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-black text-white selection:bg-indigo-500 selection:text-white tabular-nums tracking-tighter leading-none group-hover:tracking-tight transition-all duration-500">
          {isNumeric ? (
            <RollingNumber value={value as number} suffix={suffix} />
          ) : (
            value
          )}
        </h3>
        {subValue && (
          <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest mt-3.5 group-hover:text-white/30 transition-colors">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};
