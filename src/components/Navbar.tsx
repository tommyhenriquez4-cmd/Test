import React from 'react';
import {
  Smartphone,
  Radio,
  RefreshCw,
  Clock,
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  Database,
  Activity
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export const Navbar: React.FC = () => {
  const { stats, agentConnected, agentHeartbeatSec, triggerAutoDiscovery } = useFarm();

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0b] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & System Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                NEXUS <span className="text-indigo-500">FARM</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                v2.4 PRO
              </span>
            </div>
          </div>
        </div>

        {/* Live Cluster Health Indicators */}
        <div className="hidden xl:flex items-center gap-5 border-l border-white/5 pl-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_6px_rgba(99,102,241,0.8)]"></span>
            <span>REDIS: UP</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            <span>CELERY: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
            <span>ADB: v1.0.41</span>
          </div>
        </div>
      </div>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-3">
        {/* Local Agent Status Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
          <div className="relative flex h-2 w-2">
            {agentConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                agentConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-rose-500'
              }`}
            ></span>
          </div>
          <span className="text-slate-400 font-medium">Local Agent:</span>
          <span className={agentConnected ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
            {agentConnected ? '127.0.0.1:22221' : 'Offline'}
          </span>
          <span className="text-slate-500 font-mono text-[11px]">[{agentHeartbeatSec}s]</span>
        </div>

        {/* Timezone */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Europe/Moscow (UTC+3)</span>
        </div>

        {/* Auto-Discovery Button */}
        <button
          id="btn-auto-discovery"
          onClick={triggerAutoDiscovery}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs text-slate-200 border border-white/10 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Auto-Discover</span>
        </button>

        {/* Active Phones Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>{stats.onlineDevices}/{stats.totalDevices} Phones Online</span>
        </div>
      </div>
    </header>
  );
};
