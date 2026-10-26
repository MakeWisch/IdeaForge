import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PartDefinition } from '../../types/design';
import { ComputedPartTransform } from './KinematicsSolver';
import { createEngineeredGeometry } from './GeometryFactory';

interface PartMeshProps {
  part: PartDefinition;
  transform: ComputedPartTransform;
  isSelected: boolean;
  isHovered: boolean;
  viewMode: 'solid' | 'wireframe' | 'xray';
  showEdges: boolean;
  onClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: (e: any) => void;
}

export const PartMesh: React.FC<PartMeshProps> = ({
  part,
  transform,
  isSelected,
  isHovered,
  viewMode,
  showEdges = true,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate engineered CAD geometry
  const geometry = useMemo(() => {
    return createEngineeredGeometry(part.geometry);
  }, [part.geometry]);

  // CAD-style edge lines for technical clarity
  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 28);
  }, [geometry]);

  // Compute color & PBR finish
  const baseColor = part.material.color || '#3b82f6';
  const displayColor = isSelected ? '#f59e0b' : isHovered ? '#60a5fa' : baseColor;

  if (part.visible === false) return null;

  return (
    <group
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
    >
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver(e);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onPointerOut(e);
        }}
      >
        <meshPhysicalMaterial
          color={displayColor}
          roughness={part.material.roughness ?? (part.material.finish === 'anodized' ? 0.3 : 0.4)}
          metalness={part.material.metalness ?? (part.material.finish === 'anodized' ? 0.8 : 0.5)}
          clearcoat={part.material.clearcoat ?? (part.material.finish === 'anodized' ? 0.4 : 0.1)}
          clearcoatRoughness={0.15}
          wireframe={viewMode === 'wireframe' || Boolean(part.material.wireframe)}
          transparent={viewMode === 'xray' || isSelected || Boolean(part.material.transparent)}
          opacity={viewMode === 'xray' ? 0.45 : isSelected ? 0.95 : (part.material.opacity ?? 1)}
          emissive={isSelected ? '#d97706' : isHovered ? '#2563eb' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : isHovered ? 0.18 : 0}
        />
      </mesh>

      {/* Technical CAD Edge Wire Lines */}
      {showEdges && viewMode !== 'wireframe' && (
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial
            color={isSelected ? '#fbbf24' : '#09090b'}
            linewidth={1}
            transparent
            opacity={isSelected ? 0.9 : 0.4}
          />
        </lineSegments>
      )}

      {/* Selected Halo / Bounding accent */}
      {isSelected && (
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color="#f59e0b" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};
