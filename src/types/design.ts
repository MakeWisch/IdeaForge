/**
 * Machine-readable 3D Design Specification for IdeaForge.
 * 
 * Separates:
 * A. Visual geometry (PBR materials, parametric engineered shapes, mesh assets)
 * B. Mechanical components (physical parts, roles, clearances, mass)
 * C. Joints & constraints (revolute, prismatic, fixed, limits, anchors, axes)
 * D. Physics properties (colliders, static anchors, restitution, friction)
 */

export type GeometryType = 
  | 'machined_plate'
  | 'hinge_bracket'
  | 'hinge_pin'
  | 'linkage_arm'
  | 'rail_track'
  | 'slider_carriage'
  | 'box'
  | 'cylinder'
  | 'sphere'
  | 'capsule'
  | 'plane'
  | 'mesh_url';

export type JointType = 'fixed' | 'revolute' | 'prismatic';
export type ComponentRole = 'base' | 'structural' | 'linkage' | 'actuator' | 'fastener' | 'effector' | 'enclosure' | 'guide';

export interface PartGeometry {
  type: GeometryType;
  /**
   * Primary dimensions:
   * - machined_plate / box: [width, height, depth]
   * - cylinder / hinge_pin: [radiusTop, radiusBottom, height] or [radius, height]
   * - sphere: [radius]
   * - capsule: [radius, length]
   * - linkage_arm: [width, thickness, lengthBetweenPivots]
   * - rail_track / slider_carriage: [width, height, length]
   * - mesh_url: [scaleX, scaleY, scaleZ]
   */
  dimensions: number[];
  meshUrl?: string;
  features?: {
    chamfer?: number;
    bevel?: number;
    cornerRadius?: number;
    holeRadius?: number;
    knuckleCount?: number;
    flangeWidth?: number;
  };
}

export interface PartMaterial {
  name?: string;
  color: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  opacity?: number;
  transparent?: boolean;
  wireframe?: boolean;
  finish?: 'anodized' | 'brushed' | 'matte' | 'gloss' | 'powder_coated' | 'rubberized';
}

export interface PartTransform {
  position: [number, number, number]; // [x, y, z] in scene units
  rotation: [number, number, number]; // [rx, ry, rz] in degrees
  scale?: [number, number, number];
}

export interface PhysicsProperties {
  isStatic?: boolean; // Base plates fixed to ground
  massKg?: number;
  friction?: number;
  restitution?: number; // Elasticity
  damping?: number;
  collider?: 'cuboid' | 'cylinder' | 'ball' | 'hull';
}

export interface PartDefinition {
  id: string;
  name: string;
  role?: ComponentRole;
  parentId?: string | null;
  geometry: PartGeometry;
  transform: PartTransform;
  material: PartMaterial;
  physics?: PhysicsProperties;
  visible?: boolean;
}

export interface JointLimits {
  min: number; // degrees for revolute, units/mm for prismatic
  max: number;
  default?: number;
  step?: number;
  unit?: 'deg' | 'mm' | 'units';
}

export interface JointVisualFeatures {
  showPin?: boolean;
  showKnuckles?: boolean;
  knuckleWidth?: number;
  clearanceMm?: number;
}

export interface JointDefinition {
  id: string;
  name: string;
  type: JointType;
  parentPartId: string;
  childPartId: string;
  anchor: [number, number, number]; // Pivot coordinate in 3D scene
  axis: [number, number, number]; // Unit vector, e.g. [1, 0, 0], [0, 1, 0]
  limits: JointLimits;
  clearanceMm?: number;
  visual?: JointVisualFeatures;
  currentValue?: number;
}

export interface DesignConceptUnderstanding {
  intent: string;
  operatingPrinciple: string;
  manufacturabilityNotes?: string;
  suggestedMaterials?: string[];
}

export interface DesignSpecification {
  id?: string;
  name: string;
  description: string;
  category?: string;
  version?: string;
  concept?: DesignConceptUnderstanding;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
  parts: PartDefinition[];
  joints: JointDefinition[];
}
