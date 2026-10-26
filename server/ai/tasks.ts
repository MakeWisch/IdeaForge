import { TaskType } from "./types";

export interface TaskDefinition {
  systemInstruction: string;
  buildPrompt: (input: string, context?: Record<string, any>) => string;
  schemaDescription: string;
}

export const TASKS: Record<TaskType, TaskDefinition> = {
  generate_3d_design: {
    systemInstruction: `You are an expert mechanical design engineer and CAD architect at IdeaForge.
Your core goal is: IDEA -> UNDERSTAND CONCEPT -> DESIGN BELIEVABLE PHYSICAL OBJECT -> GENERATE 3D GEOMETRY -> DEFINE MECHANICAL COMPONENTS & CONSTRAINTS.

CRITICAL RULES:
1. DO NOT interpret objects as random floating primitive shapes. Design a believable, physically manufactured product.
2. Ensure realistic proportions, coherent geometry, believable PBR materials (e.g. anodized aluminum, matte polycarbonate, stainless steel, brass), and mechanically plausible construction.
3. Connected components MUST physically mate: no floating components, no arbitrary gaps, proper clearances (0.1-0.5 mm).
4. Mechanical joints (revolute/hinge, prismatic/slider) must connect actual components with realistic anchor pivot points, rotation/translation axes, and physical limits.
5. Structure into 4 layers: Visual geometry, Mechanical components with roles, Kinematic joints & constraints, Physics properties (isStatic base, mass).`,
    buildPrompt: (input: string) => `Understand this invention concept and engineer a complete, physically believable 3D CAD design specification:
Concept: "${input}"

Provide:
1. "concept": { "intent", "operatingPrinciple", "suggestedMaterials" }
2. 5 to 12 coherent mechanical components with roles ('base', 'structural', 'linkage', 'actuator', 'fastener', 'effector', 'guide')
3. Realistic dimensions [width, height, depth], transforms [x,y,z], and rotations [rx,ry,rz] in degrees
4. At least 1 to 4 mechanical joints (revolute/hinge, prismatic/slider) connecting components with exact anchor points and unit vector axes.`,
    schemaDescription: `{
  "name": "Believable Product Title",
  "description": "Concise engineering description of the mechanism and operating principle",
  "category": "Consumer / Industrial / Mechanism / Robotics",
  "concept": {
    "intent": "What the invention accomplishes",
    "operatingPrinciple": "Kinematic mechanism explanation",
    "suggestedMaterials": ["6061 Aluminum", "Stainless 304", "Acetal"]
  },
  "dimensions": { "width": 4.0, "height": 3.5, "depth": 3.0, "unit": "cm" },
  "parts": [
    {
      "id": "base_chassis",
      "name": "Component Name",
      "role": "base" | "structural" | "linkage" | "actuator" | "fastener" | "effector" | "guide",
      "parentId": null | "parent_part_id",
      "geometry": {
        "type": "machined_plate" | "hinge_bracket" | "hinge_pin" | "linkage_arm" | "rail_track" | "slider_carriage" | "box" | "cylinder" | "sphere" | "capsule",
        "dimensions": [number, number, number],
        "features": { "bevel": 0.05, "chamfer": 0.05, "cornerRadius": 0.1 }
      },
      "transform": { "position": [x, y, z], "rotation": [rx, ry, rz] },
      "material": {
        "name": "Anodized Aluminum",
        "color": "#hexcode",
        "roughness": 0.35,
        "metalness": 0.75,
        "finish": "anodized" | "brushed" | "matte" | "powder_coated"
      },
      "physics": { "isStatic": true | false, "massKg": 0.25 }
    }
  ],
  "joints": [
    {
      "id": "hinge_joint_1",
      "name": "Descriptive Joint Name",
      "type": "revolute" | "prismatic" | "fixed",
      "parentPartId": "base_chassis",
      "childPartId": "articulating_arm",
      "anchor": [x, y, z],
      "axis": [1, 0, 0] | [0, 1, 0] | [0, 0, 1],
      "limits": { "min": -90, "max": 90, "default": 0, "unit": "deg" | "mm" },
      "clearanceMm": 0.2
    }
  ]
}`
  },

  modify_3d_design: {
    systemInstruction: `You are an expert CAD engineer at IdeaForge.
The user wants to iteratively refine an existing 3D mechanism.
CRITICAL: Do NOT throw away the entire model or generate random unrelated geometry.
Modify the existing design specifically according to the user's feedback (e.g. adjust dimensions, move hinge pivot, change material, increase joint limits, add a bracket) while preserving overall assembly cohesion and kinematic connectivity.`,
    buildPrompt: (input: string, context?: Record<string, any>) => `Current Active 3D DesignSpecification:
${JSON.stringify(context?.currentSpec || {}, null, 2)}

User Iteration / Feedback:
"${input}"

Carefully modify the current specification to address this feedback. Keep unchanged components intact, update altered dimensions/transforms/joints, and return the complete updated DesignSpecification.`,
    schemaDescription: `Same as generate_3d_design schema.`
  },

  analyze_design: {
    systemInstruction: "You are a senior mechanical engineering auditor at IdeaForge.",
    buildPrompt: (input: string, context?: Record<string, any>) => `Audit this 3D mechanism design for mechanical feasibility, tolerances, and assembly:
${JSON.stringify(context?.currentSpec || input, null, 2)}`,
    schemaDescription: `{
  "kinematicFeasibility": "High" | "Medium" | "Low",
  "degreesOfFreedom": number,
  "loadPathAnalysis": "Summary of load paths and stress concentrations",
  "manufacturabilityRating": "8/10",
  "clearanceWarnings": ["Any potential interference or pinch point notes"],
  "recommendedRefinements": ["1-3 actionable engineering improvements"]
}`
  },

  analyze_idea: {
    systemInstruction: "You are the lead engineering architect and product invention director at IdeaForge. Deconstruct the user's concept using rigorous first-principles thinking across mechanics, physics, economics, and software.",
    buildPrompt: (input: string) => `Analyze this concept with first-principles depth:
Concept: "${input}"

Provide:
1. First-principles concept breakdown (core mechanism, root problem, beachhead adopters, operational physics/code, assumptions, bottlenecks, and the novelty hook).
2. 3-4 realistic stress-test vulnerabilities (technical, cost, logical, safety, or market) paired with clever engineering mitigations.
3. Exactly 3 distinct engineering architectures (e.g. Scrappy/Minimum Viable, Balanced/Commercial Grade, and Cutting-Edge/High-Performance).`,
    schemaDescription: `{
  "analysis": {
    "core": "Precise first-principles breakdown of the core concept in 1-2 punchy sentences",
    "problem": "The fundamental problem or bottleneck this solves",
    "user": "Specific beachhead user personas and target market",
    "how": "Mechanical / technical / computational operating principle explaining how it physically works",
    "assumptions": ["3 critical assumptions that must hold true"],
    "challenges": ["3 engineering, physics, market, or manufacturing hurdles"],
    "interesting": "The novel hook or unfair advantage that makes this fascinating"
  },
  "stressTest": [
    {
      "issue": "Specific failure mode or bottleneck",
      "type": "technical" | "cost" | "logical" | "safety" | "market",
      "solution": "Concrete engineering solution or clever workaround",
      "severity": "critical" | "moderate" | "safety"
    }
  ],
  "explore": [
    {
      "id": "1",
      "name": "Approach 1 Name (e.g. Scrappy / Minimum Viable / Lean)",
      "tagline": "Punchy 4-6 word description",
      "description": "Clear explanation of how this approach is architected",
      "pros": ["3 distinct advantages"],
      "cons": ["2 distinct trade-offs"],
      "difficulty": "Low" | "Medium" | "High",
      "complexity": "Key hardware, tools, or software stack needed",
      "estimatedCostRange": "$XX - $XX prototype cost",
      "timelineDays": "X-Y days"
    },
    {
      "id": "2",
      "name": "Approach 2 Name (e.g. Balanced / Commercial Grade)",
      "tagline": "Punchy 4-6 word description",
      "description": "Clear explanation of how this approach is architected",
      "pros": ["3 distinct advantages"],
      "cons": ["2 distinct trade-offs"],
      "difficulty": "Low" | "Medium" | "High",
      "complexity": "Key hardware, tools, or software stack needed",
      "estimatedCostRange": "$XX - $XX prototype cost",
      "timelineDays": "X-Y days"
    },
    {
      "id": "3",
      "name": "Approach 3 Name (e.g. Radical / High-Performance)",
      "tagline": "Punchy 4-6 word description",
      "description": "Clear explanation of how this approach is architected",
      "pros": ["3 distinct advantages"],
      "cons": ["2 distinct trade-offs"],
      "difficulty": "Low" | "Medium" | "High",
      "complexity": "Key hardware, tools, or software stack needed",
      "estimatedCostRange": "$XX - $XX prototype cost",
      "timelineDays": "X-Y days"
    }
  ]
}`
  },

  stress_test: {
    systemInstruction: "You are the chief risk mitigation engineer at IdeaForge.",
    buildPrompt: (input: string) => `Conduct an intense failure-mode analysis on this concept:
"${input}"`,
    schemaDescription: `{
  "stressTest": [
    {
      "issue": "Specific vulnerability or mechanical/financial bottleneck",
      "type": "technical" | "cost" | "logical" | "safety" | "market",
      "solution": "Actionable engineering workaround or redesign",
      "severity": "critical" | "moderate" | "safety"
    }
  ]
}`
  },

  generate_alternatives: {
    systemInstruction: "You are the system architect at IdeaForge.",
    buildPrompt: (input: string) => `Generate 3 distinct architectural implementation pathways for:
"${input}"`,
    schemaDescription: `{
  "explore": [
    {
      "id": "1",
      "name": "Approach Name",
      "tagline": "Short tagline",
      "description": "How this pathway works",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"],
      "difficulty": "Low" | "Medium" | "High",
      "complexity": "Key stack/hardware",
      "estimatedCostRange": "$XX - $XX",
      "timelineDays": "X-Y days"
    }
  ]
}`
  },

  prototype_plan: {
    systemInstruction: "You are the lead prototyping engineer at IdeaForge. Construct a build-ready benchtop prototype plan and interactive node topology.",
    buildPrompt: (input: string, context?: Record<string, any>) => {
      const approachName = context?.approach?.name || "Selected Architecture";
      const approachDesc = context?.approach?.description || "";
      return `Build a prototype plan and subsystem node topology for:
Concept: "${input}"
Selected Architecture: "${approachName}" - ${approachDesc}

Ensure:
- 5 to 7 modular subsystem nodes (brain, mechanism, sensor, power, component, structure) with specs.
- 5 to 8 directed signal/power/mechanical connections between nodes.
- 6 to 8 specific BOM components with pricing and sourcing channels.
- 5 sequential build phases with milestone validation pass/fail tests.
- 1 single critical Day-1 minimum test to validate before buying parts.`;
    },
    schemaDescription: `{
  "visualize": {
    "nodes": [
      {
        "id": "n1",
        "label": "Short Subsystem Name (e.g. Master MCU, Belt Gantry, Hall Array)",
        "desc": "Precise responsibility and role in the system",
        "type": "brain" | "mechanism" | "structure" | "component" | "sensor" | "power",
        "specs": "Specific part model, protocol, voltage, or key spec (e.g. ESP32-S3, 12V 5A, I2C, Delrin)"
      }
    ],
    "edges": [
      {
        "from": "n1",
        "to": "n2",
        "label": "Interaction label (e.g. sends coordinates, delivers 12V rail, mechanical linkage)",
        "flowType": "data" | "power" | "mechanical"
      }
    ]
  },
  "buildPlan": {
    "components": [
      {
        "name": "Exact component or material name",
        "spec": "Key technical rating or dimensions",
        "approxCost": "$XX",
        "source": "Where to buy (e.g. McMaster-Carr, Amazon, DigiKey, SendCutSend)"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "title": "Phase 1: Proof-of-Mechanism / Scrappy Benchtop",
        "details": "Detailed instructions on what to assemble and calibrate first",
        "milestoneValidation": "Definitive pass/fail condition before moving to step 2"
      }
    ],
    "difficulty": "X/10 (with summary explanation)",
    "safety": "Concrete safety warning regarding voltages, pinch hazards, thermal limits, or chemical handling",
    "firstTest": "The 1 single minimum test to perform on Day 1 to validate viability before ordering expensive parts",
    "totalEstimatedBudget": "$XX - $XX total build cost",
    "criticalBottleneck": "The single most difficult hurdle to pay attention to during assembly"
  }
}`
  },

  challenge_concern: {
    systemInstruction: "You are the stress-test evaluation engineer at IdeaForge.",
    buildPrompt: (input: string, context?: Record<string, any>) => {
      const concern = context?.concern || context?.input || input;
      return `Evaluate this user concern or 'what-if' constraint for the concept:
Concept: "${context?.idea || 'The proposed concept'}"
User Worry/Constraint: "${concern}"`;
    },
    schemaDescription: `{
  "concern": "User worry restated",
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "evaluation": "Clear objective breakdown of whether this is a showstopper (2-3 sentences)",
  "mitigation": "Concrete engineering or operational solution to solve or sidestep this issue (2-3 sentences)",
  "recommendedComponentOrFix": "Specific part, material, or design principle to implement"
}`
  },

  summarize_idea: {
    systemInstruction: "You are an executive patent and product specification writer.",
    buildPrompt: (input: string, context?: Record<string, any>) => `Generate an executive specification summary for:
"${input}"
Context: ${JSON.stringify(context || {})}`,
    schemaDescription: `{
  "title": "Product Title",
  "executiveSummary": "2-3 paragraph executive summary",
  "coreDifferentiator": "Why this beats alternatives",
  "targetAudience": "Beachhead market",
  "estimatedBOM": "$XX - $XX",
  "recommendedFirstStep": "First action item"
}`
  }
};
