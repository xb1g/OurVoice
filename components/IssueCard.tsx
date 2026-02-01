import React from 'react';
import { Issue, IssueStage } from '../types';
import { ArrowRight, MessageSquare, ThumbsUp, Users, ArrowBigUp, ArrowBigDown, Eye, Activity } from 'lucide-react';
import { TOTAL_UNITS } from '../constants';

interface IssueCardProps {
  issue: Issue;
  currentUserIds: string; // To check voting status
  onClick: (id: string) => void;
  onVote: (id: string, type: 'up' | 'down') => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, currentUserIds, onClick, onVote }) => {
  const score = (issue.upvotes?.length || 0) - (issue.downvotes?.length || 0);
  const userUpvoted = issue.upvotes?.includes(currentUserIds);
  const userDownvoted = issue.downvotes?.includes(currentUserIds);

  const totalVotes = (issue.upvotes?.length || 0) + (issue.downvotes?.length || 0);
  const participationPct = Math.round((totalVotes / TOTAL_UNITS) * 100);

  const getStageColor = (stage: IssueStage) => {
    switch (stage) {
      case IssueStage.VALIDATE: return 'bg-orange-50 text-orange-700 border border-orange-100';
      case IssueStage.IDEATE: return 'bg-blue-50 text-blue-700 border border-blue-100';
      case IssueStage.VOTE: return 'bg-purple-50 text-purple-700 border border-purple-100';
      case IssueStage.CLOSED: return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const handleVoteClick = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    onVote(issue.id, type);
  };

  return (
    <div 
      onClick={() => onClick(issue.id)}
      className="bg-white rounded-[2rem] p-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-indigo-100 hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 cursor-pointer group"
    >
      <div className="flex">
        {/* Vote Control - Minimalist */}
        <div className="flex flex-col items-center justify-center p-3 gap-2 min-w-[4rem]">
          <button 
            onClick={(e) => handleVoteClick(e, 'up')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${userUpvoted ? 'bg-orange-100 text-orange-600 shadow-sm' : 'hover:bg-slate-50 text-slate-400'}`}
          >
            <ArrowBigUp className={`w-6 h-6 ${userUpvoted ? 'fill-current' : ''}`} />
          </button>
          
          <span className={`text-sm font-bold font-mono ${
              userUpvoted ? 'text-orange-600' : 
              userDownvoted ? 'text-indigo-600' : 'text-slate-900'
          }`}>
              {score}
          </span>
          
          <button 
            onClick={(e) => handleVoteClick(e, 'down')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${userDownvoted ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'hover:bg-slate-50 text-slate-400'}`}
          >
            <ArrowBigDown className={`w-6 h-6 ${userDownvoted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 pr-5 flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 items-center mb-3">
             <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStageColor(issue.stage)}`}>
              {issue.stage}
            </span>
             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
               {issue.category}
             </span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
            {issue.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-5 leading-relaxed">
            {issue.description}
          </p>

          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
               <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                  <Eye className="w-3.5 h-3.5" />
                  {issue.views || 0}
               </div>
               <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {issue.comments?.length || 0}
               </div>
            </div>

            {/* Stage Action Indicator */}
            {issue.stage === IssueStage.VALIDATE && (
                <div className="flex items-center gap-2 text-orange-600 text-xs font-bold bg-orange-50 pl-2 pr-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                    {issue.supporters.length}/5 Support
                </div>
            )}
            {issue.stage === IssueStage.IDEATE && (
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold bg-blue-50 pl-2 pr-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    {issue.solutions.length} Solutions
                </div>
            )}
            {issue.stage === IssueStage.VOTE && (
                <div className="flex items-center gap-2 text-purple-600 text-xs font-bold bg-purple-50 pl-2 pr-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                    Voting Open
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};