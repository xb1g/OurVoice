import React, { useState } from 'react';
import { Issue, IssueStage, User, Solution, UserRole } from '../types';
import { StageStepper } from '../components/StageStepper';
import { ExpertBadge } from '../components/ExpertBadge';
import { ImpactCalculator } from '../components/ImpactCalculator';
import { ArrowLeft, Check, ThumbsUp, DollarSign, Send, Lock, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { generateSolutionSuggestion, AiSuggestion } from '../services/aiService';

interface IssueDetailProps {
  issue: Issue;
  currentUser: User;
  onBack: () => void;
  onUpdateIssue: (updated: Issue) => void;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({ issue, currentUser, onBack, onUpdateIssue }) => {
  const [solutionDesc, setSolutionDesc] = useState('');
  const [solutionCost, setSolutionCost] = useState<number | ''>('');
  
  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);

  // STAGE 2: VALIDATE LOGIC
  const handleSupport = () => {
    if (issue.supporters.includes(currentUser.id)) return;
    
    const newSupporters = [...issue.supporters, currentUser.id];
    let newStage = issue.stage;

    // Check Quorum (5)
    if (newSupporters.length >= 5 && issue.stage === IssueStage.VALIDATE) {
      newStage = IssueStage.IDEATE;
    }

    onUpdateIssue({
      ...issue,
      supporters: newSupporters,
      stage: newStage
    });
  };

  // AI HANDLER
  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await generateSolutionSuggestion(issue.title, issue.description);
      setAiSuggestion(result);
      if (!solutionDesc) {
        setSolutionDesc(result.text); // Pre-fill description if empty
      }
    } catch (error) {
      console.error(error);
      alert("Failed to get AI suggestions. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // STAGE 3: IDEATE LOGIC
  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionDesc || !solutionCost) return;

    const newSolution: Solution = {
      id: `s_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorSkills: currentUser.skills, // Include skills in the solution snapshot
      description: solutionDesc,
      estimatedCost: Number(solutionCost),
      votes: []
    };

    onUpdateIssue({
      ...issue,
      solutions: [...issue.solutions, newSolution]
    });

    setSolutionDesc('');
    setSolutionCost('');
    setAiSuggestion(null);
  };

  // ADMIN ACTION: Move to Vote
  const handleMoveToVote = () => {
    onUpdateIssue({ ...issue, stage: IssueStage.VOTE });
  };

  // STAGE 4: VOTE LOGIC
  const handleVote = (solutionId: string) => {
    // Remove previous vote if exists
    const cleanSolutions = issue.solutions.map(s => ({
      ...s,
      votes: s.votes.filter(uid => uid !== currentUser.id)
    }));

    // Add new vote
    const updatedSolutions = cleanSolutions.map(s => {
      if (s.id === solutionId) {
        return { ...s, votes: [...s.votes, currentUser.id] };
      }
      return s;
    });

    onUpdateIssue({
      ...issue,
      solutions: updatedSolutions
    });
  };

  const isSupported = issue.supporters.includes(currentUser.id);
  const totalVotes = issue.solutions.reduce((acc, s) => acc + s.votes.length, 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Board
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {issue.category}
          </span>
          <span className="text-sm text-slate-400">
            Raised by {issue.authorName} on {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{issue.title}</h1>
        <p className="text-lg text-slate-600 leading-relaxed">{issue.description}</p>
        
        <div className="mt-8">
          <StageStepper currentStage={issue.stage} />
        </div>
      </div>

      {/* STAGE 2: VALIDATION SECTION */}
      {issue.stage === IssueStage.VALIDATE && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 ring-1 ring-orange-500/10">
          <div className="text-center py-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Needs Community Validation</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              This issue needs 5 residents to support it before we can move to the solution phase.
            </p>
            
            <div className="flex justify-center mb-6">
               <div className="bg-slate-100 rounded-full h-4 w-64 overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min((issue.supporters.length / 5) * 100, 100)}%` }}
                  ></div>
               </div>
            </div>
            <p className="text-sm font-bold text-orange-600 mb-6">{issue.supporters.length} / 5 Supporters</p>

            <button
              onClick={handleSupport}
              disabled={isSupported}
              className={`
                px-8 py-3 rounded-full font-bold text-lg flex items-center justify-center gap-2 mx-auto transition-all
                ${isSupported 
                  ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'}
              `}
            >
              {isSupported ? (
                <>
                  <Check className="w-5 h-5" /> Supported
                </>
              ) : (
                <>
                  <ThumbsUp className="w-5 h-5" /> Support This Issue
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: IDEATION SECTION */}
      {(issue.stage === IssueStage.IDEATE || issue.stage === IssueStage.VOTE) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Proposed Solutions ({issue.solutions.length})</h3>
            
            {/* Admin control for demo purposes */}
            {currentUser.role === UserRole.ADMIN && issue.stage === IssueStage.IDEATE && (
              <button 
                onClick={handleMoveToVote}
                disabled={issue.solutions.length < 2}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {issue.solutions.length < 2 ? 'Need 2+ Solutions to Vote' : 'Admin: Open Voting'}
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {issue.solutions.map(solution => {
               const votePct = totalVotes > 0 ? Math.round((solution.votes.length / totalVotes) * 100) : 0;
               const userVotedForThis = solution.votes.includes(currentUser.id);

               return (
                <div 
                  key={solution.id} 
                  className={`relative bg-white rounded-xl p-5 border transition-all
                    ${issue.stage === IssueStage.VOTE && userVotedForThis ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800">{solution.authorName}</span>
                      <ExpertBadge skills={solution.authorSkills} />
                    </div>
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-sm">
                      ${solution.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                  
                  <ImpactCalculator cost={solution.estimatedCost} />
                  
                  <p className="text-slate-600 mt-3 mb-4">{solution.description}</p>

                  {issue.stage === IssueStage.VOTE ? (
                     <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-2xl font-bold text-slate-800">{votePct}%</span>
                          <span className="text-sm text-slate-400">{solution.votes.length} votes</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full mb-4">
                           <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${votePct}%` }}></div>
                        </div>
                        <button
                          onClick={() => handleVote(solution.id)}
                          className={`w-full py-2 rounded-lg font-bold transition-colors
                            ${userVotedForThis ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                          `}
                        >
                          {userVotedForThis ? 'Your Choice' : 'Vote'}
                        </button>
                     </div>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Voting locked until ideation phase ends
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* New Solution Form (Only visible in IDEATE) */}
          {issue.stage === IssueStage.IDEATE && (
            <>
              {/* AI Assistance Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 mt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-24 h-24 text-indigo-500" />
                </div>
                
                <div className="relative z-10">
                  <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Need ideas? Ask AI
                  </h4>
                  <p className="text-sm text-indigo-700 mb-4 max-w-xl">
                    Use our AI assistant to research solutions and estimated costs based on real-world data and community standards.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {!isAiLoading && (
                      <button 
                        onClick={handleAiSuggest}
                        className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {aiSuggestion ? 'Regenerate Suggestion' : 'Generate Suggestions'}
                      </button>
                    )}
                    
                    {isAiLoading && (
                      <div className="flex items-center gap-2 text-indigo-600 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Researching solutions...
                      </div>
                    )}
                  </div>

                  {aiSuggestion && (
                    <div className="bg-white/80 rounded-lg p-4 border border-indigo-100 mt-4 shadow-sm">
                      <div className="prose prose-sm prose-indigo max-w-none mb-4 whitespace-pre-wrap text-slate-700">
                          {aiSuggestion.text}
                      </div>
                      
                      {aiSuggestion.sources.length > 0 && (
                        <div className="border-t border-indigo-100 pt-3 mt-3">
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Sources</p>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestion.sources.map((source, idx) => (
                              <a 
                                key={idx}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs bg-white border border-indigo-200 text-indigo-600 px-2 py-1 rounded hover:underline truncate max-w-xs"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {source.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t border-indigo-100 text-xs text-indigo-500">
                        * Cost estimates are approximate. Please verify with local contractors.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Solution Form */}
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 mt-6">
                <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Propose a Solution
                </h4>
                <form onSubmit={handleSubmitSolution} className="space-y-4">
                  <div>
                    <textarea 
                      required
                      value={solutionDesc}
                      onChange={e => setSolutionDesc(e.target.value)}
                      className="w-full p-3 rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe your solution clearly..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <input 
                        required
                        type="number"
                        min="0"
                        value={solutionCost}
                        onChange={e => setSolutionCost(Number(e.target.value))}
                        className="w-full pl-9 p-2.5 rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Est. Cost"
                      />
                    </div>
                    <div className="flex-1">
                      {/* Preview Impact Badge */}
                      {typeof solutionCost === 'number' && solutionCost > 0 && (
                          <ImpactCalculator cost={solutionCost} />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};