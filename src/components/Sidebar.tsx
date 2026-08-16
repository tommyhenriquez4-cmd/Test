import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  Users,
  Film,
  PlaySquare,
  CalendarClock,
  Code2,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'devices'
  | 'accounts'
  | 'media'
  | 'tasks'
  | 'schedules'
  | 'codehub'
  | 'ai';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'devices' as NavTab, label: 'Devices Fleet', icon: Smartphone, badge: '6' },
    { id: 'accounts' as NavTab, label: 'Social Accounts', icon: Users, badge: '5' },
    { id: 'media' as NavTab, label: 'Video Studio', icon: Film, badge: '500MB' },
    { id: 'tasks' as NavTab, label: 'Tasks & Logs', icon: PlaySquare, badge: 'Live' },
    { id: 'schedules' as NavTab, label: 'CRON Schedules', icon: CalendarClock, badge: '3' },
    { id: 'codehub' as NavTab, label: 'Code & Scripts', icon: Code2, badge: 'Full Code' },
    { id: 'ai' as NavTab, label: 'AI Generator', icon: Sparkles, badge: 'Gemini' }
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#111113] flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Farm Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-white border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.12)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium'
                      : 'bg-white/5 text-slate-400 border border-white/5'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Panel */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Laixi Bridge
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">22221 OK</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              ADB Daemon
            </span>
            <span className="text-indigo-300 font-mono text-[11px]">v1.0.41</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-[85%] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          </div>
          <p className="text-[10px] text-slate-500 text-center">Anti-Detection Jitter: Active</p>
        </div>
      </div>
    </aside>
  );
};
