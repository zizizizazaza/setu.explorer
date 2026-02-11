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
      <div className="flex items-center justify-center min-h-[300px] text-slate-500 text-sm font-medium">Loading...</div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600">Home</button>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-black">Account Profile</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-start bg-slate-50/50 border-b border-slate-100">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white">
            <User size={48} />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{account.profile.display_name}</h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-slate-500 break-all bg-white px-3 py-1 rounded-lg border border-slate-200">{account.address}</span>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><ExternalLink size={16} /></button>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl pt-2">{account.profile.bio}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto min-w-[200px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">Current Balance</p>
            <p className="text-3xl font-black text-slate-900 text-center md:text-left">{account.balance.toLocaleString()} <span className="text-indigo-500 text-sm">FLUX</span></p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-500" />
                Network Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Total Sent', value: `${account.statistics.total_sent} FLUX` },
                  { label: 'Total Received', value: `${account.statistics.total_received} FLUX` },
                  { label: 'Event Count', value: account.statistics.transaction_count },
                  { label: 'Uptime Factor', value: '99.9%' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{stat.label}</p>
                    <p className="text-sm font-black text-slate-800">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-500" />
                Verified Credentials
              </h3>
              <div className="space-y-3">
                {account.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <div>
                      <p className="text-xs font-black text-indigo-900 uppercase">{cred.type}</p>
                      <p className="text-[10px] text-indigo-600 font-bold tracking-tight">Level: {cred.level} • Issuer: {cred.issuer}</p>
                    </div>
                    <Badge status="finalized">{cred.status}</Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2">
            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} className="text-indigo-500" />
                Activity History
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Event Hash</th>
                      <th className="px-6 py-4">Operation</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentEvents.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => onNavigate('event_detail', ev.id)}>
                        <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{ev.id.slice(0, 16)}...</td>
                        <td className="px-6 py-4 font-black">{ev.type}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(ev.timestamp).toLocaleDateString()}</td>
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
