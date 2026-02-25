import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll, useSpring } from 'framer-motion';

const VERT = `
uniform float uTime;
uniform float uProgress;
uniform vec2 uMouseNDC;
uniform vec2 uSmoothMouse;
uniform float uMouseInfluence;
attribute vec3 aTarget;
attribute vec3 aColor;
attribute float aSize;
varying vec3 vColor;

void main() {
    vec3 pos = position;
    float alive = 1.0 - uProgress;

    // === 1. IDLE WAVE ===
    float waveAmp = 0.05 + uMouseInfluence * 0.03 * alive;
    float waveSpeed = 0.5 + uMouseInfluence * 0.12;
    pos.x += sin(uTime * waveSpeed + pos.y * 2.0) * waveAmp;
    pos.y += cos(uTime * (waveSpeed * 0.6) + pos.z * 2.0) * waveAmp;
    pos.z += sin(uTime * (waveSpeed * 0.8) + pos.x * 2.0) * waveAmp * 0.5;

    // === 2. GLOBAL DRAG ===
    float dragStrength = uMouseInfluence * 0.10 * alive;
    pos.x += uSmoothMouse.x * dragStrength;
    pos.y += uSmoothMouse.y * dragStrength;

    // === 3. SCROLL DISPERSAL ===
    vec3 finalPos = mix(pos, aTarget, uProgress);
    vec4 mvPos = modelViewMatrix * vec4(finalPos, 1.0);
    vec4 clipPos = projectionMatrix * mvPos;

    // === 4. LOCAL GLOW ===
    vec2 particleNDC = clipPos.xy / clipPos.w;
    float screenDist = distance(particleNDC, uMouseNDC);
    float localProx = smoothstep(0.4, 0.0, screenDist) * alive;

    float j = localProx * 0.03;
    finalPos.x += sin(uTime * 12.0 + position.y * 30.0) * j;
    finalPos.y += cos(uTime * 15.6 + position.z * 30.0) * j;

    mvPos = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // === 5. COLOR ===
    float globalBright = uMouseInfluence * 0.12 * alive;
    float localBright = localProx * 0.6;
    vColor = mix(aColor, vec3(1.0), globalBright + localBright);

    // === 6. SIZE ===
    float boost = 1.0 + localProx * 1.0 + uMouseInfluence * 0.15 * alive;
    gl_PointSize = aSize * (15.0 / -mvPos.z) * mix(1.0, 1.5, uProgress) * boost;
}
`;

const FRAG = `
uniform float uProgress;
varying vec3 vColor;
void main() {
    vec2 c = gl_PointCoord.xy - vec2(0.5);
    float r = length(c);
    if (r > 0.5) discard;
    float alpha = smoothstep(0.5, 0.35, r);
    float opacity = mix(1.0, 0.08, uProgress);
    gl_FragColor = vec4(vColor, alpha * opacity);
}
`;

interface ParticleSphereProps {
    particleCount?: number;
    staticMode?: boolean; // When true: no scroll dispersal, no mouse interaction
}

export const ParticleSphere = ({ particleCount = 15000, staticMode = false }: ParticleSphereProps) => {
    const pointsRef = useRef<THREE.Points>(null);
    const { viewport, camera } = useThree();

    const mouseNDC = useRef({ x: 0, y: 0 });
    const smoothMouse = useRef({ x: 0, y: 0 });
    const mouseInfluence = useRef(0);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    const { scrollYProgress } = useScroll();
    const smoothScroll = useSpring(scrollYProgress, { damping: 20, stiffness: 100, mass: 0.5 });

    const [positions, targets, colors, sizes] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const tar = new Float32Array(particleCount * 3);
        const col = new Float32Array(particleCount * 3);
        const sz = new Float32Array(particleCount);
        const radius = 2.0;
        const cTop = new THREE.Color('#f8fafc');
        const cMid = new THREE.Color('#38bdf8');
        const cBot = new THREE.Color('#1e40af');

        for (let i = 0; i < particleCount; i++) {
            const u = Math.random(), v = Math.random();
            const theta = u * 2 * Math.PI;
            const phi = Math.acos(2 * v - 1);
            const r = radius + (Math.random() - 0.5) * 0.2;
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
            tar[i * 3] = (Math.random() - 0.5) * 40;
            tar[i * 3 + 1] = (Math.random() - 0.5) * 40;
            tar[i * 3 + 2] = (Math.random() - 0.5) * 40;
            let c = new THREE.Color();
            if (phi < Math.PI / 2) c.copy(cTop).lerp(cMid, phi / (Math.PI / 2));
            else c.copy(cMid).lerp(cBot, (phi - Math.PI / 2) / (Math.PI / 2));
            c.lerp(new THREE.Color('#ffffff'), Math.random() * 0.3);
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
            sz[i] = Math.random() * 2.0 + 0.5;
        }
        return [pos, tar, col, sz];
    }, []);

    // Create material ONCE with useMemo — avoids R3F prop reconciliation overwriting uniforms
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            uniforms: {
                uTime: { value: 0 },
                uProgress: { value: 0 },
                uMouseNDC: { value: new THREE.Vector2(10, 10) },
                uSmoothMouse: { value: new THREE.Vector2(0, 0) },
                uMouseInfluence: { value: 0 },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;

        material.uniforms.uTime.value = state.clock.elapsedTime;

        if (staticMode) {
            // Dispersed starfield mode: particles frozen at their aTarget scatter positions
            material.uniforms.uProgress.value = 1.0;
            material.uniforms.uMouseInfluence.value = 0;
            material.uniforms.uMouseNDC.value.set(10, 10);
            material.uniforms.uSmoothMouse.value.set(0, 0);
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
            pointsRef.current.rotation.x = state.clock.elapsedTime * 0.008;
            return;
        }

        const prog = Math.pow(Math.min(smoothScroll.get() * 2.5, 1.0), 1.5);
        material.uniforms.uProgress.value = prog;

        // Gentle rotation
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;

        // Mouse influence calculation
        const sphereCenterNDC = { x: 0, y: 0.1 };
        const dx = mouseNDC.current.x - sphereCenterNDC.x;
        const dy = mouseNDC.current.y - sphereCenterNDC.y;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        const inf = Math.max(0, 1 - distFromCenter / 0.8);
        const target = Math.min(inf * inf, 1);
        mouseInfluence.current += (target - mouseInfluence.current) * 0.03;

        // Smooth mouse with spring damping
        smoothMouse.current.x += (mouseNDC.current.x - smoothMouse.current.x) * 0.06;
        smoothMouse.current.y += (mouseNDC.current.y - smoothMouse.current.y) * 0.06;

        // Set uniforms
        material.uniforms.uMouseNDC.value.set(mouseNDC.current.x, mouseNDC.current.y);
        material.uniforms.uSmoothMouse.value.set(smoothMouse.current.x, smoothMouse.current.y);
        material.uniforms.uMouseInfluence.value = mouseInfluence.current;

        // Subtle parallax
        const px = (mouseNDC.current.x * viewport.width) / 100;
        const py = (mouseNDC.current.y * viewport.height) / 100;
        camera.position.x += (px - camera.position.x) * 0.05;
        camera.position.y += (-py - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
    });

    return (
        <points ref={pointsRef} material={material}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aTarget" count={targets.length / 3} array={targets} itemSize={3} />
                <bufferAttribute attach="attributes-aColor" count={colors.length / 3} array={colors} itemSize={3} />
                <bufferAttribute attach="attributes-aSize" count={sizes.length} array={sizes} itemSize={1} />
            </bufferGeometry>
        </points>
    );
};
