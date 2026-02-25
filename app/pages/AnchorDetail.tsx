import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Clock, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { generateMockEvents } from '../data/mockData';
import { fetchAnchor } from '../api';
import type { Anchor } from '../types';

const MOCK_ANCHOR = (id: string): Anchor => ({
  id,
  depth: 12345,
  event_count: 150,
  timestamp: 1706342400000,
  vlc_time: 123450,
  proposer: "validator-1",
  status: "finalized",
  state_root: "0x1234567890abcdef...",
  previous_anchor: "anchor_setu_prev_123",
  next_anchor: "anchor_setu_next_456",
  merkle_roots: {
    global_state_root: "0x88776655...",
    events_root: "0x11223344...",
    anchor_chain_root: "0x9900aabb...",
    subnet_roots: { "ROOT": "0xdef0123...", "SUBNET_A": "0x445566...", "SUBNET_B": "0x778899..." }
  }
});

interface AnchorDetailProps {
  anchorId: string;
  onNavigate: (p: string, id?: string) => void;
}

export const AnchorDetail = ({ anchorId, onNavigate }: AnchorDetailProps) => {
  const [anchor, setAnchor] = useState<Anchor>(() => MOCK_ANCHOR(anchorId));
  const [eventRows, setEventRows] = useState<Array<{ id: string; type?: string; creator?: string; status?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAnchor(anchorId)
      .then((res) => {
        if (cancelled) return;
        setAnchor({
          id: res.id,
          depth: res.depth,
          event_count: res.event_count,
          timestamp: res.timestamp,
          vlc_time: res.vlc_snapshot?.logical_time ?? 0,
          proposer: "—",
          status: "finalized",
          state_root: "—",
          previous_anchor: res.previous_anchor,
          next_anchor: res.next_anchor,
          merkle_roots: res.merkle_roots
        });
        const ids = res.event_ids ?? [];
        setEventRows(ids.map((id) => ({ id })));
      })
      .catch(() => {
        if (cancelled) return;
        setAnchor(MOCK_ANCHOR(anchorId));
        setEventRows(generateMockEvents(10).map((e) => ({ id: e.id, type: e.type, creator: e.creator, status: e.status })));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [anchorId]);

  const anchorEvents = eventRows.length > 0 ? eventRows : generateMockEvents(10).map((e) => ({ id: e.id, type: e.type, creator: e.creator, status: e.status }));

  if (loading && eventRows.length === 0 && anchor.id === anchorId) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white/50 text-sm font-medium">Loading...</div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-widest">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-400">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => onNavigate('anchors')} className="hover:text-indigo-400">Anchors</button>
        <ChevronRight size={12} />
        <span className="text-white">Anchor Details</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-white">ANCHOR <span className="text-indigo-400 font-mono">#{anchor.depth}</span></h2>
          <Badge status={anchor.status}>{anchor.status}</Badge>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
            <ChevronLeft size={14} /> PREV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
            NEXT <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white/[0.04] backdrop-blur-3xl rounded-xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden relative">
            <div className="relative z-10">
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                  General Information
                </h3>
                <Clock size={14} className="text-white/40" />
              </div>
              <div className="p-6 space-y-5">
                {[
                  { label: 'Anchor ID', value: anchor.id, isMono: true },
                  { label: 'Physical Timestamp', value: new Date(anchor.timestamp).toLocaleString() },
                  { label: 'VLC (Logical Time)', value: anchor.vlc_time },
                  { label: 'Proposer Node', value: anchor.proposer, isLink: true },
                  { label: 'State Root', value: anchor.state_root, isMono: true },
                  { label: 'Events Included', value: anchor.event_count },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="w-48 text-[11px] font-bold text-white/40 uppercase tracking-tighter">{item.label}</div>
                    <div className={`text-sm text-white/90 break-all flex-1 ${item.isMono ? 'font-mono bg-white/5 p-2 rounded border border-white/10 text-xs' : ''}`}>
                      {item.isLink ? <span className="text-indigo-400 font-bold cursor-pointer hover:underline hover:text-indigo-300">{item.value}</span> : item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white/[0.05] backdrop-blur-2xl rounded-xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-black text-white text-xs uppercase tracking-widest">Included Events</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-white/50 font-bold border-b border-white/10 text-[10px] uppercase">
                  <tr>
                    <th className="px-6 py-4">Event ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Creator</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {anchorEvents.map(ev => (
                    <tr key={ev.id} className="hover:bg-white/[0.05] even:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => onNavigate('event_detail', ev.id)}>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors">{ev.id}</td>
                      <td className="px-6 py-4 text-xs text-white/90">{ev.type ?? '—'}</td>
                      <td className="px-6 py-4 text-white/50 text-xs truncate max-w-[120px]">{ev.creator ?? '—'}</td>
                      <td className="px-6 py-4">{ev.status ? <Badge status={ev.status}>{ev.status}</Badge> : <span className="text-white/40">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white/[0.05] backdrop-blur-2xl rounded-xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
              <h3 className="font-black text-white text-xs uppercase tracking-widest">Merkle Verification</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: 'Global State Root', value: anchor.merkle_roots?.global_state_root },
                { label: 'Events Tree Root', value: anchor.merkle_roots?.events_root },
                { label: 'Anchor Chain Root', value: anchor.merkle_roots?.anchor_chain_root },
              ].map((root, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Database size={12} />
                    {root.label}
                  </p>
                  <p className="text-[10px] font-mono bg-white/5 text-indigo-300 p-3 rounded-lg border border-white/10 break-all leading-relaxed shadow-sm">{root.value}</p>
                </div>
              ))}
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Subnet Roots</p>
                <div className="space-y-2">
                  {Object.entries(anchor.merkle_roots?.subnet_roots || {}).map(([name, root]) => (
                    <div key={name} className="flex flex-col gap-1 p-2 bg-white/5 rounded border border-white/10">
                      <span className="text-[10px] font-bold text-indigo-400">{name}</span>
                      <span className="text-[9px] font-mono text-white/50 truncate">{root}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/[0.08] text-white backdrop-blur-3xl rounded-xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-6 overflow-hidden relative border-t-2 border-t-cyan-500/50">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <ShieldCheck size={100} className="text-white" />
            </div>
            <h3 className="font-black text-xs mb-6 flex items-center gap-2 tracking-widest text-cyan-400 uppercase">Consensus process</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20 shadow-sm">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-400">FINALIZED</p>
                  <p className="text-[10px] text-white/40 italic">consensus achieved at height {anchor.depth}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/40">
                  <span>Validator Quorum</span>
                  <span className="text-white">10/12</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[83%] h-full bg-indigo-500"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[9px] text-white/40 uppercase font-bold">Proposer</p>
                  <p className="text-[11px] font-mono text-indigo-400 font-bold">{anchor.proposer}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[9px] text-white/40 uppercase font-bold">CF Hash</p>
                  <p className="text-[11px] font-mono text-indigo-400 font-bold">0x44ab...e911</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
