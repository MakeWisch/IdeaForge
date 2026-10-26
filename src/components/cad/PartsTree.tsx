import React, { useState } from 'react';
import { 
  Box, Eye, EyeOff, Layers, Plus, 
  ChevronRight, ChevronDown, Link2, Sparkles, Trash2 
} from 'lucide-react';
import { DesignSpecification, PartDefinition } from '../../types/design';

interface PartsTreeProps {
  spec: DesignSpecification;
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
  onToggleVisibility: (partId: string) => void;
  onAddPart?: (part: PartDefinition) => void;
  onDeletePart?: (partId: string) => void;
}

export const PartsTree: React.FC<PartsTreeProps> = ({
  spec,
  selectedPartId,
  onSelectPart,
  onToggleVisibility,
  onAddPart,
  onDeletePart
}) => {
  const [filterText, setFilterText] = useState('');
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build tree structure
  const rootParts = spec.parts.filter(p => !p.parentId);
  const childPartsMap = new Map<string, PartDefinition[]>();
  for (const part of spec.parts) {
    if (part.parentId) {
      const arr = childPartsMap.get(part.parentId) || [];
      arr.push(part);
      childPartsMap.set(part.parentId, arr);
    }
  }

  // Map parts to their joints
  const jointsByPart = new Map<string, string[]>();
  for (const j of spec.joints) {
    const pList = jointsByPart.get(j.parentPartId) || [];
    pList.push(j.name);
    jointsByPart.set(j.parentPartId, pList);

    const cList = jointsByPart.get(j.childPartId) || [];
    cList.push(j.name);
    jointsByPart.set(j.childPartId, cList);
  }

  const renderPartItem = (part: PartDefinition, depth = 0) => {
    const isSelected = selectedPartId === part.id;
    const isVisible = part.visible !== false;
    const children = childPartsMap.get(part.id) || [];
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedParents[part.id];
    const jointNames = jointsByPart.get(part.id) || [];

    if (filterText && !part.name.toLowerCase().includes(filterText.toLowerCase())) {
      // Check if any child matches
      const hasMatchingChild = children.some(c => c.name.toLowerCase().includes(filterText.toLowerCase()));
      if (!hasMatchingChild) return null;
    }

    return (
      <div key={part.id} className="select-none">
        <div
          onClick={() => onSelectPart(part.id)}
          className={`group flex items-center justify-between py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 font-semibold'
              : 'hover:bg-zinc-800/60 text-zinc-300'
          }`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(part.id, e)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <span className="w-3" />
            )}

            {/* Material Color Dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-zinc-700 shadow-sm"
              style={{ backgroundColor: part.material.color || '#3b82f6' }}
            />

            <span className="truncate">{part.name}</span>

            {/* Geometry type badge */}
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-1 rounded bg-zinc-900 border border-zinc-800">
              {part.geometry.type}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            {/* Joint tag indicator */}
            {jointNames.length > 0 && (
              <span
                className="flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20"
                title={`Joints: ${jointNames.join(', ')}`}
              >
                <Link2 className="w-2.5 h-2.5" />
                {jointNames.length}
              </span>
            )}

            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(part.id);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
              title={isVisible ? 'Hide part' : 'Show part'}
            >
              {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-zinc-600" />}
            </button>
          </div>
        </div>

        {/* Nested Children */}
        {hasChildren && !isCollapsed && (
          <div className="border-l border-zinc-800/80 ml-3">
            {children.map(child => renderPartItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d11] border-r border-zinc-800/80 w-64 md:w-72 select-none">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Model Tree</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          {spec.parts.length} parts &bull; {spec.joints.length} joints
        </span>
      </div>

      {/* Filter input */}
      <div className="p-2 border-b border-zinc-800/60">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter parts..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60"
        />
      </div>

      {/* Parts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
        {rootParts.length > 0 ? (
          rootParts.map(part => renderPartItem(part))
        ) : (
          <div className="text-center py-8 text-zinc-600 text-xs">
            No parts in model
          </div>
        )}
      </div>

      {/* Bottom Summary Pill */}
      <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>DOF: {spec.joints.filter(j => j.type !== 'fixed').length} Active</span>
        <button
          onClick={() => onSelectPart(null)}
          className="hover:text-zinc-300 underline underline-offset-2"
        >
          Deselect
        </button>
      </div>
    </div>
  );
};
