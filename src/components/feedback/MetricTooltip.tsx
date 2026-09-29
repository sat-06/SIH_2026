import React from 'react';
import { HelpCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { GLOSSARY } from '../../lib/glossary';

interface MetricTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ term, children }) => {
  const item = GLOSSARY[term] || {
    term,
    definition: `Technical definition for ${term}.`,
  };

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help group">
            {children || <span className="underline decoration-dotted decoration-[#8A929C] underline-offset-2">{term}</span>}
            <HelpCircle className="w-3.5 h-3.5 text-[#8A929C] group-hover:text-[#D4A017] transition-colors inline" />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-xs bg-[#111316] text-[#E7E9EC] text-xs p-3 rounded border border-[#23272D] shadow-2xl leading-relaxed"
            sideOffset={5}
          >
            <div className="font-semibold text-[#D4A017] mb-1">{item.term}</div>
            <div className="text-[#E7E9EC]/90 text-[11px] mb-1.5">{item.definition}</div>
            {item.contextNote && (
              <div className="text-[10px] text-[#8A929C] italic border-t border-[#23272D] pt-1 mt-1">
                Note: {item.contextNote}
              </div>
            )}
            <Tooltip.Arrow className="fill-[#111316]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
