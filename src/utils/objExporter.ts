import * as THREE from 'three';
import { DesignSpecification } from '../types/design';
import { solveKinematics } from '../components/cad/KinematicsSolver';
import { createEngineeredGeometry } from '../components/cad/GeometryFactory';

/**
 * Exports a DesignSpecification into an industry-standard Wavefront .OBJ file
 * with correct geometric primitives and scene transforms.
 */
export function exportToOBJ(spec: DesignSpecification, jointValues: Record<string, number>): string {
  const transforms = solveKinematics(spec, jointValues, 0);
  let output = `# IdeaForge CAD Export\n# Model: ${spec.name}\n# Generated: ${new Date().toISOString()}\n\n`;

  let vertexOffset = 1;

  for (const part of spec.parts) {
    if (part.visible === false) continue;
    const transform = transforms.get(part.id);
    if (!transform) continue;

    output += `g ${part.name.replace(/\s+/g, '_')}_${part.id}\n`;

    // Create high-fidelity Three.js geometry for this part
    const geom = createEngineeredGeometry(part.geometry);

    // Apply computed transformation
    const matrix = new THREE.Matrix4();
    matrix.compose(transform.position, new THREE.Quaternion().setFromEuler(transform.rotation), transform.scale);
    geom.applyMatrix4(matrix);

    const posAttr = geom.getAttribute('position');
    const indexAttr = geom.getIndex();

    // Write vertices
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      output += `v ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}\n`;
    }

    // Write faces
    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i += 3) {
        const a = indexAttr.getX(i) + vertexOffset;
        const b = indexAttr.getX(i + 1) + vertexOffset;
        const c = indexAttr.getX(i + 2) + vertexOffset;
        output += `f ${a} ${b} ${c}\n`;
      }
    } else {
      for (let i = 0; i < posAttr.count; i += 3) {
        const a = i + vertexOffset;
        const b = i + 1 + vertexOffset;
        const c = i + 2 + vertexOffset;
        output += `f ${a} ${b} ${c}\n`;
      }
    }

    vertexOffset += posAttr.count;
    output += '\n';
  }

  return output;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
