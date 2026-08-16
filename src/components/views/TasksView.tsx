import React, { useState } from 'react';
import {
  PlaySquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Terminal,
  Filter,
  Search,
  ChevronRight,
  Code2
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { TaskRecord } from '../../types';

export const TasksView: React.FC = () => {
  const { tasks, devices, dispatchInstantTask } = useFarm();
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(tasks[0] || null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'queued' | 'done' | 'failed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Task Queue & Execution Stream</h1>
          <p className="text-xs text-slate-400">
            Real-time Autox.js Android accessibility event logs, Mutex locks, and JSON result polling
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111113] border border-white/5 rounded-xl text-xs">
          {(['all', 'running', 'done', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s} ({s === 'all' ? tasks.length : tasks.filter((t) => t.status === s).length})
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Task List & Real-Time Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Task List (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Execution History ({filteredTasks.length} tasks)
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredTasks.map((t) => {
              const isSelected = selectedTask?.id === t.id;
              const dev = devices.find((d) => d.id === t.deviceId);

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#111113] border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30'
                      : 'bg-[#111113] border-white/5 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        t.status === 'running'
                          ? 'bg-indigo-500/20 text-indigo-400 animate-pulse'
                          : t.status === 'done'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {t.status === 'running' ? (
                        <RotateCw className="w-4 h-4 animate-spin" />
                      ) : t.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-tight">{t.taskType}</span>
                        <span className="text-[10px] font-mono text-slate-500">{t.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Phone: {dev?.laixiId || t.deviceId}</span>
                        <span>•</span>
                        <span>{t.startedAt || t.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full ${
                      t.status === 'running'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : t.status === 'done'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal & Log Inspector (Right 7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111113] border border-white/5 shadow-2xl flex flex-col space-y-4">
          {selectedTask ? (
            <>
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    Autox.js Log Output: {selectedTask.id} ({selectedTask.taskType}.js)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      dispatchInstantTask(selectedTask.taskType, selectedTask.deviceId, selectedTask.accountId, selectedTask.params);
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 font-medium border border-white/10 transition-all active:scale-95"
                  >
                    <RotateCw className="w-3 h-3 text-indigo-400" />
                    <span>Re-Run</span>
                  </button>
                </div>
              </div>

              {/* Task Parameters JSON */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono space-y-1">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Injected Parameters:</div>
                <div className="text-indigo-300">
                  {JSON.stringify(selectedTask.params, null, 2)}
                </div>
              </div>

              {/* Streaming Logs */}
              <div className="p-4 rounded-xl bg-[#0a0a0b] border border-white/5 font-mono text-xs text-slate-300 space-y-2 min-h-[360px] max-h-[460px] overflow-y-auto leading-relaxed">
                <div className="text-slate-500 font-semibold">
                  # Initializing Autox.js Accessibility Runtime...
                </div>
                <div className="text-slate-500">
                  # Loaded _lib.js (Bezier curve swipes, Gaussian jitter taps enabled)
                </div>

                {selectedTask.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">[{index + 1}]</span>
                    <span
                      className={
                        log.includes('failed') || log.includes('error')
                          ? 'text-rose-400'
                          : log.includes('Liked') || log.includes('completed') || log.includes('successfully')
                          ? 'text-emerald-400 font-medium'
                          : log.includes('Pushed') || log.includes('Selected')
                          ? 'text-indigo-300'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))}

                {selectedTask.status === 'running' && (
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse pt-2">
                    <span className="inline-block w-2 h-4 bg-indigo-400"></span>
                    <span>Waiting for next device gesture...</span>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                <span>Result Path: /sdcard/laixi/results/task_{selectedTask.id}.json</span>
                <span>Status: {selectedTask.status.toUpperCase()}</span>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a task from the left queue to view live execution traces.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
