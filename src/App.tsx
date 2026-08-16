import React, { useState } from 'react';
import { FarmProvider } from './context/FarmContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { DevicesView } from './components/views/DevicesView';
import { AccountsView } from './components/views/AccountsView';
import { MediaView } from './components/views/MediaView';
import { TasksView } from './components/views/TasksView';
import { SchedulesView } from './components/views/SchedulesView';
import { CodeHubView } from './components/views/CodeHubView';
import { AiGeneratorView } from './components/views/AiGeneratorView';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <FarmProvider>
      <div className="min-h-screen bg-[#0a0a0b] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Top Header Navbar */}
        <Navbar />

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content Workspace */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0b]">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
              {activeTab === 'devices' && <DevicesView />}
              {activeTab === 'accounts' && <AccountsView />}
              {activeTab === 'media' && <MediaView />}
              {activeTab === 'tasks' && <TasksView />}
              {activeTab === 'schedules' && <SchedulesView />}
              {activeTab === 'codehub' && <CodeHubView />}
              {activeTab === 'ai' && <AiGeneratorView />}
            </div>
          </main>
        </div>
      </div>
    </FarmProvider>
  );
}
