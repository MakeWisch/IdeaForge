import React, { useState } from 'react';
import { 
  Sparkles, Send, RefreshCw, Wand2, PlusCircle, 
  HelpCircle, ArrowRight, Zap, Edit3 
} from 'lucide-react';

interface CommandConsoleProps {
  onGenerateNew: (prompt: string) => Promise<void>;
  onModifyExisting: (instruction: string) => Promise<void>;
  onSelectPreset: (presetId: string) => void;
  isLoading: boolean;
  loadingMessage: string;
  hasActiveModel: boolean;
  activeProvider: string;
  isFallbackUsed: boolean;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  onGenerateNew,
  onModifyExisting,
  onSelectPreset,
  isLoading,
  loadingMessage,
  hasActiveModel,
  activeProvider,
  isFallbackUsed
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'new' | 'modify'>('new');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput('');

    if (mode === 'modify' && hasActiveModel) {
      await onModifyExisting(query);
    } else {
      await onGenerateNew(query);
    }
  };

  const samplePrompts = [
    { label: 'Folding Phone Stand', id: 'phone-stand' },
    { label: 'Hinged Case', id: 'hinged-box' },
    { label: '3-Axis Cobot', id: 'robotic-arm' },
    { label: 'Toggle Latch', id: 'mechanical-latch' },
    { label: 'Kinetic Chessboard', id: 'kinetic-chessboard' },
  ];

  return (
    <div className="bg-[#0c0c10] border-t border-zinc-800/80 p-3 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
        
        {/* Top Control Bar with Presets & Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Mode switch */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setMode('new')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'new'
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wand2 className="w-3 h-3" />
              Generate New
            </button>

            <button
              onClick={() => setMode('modify')}
              disabled={!hasActiveModel}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'modify'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : !hasActiveModel
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={!hasActiveModel ? 'Load or generate a model first' : 'Modify current 3D mechanism'}
            >
              <Edit3 className="w-3 h-3" />
              Modify Mechanism
            </button>
          </div>

          {/* Quick presets */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[10px] uppercase font-mono text-zinc-500 mr-1">Demo Models:</span>
            {samplePrompts.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-orange-400 hover:border-orange-500/50 text-[11px] font-medium transition-colors whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Active AI Provider Status Badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-850">
            <span className={`w-1.5 h-1.5 rounded-full ${isFallbackUsed ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="uppercase">{activeProvider || 'AI'} ENGINE</span>
            {isFallbackUsed && <span className="text-amber-400">(FALLBACK)</span>}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={
                mode === 'modify'
                  ? 'E.g. "Make the primary arm 50% longer and add a support rib", "Change hinge range to 140 degrees"...'
                  : 'E.g. "Create a folding phone stand with dual hinged arms", "Articulated desk lamp with pantograph linkages"...'
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/80 shadow-inner"
            />
            {isLoading && (
              <div className="absolute right-3 top-2.5 flex items-center gap-2 text-xs text-orange-400 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{loadingMessage || 'Synthesizing 3D Specification...'}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              mode === 'modify'
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed shadow-md`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">{mode === 'modify' ? 'Apply Modification' : 'Forge 3D Model'}</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
