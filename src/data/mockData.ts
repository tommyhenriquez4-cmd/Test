import { Device, SocialAccount, TaskRecord, ScheduleItem, VideoMedia, FarmStats } from '../types';

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev_01',
    serial: 'R58M30AB12X',
    laixiId: 'phone_01',
    name: 'Google Pixel 7 Pro #01',
    model: 'Pixel 7 Pro (GP4BC)',
    androidVersion: 'Android 14',
    status: 'busy',
    battery: 92,
    temperature: 34.2,
    ip: '192.168.1.101',
    assignedAccount: 'acc_01',
    currentTask: 'task_warmup_8821',
    lastSeen: 'Just now',
    screenLocked: false
  },
  {
    id: 'dev_02',
    serial: 'R58M30AB13Y',
    laixiId: 'phone_02',
    name: 'Samsung Galaxy S23 #02',
    model: 'SM-S911B',
    androidVersion: 'Android 13',
    status: 'online',
    battery: 88,
    temperature: 31.8,
    ip: '192.168.1.102',
    assignedAccount: 'acc_02',
    lastSeen: '12s ago',
    screenLocked: false
  },
  {
    id: 'dev_03',
    serial: 'R58M30AB14Z',
    laixiId: 'phone_03',
    name: 'Xiaomi 13T Pro #03',
    model: '23078PND5G',
    androidVersion: 'Android 14',
    status: 'online',
    battery: 98,
    temperature: 30.5,
    ip: '192.168.1.103',
    assignedAccount: 'acc_03',
    lastSeen: '5s ago',
    screenLocked: false
  },
  {
    id: 'dev_04',
    serial: 'R58M30AB15W',
    laixiId: 'phone_04',
    name: 'OnePlus 11 5G #04',
    model: 'CPH2449',
    androidVersion: 'Android 14',
    status: 'busy',
    battery: 76,
    temperature: 36.1,
    ip: '192.168.1.104',
    assignedAccount: 'acc_04',
    currentTask: 'task_upload_9902',
    lastSeen: 'Just now',
    screenLocked: false
  },
  {
    id: 'dev_05',
    serial: 'R58M30AB16V',
    laixiId: 'phone_05',
    name: 'Realme GT Neo 5 #05',
    model: 'RMX3708',
    androidVersion: 'Android 13',
    status: 'online',
    battery: 95,
    temperature: 32.0,
    ip: '192.168.1.105',
    assignedAccount: 'acc_05',
    lastSeen: '18s ago',
    screenLocked: false
  },
  {
    id: 'dev_06',
    serial: 'R58M30AB17U',
    laixiId: 'phone_06',
    name: 'POCO F5 Pro #06',
    model: '23013PC75G',
    androidVersion: 'Android 13',
    status: 'offline',
    battery: 14,
    temperature: 28.4,
    ip: '192.168.1.106',
    lastSeen: '45m ago',
    screenLocked: true
  }
];

export const INITIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: 'acc_01',
    platform: 'tiktok',
    username: 'daily_crypto_alpha',
    handle: '@cryptovibes_live',
    deviceId: 'dev_01',
    status: 'warming_up',
    proxy: 'socks5://usr_nl_49:px99@185.220.101.44:8080',
    warmupDay: 4,
    totalVideosPosted: 8,
    dailyLimits: {
      likes: { current: 48, max: 120 },
      comments: { current: 8, max: 15 },
      follows: { current: 18, max: 35 },
      posts: { current: 1, max: 2 }
    }
  },
  {
    id: 'acc_02',
    platform: 'tiktok',
    username: 'tech_gadgets_review',
    handle: '@techpulse_daily',
    deviceId: 'dev_02',
    status: 'active',
    proxy: 'socks5://usr_de_12:px88@194.38.20.10:8080',
    warmupDay: 14,
    totalVideosPosted: 42,
    dailyLimits: {
      likes: { current: 114, max: 150 },
      comments: { current: 15, max: 20 },
      follows: { current: 38, max: 50 },
      posts: { current: 2, max: 3 }
    }
  },
  {
    id: 'acc_03',
    platform: 'instagram',
    username: 'luxury_vibe_aesthetic',
    handle: '@lux.escapes.reels',
    deviceId: 'dev_03',
    status: 'active',
    proxy: 'socks5://usr_us_81:px77@104.244.75.12:8080',
    warmupDay: 21,
    totalVideosPosted: 67,
    dailyLimits: {
      likes: { current: 95, max: 140 },
      comments: { current: 12, max: 18 },
      follows: { current: 22, max: 40 },
      posts: { current: 2, max: 3 }
    }
  },
  {
    id: 'acc_04',
    platform: 'youtube',
    username: 'science_mindblow_shorts',
    handle: '@science_daily_shorts',
    deviceId: 'dev_04',
    status: 'active',
    proxy: 'socks5://usr_uk_04:px66@185.125.190.5:8080',
    warmupDay: 30,
    totalVideosPosted: 94,
    dailyLimits: {
      likes: { current: 65, max: 100 },
      comments: { current: 9, max: 15 },
      follows: { current: 14, max: 30 },
      posts: { current: 1, max: 4 }
    }
  },
  {
    id: 'acc_05',
    platform: 'tiktok',
    username: 'fitness_motivation_hub',
    handle: '@gympump_shorts',
    deviceId: 'dev_05',
    status: 'warming_up',
    proxy: 'socks5://usr_fr_09:px55@51.15.22.8:8080',
    warmupDay: 2,
    totalVideosPosted: 3,
    dailyLimits: {
      likes: { current: 22, max: 80 },
      comments: { current: 3, max: 10 },
      follows: { current: 9, max: 20 },
      posts: { current: 1, max: 1 }
    }
  }
];

export const INITIAL_VIDEOS: VideoMedia[] = [
  {
    id: 'vid_01',
    filename: 'ai_future_automation_01.mp4',
    filesizeMb: 42.8,
    durationSec: 32,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    caption: 'How AI Agents are taking over 90% of phone automation in 2026! 🤖🚀 #ai #automation #tech #trending #future',
    tags: ['ai', 'tech', 'viral', 'automation'],
    uploadedAt: '2026-08-16 10:15',
    usedCount: 4
  },
  {
    id: 'vid_02',
    filename: 'crypto_breakout_strategy.mp4',
    filesizeMb: 58.4,
    durationSec: 45,
    url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400',
    caption: 'Top 3 indicators every crypto trader must know before the next cycle! 📈💎 #crypto #bitcoin #trading #finance',
    tags: ['crypto', 'trading', 'finance', 'investing'],
    uploadedAt: '2026-08-16 09:30',
    usedCount: 3
  },
  {
    id: 'vid_03',
    filename: 'luxury_penthouse_tour_dubai.mp4',
    filesizeMb: 124.6,
    durationSec: 58,
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    caption: '$25,000,000 Dubai Penthouse with infinity sky pool 🌴✨ #luxury #realestate #dubai #aesthetic #lifestyle',
    tags: ['luxury', 'dubai', 'reels', 'rich'],
    uploadedAt: '2026-08-15 18:40',
    usedCount: 6
  },
  {
    id: 'vid_04',
    filename: 'insane_gym_workout_split.mp4',
    filesizeMb: 76.2,
    durationSec: 28,
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    caption: 'Save this Chest & Triceps routine for explosive upper body growth 💪🔥 #gym #fitness #workout #motivation',
    tags: ['gym', 'fitness', 'workout', 'gains'],
    uploadedAt: '2026-08-15 14:10',
    usedCount: 2
  }
];

export const INITIAL_TASKS: TaskRecord[] = [
  {
    id: 'task_warmup_8821',
    taskType: 'warmup_session',
    deviceId: 'dev_01',
    accountId: 'acc_01',
    status: 'running',
    params: { platform: 'tiktok', video_count: 12, like_probability: 0.45 },
    createdAt: '2026-08-16 12:35:10',
    startedAt: '2026-08-16 12:35:12',
    logs: [
      'Acquired phone_01 mutex lock',
      'Launched TikTok package com.zhiliaoapp.musically',
      'Watched video #1 (28s) - Skipped like',
      'Watched video #2 (34s) - Liked with double tap jitter',
      'Peeked comments section & performed organic scroll',
      'Watching video #3 (In progress...)'
    ]
  },
  {
    id: 'task_upload_9902',
    taskType: 'upload_video',
    deviceId: 'dev_04',
    accountId: 'acc_04',
    status: 'running',
    params: {
      platform: 'youtube',
      caption: 'The physics behind black hole event horizons 🌌 #science #physics #shorts',
      video_id: 'vid_01'
    },
    createdAt: '2026-08-16 12:36:00',
    startedAt: '2026-08-16 12:36:05',
    logs: [
      'Pushed video_ai_future.mp4 via ADB to /sdcard/DCIM/Camera/',
      'Broadcasted media scanner intent am broadcast',
      'Opened YouTube Shorts camera picker',
      'Selected recent video from gallery',
      'Typing title with organic character delay...'
    ]
  },
  {
    id: 'task_done_7741',
    taskType: 'post_comment',
    deviceId: 'dev_02',
    accountId: 'acc_02',
    status: 'done',
    params: {
      platform: 'tiktok',
      comment_text: 'The battery optimization on this model is genuinely game-changing! 🔥'
    },
    createdAt: '2026-08-16 12:15:00',
    startedAt: '2026-08-16 12:15:02',
    completedAt: '2026-08-16 12:16:15',
    logs: [
      'Opened comment sheet',
      'Focused text input with jitter coordinate (422, 1840)',
      'Typed text character-by-character (95ms avg latency)',
      'Sent comment successfully',
      'Task written to /sdcard/laixi/results/task_done_7741.json'
    ],
    resultData: { success: true, latencyMs: 73000 }
  },
  {
    id: 'task_done_7740',
    taskType: 'warmup_session',
    deviceId: 'dev_03',
    accountId: 'acc_03',
    status: 'done',
    params: { platform: 'instagram', video_count: 10, like_probability: 0.4 },
    createdAt: '2026-08-16 11:50:00',
    startedAt: '2026-08-16 11:50:03',
    completedAt: '2026-08-16 12:02:40',
    logs: [
      'Warmup session completed: 10 videos watched, 4 likes given, 2 comments scrolled'
    ],
    resultData: { totalWatched: 10, totalLikes: 4 }
  }
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch_01',
    name: 'Morning Fleet Warmup',
    cron: '0 9 * * *',
    timezone: 'Europe/Moscow',
    taskType: 'warmup_session',
    targetDeviceIds: ['dev_01', 'dev_02', 'dev_03', 'dev_04', 'dev_05'],
    targetAccountIds: ['acc_01', 'acc_02', 'acc_03', 'acc_04', 'acc_05'],
    params: { video_count: 10, like_probability: 0.4 },
    enabled: true,
    lastRun: '2026-08-16 09:00',
    nextRun: '2026-08-17 09:00'
  },
  {
    id: 'sch_02',
    name: 'Prime Time Video Auto-Posting',
    cron: '0 18 * * *',
    timezone: 'Europe/Moscow',
    taskType: 'upload_video',
    targetDeviceIds: ['dev_02', 'dev_03', 'dev_04'],
    targetAccountIds: ['acc_02', 'acc_03', 'acc_04'],
    params: { video_id: 'vid_01' },
    enabled: true,
    lastRun: '2026-08-15 18:00',
    nextRun: '2026-08-16 18:00'
  },
  {
    id: 'sch_03',
    name: 'Hourly Feed Organic Engagement',
    cron: '0 */2 * * *',
    timezone: 'Europe/Moscow',
    taskType: 'scroll_feed',
    targetDeviceIds: ['dev_01', 'dev_05'],
    targetAccountIds: ['acc_01', 'acc_05'],
    params: { scroll_count: 8 },
    enabled: true,
    lastRun: '2026-08-16 12:00',
    nextRun: '2026-08-16 14:00'
  }
];
