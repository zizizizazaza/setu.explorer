import React from 'react';
import { BookOpen, Send } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

const BrandXIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zm-1.29 19.495h2.039L6.486 3.24H4.298z" />
  </svg>
);

const BrandDiscordIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.334.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.334.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
  </svg>
);

export const Footer = ({ onNavigate }: FooterProps) => {
  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://x.com/hetu_protocol',
      icon: BrandXIcon,
    },
    {
      name: 'Discord',
      href: 'https://discord.com/invite/Psj4Hfnbye',
      icon: BrandDiscordIcon,
    },
    {
      name: 'Telegram',
      href: 'https://t.me/hetu_org',
      icon: Send,
    },
    {
      name: 'Blog',
      href: 'https://blog.hetu.org/',
      icon: BookOpen,
    },
  ];

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
              <img
                src="/setu-logo.png"
                alt="Setu"
                className="h-6 w-auto object-contain"
              />
              <span className="text-md font-bold text-slate-900 tracking-tighter">
                SETU<span className="text-indigo-600 italic ml-1">EXPLORER</span>
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed font-bold max-w-xl">
              The foundational explorer for high-throughput DAG systems using VLC-ordered causal consistency.
            </p>
          </div>

          <div className="lg:justify-self-end">
            <h4 className="text-[11px] font-black text-indigo-600 tracking-widest mb-6">Community</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    title={item.name}
                    className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-bold text-slate-400 tracking-widest">© 2025 SETU BLOCKLESS EXPLORER. POWERED BY FLUX.</p>
        </div>
      </div>
    </footer>
  );
};
