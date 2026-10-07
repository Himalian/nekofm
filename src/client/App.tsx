import React, { useState } from 'react';
import { Radio, KeyRound, Sliders, Music, ShieldCheck } from 'lucide-react';
import StatusPage from './pages/StatusPage';
import TokenPage from './pages/TokenPage';
import RulesPage from './pages/RulesPage';

type TabType = 'status' | 'token' | 'rules';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('status');

  const navItems = [
    { id: 'status' as TabType, label: 'Current Status', icon: Radio },
    { id: 'token' as TabType, label: 'API & Tokens', icon: KeyRound },
    { id: 'rules' as TabType, label: 'Scrobble Rules', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">NekoFM</h1>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-gray-100">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'status' && <StatusPage />}
        {activeTab === 'token' && <TokenPage />}
        {activeTab === 'rules' && <RulesPage />}
      </main>

    </div>
  );
}
