import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers, Compass, Sliders } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import * as Popover from '@radix-ui/react-popover';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  coordsText?: string;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleFullscreen,
  coordsText = '21.6500°N, 85.5800°E',
}) => {
  const basemap = useAppStore((s) => s.basemap);
  const setBasemap = useAppStore((s) => s.setBasemap);
  const layerOpacity = useAppStore((s) => s.layerOpacity);
  const setLayerOpacity = useAppStore((s) => s.setLayerOpacity);
  const visibleLayers = useAppStore((s) => s.visibleLayers);
  const toggleLayer = useAppStore((s) => s.toggleLayer);

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
      {/* Bottom Left: Live Coordinates & Scale */}
      <div className="pointer-events-auto bg-[#111316]/90 backdrop-blur-md border border-[#23272D] px-3 py-1.5 rounded text-[11px] font-mono text-[#E7E9EC] flex items-center gap-3 shadow-lg">
        <span className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>{coordsText}</span>
        </span>
        <span className="text-[#5B626B]">|</span>
        <span className="text-[#8A929C]">Scale ~ 1:50,000</span>
      </div>

      {/* Bottom Right: Control Buttons */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[#111316]/90 backdrop-blur-md border border-[#23272D] p-1 rounded-md shadow-lg">
        {/* Basemap Switcher Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="p-1.5 rounded hover:bg-[#171A1E] text-[#8A929C] hover:text-[#E7E9EC] transition-colors"
              title="Basemap Options"
            >
              <Layers className="w-4 h-4 text-[#D4A017]" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-48 bg-[#111316] border border-[#23272D] rounded-md p-2 shadow-2xl space-y-1 text-xs"
              side="top"
              sideOffset={8}
            >
              <div className="font-semibold text-[#8A929C] px-2 py-1 uppercase text-[10px] font-mono border-b border-[#23272D]">
                Basemap Type
              </div>
              <button
                onClick={() => setBasemap('satellite')}
                className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                  basemap === 'satellite' ? 'bg-[#D4A017]/20 text-[#D4A017] font-semibold' : 'text-[#E7E9EC] hover:bg-[#171A1E]'
                }`}
              >
                Esri World Imagery (Satellite)
              </button>
              <button
                onClick={() => setBasemap('terrain')}
                className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                  basemap === 'terrain' ? 'bg-[#D4A017]/20 text-[#D4A017] font-semibold' : 'text-[#E7E9EC] hover:bg-[#171A1E]'
                }`}
              >
                OpenTopoMap (Terrain)
              </button>
              <button
                onClick={() => setBasemap('dark')}
                className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                  basemap === 'dark' ? 'bg-[#D4A017]/20 text-[#D4A017] font-semibold' : 'text-[#E7E9EC] hover:bg-[#171A1E]'
                }`}
              >
                Dark Canvas (Minimalist)
              </button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Opacity & Confidence Overlay Settings */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="p-1.5 rounded hover:bg-[#171A1E] text-[#8A929C] hover:text-[#E7E9EC] transition-colors"
              title="Layer Settings & Opacity"
            >
              <Sliders className="w-4 h-4 text-[#D4A017]" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-56 bg-[#111316] border border-[#23272D] rounded-md p-3 shadow-2xl space-y-3 text-xs"
              side="top"
              sideOffset={8}
            >
              <div className="font-semibold text-[#8A929C] border-b border-[#23272D] pb-1 font-mono uppercase text-[10px]">
                Prospectivity Opacity
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#8A929C]">
                  <span>Heatmap Opacity</span>
                  <span>{Math.round(layerOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={layerOpacity}
                  onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#D4A017] bg-[#171A1E] cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-[#23272D] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#E7E9EC]">Confidence Mask Overlay</span>
                <input
                  type="checkbox"
                  checked={visibleLayers.confidenceOverlay}
                  onChange={() => toggleLayer('confidenceOverlay')}
                  className="accent-[#D4A017] cursor-pointer"
                />
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <div className="w-px h-4 bg-[#23272D]" />

        <button
          onClick={onZoomIn}
          className="p-1.5 rounded hover:bg-[#171A1E] text-[#8A929C] hover:text-[#E7E9EC] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-1.5 rounded hover:bg-[#171A1E] text-[#8A929C] hover:text-[#E7E9EC] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onResetView}
          className="p-1.5 rounded hover:bg-[#171A1E] text-[#8A929C] hover:text-[#E7E9EC] transition-colors"
          title="Reset Extent"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded hover:bg-[#171A1E] text-[#8A929C] hover:text-[#E7E9EC] transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
