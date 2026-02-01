import React, { useEffect, useState } from 'react';
import { Issue, IssueStage, User } from './types';
import { MOCK_USERS } from './constants';
import * as storage from './services/storageService';
import { PulseMeter } from './components/PulseMeter';
import { Dashboard } from './views/Dashboard';
import { IssueDetail } from './views/IssueDetail';
import { ProfileEditor } from './components/ProfileEditor';
import { Building, LogOut, User as UserIcon, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'issue'>('dashboard');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setIssues(storage.getIssues());
  }, []);

  const handleUserSwitch = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      storage.setCurrentUser(user);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    storage.setCurrentUser(updatedUser);
  };

  const handleCreateIssue = (title: string, desc: string, category: any) => {
    const newIssue: Issue = {
      id: `i_${Date.now()}`,
      title,
      description: desc,
      category,
      stage: IssueStage.VALIDATE, // Starts at Validation
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      supporters: [currentUser.id], // Author automatically supports
      solutions: []
    };
    
    const updated = [newIssue, ...issues];
    setIssues(updated);
    storage.saveIssues(updated);
  };

  const handleUpdateIssue = (updatedIssue: Issue) => {
    const updatedIssues = issues.map(i => i.id === updatedIssue.id ? updatedIssue : i);
    setIssues(updatedIssues);
    storage.saveIssues(updatedIssues);
  };

  const handleNavigate = (view: string, id?: string) => {
    if (view === 'dashboard') {
      setCurrentView('dashboard');
      setSelectedIssueId(null);
    } else if (view === 'issue' && id) {
      setSelectedIssueId(id);
      setCurrentView('issue');
    }
  };

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => handleNavigate('dashboard')}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">OurVoice</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full pl-3 pr-2 py-1">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-300">
                <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
              </div>
              <select 
                value={currentUser.id}
                onChange={(e) => handleUserSwitch(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer max-w-[120px]"
              >
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => setShowProfile(true)}
                className="p-1.5 rounded-full hover:bg-white text-slate-400 hover:text-indigo-600 transition-all"
                title="Edit Profile"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {currentView === 'dashboard' && (
              <Dashboard 
                issues={issues} 
                onNavigate={handleNavigate}
                onCreateIssue={handleCreateIssue}
              />
            )}
            
            {currentView === 'issue' && selectedIssue && (
              <IssueDetail 
                issue={selectedIssue}
                currentUser={currentUser}
                onBack={() => handleNavigate('dashboard')}
                onUpdateIssue={handleUpdateIssue}
              />
            )}
          </div>

          {/* Sidebar (Pulse Meter) */}
          <div className="hidden lg:block lg:col-span-4">
            <PulseMeter />
            
            {/* Quick Context Help */}
            <div className="mt-6 bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> 
                Role: {currentUser.role}
              </h4>
              <p className="opacity-90">
                You are currently viewing as <strong>{currentUser.name}</strong>.
              </p>
              {currentUser.skills && currentUser.skills.length > 0 ? (
                 <div className="mt-2 flex flex-wrap gap-1">
                   {currentUser.skills.map(s => (
                     <span key={s} className="bg-blue-100 text-blue-900 text-xs px-2 py-0.5 rounded border border-blue-200">{s}</span>
                   ))}
                 </div>
              ) : (
                <p className="mt-2 text-xs opacity-70">No skills added yet. Click the settings icon in the navbar to add your expertise.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileEditor 
          user={currentUser}
          onSave={handleUpdateUser}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default App;