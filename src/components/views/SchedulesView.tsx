import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Clock,
  Globe,
  Play,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { ScheduleItem } from '../../types';

export const SchedulesView: React.FC = () => {
  const { schedules, devices, accounts, addSchedule, toggleSchedule, deleteSchedule } = useFarm();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState('');
  const [cronExpr, setCronExpr] = useState('0 18 * * *');
  const [timezone, setTimezone] = useState('Europe/Moscow');
  const [taskType, setTaskType] = useState<ScheduleItem['taskType']>('upload_video');
  const [selectedDevices, setSelectedDevices] = useState<string[]>(devices.map((d) => d.id));

  const PRESETS = [
    { label: 'Every Hour', cron: '0 * * * *', desc: 'Runs at minute 0 of every hour' },
    { label: 'Daily at 09:00 MSK (Morning Warmup)', cron: '0 9 * * *', desc: 'Every morning at 09:00' },
    { label: 'Daily at 18:00 MSK (Prime Post)', cron: '0 18 * * *', desc: 'Evening peak viewer traffic' },
    { label: 'Twice Daily (12:00 & 20:00)', cron: '0 12,20 * * *', desc: 'Lunch and evening peak hours' },
    { label: 'Every 30 Minutes', cron: '*/30 * * * *', desc: 'Continuous high-frequency rotation' }
  ];

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addSchedule({
      name,
      cron: cronExpr,
      timezone,
      taskType,
      targetDeviceIds: selectedDevices,
      targetAccountIds: accounts.map((a) => a.id),
      params: { platform: 'tiktok' },
      enabled: true
    });

    setShowCreateModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Timezone-Aware CRON Scheduler</h1>
          <p className="text-xs text-slate-400">
            Celery Beat periodic task engine with accurate timezone conversion (Europe/Moscow, UTC)
          </p>
        </div>
        <button
          id="btn-create-schedule"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Active Schedules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schedules.map((sched) => (
          <div
            key={sched.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              sched.enabled
                ? 'bg-[#111113] border-white/5 hover:border-indigo-500/30'
                : 'bg-[#111113]/40 border-white/5 opacity-50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">{sched.name}</h2>
                  <span className="text-xs text-indigo-400 font-mono font-medium block mt-0.5">
                    {sched.taskType}
                  </span>
                </div>

                <button
                  onClick={() => toggleSchedule(sched.id)}
                  title={sched.enabled ? 'Disable schedule' : 'Enable schedule'}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {sched.enabled ? (
                    <ToggleRight className="w-6 h-6 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-500" />
                  )}
                </button>
              </div>

              {/* CRON Syntax Badge */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">CRON Expression:</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px]">
                    {sched.cron}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" /> Timezone:
                  </span>
                  <span className="text-slate-200 font-medium">{sched.timezone}</span>
                </div>
              </div>

              {/* Target devices summary */}
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Target Devices:</span>
                <span className="text-slate-200 font-medium font-mono">
                  {sched.targetDeviceIds.length} phones
                </span>
              </div>
            </div>

            {/* Bottom info & Delete */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="text-slate-400 text-[11px]">
                <span>Next Run: </span>
                <span className="text-indigo-400 font-mono">{sched.nextRun}</span>
              </div>
              <button
                onClick={() => deleteSchedule(sched.id)}
                className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111113] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-base font-bold text-white">Create Automation Schedule</h2>
            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Schedule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Prime Time Upload"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Preset Quick Clicker */}
              <div>
                <label className="text-slate-400 block mb-1">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCronExpr(p.cron)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        cronExpr === p.cron
                          ? 'bg-indigo-500/10 border-indigo-500 text-white'
                          : 'bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/10'
                      }`}
                    >
                      <div className="font-semibold text-[11px]">{p.label}</div>
                      <div className="text-[10px] font-mono text-indigo-400">{p.cron}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">CRON Expression</label>
                  <input
                    type="text"
                    required
                    value={cronExpr}
                    onChange={(e) => setCronExpr(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Europe/Moscow" className="bg-[#111113]">Europe/Moscow (UTC+3)</option>
                    <option value="UTC" className="bg-[#111113]">UTC (Universal Time)</option>
                    <option value="America/New_York" className="bg-[#111113]">America/New_York (EST)</option>
                    <option value="Asia/Dubai" className="bg-[#111113]">Asia/Dubai (GST)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Task Action</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="warmup_session" className="bg-[#111113]">warmup_session (Feed Warmup & Retention)</option>
                  <option value="upload_video" className="bg-[#111113]">upload_video (Auto-Posting Video)</option>
                  <option value="scroll_feed" className="bg-[#111113]">scroll_feed (Humanized Feed Scroll)</option>
                  <option value="like_post" className="bg-[#111113]">like_post (Double Tap Engagement)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-[0_0_10px_rgba(99,102,241,0.25)]"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
