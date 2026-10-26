import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { DesignSpecification } from '../../types/design';

let rapierReady = false;
let rapierInitPromise: Promise<void> | null = null;

export async function initRapierPhysics(): Promise<boolean> {
  if (rapierReady) return true;
  if (!rapierInitPromise) {
    rapierInitPromise = RAPIER.init().then(() => {
      rapierReady = true;
    }).catch(err => {
      console.warn('Rapier WebAssembly init fallback to kinematic constraint solver:', err);
    });
  }
  await rapierInitPromise;
  return rapierReady;
}

export interface PhysicsSimulationState {
  world: RAPIER.World | null;
  bodies: Map<string, RAPIER.RigidBody>;
  joints: Map<string, RAPIER.ImpulseJoint>;
}

/**
 * Creates Rapier rigid bodies and impulse joints from DesignSpecification
 */
export function createRapierWorld(
  spec: DesignSpecification,
  currentJointValues: Record<string, number>
): PhysicsSimulationState | null {
  if (!rapierReady) return null;

  try {
    const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    const world = new RAPIER.World(gravity);
    const bodies = new Map<string, RAPIER.RigidBody>();
    const joints = new Map<string, RAPIER.ImpulseJoint>();

    // 1. Create rigid bodies for each part
    for (const part of spec.parts) {
      if (part.visible === false) continue;

      const isBase = part.physics?.isStatic || part.parentId === null;
      const bodyDesc = isBase 
        ? RAPIER.RigidBodyDesc.fixed() 
        : RAPIER.RigidBodyDesc.dynamic();

      bodyDesc.setTranslation(
        part.transform.position[0],
        part.transform.position[1],
        part.transform.position[2]
      );

      const rotEuler = new THREE.Euler(
        THREE.MathUtils.degToRad(part.transform.rotation[0]),
        THREE.MathUtils.degToRad(part.transform.rotation[1]),
        THREE.MathUtils.degToRad(part.transform.rotation[2])
      );
      const rotQuat = new THREE.Quaternion().setFromEuler(rotEuler);
      bodyDesc.setRotation({ x: rotQuat.x, y: rotQuat.y, z: rotQuat.z, w: rotQuat.w });

      const body = world.createRigidBody(bodyDesc);
      bodies.set(part.id, body);

      // Create collider
      const dims = part.geometry.dimensions || [1, 1, 1];
      let colliderDesc: RAPIER.ColliderDesc;

      if (part.geometry.type === 'cylinder') {
        colliderDesc = RAPIER.ColliderDesc.cylinder((dims[2] || dims[1] || 1) / 2, (dims[0] || 0.5));
      } else if (part.geometry.type === 'sphere') {
        colliderDesc = RAPIER.ColliderDesc.ball(dims[0] || 0.5);
      } else {
        colliderDesc = RAPIER.ColliderDesc.cuboid((dims[0] || 1) / 2, (dims[1] || 1) / 2, (dims[2] || 1) / 2);
      }

      colliderDesc.setFriction(part.physics?.friction ?? 0.5);
      colliderDesc.setRestitution(part.physics?.restitution ?? 0.1);
      world.createCollider(colliderDesc, body);
    }

    // 2. Create joints
    for (const j of spec.joints) {
      const parentBody = bodies.get(j.parentPartId);
      const childBody = bodies.get(j.childPartId);
      if (!parentBody || !childBody) continue;

      const anchorVec = new THREE.Vector3(...j.anchor);
      const axisVec = new THREE.Vector3(...j.axis).normalize();

      const pPos = parentBody.translation();
      const pAnchor = {
        x: anchorVec.x - pPos.x,
        y: anchorVec.y - pPos.y,
        z: anchorVec.z - pPos.z
      };

      const cPos = childBody.translation();
      const cAnchor = {
        x: anchorVec.x - cPos.x,
        y: anchorVec.y - cPos.y,
        z: anchorVec.z - cPos.z
      };

      if (j.type === 'revolute') {
        const jointParams = RAPIER.JointData.revolute(
          pAnchor,
          cAnchor,
          { x: axisVec.x, y: axisVec.y, z: axisVec.z }
        );
        jointParams.limitsEnabled = true;
        jointParams.limits = [
          THREE.MathUtils.degToRad(j.limits.min),
          THREE.MathUtils.degToRad(j.limits.max)
        ];
        const impulseJoint = world.createImpulseJoint(jointParams, parentBody, childBody, true);
        joints.set(j.id, impulseJoint);
      } else if (j.type === 'prismatic') {
        const jointParams = RAPIER.JointData.prismatic(
          pAnchor,
          cAnchor,
          { x: axisVec.x, y: axisVec.y, z: axisVec.z }
        );
        jointParams.limitsEnabled = true;
        jointParams.limits = [j.limits.min, j.limits.max];
        const impulseJoint = world.createImpulseJoint(jointParams, parentBody, childBody, true);
        joints.set(j.id, impulseJoint);
      }
    }

    return { world, bodies, joints };
  } catch (err) {
    console.warn('Rapier simulation creation fallback:', err);
    return null;
  }
}
