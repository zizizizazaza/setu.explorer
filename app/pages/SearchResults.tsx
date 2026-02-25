import React, { useState, useEffect } from 'react';
import { User, Activity, Database, Box, Server, Cpu } from 'lucide-react';
import { fetchSearch } from '../api';
import type { SearchResultItem } from '../api/types';

interface SearchResultsProps {
  query: string;
  onNavigate: (p: string, id?: string) => void;
}

export const SearchResults = ({ query, onNavigate }: SearchResultsProps) => {
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSearch(query)
      .then((res) => {
        if (cancelled) return;
        setResults(res.results ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setResults(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query]);

  const goTo = (item: SearchResultItem) => {
    if (item.type === 'anchor') onNavigate('anchor_detail', item.id);
    else if (item.type === 'event') onNavigate('event_detail', item.id);
    else if (item.type === 'account') onNavigate('account_detail', item.address ?? item.id);
    else if (item.type === 'validator' || item.type === 'solver') onNavigate('validators');
    else onNavigate('event_detail', item.id);
  };

  // 仅 1 条结果时自动跳转到对应详情页，避免多一次点击
  useEffect(() => {
    if (loading || !results || results.length !== 1) return;
    const item = results[0];
    if (item.type === 'anchor') onNavigate('anchor_detail', item.id);
    else if (item.type === 'event') onNavigate('event_detail', item.id);
    else if (item.type === 'account') onNavigate('account_detail', item.address ?? item.id);
    else if (item.type === 'validator' || item.type === 'solver') onNavigate('validators');
    else onNavigate('event_detail', item.id);
  }, [loading, results, onNavigate]);

  const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    anchor: Box,
    event: Activity,
    account: User,
    validator: Server,
    solver: Cpu,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-white/50 text-sm font-medium">Searching...</div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Search Results</h2>
        <p className="text-white/40 text-sm font-medium mt-1">Showing matches for: <span className="text-indigo-400 font-mono">"{query}"</span></p>
      </div>

      {results && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((item, i) => {
            const Icon = iconMap[item.type] ?? Database;
            return (
              <section
                key={`${item.type}-${item.id}-${i}`}
                className="bg-black/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex items-start gap-4 hover:border-indigo-500/50 transition-all cursor-pointer group"
                onClick={() => goTo(item)}
              >
                <div className="p-3 bg-white/5 text-indigo-400 border border-white/10 rounded-xl group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                  <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">{item.type} Match</p>
                  <h4 className="font-black text-white truncate">{item.id}</h4>
                  {item.depth != null && <p className="text-xs text-white/50 mt-1">Depth #{item.depth}</p>}
                  {item.event_count != null && <p className="text-xs text-white/50 mt-1">{item.event_count} events</p>}
                  {item.status != null && <p className="text-xs text-white/50 mt-1">{item.status}</p>}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section
            className="bg-black/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex items-start gap-4 hover:border-indigo-500/50 transition-all cursor-pointer group"
            onClick={() => onNavigate('account_detail', query)}
          >
            <div className="p-3 bg-white/5 text-indigo-400 border border-white/10 rounded-xl group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">Account Match</p>
              <h4 className="font-black text-white">{query.slice(0, 16)}...</h4>
              <p className="text-xs text-white/50 mt-1">Click to view balance and event history.</p>
            </div>
          </section>
          <section
            className="bg-black/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex items-start gap-4 hover:border-indigo-500/50 transition-all cursor-pointer group"
            onClick={() => onNavigate('event_detail', query.startsWith('ev_') ? query : `ev_${query}`)}
          >
            <div className="p-3 bg-white/5 text-amber-400 border border-white/10 rounded-xl group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">Event Match</p>
              <h4 className="font-black text-white">Event {query.toUpperCase()}</h4>
              <p className="text-xs text-white/50 mt-1">Click to view DAG relationship and execution result.</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
