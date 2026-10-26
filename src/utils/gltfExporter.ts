import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { DesignSpecification } from '../types/design';
import { solveKinematics } from '../components/cad/KinematicsSolver';
import { createEngineeredGeometry } from '../components/cad/GeometryFactory';
import { downloadFile } from './objExporter';

/**
 * Exports a DesignSpecification into standard binary GLB or JSON glTF format,
 * fully compatible with Blender, Unreal Engine, Web 3D viewers, and CAD tools.
 */
export function exportToGLB(
  spec: DesignSpecification,
  jointValues: Record<string, number>,
  options: { binary?: boolean } = { binary: true }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transforms = solveKinematics(spec, jointValues, 0);
    const scene = new THREE.Scene();
    scene.name = spec.name;

    for (const part of spec.parts) {
      if (part.visible === false) continue;
      const trans = transforms.get(part.id);
      if (!trans) continue;

      const geometry = createEngineeredGeometry(part.geometry);
      const material = new THREE.MeshStandardMaterial({
        color: part.material.color || '#3b82f6',
        roughness: part.material.roughness ?? 0.4,
        metalness: part.material.metalness ?? 0.5,
        wireframe: Boolean(part.material.wireframe)
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = part.name;
      mesh.position.copy(trans.position);
      mesh.rotation.copy(trans.rotation);
      mesh.scale.copy(trans.scale);

      scene.add(mesh);
    }

    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const isBinary = options.binary ?? true;
        const filename = `${spec.name.toLowerCase().replace(/\s+/g, '-')}.${isBinary ? 'glb' : 'gltf'}`;

        if (isBinary && gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const jsonOutput = JSON.stringify(gltf, null, 2);
          downloadFile(jsonOutput, filename, 'application/json');
        }
        resolve();
      },
      (error) => {
        console.error('GLTF Export error:', error);
        reject(error);
      },
      { binary: options.binary ?? true }
    );
  });
}
