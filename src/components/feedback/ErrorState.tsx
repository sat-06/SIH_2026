import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Fetch Error',
  message = 'Failed to load service data. Please check network connectivity or simulated error setting.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-[#111316] border border-[#E5484D]/40 rounded-md my-4">
      <AlertOctagon className="w-8 h-8 text-[#E5484D] mb-2" />
      <h4 className="text-sm font-semibold text-[#E7E9EC] mb-1">{title}</h4>
      <p className="text-xs text-[#8A929C] max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded bg-[#171A1E] hover:bg-[#23272D] text-[#E7E9EC] border border-[#23272D] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};
