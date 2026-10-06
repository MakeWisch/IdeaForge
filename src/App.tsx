/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, ShieldAlert, GitMerge, Layers, Hammer, FileText, 
  ChevronRight, ArrowRight, ArrowLeft, Copy, CheckCircle2, 
  AlertTriangle, Play, Zap, Box, Activity, Cpu, BatteryCharging,
  Radio, Sparkles, RefreshCw, Plus, Check, DollarSign,
  Download, Printer, HelpCircle
} from 'lucide-react';

// Preset curated showcase ideas
const PRESET_IDEAS = [
  {
    title: "Kinetic Mechanical Chessboard",
    prompt: "A kinetic chessboard where individual squares have actuation capabilities to physically displace or interact with neighboring squares, changing the board state dynamically.",
    category: "Hardware / Mechanics"
  },
  {
    title: "Haptic Navigation Belt",
    prompt: "A lightweight waist belt with 16 micro-vibration motors and ultrasonic LiDAR sensors that maps 360-degree obstacle distances directly to directional vibrational pressure for the visually impaired.",
    category: "Wearables / Assistive Tech"
  },
  {
    title: "Autonomous Beach Litter Sweeper",
    prompt: "A solar-assisted low-cost beach rover using passive vibrational sifting wire mesh that scoops sand, separates microplastics and cigarette butts, and deposits clean sand back.",
    category: "Robotics / Cleantech"
  },
  {
    title: "Self-Balancing Hydroponic Wall",
    prompt: "An indoor vertical herb garden with automated colorimetric pH sensor channels and passive capillary nutrient dosing without complex peristaltic pumps.",
    category: "Smart Living / Biotech"
  }
];

interface AnalysisData {
  analysis: {
    core: string;
    problem: string;
    user: string;
    how: string;
    assumptions: string[];
    challenges: string[];
    interesting: string;
  };
  stressTest: Array<{
    issue: string;
    type: string;
    solution: string;
    severity?: string;
  }>;
  explore: Array<{
    id: string;
    name: string;
    tagline?: string;
    description: string;
    pros: string[];
    cons: string[];
    difficulty: "Low" | "Medium" | "High";
    complexity: string;
    estimatedCostRange?: string;
    timelineDays?: string;
  }>;
}

interface VisualizeData {
  visualize: {
    nodes: Array<{
      id: string;
      label: string;
      desc: string;
      type: "brain" | "mechanism" | "structure" | "component" | "sensor" | "power";
      specs?: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      label: string;
      flowType?: "data" | "power" | "mechanical";
    }>;
  };
  buildPlan: {
    components: Array<{
      name: string;
      spec?: string;
      approxCost?: string;
      source?: string;
    }> | string[];
    steps: Array<{
      stepNumber?: number;
      title?: string;
      details?: string;
      milestoneValidation?: string;
    }> | string[];
    difficulty: string;
    safety: string;
    firstTest: string;
    totalEstimatedBudget?: string;
    criticalBottleneck?: string;
  };
}

interface CustomStressResult {
  concern: string;
  riskLevel: string;
  evaluation: string;
  mitigation: string;
  recommendedComponentOrFix?: string;
}

export default function App() {
  const [step, setStep] = useState(0); // 0: Landing, 1: Analysis, 2: Stress, 3: Explore, 4: Visual, 5: Plan, 6: Doc
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedApproach, setSelectedApproach] = useState<any>(null);
  const [visualizeData, setVisualizeData] = useState<VisualizeData | null>(null);
  const [copied, setCopied] = useState(false);

  // AI Provider info & error feedback
  const [providerInfo, setProviderInfo] = useState<{
    primaryProvider: string;
    fallbackProvider: string | null;
    configuredModel: string;
    availableProviders: string[];
  } | null>(null);
  const [activeProviderUsed, setActiveProviderUsed] = useState<string>("gemini");
  const [fallbackWasUsed, setFallbackWasUsed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom stress test interaction
  const [customConcern, setCustomConcern] = useState("");
  const [isChallenging, setIsChallenging] = useState(false);
  const [customChallenges, setCustomChallenges] = useState<CustomStressResult[]>([]);

  // Selected node inspection in Step 4
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeFilter, setNodeFilter] = useState<string>("all");

  // Load provider status on mount
  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.primaryProvider) {
          setProviderInfo(data);
          setActiveProviderUsed(data.primaryProvider);
        }
      })
      .catch(() => {});
  }, []);

  // Smooth scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleDevelopIdea = async () => {
    if (!idea.trim()) return;
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingText("Deconstructing first principles...");

    const textIntervals = [
      setTimeout(() => setLoadingText("Synthesizing user desirability & root mechanics..."), 1200),
      setTimeout(() => setLoadingText("Stress-testing physics, bottlenecks & costs..."), 2400),
      setTimeout(() => setLoadingText("Architecting 3 distinct engineering pathways..."), 3600)
    ];

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'analyze_idea',
          input: idea
        })
      });

      const result = await res.json();
      textIntervals.forEach(clearTimeout);

      if (!result.success) {
        throw new Error(result.error || "Failed to analyze idea");
      }

      if (result.provider) {
        setActiveProviderUsed(result.provider);
      }
      if (result.fallbackUsed) {
        setFallbackWasUsed(true);
      }

      setAnalysisData(result.data);
      setIsLoading(false);
      setStep(1);
    } catch (err: any) {
      textIntervals.forEach(clearTimeout);
      setIsLoading(false);
      setErrorMessage(err.message || "Failed to analyze concept. Please check provider configuration.");
    }
  };

  const handleSelectApproach = async (approach: any) => {
    setErrorMessage(null);
    setSelectedApproach(approach);
    setIsLoading(true);
    setLoadingText(`Synthesizing schematic for: ${approach.name}...`);

    const textIntervals = [
      setTimeout(() => setLoadingText("Calculating subsystem interconnections & data flows..."), 1200),
      setTimeout(() => setLoadingText("Drafting Bill of Materials & Day-1 validation test..."), 2400)
    ];

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'prototype_plan',
          input: idea,
          context: { approach }
        })
      });

      const result = await res.json();
      textIntervals.forEach(clearTimeout);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate blueprint");
      }

      if (result.provider) {
        setActiveProviderUsed(result.provider);
      }
      if (result.fallbackUsed) {
        setFallbackWasUsed(true);
      }

      setVisualizeData(result.data);
      if (result.data.visualize?.nodes?.length > 0) {
        setSelectedNodeId(result.data.visualize.nodes[0].id);
      }
      setIsLoading(false);
      setStep(4);
    } catch (err: any) {
      textIntervals.forEach(clearTimeout);
      setIsLoading(false);
      setErrorMessage(err.message || "Failed to generate prototype blueprint.");
    }
  };

  const handleAddCustomStressTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConcern.trim()) return;

    setErrorMessage(null);
    setIsChallenging(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'challenge_concern',
          input: customConcern,
          context: { idea, concern: customConcern }
        })
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to evaluate concern");
      }

      if (result.provider) {
        setActiveProviderUsed(result.provider);
      }
      if (result.fallbackUsed) {
        setFallbackWasUsed(true);
      }

      setCustomChallenges(prev => [result.data, ...prev]);
      setCustomConcern("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to evaluate concern.");
    } finally {
      setIsChallenging(false);
    }
  };

  const copyDocument = () => {
    if (!analysisData || !visualizeData) return;
    const componentsList = Array.isArray(visualizeData.buildPlan.components)
      ? visualizeData.buildPlan.components.map((c: any) => 
          typeof c === 'string' ? `- ${c}` : `- ${c.name} (${c.spec || ''}) | Cost: ${c.approxCost || ''} | Source: ${c.source || ''}`
        ).join('\n')
      : '';

    const stepsList = Array.isArray(visualizeData.buildPlan.steps)
      ? visualizeData.buildPlan.steps.map((s: any, idx: number) =>
          typeof s === 'string' ? `Phase ${idx+1}: ${s}` : `Phase ${s.stepNumber || idx+1}: ${s.title}\n  Details: ${s.details}\n  Validation: ${s.milestoneValidation || ''}`
        ).join('\n\n')
      : '';

    const doc = `# IdeaForge Engineering Specification: ${selectedApproach?.name || 'Prototype'}

## 1. Raw Prompt & Vision
"${idea}"

## 2. Core Breakdown
- Core Concept: ${analysisData.analysis.core}
- Problem Solved: ${analysisData.analysis.problem}
- Intended Audience: ${analysisData.analysis.user}
- Operating Principle: ${analysisData.analysis.how}
- Key Novelty Hook: ${analysisData.analysis.interesting}

## 3. Assumptions & Verification
${analysisData.analysis.assumptions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## 4. Architecture Approach: ${selectedApproach?.name}
${selectedApproach?.description}
- Complexity: ${selectedApproach?.complexity}
- Difficulty: ${selectedApproach?.difficulty}
- Estimated Cost: ${selectedApproach?.estimatedCostRange || 'N/A'}

## 5. Bill of Materials (BOM)
${componentsList}

## 6. Phased Execution Roadmap
${stepsList}

## 7. Day 1 Benchmark Test
${visualizeData.buildPlan.firstTest}

## 8. Safety & Risk Mitigation
${visualizeData.buildPlan.safety}

---
Generated by IdeaForge Prototyping Engine
`;
    navigator.clipboard.writeText(doc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const fullSpec = {
      idea,
      analysis: analysisData,
      selectedApproach,
      blueprint: visualizeData,
      customStressTests: customChallenges,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullSpec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ideaforge-spec-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Step Header
  const StepIndicator = () => {
    const steps = [
      { id: 1, icon: Lightbulb, label: "Analysis" },
      { id: 2, icon: ShieldAlert, label: "Stress Test" },
      { id: 3, icon: GitMerge, label: "Explore" },
      { id: 4, icon: Layers, label: "Visualize" },
      { id: 5, icon: Hammer, label: "Build Plan" },
      { id: 6, icon: FileText, label: "Document" }
    ];

    if (step === 0) return null;

    return (
      <header className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40 py-3.5 px-4 md:px-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => setStep(0)} 
          className="flex items-center gap-2.5 text-zinc-100 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:border-red-500 transition-colors">
            <Zap className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-left">
            <span className="font-bold tracking-tight text-white block text-sm leading-none">IdeaForge</span>
            <span className="text-[10px] text-zinc-500 font-mono">ENGINEERING LAB</span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1.5" aria-label="Pipeline steps">
          {steps.map((s, idx) => {
            const isCurrent = step === s.id;
            const isPassed = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => {
                    // Allow navigating back or forward if data is present
                    if (s.id <= 3 && analysisData) setStep(s.id);
                    if (s.id >= 4 && visualizeData) setStep(s.id);
                  }}
                  disabled={s.id >= 4 && !visualizeData}
                  className={`flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded-full transition-all ${
                    isCurrent 
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-semibold' 
                      : isPassed 
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 cursor-pointer' 
                        : 'text-zinc-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <s.icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-red-400' : isPassed ? 'text-zinc-400' : 'text-zinc-600'}`} />
                  <span>{s.label}</span>
                </button>
                {idx < steps.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-800" />}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Provider status badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span className={`w-1.5 h-1.5 rounded-full ${fallbackWasUsed ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="uppercase font-semibold text-zinc-300">{activeProviderUsed || providerInfo?.primaryProvider || 'AI'}</span>
            {fallbackWasUsed && (
              <span className="text-[9px] font-sans text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                FALLBACK
              </span>
            )}
          </div>

          <button 
            onClick={() => {
              if (confirm("Start a new idea from scratch?")) {
                setIdea("");
                setAnalysisData(null);
                setSelectedApproach(null);
                setVisualizeData(null);
                setCustomChallenges([]);
                setErrorMessage(null);
                setStep(0);
              }
            }} 
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">New Idea</span>
          </button>
        </div>
      </header>
    );
  };

  const NavigationButtons = ({ 
    onNext, 
    onBack, 
    nextText, 
    backText = "Previous", 
    nextIcon: NextIcon = ArrowRight 
  }: { 
    onNext?: () => void; 
    onBack?: () => void; 
    nextText?: string; 
    backText?: string; 
    nextIcon?: any; 
  }) => (
    <div className="mt-14 pt-6 border-t border-zinc-800/60 flex items-center justify-between print:hidden">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white px-5 py-2.5 rounded-full border border-zinc-800 hover:border-zinc-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </button>
      ) : <div />}

      {onNext && nextText && (
        <button 
          onClick={onNext}
          className="group flex items-center gap-2.5 bg-white text-zinc-950 px-6 py-2.5 rounded-full font-semibold hover:bg-red-500 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-black/40"
        >
          {nextText}
          <NextIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300 font-sans selection:bg-red-500/30 selection:text-white">
      <StepIndicator />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#070709]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-20 h-20 flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-2 border-red-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-spin"></div>
            <Zap className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Forging Concept</h3>
          <p className="text-zinc-400 max-w-md animate-pulse text-sm leading-relaxed">{loadingText}</p>
          <div className="mt-6 flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${fallbackWasUsed ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
            <span className="uppercase">{activeProviderUsed || providerInfo?.primaryProvider || 'AI'}</span> ENGINE ACTIVE
            {fallbackWasUsed && <span className="text-amber-400">(FALLBACK ENGAGED)</span>}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-200 flex items-start justify-between gap-3 text-sm leading-relaxed animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-white text-sm">AI Provider Notice</strong>
                <p className="text-xs text-red-200 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* STEP 0: LANDING */}
        {step === 0 && (
          <div className="min-h-[85vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              First-Principles Concept Engineering & Prototyping
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-5 leading-tight">
              Idea<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Forge</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
              Turn unfinished thoughts, shower thoughts, and raw brainstorms into structured engineering breakdowns, stress tests, schematics, and prototype build plans.
            </p>

            {/* Input Card */}
            <div className="w-full max-w-3xl relative group text-left mb-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/10 to-zinc-800/40 rounded-3xl blur-xl opacity-30 group-hover:opacity-70 transition duration-700"></div>
              <div className="relative bg-[#0d0d11] border border-zinc-800 rounded-2xl p-3 shadow-2xl transition-colors group-hover:border-zinc-700">
                <textarea 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="What's your idea? E.g., What if a chess square could mechanically move another square? Or a desk lamp with an iris shutter that tracks your reading page?"
                  rows={4}
                  className="w-full bg-transparent text-base md:text-lg text-zinc-100 placeholder:text-zinc-600 resize-none outline-none p-4"
                />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 pb-3 pt-3 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>AI Prototyping Architect ready</span>
                  </div>

                  <button 
                    onClick={handleDevelopIdea}
                    disabled={!idea.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-zinc-950 px-6 py-2.5 rounded-full font-semibold hover:bg-red-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-md"
                  >
                    Develop Idea
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="w-full max-w-3xl text-left">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
                Or try an engineering test concept:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_IDEAS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIdea(preset.prompt);
                    }}
                    className="flex flex-col text-left p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-red-500/40 hover:bg-zinc-900/80 transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-red-400 transition-colors">
                        {preset.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {preset.category}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 line-clamp-2">
                      {preset.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: CONCEPT BREAKDOWN */}
        {step === 1 && analysisData && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
            <div className="border-b border-zinc-800/80 pb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5" /> Stage 1 / 6: First-Principles Decomposition
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Concept Breakdown</h2>
              <p className="text-zinc-400 text-sm mt-1.5 italic bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/70 max-w-3xl">
                "{idea}"
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
                    <Activity className="w-4 h-4 text-red-500" />
                    Core Value Engine
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{analysisData.analysis.core}</p>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    The Real Problem Solved
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{analysisData.analysis.problem}</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
                    <Lightbulb className="w-4 h-4 text-red-500" />
                    Novelty Hook & Unfair Advantage
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{analysisData.analysis.interesting}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
                    <Box className="w-4 h-4 text-red-500" />
                    How It Works (Under the Hood)
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{analysisData.analysis.how}</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
                    <Layers className="w-4 h-4 text-red-500" />
                    Critical Unproven Assumptions
                  </div>
                  <ul className="space-y-2.5">
                    {analysisData.analysis.assumptions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {i+1}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
                    <Radio className="w-4 h-4 text-red-500" />
                    Target Adopters & Beachhead
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{analysisData.analysis.user}</p>
                </div>
              </div>
            </div>

            <NavigationButtons 
              onBack={() => setStep(0)} 
              onNext={() => setStep(2)} 
              nextText="Next: Stress Test" 
              backText="Edit Idea"
            />
          </div>
        )}

        {/* STEP 2: STRESS TEST */}
        {step === 2 && analysisData && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
            <div className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" /> Stage 2 / 6: Failure Mode & Bottleneck Analysis
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Stress Test</h2>
                <p className="text-zinc-400 text-sm mt-1">Anticipating point-of-failure risks before manufacturing or writing code.</p>
              </div>
            </div>

            {/* Standard stress test cards */}
            <div className="space-y-4">
              {analysisData.stressTest.map((test, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-zinc-700 transition-colors">
                  <div className="md:w-1/2 p-6 bg-red-950/15 border-b md:border-b-0 md:border-r border-zinc-800/70">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        Vulnerability ({test.type})
                      </div>
                      {test.severity && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          {test.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-100 text-base font-medium leading-relaxed">{test.issue}</p>
                  </div>
                  <div className="md:w-1/2 p-6 bg-emerald-950/15">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      Engineering Solution & Workaround
                    </div>
                    <p className="text-zinc-200 text-sm leading-relaxed">{test.solution}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Interactive Stress Test Query */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mt-8">
              <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-red-400" />
                Stress-Test A Custom Concern
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Have a specific worry (e.g. "What if it needs to survive outdoor rain?", "How to keep unit cost below $25?", "What if power is lost mid-motion?")? Challenge it now:
              </p>
              
              <form onSubmit={handleAddCustomStressTest} className="flex gap-2">
                <input
                  type="text"
                  value={customConcern}
                  onChange={(e) => setCustomConcern(e.target.value)}
                  placeholder="Ask a 'what if' or state a risk..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50"
                />
                <button
                  type="submit"
                  disabled={!customConcern.trim() || isChallenging}
                  className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isChallenging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Challenge
                </button>
              </form>

              {customChallenges.length > 0 && (
                <div className="mt-5 space-y-3">
                  {customChallenges.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-red-300">Worry: "{item.concern}"</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-[10px] text-zinc-300">{item.riskLevel} Risk</span>
                      </div>
                      <p className="text-zinc-300">{item.evaluation}</p>
                      <div className="pt-2 border-t border-zinc-900 text-emerald-400">
                        <strong>Mitigation:</strong> {item.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NavigationButtons 
              onBack={() => setStep(1)} 
              onNext={() => setStep(3)} 
              nextText="Next: Explore Architectures" 
              nextIcon={GitMerge}
            />
          </div>
        )}

        {/* STEP 3: EXPLORE APPROACHES */}
        {step === 3 && analysisData && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
            <div className="border-b border-zinc-800/80 pb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
                <GitMerge className="w-3.5 h-3.5" /> Stage 3 / 6: Architectural Trade-off Matrix
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Explore Approaches</h2>
              <p className="text-zinc-400 text-sm mt-1">Select the architectural direction that fits your budget, technical difficulty, and scale.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {analysisData.explore.map((app) => (
                <div 
                  key={app.id} 
                  className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col transition-all hover:border-red-500/50 hover:shadow-[0_0_35px_-10px_rgba(239,68,68,0.25)] hover:-translate-y-1 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      app.difficulty === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      app.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {app.difficulty} Difficulty
                    </span>
                    {app.estimatedCostRange && (
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3 text-zinc-500" />
                        {app.estimatedCostRange.replace('$', '')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{app.name}</h3>
                  {app.tagline && <p className="text-xs text-zinc-400 italic mb-3">{app.tagline}</p>}
                  
                  <p className="text-zinc-300 text-sm mb-6 flex-grow leading-relaxed">{app.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Advantages</h4>
                      <ul className="space-y-1.5">
                        {app.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Trade-offs</h4>
                      <ul className="space-y-1.5">
                        {app.cons.map((con, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                            <span className="text-red-400 font-bold leading-none mt-0.5 shrink-0">-</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {app.complexity && (
                      <div className="pt-3 border-t border-zinc-800 text-xs">
                        <span className="text-zinc-500 block mb-0.5 text-[10px] uppercase font-mono">Hardware/Stack:</span>
                        <span className="text-zinc-300">{app.complexity}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleSelectApproach(app)}
                    className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 font-semibold text-xs sm:text-sm text-zinc-200 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-all flex items-center justify-center gap-2 mt-auto"
                  >
                    Select & Forge Blueprint
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            <NavigationButtons 
              onBack={() => setStep(2)} 
              backText="Back to Stress Test"
            />
          </div>
        )}

        {/* STEP 4: VISUALIZE SYSTEM ARCHITECTURE */}
        {step === 4 && visualizeData && selectedApproach && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
            <div className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5" /> Stage 4 / 6: Subsystem Architecture & Node Topology
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">System Architecture</h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Interactive schematic for: <span className="text-white font-semibold">{selectedApproach.name}</span>
                </p>
              </div>

              {/* Node filter buttons */}
              <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs">
                {['all', 'mechanism', 'brain', 'sensor', 'power'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setNodeFilter(filter)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                      nodeFilter === filter 
                        ? 'bg-zinc-800 text-white font-semibold' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {filter === 'all' ? 'All Subsystems' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Architecture Canvas */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Interactive Node Graph Area */}
              <div className="lg:col-span-2 bg-[#09090d] border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
                {/* Decorative blueprint grid background */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'radial-gradient(#ef4444 0.75px, transparent 0.75px), linear-gradient(#27272a 0.5px, transparent 0.5px), linear-gradient(90deg, #27272a 0.5px, transparent 0.5px)', 
                    backgroundSize: '24px 24px' 
                  }}
                />

                <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-3 mb-6">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Interactive Subsystem Map (Click nodes to inspect)
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {visualizeData.visualize.nodes.length} Nodes &bull; {visualizeData.visualize.edges.length} Interconnections
                  </span>
                </div>

                {/* Subsystem Node Matrix */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
                  {visualizeData.visualize.nodes
                    .filter(node => nodeFilter === 'all' || node.type === nodeFilter)
                    .map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const getNodeIcon = () => {
                        switch (node.type) {
                          case 'brain': return <Cpu className="w-4 h-4 text-purple-400" />;
                          case 'mechanism': return <Box className="w-4 h-4 text-red-400" />;
                          case 'sensor': return <Radio className="w-4 h-4 text-cyan-400" />;
                          case 'power': return <BatteryCharging className="w-4 h-4 text-amber-400" />;
                          default: return <Layers className="w-4 h-4 text-zinc-400" />;
                        }
                      };

                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-zinc-900 border-red-500 shadow-[0_0_25px_-5px_rgba(239,68,68,0.4)] scale-[1.02]'
                              : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getNodeIcon()}
                              <span className="font-bold text-white text-sm">{node.label}</span>
                            </div>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {node.type}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {node.desc}
                          </p>

                          {node.specs && (
                            <div className="mt-2 text-[11px] font-mono text-zinc-500 truncate">
                              Spec: {node.specs}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Active Edge Signals */}
                <div className="relative z-10 pt-4 border-t border-zinc-800/80 mt-6 flex flex-wrap gap-2 text-[11px]">
                  {visualizeData.visualize.edges.slice(0, 4).map((edge, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <span className="text-red-400 font-mono text-[10px]">{edge.from}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600" />
                      <span className="text-red-400 font-mono text-[10px]">{edge.to}</span>
                      <span className="text-zinc-500 font-sans">({edge.label})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subsystem Detail Inspector Panel */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
                {(() => {
                  const activeNode = visualizeData.visualize.nodes.find(n => n.id === selectedNodeId) || visualizeData.visualize.nodes[0];
                  if (!activeNode) return <div />;

                  const connectedEdges = visualizeData.visualize.edges.filter(
                    e => e.from === activeNode.id || e.to === activeNode.id
                  );

                  return (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">Subsystem Inspector</span>
                          <span className="text-xs font-mono px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">{activeNode.id}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{activeNode.label}</h3>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <span className="text-zinc-500 block mb-1 uppercase font-semibold">Functional Role</span>
                          <p className="text-zinc-300 leading-relaxed bg-zinc-950/70 p-3 rounded-xl border border-zinc-850">
                            {activeNode.desc}
                          </p>
                        </div>

                        {activeNode.specs && (
                          <div>
                            <span className="text-zinc-500 block mb-1 uppercase font-semibold">Engineering Specs</span>
                            <p className="text-zinc-200 font-mono bg-zinc-950/70 p-3 rounded-xl border border-zinc-850">
                              {activeNode.specs}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-zinc-500 block mb-2 uppercase font-semibold">Connected Pathways</span>
                          <div className="space-y-2">
                            {connectedEdges.map((e, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800 flex items-center justify-between text-[11px]">
                                <span className="text-zinc-400">
                                  {e.from === activeNode.id ? `Sends to ${e.to}` : `Receives from ${e.from}`}
                                </span>
                                <span className="text-red-400 font-medium">{e.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-6 border-t border-zinc-800/80 mt-6 text-center text-xs text-zinc-500">
                  Select other nodes on the canvas to inspect subsystem parameters.
                </div>
              </div>

            </div>

            <NavigationButtons 
              onBack={() => setStep(3)} 
              onNext={() => setStep(5)} 
              nextText="Next: Prototype Build Plan" 
              nextIcon={Hammer}
            />
          </div>
        )}

        {/* STEP 5: PROTOTYPE BUILD PLAN */}
        {step === 5 && visualizeData && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
            <div className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
                  <Hammer className="w-3.5 h-3.5" /> Stage 5 / 6: Implementation Roadmap & Bill of Materials
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Prototype Build Plan</h2>
                <p className="text-zinc-400 text-sm mt-1">From concept to physical execution on the workbench.</p>
              </div>

              {visualizeData.buildPlan.totalEstimatedBudget && (
                <div className="bg-red-950/20 border border-red-500/30 px-4 py-2 rounded-xl text-left">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Estimated BOM Budget</span>
                  <span className="text-base font-bold text-red-400">{visualizeData.buildPlan.totalEstimatedBudget}</span>
                </div>
              )}
            </div>

            {/* Priority First Minimum Test Banner */}
            {visualizeData.buildPlan.firstTest && (
              <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border-2 border-red-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono uppercase font-bold text-red-400 tracking-wider">Day-1 Validation Benchmark</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Do this before spending money</span>
                    </div>
                    <p className="text-white text-base font-semibold leading-relaxed">
                      {visualizeData.buildPlan.firstTest}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              {/* Materials & Safety Sidebar */}
              <div className="md:col-span-1 space-y-6">
                
                {/* Bill of Materials (BOM) */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-red-500" /> Bill of Materials
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {Array.isArray(visualizeData.buildPlan.components) ? visualizeData.buildPlan.components.length : 0} items
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {Array.isArray(visualizeData.buildPlan.components) && visualizeData.buildPlan.components.map((c: any, i: number) => {
                      if (typeof c === 'string') {
                        return (
                          <div key={i} className="text-xs text-zinc-300 flex items-start gap-2 border-b border-zinc-850 pb-2">
                            <span className="text-red-500 font-bold">&bull;</span>
                            <span>{c}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="border-b border-zinc-850 pb-2.5 last:border-b-0 text-xs">
                          <div className="font-medium text-zinc-100 flex items-center justify-between">
                            <span>{c.name}</span>
                            {c.approxCost && <span className="font-mono text-red-400 text-[11px]">{c.approxCost}</span>}
                          </div>
                          {c.spec && <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">{c.spec}</div>}
                          {c.source && <div className="text-[10px] text-zinc-500 mt-0.5">Source: {c.source}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty & Safety Notice */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
                  <div>
                    <h3 className="font-bold text-white text-xs mb-1 uppercase tracking-wider text-zinc-400">Technical Difficulty</h3>
                    <p className="text-sm font-semibold text-zinc-200">{visualizeData.buildPlan.difficulty}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-xs mb-1.5 uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Safety Notice & Hazard Control
                    </h3>
                    <p className="text-xs text-amber-300/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
                      {visualizeData.buildPlan.safety}
                    </p>
                  </div>

                  {visualizeData.buildPlan.criticalBottleneck && (
                    <div>
                      <h3 className="font-bold text-white text-xs mb-1 uppercase tracking-wider text-red-400">Critical Assembly Bottleneck</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {visualizeData.buildPlan.criticalBottleneck}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Phased Step-by-Step Execution */}
              <div className="md:col-span-2">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                    <span>Phased Execution Milestones</span>
                    <span className="text-xs font-mono text-zinc-500">Sequential Order</span>
                  </h3>

                  <div className="space-y-6">
                    {Array.isArray(visualizeData.buildPlan.steps) && visualizeData.buildPlan.steps.map((stepItem: any, i: number) => {
                      let title = "";
                      let details = "";
                      let validation = "";
                      let stepNum = i + 1;

                      if (typeof stepItem === 'string') {
                        const parts = stepItem.split(': ');
                        title = parts[0];
                        details = parts.slice(1).join(': ');
                      } else {
                        title = stepItem.title || `Phase ${stepItem.stepNumber || stepNum}`;
                        details = stepItem.details || "";
                        validation = stepItem.milestoneValidation || "";
                        stepNum = stepItem.stepNumber || stepNum;
                      }

                      return (
                        <div key={i} className="relative pl-9 before:content-[''] before:absolute before:left-[13px] before:top-7 before:bottom-[-20px] before:w-0.5 before:bg-zinc-800 last:before:hidden">
                          <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-zinc-950 border-2 border-red-500 flex items-center justify-center text-[11px] font-bold text-red-400 font-mono shadow-md">
                            {stepNum}
                          </div>
                          
                          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
                            <h4 className="font-bold text-zinc-100 text-sm">{title}</h4>
                            {details && <p className="text-zinc-300 text-xs mt-1.5 leading-relaxed">{details}</p>}
                            {validation && (
                              <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Validation Gate: {validation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <NavigationButtons 
              onBack={() => setStep(4)} 
              onNext={() => setStep(6)} 
              nextText="Generate Idea Document" 
              nextIcon={FileText}
            />
          </div>
        )}

        {/* STEP 6: IDEA DOCUMENT & EXPORT */}
        {step === 6 && analysisData && visualizeData && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6 print:hidden">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" /> Stage 6 / 6: Executive Specification & Export
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Idea Summary & Spec</h2>
                <p className="text-zinc-400 text-sm mt-1">Your structured concept ready for sharing, pitch decks, or fabrication.</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={downloadJSON}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                  title="Download complete JSON data"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
                  title="Print or export as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button 
                  onClick={copyDocument}
                  className="flex items-center gap-2 bg-white text-zinc-950 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-md"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Export Markdown"}
                </button>
              </div>
            </div>

            {/* Document Sheet */}
            <div className="bg-[#0b0b0e] border border-zinc-800 rounded-3xl p-6 sm:p-10 md:p-12 font-sans text-sm leading-relaxed text-zinc-300 max-w-4xl mx-auto shadow-2xl relative">
              <div className="mb-10 pb-8 border-b border-zinc-800/80 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono uppercase tracking-widest mb-3">
                  IdeaForge Engineering Specification
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  {selectedApproach?.name || 'Prototype Concept'}
                </h1>
                <p className="text-zinc-400 italic max-w-2xl mx-auto text-sm">
                  "{idea}"
                </p>
              </div>

              {/* Core Pitch & Architecture Summary */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="bg-zinc-950/60 p-6 rounded-2xl border border-zinc-850">
                  <h3 className="text-xs uppercase tracking-wider mb-3 font-bold text-red-400 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> The Core Pitch
                  </h3>
                  <p className="text-zinc-200 text-sm mb-3 leading-relaxed">{analysisData.analysis.core}</p>
                  <div className="text-xs text-zinc-400">
                    <strong className="text-white block mb-1">Target Market:</strong>
                    {analysisData.analysis.user}
                  </div>
                </div>

                <div className="bg-zinc-950/60 p-6 rounded-2xl border border-zinc-850">
                  <h3 className="text-xs uppercase tracking-wider mb-3 font-bold text-red-400 flex items-center gap-2">
                    <Box className="w-3.5 h-3.5" /> Architectural Direction
                  </h3>
                  <p className="text-zinc-200 text-sm mb-3 leading-relaxed">{selectedApproach?.description}</p>
                  <div className="text-xs text-zinc-400">
                    <strong className="text-white block mb-1">Technical Stack:</strong>
                    {selectedApproach?.complexity}
                  </div>
                </div>
              </div>

              {/* Implementation Roadmap */}
              <div className="mb-10">
                <h3 className="text-xs uppercase tracking-wider mb-4 font-bold text-red-400 flex items-center gap-2">
                  <Hammer className="w-3.5 h-3.5" /> Phased Execution Timeline
                </h3>
                <div className="bg-zinc-950/60 p-6 rounded-2xl border border-zinc-850 space-y-4">
                  {Array.isArray(visualizeData.buildPlan.steps) && visualizeData.buildPlan.steps.map((s: any, i: number) => {
                    const text = typeof s === 'string' ? s : `${s.title}: ${s.details}`;
                    return (
                      <div key={i} className="flex items-start gap-3 text-xs text-zinc-300">
                        <span className="font-mono text-red-400 font-bold shrink-0">Phase {i+1}:</span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                  
                  {visualizeData.buildPlan.firstTest && (
                    <div className="mt-4 pt-4 border-t border-zinc-850 flex items-start gap-2 text-xs font-semibold text-emerald-400">
                      <Zap className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                      <span>Priority First Test: {visualizeData.buildPlan.firstTest}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stress Mitigation Checklist */}
              <div className="mb-10">
                <h3 className="text-xs uppercase tracking-wider mb-4 font-bold text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5" /> Key Mitigations & Stress Protections
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {analysisData.stressTest.slice(0, 4).map((test, idx) => (
                    <div key={idx} className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-850 text-xs">
                      <div className="font-semibold text-zinc-200 mb-1">{test.issue}</div>
                      <div className="text-emerald-400 text-[11px]">&rarr; {test.solution}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-8 border-t border-zinc-850 text-zinc-600 text-xs flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-red-500 opacity-60" />
                  <span className="font-bold text-zinc-400">IdeaForge</span> Prototyping Engine
                </div>
                <span>First-principles engineering validation</span>
              </div>
            </div>
            
            <div className="text-center mt-10 print:hidden flex items-center justify-center gap-6">
              <button 
                onClick={() => setStep(3)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                &larr; Try Another Architecture
              </button>
              <span className="text-zinc-700">&bull;</span>
              <button 
                onClick={() => {
                  setIdea("");
                  setAnalysisData(null);
                  setSelectedApproach(null);
                  setVisualizeData(null);
                  setCustomChallenges([]);
                  setStep(0);
                }}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors underline underline-offset-4"
              >
                Start a Brand New Idea
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
