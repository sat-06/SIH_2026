import React from 'react';
import { Info } from 'lucide-react';
import { DISCLAIMER_TEXT } from '../../lib/resourceCalc';

interface DisclaimerBannerProps {
  className?: string;
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ className = '', compact = false }) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 ${
        compact ? 'py-1.5 text-[11px]' : 'py-2.5 text-xs'
      } rounded bg-[#D4A017]/10 border border-[#D4A017]/40 text-[#E7E9EC] ${className}`}
    >
      <Info className="w-4 h-4 text-[#D4A017] shrink-0" />
      <span className="font-sans font-medium text-[#E7E9EC] opacity-90 leading-tight">
        {DISCLAIMER_TEXT}
      </span>
    </div>
  );
};
