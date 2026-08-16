import React, { useState, useRef } from 'react';
import {
  Film,
  UploadCloud,
  Play,
  Share2,
  Tag,
  CheckCircle,
  FileVideo,
  Sparkles,
  Smartphone,
  Layers,
  Trash2
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { VideoMedia } from '../../types';

export const MediaView: React.FC = () => {
  const { videos, devices, uploadVideo, dispatchInstantTask } = useFarm();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('viral, trending, fyp');
  const [selectedVideo, setSelectedVideo] = useState<VideoMedia | null>(null);
  const [targetDevice, setTargetDevice] = useState<string>(devices[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSimulatedUpload = (file: File) => {
    setUploadProgress(10);
    const sizeMb = Math.round((file.size / (1024 * 1024)) * 10) / 10 || 45.2;

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 10;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            uploadVideo({
              name: file.name,
              sizeMb,
              caption: caption || 'Autonomous viral video post #fyp #trending #automation',
              tags: tagsInput.split(',').map((t) => t.trim())
            });
            setUploadProgress(null);
            setCaption('');
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSimulatedUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDispatchVideo = (video: VideoMedia) => {
    if (!targetDevice) return;
    dispatchInstantTask('upload_video', targetDevice, undefined, {
      video_url: video.url,
      caption: video.caption,
      video_filename: video.filename,
      platform: 'tiktok'
    });
    alert(`Video '${video.filename}' queued for ADB push & auto-posting on device!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Media & Video Center</h1>
          <p className="text-xs text-slate-400">
            Nginx 500MB Video Ingestion, automatic ADB gallery staging, and multi-device auto-distribution
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-mono">
          <span>Max Size: 500MB (MP4/MOV)</span>
        </div>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-4 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-white/10 bg-[#111113] hover:border-indigo-500/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="video/mp4,video/quicktime,video/mkv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleSimulatedUpload(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white">Drag & drop your high-resolution video file</h2>
          <p className="text-xs text-slate-400">Supports .mp4, .mov (up to 500MB payload via async streaming)</p>
        </div>

        <div className="w-full max-w-md grid grid-cols-1 gap-2 text-xs">
          <input
            type="text"
            placeholder="Viral caption & hashtags..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Tags: ai, tech, viral, finance"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {uploadProgress !== null ? (
          <div className="w-full max-w-xs space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Streaming to Nginx buffer...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <button
            id="btn-select-video-file"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all active:scale-95 flex items-center gap-2"
          >
            <FileVideo className="w-4 h-4" />
            <span>Select Video File</span>
          </button>
        )}
      </div>

      {/* Video Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-400" />
            <span>Stored Media Repository ({videos.length} videos)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="rounded-2xl bg-[#111113] border border-white/5 overflow-hidden flex flex-col justify-between hover:border-indigo-500/30 transition-all"
            >
              {/* Thumbnail header */}
              <div className="relative aspect-[9/12] bg-[#0a0a0b] overflow-hidden group">
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent"></div>

                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
                  {vid.durationSec}s • {vid.filesizeMb} MB
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1">
                  <p className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                    {vid.caption}
                  </p>
                </div>
              </div>

              {/* Tags and dispatch controls */}
              <div className="p-4 space-y-3 bg-[#111113]">
                <div className="flex flex-wrap gap-1">
                  {vid.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 bg-white/5 text-slate-300 text-[10px] rounded font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                  <select
                    value={targetDevice}
                    onChange={(e) => setTargetDevice(e.target.value)}
                    className="w-1/2 p-2 bg-white/5 border border-white/10 rounded-lg text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#111113]">
                        {d.name.split('#')[1] ? `#${d.name.split('#')[1]}` : d.name} ({d.laixiId})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDispatchVideo(vid)}
                    className="w-1/2 py-2 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(99,102,241,0.25)] transition-all active:scale-95"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Auto-Post</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
