import React, { useState } from 'react';
import { Issue, IssueStage, Vendor } from '../types';
import { IssueCard } from '../components/IssueCard';
import { MOCK_VENDORS } from '../constants';
import { Archive, Contact, Phone, Star, Globe, CheckCircle2, TrendingUp, ThumbsUp } from 'lucide-react';

interface HistoryViewProps {
  issues: Issue[];
  currentUserId: string;
  onNavigate: (view: string, id?: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ issues, currentUserId, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'resolved' | 'directory'>('resolved');
  
  const closedIssues = issues.filter(i => i.stage === IssueStage.CLOSED);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4">
      <div className="px-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Community History</h1>
        <p className="text-slate-400 font-medium mt-1">Past wins and verified experts</p>
      </div>

      {/* Internal Tabs - Glassmorphic style */}
      <div className="inline-flex p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl shadow-inner ml-1">
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'resolved' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Resolved
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'directory' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Directory
        </button>
      </div>

      {activeTab === 'resolved' && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-left-4">
          {closedIssues.length === 0 ? (
             <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/50">
                <Archive className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">The archive is empty</h3>
                <p className="text-slate-400 text-sm">Every story has a beginning...</p>
             </div>
          ) : (
             closedIssues.map(issue => (
                <div key={issue.id} className="relative group">
                    <IssueCard 
                        issue={issue}
                        currentUserIds={currentUserId}
                        onClick={(id) => onNavigate('issue', id)}
                        onVote={() => {}} // Disabled for closed
                    />
                    {/* Floating Rating Overlay for Archive */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-black tracking-tight">{issue.rating || "4.5"}</span>
                            <span className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">Rating</span>
                        </div>
                    </div>
                </div>
             ))
          )}
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
            {MOCK_VENDORS.map(vendor => (
                <div key={vendor.id} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-indigo-100 hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)] transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full mb-3 inline-block border border-indigo-100">
                                {vendor.category}
                            </span>
                            <h3 className="font-bold text-slate-800 text-xl leading-tight">{vendor.name}</h3>
                        </div>
                        <div className="bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1 shadow-sm">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="text-sm font-black text-amber-700">{vendor.rating}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                         <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl">
                             <Phone className="w-4 h-4 text-slate-400" />
                             <span className="font-mono font-bold">{vendor.phone}</span>
                         </div>
                         {vendor.website && (
                            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline truncate">
                                    {vendor.website.replace('https://', '')}
                                </a>
                            </div>
                         )}
                    </div>
                    
                    {vendor.recommendedBy && (
                        <div className="mt-6 pt-5 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Trusted by {vendor.recommendedBy}
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}
    </div>
  );
};