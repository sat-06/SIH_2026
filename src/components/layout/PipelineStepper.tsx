import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export interface PipelineStep {
  id: string;
  name: string;
  shortLabel: string;
  path: string;
  statText: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'step-1', name: 'Satellite Data Ingestion', shortLabel: 'Satellite Data', path: '/datasources', statText: 'Sentinel-2 scenes: 24' },
  { id: 'step-2', name: 'AI Prospectivity Analysis', shortLabel: 'AI Analysis', path: '/models', statText: 'Model ROC-AUC: 0.92' },
  { id: 'step-3', name: 'Potential Manganese Zones', shortLabel: 'Zones', path: '/prospectivity', statText: 'Zones scored: 48' },
  { id: 'step-4', name: 'Resource Intelligence', shortLabel: 'Resources', path: '/resources', statText: 'Est. Tonnage: P50' },
  { id: 'step-5', name: 'Exploration Priority Engine', shortLabel: 'Priority', path: '/priority', statText: 'Tier 1 Targets: 8' },
  { id: 'step-6', name: 'Production Forecast', shortLabel: 'Forecast', path: '/forecast', statText: 'Horizon: 12-Month' },
  { id: 'step-7', name: 'Shortfall Decision Support', shortLabel: 'Shortfall', path: '/shortfall', statText: 'Gap Mitigated' },
];

interface PipelineStepperProps {
  mode?: 'vertical' | 'horizontal';
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ mode = 'vertical' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getStepIndex = () => {
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath === '/overview') return 2; // default active in overview
    const idx = PIPELINE_STEPS.findIndex((s) => s.path === currentPath);
    return idx >= 0 ? idx : 2;
  };

  const activeIndex = getStepIndex();

  if (mode === 'horizontal') {
    return (
      <div className="w-full bg-[#111316] border border-[#23272D] rounded-md p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A929C] mb-2 font-semibold">
          End-to-End Mineral Intelligence Pipeline Flow
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = idx < activeIndex;

            return (
              <button
                key={step.id}
                onClick={() => navigate(step.path)}
                className={`flex flex-col p-2 rounded border transition-all text-left ${
                  isActive
                    ? 'bg-[#D4A017]/15 border-[#D4A017] shadow-sm'
                    : isPassed
                    ? 'bg-[#171A1E] border-[#23272D] opacity-90'
                    : 'bg-[#0A0B0D] border-[#23272D] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#D4A017]' : 'text-[#8A929C]'}`}>
                    0{idx + 1}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3 h-3 text-[#2FB463]" />
                  ) : (
                    <ChevronRight className={`w-3 h-3 ${isActive ? 'text-[#D4A017]' : 'text-[#8A929C]'}`} />
                  )}
                </div>
                <div className={`text-xs font-semibold truncate ${isActive ? 'text-[#E7E9EC]' : 'text-[#E7E9EC]/80'}`}>
                  {step.shortLabel}
                </div>
                <div className="text-[10px] font-mono text-[#8A929C] truncate mt-1">{step.statText}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-1">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A929C] mb-1 font-semibold">
        Pipeline Flow
      </div>
      <div className="space-y-1">
        {PIPELINE_STEPS.map((step, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <button
              key={step.id}
              onClick={() => navigate(step.path)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                isActive
                  ? 'bg-[#D4A017]/15 text-[#D4A017] font-semibold border-l-2 border-[#D4A017]'
                  : 'text-[#8A929C] hover:text-[#E7E9EC] hover:bg-[#171A1E]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono shrink-0 ${
                  isActive
                    ? 'bg-[#D4A017] text-black font-bold'
                    : isPassed
                    ? 'bg-[#2FB463]/20 text-[#2FB463]'
                    : 'bg-[#171A1E] text-[#8A929C]'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-xs truncate">{step.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
