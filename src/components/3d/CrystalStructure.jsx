import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, OrbitControls, Line } from '@react-three/drei';

const ATOM_RADIUS = 0.25;
const CELL_SIZE = 2; // Size of the unit cell box

// Helper to generate coordinates
const getStructureCoords = (type) => {
    const coords = [];
    const connections = []; // pairs of indices to draw lines? or just edges of cell

    // Normalize type string
    const t = (type || '').toLowerCase();

    // Corners (common to all cubic)
    const corners = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];

    if (t.includes('cubic')) {
        // Base Unit Cell Box Lines
        // (Just visual aid, we can add later)

        // Add corners
        coords.push(...corners);

        if (t.includes('body-centered') || t.includes('bcc')) {
            // Add center
            coords.push([0, 0, 0]);
        }

        if (t.includes('face-centered') || t.includes('fcc')) {
            // Add face centers
            coords.push(
                [0, -1, 0], [0, 1, 0], // Top/Bottom
                [-1, 0, 0], [1, 0, 0], // Left/Right
                [0, 0, -1], [0, 0, 1]  // Front/Back
            );
        }
    } else if (t.includes('hexagonal')) {
        // Simple Hexagonal / HCP wrapper
        // Approximate hex cell:
        // Top Hex
        const hexRadius = 1.5;
        const height = 2;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * hexRadius;
            const z = Math.sin(angle) * hexRadius;
            coords.push([x, height / 2, z]); // Top ring
            coords.push([x, -height / 2, z]); // Bottom ring
        }
        // Center of top/bottom faces
        coords.push([0, height / 2, 0]);
        coords.push([0, -height / 2, 0]);

        if (t.includes('close-packed') || t.includes('hcp')) {
            // 3 atoms in the middle layer
            for (let i = 0; i < 3; i++) {
                const angle = ((i * 2 + 1) / 6) * Math.PI * 2; // Offset by 30 deg (pi/6) -> actually 60 deg spacing usually
                // Triangles are usually at indices 0, 2, 4?
                // Standard HCP mid layer is at triangle voids.
                // Simplified: Just put 3 in a triangle in the middle
                const midAngle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                coords.push([Math.cos(midAngle) * hexRadius * 0.6, 0, Math.sin(midAngle) * hexRadius * 0.6]);
            }
        }
    } else {
        // Fallback or other structures
        // Just show a single atom or something?
        // Let's default to Simple Cubic if structure is defined but unknown, 
        // OR return empty if totally unknown.
        if (type) coords.push([0, 0, 0]);
    }

    return coords;
};

function Atom({ position, color }) {
    return (
        <Sphere args={[ATOM_RADIUS, 32, 32]} position={position}>
            <meshStandardMaterial color={color} />
        </Sphere>
    );
}

function UnitCellBox() {
    // Draws a wireframe box 2x2x2
    return (
        <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshBasicMaterial color="#666" wireframe />
        </mesh>
    );
}

// Hex prism wireframe helper
function HexPrismWireframe() {
    const points = [];
    const r = 1.5;
    const h = 1;
    // ... constructing line segments is tedious manually, 
    // let's stick to just atoms for now to keep it clean.
    return null;
}


export default function CrystalStructure({ element }) {
    const structure = element.crystalStructure;
    const positions = useMemo(() => getStructureCoords(structure), [structure]);

    // Decide color based on category?
    const color = '#3b82f6'; // Blue default

    if (!structure || positions.length === 0) {
        return (
            <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                No Structure Data
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[300px] bg-gray-50 rounded-lg overflow-hidden relative border border-gray-200">
            <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
                <ambientLight intensity={0.7} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <OrbitControls autoRotate autoRotateSpeed={2} />

                <group>
                    {positions.map((pos, i) => (
                        <Atom key={i} position={pos} color={color} />
                    ))}
                    {/* Outline: If cubic, show box */}
                    {(structure || '').toLowerCase().includes('cubic') && <UnitCellBox />}
                </group>
            </Canvas>
            <div className="absolute bottom-2 left-2 text-gray-600 text-xs bg-white/50 p-1 rounded backdrop-blur-sm">
                {structure}
            </div>
        </div>
    );
}
