import React, { useState } from 'react';
import {
  Users,
  Plus,
  Flame,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Globe,
  TrendingUp,
  Heart,
  MessageSquare,
  UserPlus,
  Video
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { SocialAccount } from '../../types';

export const AccountsView: React.FC = () => {
  const { accounts, devices, addAccount } = useFarm();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAcc, setNewAcc] = useState<Partial<SocialAccount>>({
    platform: 'tiktok',
    username: '',
    handle: '',
    proxy: 'socks5://usr_eu:pass@185.10.10.1:8080',
    deviceId: devices[0]?.id || ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.username) return;
    addAccount({
      ...newAcc,
      handle: newAcc.handle || `@${newAcc.username}`
    });
    setShowAddModal(false);
    setNewAcc({
      platform: 'tiktok',
      username: '',
      handle: '',
      proxy: 'socks5://usr_eu:pass@185.10.10.1:8080',
      deviceId: devices[0]?.id || ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Social Accounts Studio</h1>
          <p className="text-xs text-slate-400">
            Account warm-up stages, proxy binding, and daily action rate limiting
          </p>
        </div>
        <button
          id="btn-add-account"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {accounts.map((acc) => {
          const assignedDevice = devices.find((d) => d.id === acc.deviceId);

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-[#111113] border border-white/5 hover:border-indigo-500/30 transition-all space-y-4"
            >
              {/* Top Details */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 uppercase text-sm">
                    {acc.platform === 'tiktok' ? 'TT' : acc.platform === 'instagram' ? 'IG' : 'YT'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">{acc.username}</h2>
                      <span className="text-xs text-slate-400 font-mono">{acc.handle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize text-indigo-400 font-medium">{acc.platform}</span>
                      <span>•</span>
                      <span>Warmup: Day {acc.warmupDay} of 14</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                    acc.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {acc.status.replace('_', ' ')}
                </span>
              </div>

              {/* Daily Limit Meters */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Daily Limit Quota (Anti-Ban Safeties)
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">Resets at 00:00 MSK</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Likes */}
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" /> Likes
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-200">
                      {acc.dailyLimits.likes.current} / {acc.dailyLimits.likes.max}
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{
                          width: `${(acc.dailyLimits.likes.current / acc.dailyLimits.likes.max) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-indigo-400" /> Comments
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-200">
                      {acc.dailyLimits.comments.current} / {acc.dailyLimits.comments.max}
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{
                          width: `${(acc.dailyLimits.comments.current / acc.dailyLimits.comments.max) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Follows */}
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <UserPlus className="w-3 h-3 text-purple-400" /> Follows
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-200">
                      {acc.dailyLimits.follows.current} / {acc.dailyLimits.follows.max}
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{
                          width: `${(acc.dailyLimits.follows.current / acc.dailyLimits.follows.max) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Posts */}
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3 text-emerald-400" /> Posts
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-200">
                      {acc.dailyLimits.posts.current} / {acc.dailyLimits.posts.max}
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${(acc.dailyLimits.posts.current / acc.dailyLimits.posts.max) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device & Proxy Binding */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Bound Phone</span>
                    <span className="text-slate-200 font-medium truncate">
                      {assignedDevice ? `${assignedDevice.name} (${assignedDevice.laixiId})` : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Dedicated Proxy</span>
                    <span className="text-slate-200 font-mono text-[11px] truncate block">
                      {acc.proxy || 'Direct IP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Register Social Media Account</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Platform</label>
                <select
                  value={newAcc.platform}
                  onChange={(e) => setNewAcc({ ...newAcc, platform: e.target.value as any })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="tiktok" className="bg-[#111113]">TikTok</option>
                  <option value="instagram" className="bg-[#111113]">Instagram Reels</option>
                  <option value="youtube" className="bg-[#111113]">YouTube Shorts</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. viral_shorts_channel"
                  value={newAcc.username}
                  onChange={(e) => setNewAcc({ ...newAcc, username: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Handle</label>
                <input
                  type="text"
                  placeholder="@handle"
                  value={newAcc.handle}
                  onChange={(e) => setNewAcc({ ...newAcc, handle: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Phone</label>
                <select
                  value={newAcc.deviceId}
                  onChange={(e) => setNewAcc({ ...newAcc, deviceId: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#111113]">
                      {d.name} ({d.laixiId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Resident Proxy (SOCKS5 / HTTP)</label>
                <input
                  type="text"
                  value={newAcc.proxy}
                  onChange={(e) => setNewAcc({ ...newAcc, proxy: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-[0_0_10px_rgba(99,102,241,0.25)]"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
