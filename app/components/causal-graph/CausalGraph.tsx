import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
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
    const x = (normalizedDepth - 0.5) * 16 + (Math.random() - 0.5) * 5;


    const angle = (indexInBucket / Math.max(bucketSize, 1)) * Math.PI * 2 + Math.random();
    const radius = 1.5 + bucketSize * 0.2 + Math.random() * 3.0;
    const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
    const z = Math.cos(angle) * radius * 0.8 + (Math.random() - 0.5) * 3;


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



function generateMockData(count: number): { nodes: NodeData[], edges: DagEdge[] } {
  const types = ['Transfer', 'System', 'Task'];
  const baseNodes: DagNode[] = [];
  const edges: DagEdge[] = [];

  for (let i = 0; i < count; i++) {
    baseNodes.push({
      id: `ev_${i}`,
      event_id: `ev_${i}`,
      depth: Math.floor(i / 10), // group into layers
      size: Math.random() * 20 + 10,
      type: types[Math.floor(Math.random() * 3)],
      label: `E-${i}`,
      color: '#6366f1',
      status: 'success',
      timestamp: Date.now(),
      creator: 'mock_creator',
      vlc_time: 0
    });

    // Create edges to previous layer to form a DAG
    if (i > 0) {
      const prevLayerNodes = baseNodes.filter(n => n.depth === baseNodes[i].depth - 1);
      if (prevLayerNodes.length > 0) {
        // connect to 1 or 2 random nodes in previous layer
        const numEdges = Math.random() > 0.5 ? 2 : 1;
        for (let e = 0; e < numEdges; e++) {
          const target = prevLayerNodes[Math.floor(Math.random() * prevLayerNodes.length)];
          edges.push({ from: target.id, to: `ev_${i}`, type: 'causal' });
        }
      } else if (baseNodes[i].depth === 0 && i > 0) {
        edges.push({ from: `ev_0`, to: `ev_${i}`, type: 'causal' });
      }
    }
  }

  return { nodes: layoutNodes(baseNodes), edges };
}



export const getNodePos = (n: NodeData, t: number): [number, number, number] => {
  const amp = 0.4;
  return [
    n.x + Math.sin(t * 0.2 + n.seedX) * amp,
    n.y + Math.cos(t * 0.3 + n.seedY) * amp,
    n.z + Math.sin(t * 0.4 + n.seedZ) * amp
  ];
};

interface FloatingNodeProps {
  node: NodeData;
  isSelected: boolean;
  isRelated: boolean;
  isDimmed: boolean;
  flashTime: number; // clock time when flash triggered, 0 = no flash
  onClick: () => void;
  onNavigate: (p: string, id?: string) => void;
}

const FloatingNode: React.FC<FloatingNodeProps> = ({ node, isSelected, isRelated, isDimmed, flashTime, onClick, onNavigate }) => {
  const [hovered, setHover] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      const [px, py, pz] = getNodePos(node, t);
      groupRef.current.position.set(px, py, pz);

      // Flash scale burst: quick expand then return
      const flashAge = flashTime > 0 ? t - flashTime : 999;
      const flashScale = flashAge < 0.6 ? 1 + Math.max(0, 1 - flashAge / 0.6) * 0.8 : 1;
      groupRef.current.scale.setScalar(flashScale);
    }
    if (matRef.current) {
      const t = state.clock.elapsedTime;
      const flashAge = flashTime > 0 ? t - flashTime : 999;

      if (flashAge < 0.8) {
        // Flash: bright white → back to normal
        const flashIntensity = Math.max(0, 1 - flashAge / 0.8);
        matRef.current.emissiveIntensity = 1.5 + flashIntensity * 8;
        matRef.current.emissive.set(flashIntensity > 0.5 ? '#ffffff' : '#3b82f6');
        matRef.current.color.set(flashIntensity > 0.3 ? '#ffffff' : (isSelected ? '#22d3ee' : '#a5b4fc'));
      } else {
        // Normal flicker / twinkle effect
        const flicker = 0.8 + Math.sin(t * 4 + node.seedX * 10) * 0.2
          + Math.sin(t * 7.3 + node.seedY * 5) * 0.15;
        matRef.current.emissiveIntensity = isSelected ? 3 : flicker * 1.5;
        matRef.current.emissive.set(isSelected ? '#22d3ee' : '#818cf8');
        matRef.current.color.set(isSelected ? '#22d3ee' : '#a5b4fc');
      }
    }
    if (coreRef.current) {
      const t = state.clock.elapsedTime;
      const flashAge = flashTime > 0 ? t - flashTime : 999;
      coreRef.current.opacity = flashAge < 0.5 ? 1 : (isDimmed ? 0.1 : 0.85);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color={isSelected ? "#22d3ee" : "#a5b4fc"}
          emissive={isSelected ? "#22d3ee" : "#818cf8"}
          emissiveIntensity={1.5}
          transparent
          opacity={isDimmed ? 0.3 : 1}
        />
        {/* White core */}
        <mesh>
          <sphereGeometry args={[node.size * 0.5, 12, 12]} />
          <meshBasicMaterial
            ref={coreRef}
            color="#ffffff"
            transparent
            opacity={isDimmed ? 0.1 : 0.85}
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



const DriftingLine: React.FC<{ n1: NodeData; n2: NodeData; isHighlighted: boolean }> = ({ n1, n2, isHighlighted }) => {
  const lineRef = useRef<any>(null);
  const color = isHighlighted ? "#22d3ee" : "#6366f1";
  const opacity = isHighlighted ? 0.9 : 0.12;
  const lineWidth = isHighlighted ? 2 : 0.8;

  useFrame((state) => {
    if (lineRef.current && lineRef.current.geometry) {
      const t = state.clock.elapsedTime;
      lineRef.current.geometry.setPositions([...getNodePos(n1, t), ...getNodePos(n2, t)]);
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[[0, 0, 0], [0, 0, 0]]}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
    />
  );
};

const DagConnections = ({ nodes, edges, selectedId }: { nodes: NodeData[]; edges: DagEdge[]; selectedId: string | null }) => {
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const connections = useMemo(() => {
    if (edges.length > 0) {
      return edges.map(e => {
        const from = nodeMap.get(e.from);
        const to = nodeMap.get(e.to);
        if (!from || !to) return null;
        const isHighlighted = selectedId ? (e.from === selectedId || e.to === selectedId) : false;
        return { n1: from, n2: to, isHighlighted };
      }).filter(Boolean) as Array<{ n1: NodeData; n2: NodeData; isHighlighted: boolean }>;
    }

    const conns: Array<{ n1: NodeData; n2: NodeData; isHighlighted: boolean }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 4) {
          const isHighlighted = selectedId ? (nodes[i].id === selectedId || nodes[j].id === selectedId) : false;
          conns.push({ n1: nodes[i], n2: nodes[j], isHighlighted });
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
        return <DriftingLine key={i} n1={conn.n1} n2={conn.n2} isHighlighted={conn.isHighlighted} />;
      })}
    </group>
  );
};



// An ultra-sleek, mathematically perfect "Laser Comet"
// Eliminates all "caterpillar" overlap artifacts by using exactly the minimum required vertices.
const LightningBolt: React.FC<{ pathIds: string[]; nodeMap: Map<string, NodeData>; onDone: () => void; onNodeFlash: (nodeId: string, time: number) => void }> = ({ pathIds, nodeMap, onDone, onNodeFlash }) => {
  const headRef = useRef<THREE.Group>(null);
  const trailRef = useRef<any>(null);
  const glowTrailRef = useRef<any>(null);

  const progressRef = useRef(0);
  const fadeRef = useRef(1);
  const doneRef = useRef(false);
  const firedNodesRef = useRef(new Set<number>());

  const SPEED = 1.0;       // Swift laser speed
  const FADE_SPEED = 3.0;  // Fast crisp fade
  const TAIL_LEN = 0.5;    // Long elegant tail

  const cTrailCore = useMemo(() => new THREE.Color('#ffffff'), []);
  const cTrailGlow = useMemo(() => new THREE.Color('#06b6d4').multiplyScalar(1.5), []);
  const cTrailOuter = useMemo(() => new THREE.Color('#6366f1'), []);

  useFrame((state, delta) => {
    if (doneRef.current) return;
    const time = state.clock.elapsedTime;

    if (progressRef.current < 1.0) {
      progressRef.current = Math.min(progressRef.current + delta * SPEED, 1.0);
    } else {
      fadeRef.current = Math.max(fadeRef.current - delta * FADE_SPEED, 0);
      if (fadeRef.current <= 0) {
        doneRef.current = true;
        onDone();
        return;
      }
    }

    const H = progressRef.current;
    const T = Math.max(0, H - TAIL_LEN);

    for (let i = 0; i < pathIds.length; i++) {
      const nodeFrac = pathIds.length > 1 ? i / (pathIds.length - 1) : 0;
      if (H >= nodeFrac && !firedNodesRef.current.has(i)) {
        firedNodesRef.current.add(i);
        onNodeFlash(pathIds[i], time);
      }
    }

    const pts = pathIds.map(id => {
      const n = nodeMap.get(id);
      if (!n) return new THREE.Vector3();
      const [x, y, z] = getNodePos(n, time);
      return new THREE.Vector3(x, y, z);
    });

    if (pts.length < 2) return;

    let totalLen = 0;
    const segLens = [];
    for (let i = 1; i < pts.length; i++) {
      const d = pts[i - 1].distanceTo(pts[i]);
      segLens.push(d);
      totalLen += d;
    }

    const getPointAtFrac = (f: number) => {
      if (f <= 0) return pts[0].clone();
      if (f >= 1) return pts[pts.length - 1].clone();
      const targetDist = f * totalLen;
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = segLens[i - 1];
        if (acc + d >= targetDist) {
          const ratio = d > 0 ? (targetDist - acc) / d : 0;
          return pts[i - 1].clone().lerp(pts[i], ratio);
        }
        acc += d;
      }
      return pts[pts.length - 1].clone();
    };

    const currentHeadPos = getPointAtFrac(H);

    if (headRef.current) {
      headRef.current.position.copy(currentHeadPos);
      headRef.current.scale.setScalar(fadeRef.current);
    }

    // Mathematically exact minimal vertices to avoid overlapping Line joints
    const trailPositions: number[] = [];
    const pTail = getPointAtFrac(T);
    trailPositions.push(pTail.x, pTail.y, pTail.z);

    const targetTailDist = T * totalLen;
    const targetHeadDist = H * totalLen;
    let acc = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      acc += segLens[i - 1];
      // Only include nodes that are strictly between the tail and head
      if (acc > targetTailDist && acc < targetHeadDist) {
        trailPositions.push(pts[i].x, pts[i].y, pts[i].z);
      }
    }

    trailPositions.push(currentHeadPos.x, currentHeadPos.y, currentHeadPos.z);

    const currentOpacity = fadeRef.current * (0.8 + Math.random() * 0.2);

    if (trailRef.current && trailRef.current.geometry) {
      trailRef.current.geometry.setPositions(trailPositions);
      trailRef.current.material.opacity = currentOpacity;
    }
    if (glowTrailRef.current && glowTrailRef.current.geometry) {
      glowTrailRef.current.geometry.setPositions(trailPositions);
      glowTrailRef.current.material.opacity = currentOpacity * 0.5;
    }
  });

  const dummy = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0.01)];

  return (
    <group>
      {/* Outer Glow Trail */}
      <Line ref={glowTrailRef} points={dummy} color={cTrailOuter} lineWidth={10} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      {/* Inner Bright Trail */}
      <Line ref={trailRef} points={dummy} color={cTrailGlow} lineWidth={3} transparent blending={THREE.AdditiveBlending} depthWrite={false} />

      {/* Pristine Comet Head */}
      <group ref={headRef}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};


const CurrentPathEffect = ({ nodes, edges, onNodeFlash }: { nodes: NodeData[]; edges: DagEdge[]; onNodeFlash: (nodeId: string, time: number) => void }) => {
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);
  const [bolts, setBolts] = useState<{ id: number; pathIds: string[] }[]>([]);
  const boltIdRef = useRef(0);

  useEffect(() => {
    if (nodes.length === 0 || edges.length === 0) return;

    const generatePath = (): string[] => {
      const validNodes = nodes.filter(n => edges.some(e => e.from === n.id || e.to === n.id));
      if (validNodes.length === 0) return [];

      let currentId = validNodes[Math.floor(Math.random() * validNodes.length)].id;
      const path: string[] = [];
      const visited = new Set<string>();

      for (let i = 0; i < 3; i++) {
        if (!nodeMap.has(currentId)) break;
        path.push(currentId);
        visited.add(currentId);

        const nextEdges = edges.filter(e => e.from === currentId || e.to === currentId);
        const validNext = nextEdges
          .map(e => e.from === currentId ? e.to : e.from)
          .filter(id => !visited.has(id));

        if (validNext.length === 0) break;
        currentId = validNext[Math.floor(Math.random() * validNext.length)];
      }
      return path;
    };

    const fire = () => {
      const path = generatePath();
      if (path.length >= 2) {
        const id = boltIdRef.current++;
        setBolts(prev => [...prev, { id, pathIds: path }]);
      }
    };

    fire();
    // Fire a new bolt every 1.5-2.5s (randomized)
    const interval = setInterval(fire, 1500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [nodes, edges, nodeMap]);

  const removeBolt = (id: number) => {
    setBolts(prev => prev.filter(b => b.id !== id));
  };

  return (
    <group>
      {bolts.map(b => (
        <LightningBolt key={b.id} pathIds={b.pathIds} nodeMap={nodeMap} onDone={() => removeBolt(b.id)} onNodeFlash={onNodeFlash} />
      ))}
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
  const [flashTimes, setFlashTimes] = useState<Map<string, number>>(new Map());

  const handleNodeFlash = useCallback((nodeId: string, time: number) => {
    setFlashTimes(prev => {
      const next = new Map(prev);
      next.set(nodeId, time);
      return next;
    });
  }, []);

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
          const mock = generateMockData(60);
          setNodes(mock.nodes);
          setEdges(mock.edges);
          setIsLive(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        const mock = generateMockData(60);
        setNodes(mock.nodes);
        setEdges(mock.edges);
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
            camera={{ position: [0, 0, 16], fov: 45 }}
            onPointerMissed={() => setSelectedId(null)}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          >
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={2.5} color="#22d3ee" />
            <pointLight position={[-10, -10, -10]} intensity={1.5} color="#818cf8" />
            <directionalLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />

            <group>
              <DagConnections nodes={nodes} edges={edges} selectedId={selectedId} />
              <CurrentPathEffect nodes={nodes} edges={edges} onNodeFlash={handleNodeFlash} />
              <DistantNodes />
              {nodes.map((node) => (
                <FloatingNode
                  key={node.id}
                  node={node}
                  isSelected={selectedId === node.id}
                  isRelated={highlightedData.nodeIds.has(node.id)}
                  isDimmed={!!selectedId && !highlightedData.nodeIds.has(node.id)}
                  flashTime={flashTimes.get(node.id) || 0}
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
