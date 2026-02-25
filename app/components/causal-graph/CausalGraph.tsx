import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { GitBranch } from 'lucide-react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Billboard, PointMaterial, Points, Line, OrbitControls } from '@react-three/drei';
import { fetchDagLive } from '../../api';
import type { DagNode, DagEdge } from '../../api/types';

interface NodeData {
  id: string;
  eventId: string;
  x: number;
  y: number;
  z: number;
  size: number;
  seedX: number;
  seedY: number;
  seedZ: number;
  type: string;
  label: string;
  color: string;
}



function layoutNodes(apiNodes: DagNode[]): NodeData[] {
  if (apiNodes.length === 0) return [];

  const minDepth = Math.min(...apiNodes.map(n => n.depth));
  const maxDepth = Math.max(...apiNodes.map(n => n.depth));
  const depthSpan = Math.max(maxDepth - minDepth, 1);


  const depthBuckets = new Map<number, DagNode[]>();
  apiNodes.forEach(n => {
    const list = depthBuckets.get(n.depth) || [];
    list.push(n);
    depthBuckets.set(n.depth, list);
  });

  return apiNodes.map((n) => {
    const bucket = depthBuckets.get(n.depth)!;
    const indexInBucket = bucket.indexOf(n);
    const bucketSize = bucket.length;


    const normalizedDepth = (n.depth - minDepth) / depthSpan;
    const x = (normalizedDepth - 0.5) * 12;


    const angle = (indexInBucket / Math.max(bucketSize, 1)) * Math.PI * 2;
    const radius = 1.2 + bucketSize * 0.15;
    const y = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius * 0.6;


    const baseSize = Math.max(n.size, 5);
    const sphereSize = 0.04 + (baseSize / 30) * 0.08;

    return {
      id: n.id,
      eventId: n.event_id,
      x,
      y,
      z,
      size: sphereSize,
      seedX: Math.random() * 100,
      seedY: Math.random() * 100,
      seedZ: Math.random() * 100,
      type: n.type,
      label: n.label || n.id,
      color: n.color || '#818cf8',
    };
  });
}



function generateMockNodes(count: number): NodeData[] {
  const types = ['Transfer', 'System', 'Task'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `ev_${i}`,
    eventId: `ev_${i}`,
    x: (Math.random() - 0.5) * 12,
    y: (Math.random() - 0.5) * 8,
    z: (Math.random() - 0.5) * 6,
    size: 0.04 + Math.random() * 0.08,
    seedX: Math.random() * 100,
    seedY: Math.random() * 100,
    seedZ: Math.random() * 100,
    type: types[Math.floor(Math.random() * 3)],
    label: `ev_${i}`,
    color: '#6366f1',
  }));
}



interface FloatingNodeProps {
  node: NodeData;
  isSelected: boolean;
  isRelated: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onNavigate: (p: string, id?: string) => void;
}

const FloatingNode: React.FC<FloatingNodeProps> = ({ node, isSelected, isRelated, isDimmed, onClick, onNavigate }) => {
  const [hovered, setHover] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && !isRelated) {
      const t = state.clock.elapsedTime * 0.4;
      groupRef.current.position.x = node.x + Math.sin(t + node.seedX) * 0.4;
      groupRef.current.position.y = node.y + Math.cos(t * 0.7 + node.seedY) * 0.4;
      groupRef.current.position.z = node.z + Math.sin(t * 1.2 + node.seedZ) * 0.4;
    } else if (groupRef.current && isRelated) {
      groupRef.current.position.set(node.x, node.y, node.z);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#22d3ee" : "#818cf8"}
          emissive={isSelected ? "#22d3ee" : "#6366f1"}
          emissiveIntensity={isSelected ? 3 : 1.5}
          transparent
          opacity={isDimmed ? 0.3 : 1}
        />
        {/* Core highlight core for more punch */}
        <mesh>
          <sphereGeometry args={[node.size * 0.7, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={isDimmed ? 0.1 : 0.8}
            depthWrite={false}
          />
        </mesh>
        {/* Adds a soft glowing halo around nodes */}
        <mesh>
          <sphereGeometry args={[node.size * 1.8, 16, 16]} />
          <meshBasicMaterial
            color={isSelected ? "#22d3ee" : "#818cf8"}
            transparent
            opacity={isDimmed ? 0.05 : 0.3}
            depthWrite={false}
          />
        </mesh>
        <Billboard>
          <Html distanceFactor={10}>
            <div className={`transition-all duration-500 flex flex-col items-center pointer-events-none ${isDimmed ? 'opacity-0' : 'opacity-100'}`}>
              {(hovered || isRelated) && (
                <div className="mt-10 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <span
                    className={`text-[9px] font-black text-white px-3 py-1.5 rounded-md cursor-pointer pointer-events-auto transition-all ${isSelected ? 'bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.6)]' : 'bg-black/80 border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md'}`}
                    onClick={(e) => { e.stopPropagation(); onNavigate('event_detail', node.eventId); }}
                  >
                    {node.label}
                  </span>
                  <span className="text-[7px] text-indigo-300 font-black uppercase mt-1 tracking-[0.3em] bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">{node.type}</span>
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
      <PointMaterial transparent color="#a5b4fc" size={0.08} sizeAttenuation={true} depthWrite={false} opacity={0.6} blending={THREE.AdditiveBlending} />
    </Points>
  );
};



const DagConnections = ({ nodes, edges, selectedId }: { nodes: NodeData[]; edges: DagEdge[]; selectedId: string | null }) => {
  const nodeMap = useMemo(() => {
    const m = new Map<string, NodeData>();
    nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [nodes]);

  const connections = useMemo(() => {

    if (edges.length > 0) {
      return edges.map(e => {
        const from = nodeMap.get(e.from);
        const to = nodeMap.get(e.to);
        if (!from || !to) return null;
        const isHighlighted = selectedId ? (e.from === selectedId || e.to === selectedId) : false;
        return {
          p1: new THREE.Vector3(from.x, from.y, from.z),
          p2: new THREE.Vector3(to.x, to.y, to.z),
          isHighlighted
        };
      }).filter(Boolean) as Array<{ p1: THREE.Vector3; p2: THREE.Vector3; isHighlighted: boolean }>;
    }


    const conns: Array<{ p1: THREE.Vector3; p2: THREE.Vector3; isHighlighted: boolean }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4) {
          const isHighlighted = selectedId ? (nodes[i].id === selectedId || nodes[j].id === selectedId) : false;
          conns.push({
            p1: new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z),
            p2: new THREE.Vector3(nodes[j].x, nodes[j].y, nodes[j].z),
            isHighlighted
          });
        }
      }
    }
    return conns;
  }, [nodes, edges, selectedId, nodeMap]);

  return (
    <group>
      {connections.map((conn, i) => {
        const visible = !selectedId || conn.isHighlighted;
        if (!visible) return null;
        return (
          <Line
            key={i}
            points={[conn.p1, conn.p2]}
            color={conn.isHighlighted ? "#22d3ee" : "#818cf8"}
            lineWidth={conn.isHighlighted ? 3 : 1}
            transparent
            opacity={conn.isHighlighted ? 0.9 : 0.15}
            blending={THREE.AdditiveBlending}
          />
        );
      })}
    </group>
  );
};



interface CausalGraphProps {
  onNavigate: (p: string, id?: string) => void;
}

export const CausalGraph = ({ onNavigate }: CausalGraphProps) => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<DagEdge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchDagLive({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        if (res.nodes.length > 0) {
          setNodes(layoutNodes(res.nodes));
          setEdges(res.edges);
          setIsLive(true);
        } else {
          setNodes(generateMockNodes(60));
          setEdges([]);
          setIsLive(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setNodes(generateMockNodes(60));
        setEdges([]);
        setIsLive(false);
      });

    return () => { cancelled = true; };
  }, []);

  const highlightedData = useMemo(() => {
    if (!selectedId) return { nodeIds: new Set<string>() };
    const nodeIds = new Set<string>([selectedId]);

    if (edges.length > 0) {
      edges.forEach(e => {
        if (e.from === selectedId) nodeIds.add(e.to);
        if (e.to === selectedId) nodeIds.add(e.from);
      });
    } else {
      const selectedNode = nodes.find(n => n.id === selectedId);
      if (selectedNode) {
        nodes.forEach(n => {
          if (n.id === selectedId) return;
          const dx = n.x - selectedNode.x;
          const dy = n.y - selectedNode.y;
          const dz = n.z - selectedNode.z;
          if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 4) nodeIds.add(n.id);
        });
      }
    }
    return { nodeIds };
  }, [selectedId, nodes, edges]);

  return (
    <section className="bg-black/70 backdrop-blur-md rounded-[20px] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative h-[600px] flex flex-col group">
      {/* Sci-fi Central Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen opacity-70 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBINDBWMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMEg0MFY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] pointer-events-none opacity-50 mix-blend-screen" />

      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h3 className="font-black text-white flex items-center gap-2 text-xs tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          <GitBranch size={16} className="text-cyan-400" strokeWidth={2.5} />
          Live Causal Graph
        </h3>
        <p className="text-indigo-300 text-[10px] font-bold mt-1.5 uppercase tracking-widest drop-shadow-sm">
          {selectedId ? `Inspecting path: ${selectedId}` : "Sequence Map & Propagation"}
        </p>
      </div>

      <div className="absolute top-8 right-8 z-20 flex gap-4">
        {selectedId && (
          <button
            onClick={() => setSelectedId(null)}
            className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-cyan-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 hover:text-cyan-300 transition-all border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] pointer-events-auto"
          >
            Clear Target
          </button>
        )}
        <div className={`backdrop-blur-md px-3 py-1.5 rounded-lg border flex items-center gap-2 ${isLive ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${isLive ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,1)]'}`}></div>
          <span className={`text-[9px] font-black uppercase tracking-widest italic ${isLive ? 'text-emerald-400' : 'text-indigo-300'}`}>
            {isLive ? 'Live Sync' : 'Demo'}
          </span>
        </div>
      </div>

      <div className="w-full h-full cursor-grab active:cursor-grabbing relative z-0">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 10], fov: 40 }}
            onPointerMissed={() => setSelectedId(null)}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          >
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={2.5} color="#22d3ee" />
            <pointLight position={[-10, -10, -10]} intensity={1.5} color="#818cf8" />
            <directionalLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />

            <group>
              <DagConnections nodes={nodes} edges={edges} selectedId={selectedId} />
              <DistantNodes />
              {nodes.map((node) => (
                <FloatingNode
                  key={node.id}
                  node={node}
                  isSelected={selectedId === node.id}
                  isRelated={highlightedData.nodeIds.has(node.id)}
                  isDimmed={!!selectedId && !highlightedData.nodeIds.has(node.id)}
                  onClick={() => setSelectedId(node.id === selectedId ? null : node.id)}
                  onNavigate={onNavigate}
                />
              ))}
            </group>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate={!selectedId} autoRotateSpeed={1} />
          </Canvas>
        </Suspense>
      </div>
    </section>
  );
};
