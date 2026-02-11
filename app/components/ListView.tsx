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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{title}</h1>
          <p className="text-slate-400 text-[11px] font-bold mt-1">Real-time Setu stream index</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 text-[10px] font-black text-slate-700 uppercase">Page {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-b-4 border-b-slate-200">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">Loading...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase text-[10px]">
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
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => onNavigate(type === 'anchors' ? 'anchor_detail' : 'event_detail', item.id)}>
                  {type === 'anchors' ? (
                    <>
                      <td className="px-6 py-4 font-black text-slate-900 text-sm">#{item.depth}</td>
                      <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{item.id.slice(0, 16)}...</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 font-bold">{item.event_count} txs</td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{item.proposer}</td>
                      <td className="px-6 py-4"><Badge status={item.status}>{item.status}</Badge></td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{item.id.slice(0, 16)}...</td>
                      <td className="px-6 py-4 font-black text-slate-800">{item.type}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded-md font-black text-indigo-600">#{item.anchor_depth}</span>
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
  );
};
