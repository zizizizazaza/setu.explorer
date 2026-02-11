import React, { useState, useEffect } from 'react';
import { ChevronRight, Activity, Info, Cpu, CheckCircle2, GitBranch, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '../components/Badge';
import { fetchEvent } from '../api';
import type { Event } from '../types';

const MOCK_EVENT = (id: string): Event => ({
  id,
  type: "Transfer",
  status: "Finalized",
  creator: "solver-setu-123456",
  timestamp: 1706342395000,
  vlc_time: 123449,
  anchor_id: "anchor_setu_99a8b1",
  anchor_depth: 12345,
  parent_ids: ["ev_p123_1", "ev_p123_2"],
  children_ids: ["ev_child_11", "ev_child_22"],
  summary: "Transfer 100.5 FLUX from alice to bob",
  payload: {
    Transfer: {
      id: "tx-setu-9988",
      from: "0xalice_setu_wallet",
      to: "0xbob_setu_wallet",
      amount: "100.50 FLUX",
      transfer_type: "Standard"
    }
  },
  execution_result: {
    success: true,
    message: "TEE isolation verified. Execution took 1.2ms.",
    state_changes: [
      { key: "acc:alice", old_value: "1000", new_value: "899.5" },
      { key: "acc:bob", old_value: "500", new_value: "600.5" }
    ]
  }
});

interface EventDetailProps {
  eventId: string;
  onNavigate: (p: string, id?: string) => void;
}

export const EventDetail = ({ eventId, onNavigate }: EventDetailProps) => {
  const [event, setEvent] = useState<Event>(() => MOCK_EVENT(eventId));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEvent(eventId)
      .then((res) => {
        if (cancelled) return;
        setEvent({
          id: res.id,
          type: res.type,
          status: res.status as Event['status'],
          creator: res.creator,
          timestamp: res.timestamp,
          vlc_time: res.vlc_snapshot?.logical_time ?? 0,
          anchor_id: res.anchor_id,
          anchor_depth: res.anchor_depth,
          parent_ids: res.parent_ids ?? [],
          children_ids: res.children_ids,
          summary: res.payload?.Transfer ? `Transfer ${(res.payload.Transfer as any).amount ?? ''} from ${(res.payload.Transfer as any).from ?? ''} to ${(res.payload.Transfer as any).to ?? ''}` : res.id,
          payload: res.payload,
          execution_result: res.execution_result
        });
      })
      .catch(() => {
        if (cancelled) return;
        setEvent(MOCK_EVENT(eventId));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [eventId]);

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
        <button onClick={() => onNavigate('events')} className="hover:text-indigo-600">Events</button>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-black">Event View</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-6 justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white shadow-md text-indigo-600 rounded-2xl border border-slate-100">
              <Activity size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 uppercase">{event.type}</h2>
                <Badge status={event.status}>{event.status}</Badge>
              </div>
              <p className="text-slate-400 font-mono text-xs mt-1 tracking-tight">{event.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Anchor Chain</p>
            <button
              onClick={() => onNavigate('anchor_detail', event.anchor_id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black text-lg hover:bg-indigo-700 transition-all shadow-indigo-200 shadow-lg"
            >
              #{event.anchor_depth}
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Info size={14} className="text-slate-300" />
                Event Particulars
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Origin Solver', value: event.creator, isLink: true },
                  { label: 'Network Time', value: new Date(event.timestamp).toLocaleString() },
                  { label: 'VLC Index', value: event.vlc_time, isMono: true },
                  { label: 'Narrative', value: event.summary }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5 group">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                    <span className={`text-sm font-bold ${item.isLink ? 'text-indigo-600 cursor-pointer hover:underline decoration-2 underline-offset-4' : 'text-slate-800'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 text-slate-900 shadow-sm relative border border-slate-200 border-t-4 border-t-indigo-600">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Cpu size={120} className="text-slate-900" />
              </div>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6">Execution Runtime</h3>
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 text-xs font-black">
                  <CheckCircle2 size={16} />
                  SUCCESSFUL
                </div>
                <p className="text-slate-600 text-xs font-medium leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {event.execution_result?.message}
                </p>
                <div className="space-y-3 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State Delta</p>
                  {event.execution_result?.state_changes.map((sc, i) => (
                    <div key={i} className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-500 transition-colors">
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">{sc.key}</span>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">{sc.old_value}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 font-bold">{sc.new_value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
            <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <GitBranch size={16} className="text-indigo-500" />
              DAG Relationship Visualizer
            </h3>
            <div className="space-y-12">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-4">Ancestors (Parents)</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {event.parent_ids.map(id => (
                    <div key={id} onClick={() => onNavigate('event_detail', id)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm cursor-pointer group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">{id.slice(0, 12)}...</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-8 w-px border-r border-dashed border-slate-300"></div>
                <div className="bg-indigo-600 text-white px-10 py-5 rounded-2xl shadow-xl border-2 border-indigo-400/50 flex flex-col items-center gap-2 relative ring-8 ring-indigo-500/10">
                  <Zap size={24} fill="white" className="animate-pulse" />
                  <span className="font-mono text-xs font-black uppercase tracking-tighter">TARGET NODE</span>
                  <span className="text-[10px] opacity-70 font-mono">{event.id.slice(0, 12)}...</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-8 w-px border-r border-dashed border-slate-300"></div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-4">Descendants (Children)</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {event.children_ids?.map(id => (
                    <div key={id} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-400 cursor-not-allowed shadow-sm opacity-60">
                      {id.slice(0, 12)}...
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-12 pt-12 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw Payload</h4>
                <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">Copy JSON</button>
              </div>
              <div className="bg-slate-100 p-6 rounded-2xl shadow-inner border border-slate-200 max-h-60 overflow-y-auto">
                <pre className="text-[11px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
