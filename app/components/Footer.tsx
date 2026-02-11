import React from 'react';
import { Zap, Users, Database } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => (
  <footer className="mt-20 border-t border-slate-200 bg-slate-50">
    <div className="max-w-[1440px] mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-lg">
              <Zap size={16} className="text-white fill-current" />
            </div>
            <span className="text-md font-bold text-slate-900 tracking-tighter">SETU<span className="text-indigo-600 italic ml-1">EXPLORER</span></span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed font-bold">
            The foundational explorer for high-throughput DAG systems using VLC-ordered causal consistency.
          </p>
          <div className="flex gap-3">
            {[Users, Database, Zap].map((Icon, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all cursor-pointer shadow-sm">
                <Icon size={14} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-black text-indigo-600 tracking-widest mb-6">Network Indices</h4>
          <ul className="space-y-4 text-[10px] font-bold text-slate-500">
            <li className="hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => onNavigate('anchors')}>Anchor Sequential Chain</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => onNavigate('events')}>Global Event DAG</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">Consistency Proofs</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-black text-indigo-600 tracking-widest mb-6">Resources</h4>
          <ul className="space-y-4 text-[10px] font-bold text-slate-500">
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">Technical Whitepaper</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">VLC Specification</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">TEE Node Docs</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-black text-indigo-600 tracking-widest mb-6">Support</h4>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-6">
            Contact dev-ops for subnet registration and validator onboarding.
          </p>
          <button className="w-full py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-lg text-[9px] font-black tracking-[0.2em] hover:bg-slate-50 hover:border-indigo-600 transition-all shadow-sm">
            SUBMIT SUPPORT TICKET
          </button>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-bold text-slate-400 tracking-widest">© 2025 SETU BLOCKLESS EXPLORER. POWERED BY FLUX.</p>
        <div className="flex gap-6 text-[9px] font-bold text-slate-400 tracking-widest">
          <button className="hover:text-indigo-600 transition-colors">TERMS</button>
          <button className="hover:text-indigo-600 transition-colors">PRIVACY</button>
          <button className="hover:text-indigo-600 transition-colors">API STATUS</button>
        </div>
      </div>
    </div>
  </footer>
);
