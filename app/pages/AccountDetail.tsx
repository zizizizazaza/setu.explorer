import React, { useState, useEffect } from 'react';
import { ChevronRight, User, ExternalLink, TrendingUp, ShieldCheck, History } from 'lucide-react';
import { Badge } from '../components/Badge';
import { getMockAccount, generateMockEvents } from '../data/mockData';
import { fetchAccount } from '../api';
import type { Account } from '../types';

interface AccountDetailProps {
  address: string;
  onNavigate: (p: string, id?: string) => void;
}

export const AccountDetail = ({ address, onNavigate }: AccountDetailProps) => {
  const [account, setAccount] = useState<Account>(() => getMockAccount(address));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAccount(address)
      .then((res) => {
        if (cancelled) return;
        setAccount({
          address: res.address,
          balance: res.balance,
          profile: res.profile,
          statistics: res.statistics,
          credentials: res.credentials,
          recent_events: res.recent_events
        });
      })
      .catch(() => {
        if (cancelled) return;
        setAccount(getMockAccount(address));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [address]);

  const recentEvents = account.recent_events
    ? account.recent_events.map((e) => ({ id: e.id, type: e.type, timestamp: e.timestamp, summary: e.summary, status: 'Finalized' as const }))
    : generateMockEvents(5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white/50 text-sm font-medium">Loading...</div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-400">Home</button>
        <ChevronRight size={12} />
        <span className="text-white font-black">Account Profile</span>
      </div>

      <div className="bg-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden border-t-2 border-t-indigo-500/50">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-start bg-white/5 border-b border-white/10">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white/20">
            <User size={48} />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">{account.profile.display_name}</h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-white/60 break-all bg-black/70 px-3 py-1 rounded-lg border border-white/10">{account.address}</span>
              <button className="p-1.5 text-white/40 hover:text-indigo-400 transition-colors"><ExternalLink size={16} /></button>
            </div>
            <p className="text-white/50 text-sm max-w-2xl pt-2">{account.profile.bio}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm w-full md:w-auto min-w-[200px]">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 text-center md:text-left">Current Balance</p>
            <p className="text-3xl font-black text-white text-center md:text-left">{account.balance.toLocaleString()} <span className="text-indigo-400 text-sm">FLUX</span></p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <section>
              <h3 className="text-white/40 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-400" />
                Network Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Total Sent', value: `${account.statistics.total_sent} FLUX` },
                  { label: 'Total Received', value: `${account.statistics.total_received} FLUX` },
                  { label: 'Event Count', value: account.statistics.transaction_count },
                  { label: 'Uptime Factor', value: '99.9%' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 group hover:border-indigo-500/50 transition-colors">
                    <p className="text-[9px] font-bold text-white/40 uppercase mb-1">{stat.label}</p>
                    <p className="text-sm font-black text-white/90 group-hover:text-indigo-300 transition-colors">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-white/40 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                Verified Credentials
              </h3>
              <div className="space-y-3">
                {account.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <div>
                      <p className="text-xs font-black text-indigo-300 uppercase">{cred.type}</p>
                      <p className="text-[10px] text-indigo-400/80 font-bold tracking-tight">Level: {cred.level} • Issuer: {cred.issuer}</p>
                    </div>
                    <Badge status="finalized">{cred.status}</Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2">
            <section>
              <h3 className="text-white/40 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} className="text-indigo-400" />
                Activity History
              </h3>
              <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/40 font-black uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Event Hash</th>
                      <th className="px-6 py-4">Operation</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentEvents.map(ev => (
                      <tr key={ev.id} className="hover:bg-white/[0.05] even:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => onNavigate('event_detail', ev.id)}>
                        <td className="px-6 py-4 font-mono text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors">{ev.id.slice(0, 16)}...</td>
                        <td className="px-6 py-4 font-black text-white">{ev.type}</td>
                        <td className="px-6 py-4 text-white/50">{new Date(ev.timestamp).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><Badge status={ev.status}>{ev.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
