import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useSelectedZone } from '../../hooks/useSelectedZone';
import { DemoDataChip } from '../feedback/DemoDataChip';
import { GlobalSearchModal } from './GlobalSearchModal';
import { Search, Bell, User, MapPin, Calendar, ChevronRight } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

export const TopNavbar: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedZoneId } = useSelectedZone();
  const regionId = useAppStore((s) => s.regionId);
  const setRegionId = useAppStore((s) => s.setRegionId);
  const dateRange = useAppStore((s) => s.dateRange);
  const setDateRange = useAppStore((s) => s.setDateRange);

  // Generate breadcrumbs from route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const items = [{ name: 'Platform', path: '/' }];

    if (path === '/') items.push({ name: 'Overview', path: '/' });
    else if (path === '/exploration') {
      items.push({ name: 'Exploration', path: '/exploration' });
      if (selectedZoneId) items.push({ name: `Zone ${selectedZoneId}`, path: `/exploration?zone=${selectedZoneId}` });
    } else if (path === '/prospectivity') items.push({ name: 'Prospectivity Map', path: '/prospectivity' });
    else if (path === '/resources') items.push({ name: 'Resource Intelligence', path: '/resources' });
    else if (path === '/forecast') items.push({ name: 'Production Forecast', path: '/forecast' });
    else if (path === '/shortfall') items.push({ name: 'Shortfall Analysis', path: '/shortfall' });
    else if (path === '/priority') items.push({ name: 'Exploration Priority', path: '/priority' });
    else if (path === '/models') items.push({ name: 'Model Analytics', path: '/models' });
    else if (path === '/datasources') items.push({ name: 'Data Sources', path: '/datasources' });
    else if (path === '/settings') items.push({ name: 'Settings', path: '/settings' });

    return items;
  };

  const breadcrumbs = getBreadcrumbs();
  const showDateFilter = ['/', '/forecast', '/shortfall'].includes(location.pathname);

  return (
    <>
      <header className="h-16 bg-[#111316] border-b border-[#23272D] px-4 flex items-center justify-between gap-4 sticky top-0 z-20">
        {/* Left: Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A929C] truncate">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={item.path + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#5B626B] shrink-0" />}
                <button
                  onClick={() => navigate(item.path)}
                  className={`hover:text-[#E7E9EC] transition-colors truncate ${
                    isLast ? 'font-semibold text-[#E7E9EC] font-mono' : ''
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Center: Global Search Bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#171A1E] border border-[#23272D] text-xs text-[#8A929C] hover:text-[#E7E9EC] hover:border-[#D4A017]/50 transition-all w-64 md:w-80 font-mono"
        >
          <Search className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
          <span className="truncate">Search zones by ID or district...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] bg-[#0A0B0D] border border-[#23272D] text-[#8A929C] rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Right: Controls & Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Region Selector */}
          <div className="hidden md:flex items-center gap-1 bg-[#171A1E] border border-[#23272D] rounded px-2 py-1 text-xs font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#D4A017]" />
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="bg-transparent text-[#E7E9EC] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111316]">All Regions (India)</option>
              <option value="odisha-belt" className="bg-[#111316]">Keonjhar-Sundergarh (Odisha)</option>
              <option value="mp-mh-belt" className="bg-[#111316]">Balaghat-Nagpur (MP/MH)</option>
            </select>
          </div>

          {/* Date Filter (conditional) */}
          {showDateFilter && (
            <div className="hidden lg:flex items-center gap-1 bg-[#171A1E] border border-[#23272D] rounded px-2 py-1 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#D4A017]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-[#E7E9EC] focus:outline-none cursor-pointer"
              >
                <option value="3m" className="bg-[#111316]">3 Months Horizon</option>
                <option value="6m" className="bg-[#111316]">6 Months Horizon</option>
                <option value="12m" className="bg-[#111316]">12 Months Horizon</option>
              </select>
            </div>
          )}

          {/* Demo Data Chip */}
          <DemoDataChip />

          {/* Notification Bell */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                className="p-2 rounded bg-[#171A1E] border border-[#23272D] text-[#8A929C] hover:text-[#E7E9EC] relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4A017]" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="z-50 w-72 bg-[#111316] border border-[#23272D] rounded-md p-3 shadow-2xl space-y-2 text-xs"
                sideOffset={8}
              >
                <div className="font-semibold text-[#E7E9EC] border-b border-[#23272D] pb-1.5 flex justify-between">
                  <span>System Activity Log</span>
                  <span className="text-[10px] font-mono text-[#D4A017]">3 New</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-[#171A1E] text-[11px]">
                    <div className="font-mono text-[#D4A017] font-semibold">Zone MN-047 Updated</div>
                    <div className="text-[#8A929C]">Multi-spectral SHAP score recomputed.</div>
                  </div>
                  <div className="p-2 rounded bg-[#171A1E] text-[11px]">
                    <div className="font-mono text-emerald-400 font-semibold">Sentinel-2 Ingestion</div>
                    <div className="text-[#8A929C]">24 new scenes synced for Keonjhar belt.</div>
                  </div>
                </div>
                <Popover.Arrow className="fill-[#111316]" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#23272D]">
            <div className="w-8 h-8 rounded-full bg-[#171A1E] border border-[#23272D] flex items-center justify-center text-[#D4A017]">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden xl:flex flex-col text-left leading-none">
              <span className="text-xs font-medium text-[#E7E9EC]">MoS Sr. Analyst</span>
              <span className="text-[10px] font-mono text-[#8A929C]">Geospatial Div</span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
