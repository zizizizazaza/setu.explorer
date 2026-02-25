import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Same shaders as ParticleSphere but without scroll/mouse/opacity-fade
const VERT = `
attribute vec3 aColor;
attribute float aSize;
varying vec3 vColor;

void main() {
    vColor = aColor;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = aSize * (22.0 / -mvPos.z);
}
`;

const FRAG = `
varying vec3 vColor;
void main() {
    vec2 c = gl_PointCoord.xy - vec2(0.5);
    float r = length(c);
    if (r > 0.5) discard;
    float alpha = smoothstep(0.5, 0.35, r);
    gl_FragColor = vec4(vColor, alpha);
}
`;

const ScatteredParticles = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const COUNT = 2000;

    // Generate particles at fully-scattered positions (same as ParticleSphere's aTarget)
    const [positions, colors, sizes] = useMemo(() => {
        const pos = new Float32Array(COUNT * 3);
        const col = new Float32Array(COUNT * 3);
        const sz = new Float32Array(COUNT);

        // Same color palette as ParticleSphere
        const cTop = new THREE.Color('#f8fafc');
        const cMid = new THREE.Color('#38bdf8');
        const cBot = new THREE.Color('#1e40af');

        for (let i = 0; i < COUNT; i++) {
            // Scattered across a wide field (same range as aTarget in ParticleSphere)
            pos[i * 3] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40;

            // Same color gradient logic as ParticleSphere
            const phi = Math.acos(2 * Math.random() - 1);
            let c = new THREE.Color();
            if (phi < Math.PI / 2) c.copy(cTop).lerp(cMid, phi / (Math.PI / 2));
            else c.copy(cMid).lerp(cBot, (phi - Math.PI / 2) / (Math.PI / 2));
            c.lerp(new THREE.Color('#ffffff'), Math.random() * 0.3);
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;

            // Same size distribution
            sz[i] = Math.random() * 3.5 + 1.0;
        }
        return [pos, col, sz];
    }, []);

    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    }), []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        // Very slow rotation — same feel as landing page
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        pointsRef.current.rotation.x = state.clock.elapsedTime * 0.008;
    });

    return (
        <points ref={pointsRef} material={material}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aColor" count={COUNT} array={colors} itemSize={3} />
                <bufferAttribute attach="attributes-aSize" count={COUNT} array={sizes} itemSize={1} />
            </bufferGeometry>
        </points>
    );
};

export const Starfield = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ScatteredParticles />
        </Canvas>
    </div>
);
