# IdeaForge — 3D Mechanical Mechanism Studio

Transform natural language product and invention ideas directly into interactive 3D mechanisms with live articulating joints, kinematic simulation, exploded assembly views, and CAD exports.

```
USER IDEA / PROMPT
       ↓
AI ORCHESTRATOR (Gemini / OpenAI / Anthropic)
       ↓
STRUCTURED 3D DESIGN SPECIFICATION (JSON)
       ↓
FRONTEND KINEMATICS ENGINE & THREE.JS / R3F SCENE
       ↓
INTERACTIVE ARTICULATING 3D MECHANISM
```

---

## Core Capabilities

- **Natural Language → 3D Mechanism**: Describe an invention (e.g. *"Create a folding phone stand with dual hinged arms"*) and receive a fully assembled 3D mechanism composed of parameterized geometric primitives.
- **Interactive Mechanical Joints**:
  - **Revolute (Hinge)**: Constrains rotational articulation around defined anchor pivots and axes with min/max angular limits.
  - **Prismatic (Slider)**: Constrains linear actuation along defined directional vectors with distance limits.
  - **Fixed**: Rigid structural joints and weldments.
- **Kinematic Simulation Mode**: Real-time harmonic and cyclic kinematic simulation animating connected components in unison.
- **Exploded View Mode**: Continuous 0% to 100% assembly separation slider to inspect inner pins, bushings, and linkages.
- **AI Modification Commands**: Incrementally modify existing models (e.g. *"Make the arm twice as long"*, *"Increase cradle tilt limits to 120 degrees"*).
- **Professional CAD Export**:
  - **Wavefront OBJ (`.obj`)**: Real 3D polygon mesh file ready for 3D printing, Blender, or Fusion 360.
  - **Design Specification JSON (`.json`)**: Machine-readable kinematic CAD specification.
  - **High-Resolution Snapshot (`.png`)**: Viewport screenshot.
- **Ready-to-Use Demo Models**:
  - Dual-Hinge Folding Phone Stand
  - Precision Hinged Storage Container
  - 3-Axis Articulated Robotic Arm
  - Hydraulic Scissor Lift Deck

---

## Architecture Overview

```
Frontend (React 19 + Three.js + R3F + Drei)
├── Left Panel: Model Hierarchy Tree (Parts, visibility, parent-child links)
├── Center Viewport: Interactive 3D Canvas (OrbitControls, Gizmo, Grid, Dimensions)
├── Right Panel: Joint Manipulators, Harmonic Simulation, Exploded View, Part Inspector
└── Bottom Console: Natural Language AI Generator & Modifier
       ↓ (POST /.netlify/functions/ai or /api/ai)
Netlify Serverless Function / Server Proxy
       ↓
AI Orchestrator (executeAITask)
       ↓
AI Provider Adapter
├── GeminiProvider (@google/genai — gemini-3.8-flash)
├── OpenAIProvider (Fetch /v1/chat/completions — gpt-4o-mini)
└── AnthropicProvider (Fetch /v1/messages — claude-3-5-sonnet-20241022)
       ↓
Returns Validated DesignSpecification JSON
```

---

## 3D Design Specification Format

IdeaForge separates AI reasoning from 3D rendering. The AI generates a machine-readable JSON format, which the frontend validates and converts into Three.js primitives:

```json
{
  "name": "Dual-Hinge Folding Phone Stand",
  "description": "Adjustable folding desktop stand with articulating arms.",
  "category": "Consumer Product",
  "dimensions": { "width": 3.0, "height": 4.2, "depth": 4.0, "unit": "cm" },
  "parts": [
    {
      "id": "base_plate",
      "name": "Weighted Base Plate",
      "parentId": null,
      "geometry": {
        "type": "box",
        "dimensions": [3.2, 0.25, 4.0]
      },
      "transform": {
        "position": [0, 0.125, 0],
        "rotation": [0, 0, 0]
      },
      "material": {
        "color": "#27272a",
        "roughness": 0.4,
        "metalness": 0.8
      }
    },
    {
      "id": "support_arm",
      "name": "Primary Articulating Arm",
      "parentId": "base_plate",
      "geometry": {
        "type": "box",
        "dimensions": [2.2, 0.2, 3.0]
      },
      "transform": {
        "position": [0, 1.4, -0.4],
        "rotation": [-45, 0, 0]
      },
      "material": {
        "color": "#2563eb",
        "roughness": 0.25,
        "metalness": 0.4
      }
    }
  ],
  "joints": [
    {
      "id": "joint_base_angle",
      "name": "Base Elevation Hinge",
      "type": "revolute",
      "parentPartId": "base_plate",
      "childPartId": "support_arm",
      "anchor": [0, 0.32, -1.4],
      "axis": [1, 0, 0],
      "limits": {
        "min": -75,
        "max": 15,
        "default": -45,
        "unit": "deg"
      },
      "currentValue": -45
    }
  ]
}
```

### Supported Geometric Primitives
- `box`: `dimensions: [width, height, depth]`
- `cylinder`: `dimensions: [radiusTop, radiusBottom, height]`
- `sphere`: `dimensions: [radius]`
- `capsule`: `dimensions: [radius, length]`
- `plane`: `dimensions: [width, height]`

---

## Local Development

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or bun

### 2. Clone & Install
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your API key (e.g. Gemini, OpenAI, or Anthropic):
```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_api_key_here"
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | If using Gemini | - | Google Gemini API Key |
| `OPENAI_API_KEY` | If using OpenAI | - | OpenAI Platform API Key |
| `ANTHROPIC_API_KEY` | If using Anthropic | - | Anthropic Claude API Key |
| `AI_PROVIDER` | Optional | `gemini` | Active provider: `gemini`, `openai`, `anthropic` |
| `AI_MODEL` | Optional | Provider default | Model override (e.g. `gemini-3.8-flash`, `gpt-4o-mini`) |
| `AI_FALLBACK_PROVIDER` | Optional | - | Backup provider for transient rate limits (e.g. `openai`) |

> **Security Note:** All API keys are accessed strictly server-side. No API keys are bundled or exposed to client browsers.

---

## AI Provider Setup

### Using Google Gemini
```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_gemini_key"
AI_MODEL="gemini-3.8-flash"
```

### Using OpenAI
```env
AI_PROVIDER="openai"
OPENAI_API_KEY="your_openai_key"
AI_MODEL="gpt-4o-mini"
```

### Using Anthropic
```env
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="your_anthropic_key"
AI_MODEL="claude-3-5-sonnet-20241022"
```

### Using Automatic Fallback
```env
AI_PROVIDER="gemini"
AI_FALLBACK_PROVIDER="openai"
GEMINI_API_KEY="your_gemini_key"
OPENAI_API_KEY="your_openai_key"
```

---

## Deployment Instructions

### Deploy to Netlify
1. Connect your repository to Netlify.
2. Netlify reads `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
3. In **Site Configuration > Environment Variables**, add:
   - `AI_PROVIDER`: `gemini` (or `openai` / `anthropic`)
   - `GEMINI_API_KEY`: your API key
4. Deploy site. All requests to `/.netlify/functions/ai` and `/api/ai` are handled automatically by the serverless function.
