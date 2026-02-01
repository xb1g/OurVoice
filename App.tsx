import React, { useEffect, useState } from 'react';
import { Issue, IssueStage, User } from './types';
import { MOCK_USERS } from './constants';
import * as storage from './services/storageService';
import { BoardView } from './views/Dashboard';
import { IssueDetail } from './views/IssueDetail';
import { CondoView } from './views/CondoView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';
import { Sidebar, BottomNav } from './components/Navigation';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [issues, setIssues] = useState<Issue[]>([]);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('board');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

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
      stage: IssueStage.VALIDATE,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      supporters: [currentUser.id],
      upvotes: [currentUser.id], // Auto upvote own issue
      downvotes: [],
      solutions: [],
      comments: [],
      views: 0
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

  const handleVote = (issueId: string, type: 'up' | 'down') => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    let newUpvotes = [...(issue.upvotes || [])];
    let newDownvotes = [...(issue.downvotes || [])];

    // Remove existing vote if any
    newUpvotes = newUpvotes.filter(id => id !== currentUser.id);
    newDownvotes = newDownvotes.filter(id => id !== currentUser.id);

    // Add new vote if distinct from previous state (toggle off logic)
    const wasUpvoted = issue.upvotes?.includes(currentUser.id);
    const wasDownvoted = issue.downvotes?.includes(currentUser.id);

    if (type === 'up' && !wasUpvoted) {
        newUpvotes.push(currentUser.id);
    } else if (type === 'down' && !wasDownvoted) {
        newDownvotes.push(currentUser.id);
    }

    handleUpdateIssue({
        ...issue,
        upvotes: newUpvotes,
        downvotes: newDownvotes
    });
  };

  const handleNavigate = (view: string, id?: string) => {
    if (view === 'issue' && id) {
      setSelectedIssueId(id);
      setActiveTab('issue'); // Virtual tab for detail view
    } else {
      setActiveTab(view);
      setSelectedIssueId(null);
    }
  };

  const renderContent = () => {
    if (activeTab === 'issue' && selectedIssueId) {
       const selectedIssue = issues.find(i => i.id === selectedIssueId);
       if (selectedIssue) {
           return (
             <IssueDetail 
               issue={selectedIssue}
               currentUser={currentUser}
               onBack={() => setActiveTab('board')}
               onUpdateIssue={handleUpdateIssue}
             />
           );
       }
    }

    switch (activeTab) {
      case 'board':
        return (
          <BoardView 
            issues={issues} 
            currentUserId={currentUser.id}
            onNavigate={handleNavigate}
            onCreateIssue={handleCreateIssue}
            onVote={handleVote}
          />
        );
      case 'history':
        return (
          <HistoryView 
            issues={issues}
            currentUserId={currentUser.id}
            onNavigate={handleNavigate}
          />
        );
      case 'condo':
        return <CondoView />;
      case 'profile':
        return (
          <ProfileView 
             user={currentUser} 
             onUpdateUser={handleUpdateUser}
             onSwitchUser={handleUserSwitch}
          />
        );
      default:
        return <BoardView issues={issues} currentUserId={currentUser.id} onNavigate={handleNavigate} onCreateIssue={handleCreateIssue} onVote={handleVote} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab === 'issue' ? 'board' : activeTab} onTabChange={setActiveTab} currentUser={currentUser} />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
           {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav activeTab={activeTab === 'issue' ? 'board' : activeTab} onTabChange={setActiveTab} currentUser={currentUser} />
    </div>
  );
};

export default App;