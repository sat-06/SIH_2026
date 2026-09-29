import React from 'react';
import { Layers } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Layers className="w-8 h-8 text-[#8A929C]" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-[#111316] border border-[#23272D] rounded-md my-4">
      <div className="p-3 bg-[#171A1E] rounded-full mb-3 text-[#D4A017]">{icon}</div>
      <h3 className="text-sm font-semibold text-[#E7E9EC] mb-1">{title}</h3>
      <p className="text-xs text-[#8A929C] max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
