import React, { createContext, useContext, useState, useEffect } from 'react';
import { Device, SocialAccount, TaskRecord, ScheduleItem, VideoMedia, FarmStats } from '../types';
import {
  INITIAL_DEVICES,
  INITIAL_ACCOUNTS,
  INITIAL_VIDEOS,
  INITIAL_TASKS,
  INITIAL_SCHEDULES
} from '../data/mockData';

interface FarmContextType {
  devices: Device[];
  accounts: SocialAccount[];
  videos: VideoMedia[];
  tasks: TaskRecord[];
  schedules: ScheduleItem[];
  stats: FarmStats;
  agentConnected: boolean;
  agentHeartbeatSec: number;
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  
  // Actions
  dispatchInstantTask: (taskType: TaskRecord['taskType'], deviceId: string, accountId?: string, params?: Record<string, any>) => void;
  rebootDevice: (deviceId: string) => void;
  toggleScreenLock: (deviceId: string) => void;
  addAccount: (account: Partial<SocialAccount>) => void;
  uploadVideo: (file: { name: string; sizeMb: number; caption: string; tags: string[] }) => void;
  addSchedule: (schedule: Omit<ScheduleItem, 'id' | 'lastRun' | 'nextRun'>) => void;
  toggleSchedule: (scheduleId: string) => void;
  deleteSchedule: (scheduleId: string) => void;
  triggerAutoDiscovery: () => void;
  executeAdbCommand: (deviceId: string, command: string) => Promise<string>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_ACCOUNTS);
  const [videos, setVideos] = useState<VideoMedia[]>(INITIAL_VIDEOS);
  const [tasks, setTasks] = useState<TaskRecord[]>(INITIAL_TASKS);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULES);
  const [agentConnected, setAgentConnected] = useState(true);
  const [agentHeartbeatSec, setAgentHeartbeatSec] = useState(14);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Periodic heartbeat decrement
  useEffect(() => {
    const timer = setInterval(() => {
      setAgentHeartbeatSec((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Task Simulator for realistic log progression
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (t.status === 'running') {
            const stepCount = t.logs.length;
            if (stepCount >= 7) {
              // Mark as done
              // Also free device
              setDevices((prevDevs) =>
                prevDevs.map((d) => (d.id === t.deviceId ? { ...d, status: 'online', currentTask: undefined } : d))
              );
              return {
                ...t,
                status: 'done',
                completedAt: new Date().toLocaleTimeString(),
                logs: [...t.logs, 'Autox.js script finished successfully. Result saved to /sdcard/laixi/results.']
              };
            } else {
              const simulatedSteps: Record<string, string[]> = {
                warmup_session: [
                  'Evaluating feed algorithms & hashtags',
                  'Bezier thumb scroll to next video (Dwell: 31s)',
                  'Micro-interaction: double-tap liked post',
                  'Browsing top comments with organic delays',
                  'Swiping forward...'
                ],
                upload_video: [
                  'Selecting gallery media item #0',
                  'Entering hashtags and viral hook into title field',
                  'Applying audio sound level parameters',
                  'Tapping Publish button...',
                  'Video post submitted to network'
                ],
                like_post: ['Navigating feed', 'Executing double tap jitter gesture', 'Post liked'],
                post_comment: ['Typing characters with organic micro-pauses', 'Submitting comment', 'Comment verified'],
                scroll_feed: ['Humanized bezier swipe down', 'Dwell pause (4.2s)', 'Next swipe gesture']
              };
              const nextLog = (simulatedSteps[t.taskType] || ['Processing step on device...'])[stepCount % 5];
              return {
                ...t,
                logs: [...t.logs, nextLog]
              };
            }
          }
          return t;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const stats: FarmStats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter((d) => d.status === 'online' || d.status === 'busy').length,
    activeTasks: tasks.filter((t) => t.status === 'running' || t.status === 'queued').length,
    completedToday: tasks.filter((t) => t.status === 'done').length + 84,
    failedToday: tasks.filter((t) => t.status === 'failed').length + 2,
    totalAccounts: accounts.length,
    totalVideosUploaded: videos.length
  };

  const dispatchInstantTask = (
    taskType: TaskRecord['taskType'],
    deviceId: string,
    accountId?: string,
    params: Record<string, any> = {}
  ) => {
    const targetDev = devices.find((d) => d.id === deviceId);
    if (!targetDev || targetDev.status === 'offline') {
      alert('Cannot launch task on offline device!');
      return;
    }

    const newTask: TaskRecord = {
      id: `task_${Date.now().toString().slice(-6)}_${taskType.slice(0, 4)}`,
      taskType,
      deviceId,
      accountId: accountId || targetDev.assignedAccount,
      status: 'running',
      params: { ...params, platform: params.platform || 'tiktok' },
      createdAt: new Date().toLocaleTimeString(),
      startedAt: new Date().toLocaleTimeString(),
      logs: [
        `Acquired mutex lock for device ${targetDev.laixiId}`,
        `Rendered Autox.js template '${taskType}.js'`,
        `Pushed script payload to Laixi WebSocket`
      ]
    };

    setTasks((prev) => [newTask, ...prev]);
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'busy', currentTask: newTask.id } : d))
    );
  };

  const rebootDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'offline', lastSeen: 'Rebooting...' } : d))
    );
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: 'online', lastSeen: 'Just now' } : d))
      );
    }, 4000);
  };

  const toggleScreenLock = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, screenLocked: !d.screenLocked } : d))
    );
  };

  const addAccount = (acc: Partial<SocialAccount>) => {
    const newAcc: SocialAccount = {
      id: `acc_${Date.now().toString().slice(-6)}`,
      platform: acc.platform || 'tiktok',
      username: acc.username || 'new_account',
      handle: acc.handle || `@${acc.username || 'new_account'}`,
      deviceId: acc.deviceId,
      status: 'warming_up',
      proxy: acc.proxy || 'socks5://usr_eu:pass@185.10.10.1:8080',
      warmupDay: 1,
      totalVideosPosted: 0,
      dailyLimits: {
        likes: { current: 0, max: 100 },
        comments: { current: 0, max: 15 },
        follows: { current: 0, max: 30 },
        posts: { current: 0, max: 2 }
      }
    };
    setAccounts((prev) => [...prev, newAcc]);
    if (acc.deviceId) {
      setDevices((prev) =>
        prev.map((d) => (d.id === acc.deviceId ? { ...d, assignedAccount: newAcc.id } : d))
      );
    }
  };

  const uploadVideo = (file: { name: string; sizeMb: number; caption: string; tags: string[] }) => {
    const newVid: VideoMedia = {
      id: `vid_${Date.now().toString().slice(-6)}`,
      filename: file.name,
      filesizeMb: file.sizeMb,
      durationSec: Math.floor(Math.random() * 35) + 20,
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      caption: file.caption || 'Trending high-retention video #fyp #viral #trending',
      tags: file.tags.length > 0 ? file.tags : ['viral', 'trending', 'farm'],
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      usedCount: 0
    };
    setVideos((prev) => [newVid, ...prev]);
  };

  const addSchedule = (sched: Omit<ScheduleItem, 'id' | 'lastRun' | 'nextRun'>) => {
    const newSched: ScheduleItem = {
      ...sched,
      id: `sch_${Date.now().toString().slice(-6)}`,
      lastRun: undefined,
      nextRun: 'Tomorrow at 09:00'
    };
    setSchedules((prev) => [...prev, newSched]);
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const triggerAutoDiscovery = () => {
    const newDevice: Device = {
      id: `dev_${Date.now().toString().slice(-4)}`,
      serial: `R58M30AB${Math.floor(Math.random() * 89 + 10)}K`,
      laixiId: `phone_${devices.length + 1}`,
      name: `Xiaomi Redmi Note 13 #${devices.length + 1}`,
      model: 'Redmi Note 13 5G',
      androidVersion: 'Android 14',
      status: 'online',
      battery: 100,
      temperature: 29.5,
      ip: `192.168.1.${110 + devices.length}`,
      lastSeen: 'Just now',
      screenLocked: false
    };
    setDevices((prev) => [...prev, newDevice]);
  };

  const executeAdbCommand = async (deviceId: string, command: string): Promise<string> => {
    await new Promise((r) => setTimeout(r, 600));
    const target = devices.find((d) => d.id === deviceId) || devices[0];
    if (command.includes('devices')) {
      return `List of devices attached\n${target.serial}\tdevice\n`;
    }
    if (command.includes('battery')) {
      return `Current Battery Service state:\n  AC powered: true\n  USB powered: true\n  level: ${target.battery}\n  scale: 100\n  temperature: ${Math.round(target.temperature * 10)}\n  technology: Li-poly`;
    }
    if (command.includes('pm list')) {
      return `package:com.zhiliaoapp.musically\npackage:com.instagram.android\npackage:com.google.android.youtube\npackage:org.autojs.autoxjs.v6\npackage:com.android.chrome`;
    }
    return `[ADB Executed on ${target.serial}]: Command '${command}' returned exit code 0.`;
  };

  return (
    <FarmContext.Provider
      value={{
        devices,
        accounts,
        videos,
        tasks,
        schedules,
        stats,
        agentConnected,
        agentHeartbeatSec,
        selectedDevice,
        setSelectedDevice,
        dispatchInstantTask,
        rebootDevice,
        toggleScreenLock,
        addAccount,
        uploadVideo,
        addSchedule,
        toggleSchedule,
        deleteSchedule,
        triggerAutoDiscovery,
        executeAdbCommand
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
};
