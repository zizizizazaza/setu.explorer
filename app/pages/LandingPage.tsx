import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, GitBranch, Box, Zap, Clock3, ShieldCheck, MapPin, History, User, Cpu, TrendingUp } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { ParticleSphere } from '../components/ParticleSphere';
import { motion, useScroll, useTransform, animate, useInView } from 'framer-motion';

const TechnicalSpec: React.FC<{ number: string; title: string; desc: string; tag: string }> = ({ number, title, desc, tag }) => (
  <div className="spec-card group border-t border-white/10 py-12 flex flex-col md:flex-row gap-8 px-6 hover:bg-white/[0.02] transition-colors rounded-2xl">
    <div className="md:w-40 shrink-0">
      <span className="spec-number text-[10px] font-mono font-bold text-white/40 tracking-[0.2em] block">{number}</span>
    </div>
    <div className="flex-1 space-y-3">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
        <span className="text-[10px] bg-white/5 border border-white/10 text-white/60 px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:text-white transition-all">{tag}</span>
      </div>
      <p className="text-white/50 text-sm leading-relaxed max-w-2xl font-medium">
        {desc}
      </p>
    </div>
  </div>
);

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-50px" });

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Math.floor(latest) + suffix;
          }
        },
      });
      return () => controls.stop();
    } else if (ref.current && !inView) {
      ref.current.textContent = "0" + suffix;
    }
  }, [inView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

const ScrambleText = ({ text }: { text: string }) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_*#@';
  const [displayText, setDisplayText] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-50px" });

  useEffect(() => {
    if (!inView) {
      setDisplayText(text.split('').map(c => c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]).join(''));
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() => text.split('').map((char, index) => {
        if (char === ' ') return char;
        if (index < iteration) {
          return text[index];
        }
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 8; // Slower reveal (was 1/3)
    }, 40); // Slightly slower tick

    return () => clearInterval(interval);
  }, [inView, text]);

  return <span ref={ref} className="inline-block tabular-nums">{displayText}</span>;
};

const PerformanceSection = () => (
  <section className="relative py-40 font-mono z-10 pointer-events-none flex flex-col items-center justify-center min-h-[80vh]">
    <div className="max-w-[1440px] mx-auto px-8 relative z-10 w-full flex flex-col items-center text-center">

      {/* Title & Description */}
      <div className="space-y-12 max-w-3xl pointer-events-auto flex flex-col items-center">

        <h3 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-widest leading-[1.15] uppercase pt-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          EXTREME SCALE. <br />
          <span className="font-bold">HYPER PERFORMANCE.</span>
        </h3>

        {/* Metrics Layout (Centered) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 py-8 pointer-events-auto w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">IDEAL INFRASTRUCTURE</div>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl lg:text-8xl font-bold text-indigo-400 tracking-tight tabular-nums drop-shadow-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <AnimatedNumber value={200} suffix="K" />
              </span>
              <span className="text-white/40 font-bold text-xs uppercase tracking-widest">TPS</span>
            </div>
          </div>

          <div className="hidden md:block w-px h-24 bg-white/10" />

          <div className="flex flex-col items-center space-y-4 opacity-80">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">HIGH CONTENTION / LOAD</div>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl lg:text-8xl font-bold text-slate-300 tracking-tight tabular-nums drop-shadow-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <AnimatedNumber value={50} suffix="K" />
              </span>
              <span className="text-white/40 font-bold text-xs uppercase tracking-widest">TPS</span>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-[11px] leading-relaxed max-w-xl uppercase tracking-widest">
          Setu achieves massive parallel processing through <span className="text-white font-bold">DAG architecture</span> and <span className="text-white font-bold">VLC synchronization</span>.
          By decoupling consensus from execution, the network scales linearly to meet any demand.
        </p>
      </div>

    </div>
  </section>
);

interface LandingPageProps {
  onNavigate: (p: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const vlcFeatures = [
    { title: "Precise Relation", desc: "Accurately judge the happens-before relationship between any two events in a distributed environment.", icon: Clock3 },
    { title: "Conflict Detection", desc: "Automatically identify concurrent events to prevent state conflicts and ensure deterministic outcomes.", icon: ShieldCheck },
    { title: "Global Alignment", desc: "Unified event ordering by merging logical clocks with high-resolution physical timestamps.", icon: MapPin },
    { title: "Deep Traceability", desc: "Trace the complete causal chain of any specific event back to its origin across the entire mesh.", icon: History }
  ];

  return (
    <div className="bg-black min-h-screen selection:bg-indigo-500 selection:text-white relative">

      {/* Global Particle Sphere Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ParticleSphere />
        </Canvas>
      </div>

      {/* Hero Section - Axis Robotics Style */}
      <section className="relative min-h-[90vh] flex flex-col justify-between overflow-visible font-mono px-8 pt-10 pb-4 z-10">
        <div className="max-w-[1440px] mx-auto px-8 relative z-10 w-full flex-grow flex items-end">
          <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex flex-col lg:flex-row justify-between items-end gap-12 w-full pb-0">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-light text-white tracking-normal uppercase leading-[1.1] mix-blend-difference">
                THE DETERMINISTIC <br />
                <span className="text-white font-bold"><ScrambleText text="CAUSAL NETWORK" /></span>
              </h1>
            </div>

            <div className="max-w-sm space-y-8 lg:text-right flex flex-col items-start lg:items-end w-full mix-blend-difference">
              <p className="text-white/60 text-[11px] uppercase tracking-widest leading-relaxed">
                Setu decouples consensus from execution via <span className="text-white">VLC</span> and <span className="text-white">DAG</span>, establishing a high-throughput backbone for verifiable digital causality.
              </p>
              <div className="flex items-center gap-6">
                <button className="text-white text-xs font-bold tracking-widest uppercase hover:text-indigo-400 transition-colors flex items-center gap-2 group pointer-events-auto">
                  READ PAPER <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform opacity-50 group-hover:opacity-100" />
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs tracking-widest uppercase hover:bg-white hover:text-indigo-600 transition-colors pointer-events-auto rounded-none"
                >
                  INIT EXPLORE
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div style={{ opacity: heroOpacity }} className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="animate-bounce">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="text-white/60">
              <path d="M10 4 L10 14 M5 10 L10 15 L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>
      </section>

      <PerformanceSection />

      <section className="bg-black/80 backdrop-blur-sm py-32 border-b border-white/20 font-mono relative z-10">
        <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">Engine Core</h2>
            <p className="text-2xl text-white tracking-widest leading-tight">
              De-Sequentialized <br />
              Infrastructure for <br />
              Autonomous Agents.
            </p>
            <div className="h-32 w-px bg-white/20 mt-12 hidden lg:block"></div>
          </div>
          <div className="lg:col-span-8">
            {[
              { number: '01', tag: 'DAG Fabric', title: 'Asynchronous Causality', desc: 'Shattering sequential bottlenecks. Each event transition centers on parent-child lineage, enabling massive parallel state processing without central locks.' },
              { number: '02', tag: 'VLC Sync', title: 'Vector Logical Clocks', desc: 'Deterministic ordering in an asynchronous world. VLC provides precise partial ordering for cross-subnet events with sub-millisecond overhead.' },
              { number: '03', tag: 'TEE Compute', title: 'Silicon-Level Integrity', desc: 'Validator nodes operate within Trusted Execution Environments, ensuring hardware-verified execution for complex causal flows.' },
              { number: '04', tag: 'Global Anchor', title: 'Deterministic Finality', desc: 'Periodic anchors solidify the state, condensing the DAG into immutable truth points for optimized history synchronization.' },
            ].map((spec) => (
              <TechnicalSpec key={spec.number} number={spec.number} tag={spec.tag} title={spec.title} desc={spec.desc} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black/90 py-32 border-b border-white/20 font-mono relative z-10">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-16">
              <div className="space-y-6">
                <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Hybrid Architecture</h2>
                <h3 className="text-4xl text-white tracking-widest leading-tight">
                  Merging Parallel Flow <br />
                  with Deterministic Finality.
                </h3>
              </div>
              <div className="space-y-12">
                <div className="group space-y-4 border-l border-white/10 pl-6 hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-indigo-400"><GitBranch size={20} /></span>
                    <h4 className="text-base font-semibold text-white tracking-wide">DAG / The Velocity Engine</h4>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed max-w-md tracking-wide">
                    Shattering the linear bottleneck. Independent events execute concurrently, achieving a massive increase in throughput while maintaining crystal-clear causal lineage.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <span className="text-[10px] bg-white/5 rounded-full px-3 py-1 uppercase text-white/50 tracking-wider">100x TPS</span>
                    <span className="text-[10px] bg-white/5 rounded-full px-3 py-1 uppercase text-white/50 tracking-wider">Zero Delay</span>
                  </div>
                </div>

                <div className="group space-y-4 border-l border-white/10 pl-6 hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-white"><Box size={20} /></span>
                    <h4 className="text-base font-semibold text-white tracking-wide">Anchor / The Consensus Hub</h4>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed max-w-md tracking-wide">
                    Solidifying the asynchronous stream. Anchors provide immutable finality and rapid synchronization, allowing new nodes to sync the chain without replaying full history.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <span className="text-[10px] bg-white/5 rounded-full px-3 py-1 uppercase text-white/50 tracking-wider">Merkle Integrity</span>
                    <span className="text-[10px] bg-white/5 rounded-full px-3 py-1 uppercase text-white/50 tracking-wider">Fast Finality</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-8 lg:p-12">
              <div className="w-full aspect-square max-w-[420px] relative flex items-center justify-center">
                {/* Glowing Orbs */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-[60px] pointer-events-none" />

                {/* Animated Rings */}
                <div className="absolute inset-0 border border-white/5 rounded-full"></div>
                <div className="absolute inset-8 border border-white/10 border-dashed rounded-full animate-[spin_60s_linear_infinite_reverse]"></div>
                <div className="absolute inset-16 border border-white/5 rounded-full animate-[spin_40s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)] -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Connecting horizontal line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2" />

                {/* Central Core Element */}
                <div className="relative z-10 bg-black/80 backdrop-blur-xl w-36 h-36 rounded-full border border-indigo-500/30 flex flex-col items-center justify-center gap-3 shadow-[0_0_50px_rgba(99,102,241,0.15)] group hover:scale-110 hover:border-indigo-400/50 hover:shadow-[0_0_80px_rgba(99,102,241,0.3)] transition-all duration-500 cursor-default">
                  <div className="absolute inset-0 rounded-full border border-white/10 scale-[1.15] opacity-0 group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-45 transition-all duration-700 border-dashed" />
                  <Zap size={32} className="text-indigo-400 group-hover:animate-pulse" />
                  <span className="text-xs font-bold tracking-widest text-white uppercase">Setu Core</span>
                </div>

                {/* Floating Labels */}
                <div className="absolute top-[20%] right-[-5%] lg:right-[-15%] flex flex-col items-start gap-2 bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10 rounded-xl">
                  <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" /> Immutable
                  </span>
                </div>
                <div className="absolute bottom-[20%] left-[-5%] lg:left-[-15%] flex flex-col items-end gap-2 bg-black/60 backdrop-blur-md px-4 py-2 border border-indigo-500/20 rounded-xl">
                  <span className="text-[10px] font-mono text-indigo-400/80 tracking-widest uppercase flex items-center gap-2">
                    Concurrent <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-pulse" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-32 border-b border-white/20 font-mono relative z-10 opacity-95">
        <div className="max-w-[1440px] mx-auto px-8 space-y-20">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="text-center space-y-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-indigo-500 uppercase tracking-widest px-4 py-1">Vector Logical Clocks</h2>
            <h3 className="text-3xl lg:text-4xl text-white tracking-widest">The Pulse of Digital Causality</h3>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vlcFeatures.map((feature, i) => (
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: i * 0.1 }} key={i} className="bg-black p-8 border border-white/10 space-y-6 hover:border-indigo-500 transition-all group rounded-xl">
                <div className="text-white/40 group-hover:text-indigo-400 transition-colors"><feature.icon size={24} /></div>
                <h4 className="text-base font-semibold text-white tracking-wide">{feature.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{feature.desc}</p>
                <div className="pt-4 border-t border-white/10 w-8 group-hover:w-full group-hover:border-indigo-500 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-40 font-mono relative overflow-hidden z-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="lg:col-span-12 text-center space-y-6 mb-16">
              <h2 className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">Infrastructure Design</h2>
              <h3 className="text-4xl text-white tracking-widest">Decoupled Consensus & Execution</h3>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.1 }} className="lg:col-span-4 p-8 bg-black border border-white/10 rounded-2xl space-y-8 hover:border-indigo-500 transition-colors relative group">
              <div className="w-14 h-14 bg-white/5 rounded-xl text-white flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors"><User size={24} /></div>
              <h4 className="text-lg font-bold text-white tracking-wide">Client Layer</h4>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Entry point for autonomous agents. Triggers business logic and submits atomic event sequences to the DAG engine for asynchronous processing.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.3 }} className="lg:col-span-4 p-8 bg-indigo-500/5 border border-indigo-500/50 rounded-2xl space-y-8 relative transform lg:-translate-y-4 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl text-white flex items-center justify-center"><Cpu size={24} /></div>
              <h4 className="text-lg font-bold text-white tracking-wide">TEE Solver Layer</h4>
              <p className="text-sm text-indigo-200/80 leading-relaxed font-medium">
                Massive parallel execution. Dedicated Solver clusters perform TEE-verified computation independently of consensus, scaling linearly based on network pressure.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.5 }} className="lg:col-span-4 p-8 bg-black border border-white/10 rounded-2xl space-y-8 hover:border-indigo-500 transition-colors relative group">
              <div className="w-14 h-14 bg-white/5 rounded-xl text-white flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors"><ShieldCheck size={24} /></div>
              <h4 className="text-lg font-bold text-white tracking-wide">Validator Layer</h4>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Pure-consensus focus. Multiple Validators solidify Anchor packaging and verify VLC state proofs, maintaining global causal integrity without execution overhead.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div >
  );
};
