import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, MapPin, Layers, X } from 'lucide-react';
import { useZoneList } from '../../hooks/useZones';
import { useSelectedZone } from '../../hooks/useSelectedZone';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../feedback/StatusBadge';

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onOpenChange }) => {
  const { data: zones } = useZoneList();
  const { selectZone } = useSelectedZone();
  const navigate = useNavigate();

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-[#111316] border border-[#23272D] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <Command label="Global Search Zones" className="w-full">
          <div className="flex items-center border-b border-[#23272D] px-3">
            <Search className="w-4 h-4 text-[#D4A017] shrink-0 mr-2" />
            <Command.Input
              placeholder="Search zones by ID (e.g., MN-047), district or status..."
              className="w-full bg-transparent py-3 text-xs text-[#E7E9EC] placeholder:text-[#8A929C] focus:outline-none font-mono"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 text-[#8A929C] hover:text-[#E7E9EC] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="p-4 text-xs text-center text-[#8A929C]">
              No exploration zones match your query. Try searching 'MN-047' or 'Keonjhar'.
            </Command.Empty>

            <Command.Group heading="Potential Exploration Zones" className="text-[10px] font-mono text-[#8A929C] uppercase px-2 mb-1">
              {zones?.map((z) => (
                <Command.Item
                  key={z.id}
                  value={`${z.id} ${z.name} ${z.district} ${z.status} ${z.priorityTier}`}
                  onSelect={() => {
                    selectZone(z.id);
                    navigate(`/exploration?zone=${z.id}`);
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#171A1E] cursor-pointer group text-xs text-[#E7E9EC] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-[#171A1E] group-hover:bg-[#D4A017]/20 group-hover:text-[#D4A017] text-[#8A929C] transition-colors">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-[#D4A017] flex items-center gap-1.5">
                        <span>{z.id}</span>
                        <span className="text-[#E7E9EC] font-sans font-normal text-xs">{z.name}</span>
                      </div>
                      <div className="text-[11px] text-[#8A929C] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{z.district} District</span>
                        <span>·</span>
                        <span>{z.areaKm2} km²</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge type="prospectivity" status={z.status} score={z.prospectivityScore} />
                    <StatusBadge type="tier" tier={z.priorityTier} />
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="border-t border-[#23272D] px-3 py-1.5 text-[10px] font-mono text-[#8A929C] flex items-center justify-between bg-[#0A0B0D]">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-[#171A1E] text-[#E7E9EC]">Esc</kbd> to exit</span>
            <span>Use ↑ ↓ arrow keys to navigate</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
