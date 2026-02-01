import React from 'react';
import { Issue, IssueStage } from '../types';
import { ArrowRight, MessageSquare, ThumbsUp, Users } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: (id: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  const getStageColor = (stage: IssueStage) => {
    switch (stage) {
      case IssueStage.VALIDATE: return 'bg-orange-100 text-orange-700';
      case IssueStage.IDEATE: return 'bg-blue-100 text-blue-700';
      case IssueStage.VOTE: return 'bg-purple-100 text-purple-700';
      case IssueStage.CLOSED: return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div 
      onClick={() => onClick(issue.id)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${getStageColor(issue.stage)}`}>
          {issue.stage}
        </span>
        <span className="text-xs text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
        {issue.title}
      </h3>
      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
        {issue.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex gap-4">
            {issue.stage === IssueStage.VALIDATE && (
                 <div className="flex items-center gap-1 text-slate-500 text-sm">
                 <ThumbsUp className="w-4 h-4" />
                 <span>{issue.supporters.length} / 5 Support</span>
               </div>
            )}
            {issue.stage === IssueStage.IDEATE && (
                 <div className="flex items-center gap-1 text-slate-500 text-sm">
                 <MessageSquare className="w-4 h-4" />
                 <span>{issue.solutions.length} Solutions</span>
               </div>
            )}
            {issue.stage === IssueStage.VOTE && (
                 <div className="flex items-center gap-1 text-slate-500 text-sm">
                 <Users className="w-4 h-4" />
                 <span>Vote Open</span>
               </div>
            )}
        </div>
        
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
            <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};