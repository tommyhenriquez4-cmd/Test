import React from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  PlaySquare,
  Users,
  Film,
  TrendingUp,
  Cpu,
  Flame,
  Zap,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { stats, devices, tasks, accounts, dispatchInstantTask } = useFarm();

  const activeRunningTasks = tasks.filter((t) => t.status === 'running');
  const recentFinishedTasks = tasks.filter((t) => t.status === 'done').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-[#111113] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold text-white tracking-tight">Farm Management Center</span>
            <span className="px-2.5 py-0.5 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-medium">
              Autonomous Fleet Mode
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {stats.onlineDevices} of {stats.totalDevices} Android physical devices connected and synchronized via Laixi WebSocket.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn-quick-warmup-all"
            onClick={() => {
              devices.filter((d) => d.status === 'online').forEach((d) => {
                dispatchInstantTask('warmup_session', d.id, d.assignedAccount, { video_count: 8, like_probability: 0.4 });
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all active:scale-95"
          >
            <Flame className="w-4 h-4" />
            <span>Warm Up All Online</span>
          </button>
          <button
            id="btn-view-schedules"
            onClick={() => onNavigate('schedules')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg border border-white/10 transition-all"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>CRON Schedule</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111113] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Connected Devices</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.onlineDevices}</span>
            <span className="text-xs text-slate-500">/ {stats.totalDevices} total</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% ADB handshake healthy</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <PlaySquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.activeTasks}</span>
            <span className="text-xs text-indigo-400 font-medium">running now</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Sequential lock active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Completed Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.completedToday}</span>
            <span className="text-xs text-emerald-400 font-medium">+14% vs yesterday</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Failures: {stats.failedToday} (98.2% success)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Social Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.totalAccounts}</span>
            <span className="text-xs text-purple-400 font-medium">Warm-up / Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>TikTok, Reels & Shorts</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Device Overview & Real-Time Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Fleet Status Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111113] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Device Fleet Matrix</h2>
              <p className="text-xs text-slate-400">Live telemetry and current Autox.js script locks</p>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111113] ${
                        device.status === 'online'
                          ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                          : device.status === 'busy'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    ></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{device.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{device.model}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span>Serial: {device.serial}</span>
                      <span>•</span>
                      <span>IP: {device.ip}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono text-slate-200">{device.battery}% Battery</div>
                    <div className="text-[11px] text-slate-500">{device.temperature}°C</div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${
                      device.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : device.status === 'busy'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {device.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Task Stream */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Live Execution Stream</h2>
                <p className="text-xs text-slate-400">Autox.js device accessibility events</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md font-medium">
                STREAMING
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {activeRunningTasks.length > 0 ? (
                activeRunningTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-indigo-400 font-semibold">{t.taskType}</span>
                      <span className="text-slate-500">{t.deviceId}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] truncate">
                      {t.logs[t.logs.length - 1] || 'Executing script...'}
                    </p>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                        style={{ width: `${Math.min(100, (t.logs.length / 6) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-slate-400 text-xs">
                  No active tasks. Fleet is idle and ready.
                </div>
              )}

              {/* Recent Accomplishments */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
                  Recent Executions
                </div>
                {recentFinishedTasks.map((task) => (
                  <div key={task.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-200">{task.taskType}</span>
                    </div>
                    <span className="text-slate-500">{task.completedAt || 'Done'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tasks')}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-all text-center"
          >
            Open Real-time Terminal & Logs
          </button>
        </div>
      </div>
    </div>
  );
};
