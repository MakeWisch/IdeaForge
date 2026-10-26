/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { DesignSpecification, PartDefinition } from './types/design';
import { DEMO_MODELS, DEMO_PHONE_STAND } from './data/demoModels';
import { validateAndSanitizeDesign } from './utils/designValidator';
import { TopToolbar } from './components/cad/TopToolbar';
import { PartsTree } from './components/cad/PartsTree';
import { SceneViewport } from './components/cad/SceneViewport';
import { InspectorPanel } from './components/cad/InspectorPanel';
import { CommandConsole } from './components/cad/CommandConsole';

export default function App() {
  // Current active 3D CAD design specification
  const [designSpec, setDesignSpec] = useState<DesignSpecification>(DEMO_PHONE_STAND);

  // Selected & Hovered parts
  const [selectedPartId, setSelectedPartId] = useState<string | null>('support_arm');
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);

  // Viewport display settings
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(false);
  const [showEdges, setShowEdges] = useState<boolean>(true);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);

  // Mechanical Joints live values mapping: { [jointId]: currentValue }
  const [jointValues, setJointValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const j of DEMO_PHONE_STAND.joints) {
      initial[j.id] = j.currentValue ?? j.limits.default ?? 0;
    }
    return initial;
  });

  // Simulation motion state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);
  const simStartTimeRef = useRef<number>(Date.now());

  // AI loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // AI Provider info
  const [providerInfo, setProviderInfo] = useState<{
    primaryProvider: string;
    fallbackProvider: string | null;
    configuredModel: string;
  } | null>(null);
  const [activeProviderUsed, setActiveProviderUsed] = useState<string>('gemini');
  const [fallbackWasUsed, setFallbackWasUsed] = useState<boolean>(false);

  // Endpoint configuration (Netlify Serverless Function or Vite dev middleware)
  const AI_ENDPOINT = '/.netlify/functions/ai';

  // Load AI provider status on mount
  useEffect(() => {
    fetch(AI_ENDPOINT)
      .then(res => res.json())
      .then(data => {
        if (data && data.primaryProvider) {
          setProviderInfo(data);
          setActiveProviderUsed(data.primaryProvider);
        }
      })
      .catch(() => {});
  }, []);

  // Update initial joint values whenever designSpec changes
  useEffect(() => {
    setJointValues(prev => {
      const next: Record<string, number> = {};
      for (const j of designSpec.joints) {
        next[j.id] = prev[j.id] ?? j.currentValue ?? j.limits.default ?? 0;
      }
      return next;
    });
  }, [designSpec]);

  // Harmonic simulation animation loop
  useEffect(() => {
    if (!isSimulating) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    simStartTimeRef.current = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - simStartTimeRef.current) / 1000;
      const t = elapsed * simSpeed * 1.8;

      setJointValues(prev => {
        const updated: Record<string, number> = { ...prev };
        designSpec.joints.forEach((joint, idx) => {
          if (joint.type === 'fixed') return;

          const { min, max } = joint.limits;
          const range = max - min;
          const mid = (min + max) / 2;
          // Phase offset per joint for organic articulated kinematic movement
          const phase = idx * 0.85;
          const sine = Math.sin(t + phase);

          updated[joint.id] = mid + (range / 2) * sine;
        });
        return updated;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimulating, simSpeed, designSpec]);

  // Reset joints to their default limits
  const handleResetJoints = () => {
    setIsSimulating(false);
    const defaults: Record<string, number> = {};
    for (const j of designSpec.joints) {
      defaults[j.id] = j.limits.default ?? 0;
    }
    setJointValues(defaults);
    setExplodedFactor(0);
  };

  // Select demo preset
  const handleSelectPreset = (presetId: string) => {
    const demo = DEMO_MODELS[presetId];
    if (demo) {
      setIsSimulating(false);
      setDesignSpec(demo);
      setSelectedPartId(demo.parts[0]?.id || null);
      setSuccessToast(`Loaded preset: ${demo.name}`);
      setTimeout(() => setSuccessToast(null), 2500);
    }
  };

  // AI Command: Generate Brand New 3D Mechanism
  const handleGenerateNew = async (prompt: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage('Deconstructing invention kinetics...');
    setIsSimulating(false);

    const progressSteps = [
      setTimeout(() => setLoadingMessage('Calculating primitive geometries & joints...'), 1400),
      setTimeout(() => setLoadingMessage('Synthesizing 3D DesignSpecification...'), 2800)
    ];

    try {
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate_3d_design',
          input: prompt
        })
      });

      progressSteps.forEach(clearTimeout);
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate 3D design specification.');
      }

      if (result.provider) setActiveProviderUsed(result.provider);
      const sanitized = validateAndSanitizeDesign(result.data, prompt);
      setDesignSpec(sanitized);
      setSelectedPartId(sanitized.parts[0]?.id || null);

      if (result.fallbackUsed) {
        setFallbackWasUsed(true);
        setSuccessToast(`${providerInfo?.primaryProvider || 'Primary provider'} was temporarily unavailable. Switched to ${result.provider}.`);
      } else {
        setSuccessToast(`Generated: ${sanitized.name}`);
      }
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      progressSteps.forEach(clearTimeout);
      setErrorMessage(err.message || 'Error communicating with AI provider.');
    } finally {
      setIsLoading(false);
    }
  };

  // AI Command: Modify Existing Mechanism
  const handleModifyExisting = async (instruction: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage(`Modifying: "${instruction.slice(0, 32)}..."`);
    setIsSimulating(false);

    try {
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'modify_3d_design',
          input: instruction,
          context: { currentSpec: designSpec }
        })
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to modify 3D design specification.');
      }

      if (result.provider) setActiveProviderUsed(result.provider);
      const sanitized = validateAndSanitizeDesign(result.data, designSpec.name);
      setDesignSpec(sanitized);

      if (result.fallbackUsed) {
        setFallbackWasUsed(true);
        setSuccessToast(`${providerInfo?.primaryProvider || 'Primary provider'} was temporarily unavailable. Switched to ${result.provider}.`);
      } else {
        setSuccessToast(`Applied modifications to ${sanitized.name}`);
      }
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error modifying 3D model.');
    } finally {
      setIsLoading(false);
    }
  };

  // AI Command: Regenerate Alternative Variation
  const handleRegenerate = async () => {
    const conceptIntent = designSpec.concept?.intent || designSpec.name;
    await handleGenerateNew(`Generate a fresh mechanical design variation for: ${conceptIntent}. Improve clearances, linkage angles, and manufacturability.`);
  };

  // Update a single part from Inspector properties
  const handleUpdatePart = (updatedPart: PartDefinition) => {
    setDesignSpec(prev => ({
      ...prev,
      parts: prev.parts.map(p => (p.id === updatedPart.id ? updatedPart : p))
    }));
  };

  // Toggle single part visibility
  const handleToggleVisibility = (partId: string) => {
    setDesignSpec(prev => ({
      ...prev,
      parts: prev.parts.map(p => (p.id === partId ? { ...p, visible: p.visible === false ? true : false } : p))
    }));
  };

  const selectedPart = designSpec.parts.find(p => p.id === selectedPartId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070709] text-zinc-300 font-sans overflow-hidden select-none">
      
      {/* Top CAD Toolbar */}
      <TopToolbar
        spec={designSpec}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showDimensions={showDimensions}
        onToggleDimensions={() => setShowDimensions(!showDimensions)}
        showEdges={showEdges}
        onToggleEdges={() => setShowEdges(!showEdges)}
        jointValues={jointValues}
        onSelectPreset={handleSelectPreset}
        onRegenerate={handleRegenerate}
        isLoading={isLoading}
      />

      {/* Main CAD Workspace Layout (Left Tree | 3D Viewport | Right Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left: Parts / Model Tree */}
        <PartsTree
          spec={designSpec}
          selectedPartId={selectedPartId}
          onSelectPart={setSelectedPartId}
          onToggleVisibility={handleToggleVisibility}
        />

        {/* Center: 3D Viewport */}
        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          
          {/* Toast / Notifications */}
          {successToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-2.5 rounded-xl text-xs shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-bold">AI CAD Engine Notice</strong>
                  <p className="text-red-300 text-[11px] mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-zinc-400 hover:text-white px-1.5 py-0.5 rounded text-xs"
              >
                &times;
              </button>
            </div>
          )}

          {/* 3D Scene Canvas */}
          <div className="flex-1 w-full h-full relative">
            <SceneViewport
              spec={designSpec}
              jointValues={jointValues}
              selectedPartId={selectedPartId}
              onSelectPart={setSelectedPartId}
              hoveredPartId={hoveredPartId}
              onHoverPart={setHoveredPartId}
              viewMode={viewMode}
              explodedFactor={explodedFactor}
              showGrid={showGrid}
              showDimensions={showDimensions}
              showEdges={showEdges}
            />

            {/* Viewport Overlay HUD (Bottom Left) */}
            <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center gap-2 font-mono text-[10px] text-zinc-500 bg-zinc-950/80 px-2.5 py-1 rounded-md border border-zinc-850">
              <span className="text-orange-400">FPS: 60</span>
              <span>&bull;</span>
              <span>{designSpec.parts.length} MESHES</span>
              <span>&bull;</span>
              <span>{designSpec.joints.length} JOINTS</span>
              <span>&bull;</span>
              <span className="text-zinc-400 uppercase">{viewMode} MODE</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Part / Joint Properties */}
        <InspectorPanel
          spec={designSpec}
          selectedPart={selectedPart}
          onUpdatePart={handleUpdatePart}
          jointValues={jointValues}
          onUpdateJointValue={(jointId, val) => {
            setIsSimulating(false);
            setJointValues(prev => ({ ...prev, [jointId]: val }));
          }}
          onResetJoints={handleResetJoints}
          isSimulating={isSimulating}
          onToggleSimulate={() => setIsSimulating(!isSimulating)}
          simSpeed={simSpeed}
          onChangeSimSpeed={setSimSpeed}
          explodedFactor={explodedFactor}
          onChangeExplodedFactor={setExplodedFactor}
        />

      </div>

      {/* Bottom: Natural Language AI Command Console */}
      <CommandConsole
        onGenerateNew={handleGenerateNew}
        onModifyExisting={handleModifyExisting}
        onSelectPreset={handleSelectPreset}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        hasActiveModel={Boolean(designSpec && designSpec.parts.length > 0)}
        activeProvider={activeProviderUsed || providerInfo?.primaryProvider || 'AI'}
        isFallbackUsed={fallbackWasUsed}
      />

    </div>
  );
}
