import React, { useState } from 'react';
import { 
  Sliders, Settings2, Play, Pause, RotateCcw, 
  Layers, Link2, Box, Eye, Sparkles, RefreshCw, Activity, Info
} from 'lucide-react';
import { DesignSpecification, JointDefinition, PartDefinition } from '../../types/design';

interface InspectorPanelProps {
  spec: DesignSpecification;
  selectedPart: PartDefinition | null;
  onUpdatePart: (updated: PartDefinition) => void;
  jointValues: Record<string, number>;
  onUpdateJointValue: (jointId: string, val: number) => void;
  onResetJoints: () => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  explodedFactor: number;
  onChangeExplodedFactor: (factor: number) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  spec,
  selectedPart,
  onUpdatePart,
  jointValues,
  onUpdateJointValue,
  onResetJoints,
  isSimulating,
  onToggleSimulate,
  simSpeed,
  onChangeSimSpeed,
  explodedFactor,
  onChangeExplodedFactor
}) => {
  const [activeTab, setActiveTab] = useState<'joints' | 'part' | 'specs'>('joints');

  return (
    <div className="flex flex-col h-full bg-[#0d0d11] border-l border-zinc-800/80 w-72 md:w-80 select-none">
      {/* Tab Switcher */}
      <div className="flex border-b border-zinc-800/80 bg-zinc-950/60 p-1 gap-1">
        <button
          onClick={() => setActiveTab('joints')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'joints'
              ? 'bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Joints ({spec.joints.length})
        </button>

        <button
          onClick={() => setActiveTab('part')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'part'
              ? 'bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Part
          {selectedPart && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'specs'
              ? 'bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          Specs
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* TAB 1: JOINTS & SIMULATION */}
        {activeTab === 'joints' && (
          <div className="space-y-6">
            {/* Simulation Controller Header */}
            <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  Mechanism Simulation
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isSimulating ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500'
                }`}>
                  {isSimulating ? 'RUNNING' : 'IDLE'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleSimulate}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isSimulating
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isSimulating ? 'Pause Motion' : 'Simulate Mechanism'}
                </button>

                <button
                  onClick={onResetJoints}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Reset all joints to defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed slider */}
              {isSimulating && (
                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
                  <span>Cycle Speed:</span>
                  <div className="flex gap-1.5">
                    {[0.5, 1, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => onChangeSimSpeed(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          simSpeed === s ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exploded View Slider */}
            <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Exploded Assembly View
                </span>
                <span className="font-mono text-[11px] text-cyan-400">
                  {Math.round(explodedFactor * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedFactor}
                onChange={(e) => onChangeExplodedFactor(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>Assembled</span>
                <span>Fully Exploded</span>
              </div>
            </div>

            {/* Joints List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Joint Manipulators</span>
                <span className="text-[10px] font-mono text-zinc-500">Live Kinematics</span>
              </div>

              {spec.joints.length === 0 ? (
                <div className="text-center py-6 text-zinc-600 text-xs">
                  No mechanical joints defined in this model.
                </div>
              ) : (
                spec.joints.map((joint) => {
                  const val = jointValues[joint.id] ?? joint.currentValue ?? joint.limits.default ?? 0;
                  const unit = joint.limits.unit || (joint.type === 'revolute' ? '°' : 'mm');

                  return (
                    <div
                      key={joint.id}
                      className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-xl space-y-2 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Link2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span className="font-semibold text-zinc-200 truncate">{joint.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                          {joint.type}
                        </span>
                      </div>

                      {/* Slider & Value */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-zinc-500">{joint.limits.min}{unit}</span>
                          <span className="text-amber-400 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {Math.round(val * 10) / 10}{unit}
                          </span>
                          <span className="text-zinc-500">{joint.limits.max}{unit}</span>
                        </div>

                        <input
                          type="range"
                          min={joint.limits.min}
                          max={joint.limits.max}
                          step={joint.type === 'revolute' ? 1 : 0.05}
                          value={val}
                          onChange={(e) => onUpdateJointValue(joint.id, parseFloat(e.target.value))}
                          className="w-full accent-orange-500 h-1.5 bg-zinc-800 rounded cursor-pointer"
                        />
                      </div>

                      {/* Connected Parts readout */}
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                        <span>{joint.parentPartId} &rarr; {joint.childPartId}</span>
                        <button
                          onClick={() => onUpdateJointValue(joint.id, joint.limits.default ?? 0)}
                          className="text-zinc-500 hover:text-zinc-300"
                          title="Reset joint to default"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PART PROPERTIES */}
        {activeTab === 'part' && (
          <div>
            {!selectedPart ? (
              <div className="text-center py-12 px-4 space-y-3">
                <Box className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">No part selected</p>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Click any component in the 3D viewport or from the Model Tree to inspect its dimensions, transform, and material.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Part Name & Type */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">Component Name</label>
                  <input
                    type="text"
                    value={selectedPart.name}
                    onChange={(e) => onUpdatePart({ ...selectedPart, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Geometry:</span>
                    <span className="uppercase text-amber-400">{selectedPart.geometry.type}</span>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-2 pt-3 border-t border-zinc-800">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">Dimensions (CAD Units)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selectedPart.geometry.dimensions.map((dim, idx) => {
                      const labels = ['Width (X)', 'Height (Y)', 'Depth (Z)'];
                      return (
                        <div key={idx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-850">
                          <span className="text-[9px] text-zinc-500 block uppercase font-mono">{labels[idx] || `Dim ${idx+1}`}</span>
                          <input
                            type="number"
                            step="0.1"
                            value={dim}
                            onChange={(e) => {
                              const newDims = [...selectedPart.geometry.dimensions];
                              newDims[idx] = parseFloat(e.target.value) || 0.1;
                              onUpdatePart({
                                ...selectedPart,
                                geometry: { ...selectedPart.geometry, dimensions: newDims }
                              });
                            }}
                            className="w-full bg-transparent text-xs font-mono text-zinc-200 outline-none mt-0.5"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transform Position */}
                <div className="space-y-2 pt-3 border-t border-zinc-800">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">Relative Position [X, Y, Z]</label>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="bg-zinc-950 p-2 rounded-lg border border-zinc-850">
                        <span className="text-[9px] text-zinc-500 block font-mono">{axis}</span>
                        <input
                          type="number"
                          step="0.1"
                          value={selectedPart.transform.position[i]}
                          onChange={(e) => {
                            const newPos = [...selectedPart.transform.position] as [number, number, number];
                            newPos[i] = parseFloat(e.target.value) || 0;
                            onUpdatePart({
                              ...selectedPart,
                              transform: { ...selectedPart.transform, position: newPos }
                            });
                          }}
                          className="w-full bg-transparent text-xs text-zinc-200 outline-none mt-0.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Styling */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">Material & Finish</label>
                  
                  {/* Color picker */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Color Tone</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedPart.material.color || '#3b82f6'}
                        onChange={(e) => onUpdatePart({
                          ...selectedPart,
                          material: { ...selectedPart.material, color: e.target.value }
                        })}
                        className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-zinc-300 uppercase">{selectedPart.material.color}</span>
                    </div>
                  </div>

                  {/* Roughness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Roughness</span>
                      <span className="font-mono">{Math.round((selectedPart.material.roughness ?? 0.4) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedPart.material.roughness ?? 0.4}
                      onChange={(e) => onUpdatePart({
                        ...selectedPart,
                        material: { ...selectedPart.material, roughness: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-orange-500 h-1 bg-zinc-800 rounded"
                    />
                  </div>

                  {/* Metalness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Metalness</span>
                      <span className="font-mono">{Math.round((selectedPart.material.metalness ?? 0.5) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedPart.material.metalness ?? 0.5}
                      onChange={(e) => onUpdatePart({
                        ...selectedPart,
                        material: { ...selectedPart.material, metalness: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-orange-500 h-1 bg-zinc-800 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="space-y-5 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Model Name</span>
              <h4 className="font-bold text-white text-sm">{spec.name}</h4>
              <p className="text-zinc-400 mt-1 text-xs leading-relaxed">{spec.description}</p>
            </div>

            {/* Concept Understanding */}
            {spec.concept && (
              <div className="p-3 bg-zinc-950/70 border border-zinc-850 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-orange-400 block font-semibold">AI Engineering Understanding</span>
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-zinc-500 font-mono block text-[9px] uppercase">Functional Intent:</span>
                    <p className="text-zinc-300">{spec.concept.intent}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono block text-[9px] uppercase">Kinematic Principle:</span>
                    <p className="text-zinc-300">{spec.concept.operatingPrinciple}</p>
                  </div>
                  {spec.concept.suggestedMaterials && (
                    <div>
                      <span className="text-zinc-500 font-mono block text-[9px] uppercase">Suggested Materials:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {spec.concept.suggestedMaterials.map((mat, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-zinc-950/70 border border-zinc-850 rounded-xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">CAD Bounding Envelope</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="bg-zinc-900/80 p-2 rounded">
                  <span className="text-[9px] text-zinc-500 block">WIDTH</span>
                  <span className="text-amber-400 font-bold">{spec.dimensions?.width ?? '3.5'} {spec.dimensions?.unit || 'cm'}</span>
                </div>
                <div className="bg-zinc-900/80 p-2 rounded">
                  <span className="text-[9px] text-zinc-500 block">HEIGHT</span>
                  <span className="text-amber-400 font-bold">{spec.dimensions?.height ?? '4.2'} {spec.dimensions?.unit || 'cm'}</span>
                </div>
                <div className="bg-zinc-900/80 p-2 rounded">
                  <span className="text-[9px] text-zinc-500 block">DEPTH</span>
                  <span className="text-amber-400 font-bold">{spec.dimensions?.depth ?? '3.8'} {spec.dimensions?.unit || 'cm'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Kinematic Degrees of Freedom (DOF)</span>
              <div className="p-3 bg-zinc-950/70 border border-zinc-850 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Components:</span>
                  <span className="font-mono text-white">{spec.parts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Mechanical Joints:</span>
                  <span className="font-mono text-white">{spec.joints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Revolute (Hinges):</span>
                  <span className="font-mono text-orange-400">{spec.joints.filter(j => j.type === 'revolute').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Prismatic (Sliders):</span>
                  <span className="font-mono text-cyan-400">{spec.joints.filter(j => j.type === 'prismatic').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
