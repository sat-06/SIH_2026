import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AlertTriangle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

export const DemoDataChip: React.FC = () => {
  const dataMode = useAppStore((s) => s.dataMode);

  if (dataMode === 'live') return null;

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded border border-[#D4A017]/60 text-[#D4A017] bg-[#D4A017]/10 hover:bg-[#D4A017]/20 transition-colors cursor-help">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DEMONSTRATION DATA</span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-xs bg-[#111316] text-[#E7E9EC] text-xs p-2.5 rounded border border-[#23272D] shadow-xl leading-relaxed"
            sideOffset={5}
          >
            Values are synthetic samples for prototype demonstration. Not real survey, model or production data.
            <Tooltip.Arrow className="fill-[#111316]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
