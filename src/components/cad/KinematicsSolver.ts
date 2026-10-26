import * as THREE from 'three';
import { DesignSpecification, PartDefinition } from '../../types/design';

export interface ComputedPartTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

/**
 * Computes exact 3D positions and orientations for all parts in a DesignSpecification
 * taking into account kinematic joint constraints, hierarchical connections,
 * and exploded view offsets.
 */
export function solveKinematics(
  spec: DesignSpecification,
  jointValues: Record<string, number>,
  explodedFactor = 0
): Map<string, ComputedPartTransform> {
  const result = new Map<string, ComputedPartTransform>();

  // 1. Initialize base transforms from specification
  for (const part of spec.parts) {
    const pos = new THREE.Vector3(
      part.transform.position[0],
      part.transform.position[1],
      part.transform.position[2]
    );

    const rot = new THREE.Euler(
      THREE.MathUtils.degToRad(part.transform.rotation[0]),
      THREE.MathUtils.degToRad(part.transform.rotation[1]),
      THREE.MathUtils.degToRad(part.transform.rotation[2]),
      'XYZ'
    );

    const scale = new THREE.Vector3(
      part.transform.scale?.[0] ?? 1,
      part.transform.scale?.[1] ?? 1,
      part.transform.scale?.[2] ?? 1
    );

    result.set(part.id, { position: pos, rotation: rot, scale });
  }

  // 2. Build child part mapping for topological kinematic propagation
  const jointByChild = new Map<string, typeof spec.joints[0]>();
  for (const joint of spec.joints) {
    jointByChild.set(joint.childPartId, joint);
  }

  // Find descendants of a part
  const getDescendants = (parentId: string): string[] => {
    const list: string[] = [];
    for (const part of spec.parts) {
      if (part.parentId === parentId) {
        list.push(part.id);
        list.push(...getDescendants(part.id));
      }
    }
    return list;
  };

  // 3. Apply active joints
  for (const joint of spec.joints) {
    const currentVal = jointValues[joint.id] ?? joint.currentValue ?? joint.limits.default ?? 0;
    const defaultVal = joint.limits.default ?? 0;
    const delta = currentVal - defaultVal;

    if (Math.abs(delta) < 0.0001) continue;

    const childIds = [joint.childPartId, ...getDescendants(joint.childPartId)];
    const anchor = new THREE.Vector3(...joint.anchor);
    const axis = new THREE.Vector3(...joint.axis).normalize();

    if (joint.type === 'revolute') {
      const angleRad = THREE.MathUtils.degToRad(delta);
      const quat = new THREE.Quaternion().setFromAxisAngle(axis, angleRad);

      for (const cid of childIds) {
        const trans = result.get(cid);
        if (!trans) continue;

        // Rotate position around anchor
        const relPos = trans.position.clone().sub(anchor);
        relPos.applyQuaternion(quat);
        trans.position.copy(anchor.clone().add(relPos));

        // Rotate orientation
        const currentQuat = new THREE.Quaternion().setFromEuler(trans.rotation);
        currentQuat.premultiply(quat);
        trans.rotation.setFromQuaternion(currentQuat, 'XYZ');
      }
    } else if (joint.type === 'prismatic') {
      const translation = axis.clone().multiplyScalar(delta);

      for (const cid of childIds) {
        const trans = result.get(cid);
        if (!trans) continue;
        trans.position.add(translation);
      }
    }
  }

  // 4. Apply Exploded View separation if factor > 0
  if (explodedFactor > 0.001) {
    // Calculate geometric centroid
    const center = new THREE.Vector3();
    let count = 0;
    for (const trans of result.values()) {
      center.add(trans.position);
      count++;
    }
    if (count > 0) center.divideScalar(count);

    for (let i = 0; i < spec.parts.length; i++) {
      const part = spec.parts[i];
      const trans = result.get(part.id);
      if (!trans) continue;

      const dir = trans.position.clone().sub(center);
      if (dir.lengthSq() < 0.001) {
        // Fallback outward direction if centered
        dir.set((i % 3) - 1, 1, Math.floor(i / 3) - 1);
      }
      dir.normalize();

      // Separate proportional to exploded factor
      const explodeOffset = dir.multiplyScalar(explodedFactor * 2.2);
      trans.position.add(explodeOffset);
    }
  }

  return result;
}
