import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './Badge';
import { generateMockAnchors, generateMockEvents } from '../data/mockData';
import { fetchAnchors, fetchEvents } from '../api';

interface ListViewProps {
  title: string;
  type: 'anchors' | 'events';
  onNavigate: (p: string, id?: string) => void;
}

const ITEMS_PER_PAGE = 15;

export const ListView = ({ title, type, onNavigate }: ListViewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (type === 'anchors') {
          const res = await fetchAnchors({ page: currentPage, limit: ITEMS_PER_PAGE });
          if (cancelled) return;
          setItems(res.anchors);
          setTotalPages(res.pagination.total_pages);
        } else {
          const res = await fetchEvents({ page: currentPage, limit: ITEMS_PER_PAGE });
          if (cancelled) return;
          setItems(res.events);
          setTotalPages(res.pagination.total_pages);
        }
      } catch {
        if (cancelled) return;
        const mock = type === 'anchors' ? generateMockAnchors(50) : generateMockEvents(50);
        setItems(mock.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE));
        setTotalPages(Math.ceil(mock.length / ITEMS_PER_PAGE));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [type, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight capitalize">{title}</h1>
          <p className="text-white/40 text-[11px] font-bold mt-1">Real-time Setu stream index</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-[10px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-1.5 hover:bg-white/10 text-white/70 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 text-[10px] font-black text-white/80 uppercase">Page {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1.5 hover:bg-white/10 text-white/70 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white/[0.04] backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="relative z-10">
          {loading && items.length === 0 ? (
            <div className="p-12 text-center text-white/20 text-sm font-black uppercase tracking-widest">Loading...</div>
          ) : (
            <table className="w-full text-left text-xs relative">
              <thead className="bg-white/5 text-white/30 font-black border-b border-white/5 uppercase text-[10px] tracking-widest">
                {type === 'anchors' ? (
                  <tr>
                    <th className="px-6 py-5">Depth Index</th>
                    <th className="px-6 py-5">ID (Hash)</th>
                    <th className="px-6 py-5">Chronology</th>
                    <th className="px-6 py-5">Event Payload</th>
                    <th className="px-6 py-5">Proposer</th>
                    <th className="px-6 py-5">State</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-5">Event ID</th>
                    <th className="px-6 py-5">Type / Tag</th>
                    <th className="px-6 py-5">Chronology</th>
                    <th className="px-6 py-5">Anchor Association</th>
                    <th className="px-6 py-5">Finality</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.05] even:bg-white/[0.01] transition-colors group cursor-pointer border-b border-white/[0.02] last:border-0" onClick={() => onNavigate(type === 'anchors' ? 'anchor_detail' : 'event_detail', item.id)}>
                    {type === 'anchors' ? (
                      <>
                        <td className="px-6 py-4 font-black text-white text-sm">#{item.depth}</td>
                        <td className="px-6 py-4 font-mono text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors">{item.id.slice(0, 16)}...</td>
                        <td className="px-6 py-4 text-white/50 text-xs whitespace-nowrap">{new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-6 py-4 font-bold text-white/80">{item.event_count} txs</td>
                        <td className="px-6 py-4 text-white/40 font-mono text-[10px]">{item.proposer}</td>
                        <td className="px-6 py-4"><Badge status={item.status}>{item.status}</Badge></td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-mono text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors">{item.id.slice(0, 16)}...</td>
                        <td className="px-6 py-4 font-black text-white/90">{item.type}</td>
                        <td className="px-6 py-4 text-white/50 text-xs whitespace-nowrap">{new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-white/10 rounded-md font-black text-indigo-400">#{item.anchor_depth}</span>
                        </td>
                        <td className="px-6 py-4"><Badge status={item.status}>{item.status}</Badge></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
