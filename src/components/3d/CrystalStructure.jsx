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
    } else if (t.includes('orthorhombic')) {
        // Orthorhombic unit cell (rectangular box, different dimensions)
        // Use slightly different proportions than cubic
        const a = 1.2, b = 1.0, c = 1.5; // Different axis lengths

        // Corners of orthorhombic cell
        const orthoCorners = [
            [-a, -b, -c], [a, -b, -c], [a, b, -c], [-a, b, -c],
            [-a, -b, c], [a, -b, c], [a, b, c], [-a, b, c]
        ];

        coords.push(...orthoCorners);

        if (t.includes('base') && !t.includes('face')) {
            // Base-centered Orthorhombic (2 atoms per unit cell)
            // Add centers of top and bottom faces
            coords.push([0, 0, -c]); // Bottom face center
            coords.push([0, 0, c]);  // Top face center
        } else if (t.includes('face')) {
            // Face-centered Orthorhombic (4 atoms per unit cell)
            coords.push(
                [0, 0, -c], [0, 0, c],   // Top/Bottom face centers
                [0, -b, 0], [0, b, 0],   // Front/Back face centers
                [-a, 0, 0], [a, 0, 0]    // Left/Right face centers
            );
        }
        // Simple Orthorhombic: just corners (already added)
    } else if (t.includes('monoclinic')) {
        // Monoclinic (rectangular prism distorted by one angle)
        const a = 1.2;
        const b = 1.0;
        const c = 1.4;
        const beta = Math.PI / 6; // Tilted axis

        // Basis vectors
        const v1 = [a, 0, 0];
        const v2 = [0, b, 0];
        // v3 in x-z plane (tilted)
        // using tilt from vertical (z-axis)
        const v3 = [c * Math.sin(beta), 0, c * Math.cos(beta)];

        // Generate 8 corners for GeneralWireframe (0-7 order)
        // 0: 000
        // 1: 100 (v1)
        // 2: 010 (v2)
        // 3: 110 (v1+v2)
        // 4: 001 (v3)
        // 5: 101 (v1+v3)
        // 6: 011 (v2+v3)
        // 7: 111 (v1+v2+v3)
        const rawCoords = [
            [0, 0, 0],
            v1,
            v2,
            [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]],
            v3,
            [v1[0] + v3[0], v1[1] + v3[1], v1[2] + v3[2]],
            [v2[0] + v3[0], v2[1] + v3[1], v2[2] + v3[2]],
            [v1[0] + v2[0] + v3[0], v1[1] + v2[1] + v3[1], v1[2] + v2[2] + v3[2]]
        ];

        // Add centered atoms
        if (t.includes('base')) {
            // Base-centered (C-centered on ab face)
            // Center of bottom face (v1, v2)
            const bottom = [
                (v1[0] + v2[0]) / 2,
                (v1[1] + v2[1]) / 2,
                (v1[2] + v2[2]) / 2
            ];
            // Center of top face (same x,y relative to v3)
            const top = [
                bottom[0] + v3[0],
                bottom[1] + v3[1],
                bottom[2] + v3[2]
            ];
            rawCoords.push(bottom, top);
        }

        // Center the structure
        const center = [
            rawCoords[7][0] / 2, // Center is half of the main diagonal vector
            rawCoords[7][1] / 2,
            rawCoords[7][2] / 2
        ];

        rawCoords.forEach(p => {
            coords.push([p[0] - center[0], p[1] - center[1], p[2] - center[2]]);
        });
    } else if (t.includes('triclinic')) {
        // Triclinic (most general)
        // a != b != c, alpha != beta != gamma != 90
        const a = 1.3, b = 1.0, c = 1.2;
        // Arbitrary oblique angles for demo
        const alpha = Math.PI / 2.5; // ~72 deg
        const beta = Math.PI / 2.2;  // ~82 deg
        const gamma = Math.PI / 1.8; // ~100 deg

        const ca = Math.cos(alpha), cb = Math.cos(beta), cg = Math.cos(gamma);
        const sg = Math.sin(gamma);

        // Basis vectors
        const v1 = [a, 0, 0];
        const v2 = [b * cg, b * sg, 0];

        const cx = c * cb;
        const cy = c * (ca - cb * cg) / sg;
        const cz = c * Math.sqrt(Math.max(0, 1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg)) / sg;
        const v3 = [cx, cy, cz];

        const rawCoords = [
            [0, 0, 0], v1, v2,
            [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]],
            v3,
            [v1[0] + v3[0], v1[1] + v3[1], v1[2] + v3[2]],
            [v2[0] + v3[0], v2[1] + v3[1], v2[2] + v3[2]],
            [v1[0] + v2[0] + v3[0], v1[1] + v2[1] + v3[1], v1[2] + v2[2] + v3[2]]
        ];

        const center = [
            rawCoords[7][0] / 2,
            rawCoords[7][1] / 2,
            rawCoords[7][2] / 2
        ];

        rawCoords.forEach(p => coords.push([p[0] - center[0], p[1] - center[1], p[2] - center[2]]));
    } else if (t.includes('trigonal') || t.includes('rhombohedral')) {
        // Trigonal/Rhombohedral (rhombohedron)
        // Correct implementation based on lattice vectors
        const a = 1.3;
        const alpha = 1.01334; // ~58 degrees (Boron)

        // Calculate basis vectors
        const cosA = Math.cos(alpha);
        const sinA = Math.sin(alpha);

        // Let's use simplified Cartesian coordinates for Rhombohedral
        // where a=b=c=1 and alpha=beta=gamma

        // Formula for v3 components (cx, cy, cz)
        const cx = a * cosA;
        const cy = a * (cosA - cosA * cosA) / sinA;
        const cz = a * Math.sqrt(1 - 3 * cosA * cosA + 2 * Math.pow(cosA, 3)) / sinA;

        const v1 = [a, 0, 0];
        const v2 = [a * cosA, a * sinA, 0];
        const v3 = [cx, cy, cz];

        // Generate 8 corners in order 0-7 for GeneralWireframe
        // 0: origin
        // 1: v1
        // 2: v2
        // 3: v1+v2
        // 4: v3
        // 5: v1+v3
        // 6: v2+v3
        // 7: v1+v2+v3

        const rawCoords = [
            [0, 0, 0],
            v1,
            v2,
            [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]],
            v3,
            [v1[0] + v3[0], v1[1] + v3[1], v1[2] + v3[2]],
            [v2[0] + v3[0], v2[1] + v3[1], v2[2] + v3[2]],
            [v1[0] + v2[0] + v3[0], v1[1] + v2[1] + v3[1], v1[2] + v2[2] + v3[2]]
        ];

        // Center the structure
        const center = [
            rawCoords[7][0] / 2,
            rawCoords[7][1] / 2,
            rawCoords[7][2] / 2
        ];

        rawCoords.forEach(p => {
            coords.push([p[0] - center[0], p[1] - center[1], p[2] - center[2]]);
        });

    } else if (t.includes('tetragonal')) {
        // Tetragonal (square base, different height)
        const a = 1.0, c = 1.6; // a=b, c different

        const tetraCorners = [
            [-a, -a, -c], [a, -a, -c], [a, a, -c], [-a, a, -c],
            [-a, -a, c], [a, -a, c], [a, a, c], [-a, a, c]
        ];

        coords.push(...tetraCorners);

        if (t.includes('body')) {
            coords.push([0, 0, 0]);
        }
    } else if (t.includes('tetrahedral') || t.includes('diamond')) {
        // Diamond Cubic / Tetrahedral Packing
        // FCC lattice + 4 interior atoms

        // 1. Add FCC points (Corners + Face Centers)
        const corners = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        coords.push(...corners);

        // Face centers
        coords.push(
            [0, -1, 0], [0, 1, 0], // Top/Bottom
            [-1, 0, 0], [1, 0, 0], // Left/Right
            [0, 0, -1], [0, 0, 1]  // Front/Back
        );

        // 2. Add the 4 tetrahedral void atoms (basis shift of 1/4, 1/4, 1/4)
        // In -1..1 scale, 1/4 becomes -0.5, 3/4 becomes 0.5
        coords.push(
            [-0.5, -0.5, -0.5],
            [0.5, 0.5, -0.5],
            [-0.5, 0.5, 0.5],
            [0.5, -0.5, 0.5]
        );

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

function UnitCellBox({ dimensions = [2, 2, 2] }) {
    // Draws a wireframe box with custom dimensions
    return (
        <mesh>
            <boxGeometry args={dimensions} />
            <meshBasicMaterial color="#666" wireframe />
        </mesh>
    );
}

// Get appropriate wireframe dimensions based on structure type
function getWireframeDimensions(structure) {
    const t = (structure || '').toLowerCase();

    if (t.includes('orthorhombic')) {
        // Orthorhombic: different dimensions for each axis
        return [2.4, 2.0, 3.0]; // 2*a, 2*b, 2*c from coords
    } else if (t.includes('tetragonal')) {
        // Tetragonal: square base, different height
        return [2.0, 2.0, 3.2]; // 2*a, 2*a, 2*c
    } else if (t.includes('cubic')) {
        // Cubic: all equal
        return [2, 2, 2];
    } else if (t.includes('monoclinic') || t.includes('triclinic')) {
        // For tilted structures, use a regular box as approximation
        return [2.4, 2.0, 2.8];
    }

    // Default
    return [2, 2, 2];
}

// Hexagonal prism wireframe
function HexagonalPrismWireframe() {
    const hexRadius = 1.5;
    const height = 2;

    // Create hexagon vertices for top and bottom
    const topHex = [];
    const bottomHex = [];

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * hexRadius;
        const z = Math.sin(angle) * hexRadius;
        topHex.push([x, height / 2, z]);
        bottomHex.push([x, -height / 2, z]);
    }

    return (
        <group>
            {/* Top hexagon */}
            {topHex.map((point, i) => {
                const nextPoint = topHex[(i + 1) % 6];
                return (
                    <Line
                        key={`top-${i}`}
                        points={[point, nextPoint]}
                        color="#666"
                        lineWidth={1}
                    />
                );
            })}

            {/* Bottom hexagon */}
            {bottomHex.map((point, i) => {
                const nextPoint = bottomHex[(i + 1) % 6];
                return (
                    <Line
                        key={`bottom-${i}`}
                        points={[point, nextPoint]}
                        color="#666"
                        lineWidth={1}
                    />
                );
            })}

            {/* Vertical edges connecting top and bottom */}
            {topHex.map((topPoint, i) => (
                <Line
                    key={`vertical-${i}`}
                    points={[topPoint, bottomHex[i]]}
                    color="#666"
                    lineWidth={1}
                />
            ))}
        </group>
    );
}


// General wireframe for non-rectangular unit cells
function GeneralWireframe({ points }) {
    if (!points || points.length < 8) return null;

    // Assuming points 0-7 are the corners of the parallelepiped
    // Order matches generation: 000, 100, 010, 110, 001, 101, 011, 111 (in logic)
    // But points array might be shifted. 
    // We expect points to correspond to:
    // 0: origin
    // 1: v1
    // 2: v2
    // 3: v1+v2
    // 4: v3
    // 5: v1+v3
    // 6: v2+v3
    // 7: v1+v2+v3

    const edges = [
        [0, 1], [0, 2], [0, 4], // form origin
        [1, 3], [1, 5],         // from v1
        [2, 3], [2, 6],         // from v2
        [3, 7],                 // from v1+v2
        [4, 5], [4, 6],         // from v3
        [5, 7],                 // from v1+v3
        [6, 7]                  // from v2+v3
    ];

    return (
        <group>
            {edges.map(([i, j], idx) => (
                <Line
                    key={idx}
                    points={[points[i], points[j]]}
                    color="#666"
                    lineWidth={1}
                />
            ))}
        </group>
    );
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

    const t = (structure || '').toLowerCase();
    const isHexagonal = t.includes('hexagonal');
    const isTrigonal = t.includes('trigonal') || t.includes('rhombohedral');
    const isGeneral = isTrigonal || t.includes('monoclinic') || t.includes('triclinic'); // Use coords-based wireframe for non-rectangular cells

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

                    {/* Choose appropriate wireframe */}
                    {isHexagonal ? (
                        <HexagonalPrismWireframe />
                    ) : isGeneral ? (
                        <GeneralWireframe points={positions} />
                    ) : (
                        <UnitCellBox dimensions={getWireframeDimensions(structure)} />
                    )}
                </group>
            </Canvas>
            <div className="absolute bottom-2 left-2 text-gray-600 text-xs bg-white/50 p-1 rounded backdrop-blur-sm">
                {structure}
            </div>
        </div>
    );
}
