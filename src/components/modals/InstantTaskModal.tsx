import React, { useState } from 'react';
import { Play, X, Zap, Sliders, Smartphone } from 'lucide-react';
import { Device, TaskRecord } from '../../types';
import { useFarm } from '../../context/FarmContext';

interface InstantTaskModalProps {
  device: Device;
  onClose: () => void;
}

export const InstantTaskModal: React.FC<InstantTaskModalProps> = ({ device, onClose }) => {
  const { dispatchInstantTask, videos } = useFarm();
  const [taskType, setTaskType] = useState<TaskRecord['taskType']>('warmup_session');
  const [platform, setPlatform] = useState('tiktok');
  const [videoCount, setVideoCount] = useState(10);
  const [likeProb, setLikeProb] = useState(0.4);
  const [commentText, setCommentText] = useState('Incredible video! 🔥 Keep creating.');
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, any> = { platform };

    if (taskType === 'warmup_session') {
      params.video_count = Number(videoCount);
      params.like_probability = Number(likeProb);
    } else if (taskType === 'post_comment' || taskType === 'reply_comment') {
      params.comment_text = commentText;
    } else if (taskType === 'upload_video') {
      const vid = videos.find((v) => v.id === selectedVideoId) || videos[0];
      params.video_url = vid?.url || '';
      params.caption = vid?.caption || '';
      params.video_filename = vid?.filename || 'video.mp4';
    } else if (taskType === 'scroll_feed') {
      params.scroll_count = Number(videoCount);
    }

    dispatchInstantTask(taskType, device.id, device.assignedAccount, params);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Execute Task on {device.name}</h2>
              <p className="text-[11px] text-slate-400 font-mono">Device: {device.laixiId} ({device.serial})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Select Script Task</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="warmup_session" className="bg-[#111113]">warmup_session (Feed Warm-up & Watch Time)</option>
              <option value="upload_video" className="bg-[#111113]">upload_video (Auto-Posting Video Pipeline)</option>
              <option value="post_comment" className="bg-[#111113]">post_comment (Humanized Comment Input)</option>
              <option value="like_post" className="bg-[#111113]">like_post (Double Tap Center Tap)</option>
              <option value="scroll_feed" className="bg-[#111113]">scroll_feed (Bezier Swipe Feed Scroll)</option>
              <option value="watch_video" className="bg-[#111113]">watch_video (Dedicated Retention Watch)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Target Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="tiktok" className="bg-[#111113]">TikTok</option>
              <option value="instagram" className="bg-[#111113]">Instagram Reels</option>
              <option value="youtube" className="bg-[#111113]">YouTube Shorts</option>
            </select>
          </div>

          {taskType === 'warmup_session' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Videos to Watch</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={videoCount}
                  onChange={(e) => setVideoCount(Number(e.target.value))}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Like Probability</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  value={likeProb}
                  onChange={(e) => setLikeProb(Number(e.target.value))}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {taskType === 'post_comment' && (
            <div>
              <label className="text-slate-400 block mb-1">Comment Text</label>
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {taskType === 'upload_video' && (
            <div>
              <label className="text-slate-400 block mb-1">Select Media File from Gallery</label>
              <select
                value={selectedVideoId}
                onChange={(e) => setSelectedVideoId(e.target.value)}
                className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {videos.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#111113]">
                    {v.filename} ({v.filesizeMb} MB)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
            Enforces strict per-device Mutex lock. If the phone is currently busy, the task is safely queued.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch on Device</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
