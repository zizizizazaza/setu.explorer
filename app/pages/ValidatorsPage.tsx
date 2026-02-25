import React, { useState, useEffect } from 'react';
import { fetchValidators, fetchSolvers } from '../api';
import type { ValidatorItem, SolverItem } from '../api/types';

const MOCK_VALIDATORS: Array<{ id: string; status: string; stake: number; uptime: number; address: string }> = Array.from({ length: 10 }).map((_, i) => ({
  id: `vld-${i + 1}`,
  status: 'online',
  stake: 10000 + i * 500,
  uptime: 99.8 - i * 0.1,
  address: `0xval_${i}`
}));

const MOCK_SOLVERS: Array<{ id: string; status: string; load: number; success: number; address: string }> = Array.from({ length: 15 }).map((_, i) => ({
  id: `slv-${i + 1}`,
  status: 'active',
  load: 30 + i * 4,
  success: 99.5,
  address: `0xsolv_${i}`
}));

export const ValidatorsPage = () => {
  const [validators, setValidators] = useState(MOCK_VALIDATORS);
  const [solvers, setSolvers] = useState(MOCK_SOLVERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchValidators(), fetchSolvers()])
      .then(([vRes, sRes]) => {
        if (cancelled) return;
        setValidators(
          vRes.validators.map((v: ValidatorItem) => ({
            id: v.validator_id,
            status: v.status,
            stake: v.stake_amount,
            uptime: v.statistics?.uptime_percentage ?? 0,
            address: v.address
          }))
        );
        setSolvers(
          sRes.solvers.map((s: SolverItem) => ({
            id: s.solver_id,
            status: s.status,
            load: s.current_load ?? 0,
            success: s.statistics?.success_rate ?? 0,
            address: s.address
          }))
        );
      })
      .catch(() => {
        if (cancelled) return;
        setValidators(MOCK_VALIDATORS);
        setSolvers(MOCK_SOLVERS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white/50 text-sm font-medium">Loading...</div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Validators</h1>
            <p className="text-white/40 text-[11px] font-bold mt-1">Network infrastructure nodes</p>
          </div>
          <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-xs font-black shadow-lg">
            TOTAL: {validators.length} ACTIVE
          </div>
        </div>
        <div className="bg-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/40 font-black border-b border-white/10 uppercase text-[10px]">
              <tr>
                <th className="px-6 py-5">Node Identity</th>
                <th className="px-6 py-5">Operational Status</th>
                <th className="px-6 py-5">Linked Wallet</th>
                <th className="px-6 py-5">Staked Commitment</th>
                <th className="px-6 py-5">Node Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {validators.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/[0.05] even:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-black text-white">{item.id}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 font-black uppercase text-[10px] ${item.status === 'online' ? 'text-emerald-400' : 'text-white/40'}`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-white/20'}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-white/50 group-hover:text-white/70 transition-colors">{item.address}</td>
                  <td className="px-6 py-4 font-black text-white/90">{item.stake.toLocaleString()} <span className="text-indigo-400">FLUX</span></td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{item.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Solvers</h1>
            <p className="text-white/40 text-[11px] font-bold mt-1">Computational execution nodes</p>
          </div>
          <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-xs font-black shadow-lg">
            TOTAL: {solvers.length} ACTIVE
          </div>
        </div>
        <div className="bg-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/40 font-black border-b border-white/10 uppercase text-[10px]">
              <tr>
                <th className="px-6 py-5">Node Identity</th>
                <th className="px-6 py-5">Operational Status</th>
                <th className="px-6 py-5">Linked Wallet</th>
                <th className="px-6 py-5">Processing Load</th>
                <th className="px-6 py-5">Success Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {solvers.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/[0.05] even:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-black text-white">{item.id}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 font-black uppercase text-[10px] ${item.status === 'active' ? 'text-emerald-400' : 'text-white/40'}`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-white/20'}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-white/50 group-hover:text-white/70 transition-colors">{item.address}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${item.load}%` }}></div>
                      </div>
                      <span className="font-bold text-white/60">{item.load}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{item.success}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
