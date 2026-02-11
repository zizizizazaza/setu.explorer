import React, { useState, useEffect } from 'react';
import { Box, Activity, Clock, ShieldCheck, Database, Zap } from 'lucide-react';
import { Badge } from '../components/Badge';
import { StatsCard } from '../components/StatsCard';
import { CausalGraph } from '../components/causal-graph/CausalGraph';
import { fetchExplorerStats, fetchAnchors, fetchEvents } from '../api';
import type { ExplorerStatsResponse } from '../api/types';
import type { Anchor } from '../types';
import type { Event } from '../types';

interface DashboardProps {
  onNavigate: (p: string, id?: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [statsData, setStatsData] = useState<ExplorerStatsResponse | null>(null);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      try {
        const [statsRes, anchorsRes, eventsRes] = await Promise.all([
          fetchExplorerStats(),
          fetchAnchors({ page: 1, limit: 10 }),
          fetchEvents({ page: 1, limit: 10 }),
        ]);
        if (cancelled) return;
        setStatsData(statsRes);
        setAnchors(anchorsRes.anchors as Anchor[]);
        setEvents(
          eventsRes.events.map((e) => ({
            id: e.id,
            type: e.type,
            status: e.status as Event['status'],
            creator: e.creator,
            timestamp: e.timestamp,
            vlc_time: e.vlc_time,
            anchor_id: e.anchor_id,
            anchor_depth: e.anchor_depth,
            parent_ids: [],
            summary: e.summary,
          }))
        );
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled && showLoading) setLoading(false);
      }
    };

    void load(true);
    const timer = setInterval(() => {
      void load(false);
    }, 8000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 text-sm font-medium">
        Loading...
      </div>
    );
  }

  const net = statsData?.network ?? { total_anchors: 0, total_events: 0, total_validators: 0, total_solvers: 0, tps: 0, avg_anchor_time: 0 };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Anchors" value={net.total_anchors} suffix="" icon={Box} subValue={`Depth ${net.total_anchors.toLocaleString()}`} />
        <StatsCard title="Total Events" value={net.total_events} suffix="" icon={Activity} subValue={`TPS: ${net.tps}`} />
        <StatsCard title="Avg Anchor Time" value={net.avg_anchor_time} suffix="s" icon={Clock} subValue="Consistency Frame" />
        <StatsCard title="Validators" value={net.total_validators} suffix="" icon={ShieldCheck} subValue="Active Participants" />
      </div>

      <CausalGraph onNavigate={onNavigate} />

      {/* Anchors / Events  */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm tracking-wider">
              <Database size={16} className="text-indigo-500" />
              Latest Anchors
            </h3>
            <button onClick={() => onNavigate('anchors')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-widest border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-50 transition-all">View All</button>
          </div>
          {anchors.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {anchors.map((anchor) => (
                <div key={anchor.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer animate-highlight overflow-hidden relative" onClick={() => onNavigate('anchor_detail', anchor.id)}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500 font-mono text-[10px] flex items-center justify-center w-10 h-10">AC</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">#{anchor.depth}</span>
                        <Badge status={anchor.status}>{anchor.status}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{anchor.id.slice(0, 20)}...</div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-sm text-slate-700 font-medium">{anchor.event_count} txns</div>
                    <div className="text-[10px] text-slate-400">{new Date(anchor.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">
              No anchors yet. The network is waiting for the first anchor.
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm tracking-wider">
              <Zap size={16} className="text-indigo-500" />
              Latest Events
            </h3>
            <button onClick={() => onNavigate('events')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-widest border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-50 transition-all">View All</button>
          </div>
          {events.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {events.map((event) => (
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer animate-highlight overflow-hidden relative" onClick={() => onNavigate('event_detail', event.id)}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500 font-mono text-[10px] flex items-center justify-center w-10 h-10">EV</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{event.type}</span>
                        <Badge status={event.status}>{event.status}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px] md:max-w-md">{event.summary}</div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-sm text-indigo-600 font-bold">#{event.anchor_depth}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{event.id.slice(0, 10)}...</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">
              No events yet. The network is waiting for the first event.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
