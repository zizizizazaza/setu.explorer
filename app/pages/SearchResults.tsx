import React, { useState, useEffect } from 'react';
import { User, Activity, Database, Box } from 'lucide-react';
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
    else if (item.type === 'account') onNavigate('account_detail', item.id ?? item.address ?? item.id);
  };

  const iconMap = {
    anchor: Box,
    event: Activity,
    account: User
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-slate-500 text-sm font-medium">Searching...</div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Search Results</h2>
        <p className="text-slate-400 text-sm font-medium mt-1">Showing matches for: <span className="text-indigo-600 font-mono">"{query}"</span></p>
      </div>

      {results && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((item, i) => {
            const Icon = iconMap[item.type] ?? Database;
            return (
              <section
                key={`${item.type}-${item.id}-${i}`}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => goTo(item)}
              >
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.type} Match</p>
                  <h4 className="font-black text-slate-900 truncate">{item.id}</h4>
                  {item.depth != null && <p className="text-xs text-slate-500 mt-1">Depth #{item.depth}</p>}
                  {item.event_count != null && <p className="text-xs text-slate-500 mt-1">{item.event_count} events</p>}
                  {item.status != null && <p className="text-xs text-slate-500 mt-1">{item.status}</p>}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-300 transition-colors cursor-pointer"
            onClick={() => onNavigate('account_detail', query)}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Match</p>
              <h4 className="font-black text-slate-900">{query.slice(0, 16)}...</h4>
              <p className="text-xs text-slate-500 mt-1">Click to view balance and event history.</p>
            </div>
          </section>
          <section
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-300 transition-colors cursor-pointer"
            onClick={() => onNavigate('event_detail', query.startsWith('ev_') ? query : `ev_${query}`)}
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Match</p>
              <h4 className="font-black text-slate-900">Event {query.toUpperCase()}</h4>
              <p className="text-xs text-slate-500 mt-1">Click to view DAG relationship and execution result.</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
