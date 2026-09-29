import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Database,
  TrendingUp,
  BarChart3,
  ListOrdered,
  BrainCircuit,
  Settings,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PipelineStepper } from './PipelineStepper';
import { SystemStatusPopover } from './SystemStatusPopover';

const NAV_ITEMS = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Exploration', path: '/exploration', icon: Compass },
  { name: 'Prospectivity Map', path: '/prospectivity', icon: MapPin },
  { name: 'Resource Intelligence', path: '/resources', icon: Database },
  { name: 'Production Forecast', path: '/forecast', icon: TrendingUp },
  { name: 'Shortfall Analysis', path: '/shortfall', icon: BarChart3 },
  { name: 'Exploration Priority', path: '/priority', icon: ListOrdered },
  { name: 'Model Analytics', path: '/models', icon: BrainCircuit },
];

export const Sidebar: React.FC = () => {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-30 bg-[#111316] border-r border-[#23272D] flex flex-col transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Block */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#23272D] shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Mn Crystal Hexagon Icon */}
          <div className="w-8 h-8 rounded bg-[#D4A017]/15 border border-[#D4A017] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5 text-[#D4A017]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <text x="7.5" y="15" fontSize="9" fontWeight="bold" fill="#D4A017" stroke="none" fontFamily="monospace">
                Mn
              </text>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-mono font-bold tracking-widest text-[#D4A017]">MANGANESE</span>
              <span className="text-[10px] font-sans font-semibold text-[#8A929C] tracking-wider">INTELLIGENCE</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-[#8A929C] hover:text-[#E7E9EC] hover:bg-[#171A1E] transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors relative group ${
                  isActive
                    ? 'text-[#E7E9EC] bg-[#D4A017]/10 font-semibold'
                    : 'text-[#8A929C] hover:text-[#E7E9EC] hover:bg-[#171A1E]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4A017]" />}
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A017]' : 'text-[#8A929C] group-hover:text-[#E7E9EC]'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Vertical Pipeline Tracker (Visible only when expanded) */}
        {!sidebarCollapsed && (
          <div className="pt-4 pb-2 border-t border-[#23272D] my-2">
            <PipelineStepper mode="vertical" />
          </div>
        )}
      </div>

      {/* Bottom Group */}
      <div className="p-2 border-t border-[#23272D] bg-[#0A0B0D] space-y-1 shrink-0">
        {!sidebarCollapsed && <SystemStatusPopover />}

        <NavLink
          to="/datasources"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors ${
              isActive ? 'text-[#D4A017] bg-[#D4A017]/10' : 'text-[#8A929C] hover:text-[#E7E9EC] hover:bg-[#171A1E]'
            }`
          }
          title="Data Sources"
        >
          <FolderGit2 className="w-4 h-4 text-[#D4A017] shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Data Sources</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors ${
              isActive ? 'text-[#D4A017] bg-[#D4A017]/10' : 'text-[#8A929C] hover:text-[#E7E9EC] hover:bg-[#171A1E]'
            }`
          }
          title="Settings"
        >
          <Settings className="w-4 h-4 text-[#8A929C] shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Settings</span>}
        </NavLink>
      </div>

      {/* Faint Contours Identity Footer */}
      {!sidebarCollapsed && (
        <div className="px-3 py-1.5 border-t border-[#23272D] bg-[#111316] text-[10px] font-mono text-[#5B626B] truncate">
          Sample data · Model v0.2-demo · Region: Central India
        </div>
      )}
    </aside>
  );
};
