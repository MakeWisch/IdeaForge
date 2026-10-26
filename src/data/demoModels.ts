import { DesignSpecification } from '../types/design';

/**
 * 1. DUAL-HINGE FOLDING PHONE STAND
 * Engineered with machined bevels, interlocking knuckle clevises, and ground stainless pins.
 */
export const DEMO_PHONE_STAND: DesignSpecification = {
  id: 'demo-phone-stand',
  name: 'CNC Machined Folding Phone Stand',
  description: 'Precision articulating desk stand with dual interlocking clevis hinges, counterweighted base, and silicone anti-slip retention shelf.',
  category: 'Consumer Product / Hardware',
  version: '2.0',
  concept: {
    intent: 'Sturdy, infinitely adjustable desktop mount for smartphones and small tablets.',
    operatingPrinciple: 'Dual friction-hinge kinematic chain allowing independent adjustment of elevation angle and screen tilt angle.',
    suggestedMaterials: ['6061-T6 Anodized Aluminum', 'Stainless Steel 304 Hinge Pins', 'Molded Shore 60A Silicone Pads']
  },
  dimensions: { width: 7.5, height: 11.0, depth: 9.0, unit: 'cm' },
  parts: [
    {
      id: 'base_chassis',
      name: 'Counterweighted Base Plate',
      role: 'base',
      parentId: null,
      geometry: {
        type: 'machined_plate',
        dimensions: [7.5, 0.6, 9.0],
        features: { cornerRadius: 0.8, bevel: 0.08 }
      },
      transform: { position: [0, 0.3, 0], rotation: [0, 0, 0] },
      material: {
        name: 'Space Gray Anodized Aluminum',
        color: '#27272a',
        roughness: 0.3,
        metalness: 0.85,
        finish: 'anodized'
      },
      physics: { isStatic: true, massKg: 0.28 }
    },
    {
      id: 'base_clevis_bracket',
      name: 'Base Hinge Clevis Knuckles',
      role: 'structural',
      parentId: 'base_chassis',
      geometry: {
        type: 'hinge_bracket',
        dimensions: [4.6, 0.9, 1.2],
        features: { chamfer: 0.05 }
      },
      transform: { position: [0, 0.8, -3.2], rotation: [0, 0, 0] },
      material: {
        name: 'Machined Clevis Bracket',
        color: '#3f3f46',
        roughness: 0.35,
        metalness: 0.8
      }
    },
    {
      id: 'base_hinge_pin',
      name: 'Lower Stainless Pivot Pin',
      role: 'fastener',
      parentId: 'base_clevis_bracket',
      geometry: {
        type: 'hinge_pin',
        dimensions: [0.18, 0.18, 5.0]
      },
      transform: { position: [0, 0.9, -3.2], rotation: [0, 0, 90] },
      material: {
        name: 'Ground 304 Stainless Pin',
        color: '#e2e8f0',
        roughness: 0.15,
        metalness: 0.95,
        finish: 'brushed'
      }
    },
    {
      id: 'primary_boom_arm',
      name: 'Twin-Beam Articulating Boom',
      role: 'linkage',
      parentId: 'base_chassis',
      geometry: {
        type: 'linkage_arm',
        dimensions: [2.8, 0.5, 7.5],
        features: { cornerRadius: 0.3 }
      },
      transform: { position: [0, 3.8, -1.2], rotation: [-40, 0, 0] },
      material: {
        name: 'Cobalt Blue Anodized Arm',
        color: '#2563eb',
        roughness: 0.25,
        metalness: 0.75,
        finish: 'anodized'
      },
      physics: { massKg: 0.12 }
    },
    {
      id: 'upper_clevis_knuckle',
      name: 'Cradle Hinge Knuckle',
      role: 'structural',
      parentId: 'primary_boom_arm',
      geometry: {
        type: 'hinge_bracket',
        dimensions: [3.8, 0.7, 1.0]
      },
      transform: { position: [0, 6.7, 0.8], rotation: [0, 0, 0] },
      material: {
        name: 'Machined Aluminum Pivot Knuckle',
        color: '#3b82f6',
        roughness: 0.3,
        metalness: 0.8
      }
    },
    {
      id: 'upper_hinge_pin',
      name: 'Upper Stainless Pivot Pin',
      role: 'fastener',
      parentId: 'upper_clevis_knuckle',
      geometry: {
        type: 'hinge_pin',
        dimensions: [0.18, 0.18, 4.2]
      },
      transform: { position: [0, 6.8, 0.8], rotation: [0, 0, 90] },
      material: {
        name: 'Ground Stainless Pin',
        color: '#e2e8f0',
        roughness: 0.15,
        metalness: 0.95
      }
    },
    {
      id: 'phone_cradle_deck',
      name: 'Slotted Phone Backplate',
      role: 'structural',
      parentId: 'primary_boom_arm',
      geometry: {
        type: 'machined_plate',
        dimensions: [7.2, 0.4, 9.8],
        features: { cornerRadius: 0.6, bevel: 0.05 }
      },
      transform: { position: [0, 7.5, 2.2], rotation: [25, 0, 0] },
      material: {
        name: 'Matte Jet Black Backplate',
        color: '#18181b',
        roughness: 0.4,
        metalness: 0.6
      }
    },
    {
      id: 'silicone_retaining_shelf',
      name: 'Anti-Slip Retention Shelf Lip',
      role: 'effector',
      parentId: 'phone_cradle_deck',
      geometry: {
        type: 'machined_plate',
        dimensions: [7.2, 1.0, 1.4],
        features: { cornerRadius: 0.2 }
      },
      transform: { position: [0, 3.8, 0.5], rotation: [25, 0, 0] },
      material: {
        name: 'High-Grip Amber Silicone Pad',
        color: '#f59e0b',
        roughness: 0.85,
        metalness: 0.05,
        finish: 'rubberized'
      }
    }
  ],
  joints: [
    {
      id: 'joint_base_angle',
      name: 'Base Elevation Friction Hinge',
      type: 'revolute',
      parentPartId: 'base_chassis',
      childPartId: 'primary_boom_arm',
      anchor: [0, 0.9, -3.2],
      axis: [1, 0, 0],
      limits: { min: -75, max: 20, default: -40, unit: 'deg' },
      clearanceMm: 0.25,
      currentValue: -40
    },
    {
      id: 'joint_cradle_tilt',
      name: 'Cradle Viewing Tilt Hinge',
      type: 'revolute',
      parentPartId: 'primary_boom_arm',
      childPartId: 'phone_cradle_deck',
      anchor: [0, 6.8, 0.8],
      axis: [1, 0, 0],
      limits: { min: -35, max: 80, default: 25, unit: 'deg' },
      clearanceMm: 0.2,
      currentValue: 25
    }
  ]
};

/**
 * 2. PRECISION HINGED STORAGE BOX WITH SNAP CLASP
 */
export const DEMO_HINGED_BOX: DesignSpecification = {
  id: 'demo-hinged-box',
  name: 'Sealed Enclosure with Cam Clasp',
  description: 'Industrial gasketed case featuring interlocking perimeter hinge barrels and a sliding compression toggle bolt.',
  category: 'Industrial / Enclosure',
  version: '2.0',
  concept: {
    intent: 'IP67 dust/water resistant protective hardware casing.',
    operatingPrinciple: 'Rear multi-barrel piano hinge combined with front linear compression latch to seal silicone O-ring.',
    suggestedMaterials: ['Impact Copolymer Polypropylene', 'Zinc Alloy Die-Cast Latch', 'Brass Hinge Dowel']
  },
  dimensions: { width: 9.0, height: 4.5, depth: 7.0, unit: 'cm' },
  parts: [
    {
      id: 'box_tub',
      name: 'Deep Storage Lower Basin',
      role: 'base',
      parentId: null,
      geometry: {
        type: 'machined_plate',
        dimensions: [8.8, 3.2, 6.8],
        features: { cornerRadius: 0.5, bevel: 0.06 }
      },
      transform: { position: [0, 1.6, 0], rotation: [0, 0, 0] },
      material: {
        name: 'Matte Industrial Olive Polymer',
        color: '#1c1917',
        roughness: 0.55,
        metalness: 0.3
      },
      physics: { isStatic: true, massKg: 0.35 }
    },
    {
      id: 'box_rear_hinge_knuckles',
      name: 'Interlocking Hinge Knuckles',
      role: 'structural',
      parentId: 'box_tub',
      geometry: {
        type: 'hinge_bracket',
        dimensions: [7.8, 0.6, 0.8]
      },
      transform: { position: [0, 3.1, -3.4], rotation: [0, 0, 0] },
      material: { color: '#292524', roughness: 0.4, metalness: 0.5 }
    },
    {
      id: 'hinge_through_pin',
      name: 'Continuous Stainless Hinge Dowel',
      role: 'fastener',
      parentId: 'box_rear_hinge_knuckles',
      geometry: {
        type: 'hinge_pin',
        dimensions: [0.15, 0.15, 8.2]
      },
      transform: { position: [0, 3.2, -3.4], rotation: [0, 0, 90] },
      material: { color: '#d4d4d8', roughness: 0.15, metalness: 0.95 }
    },
    {
      id: 'box_cover_lid',
      name: 'Reinforced Upper Cover Lid',
      role: 'enclosure',
      parentId: 'box_tub',
      geometry: {
        type: 'machined_plate',
        dimensions: [8.8, 0.6, 6.8],
        features: { cornerRadius: 0.5, bevel: 0.06 }
      },
      transform: { position: [0, 3.5, 0], rotation: [0, 0, 0] },
      material: {
        name: 'Hi-Vis Safety Orange Shell',
        color: '#ea580c',
        roughness: 0.35,
        metalness: 0.25
      }
    },
    {
      id: 'latch_guide_track',
      name: 'Front Latch Retention Guide',
      role: 'guide',
      parentId: 'box_tub',
      geometry: {
        type: 'rail_track',
        dimensions: [3.4, 0.4, 0.4]
      },
      transform: { position: [0, 2.4, 3.55], rotation: [0, 0, 0] },
      material: { color: '#44403c', roughness: 0.3, metalness: 0.8 }
    },
    {
      id: 'front_slide_clasp',
      name: 'Linear Locking Cam Bolt',
      role: 'actuator',
      parentId: 'latch_guide_track',
      geometry: {
        type: 'slider_carriage',
        dimensions: [1.6, 0.6, 0.6]
      },
      transform: { position: [0, 2.4, 3.65], rotation: [0, 0, 0] },
      material: {
        name: 'Polished Brass Cam Bolt',
        color: '#eab308',
        roughness: 0.2,
        metalness: 0.9
      }
    }
  ],
  joints: [
    {
      id: 'joint_lid_hinge',
      name: 'Rear Lid Piano Hinge',
      type: 'revolute',
      parentPartId: 'box_tub',
      childPartId: 'box_cover_lid',
      anchor: [0, 3.2, -3.4],
      axis: [1, 0, 0],
      limits: { min: 0, max: 115, default: 0, unit: 'deg' },
      clearanceMm: 0.2,
      currentValue: 0
    },
    {
      id: 'joint_latch_slide',
      name: 'Cam Lock Slide Track',
      type: 'prismatic',
      parentPartId: 'box_tub',
      childPartId: 'front_slide_clasp',
      anchor: [0, 2.4, 3.65],
      axis: [1, 0, 0],
      limits: { min: -1.0, max: 1.0, default: 0, unit: 'mm' },
      clearanceMm: 0.15,
      currentValue: 0
    }
  ]
};

/**
 * 3. 3-AXIS INDUSTRIAL ROBOTIC ARM
 * Turntable azimuth, dual clevis shoulder, counterbalanced forearm, and parallel sliding gripper.
 */
export const DEMO_ROBOTIC_ARM: DesignSpecification = {
  id: 'demo-robotic-arm',
  name: '3-Axis Articulated Cobot Arm',
  description: 'Precision robotic workstation arm featuring a rotational slew ring base, pitching linkage booms, and a synchronized parallel pneumatic gripper.',
  category: 'Robotics / Industrial Automation',
  version: '2.0',
  concept: {
    intent: 'Tabletop pick-and-place manipulator for laboratory and light manufacturing assembly.',
    operatingPrinciple: '3-DOF revolute serial kinematic chain with linear prismatic end-effector jaw actuation.',
    suggestedMaterials: ['Cast A380 Aluminum Alloy', 'Titanium Nitride Coated Pins', 'Carbon Fiber Composite Tubes']
  },
  dimensions: { width: 6.0, height: 14.0, depth: 6.0, unit: 'cm' },
  parts: [
    {
      id: 'robot_base_turret',
      name: 'Rigid Slew Ring Base',
      role: 'base',
      parentId: null,
      geometry: {
        type: 'cylinder',
        dimensions: [2.8, 3.2, 1.2]
      },
      transform: { position: [0, 0.6, 0], rotation: [0, 0, 0] },
      material: { color: '#09090b', roughness: 0.5, metalness: 0.9 },
      physics: { isStatic: true, massKg: 1.2 }
    },
    {
      id: 'azimuth_swivel_turret',
      name: 'Shoulder Azimuth Swivel Turret',
      role: 'structural',
      parentId: 'robot_base_turret',
      geometry: {
        type: 'machined_plate',
        dimensions: [3.4, 2.4, 3.0],
        features: { cornerRadius: 0.4 }
      },
      transform: { position: [0, 2.2, 0], rotation: [0, 0, 0] },
      material: { color: '#dc2626', roughness: 0.35, metalness: 0.5 }
    },
    {
      id: 'shoulder_pivot_pin',
      name: 'Shoulder Hardened Pivot Pin',
      role: 'fastener',
      parentId: 'azimuth_swivel_turret',
      geometry: {
        type: 'hinge_pin',
        dimensions: [0.3, 0.3, 3.8]
      },
      transform: { position: [0, 2.8, 0], rotation: [0, 0, 90] },
      material: { color: '#f1f5f9', roughness: 0.1, metalness: 0.95 }
    },
    {
      id: 'primary_bicep_boom',
      name: 'High-Rigidity Bicep Boom',
      role: 'linkage',
      parentId: 'azimuth_swivel_turret',
      geometry: {
        type: 'linkage_arm',
        dimensions: [1.8, 0.8, 6.2]
      },
      transform: { position: [0, 5.2, 1.2], rotation: [28, 0, 0] },
      material: { color: '#ea580c', roughness: 0.3, metalness: 0.6 }
    },
    {
      id: 'elbow_clevis_joint',
      name: 'Elbow Harmonic Drive Casing',
      role: 'structural',
      parentId: 'primary_bicep_boom',
      geometry: {
        type: 'hinge_bracket',
        dimensions: [2.2, 1.6, 1.8]
      },
      transform: { position: [0, 7.8, 2.6], rotation: [0, 0, 0] },
      material: { color: '#eab308', roughness: 0.35, metalness: 0.6 }
    },
    {
      id: 'forearm_carbon_link',
      name: 'Forearm Extension Boom',
      role: 'linkage',
      parentId: 'elbow_clevis_joint',
      geometry: {
        type: 'linkage_arm',
        dimensions: [1.4, 0.6, 5.2]
      },
      transform: { position: [0, 10.2, 3.6], rotation: [-35, 0, 0] },
      material: { color: '#059669', roughness: 0.25, metalness: 0.7 }
    },
    {
      id: 'wrist_gripper_manifold',
      name: 'Pneumatic Gripper Manifold',
      role: 'effector',
      parentId: 'forearm_carbon_link',
      geometry: {
        type: 'machined_plate',
        dimensions: [2.6, 0.8, 1.6]
      },
      transform: { position: [0, 12.6, 4.4], rotation: [0, 0, 0] },
      material: { color: '#0284c7', roughness: 0.3, metalness: 0.85 }
    },
    {
      id: 'gripper_finger_a',
      name: 'Machined Gripper Jaw Left',
      role: 'effector',
      parentId: 'wrist_gripper_manifold',
      geometry: {
        type: 'slider_carriage',
        dimensions: [0.5, 1.6, 0.8]
      },
      transform: { position: [-0.65, 13.8, 4.4], rotation: [0, 0, 0] },
      material: { color: '#f43f5e', roughness: 0.2, metalness: 0.9 }
    },
    {
      id: 'gripper_finger_b',
      name: 'Machined Gripper Jaw Right',
      role: 'effector',
      parentId: 'wrist_gripper_manifold',
      geometry: {
        type: 'slider_carriage',
        dimensions: [0.5, 1.6, 0.8]
      },
      transform: { position: [0.65, 13.8, 4.4], rotation: [0, 0, 0] },
      material: { color: '#f43f5e', roughness: 0.2, metalness: 0.9 }
    }
  ],
  joints: [
    {
      id: 'joint_azimuth_turntable',
      name: 'Base Turntable (Yaw Axis)',
      type: 'revolute',
      parentPartId: 'robot_base_turret',
      childPartId: 'azimuth_swivel_turret',
      anchor: [0, 1.2, 0],
      axis: [0, 1, 0],
      limits: { min: -170, max: 170, default: 0, unit: 'deg' },
      clearanceMm: 0.1,
      currentValue: 0
    },
    {
      id: 'joint_shoulder_pitch',
      name: 'Shoulder Elevation (Pitch Axis)',
      type: 'revolute',
      parentPartId: 'azimuth_swivel_turret',
      childPartId: 'primary_bicep_boom',
      anchor: [0, 2.8, 0],
      axis: [1, 0, 0],
      limits: { min: -25, max: 85, default: 28, unit: 'deg' },
      clearanceMm: 0.2,
      currentValue: 28
    },
    {
      id: 'joint_elbow_pitch',
      name: 'Elbow Articulation',
      type: 'revolute',
      parentPartId: 'primary_bicep_boom',
      childPartId: 'forearm_carbon_link',
      anchor: [0, 7.8, 2.6],
      axis: [1, 0, 0],
      limits: { min: -95, max: 65, default: -35, unit: 'deg' },
      clearanceMm: 0.2,
      currentValue: -35
    },
    {
      id: 'joint_gripper_slide',
      name: 'Pneumatic Parallel Jaw Stroke',
      type: 'prismatic',
      parentPartId: 'wrist_gripper_manifold',
      childPartId: 'gripper_finger_a',
      anchor: [0, 13.8, 4.4],
      axis: [1, 0, 0],
      limits: { min: 0.1, max: 0.8, default: 0.5, unit: 'mm' },
      clearanceMm: 0.05,
      currentValue: 0.5
    }
  ]
};

/**
 * 4. MECHANICAL OVER-CENTER TOGGLE LATCH
 * Believable industrial clamping mechanism with connected over-center geometry.
 */
export const DEMO_MECHANICAL_LATCH: DesignSpecification = {
  id: 'demo-mechanical-latch',
  name: 'Over-Center Industrial Draw Latch',
  description: 'Heavy-duty toggle draw latch creating high clamping tension via over-center geometry and spring-loaded keeper.',
  category: 'Mechanical / Fastening',
  version: '2.0',
  concept: {
    intent: 'Vibration-proof compression closure for flight cases and engine cowlings.',
    operatingPrinciple: 'Four-bar linkage moving through dead-center alignment to mechanically lock under tension.',
    suggestedMaterials: ['Drop Forged Carbon Steel', 'Electroless Nickel Plating', 'Stainless Steel Pivot Rivets']
  },
  dimensions: { width: 3.5, height: 2.2, depth: 8.5, unit: 'cm' },
  parts: [
    {
      id: 'latch_mounting_base',
      name: 'Mounting Base Flange',
      role: 'base',
      parentId: null,
      geometry: {
        type: 'machined_plate',
        dimensions: [3.4, 0.4, 4.2],
        features: { cornerRadius: 0.3 }
      },
      transform: { position: [0, 0.2, -1.8], rotation: [0, 0, 0] },
      material: { color: '#334155', roughness: 0.4, metalness: 0.85 },
      physics: { isStatic: true, massKg: 0.15 }
    },
    {
      id: 'keeper_strike_plate',
      name: 'Mating Keeper Catch',
      role: 'structural',
      parentId: null,
      geometry: {
        type: 'machined_plate',
        dimensions: [3.4, 0.8, 2.2],
        features: { bevel: 0.06 }
      },
      transform: { position: [0, 0.4, 3.2], rotation: [0, 0, 0] },
      material: { color: '#475569', roughness: 0.35, metalness: 0.85 },
      physics: { isStatic: true, massKg: 0.08 }
    },
    {
      id: 'lever_handle',
      name: 'Primary Toggle Lever Handle',
      role: 'actuator',
      parentId: 'latch_mounting_base',
      geometry: {
        type: 'linkage_arm',
        dimensions: [2.2, 0.35, 5.0]
      },
      transform: { position: [0, 0.9, -0.6], rotation: [-15, 0, 0] },
      material: { color: '#0284c7', roughness: 0.25, metalness: 0.75 }
    },
    {
      id: 'draw_hook_wire',
      name: 'Clamping Hook Loop',
      role: 'linkage',
      parentId: 'lever_handle',
      geometry: {
        type: 'machined_plate',
        dimensions: [2.6, 0.3, 3.8],
        features: { cornerRadius: 0.2 }
      },
      transform: { position: [0, 0.7, 1.4], rotation: [5, 0, 0] },
      material: { color: '#e2e8f0', roughness: 0.15, metalness: 0.95 }
    }
  ],
  joints: [
    {
      id: 'joint_lever_pivot',
      name: 'Base Toggle Lever Hinge',
      type: 'revolute',
      parentPartId: 'latch_mounting_base',
      childPartId: 'lever_handle',
      anchor: [0, 0.4, -2.2],
      axis: [1, 0, 0],
      limits: { min: -70, max: 25, default: -15, unit: 'deg' },
      clearanceMm: 0.15,
      currentValue: -15
    },
    {
      id: 'joint_hook_pivot',
      name: 'Hook Tension Hinge',
      type: 'revolute',
      parentPartId: 'lever_handle',
      childPartId: 'draw_hook_wire',
      anchor: [0, 0.8, -0.4],
      axis: [1, 0, 0],
      limits: { min: -40, max: 50, default: 5, unit: 'deg' },
      clearanceMm: 0.15,
      currentValue: 5
    }
  ]
};

/**
 * 5. PORTABLE KINETIC CHESSBOARD MECHANISM
 * The exact concept from the user's prompt! A physical chessboard mechanism with
 * sub-board linear XY guide tracks and an articulating magnetic linkage that pulls squares.
 */
export const DEMO_KINETIC_CHESSBOARD: DesignSpecification = {
  id: 'demo-kinetic-chessboard',
  name: 'Kinetic Mechanical Chessboard',
  description: 'Physical chessboard equipped with an under-board CoreXY linear linkage and magnetic attraction carriage capable of pulling playing squares autonomously.',
  category: 'Invention / Kinetic Mechanism',
  version: '2.0',
  concept: {
    intent: 'Portable interactive chessboard where physical squares and pieces articulate via under-board mechanical coupling.',
    operatingPrinciple: 'Under-board orthogonal linear slide rails carrying a rare-earth neodymium magnetic shuttle that couples through a non-ferrous surface deck.',
    suggestedMaterials: ['Hard Maple & Walnut Surface Deck', 'Hard Coat Anodized Aluminum V-Rails', 'Neodymium N52 Magnets']
  },
  dimensions: { width: 10.0, height: 2.2, depth: 10.0, unit: 'cm' },
  parts: [
    {
      id: 'chessboard_surface_deck',
      name: 'Chessboard Top Surface Deck',
      role: 'base',
      parentId: null,
      geometry: {
        type: 'machined_plate',
        dimensions: [10.0, 0.4, 10.0],
        features: { cornerRadius: 0.6, bevel: 0.05 }
      },
      transform: { position: [0, 1.8, 0], rotation: [0, 0, 0] },
      material: {
        name: 'Fine Satin Hardwood Deck',
        color: '#78350f',
        roughness: 0.6,
        metalness: 0.05,
        finish: 'matte'
      },
      physics: { isStatic: true, massKg: 0.6 }
    },
    {
      id: 'perimeter_housing_frame',
      name: 'Machined Lower Chassis Frame',
      role: 'structural',
      parentId: 'chessboard_surface_deck',
      geometry: {
        type: 'machined_plate',
        dimensions: [10.4, 1.4, 10.4],
        features: { cornerRadius: 0.8 }
      },
      transform: { position: [0, 0.9, 0], rotation: [0, 0, 0] },
      material: { color: '#1c1917', roughness: 0.4, metalness: 0.75 }
    },
    {
      id: 'sub_board_x_rail',
      name: 'X-Axis Precision Linear Guide Rail',
      role: 'guide',
      parentId: 'chessboard_surface_deck',
      geometry: {
        type: 'rail_track',
        dimensions: [0.6, 0.35, 8.8]
      },
      transform: { position: [0, 1.2, 0], rotation: [0, 0, 0] },
      material: { color: '#94a3b8', roughness: 0.2, metalness: 0.95 }
    },
    {
      id: 'magnetic_shuttle_carriage',
      name: 'Magnetic Attraction Shuttle Carriage',
      role: 'actuator',
      parentId: 'sub_board_x_rail',
      geometry: {
        type: 'slider_carriage',
        dimensions: [1.8, 0.5, 1.8]
      },
      transform: { position: [0, 1.4, 0], rotation: [0, 0, 0] },
      material: { color: '#d97706', roughness: 0.3, metalness: 0.85 }
    },
    {
      id: 'articulating_piece_puck',
      name: 'Kinetic Chess Square Target Puck',
      role: 'effector',
      parentId: 'magnetic_shuttle_carriage',
      geometry: {
        type: 'machined_plate',
        dimensions: [1.8, 0.3, 1.8],
        features: { cornerRadius: 0.2 }
      },
      transform: { position: [0, 2.2, 0], rotation: [0, 0, 0] },
      material: {
        name: 'Polished Brass Master Square',
        color: '#facc15',
        roughness: 0.15,
        metalness: 0.9
      }
    }
  ],
  joints: [
    {
      id: 'joint_shuttle_slide_x',
      name: 'X-Axis Mechanical Rail Slide',
      type: 'prismatic',
      parentPartId: 'chessboard_surface_deck',
      childPartId: 'magnetic_shuttle_carriage',
      anchor: [0, 1.4, 0],
      axis: [0, 0, 1],
      limits: { min: -3.5, max: 3.5, default: 0, unit: 'mm' },
      clearanceMm: 0.1,
      currentValue: 0
    },
    {
      id: 'joint_piece_follow',
      name: 'Magnetic Coupled Slave Track',
      type: 'prismatic',
      parentPartId: 'magnetic_shuttle_carriage',
      childPartId: 'articulating_piece_puck',
      anchor: [0, 2.2, 0],
      axis: [0, 0, 1],
      limits: { min: -0.1, max: 0.1, default: 0, unit: 'mm' },
      clearanceMm: 0.05,
      currentValue: 0
    }
  ]
};

export const DEMO_MODELS: Record<string, DesignSpecification> = {
  'phone-stand': DEMO_PHONE_STAND,
  'hinged-box': DEMO_HINGED_BOX,
  'robotic-arm': DEMO_ROBOTIC_ARM,
  'mechanical-latch': DEMO_MECHANICAL_LATCH,
  'kinetic-chessboard': DEMO_KINETIC_CHESSBOARD
};
