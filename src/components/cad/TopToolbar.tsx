import React, { useState } from 'react';
import { 
  Box, Grid, Download, RotateCcw, Eye, 
  Layers, Compass, Camera, Sparkles, FolderDown, FileCode, ChevronDown, Package
} from 'lucide-react';
import { DesignSpecification } from '../../types/design';
import { exportToOBJ, downloadFile } from '../../utils/objExporter';
import { exportToGLB } from '../../utils/gltfExporter';

interface TopToolbarProps {
  spec: DesignSpecification;
  viewMode: 'solid' | 'wireframe' | 'xray';
  onChangeViewMode: (mode: 'solid' | 'wireframe' | 'xray') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showDimensions: boolean;
  onToggleDimensions: () => void;
  showEdges: boolean;
  onToggleEdges: () => void;
  jointValues: Record<string, number>;
  onSelectPreset: (presetId: string) => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  spec,
  viewMode,
  onChangeViewMode,
  showGrid,
  onToggleGrid,
  showDimensions,
  onToggleDimensions,
  showEdges,
  onToggleEdges,
  jointValues,
  onSelectPreset,
  onRegenerate,
  isLoading
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportGLB = async () => {
    setIsExporting(true);
    try {
      await exportToGLB(spec, jointValues, { binary: true });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(spec, null, 2);
    const fileName = `${spec.name.toLowerCase().replace(/\s+/g, '-')}-design.json`;
    downloadFile(jsonStr, fileName, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportOBJ = () => {
    const objStr = exportToOBJ(spec, jointValues);
    const fileName = `${spec.name.toLowerCase().replace(/\s+/g, '-')}-cad.obj`;
    downloadFile(objStr, fileName, 'text/plain');
    setShowExportMenu(false);
  };

  const handleCaptureScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${spec.name.toLowerCase().replace(/\s+/g, '-')}-snapshot.png`;
      a.click();
    }
    setShowExportMenu(false);
  };

  return (
    <header className="h-14 bg-[#0a0a0d] border-b border-zinc-800/80 px-4 flex items-center justify-between select-none z-20 relative">
      {/* Left: Brand & Model Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Box className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-tight">IdeaForge</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase font-semibold">
                3D CAD STUDIO
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline block leading-none mt-0.5 truncate max-w-[240px]">
              {spec.name}
            </span>
          </div>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPresetsMenu(!showPresetsMenu);
              setShowExportMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <span>Load Demo Mechanism</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {showPresetsMenu && (
            <div className="absolute left-0 top-9 w-60 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 space-y-1 z-50">
              <div className="text-[10px] font-mono uppercase text-zinc-500 px-2 py-1">Believable Mechanisms</div>
              {[
                { id: 'phone-stand', name: 'Dual-Hinge Phone Stand' },
                { id: 'hinged-box', name: 'Sealed Enclosure Case' },
                { id: 'robotic-arm', name: '3-Axis Articulated Cobot' },
                { id: 'mechanical-latch', name: 'Over-Center Toggle Latch' },
                { id: 'kinetic-chessboard', name: 'Kinetic Chessboard Linkage' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPreset(p.id);
                    setShowPresetsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: View Mode Toggles */}
      <div className="hidden md:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={() => onChangeViewMode('solid')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            viewMode === 'solid' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Solid shaded CAD view"
        >
          Solid
        </button>
        <button
          onClick={() => onChangeViewMode('wireframe')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            viewMode === 'wireframe' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Technical Wireframe mode"
        >
          Wireframe
        </button>
        <button
          onClick={() => onChangeViewMode('xray')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            viewMode === 'xray' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="X-Ray transparent assembly view"
        >
          X-Ray
        </button>

        <span className="w-px h-4 bg-zinc-800 mx-1" />

        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg transition-colors ${
            showGrid ? 'text-orange-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Toggle Datum Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Dimensions Toggle */}
        <button
          onClick={onToggleDimensions}
          className={`p-1.5 rounded-lg transition-colors ${
            showDimensions ? 'text-cyan-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Toggle Dimension Envelope"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        {/* Edges Toggle */}
        <button
          onClick={onToggleEdges}
          className={`p-1.5 rounded-lg transition-colors ${
            showEdges ? 'text-amber-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Toggle CAD Edge Lines"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions & Export Menu */}
      <div className="flex items-center gap-2">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors disabled:opacity-50"
            title="Regenerate alternative design variation"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowPresetsMenu(false);
            }}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-orange-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CAD</span>
            <ChevronDown className="w-3 h-3 text-orange-200" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-9 w-60 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 space-y-1 z-50">
              <button
                onClick={handleExportGLB}
                disabled={isExporting}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <span className="block font-semibold">Standard GLB (.glb)</span>
                  <span className="text-[10px] text-zinc-500">Universal binary 3D asset</span>
                </div>
              </button>

              <button
                onClick={handleExportOBJ}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <FolderDown className="w-4 h-4 text-orange-400" />
                <div className="text-left">
                  <span className="block font-semibold">Wavefront OBJ (.obj)</span>
                  <span className="text-[10px] text-zinc-500">For 3D printing & Fusion 360</span>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <FileCode className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <span className="block font-semibold">Design Spec (.json)</span>
                  <span className="text-[10px] text-zinc-500">Machine-readable CAD schema</span>
                </div>
              </button>

              <button
                onClick={handleCaptureScreenshot}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <span className="block font-semibold">Snapshot (.png)</span>
                  <span className="text-[10px] text-zinc-500">Rendered viewport image</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

