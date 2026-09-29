import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Activity, Server } from 'lucide-react';
import { fetchSystemStatus } from '../../services/dataSourcesService';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '../feedback/StatusBadge';

export const SystemStatusPopover: React.FC = () => {
  const { data: statusList } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: fetchSystemStatus,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#8A929C] hover:text-[#E7E9EC] hover:bg-[#171A1E] rounded transition-colors"
          title="View System Status"
        >
          <Activity className="w-4 h-4 text-[#D4A017] shrink-0" />
          <span className="truncate">System Status</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-80 bg-[#111316] border border-[#23272D] rounded-md p-3.5 shadow-2xl space-y-3"
          side="right"
          sideOffset={10}
        >
          <div className="flex items-center justify-between border-b border-[#23272D] pb-2">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-[#E7E9EC]">
              <Server className="w-4 h-4 text-[#D4A017]" />
              <span>Platform Service Health</span>
            </div>
            <span className="text-[10px] font-mono text-[#8A929C]">Region: Odisha/MP</span>
          </div>

          <div className="space-y-2">
            {statusList?.map((item) => (
              <div key={item.name} className="flex flex-col gap-1 p-2 rounded bg-[#171A1E] border border-[#23272D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#E7E9EC]">{item.name}</span>
                  <StatusBadge type="datasource" status={item.status} />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8A929C]">
                  <span>{item.details}</span>
                  <span>{item.latencyMs}ms</span>
                </div>
              </div>
            ))}
          </div>
          <Popover.Arrow className="fill-[#111316]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
