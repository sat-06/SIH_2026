import React from 'react';
import { ProspectivityStatus, PriorityTier } from '../../types/domain';
import { CheckCircle2, AlertCircle, Clock, ShieldAlert, Zap } from 'lucide-react';

interface ProspectivityStatusBadgeProps {
  type: 'prospectivity';
  status: ProspectivityStatus;
  score?: number;
}

interface DataSourceStatusBadgeProps {
  type: 'datasource';
  status: 'CONNECTED' | 'PROCESSING' | 'NOT CONNECTED';
}

interface TierStatusBadgeProps {
  type: 'tier';
  tier: PriorityTier;
  score?: number;
}

type StatusBadgeProps = ProspectivityStatusBadgeProps | DataSourceStatusBadgeProps | TierStatusBadgeProps;

export const StatusBadge: React.FC<StatusBadgeProps> = (props) => {
  if (props.type === 'prospectivity') {
    const { status, score } = props;
    const config = {
      high: {
        bg: 'bg-[#2FB463]/15 text-[#2FB463] border-[#2FB463]/40',
        icon: <CheckCircle2 className="w-3 h-3 text-[#2FB463]" />,
        label: 'HIGH',
      },
      medium: {
        bg: 'bg-[#E5C94B]/15 text-[#E5C94B] border-[#E5C94B]/40',
        icon: <AlertCircle className="w-3 h-3 text-[#E5C94B]" />,
        label: 'MEDIUM',
      },
      low: {
        bg: 'bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/40',
        icon: <ShieldAlert className="w-3 h-3 text-[#E5484D]" />,
        label: 'LOW',
      },
    }[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold rounded border ${config.bg}`}>
        {config.icon}
        <span>{config.label}</span>
        {score !== undefined && <span className="opacity-75">({score}%)</span>}
      </span>
    );
  }

  if (props.type === 'datasource') {
    const { status } = props;
    const config = {
      CONNECTED: {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
        label: 'CONNECTED',
      },
      PROCESSING: {
        bg: 'bg-[#D4A017]/10 text-[#D4A017] border-[#D4A017]/30',
        icon: <Clock className="w-3 h-3 text-[#D4A017] animate-pulse" />,
        label: 'PROCESSING',
      },
      'NOT CONNECTED': {
        bg: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        icon: <AlertCircle className="w-3 h-3 text-zinc-400" />,
        label: 'NOT CONNECTED',
      },
    }[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded border ${config.bg}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  }

  if (props.type === 'tier') {
    const { tier, score } = props;
    const config = {
      'Tier 1': {
        bg: 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/50 font-bold',
        icon: <Zap className="w-3 h-3 fill-[#D4A017]" />,
      },
      'Tier 2': {
        bg: 'bg-slate-800 text-slate-200 border-slate-700',
        icon: null,
      },
      'Tier 3': {
        bg: 'bg-zinc-900 text-zinc-400 border-zinc-800',
        icon: null,
      },
    }[tier];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded border ${config.bg}`}>
        {config.icon}
        <span>{tier}</span>
        {score !== undefined && <span className="opacity-75">({score})</span>}
      </span>
    );
  }

  return null;
};
