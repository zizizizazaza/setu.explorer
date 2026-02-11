import React from 'react';
import { ArrowRight, GitBranch, Box, Zap, Clock3, ShieldCheck, MapPin, History, User, Cpu, TrendingUp } from 'lucide-react';

const TechnicalSpec = ({ number, title, desc, tag }: { number: string; title: string; desc: string; tag: string }) => (
  <div className="spec-card group border-t border-slate-100 py-12 flex flex-col md:flex-row gap-8 px-4">
    <div className="md:w-40 shrink-0">
      <span className="spec-number text-[10px] font-mono font-bold text-slate-400 tracking-[0.2em] block">{number}</span>
    </div>
    <div className="flex-1 space-y-3">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
        <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider group-hover:bg-indigo-600 group-hover:text-white transition-colors">{tag}</span>
      </div>
      <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
        {desc}
      </p>
    </div>
  </div>
);

const PerformanceSection = () => (
  <section className="bg-white py-32 overflow-hidden relative border-b border-slate-100">
    <div className="absolute inset-0 grid-pattern opacity-60" />
    <div className="glow-orb top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/5" style={{ animation: 'pulse-soft 8s ease-in-out infinite' }} />
    <div className="glow-orb bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5" style={{ animation: 'pulse-soft 10s ease-in-out infinite reverse' }} />
    <div className="max-w-[1440px] mx-auto px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="space-y-10 group">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-indigo-600 uppercase tracking-[0.4em] flex items-center gap-2">
              <span className="w-8 h-px bg-indigo-200 group-hover:w-12 transition-all" />
              Performance Benchmark
            </h2>
            <h3 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tighter leading-tight">
              Extreme Scale. <br />
              Deterministic Flow.
            </h3>
          </div>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl font-medium border-l-2 border-indigo-50 pl-6">
            Setu achieves massive parallel processing through <span className="text-slate-900 italic font-semibold">DAG architecture</span> and <span className="text-slate-900 italic font-semibold">VLC synchronization</span>.
            By decoupling consensus from execution, the network scales linearly to meet any demand.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-3 relative group/stat">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-indigo-600 tracking-tighter tabular-nums drop-shadow-sm">200K</span>
                <span className="text-slate-400 font-bold text-xl uppercase tracking-widest">TPS</span>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] group-hover/stat:text-indigo-500 transition-colors">Ideal Infrastructure</div>
              <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-indigo-500 scale-y-0 group-hover/stat:scale-y-100 transition-transform origin-top duration-300" />
            </div>
            <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-slate-400 tracking-tighter tabular-nums">50K</span>
                <span className="text-slate-400 font-bold text-xl uppercase tracking-widest">TPS</span>
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">High Contention / Load</div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-white/50 backdrop-blur-sm border border-slate-200 rounded-3xl p-10 space-y-12 shadow-xl shadow-slate-100/50">
            {[
              { title: 'Parallel Execution Fabric', desc: 'DAG-based event ordering eliminates sequential locks, allowing independent transactions to process at silicon speed.', icon: GitBranch },
              { title: 'Validator-Solver Decoupling', desc: 'Consensus is isolated from execution. Multiple TEE Solver nodes execute concurrently while Validators handle global pulse.', icon: Cpu },
              { title: 'Elastic Linear Scaling', desc: 'Throughput grows linearly with hardware allocation. Simply add Solver nodes to expand network capacity on-demand.', icon: TrendingUp },
            ].map((feature, i) => (
              <div key={i} className="flex gap-8 group/item">
                <div className="shrink-0 w-14 h-14 bg-white shadow-lg shadow-indigo-100 border border-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500">
                  <feature.icon size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    {feature.title}
                    <div className="h-1 w-0 bg-indigo-500 group-hover/item:w-6 transition-all" />
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
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
    <div className="bg-white min-h-screen selection:bg-indigo-600 selection:text-white relative">
      <div className="fixed inset-0 grid-pattern opacity-40 pointer-events-none z-0" />
      <section className="relative pt-24 pb-32 border-b border-slate-100 overflow-hidden z-10">
        <div className="glow-orb top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-100/40" style={{ animation: 'float-slow 12s ease-in-out infinite' }} />
        <div className="glow-orb bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-50/30" style={{ animation: 'float-slow 15s ease-in-out infinite reverse' }} />
        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-xl animate-pulse">
                <Zap size={12} className="fill-indigo-400 text-indigo-400" />
                Network Live
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-[-0.04em] leading-[1.1] drop-shadow-sm">
                The Deterministic <br />
                <span className="text-indigo-600 relative inline-block">
                  Causal Network
                  <div className="absolute -bottom-2 left-0 w-full h-[6px] bg-indigo-100 -z-10 rotate-[-1deg]" />
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                Setu decouples consensus from execution via <span className="text-slate-900 font-semibold underline decoration-indigo-200 underline-offset-4">VLC</span> and <span className="text-slate-900 font-semibold underline decoration-indigo-200 underline-offset-4">DAG</span>,
                establishing a high-throughput backbone for verifiable digital causality.
              </p>
              <div className="flex items-center gap-6 pt-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-10 py-5 bg-slate-900 text-white font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-indigo-600 transition-all rounded shadow-2xl shadow-slate-200 hover:-translate-y-1 active:scale-95"
                >
                  Start Explore
                </button>
                <button className="text-slate-400 font-bold text-[11px] tracking-[0.2em] uppercase hover:text-slate-900 transition-colors flex items-center gap-2 group">
                  Whitepaper <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
            <div className="relative select-none h-full flex items-center justify-end group">
              <div className="relative w-full h-full max-w-xl">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-[80px] -z-10 scale-0 group-hover:scale-100 transition-transform duration-1000" />
                <img
                  src="/hero_visual.png"
                  alt=""
                  className="w-full h-full object-contain object-right opacity-90 transition-all duration-1000 group-hover:scale-[1.02]"
                  style={{
                    maskImage: 'linear-gradient(to left, black 60%, transparent 95%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
                  }}
                />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PerformanceSection />

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
          {[
            { number: '01', tag: 'DAG Fabric', title: 'Asynchronous Causality', desc: 'Shattering sequential bottlenecks. Each event transition centers on parent-child lineage, enabling massive parallel state processing without central locks.' },
            { number: '02', tag: 'VLC Sync', title: 'Vector Logical Clocks', desc: 'Deterministic ordering in an asynchronous world. VLC provides precise partial ordering for cross-subnet events with sub-millisecond overhead.' },
            { number: '03', tag: 'TEE Compute', title: 'Silicon-Level Integrity', desc: 'Validator nodes operate within Trusted Execution Environments, ensuring hardware-verified execution for complex causal flows.' },
            { number: '04', tag: 'Global Anchor', title: 'Deterministic Finality', desc: 'Periodic Anchors solidify the state, condensing the DAG into immutable truth points for optimized history synchronization.' },
          ].map((spec) => (
            <div key={spec.number}>
              <TechnicalSpec number={spec.number} tag={spec.tag} title={spec.title} desc={spec.desc} />
            </div>
          ))}
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
              Entry point for autonomous agents. Triggers business logic and submits atomic event sequences to the DAG engine for asynchronous processing.
            </p>
          </div>
          <div className="lg:col-span-4 p-10 bg-indigo-600 text-white rounded-3xl space-y-6 shadow-2xl shadow-indigo-200 transform lg:scale-110 relative z-10">
            <div className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Cpu size={24} /></div>
            <h4 className="text-xl font-bold">TEE Solver Layer</h4>
            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
              Massive parallel execution. Dedicated Solver clusters perform TEE-verified computation independently of consensus, scaling linearly based on network pressure.
            </p>
          </div>
          <div className="lg:col-span-4 p-10 bg-white border border-slate-100 rounded-3xl space-y-6 hover:shadow-2xl hover:shadow-slate-100 transition-all">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck size={24} /></div>
            <h4 className="text-xl font-bold text-slate-900">Validator Layer</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Pure-consensus focus. Multiple Validators solidify Anchor packaging and verify VLC state proofs, maintaining global causal integrity without execution overhead.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
