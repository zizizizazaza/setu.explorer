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
      <div className="flex items-center justify-center min-h-[300px] text-slate-500 text-sm font-medium">Loading...</div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-widest">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => onNavigate('anchors')} className="hover:text-indigo-600">Anchors</button>
        <ChevronRight size={12} />
        <span className="text-slate-900">Anchor Details</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900">ANCHOR <span className="text-indigo-500 font-mono">#{anchor.depth}</span></h2>
          <Badge status={anchor.status}>{anchor.status}</Badge>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all shadow-sm">
            <ChevronLeft size={14} /> PREV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all shadow-sm">
            NEXT <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">General Information</h3>
              <Clock size={14} className="text-slate-400" />
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
                <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="w-48 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</div>
                  <div className={`text-sm text-slate-900 break-all flex-1 ${item.isMono ? 'font-mono bg-slate-50 p-2 rounded border border-slate-100 text-xs' : ''}`}>
                    {item.isLink ? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">{item.value}</span> : item.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Included Events</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="px-6 py-4">Event ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Creator</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anchorEvents.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('event_detail', ev.id)}>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{ev.id}</td>
                      <td className="px-6 py-4 text-xs">{ev.type ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[120px]">{ev.creator ?? '—'}</td>
                      <td className="px-6 py-4">{ev.status ? <Badge status={ev.status}>{ev.status}</Badge> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Merkle Verification</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: 'Global State Root', value: anchor.merkle_roots?.global_state_root },
                { label: 'Events Tree Root', value: anchor.merkle_roots?.events_root },
                { label: 'Anchor Chain Root', value: anchor.merkle_roots?.anchor_chain_root },
              ].map((root, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Database size={12} />
                    {root.label}
                  </p>
                  <p className="text-[10px] font-mono bg-slate-50 text-indigo-900 p-3 rounded-lg border border-slate-200 break-all leading-relaxed shadow-sm">{root.value}</p>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subnet Roots</p>
                <div className="space-y-2">
                  {Object.entries(anchor.merkle_roots?.subnet_roots || {}).map(([name, root]) => (
                    <div key={name} className="flex flex-col gap-1 p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] font-bold text-indigo-600">{name}</span>
                      <span className="text-[9px] font-mono text-slate-500 truncate">{root}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative border-t-4 border-t-indigo-600">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck size={100} className="text-slate-900" />
            </div>
            <h3 className="font-bold text-xs mb-6 flex items-center gap-2 tracking-widest text-slate-400">Consensus process</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-200 shadow-sm">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-green-700">FINALIZED</p>
                  <p className="text-[10px] text-slate-500 italic">consensus achieved at height {anchor.depth}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  <span>Validator Quorum</span>
                  <span className="text-slate-900">10/12</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[83%] h-full bg-indigo-500"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Proposer</p>
                  <p className="text-[11px] font-mono text-indigo-600 font-bold">{anchor.proposer}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">CF Hash</p>
                  <p className="text-[11px] font-mono text-indigo-600 font-bold">0x44ab...e911</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
