import React from 'react';

interface MapLegendProps {
  activeStatusFilter?: string | null;
  onFilterStatus?: (status: 'high' | 'medium' | 'low' | null) => void;
  zoneCounts?: { high: number; medium: number; low: number };
}

export const MapLegend: React.FC<MapLegendProps> = ({
  activeStatusFilter = null,
  onFilterStatus,
  zoneCounts = { high: 14, medium: 22, low: 12 },
}) => {
  return (
    <div className="bg-[#111316]/90 backdrop-blur-md border border-[#23272D] p-2.5 rounded-md shadow-xl text-xs space-y-2 w-48">
      <div className="flex items-center justify-between font-mono text-[10px] text-[#8A929C] uppercase font-semibold border-b border-[#23272D] pb-1">
        <span>Prospectivity Index</span>
        {activeStatusFilter && (
          <button
            onClick={() => onFilterStatus?.(null)}
            className="text-[#D4A017] hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-1">
        {/* High */}
        <button
          onClick={() => onFilterStatus?.(activeStatusFilter === 'high' ? null : 'high')}
          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
            activeStatusFilter === 'high'
              ? 'bg-[#2FB463]/20 border border-[#2FB463]/50'
              : 'hover:bg-[#171A1E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#2FB463] shrink-0" />
            <span className="font-semibold text-[#2FB463]">HIGH</span>
          </div>
          <span className="font-mono text-[10px] text-[#8A929C]">≥75% ({zoneCounts.high})</span>
        </button>

        {/* Medium */}
        <button
          onClick={() => onFilterStatus?.(activeStatusFilter === 'medium' ? null : 'medium')}
          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
            activeStatusFilter === 'medium'
              ? 'bg-[#E5C94B]/20 border border-[#E5C94B]/50'
              : 'hover:bg-[#171A1E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#E5C94B] shrink-0" />
            <span className="font-semibold text-[#E5C94B]">MEDIUM</span>
          </div>
          <span className="font-mono text-[10px] text-[#8A929C]">50–74% ({zoneCounts.medium})</span>
        </button>

        {/* Low */}
        <button
          onClick={() => onFilterStatus?.(activeStatusFilter === 'low' ? null : 'low')}
          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
            activeStatusFilter === 'low'
              ? 'bg-[#E5484D]/20 border border-[#E5484D]/50'
              : 'hover:bg-[#171A1E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#E5484D] shrink-0" />
            <span className="font-semibold text-[#E5484D]">LOW</span>
          </div>
          <span className="font-mono text-[10px] text-[#8A929C]">&lt;50% ({zoneCounts.low})</span>
        </button>
      </div>

      <div className="pt-1.5 border-t border-[#23272D] flex items-center justify-between text-[10px] text-[#8A929C] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border-2 border-[#D4A017] bg-[#D4A017]/30" />
          <span>Selected Zone</span>
        </span>
      </div>
    </div>
  );
};
