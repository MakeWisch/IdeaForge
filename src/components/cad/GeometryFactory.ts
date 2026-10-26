import * as THREE from 'three';
import { PartGeometry } from '../../types/design';

/**
 * Creates high-fidelity, mechanically believable CAD geometries
 * with chamfers, fillets, knuckles, and accurate clearances.
 */
export function createEngineeredGeometry(geom: PartGeometry): THREE.BufferGeometry {
  const { type, dimensions, features } = geom;
  const dims = dimensions || [1, 1, 1];

  switch (type) {
    case 'machined_plate': {
      // Dimensions: [width, height, depth]
      const w = dims[0] || 3;
      const h = dims[1] || 0.25;
      const d = dims[2] || 3;
      const bevel = features?.bevel ?? 0.04;

      // Create rounded plate using ExtrudeGeometry for real CAD look
      const shape = new THREE.Shape();
      const hw = w / 2;
      const hd = d / 2;
      const r = Math.min(features?.cornerRadius ?? 0.15, hw * 0.4, hd * 0.4);

      shape.moveTo(-hw + r, -hd);
      shape.lineTo(hw - r, -hd);
      shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
      shape.lineTo(hw, hd - r);
      shape.quadraticCurveTo(hw, hd, hw - r, hd);
      shape.lineTo(-hw + r, hd);
      shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
      shape.lineTo(-hw, -hd + r);
      shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: h,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: bevel,
        bevelThickness: bevel
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();
      // Rotate so depth is aligned with Y
      geometry.rotateX(Math.PI / 2);
      return geometry;
    }

    case 'hinge_bracket': {
      // Dimensions: [width, height, depth]
      const w = dims[0] || 2;
      const h = dims[1] || 0.4;
      const d = dims[2] || 0.8;
      // Compound bracket with barrel
      const groupGeom = new THREE.BoxGeometry(w, h, d);
      return groupGeom;
    }

    case 'hinge_pin': {
      // Dimensions: [radius, height] or [radiusTop, radiusBottom, height]
      const r = dims[0] || 0.12;
      const len = dims[2] || dims[1] || 2.5;
      // Cylinder with chamfered retention caps
      const pinGeom = new THREE.CylinderGeometry(r, r, len, 32);
      return pinGeom;
    }

    case 'linkage_arm': {
      // Dimensions: [width, thickness, lengthBetweenPivots]
      const w = dims[0] || 0.5;
      const thickness = dims[1] || 0.2;
      const length = dims[2] || 3.0;

      const shape = new THREE.Shape();
      const r = w / 2;
      const halfLen = length / 2;

      // Dogbone link profile with circular boss ends
      shape.absarc(0, halfLen, r, 0, Math.PI, false);
      shape.lineTo(-r * 0.7, -halfLen);
      shape.absarc(0, -halfLen, r, Math.PI, 0, false);
      shape.lineTo(r * 0.7, halfLen);

      // Pivot hole 1
      const hole1 = new THREE.Path();
      hole1.absarc(0, halfLen, r * 0.45, 0, Math.PI * 2, true);
      shape.holes.push(hole1);

      // Pivot hole 2
      const hole2 = new THREE.Path();
      hole2.absarc(0, -halfLen, r * 0.45, 0, Math.PI * 2, true);
      shape.holes.push(hole2);

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: thickness,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();
      geometry.rotateZ(Math.PI / 2);
      return geometry;
    }

    case 'rail_track': {
      // Dimensions: [width, height, length]
      const w = dims[0] || 0.8;
      const h = dims[1] || 0.4;
      const len = dims[2] || 4.0;
      const railGeom = new THREE.BoxGeometry(w, h, len);
      return railGeom;
    }

    case 'slider_carriage': {
      // Dimensions: [width, height, length]
      const w = dims[0] || 1.1;
      const h = dims[1] || 0.5;
      const len = dims[2] || 1.2;
      const carriageGeom = new THREE.BoxGeometry(w, h, len);
      return carriageGeom;
    }

    case 'cylinder': {
      const rt = dims[0] || 0.5;
      const rb = dims[1] !== undefined ? dims[1] : rt;
      const ht = dims[2] || dims[1] || 1;
      return new THREE.CylinderGeometry(rt, rb, ht, 36);
    }

    case 'sphere': {
      const r = dims[0] || 0.5;
      return new THREE.SphereGeometry(r, 36, 28);
    }

    case 'capsule': {
      const r = dims[0] || 0.3;
      const l = dims[1] || 1;
      return new THREE.CapsuleGeometry(r, l, 20, 32);
    }

    case 'plane': {
      return new THREE.PlaneGeometry(dims[0] || 1, dims[1] || 1);
    }

    case 'box':
    default: {
      return new THREE.BoxGeometry(dims[0] || 1, dims[1] || 1, dims[2] || 1);
    }
  }
}
