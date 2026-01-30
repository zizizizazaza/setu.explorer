
import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Line, OrbitControls, Html, Billboard, PointMaterial, Points, PerspectiveCamera } from '@react-three/drei';
import { createRoot } from 'react-dom/client';
import {
  Search,
  Box,
  Activity,
  Database,
  Users,
  Cpu,
  Clock,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock3,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  List,
  Info,
  User,
  History,
  TrendingUp,
  MapPin,
  Lock
} from 'lucide-react';

// --- Types & Interfaces ---

type EventStatus = 'Pending' | 'InWorkQueue' | 'Executed' | 'Confirmed' | 'Finalized' | 'Failed';
type CFStatus = 'Proposed' | 'Voting' | 'Approved' | 'Finalized' | 'Rejected';

interface NetworkStats {
  total_anchors: number;
  total_events: number;
  total_validators: number;
  total_solvers: number;
  tps: number;
  avg_anchor_time: number;
}

interface Anchor {
  id: string;
  depth: number;
  event_count: number;
  timestamp: number;
  vlc_time: number;
  proposer: string;
  status: string;
  state_root: string;
  previous_anchor?: string;
  next_anchor?: string;
  merkle_roots?: {
    global_state_root: string;
    events_root: string;
    anchor_chain_root: string;
    subnet_roots: Record<string, string>;
  };
}

interface Event {
  id: string;
  type: string;
  status: EventStatus;
  creator: string;
  timestamp: number;
  vlc_time: number;
  anchor_id: string;
  anchor_depth: number;
  parent_ids: string[];
  children_ids?: string[];
  summary: string;
  payload?: any;
  execution_result?: {
    success: boolean;
    message: string;
    state_changes: Array<{ key: string; old_value: string; new_value: string }>;
  };
}

interface Account {
  address: string;
  balance: number;
  profile: {
    display_name: string;
    avatar_url?: string;
    bio: string;
  };
  statistics: {
    total_sent: number;
    total_received: number;
    transaction_count: number;
    first_seen: number;
    last_active: number;
  };
  credentials: Array<{ type: string; level: string; issuer: string; status: string }>;
}

// --- Mock Data Generator ---

const MOCK_STATS: NetworkStats = {
  total_anchors: 12345,
  total_events: 567890,
  total_validators: 12,
  total_solvers: 34,
  tps: 1245.8,
  avg_anchor_time: 5.2
};

const generateMockAnchors = (count: number): Anchor[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `anchor_setu_${Math.random().toString(16).slice(2, 10)}`,
    depth: 12345 - i,
    event_count: Math.floor(Math.random() * 200) + 50,
    timestamp: Date.now() - i * 5000,
    vlc_time: 123450 - i,
    proposer: `validator-${(i % 5) + 1}`,
    status: 'finalized',
    state_root: `0x${Math.random().toString(16).slice(2, 34)}`
  }));
};

const generateMockEvents = (count: number): Event[] => {
  const types = ['Transfer', 'System', 'ValidatorRegister', 'SubnetRegister', 'PowerConsume', 'TaskSubmit'];
  const statuses: EventStatus[] = ['Finalized', 'Confirmed', 'Executed'];

  return Array.from({ length: count }).map((_, i) => ({
    id: `ev_${Math.random().toString(16).slice(2, 12)}`,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    creator: i % 2 === 0 ? `solver-${(i % 10) + 1}` : `0x${Math.random().toString(16).slice(2, 10)}`,
    timestamp: Date.now() - i * 1000,
    vlc_time: 123449 - i,
    anchor_id: `anchor_setu_99a8b${i}`,
    anchor_depth: 12345 - Math.floor(i / 10),
    parent_ids: [`ev_p${i}1`, `ev_p${i}2`],
    children_ids: [`ev_c${i}1`],
    summary: `Processed ${types[i % types.length]} event for user_${Math.random().toString(16).slice(2, 6)}`
  }));
};

const getMockAccount = (address: string): Account => ({
  address,
  balance: 1000,
  profile: {
    display_name: address.charAt(0).toUpperCase() + address.slice(1),
    bio: "Setu ecosystem participant and DeFi enthusiast."
  },
  statistics: {
    total_sent: 5200.5,
    total_received: 6200.5,
    transaction_count: 142,
    first_seen: Date.now() - 30 * 24 * 60 * 60 * 1000,
    last_active: Date.now() - 5 * 60 * 1000
  },
  credentials: [
    { type: 'kyc', level: 'level_2', issuer: 'Setu Compliance', status: 'Active' }
  ]
});

// --- Components ---

const Badge = ({ children, status }: { children?: React.ReactNode, status?: string }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'finalized': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStyles()}`}>
      {children}
    </span>
  );
};

const StatsCard = ({ title, value, icon: Icon, subValue }: { title: string, value: string | number, icon: any, subValue?: string }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
    </div>
    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
      <Icon size={20} />
    </div>
  </div>
);

const Navbar = ({ onNavigate, currentPath }: { onNavigate: (path: string, id?: string) => void, currentPath: string }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    if (query.startsWith('anchor_')) onNavigate('anchor_detail', query);
    else if (query.startsWith('ev_')) onNavigate('event_detail', query);
    else if (query.startsWith('0x') || query.length < 15) onNavigate('account_detail', query);
    else onNavigate('search_results', query);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('landing')}>
          <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-900">SETU<span className="text-indigo-600 italic ml-1">EXPLORER</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-500">
          {['Dashboard', 'Anchors', 'Events', 'Validators'].map(item => (
            <button
              key={item}
              onClick={() => onNavigate(item.toLowerCase())}
              className={`hover:text-indigo-600 transition-colors relative pb-1 ${currentPath === item.toLowerCase() ? 'text-indigo-600 border-b-2 border-indigo-600' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-sm relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search Anchor / Event / Account..."
            className="w-full bg-slate-100 text-slate-900 text-[11px] font-medium py-2 pl-9 pr-4 rounded-lg border border-transparent focus:border-indigo-500 focus:bg-white focus:shadow-xl focus:shadow-indigo-500/5 transition-all outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>
    </nav>
  );
};

const FloatingNode = ({ node, isSelected, isRelated, isDimmed, onClick, onNavigate }: any) => {
  const [hovered, setHover] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  // Organic floating motion - only active if not related
  useFrame((state) => {
    if (groupRef.current && !isRelated) {
      const t = state.clock.elapsedTime * 0.4;
      groupRef.current.position.x = node.x + Math.sin(t + node.seedX) * 0.4;
      groupRef.current.position.y = node.y + Math.cos(t * 0.7 + node.seedY) * 0.4;
      groupRef.current.position.z = node.z + Math.sin(t * 1.2 + node.seedZ) * 0.4;
    } else if (groupRef.current && isRelated) {
      // Snap to original position when frozen/pinned
      groupRef.current.position.set(node.x, node.y, node.z);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#60a5fa" : isRelated ? "#3b82f6" : "#2563eb"}
          transparent
          opacity={isDimmed ? 0.2 : 0.9}
        />

        <Billboard>
          <Html distanceFactor={10}>
            <div className={`transition-all duration-500 flex flex-col items-center pointer-events-none ${isDimmed ? 'opacity-0' : 'opacity-100'}`}>
              {(hovered || isRelated) && (
                <div className="mt-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <span
                    className={`text-[9px] font-black text-white px-2.5 py-1 rounded shadow-lg cursor-pointer pointer-events-auto transition-colors ${isSelected ? 'bg-cyan-500 shadow-cyan-200' : 'bg-blue-600 shadow-blue-100'}`}
                    onClick={(e) => { e.stopPropagation(); onNavigate('event_detail', node.id); }}
                  >
                    {node.id}
                  </span>
                  <span className="text-[7px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{node.type}</span>
                </div>
              )}
            </div>
          </Html>
        </Billboard>
      </mesh>
    </group>
  );
};

const DistantNodes = () => {
  const ref = useRef<any>(null);
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 400; i++) {
      pts.push(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        -10 - Math.random() * 30
      );
    }
    return new Float32Array(pts);
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.25}
      />
    </Points>
  );
};

const PlexusConnections = ({ nodes, selectedId }: any) => {
  const connections = useMemo(() => {
    const conns: any[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 4) {
          const isRelatedToSelection = selectedId && (nodes[i].id === selectedId || nodes[j].id === selectedId);
          conns.push({
            p1: new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z),
            p2: new THREE.Vector3(nodes[j].x, nodes[j].y, nodes[j].z),
            isHighlighted: !!isRelatedToSelection
          });
        }
      }
    }
    return conns;
  }, [nodes, selectedId]);

  return (
    <group>
      {connections.map((conn, i) => {
        // Only show lines if no selection OR if this line is part of the selection
        const visible = !selectedId || conn.isHighlighted;
        if (!visible) return null;

        return (
          <Line
            key={i}
            points={[conn.p1, conn.p2]}
            color={conn.isHighlighted ? "#3b82f6" : "#cbd5e1"}
            lineWidth={conn.isHighlighted ? 1.5 : 0.5}
            transparent
            opacity={conn.isHighlighted ? 0.8 : 0.15}
          />
        );
      })}
    </group>
  );
};

const CausalGraph = ({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const nodeCount = useRef(0);

  useEffect(() => {
    // Initialize 60 random nodes in a space
    const initialNodes = Array.from({ length: 60 }).map((_, i) => ({
      id: `ev_${i}`,
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 6,
      size: 0.04 + Math.random() * 0.08,
      seedX: Math.random() * 100,
      seedY: Math.random() * 100,
      seedZ: Math.random() * 100,
      type: ['Transfer', 'System', 'Task'][Math.floor(Math.random() * 3)]
    }));
    setNodes(initialNodes);
  }, []);

  const highlightedData = useMemo(() => {
    if (!selectedId) return { nodeIds: new Set<string>() };
    const nodeIds = new Set<string>([selectedId]);
    const selectedNode = nodes.find(n => n.id === selectedId);
    if (selectedNode) {
      nodes.forEach(n => {
        if (n.id === selectedId) return;
        const dx = n.x - selectedNode.x;
        const dy = n.y - selectedNode.y;
        const dz = n.z - selectedNode.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4) nodeIds.add(n.id);
      });
    }
    return { nodeIds };
  }, [selectedId, nodes]);

  return (
    <section className="bg-gradient-to-br from-slate-100 via-white to-blue-50/30 rounded-2xl border border-slate-300/50 shadow-xl overflow-hidden p-0 relative h-[600px] flex flex-col">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm tracking-widest uppercase">
          <GitBranch size={16} className="text-blue-600" />
          Live causal graph
        </h3>
        <p className="text-slate-500 text-[10px] font-bold mt-1">
          {selectedId ? `Inspecting sequence path for ${selectedId}` : "Real-time 3D deterministic event propagation"}
        </p>
      </div>

      <div className="absolute top-8 right-8 z-20 flex gap-4">
        {selectedId && (
          <button
            onClick={() => setSelectedId(null)}
            className="px-4 py-1.5 bg-white/80 backdrop-blur-md text-slate-900 rounded-lg text-[10px] font-black uppercase hover:bg-white transition-all border border-slate-200 shadow-sm pointer-events-auto"
          >
            Clear selection
          </button>
        )}
        <div className="bg-blue-50/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest italic">Live dynamics</span>
        </div>
      </div>

      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 10], fov: 40 }}
            onPointerMissed={() => setSelectedId(null)}
          >
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />

            <group>
              <PlexusConnections nodes={nodes} selectedId={selectedId} />
              <DistantNodes />
              {nodes.map((node) => (
                <FloatingNode
                  key={node.id}
                  node={node}
                  isSelected={selectedId === node.id}
                  isRelated={highlightedData.nodeIds.has(node.id)}
                  isDimmed={selectedId && !highlightedData.nodeIds.has(node.id)}
                  onClick={() => setSelectedId(node.id === selectedId ? null : node.id)}
                  onNavigate={onNavigate}
                />
              ))}
            </group>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate={!selectedId} autoRotateSpeed={0.5} />
          </Canvas>
        </Suspense>
      </div>
    </section>
  );
};

const Dashboard = ({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) => {
  const anchors = useMemo(() => generateMockAnchors(10), []);
  const events = useMemo(() => generateMockEvents(10), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Anchors" value={MOCK_STATS.total_anchors.toLocaleString()} icon={Box} subValue="Depth 12,345" />
        <StatsCard title="Total Events" value={MOCK_STATS.total_events.toLocaleString()} icon={Activity} subValue="TPS: 1,245.8" />
        <StatsCard title="Avg Anchor Time" value={`${MOCK_STATS.avg_anchor_time}s`} icon={Clock} subValue="Consistency Frame" />
        <StatsCard title="Validators" value={MOCK_STATS.total_validators} icon={ShieldCheck} subValue="Active Participants" />
      </div>

      <CausalGraph onNavigate={onNavigate} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm tracking-wider">
              <Database size={16} className="text-indigo-500" />
              Latest Anchors
            </h3>
            <button onClick={() => onNavigate('anchors')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-widest border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-50 transition-all">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {anchors.map((anchor) => (
              <div key={anchor.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('anchor_detail', anchor.id)}>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500 font-mono text-[10px] flex items-center justify-center w-10 h-10">
                    AC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        #{anchor.depth}
                      </span>
                      <Badge status={anchor.status}>{anchor.status}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {anchor.id.slice(0, 20)}...
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-700 font-medium">{anchor.event_count} txns</div>
                  <div className="text-[10px] text-slate-400">{new Date(anchor.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm tracking-wider">
              <Zap size={16} className="text-indigo-500" />
              Latest Events
            </h3>
            <button onClick={() => onNavigate('events')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-widest border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-50 transition-all">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {events.map((event) => (
              <div key={event.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('event_detail', event.id)}>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500 font-mono text-[10px] flex items-center justify-center w-10 h-10">
                    EV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{event.type}</span>
                      <Badge status={event.status}>{event.status}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px] md:max-w-md">
                      {event.summary}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-indigo-600 font-bold">#{event.anchor_depth}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{event.id.slice(0, 10)}...</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const AnchorDetail = ({ anchorId, onNavigate }: { anchorId: string, onNavigate: (p: string, id?: string) => void }) => {
  const anchor: Anchor = {
    id: anchorId,
    depth: 12345,
    event_count: 150,
    timestamp: 1706342400000,
    vlc_time: 123450,
    proposer: "validator-1",
    status: "finalized",
    state_root: "0x1234567890abcdef...",
    previous_anchor: "anchor_setu_prev_123",
    next_anchor: "anchor_setu_next_456",
    merkle_roots: {
      global_state_root: "0x88776655...",
      events_root: "0x11223344...",
      anchor_chain_root: "0x9900aabb...",
      subnet_roots: {
        "ROOT": "0xdef0123...",
        "SUBNET_A": "0x445566...",
        "SUBNET_B": "0x778899..."
      }
    }
  };

  const anchorEvents = useMemo(() => generateMockEvents(10), []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-widest">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => onNavigate('anchors')} className="hover:text-indigo-600">Anchors</button>
        <ChevronRight size={12} />
        <span className="text-slate-900">Anchor Details</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900">ANCHOR <span className="text-indigo-500 font-mono">#{anchor.depth}</span></h2>
          <Badge status={anchor.status}>{anchor.status}</Badge>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all shadow-sm">
            <ChevronLeft size={14} /> PREV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all shadow-sm">
            NEXT <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">General Information</h3>
              <Clock size={14} className="text-slate-400" />
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: 'Anchor ID', value: anchor.id, isMono: true },
                { label: 'Physical Timestamp', value: new Date(anchor.timestamp).toLocaleString() },
                { label: 'VLC (Logical Time)', value: anchor.vlc_time },
                { label: 'Proposer Node', value: anchor.proposer, isLink: true, type: 'validator' },
                { label: 'State Root', value: anchor.state_root, isMono: true },
                { label: 'Events Included', value: anchor.event_count },
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="w-48 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                    {item.label}
                  </div>
                  <div className={`text-sm text-slate-900 break-all flex-1 ${item.isMono ? 'font-mono bg-slate-50 p-2 rounded border border-slate-100 text-xs' : ''}`}>
                    {item.isLink ? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">{item.value}</span> : item.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Included Events</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="px-6 py-4">Event ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Creator</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anchorEvents.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('event_detail', ev.id)}>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{ev.id}</td>
                      <td className="px-6 py-4 text-xs">{ev.type}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[120px]">{ev.creator}</td>
                      <td className="px-6 py-4"><Badge status={ev.status}>{ev.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Merkle Verification</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: 'Global State Root', value: anchor.merkle_roots?.global_state_root },
                { label: 'Events Tree Root', value: anchor.merkle_roots?.events_root },
                { label: 'Anchor Chain Root', value: anchor.merkle_roots?.anchor_chain_root },
              ].map((root, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Database size={12} />
                    {root.label}
                  </p>
                  <p className={`text-[10px] font-mono bg-slate-50 text-indigo-900 p-3 rounded-lg border border-slate-200 break-all leading-relaxed shadow-sm`}>{root.value}</p>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subnet Roots</p>
                <div className="space-y-2">
                  {Object.entries(anchor.merkle_roots?.subnet_roots || {}).map(([name, root]) => (
                    <div key={name} className="flex flex-col gap-1 p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] font-bold text-indigo-600">{name}</span>
                      <span className="text-[9px] font-mono text-slate-500 truncate">{root}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative border-t-4 border-t-indigo-600">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck size={100} className="text-slate-900" />
            </div>
            <h3 className="font-bold text-xs mb-6 flex items-center gap-2 tracking-widest text-slate-400">
              Consensus process
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-200 shadow-sm">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-green-700">FINALIZED</p>
                  <p className="text-[10px] text-slate-500 italic">consensus achieved at height {anchor.depth}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  <span>Validator Quorum</span>
                  <span className="text-slate-900">10/12</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[83%] h-full bg-indigo-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Proposer</p>
                  <p className="text-[11px] font-mono text-indigo-600 font-bold">{anchor.proposer}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">CF Hash</p>
                  <p className="text-[11px] font-mono text-indigo-600 font-bold">0x44ab...e911</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const EventDetail = ({ eventId, onNavigate }: { eventId: string, onNavigate: (p: string, id?: string) => void }) => {
  const event: Event = {
    id: eventId,
    type: "Transfer",
    status: "Finalized",
    creator: "solver-setu-123456",
    timestamp: 1706342395000,
    vlc_time: 123449,
    anchor_id: "anchor_setu_99a8b1",
    anchor_depth: 12345,
    parent_ids: ["ev_p123_1", "ev_p123_2"],
    children_ids: ["ev_child_11", "ev_child_22"],
    summary: "Transfer 100.5 FLUX from alice to bob",
    payload: {
      Transfer: {
        id: "tx-setu-9988",
        from: "0xalice_setu_wallet",
        to: "0xbob_setu_wallet",
        amount: "100.50 FLUX",
        transfer_type: "Standard"
      }
    },
    execution_result: {
      success: true,
      message: "TEE isolation verified. Execution took 1.2ms.",
      state_changes: [
        { key: "acc:alice", old_value: "1000", new_value: "899.5" },
        { key: "acc:bob", old_value: "500", new_value: "600.5" }
      ]
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => onNavigate('events')} className="hover:text-indigo-600">Events</button>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-black">Event View</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-6 justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white shadow-md text-indigo-600 rounded-2xl border border-slate-100">
              <Activity size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 uppercase">
                  {event.type}
                </h2>
                <Badge status={event.status}>{event.status}</Badge>
              </div>
              <p className="text-slate-400 font-mono text-xs mt-1 tracking-tight">{event.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Anchor Chain</p>
            <button
              onClick={() => onNavigate('anchor_detail', event.anchor_id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black text-lg hover:bg-indigo-700 transition-all shadow-indigo-200 shadow-lg"
            >
              #{event.anchor_depth}
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Info size={14} className="text-slate-300" />
                Event Particulars
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Origin Solver', value: event.creator, isLink: true, type: 'solver' },
                  { label: 'Network Time', value: new Date(event.timestamp).toLocaleString() },
                  { label: 'VLC Index', value: event.vlc_time, isMono: true },
                  { label: 'Narrative', value: event.summary }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5 group">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                    <span className={`text-sm font-bold ${item.isLink ? 'text-indigo-600 cursor-pointer hover:underline decoration-2 underline-offset-4' : 'text-slate-800'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 text-slate-900 shadow-sm relative border border-slate-200 border-t-4 border-t-indigo-600">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Cpu size={120} className="text-slate-900" />
              </div>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6">Execution Runtime</h3>
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 text-xs font-black">
                  <CheckCircle2 size={16} />
                  SUCCESSFUL
                </div>
                <p className="text-slate-600 text-xs font-medium leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {event.execution_result?.message}
                </p>

                <div className="space-y-3 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State Delta</p>
                  {event.execution_result?.state_changes.map((sc, i) => (
                    <div key={i} className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-500 transition-colors">
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">{sc.key}</span>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">{sc.old_value}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 font-bold">{sc.new_value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
            <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <GitBranch size={16} className="text-indigo-500" />
              DAG Relationship Visualizer
            </h3>

            <div className="space-y-12">
              {/* PARENTS */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-4">Ancestors (Parents)</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {event.parent_ids.map(id => (
                    <div key={id} onClick={() => onNavigate('event_detail', id)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm cursor-pointer group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">{id.slice(0, 12)}...</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CURRENT NODE */}
              <div className="flex justify-center relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-8 w-px border-r border-dashed border-slate-300"></div>
                <div className="bg-indigo-600 text-white px-10 py-5 rounded-2xl shadow-xl border-2 border-indigo-400/50 flex flex-col items-center gap-2 relative ring-8 ring-indigo-500/10">
                  <Zap size={24} fill="white" className="animate-pulse" />
                  <span className="font-mono text-xs font-black uppercase tracking-tighter">TARGET NODE</span>
                  <span className="text-[10px] opacity-70 font-mono">{event.id.slice(0, 12)}...</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-8 w-px border-r border-dashed border-slate-300"></div>
              </div>

              {/* CHILDREN */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-4">Descendants (Children)</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {event.children_ids?.map(id => (
                    <div key={id} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-400 cursor-not-allowed shadow-sm opacity-60">
                      {id.slice(0, 12)}...
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw Payload</h4>
                <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">Copy JSON</button>
              </div>
              <div className="bg-slate-100 p-6 rounded-2xl shadow-inner border border-slate-200 max-h-60 overflow-y-auto">
                <pre className="text-[11px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const AccountDetail = ({ address, onNavigate }: { address: string, onNavigate: (p: string, id?: string) => void }) => {
  const account = getMockAccount(address);
  const recentEvents = useMemo(() => generateMockEvents(5), []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600">Home</button>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-black">Account Profile</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-start bg-slate-50/50 border-b border-slate-100">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white">
            <User size={48} />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{account.profile.display_name}</h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-slate-500 break-all bg-white px-3 py-1 rounded-lg border border-slate-200">{account.address}</span>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><ExternalLink size={16} /></button>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl pt-2">{account.profile.bio}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto min-w-[200px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">Current Balance</p>
            <p className="text-3xl font-black text-slate-900 text-center md:text-left">{account.balance.toLocaleString()} <span className="text-indigo-500 text-sm">FLUX</span></p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-500" />
                Network Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Total Sent', value: `${account.statistics.total_sent} FLUX` },
                  { label: 'Total Received', value: `${account.statistics.total_received} FLUX` },
                  { label: 'Event Count', value: account.statistics.transaction_count },
                  { label: 'Uptime Factor', value: '99.9%' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{stat.label}</p>
                    <p className="text-sm font-black text-slate-800">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-500" />
                Verified Credentials
              </h3>
              <div className="space-y-3">
                {account.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <div>
                      <p className="text-xs font-black text-indigo-900 uppercase">{cred.type}</p>
                      <p className="text-[10px] text-indigo-600 font-bold tracking-tight">Level: {cred.level} • Issuer: {cred.issuer}</p>
                    </div>
                    <Badge status="finalized">{cred.status}</Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2">
            <section>
              <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} className="text-indigo-500" />
                Activity History
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Event Hash</th>
                      <th className="px-6 py-4">Operation</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentEvents.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => onNavigate('event_detail', ev.id)}>
                        <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{ev.id.slice(0, 16)}...</td>
                        <td className="px-6 py-4 font-black">{ev.type}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(ev.timestamp).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><Badge status={ev.status}>{ev.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListView = ({ title, type, onNavigate }: { title: string, type: 'anchors' | 'events', onNavigate: (p: string, id?: string) => void }) => {
  const data = useMemo(() => type === 'anchors' ? generateMockAnchors(50) : generateMockEvents(50), [type]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentItems = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{title}</h1>
          <p className="text-slate-400 text-[11px] font-bold mt-1">Real-time Setu stream index</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 text-[10px] font-black text-slate-700 uppercase">Page {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-b-4 border-b-slate-200">
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
            {currentItems.map((item: any) => (
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
      </div>
    </div>
  );
};

const EcosystemList = () => {
  const validators = Array.from({ length: 10 }).map((_, i) => ({ id: `vld-${i + 1}`, status: 'online', stake: 10000 + i * 500, uptime: 99.8 - i * 0.1, address: `0xval_${i}` }));
  const solvers = Array.from({ length: 15 }).map((_, i) => ({ id: `slv-${i + 1}`, status: 'active', load: 30 + i * 4, success: 99.5, address: `0xsolv_${i}` }));

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Validators Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Validators</h1>
            <p className="text-slate-400 text-[11px] font-bold mt-1">Network infrastructure nodes</p>
          </div>
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg">
            TOTAL: {validators.length} ACTIVE
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-b-4 border-b-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="px-6 py-5">Node Identity</th>
                <th className="px-6 py-5">Operational Status</th>
                <th className="px-6 py-5">Linked Wallet</th>
                <th className="px-6 py-5">Staked Commitment</th>
                <th className="px-6 py-5">Node Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validators.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{item.id}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 font-black uppercase text-[10px] ${item.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{item.address}</td>
                  <td className="px-6 py-4 font-black text-slate-800">{item.stake.toLocaleString()} <span className="text-indigo-500">FLUX</span></td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">{item.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solvers Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Solvers</h1>
            <p className="text-slate-400 text-[11px] font-bold mt-1">Computational execution nodes</p>
          </div>
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg">
            TOTAL: {solvers.length} ACTIVE
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-b-4 border-b-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="px-6 py-5">Node Identity</th>
                <th className="px-6 py-5">Operational Status</th>
                <th className="px-6 py-5">Linked Wallet</th>
                <th className="px-6 py-5">Processing Load</th>
                <th className="px-6 py-5">Success Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {solvers.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{item.id}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 font-black uppercase text-[10px] ${item.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'active' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{item.address}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${item.load}%` }}></div>
                      </div>
                      <span className="font-bold text-slate-600">{item.load}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">{item.success}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({ query, onNavigate }: { query: string, onNavigate: (p: string, id?: string) => void }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Search Results</h2>
        <p className="text-slate-400 text-sm font-medium mt-1">Showing partial matches for: <span className="text-indigo-600 font-mono">"{query}"</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => onNavigate('account_detail', query)}>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Match</p>
            <h4 className="font-black text-slate-900">{query.slice(0, 16)}...</h4>
            <p className="text-xs text-slate-500 mt-1">Click to view balance and event history.</p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => onNavigate('event_detail', `ev_${query}`)}>
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
    </div>
  );
};

const Footer = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
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

// --- Landing Page ---

const TechnicalSpec = ({ number, title, desc, tag }: any) => (
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

const LandingPage = ({ onNavigate }: { onNavigate: (p: string) => void }) => {
  return (
    <div className="bg-white min-h-screen selection:bg-indigo-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 border-b border-slate-100 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
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

            {/* Right Visual: Immersive Background Integration */}
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

                {/* Subtle highlight orb */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specification Section */}
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
          <TechnicalSpec
            number="01"
            tag="DAG Fabric"
            title="Asynchronous Causality"
            desc="Shattering sequential bottlenecks. Each event transition centers on parent-child lineage, enabling massive parallel state processing without central locks."
          />
          <TechnicalSpec
            number="02"
            tag="VLC Sync"
            title="Vector Logical Clocks"
            desc="Deterministic ordering in an asynchronous world. VLC provides precise partial ordering for cross-subnet events with sub-millisecond overhead."
          />
          <TechnicalSpec
            number="03"
            tag="TEE Compute"
            title="Silicon-Level Integrity"
            desc="Validator nodes operate within Trusted Execution Environments, ensuring hardware-verified execution for complex causal flows."
          />
          <TechnicalSpec
            number="04"
            tag="Global Anchor"
            title="Deterministic Finality"
            desc="Periodic Anchors solidify the state, condensing the DAG into immutable truth points for optimized history synchronization."
          />
        </div>
      </section>

      {/* Hybrid Architecture: DAG + Anchor */}
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

      {/* VLC Section: Precision Tracking */}
      <section className="bg-slate-50 py-32 border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8 space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-mono font-bold text-indigo-600 uppercase tracking-[0.4em]">Vector Logical Clocks</h2>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight italic">The Pulse of Digital Causality.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Precise Relation",
                desc: "Accurately judge the happens-before relationship between any two events in a distributed environment.",
                icon: Clock3
              },
              {
                title: "Conflict Detection",
                desc: "Automatically identify concurrent events to prevent state conflicts and ensure deterministic outcomes.",
                icon: ShieldCheck
              },
              {
                title: "Global Alignment",
                desc: "Unified event ordering by merging logical clocks with high-resolution physical timestamps.",
                icon: MapPin
              },
              {
                title: "Deep Traceability",
                desc: "Trace the complete causal chain of any specific event back to its origin across the entire mesh.",
                icon: History
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-400 transition-all">
                <div className="text-indigo-600"><feature.icon size={20} /></div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{feature.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Section: Three-Layer Design */}
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

// --- Main App ---

const App = () => {
  const [currentPath, setCurrentPath] = useState('landing');
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handleNavigate = (path: string, id?: string) => {
    setCurrentPath(path);
    setSelectedId(id);
    window.scrollTo(0, 0);
  };

  const renderContent = () => {
    switch (currentPath) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'anchors':
        return <ListView title="anchors" type="anchors" onNavigate={handleNavigate} />;
      case 'events':
        return <ListView title="events" type="events" onNavigate={handleNavigate} />;
      case 'anchor_detail':
        return <AnchorDetail anchorId={selectedId || 'anchor_setu_default'} onNavigate={handleNavigate} />;
      case 'event_detail':
        return <EventDetail eventId={selectedId || 'ev_setu_default'} onNavigate={handleNavigate} />;
      case 'account_detail':
        return <AccountDetail address={selectedId || 'alice_wallet'} onNavigate={handleNavigate} />;
      case 'validators':
        return <EcosystemList />;
      case 'search_results':
        return <SearchResults query={selectedId || ''} onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      <Navbar onNavigate={handleNavigate} currentPath={currentPath} />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-10 min-h-[70vh]">
        {renderContent()}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
