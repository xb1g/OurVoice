
import React from 'react';
import { LayoutDashboard, Building2, UserCircle, Hexagon, Shield } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
}

const baseTabs = [
  { id: 'board', label: 'Board', icon: LayoutDashboard },
  { id: 'condo', label: 'Condo', icon: Building2 },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

export const Sidebar: React.FC<NavigationProps> = ({ activeTab, onTabChange, currentUser }) => {
  const tabs = currentUser.role === "ADMIN"
    ? [...baseTabs, { id: 'invites', label: 'Invites', icon: Shield }]
    : baseTabs;

  return (
    <div className="hidden lg:flex flex-col w-72 h-screen bg-white/80 backdrop-blur-xl border-r border-white/20 sticky top-0 shadow-sm z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-xl shadow-lg shadow-amber-200">
          <Hexagon className="w-6 h-6 text-white fill-white/20" />
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-black text-slate-900 tracking-tighter italic">HIVE</span>
          <span className="text-4xl font-black text-amber-500 leading-none">.</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300
                ${isActive 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.name} 
            className="w-10 h-10 rounded-full bg-slate-200 object-cover ring-2 ring-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BottomNav: React.FC<NavigationProps> = ({ activeTab, onTabChange, currentUser }) => {
  const tabs = currentUser.role === "ADMIN"
    ? [...baseTabs, { id: 'invites', label: 'Invites', icon: Shield }]
    : baseTabs;
  return (
    <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-slate-900/90 backdrop-blur-lg rounded-3xl shadow-2xl shadow-slate-300/50 p-1.5 flex justify-between items-center max-w-sm mx-auto border border-white/10">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 relative overflow-hidden
                ${isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              <Icon className={`w-6 h-6 mb-0.5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              {isActive && (
                <span className="text-[10px] font-bold absolute bottom-1 opacity-0 animate-in fade-in slide-in-from-bottom-1 fill-mode-forwards">
                    •
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
