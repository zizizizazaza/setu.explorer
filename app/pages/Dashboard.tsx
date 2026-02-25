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
      <div className="flex items-center justify-center min-h-[400px] text-white/50 text-sm font-medium">
        Loading...
      </div>
    );
  }

  const net = statsData?.network ?? { total_anchors: 0, total_events: 0, total_validators: 0, total_solvers: 0, tps: 0, avg_anchor_time: 0 };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Anchors" value={net.total_anchors} suffix="" icon={Box} subValue={`Depth ${net.total_anchors.toLocaleString()}`} color="indigo" />
        <StatsCard title="Total Events" value={net.total_events} suffix="" icon={Activity} subValue={`TPS: ${net.tps}`} color="cyan" />
        <StatsCard title="Avg Anchor Time" value={net.avg_anchor_time} suffix="s" icon={Clock} subValue="Consistency Frame" color="amber" />
        <StatsCard title="Validators" value={net.total_validators} suffix="" icon={ShieldCheck} subValue="Active Participants" color="emerald" />
      </div>

      <CausalGraph onNavigate={onNavigate} />

      {/* Anchors / Events  */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white/[0.05] backdrop-blur-2xl rounded-xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm tracking-wider">
              <Database size={16} className="text-indigo-400" />
              Latest Anchors
            </h3>
            <button onClick={() => onNavigate('anchors')} className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase tracking-widest border border-indigo-500/30 px-2 py-1 rounded-lg hover:bg-indigo-500/20 transition-all">View All</button>
          </div>
          {anchors.length > 0 ? (
            <div className="divide-y divide-white/5">
              {anchors.map((anchor) => (
                <div key={anchor.id} className="p-4 flex items-center justify-between hover:bg-white/[0.05] even:bg-white/[0.02] transition-colors cursor-pointer animate-highlight overflow-hidden relative group" onClick={() => onNavigate('anchor_detail', anchor.id)}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl text-white/20 font-mono text-[9px] font-black flex items-center justify-center w-10 h-10 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all uppercase tracking-widest">AC</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">#{anchor.depth}</span>
                        <Badge status={anchor.status}>{anchor.status}</Badge>
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5 font-mono group-hover:text-white/60 transition-colors">{anchor.id.slice(0, 20)}...</div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-sm text-white/80 font-medium">{anchor.event_count} txns</div>
                    <div className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">{new Date(anchor.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-white/40 text-sm">
              No anchors yet. The network is waiting for the first anchor.
            </div>
          )}
        </section>

        <section className="bg-white/[0.05] backdrop-blur-2xl rounded-xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm tracking-wider">
              <Zap size={16} className="text-indigo-400" />
              Latest Events
            </h3>
            <button onClick={() => onNavigate('events')} className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase tracking-widest border border-indigo-500/30 px-2 py-1 rounded-lg hover:bg-indigo-500/20 transition-all">View All</button>
          </div>
          {events.length > 0 ? (
            <div className="divide-y divide-white/5">
              {events.map((event) => (
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-white/[0.05] even:bg-white/[0.02] transition-colors cursor-pointer animate-highlight overflow-hidden relative group" onClick={() => onNavigate('event_detail', event.id)}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl text-white/20 font-mono text-[9px] font-black flex items-center justify-center w-10 h-10 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all uppercase tracking-widest">EV</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{event.type}</span>
                        <Badge status={event.status}>{event.status}</Badge>
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5 truncate max-w-[200px] md:max-w-md group-hover:text-white/60 transition-colors">{event.summary}</div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-sm text-indigo-400 font-bold">#{event.anchor_depth}</div>
                    <div className="text-[10px] text-white/40 font-mono group-hover:text-white/60 transition-colors">{event.id.slice(0, 10)}...</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-white/40 text-sm">
              No events yet. The network is waiting for the first event.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
