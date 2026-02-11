import React from 'react';
import { ArrowRight, GitBranch, Box, Zap, Clock3, ShieldCheck, MapPin, History, User, Cpu } from 'lucide-react';

const TechnicalSpec = ({ number, title, desc, tag }: { number: string; title: string; desc: string; tag: string }) => (
  <div className="group border-t border-slate-100 py-12 flex flex-col md:flex-row gap-8 hover:bg-slate-50/50 transition-all px-4">
    <div className="md:w-40 shrink-0">
      <span className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.2em] group-hover:text-indigo-600 transition-colors">{number}</span>
    </div>
    <div className="flex-1 space-y-3">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
        <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{tag}</span>
      </div>
      <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
        {desc}
      </p>
    </div>
  </div>
);

interface LandingPageProps {
  onNavigate: (p: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const vlcFeatures = [
    { title: "Precise Relation", desc: "Accurately judge the happens-before relationship between any two events in a distributed environment.", icon: Clock3 },
    { title: "Conflict Detection", desc: "Automatically identify concurrent events to prevent state conflicts and ensure deterministic outcomes.", icon: ShieldCheck },
    { title: "Global Alignment", desc: "Unified event ordering by merging logical clocks with high-resolution physical timestamps.", icon: MapPin },
    { title: "Deep Traceability", desc: "Trace the complete causal chain of any specific event back to its origin across the entire mesh.", icon: History }
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-indigo-600 selection:text-white">
      <section className="relative pt-24 pb-20 border-b border-slate-100 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-[-0.04em] leading-[1.1]">
                The Deterministic <br />
                <span className="text-indigo-600">Causal Network</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                Setu decouples consensus from execution via <span className="text-slate-900">VLC</span> and <span className="text-slate-900">DAG</span>,
                establishing a high-throughput backbone for verifiable digital causality.
              </p>
              <div className="flex items-center gap-6 pt-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-8 py-4 bg-slate-900 text-white font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-indigo-600 transition-all rounded shadow-lg shadow-slate-200"
                >
                  Start Explore
                </button>
                <button className="text-slate-400 font-bold text-[11px] tracking-[0.2em] uppercase hover:text-slate-900 transition-colors flex items-center gap-2">
                  Whitepaper <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <div className="relative pointer-events-none select-none h-full flex items-center justify-end">
              <div className="relative w-full h-full max-w-xl">
                <img
                  src="/hero_visual.png"
                  alt=""
                  className="w-full h-full object-contain object-right opacity-90 transition-opacity duration-1000"
                  style={{
                    maskImage: 'linear-gradient(to left, black 60%, transparent 95%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
                  }}
                />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-8 py-32 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-[0.4em]">Engine Core</h2>
          <p className="text-2xl font-bold text-slate-900 tracking-tight leading-tight italic">
            De-sequentialized <br />
            infrastructure for <br />
            autonomous agents.
          </p>
          <div className="h-20 w-px bg-slate-100 hidden lg:block ml-1 mt-8"></div>
        </div>
        <div className="lg:col-span-8">
          <TechnicalSpec number="01" tag="DAG Fabric" title="Asynchronous Causality" desc="Shattering sequential bottlenecks. Each event transition centers on parent-child lineage, enabling massive parallel state processing without central locks." />
          <TechnicalSpec number="02" tag="VLC Sync" title="Vector Logical Clocks" desc="Deterministic ordering in an asynchronous world. VLC provides precise partial ordering for cross-subnet events with sub-millisecond overhead." />
          <TechnicalSpec number="03" tag="TEE Compute" title="Silicon-Level Integrity" desc="Validator nodes operate within Trusted Execution Environments, ensuring hardware-verified execution for complex causal flows." />
          <TechnicalSpec number="04" tag="Global Anchor" title="Deterministic Finality" desc="Periodic Anchors solidify the state, condensing the DAG into immutable truth points for optimized history synchronization." />
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-8 py-32 border-b border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-sm font-mono font-bold text-indigo-600 uppercase tracking-[0.4em]">Hybrid Architecture</h2>
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Merging Parallel Flow <br />
                with Deterministic Finality.
              </h3>
            </div>
            <div className="space-y-10">
              <div className="group space-y-3">
                <div className="flex items-center gap-3">
                  <GitBranch size={20} className="text-slate-900" />
                  <h4 className="text-lg font-bold text-slate-900">DAG: The Velocity Engine</h4>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  Shattering the linear bottleneck. Independent events execute concurrently, achieving a 100x increase in throughput while maintaining crystal-clear causal lineage.
                </p>
                <div className="flex gap-4 pt-2">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">100x TPS</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">Zero Packaging Delay</span>
                </div>
              </div>
              <div className="group space-y-3">
                <div className="flex items-center gap-3">
                  <Box size={20} className="text-slate-900" />
                  <h4 className="text-lg font-bold text-slate-900">Anchor: The Consensus Hub</h4>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  Solidifying the asynchronous stream. Anchors provide immutable finality and rapid synchronization, allowing new nodes to sync the chain without replaying full history.
                </p>
                <div className="flex gap-4 pt-2">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">Merkle Integrity</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">Instant Finality</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full aspect-square max-w-md border border-slate-100 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border border-indigo-100 rounded-full scale-75 animate-pulse"></div>
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
              <div className="z-10 bg-white p-6 border border-slate-200 rounded-2xl shadow-xl flex flex-col items-center gap-2">
                <Zap size={24} className="text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Setu Core</span>
              </div>
              <div className="absolute top-10 left-10 p-3 bg-white border border-slate-100 rounded-xl shadow-sm italic text-[10px] text-slate-500">Causal_Lineage</div>
              <div className="absolute bottom-10 right-10 p-3 bg-white border border-slate-100 rounded-xl shadow-sm italic text-[10px] text-slate-500">Anchor_Finality</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-32 border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8 space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-mono font-bold text-indigo-600 uppercase tracking-[0.4em]">Vector Logical Clocks</h2>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight italic">The Pulse of Digital Causality.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vlcFeatures.map((feature, i) => (
              <div key={i} className="bg-white p-8 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-400 transition-all">
                <div className="text-indigo-600"><feature.icon size={20} /></div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{feature.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-8 py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-12 text-center space-y-6 mb-12">
            <h2 className="text-sm font-mono font-bold text-indigo-600 uppercase tracking-[0.4em]">Infrastructure Design</h2>
            <h3 className="text-5xl font-bold text-slate-900 tracking-tighter">Decoupled Consensus & Execution.</h3>
          </div>
          <div className="lg:col-span-4 p-10 bg-white border border-slate-100 rounded-3xl space-y-6 hover:shadow-2xl hover:shadow-slate-100 transition-all">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><User size={24} /></div>
            <h4 className="text-xl font-bold text-slate-900">Client Layer</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              The interface for user access. Triggers business logic and submits atomic event sequences to the asynchronous engine for processing.
            </p>
          </div>
          <div className="lg:col-span-4 p-10 bg-indigo-600 text-white rounded-3xl space-y-6 shadow-2xl shadow-indigo-200 transform lg:scale-110 relative z-10">
            <div className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Cpu size={24} /></div>
            <h4 className="text-xl font-bold">Solver Layer</h4>
            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
              Dedicated execution workload. Solvers perform computation and execution independently of consensus, scaling dynamically based on network pressure.
            </p>
          </div>
          <div className="lg:col-span-4 p-10 bg-white border border-slate-100 rounded-3xl space-y-6 hover:shadow-2xl hover:shadow-slate-100 transition-all">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck size={24} /></div>
            <h4 className="text-xl font-bold text-slate-900">Validator Layer</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Pure consensus focus. Validators solidify Anchor packaging and verify VLC state proofs, maintaining global integrity without the computational overhead of execution.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
