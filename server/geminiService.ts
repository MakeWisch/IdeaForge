import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Fallback high-fidelity data in case of network timeout or missing key
export const MOCK_CHESS_DATA = {
  analysis: {
    core: "A kinetic, mechanical chessboard where individual squares have actuation capabilities to physically displace or interact with neighboring squares, adding an active physical dynamic to board state.",
    problem: "Traditional chess is static. This introduces a new dimension of strategy, tactile engagement, and visual spectacle, bridging the gap between digital mechanics (shifting levels) and physical board games.",
    user: "Board game enthusiasts, kinetic art collectors, STEM educators, high-end chess clubs, and luxury novelty buyers.",
    how: "A grid of independently actuated platforms, driven by a concealed Core-XY gantry system or micro-stepper motors beneath the board, coordinated by an embedded controller tracking board logic.",
    assumptions: [
      "Players want a physical mechanical experience rather than an iPad or LED screen.",
      "The mechanical tolerances can prevent squares from jamming under frequent motion.",
      "Pieces have magnetic stabilization so they won't topple during square elevation or translation."
    ],
    challenges: [
      "Mechanical friction and dimensional binding between moving neighboring squares.",
      "Cost scaling if 64 individual motors are used instead of a multiplexed gantry.",
      "Acoustic noise and power consumption during fast actuation sequences."
    ],
    interesting: "It transforms a purely cognitive game into an architectural, kinetic puzzle where the terrain itself is a tactical pawn."
  },
  stressTest: [
    {
      issue: "High cost & wiring nightmare of 64 dedicated vertical and horizontal motors.",
      type: "cost",
      solution: "Adopt a single Core-XY gantry underneath the board equipped with an electromagnet elevator needle to displace one target tile at a time.",
      severity: "critical"
    },
    {
      issue: "Square-edge friction leading to micro-jamming and surface wear.",
      type: "technical",
      solution: "Manufacture squares with a 45° chamfered perimeter and specify low-friction POM (Delrin) or PTFE-infused resin with graphite dry lubricant.",
      severity: "critical"
    },
    {
      issue: "Pieces toppling over during rapid acceleration or vertical lift.",
      type: "logical",
      solution: "Embed paired N52 neodymium disc magnets in the base of chessmen and center of tiles to provide positive retention up to 45° tilt.",
      severity: "moderate"
    },
    {
      issue: "Pinch hazard and finger trapping between shifting board tiles for casual players.",
      type: "safety",
      solution: "Implement motor current-sensing stall detection and magnetic breakaway couplings that slip if resistance exceeds 3 Newtons.",
      severity: "safety"
    }
  ],
  explore: [
    {
      id: "1",
      name: "The Sub-Surface Core-XY Gantry",
      tagline: "3D printer kinematics under the hood",
      description: "A single hidden 2-axis Core-XY gantry beneath the board carries an electromagnetic vertical elevator pin that indexes, locks, and translates any tile.",
      pros: ["Requires only 3 motors total", "Drastically lower bill-of-materials cost", "Proven 3D-printer kinematics and firmware"],
      cons: ["Sequential actuation only (one square moves at a time)", "Travel latency between opposite corners"],
      difficulty: "Medium",
      complexity: "Standard Core-XY timing belts, NEMA 17 steppers, Arduino Mega with RAMPS 1.4 or TMC2209 silent drivers.",
      estimatedCostRange: "$140 - $220 DIY prototype",
      timelineDays: "10-14 days"
    },
    {
      id: "2",
      name: "The Magnetic Matrix Shifter",
      tagline: "Fluid sliding tiles without vertical lift",
      description: "Uses a planar matrix of addressable electromagnets or a sub-floor magnetic grid (similar to a 15-puzzle slider) to pull tiles along channels without mechanical scissors.",
      pros: ["No vertical moving parts to jam", "Completely flat profile with nearly silent glide", "Fewer pinch points"],
      cons: ["Requires empty buffer slots (changes classic 64-square layout)", "Lower magnetic holding force during fast moves"],
      difficulty: "Low",
      complexity: "PCB magnetic coil array or manual slide rails with Hall-effect position sensors.",
      estimatedCostRange: "$90 - $150 DIY prototype",
      timelineDays: "7-10 days"
    },
    {
      id: "3",
      name: "The Distributed Micro-Actuator Mesh",
      tagline: "Independent simultaneous actuation",
      description: "Every individual tile is mounted on an independent micro lead-screw or miniature linear solenoid, enabling wave-like undulating terrain animations.",
      pros: ["Simultaneous multi-tile actuation", "Astonishing visual wave and terrain effects", "Instantaneous tile displacement"],
      cons: ["64+ motors make assembly difficult", "Very high cost and power draw", "Many mechanical points of failure"],
      difficulty: "High",
      complexity: "Custom shift-register motor driver arrays (I2C/SPI multiplexers) and high-current 12V 10A power supply.",
      estimatedCostRange: "$450 - $800 DIY prototype",
      timelineDays: "25-35 days"
    }
  ]
};

export const MOCK_CHESS_BLUEPRINT = {
  visualize: {
    nodes: [
      { id: "n1", label: "Central Master MCU", desc: "ESP32 / Arduino Mega running chess state machine and G-code motion planner.", type: "brain", specs: "ESP32-S3 Dual Core 240MHz, 2.4GHz Wi-Fi/BLE" },
      { id: "n2", label: "TMC2209 Silent Steppers", desc: "Ultra-quiet motor driver modules with StealthChop for silent board motion.", type: "component", specs: "2.8A peak, 1/256 microstepping" },
      { id: "n3", label: "Core-XY Belt Gantry", desc: "Precision GT2 timing belt carriage positioning the toolhead anywhere on the 8x8 grid.", type: "mechanism", specs: "300x300mm active travel, linear optical shafts" },
      { id: "n4", label: "Vertical Z-Pin Lifter", desc: "Miniature solenoid or geared micro lead-screw to latch and push up the target tile.", type: "mechanism", specs: "12V 15mm stroke, magnetic catch tip" },
      { id: "n5", label: "Kinetic Tile Matrix", desc: "64 chamfered Delrin tiles with embedded neodymium magnets and optical reflectors.", type: "component", specs: "35x35mm Delrin tiles with N52 magnets" },
      { id: "n6", label: "Hall-Effect Sensor Bed", desc: "Under-tile magnetic sensor array to track chess piece positions passively.", type: "sensor", specs: "64x A3144 Hall switches multiplexed via 74HC165" },
      { id: "n7", label: "12V 5A Power Bus", desc: "Regulated DC power supply with overcurrent protection and emergency shutoff.", type: "power", specs: "12V DC, 60W, buck converter to 5V/3.3V" }
    ],
    edges: [
      { from: "n1", to: "n2", label: "Step/Dir pulses", flowType: "data" },
      { from: "n2", to: "n3", label: "Core-XY drive", flowType: "mechanical" },
      { from: "n1", to: "n4", label: "Lift trigger", flowType: "data" },
      { from: "n3", to: "n4", label: "Positions lifter", flowType: "mechanical" },
      { from: "n4", to: "n5", label: "Elevates & slides", flowType: "mechanical" },
      { from: "n6", to: "n1", label: "Piece coordinate telemetry", flowType: "data" },
      { from: "n7", to: "n2", label: "12V motor rail", flowType: "power" },
      { from: "n7", to: "n1", label: "5V logic rail", flowType: "power" }
    ]
  },
  buildPlan: {
    components: [
      { name: "ESP32-S3 or Arduino Mega 2560", spec: "Master Controller", approxCost: "$12 - $18", source: "Amazon / DigiKey" },
      { name: "2x NEMA 17 Stepper Motors (0.4Nm)", spec: "Core-XY XY Axes", approxCost: "$24", source: "Amazon / LDO Motors" },
      { name: "2x TMC2209 Silent Stepper Drivers", spec: "Silent Motion Control", approxCost: "$14", source: "BigTreeTech" },
      { name: "GT2 6mm Timing Belts & 20T Pulleys", spec: "Gantry Kinematics", approxCost: "$12", source: "RepRap / Amazon" },
      { name: "12V Push-Pull Solenoid / Micro Servo", spec: "Z-Lift Elevator Mechanism", approxCost: "$8", source: "Adafruit / Sparkfun" },
      { name: "64x CNC Milled or 3D Printed Tiles", spec: "Chamfered Delrin (POM) or PLA", approxCost: "$35", source: "Local 3D Print / SendCutSend" },
      { name: "128x N52 Neodymium Magnets (6x2mm)", spec: "Tile & Piece Retention", approxCost: "$15", source: "K&J Magnetics" },
      { name: "12V 5A DC Power Brick & Barrel Jack", spec: "System Power Supply", approxCost: "$16", source: "Mean Well / Amazon" }
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Fabricate a 3x3 Mini Test Matrix",
        details: "Laser-cut or 3D print a 3x3 square grid with 45-degree chamfered edges. Test hand-pushing squares against each other to calibrate clearance tolerance (aim for 0.4mm gap) and check that pieces don't tip.",
        milestoneValidation: "Smooth square gliding without edge catching or binding."
      },
      {
        stepNumber: 2,
        title: "Assemble Core-XY Motion Stage",
        details: "Mount the two NEMA 17 steppers on an extruded 2020 aluminum frame base. Route the two continuous GT2 belts in the classic Core-XY crossover configuration. Connect TMC2209 drivers to microstepping test code.",
        milestoneValidation: "Both diagonal and orthogonal carriage moves achieve sub-millimeter repeatable positioning."
      },
      {
        stepNumber: 3,
        title: "Integrate Z-Axis Lift Head",
        details: "Mount the miniature 12V solenoid with a magnetic tip on the XY gantry carriage. Verify that pulsing the solenoid raises the pin 10mm cleanly into the underside receiver socket of a test tile.",
        milestoneValidation: "Carriage latches, elevates tile 8mm, shifts coordinates, and sets tile back down flush."
      },
      {
        stepNumber: 4,
        title: "Firmware Motion Translation Engine",
        details: "Write coordinate translation firmware in C++ / ESP-IDF or Arduino. Map algebraic chess notation (e.g. 'E2 to E4') into stepper coordinate movements: Move XY -> Lift Z -> Translate XY -> Lower Z -> Park carriage.",
        milestoneValidation: "Send serial command 'E2-E4' via Serial Monitor and watch physical square relocate."
      },
      {
        stepNumber: 5,
        title: "Full 8x8 Grid Assembly & Finishing",
        details: "Assemble the full 64-square grid top plate. Fit the neodymium magnets into chess piece bases. Add wood veneer or anodized aluminum outer perimeter trim to conceal the mechanical underbelly.",
        milestoneValidation: "Complete autonomous game of 10 random moves executed without piece tipping or tile stalls."
      }
    ],
    difficulty: "7.5 / 10 (Requires 3D printing, basic kinematics, motor tuning, and microcontroller firmware)",
    safety: "Pinch hazard from high-torque gantry belts and pinch lines between moving squares. Enclose the underside chassis in acrylic/plywood, and set motor driver current limits so steps skip before fingers can be crushed.",
    firstTest: "The 'Tip & Catch' Benchmark: Elevate a single tile 10mm at 50mm/s velocity with a weighted chess piece on top. Verify the piece stays upright and centered using magnetic adhesion.",
    totalEstimatedBudget: "$136 - $190 in standard parts",
    criticalBottleneck: "Tolerancing the inter-tile gap: too tight causes friction jams when wood/plastic expands with humidity; too loose makes the board feel sloppy."
  }
};

export async function analyzeIdeaWithGemini(idea: string) {
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found in process.env, returning high-fidelity baseline data.");
    return MOCK_CHESS_DATA;
  }

  try {
    const prompt = `You are the lead engineering architect and product invention director at IdeaForge.
Analyze this user idea with rigorous first-principles thinking, whether it is physical hardware, mechanical invention, software system, bio/chem tool, or consumer product:
Idea: "${idea}"

Respond with ONLY valid JSON strictly matching this schema:
{
  "analysis": {
    "core": "Precise first-principles breakdown of the core concept in 1-2 punchy sentences",
    "problem": "The fundamental problem, psychological desire, or bottleneck this solves",
    "user": "Specific target adopter profiles and beachhead market",
    "how": "Mechanical / technical / architectural operating principle explaining how it physically or computationally works",
    "assumptions": ["3 critical assumptions that must be true for this to work"],
    "challenges": ["3 engineering, physics, market, or manufacturing hurdles"],
    "interesting": "The novel 'hook' or unfair advantage that makes this fascinating"
  },
  "stressTest": [
    {
      "issue": "Specific failure mode, bottleneck, or vulnerability",
      "type": "technical" | "cost" | "logical" | "safety" | "market",
      "solution": "Clever, concrete engineering solution or workaround",
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
      "name": "Approach 2 Name (e.g. Balanced / Commercial Grade / Elegant)",
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
      "name": "Approach 3 Name (e.g. Radical / High-Performance / Cutting-Edge)",
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
}

Ensure high specificity. No generic advice. Reference real components (steppers, sensors, ICs, alloys, polymers, APIs, protocols) where applicable. Provide exactly 3 or 4 stress test issues.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error("Gemini analyzeIdea error:", err);
    // Return high quality fallback tailored or mock
    return MOCK_CHESS_DATA;
  }
}

export async function generateBlueprintWithGemini(idea: string, approach: any) {
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found in process.env, returning blueprint baseline data.");
    return MOCK_CHESS_BLUEPRINT;
  }

  try {
    const prompt = `You are the lead prototyping engineer at IdeaForge.
Generate a complete, build-ready prototype blueprint and interactive node architecture for this selected approach:
Idea: "${idea}"
Selected Architecture Approach: "${approach?.name || 'Standard'}" - ${approach?.description || ''}

Respond with ONLY valid JSON strictly matching this schema:
{
  "visualize": {
    "nodes": [
      {
        "id": "n1",
        "label": "Short Subsystem Name (e.g. Motion Controller, Power Bus, Sensor Array)",
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
        "source": "Where to buy (e.g. McMaster-Carr, Amazon, DigiKey, Local FabLab)"
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
}

Include 5-7 informative nodes and 5-8 connecting edges in the architecture.
Include 6-8 specific BOM components and exactly 5 actionable sequential phases in the steps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error("Gemini generateBlueprint error:", err);
    return MOCK_CHESS_BLUEPRINT;
  }
}

export async function challengeConcernWithGemini(idea: string, concern: string) {
  if (!apiKey) {
    return {
      concern,
      evaluation: "Simulated evaluation: Address via modular chassis dampening and secondary sensor feedback.",
      mitigation: "Install vibration isolation silicone dampers and decouple logic bus.",
      riskLevel: "Moderate"
    };
  }

  try {
    const prompt = `You are the lead stress-test engineer at IdeaForge.
The user is evaluating this concept: "${idea}"
The user raises this specific constraint, 'what if', or worry:
"${concern}"

Respond with ONLY valid JSON:
{
  "concern": "${concern}",
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "evaluation": "Clear, objective breakdown of why this is or isn't a showstopper (2-3 sentences)",
  "mitigation": "Concrete engineering or operational solution to solve or sidestep this issue (2-3 sentences)",
  "recommendedComponentOrFix": "Specific part, material, or design principle to implement"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const text = response.text || "";
    return JSON.parse(text);
  } catch (err) {
    return {
      concern,
      riskLevel: "Moderate",
      evaluation: "Risk can be managed with proper thermal and mechanical isolation.",
      mitigation: "Introduce a thermal sensor cutout and mechanical breakaway mechanism.",
      recommendedComponentOrFix: "Self-resetting PTC fuse and mechanical slip clutch"
    };
  }
}
