import React from 'react';

export interface Device {
  id: string;
  serial: string;
  laixiId: string;
  name: string;
  model: string;
  androidVersion: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  battery: number;
  temperature: number;
  ip: string;
  assignedAccount?: string;
  currentTask?: string;
  lastSeen: string;
  screenLocked: boolean;
}

export interface SocialAccount {
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  username: string;
  handle: string;
  avatarUrl?: string;
  deviceId?: string;
  status: 'active' | 'warming_up' | 'shadowbanned' | 'suspended' | 'idle';
  proxy?: string;
  dailyLimits: {
    likes: { current: number; max: number };
    comments: { current: number; max: number };
    follows: { current: number; max: number };
    posts: { current: number; max: number };
  };
  warmupDay: number;
  totalVideosPosted: number;
}

export interface TaskRecord {
  id: string;
  taskType:
    | 'warmup_session'
    | 'upload_video'
    | 'like_post'
    | 'post_comment'
    | 'reply_comment'
    | 'follow_user'
    | 'unfollow_user'
    | 'scroll_feed'
    | 'watch_video';
  deviceId: string;
  accountId?: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  params: Record<string, any>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
  errorMessage?: string;
  resultData?: Record<string, any>;
}

export interface ScheduleItem {
  id: string;
  name: string;
  cron: string;
  timezone: string;
  taskType: TaskRecord['taskType'];
  targetDeviceIds: string[];
  targetAccountIds: string[];
  params: Record<string, any>;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}

export interface VideoMedia {
  id: string;
  filename: string;
  filesizeMb: number;
  durationSec: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  tags: string[];
  uploadedAt: string;
  usedCount: number;
}

export interface FarmStats {
  totalDevices: number;
  onlineDevices: number;
  activeTasks: number;
  completedToday: number;
  failedToday: number;
  totalAccounts: number;
  totalVideosUploaded: number;
}
