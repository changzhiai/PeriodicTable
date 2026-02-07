import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Torus, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const SHELL_DISTANCE = 1.2;
const NUCLEUS_SIZE = 0.5;
const ELECTRON_SIZE = 0.12;
const ELECTRON_SPEED = 0.5;

function Electron({ radius, speed, offset, color }) {
    const ref = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const angle = time * speed + offset;
        ref.current.position.x = Math.cos(angle) * radius;
        ref.current.position.z = Math.sin(angle) * radius;
    });

    return (
        <Sphere ref={ref} args={[ELECTRON_SIZE, 16, 16]} position={[radius, 0, 0]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </Sphere>
    );
}

function Shell({ radius, electrons, shellIndex }) {
    const electronItems = useMemo(() => {
        return new Array(electrons).fill(0).map((_, i) => ({
            offset: (i / electrons) * Math.PI * 2,
            // Vary speed slightly per shell or just by distance (slower outer shells usually)
            speed: ELECTRON_SPEED / (shellIndex * 0.5 + 1)
        }));
    }, [electrons, shellIndex]);

    return (
        <group rotation={[Math.random() * 0.5, Math.random() * 0.5, 0]}> {/* Slight random tilt for 3D effect */}
            {/* Orbit Path */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
                <meshBasicMaterial color="#444" opacity={0.3} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Electrons */}
            {electronItems.map((item, i) => (
                <Electron
                    key={i}
                    radius={radius}
                    speed={item.speed}
                    offset={item.offset}
                    color="#00ffff"
                />
            ))}
        </group>
    );
}

function Nucleus({ protonCount, colorClass }) {
    // Extract base color from tailwind class if possible, or default to a color
    const colorMap = {
        'diatomic nonmetal': '#a3e635', // lime-400
        'noble gas': '#c084fc', // purple-400
        'alkali metal': '#f87171', // red-400
        'alkaline earth metal': '#fb923c', // orange-400
        'metalloid': '#2dd4bf', // teal-400
        'polyatomic nonmetal': '#a3e635',
        'nonmetal': '#a3e635',
        'post-transition metal': '#9ca3af', // gray-400
        'transition metal': '#facc15', // yellow-400
        'lanthanide': '#f472b6', // pink-400
        'actinide': '#ec4899', // pink-500
        'unknown': '#d1d5db',
    };

    // Simple color approximation based on category map or fallback
    // We'll pass the category name as a prop instead of colorClass string for easier mapping

    return (
        <Sphere args={[NUCLEUS_SIZE, 32, 32]}>
            <meshStandardMaterial color="#ff0055" roughness={0.3} />
        </Sphere>
    );
}

// Helper to parse config
const parseElectronConfig = (config) => {
    if (!config) return {};

    // normalize superscripts
    const normalized = config
        .replace(/¹/g, '1')
        .replace(/²/g, '2')
        .replace(/³/g, '3')
        .replace(/⁴/g, '4')
        .replace(/⁵/g, '5')
        .replace(/⁶/g, '6')
        .replace(/⁷/g, '7')
        .replace(/⁸/g, '8')
        .replace(/⁹/g, '9')
        .replace(/⁰/g, '0');

    const parts = normalized.split(' ');
    const shells = {};

    parts.forEach(part => {
        // e.g. 1s2, 2p6, [He] (ignore [He] for now, need full config usually)
        // If config starts with [He], we should ideally use the numeric atomic number to deduce, 
        // BUT the passed config in our data seems to be FULL like "1s² 2s¹" or full string.
        // Let's assume we get the full string or we handle the [Noble] parts if needed.
        // Actually, looking at data, 'electronConfiguration' field seems usually full? 
        // Checking element 3 Li: "1s² 2s¹". Element 1 H: "1s¹".
        // Wait, for larger elements, it might be shortened? 
        // File view of element 3 Li showed "1s² 2s¹".
        // Let's assume full config is available in `electronConfiguration` field from our merge script, 
        // but user script actually imported CSV `electron_configuration` which typically IS short.
        // Wait, looking at element 3 in view_file: `electronConfiguration: "1s² 2s¹"`.
        // Let's check a heavier element.

        const match = part.match(/^(\d+)[a-z](\d+)$/);
        if (match) {
            const shellLevel = parseInt(match[1]);
            const count = parseInt(match[2]);
            shells[shellLevel] = (shells[shellLevel] || 0) + count;
        }
    });
    return shells;
};


export default function BohrModel({ element }) {
    const shellsData = useMemo(() => parseElectronConfig(element.electronConfiguration), [element.electronConfiguration]);
    const maxShell = Math.max(...Object.keys(shellsData).map(Number), 1);

    // Camera adjustments based on size
    const camDistance = Math.max(8, maxShell * 2.5);

    return (
        <div className="w-full h-full min-h-[300px] bg-gray-900 rounded-lg overflow-hidden relative">
            <Canvas camera={{ position: [0, 5, camDistance], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <OrbitControls enableZoom={true} enablePan={true} />

                <Nucleus protonCount={element.n} />

                {Object.entries(shellsData).map(([shell, count]) => (
                    <Shell
                        key={shell}
                        shellIndex={parseInt(shell)}
                        radius={parseInt(shell) * SHELL_DISTANCE + NUCLEUS_SIZE}
                        electrons={count}
                    />
                ))}
            </Canvas>
            <div className="absolute bottom-2 left-2 text-white text-xs opacity-50 bg-black/30 p-1 rounded">
                Bohr Model (Schematic)
            </div>
        </div>
    );
}
