# IdeaForge - Concept Engineering & Prototyping Engine

Turn unfinished thoughts, shower thoughts, and rough concepts into structured engineering breakdowns, stress tests, interactive schematics, and prototype build plans with a provider-agnostic AI backend.

---

## Features

- **Provider-Agnostic Architecture**: Switch seamlessly between **Google Gemini**, **OpenAI**, and **Anthropic** without touching frontend code.
- **Automatic Fallback Support**: Route transient rate limits (429) or service outages to a secondary backup provider.
- **6-Stage Engineering Pipeline**:
  1. **Concept Breakdown**: First-principles deconstruction (Core Value Engine, Root Problem Solved, Operating Physics/Kinematics, Target Adopters, Critical Assumptions).
  2. **Stress Testing**: Points of failure across technical, cost, logical, safety, and market domains with actionable mitigations and live custom "what-if" testing.
  3. **Architectural Exploration**: 3 distinct architectural options (Scrappy, Balanced, Cutting-Edge) with trade-off matrices, complexity notes, BOM estimates, and timelines.
  4. **Interactive System Architecture**: Visual node topology graph with clickable subsystem inspection and signal pathway tracing.
  5. **Prototype Build Plan**: Bill of Materials (BOM) with specifications and sourcing channels, phased execution roadmap, safety controls, and Day-1 validation benchmarks.
  6. **Executive Specification & Export**: Export to Markdown, download raw JSON data, or print/PDF preview.

---

## AI Provider Configuration

IdeaForge features a server-side abstraction layer (`server/ai`) where the frontend communicates solely via normalized requests to `POST /api/ai`. The server dynamically routes requests to the configured provider adapter.

### 1. How to Configure Gemini
To use Google Gemini as your AI engine:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add the following to your server `.env` file:
   ```env
   AI_PROVIDER="gemini"
   GEMINI_API_KEY="your-gemini-api-key"
   # Optional: customize model (defaults to 'gemini-3.8-flash')
   AI_MODEL="gemini-3.8-flash"
   ```

### 2. How to Configure OpenAI
To use OpenAI:
1. Obtain an API key from [OpenAI Platform](https://platform.openai.com/api-keys).
2. Add the following to your server `.env` file:
   ```env
   AI_PROVIDER="openai"
   OPENAI_API_KEY="your-openai-api-key"
   # Optional: customize model (defaults to 'gpt-4o-mini')
   AI_MODEL="gpt-4o-mini"
   ```

### 3. How to Configure Anthropic
To use Anthropic Claude:
1. Obtain an API key from [Anthropic Console](https://console.anthropic.com/).
2. Add the following to your server `.env` file:
   ```env
   AI_PROVIDER="anthropic"
   ANTHROPIC_API_KEY="your-anthropic-api-key"
   # Optional: customize model (defaults to 'claude-3-5-sonnet-20241022')
   AI_MODEL="claude-3-5-sonnet-20241022"
   ```

### 4. How to Choose the Active Provider
Set the `AI_PROVIDER` environment variable in your `.env` file to one of:
- `gemini`
- `openai`
- `anthropic`

You can also override the specific model globally using `AI_MODEL`.

### 5. How to Configure a Fallback Provider
If your primary provider encounters a temporary failure (such as HTTP 429 rate limits or network outages), IdeaForge can automatically retry the request with your fallback provider:
```env
AI_PROVIDER="gemini"
AI_FALLBACK_PROVIDER="openai"

GEMINI_API_KEY="your-gemini-key"
OPENAI_API_KEY="your-openai-key"
```
*Note: The system will never silently switch providers for authentication or missing key errors. When fallback is engaged, the UI indicates that a fallback provider was used.*

### 6. Where API Keys Should Be Stored
**Security Rule**: Secret API keys must **only** be stored in server-side environment variables or in your local `.env` file (which is excluded from Git via `.gitignore`).
- **Never** place keys in React components, client bundles, or frontend code.
- **Never** commit `.env` containing real keys to GitHub.
- If packaging into an iOS or Android app via Capacitor, the mobile client must call your secure backend endpoint over HTTPS. Do **not** bake API keys into mobile binaries.

### 7. How to Add Another Provider
Adding a new provider (e.g., Mistral, Groq, DeepSeek, or an internal LLM) takes 3 simple steps without rewriting the application:
1. Create a class implementing the `AIProvider` interface in `server/ai/providers/MyNewProvider.ts`:
   ```ts
   import { AIProvider, GenerateTextOptions, GenerateStructuredOutputOptions } from "../types";

   export class MyNewProvider implements AIProvider {
     readonly name = "mynewprovider";
     readonly defaultModel = "my-model-name";

     async generateText(options: GenerateTextOptions): Promise<string> { ... }
     async generateStructuredOutput<T>(options: GenerateStructuredOutputOptions): Promise<T> { ... }
   }
   ```
2. Register the provider in `server/ai/providerRegistry.ts`:
   ```ts
   this.register("mynewprovider", () => new MyNewProvider());
   ```
3. Set `AI_PROVIDER="mynewprovider"` and supply your custom key in `.env`.

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your chosen provider and key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
