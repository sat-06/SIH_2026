import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { useAppStore } from '../../store/useAppStore';
import { Toaster } from 'sonner';

export const DashboardLayout: React.FC = () => {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E7E9EC] flex flex-col font-sans selection:bg-[#D4A017]/30 selection:text-white">
      {/* Toast Notifications */}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#111316',
            border: '1px solid #23272D',
            color: '#E7E9EC',
            fontFamily: 'IBM Plex Sans, sans-serif',
          },
        }}
      />

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Sticky Top Bar */}
        <TopNavbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* Global Control Room Footer Line */}
        <footer className="h-7 bg-[#111316] border-t border-[#23272D] px-4 flex items-center justify-between text-[11px] font-mono text-[#8A929C] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2FB463] animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </span>
            <span>·</span>
            <span>MINISTRY OF STEEL — GEOSPATIAL INTELLIGENCE PLATFORM (SIH26009)</span>
          </div>

          <div className="flex items-center gap-4 text-[#5B626B]">
            <span>CRS: EPSG:4326 (WGS 84)</span>
            <span>·</span>
            <span>MODEL: V0.2-DEMO</span>
            <span>·</span>
            <span>LATENCY: 18ms</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
