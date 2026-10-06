# IdeaForge - Concept Engineering & Prototyping Engine

Turn unfinished thoughts, shower thoughts, and rough concepts into structured engineering breakdowns, stress tests, interactive schematics, and prototype build plans. Powered by Gemini 3.8 Flash.

---

## Features

- **6-Stage Engineering Pipeline**:
  1. **Concept Breakdown**: First-principles deconstruction (Core Value Engine, Root Problem Solved, Operating Physics/Kinematics, Target Adopters, Critical Assumptions).
  2. **Stress Testing**: Points of failure across technical, cost, logical, safety, and market domains with actionable mitigations. Includes interactive custom concern testing.
  3. **Architectural Exploration**: 3 distinct architectural options (Scrappy, Balanced, Cutting-Edge) with trade-off matrices, complexity notes, BOM estimates, and timelines.
  4. **Interactive System Architecture**: Visual node topology graph with clickable subsystem inspection and signal pathway tracing.
  5. **Prototype Build Plan**: Bill of Materials (BOM) with specifications and sourcing channels, phased execution roadmap, safety controls, and Day-1 validation benchmarks.
  6. **Executive Specification & Export**: Export to Markdown, download raw JSON data, or print/PDF preview.

---

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or bun

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```bash
cp .env.example .env
```

Add your Gemini API Key in `.env`:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

> You can get an API key from [Google AI Studio](https://aistudio.google.com/).

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Proxy**: Vite Dev Server with Connect/Express API routes
- **AI Engine**: `@google/genai` with `gemini-3.8-flash`
