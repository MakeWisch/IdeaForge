import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { DesignSpecification } from '../../types/design';
import { PartMesh } from './PartMesh';
import { solveKinematics, ComputedPartTransform } from './KinematicsSolver';

interface SceneViewportProps {
  spec: DesignSpecification;
  jointValues: Record<string, number>;
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
  hoveredPartId: string | null;
  onHoverPart: (partId: string | null) => void;
  viewMode: 'solid' | 'wireframe' | 'xray';
  explodedFactor: number;
  showGrid: boolean;
  showDimensions: boolean;
  showEdges: boolean;
  cameraPreset?: 'iso' | 'front' | 'top' | 'right';
}

function DimensionBox({ spec, transforms }: { spec: DesignSpecification; transforms: Map<string, ComputedPartTransform> }) {
  const box = useMemo(() => {
    const b = new THREE.Box3();
    for (const part of spec.parts) {
      if (part.visible === false) continue;
      const t = transforms.get(part.id);
      if (!t) continue;
      // Rough bounding estimation from dimensions
      const maxDim = Math.max(...(part.geometry.dimensions || [1])) * 0.7;
      b.expandByPoint(new THREE.Vector3(t.position.x - maxDim, t.position.y - maxDim, t.position.z - maxDim));
      b.expandByPoint(new THREE.Vector3(t.position.x + maxDim, t.position.y + maxDim, t.position.z + maxDim));
    }
    return b;
  }, [spec, transforms]);

  const size = useMemo(() => {
    const s = new THREE.Vector3();
    box.getSize(s);
    return s;
  }, [box]);

  const center = useMemo(() => {
    const c = new THREE.Vector3();
    box.getCenter(c);
    return c;
  }, [box]);

  if (box.isEmpty()) return null;

  return (
    <group position={center}>
      <box3Helper args={[box, new THREE.Color('#38bdf8')]} />
    </group>
  );
}

function MechanismScene({
  spec,
  jointValues,
  selectedPartId,
  onSelectPart,
  hoveredPartId,
  onHoverPart,
  viewMode,
  explodedFactor,
  showGrid,
  showDimensions,
  showEdges
}: Omit<SceneViewportProps, 'cameraPreset'>) {
  // Solve kinematic transforms
  const transforms = useMemo(() => {
    return solveKinematics(spec, jointValues, explodedFactor);
  }, [spec, jointValues, explodedFactor]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[8, 12, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-8, 6, -6]} intensity={0.6} color="#93c5fd" />
      <directionalLight position={[4, -4, -10]} intensity={0.4} color="#fde047" />
      <hemisphereLight args={['#ffffff', '#0f172a', 0.6]} />

      <Center top position={[0, 0, 0]}>
        <group>
          {spec.parts.map((part) => {
            const transform = transforms.get(part.id);
            if (!transform) return null;

            return (
              <PartMesh
                key={part.id}
                part={part}
                transform={transform}
                isSelected={selectedPartId === part.id}
                isHovered={hoveredPartId === part.id}
                viewMode={viewMode}
                showEdges={showEdges}
                onClick={() => onSelectPart(part.id)}
                onPointerOver={() => onHoverPart(part.id)}
                onPointerOut={() => onHoverPart(null)}
              />
            );
          })}
        </group>
      </Center>

      {/* Dimensions Bounding Box Helper */}
      {showDimensions && <DimensionBox spec={spec} transforms={transforms} />}

      {/* CAD Ground Grid */}
      {showGrid && (
        <Grid
          position={[0, -0.01, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.75}
          cellColor="#27272a"
          sectionSize={2.0}
          sectionThickness={1.2}
          sectionColor="#3f3f46"
          fadeDistance={25}
          fadeStrength={1.5}
        />
      )}

      {/* Orbit Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={1.5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2 + 0.15} // don't go too far below ground
      />

      {/* Interactive Orientation Gizmo */}
      <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
        <GizmoViewport
          axisColors={['#ef4444', '#22c55e', '#3b82f6']}
          labelColor="#ffffff"
        />
      </GizmoHelper>
    </>
  );
}

export const SceneViewport: React.FC<SceneViewportProps> = (props) => {
  const controlsRef = useRef<any>(null);

  return (
    <div
      className="relative w-full h-full bg-[#09090b] overflow-hidden select-none"
      onClick={() => props.onSelectPart(null)}
    >
      <Canvas
        shadows
        camera={{ position: [6, 6, 8], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#0a0a0d']} />
        <MechanismScene {...props} />
      </Canvas>
    </div>
  );
};
