
import React, { useState } from 'react';
import { Issue, IssueStage, ISSUE_CATEGORIES, IssueCategory } from '../types';
import { IssueCard } from '../components/IssueCard';
import { Plus, Filter, ArrowDownUp, Archive, Activity, X, Hexagon } from 'lucide-react';
import { COMMUNITY_INFO } from '../constants';

interface BoardViewProps {
  issues: Issue[];
  currentUserId: string;
  onNavigate: (view: string, id?: string) => void;
  onCreateIssue: (title: string, desc: string, cat: IssueCategory) => void;
  onVote: (id: string, type: 'up' | 'down') => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ issues, currentUserId, onNavigate, onCreateIssue, onVote }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Filter & Sort State
  const [viewMode, setViewMode] = useState<'active' | 'resolved'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<IssueCategory>('Maintenance & Facilities');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateIssue(newTitle, newDesc, newCat);
    setShowModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Filter Logic
  const filteredIssues = issues.filter(issue => {
    // 1. View Mode Filter
    const isClosed = issue.stage === IssueStage.CLOSED;
    if (viewMode === 'active' && isClosed) return false;
    if (viewMode === 'resolved' && !isClosed) return false;

    // 2. Category Filter
    if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;

    return true;
  });

  // Sort Logic
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'votes') {
      const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
      const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
      return scoreB - scoreA;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* 1. Logo Header (Mobile Optimized) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl shadow-lg shadow-amber-200">
            <Hexagon className="w-5 h-5 text-white fill-white/20" />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">HIVE</span>
              <span className="text-3xl font-black text-amber-500 leading-none">.</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Community Platform</p>
          </div>
        </div>
        <div className="bg-white/50 border border-white px-4 py-2 rounded-2xl backdrop-blur-sm self-start sm:self-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Building</p>
          <p className="text-xs font-black text-slate-800 truncate max-w-[140px]">{COMMUNITY_INFO.name}</p>
        </div>
      </div>

      {/* 2. Controls */}
      <section className="sticky top-0 bg-[#F2F4F6]/95 backdrop-blur-sm z-30 py-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-400 px-1 uppercase tracking-wider text-[10px]">
                {viewMode === 'active' ? 'Active Issues' : 'Resolved Archive'} ({sortedIssues.length})
             </h2>
             <div className="flex gap-2">
                 <button 
                    onClick={() => setViewMode('active')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${viewMode === 'active' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 shadow-sm'}`}
                 >
                    <Activity className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => setViewMode('resolved')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${viewMode === 'resolved' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 shadow-sm'}`}
                 >
                    <Archive className="w-4 h-4" />
                 </button>
             </div>
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
             <div className="relative shrink-0">
                <select 
                   value={selectedCategory}
                   onChange={(e) => setSelectedCategory(e.target.value)}
                   className="pl-4 pr-8 py-2.5 bg-white border-none shadow-sm rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                >
                   <option value="All">All Categories</option>
                   {ISSUE_CATEGORIES.map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                   ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative shrink-0">
                <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value as 'votes' | 'newest')}
                   className="pl-4 pr-8 py-2.5 bg-white border-none shadow-sm rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                >
                   <option value="votes">Top Voted</option>
                   <option value="newest">Newest First</option>
                </select>
                <ArrowDownUp className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
        </div>
      </section>

      {/* 3. Feed */}
      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        {sortedIssues.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200/50">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                {viewMode === 'active' ? <Plus className="w-8 h-8 text-slate-300" /> : <Archive className="w-8 h-8 text-slate-300" />}
            </div>
            <h3 className="text-lg font-bold text-slate-700">No {viewMode} issues</h3>
            <p className="text-slate-400 text-sm">Clear sailing for the community!</p>
          </div>
        ) : (
          sortedIssues.map(issue => (
            <IssueCard 
              key={issue.id} 
              issue={issue} 
              currentUserIds={currentUserId}
              onClick={(id) => onNavigate('issue', id)} 
              onVote={onVote}
            />
          ))
        )}
      </div>

      {/* Floating Action Button (Mobile Optimized) */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-[0_8px_30px_rgb(15,23,42,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 lg:hidden"
      >
        <Plus className="w-6 h-6 stroke-[3px]" />
      </button>

      {/* Desktop Raise Button (Hidden on Mobile) */}
      <div className="hidden lg:block fixed bottom-10 right-10 z-40">
        <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold hover:-translate-y-1 transition-transform"
        >
            <Plus className="w-5 h-5" />
            Raise New Issue
        </button>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center z-[60] animate-in fade-in duration-200">
          <div 
            className="bg-[#F2F4F6] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 pb-10">
              <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Raise Issue</h2>
                    <p className="text-slate-500 text-sm">Voice a concern to the community</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="bg-white p-2 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
                      <X className="w-5 h-5 text-slate-500" />
                  </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                  <input 
                    required
                    type="text" 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-none rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-0 focus:shadow-[0_0_0_4px_rgba(251,191,36,0.3)] transition-all"
                    placeholder="e.g. Broken Gym AC"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                        <select 
                        value={newCat}
                        onChange={e => setNewCat(e.target.value as IssueCategory)}
                        className="w-full px-4 py-3 bg-white border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer"
                        >
                        {ISSUE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        </select>
                    </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    required
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={4}
                    className="w-full px-5 py-4 bg-white border-none rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:ring-0 focus:shadow-[0_0_0_4px_rgba(251,191,36,0.3)] transition-all resize-none"
                    placeholder="Describe the problem clearly..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Submit Issue
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
