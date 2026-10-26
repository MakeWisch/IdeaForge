import { DesignSpecification, PartDefinition, JointDefinition } from '../types/design';

/**
 * Validates and sanitizes an AI-generated or imported DesignSpecification,
 * ensuring valid 3D numbers, geometry types, and mechanical joint constraints.
 */
export function validateAndSanitizeDesign(raw: any, fallbackName = 'Custom Mechanism'): DesignSpecification {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid DesignSpecification: Expected an object.');
  }

  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : fallbackName;
  const description = typeof raw.description === 'string' ? raw.description : '3D Mechanical Design Model';
  const category = typeof raw.category === 'string' ? raw.category : 'Invention';

  const rawParts = Array.isArray(raw.parts) ? raw.parts : [];
  const sanitizedParts: PartDefinition[] = [];
  const partIds = new Set<string>();

  rawParts.forEach((p: any, idx: number) => {
    if (!p || typeof p !== 'object') return;

    const id = typeof p.id === 'string' && p.id.trim() ? p.id.trim() : `part_${idx + 1}`;
    partIds.add(id);

    // Validate geometry
    const validGeomTypes = [
      'machined_plate', 'hinge_bracket', 'hinge_pin', 'linkage_arm',
      'rail_track', 'slider_carriage', 'box', 'cylinder', 'sphere', 'capsule', 'plane', 'mesh_url'
    ];
    const geomType = validGeomTypes.includes(p.geometry?.type)
      ? p.geometry.type
      : 'box';

    let dimensions = Array.isArray(p.geometry?.dimensions) ? p.geometry.dimensions.map(Number) : [1, 1, 1];
    if (dimensions.some(isNaN) || dimensions.length === 0) {
      dimensions = [1, 1, 1];
    }

    // Validate transform
    const pos = Array.isArray(p.transform?.position) && p.transform.position.length >= 3
      ? [Number(p.transform.position[0]) || 0, Number(p.transform.position[1]) || 0, Number(p.transform.position[2]) || 0]
      : [0, 0, 0];

    const rot = Array.isArray(p.transform?.rotation) && p.transform.rotation.length >= 3
      ? [Number(p.transform.rotation[0]) || 0, Number(p.transform.rotation[1]) || 0, Number(p.transform.rotation[2]) || 0]
      : [0, 0, 0];

    // Validate material
    const color = typeof p.material?.color === 'string' && p.material.color.startsWith('#')
      ? p.material.color
      : '#3b82f6';

    sanitizedParts.push({
      id,
      name: typeof p.name === 'string' && p.name.trim() ? p.name.trim() : `Component ${idx + 1}`,
      role: p.role || 'structural',
      parentId: typeof p.parentId === 'string' && p.parentId ? p.parentId : null,
      geometry: {
        type: geomType,
        dimensions,
        meshUrl: p.geometry?.meshUrl,
        features: p.geometry?.features
      },
      transform: {
        position: pos as [number, number, number],
        rotation: rot as [number, number, number],
        scale: [1, 1, 1]
      },
      material: {
        name: p.material?.name || 'Engineered Finish',
        color,
        roughness: typeof p.material?.roughness === 'number' ? Math.max(0, Math.min(1, p.material.roughness)) : 0.35,
        metalness: typeof p.material?.metalness === 'number' ? Math.max(0, Math.min(1, p.material.metalness)) : 0.75,
        clearcoat: typeof p.material?.clearcoat === 'number' ? Math.max(0, Math.min(1, p.material.clearcoat)) : 0.2,
        opacity: typeof p.material?.opacity === 'number' ? Math.max(0, Math.min(1, p.material.opacity)) : 1,
        transparent: Boolean(p.material?.transparent),
        wireframe: Boolean(p.material?.wireframe),
        finish: p.material?.finish || 'anodized'
      },
      physics: {
        isStatic: Boolean(p.physics?.isStatic),
        massKg: typeof p.physics?.massKg === 'number' ? p.physics.massKg : 0.2
      },
      visible: p.visible !== false
    });
  });

  // Ensure at least one part exists
  if (sanitizedParts.length === 0) {
    sanitizedParts.push({
      id: 'base_part',
      name: 'Base Component',
      parentId: null,
      geometry: { type: 'box', dimensions: [2, 0.5, 2] },
      transform: { position: [0, 0.25, 0], rotation: [0, 0, 0] },
      material: { color: '#3b82f6', roughness: 0.4, metalness: 0.5 }
    });
    partIds.add('base_part');
  }

  // Validate joints
  const rawJoints = Array.isArray(raw.joints) ? raw.joints : [];
  const sanitizedJoints: JointDefinition[] = [];

  rawJoints.forEach((j: any, idx: number) => {
    if (!j || typeof j !== 'object') return;

    // Check parent and child parts exist
    const parentId = typeof j.parentPartId === 'string' ? j.parentPartId : sanitizedParts[0]?.id;
    const childId = typeof j.childPartId === 'string' ? j.childPartId : sanitizedParts[1]?.id;

    if (!parentId || !childId || parentId === childId) return;

    const jType = ['fixed', 'revolute', 'prismatic'].includes(j.type) ? j.type : 'revolute';

    const anchor = Array.isArray(j.anchor) && j.anchor.length >= 3
      ? [Number(j.anchor[0]) || 0, Number(j.anchor[1]) || 0, Number(j.anchor[2]) || 0]
      : [0, 0, 0];

    let axis = Array.isArray(j.axis) && j.axis.length >= 3
      ? [Number(j.axis[0]) || 0, Number(j.axis[1]) || 0, Number(j.axis[2]) || 0]
      : [1, 0, 0];

    // Ensure non-zero axis
    if (axis[0] === 0 && axis[1] === 0 && axis[2] === 0) {
      axis = [1, 0, 0];
    }

    const min = typeof j.limits?.min === 'number' ? j.limits.min : (jType === 'revolute' ? -90 : 0);
    const max = typeof j.limits?.max === 'number' ? j.limits.max : (jType === 'revolute' ? 90 : 1);
    const def = typeof j.limits?.default === 'number' ? j.limits.default : (j.currentValue ?? (min + max) / 2);

    sanitizedJoints.push({
      id: typeof j.id === 'string' && j.id.trim() ? j.id.trim() : `joint_${idx + 1}`,
      name: typeof j.name === 'string' && j.name.trim() ? j.name.trim() : `Joint ${idx + 1}`,
      type: jType,
      parentPartId: parentId,
      childPartId: childId,
      anchor: anchor as [number, number, number],
      axis: axis as [number, number, number],
      limits: {
        min: Math.min(min, max),
        max: Math.max(min, max),
        default: def,
        unit: j.limits?.unit || (jType === 'revolute' ? 'deg' : 'mm')
      },
      currentValue: def
    });
  });

  return {
    id: raw.id || `design_${Date.now()}`,
    name,
    description,
    category,
    version: raw.version || '1.0',
    dimensions: raw.dimensions || { width: 3.5, height: 4.0, depth: 3.0, unit: 'cm' },
    parts: sanitizedParts,
    joints: sanitizedJoints
  };
}
