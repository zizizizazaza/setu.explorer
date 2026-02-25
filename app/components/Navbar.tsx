import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Box, Activity, User, Loader2, AlertCircle, Server, Cpu } from 'lucide-react';
import { fetchSearch } from '../api';
import type { SearchResultItem } from '../api/types';

interface NavbarProps {
  onNavigate: (path: string, id?: string) => void;
  currentPath: string;
}

export const Navbar = ({ onNavigate, currentPath }: NavbarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 1.5);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setShowDropdown(false);
      setError(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);
    setError(false);

    debounceRef.current = setTimeout(() => {
      fetchSearch(q.trim())
        .then((res) => {
          setResults(res.results ?? []);
          setError(false);
        })
        .catch(() => {
          setResults([]);
          setError(true);
        })
        .finally(() => setLoading(false));
    }, 300);
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    doSearch(val);
  };


  const goToResult = (item: SearchResultItem) => {
    setShowDropdown(false);
    setQuery('');
    if (item.type === 'anchor') onNavigate('anchor_detail', item.id);
    else if (item.type === 'event') onNavigate('event_detail', item.id);
    else if (item.type === 'account') onNavigate('account_detail', item.address ?? item.id);
    else if (item.type === 'validator') onNavigate('validators');
    else if (item.type === 'solver') onNavigate('validators');
    else onNavigate('search_results', item.id);
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;


    if (activeIndex >= 0 && activeIndex < results.length) {
      goToResult(results[activeIndex]);
      return;
    }


    setShowDropdown(false);
    onNavigate('search_results', query.trim());
    setQuery('');
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);


  const iconMap: Record<string, React.ElementType> = {
    anchor: Box,
    event: Activity,
    account: User,
    validator: Server,
    solver: Cpu,
  };


  const typeColors: Record<string, string> = {
    anchor: 'bg-blue-50 text-blue-600',
    event: 'bg-amber-50 text-amber-600',
    account: 'bg-emerald-50 text-emerald-600',
    validator: 'bg-purple-50 text-purple-600',
    solver: 'bg-rose-50 text-rose-600',
  };

  const isLanding = currentPath === 'landing';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding ? (scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-2' : 'bg-transparent border-b border-transparent py-4') : 'bg-black/80 backdrop-blur-md border-b border-white/10 py-2'}`}>
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('landing')}>
          <img
            src="/setu-logo.png"
            alt="Setu"
            className="h-8 w-auto object-contain group-hover:rotate-12 brightness-0 invert"
          />
          <span className="text-lg font-black tracking-tighter text-white">
            SETU<span className="text-white/70 italic ml-1">EXPLORER</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-white/70">
          {['Dashboard', 'Anchors', 'Events', 'Validators'].map(item => (
            <button
              key={item}
              onClick={() => onNavigate(item.toLowerCase())}
              className={`transition-colors relative pb-1 hover:text-white ${currentPath === item.toLowerCase() ? 'text-white border-b-2 border-white' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>


        <div ref={dropdownRef} className="flex-1 max-w-sm relative">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors text-white/50 group-focus-within:text-white" size={14} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Anchor / Event / Account..."
              className="w-full text-[11px] font-medium py-2 pl-9 pr-9 rounded-lg border transition-all outline-none bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-white focus:bg-white/20"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (query.trim() && (results.length > 0 || loading || error)) setShowDropdown(true); }}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" size={14} />
            )}
          </form>


          {showDropdown && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden z-[100] max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-xs font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  Searching...
                </div>
              ) : error ? (
                <div className="flex items-center justify-center gap-2 py-8 text-red-400 text-xs font-medium">
                  <AlertCircle size={14} />
                  Search failed, press Enter for full results
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </div>
                  {results.map((item, i) => {
                    const Icon = iconMap[item.type] ?? Box;
                    const colorCls = typeColors[item.type] ?? 'bg-slate-50 text-slate-600';
                    const isActive = i === activeIndex;
                    return (
                      <div
                        key={`${item.type}-${item.id}-${i}`}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0 ${isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                        onClick={() => goToResult(item)}
                        onMouseEnter={() => setActiveIndex(i)}
                      >
                        <div className={`p-2 rounded-lg ${colorCls}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate">{item.id}</span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${colorCls}`}>
                              {item.type}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            {item.depth != null && <span>Depth #{item.depth}</span>}
                            {item.event_count != null && <span>{item.event_count} events</span>}
                            {item.event_type && <span>{item.event_type}</span>}
                            {item.status && <span>{item.status}</span>}
                            {item.address && <span className="font-mono truncate max-w-[120px]">{item.address}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div
                    className="px-4 py-2.5 text-center text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 cursor-pointer transition-colors border-t border-slate-100"
                    onClick={() => { setShowDropdown(false); onNavigate('search_results', query.trim()); setQuery(''); }}
                  >
                    View all results for "{query}"
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-slate-300 mb-2">
                    <Search size={24} className="mx-auto" />
                  </div>
                  <p className="text-xs font-medium text-slate-400">No results for "<span className="text-slate-600">{query}</span>"</p>
                  <p className="text-[10px] text-slate-300 mt-1">Try an Anchor ID, Event ID, or Account Address</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
