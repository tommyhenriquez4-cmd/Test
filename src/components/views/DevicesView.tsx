import React, { useState } from 'react';
import {
  Smartphone,
  Battery,
  Flame,
  Wifi,
  Lock,
  Unlock,
  RotateCw,
  Play,
  Terminal,
  MoreVertical,
  Layers,
  Sparkles,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Device } from '../../types';
import { InstantTaskModal } from '../modals/InstantTaskModal';
import { AdbTerminalModal } from '../modals/AdbTerminalModal';

export const DevicesView: React.FC = () => {
  const { devices, accounts, rebootDevice, toggleScreenLock } = useFarm();
  const [filter, setFilter] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  const [taskModalDevice, setTaskModalDevice] = useState<Device | null>(null);
  const [terminalDevice, setTerminalDevice] = useState<Device | null>(null);

  const filteredDevices = devices.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'online') return d.status === 'online';
    if (filter === 'busy') return d.status === 'busy';
    if (filter === 'offline') return d.status === 'offline';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Android Fleet Matrix</h1>
          <p className="text-xs text-slate-400">
            Physical device rack control with per-device Mutex locks & Laixi screen touch injectors
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111113] border border-white/5 rounded-xl text-xs">
          {(['all', 'online', 'busy', 'offline'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f} ({f === 'all' ? devices.length : devices.filter((d) => d.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Phone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDevices.map((device) => {
          const assignedAcc = accounts.find((a) => a.id === device.assignedAccount);

          return (
            <div
              key={device.id}
              className="p-5 rounded-2xl bg-[#111113] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Top info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 relative">
                      <Smartphone className="w-5 h-5" />
                      <span
                        className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                          device.status === 'online'
                            ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                            : device.status === 'busy'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-rose-500'
                        }`}
                      ></span>
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-white tracking-tight">{device.name}</h2>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                        <span>{device.laixiId}</span>
                        <span>•</span>
                        <span>{device.serial}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                      device.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : device.status === 'busy'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {device.status}
                  </span>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono">{device.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono">{device.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono text-[10px] truncate">{device.ip.split('.').slice(-2).join('.')}</span>
                  </div>
                </div>

                {/* Assigned Social Account */}
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Assigned Account:</span>
                  {assignedAcc ? (
                    <span className="text-indigo-300 font-medium flex items-center gap-1">
                      <span className="uppercase text-[10px] px-1.5 py-0.5 bg-indigo-500/20 rounded font-mono">
                        {assignedAcc.platform}
                      </span>
                      {assignedAcc.handle}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">None</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-2">
                <button
                  id={`btn-launch-task-${device.id}`}
                  disabled={device.status === 'offline'}
                  onClick={() => setTaskModalDevice(device)}
                  className="py-2 px-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(99,102,241,0.25)] active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Task</span>
                </button>

                <button
                  id={`btn-adb-terminal-${device.id}`}
                  onClick={() => setTerminalDevice(device)}
                  className="py-2 px-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-all"
                >
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  <span>ADB</span>
                </button>

                <button
                  id={`btn-reboot-${device.id}`}
                  onClick={() => rebootDevice(device.id)}
                  title="Reboot phone via ADB"
                  className="py-2 px-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-all"
                >
                  <RotateCw className="w-3 h-3 text-amber-400" />
                  <span>Reboot</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Runner Modal */}
      {taskModalDevice && (
        <InstantTaskModal
          device={taskModalDevice}
          onClose={() => setTaskModalDevice(null)}
        />
      )}

      {/* ADB Terminal Modal */}
      {terminalDevice && (
        <AdbTerminalModal
          device={terminalDevice}
          onClose={() => setTerminalDevice(null)}
        />
      )}
    </div>
  );
};
