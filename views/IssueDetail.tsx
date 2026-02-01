import React, { useState } from 'react';
import { Issue, IssueStage, User, Solution, UserRole, Comment } from '../types';
import { StageStepper } from '../components/StageStepper';
import { ExpertBadge } from '../components/ExpertBadge';
import { ImpactCalculator } from '../components/ImpactCalculator';
import { ArrowLeft, Check, ThumbsUp, DollarSign, Send, Lock, Sparkles, ExternalLink, Loader2, Phone, Globe, ChevronDown, ChevronUp, ClipboardList, PlusCircle, MessageCircle, MoreVertical, Flag, MessageSquare } from 'lucide-react';
import { generateSolutionSuggestion, AiSuggestion, Contractor } from '../services/aiService';
import { COMMUNITY_INFO } from '../constants';
import ReactMarkdown from 'react-markdown';

interface IssueDetailProps {
  issue: Issue;
  currentUser: User;
  onBack: () => void;
  onUpdateIssue: (updated: Issue) => void;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({ issue, currentUser, onBack, onUpdateIssue }) => {
  const [solutionDesc, setSolutionDesc] = useState('');
  const [solutionCost, setSolutionCost] = useState<number | ''>('');
  const [newComment, setNewComment] = useState('');
  
  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

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
    setShowFullAnalysis(false);
    try {
      const result = await generateSolutionSuggestion(issue.title, issue.description, COMMUNITY_INFO);
      setAiSuggestion(result);
    } catch (error) {
      console.error(error);
      alert("Failed to get AI suggestions. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUseContractor = (contractor: Contractor) => {
    const desc = `I propose we hire **${contractor.name}**.\n\n**Specialty:** ${contractor.specialty}\n**Note:** ${contractor.note}\n\n**Contact:**\nPhone: ${contractor.phone}\nWebsite: ${contractor.website}\n\n(I have called to verify availability)`;
    setSolutionDesc(desc);
    const formElement = document.getElementById('solution-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    const costInput = document.getElementById('cost-input');
    if (costInput) costInput.focus();
  };

  // STAGE 3: IDEATE LOGIC
  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionDesc || !solutionCost) return;

    const newSolution: Solution = {
      id: `s_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorSkills: currentUser.skills,
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

  const handleMoveToVote = () => {
    onUpdateIssue({ ...issue, stage: IssueStage.VOTE });
  };

  const handleVote = (solutionId: string) => {
    const cleanSolutions = issue.solutions.map(s => ({
      ...s,
      votes: s.votes.filter(uid => uid !== currentUser.id)
    }));

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

  const handlePostComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      const comment: Comment = {
          id: `c_${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorSkills: currentUser.skills,
          text: newComment,
          createdAt: new Date().toISOString()
      };

      onUpdateIssue({
          ...issue,
          comments: [...(issue.comments || []), comment]
      });
      setNewComment('');
  };

  const isSupported = issue.supporters.includes(currentUser.id);
  const totalVotes = issue.solutions.reduce((acc, s) => acc + s.votes.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-1">
        <button 
          onClick={onBack}
          className="bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors border border-white/50 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex gap-2">
            <button className="bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors border border-white/50 shadow-sm">
                <Flag className="w-5 h-5 text-slate-400" />
            </button>
            <button className="bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors border border-white/50 shadow-sm">
                <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-white relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
             <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wider border border-indigo-100">
               {issue.category}
             </span>
             <span className="text-[10px] font-bold text-slate-400">
                Opened {new Date(issue.createdAt).toLocaleDateString()}
             </span>
          </div>

          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {issue.title}
          </h1>
          
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500">{issue.authorName.charAt(0)}</span>
             </div>
             <p className="text-sm font-bold text-slate-400">Raised by <span className="text-slate-900">{issue.authorName}</span></p>
          </div>

          <div className="pt-4 border-t border-slate-50">
             <p className="text-lg text-slate-600 leading-relaxed font-medium">
               {issue.description}
             </p>
          </div>
          
          <div className="pt-8">
            <StageStepper currentStage={issue.stage} />
          </div>
        </div>
      </div>

      {/* STAGE 2: VALIDATION SECTION */}
      {issue.stage === IssueStage.VALIDATE && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-[2.5rem] p-10 border border-orange-100/50 text-center animate-in zoom-in-95 duration-500">
            <h3 className="text-2xl font-black text-orange-950 mb-3 tracking-tight">Gathering Support</h3>
            <p className="text-orange-900/60 font-bold text-sm max-w-sm mx-auto mb-8">
              Community validation prevents spam. We need a quorum of 5 supporters to start finding solutions.
            </p>
            
            <div className="max-w-xs mx-auto mb-8">
               <div className="bg-orange-200/50 rounded-full h-3 overflow-hidden shadow-inner border border-orange-200/50">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min((issue.supporters.length / 5) * 100, 100)}%` }}
                  ></div>
               </div>
               <div className="flex justify-between mt-3 px-1">
                  <span className="text-xs font-black text-orange-700 uppercase tracking-widest">{issue.supporters.length} Supporters</span>
                  <span className="text-xs font-black text-orange-900/30 uppercase tracking-widest">Goal: 5</span>
               </div>
            </div>

            <button
              onClick={handleSupport}
              disabled={isSupported}
              className={`
                px-10 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 mx-auto transition-all shadow-xl
                ${isSupported 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-slate-900 text-white shadow-slate-300 hover:scale-105 active:scale-95'}
              `}
            >
              {isSupported ? (
                <>
                  <Check className="w-6 h-6 stroke-[3px]" /> Supported!
                </>
              ) : (
                <>
                  <ThumbsUp className="w-6 h-6" /> Count Me In
                </>
              )}
            </button>
        </div>
      )}

      {/* STAGE 3/4: IDEATION & VOTING SECTION */}
      {(issue.stage === IssueStage.IDEATE || issue.stage === IssueStage.VOTE) && (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {issue.stage === IssueStage.VOTE ? 'Live Poll' : 'Proposed Plans'}
                </h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                    {issue.solutions.length} community proposals
                </p>
            </div>
            
            {currentUser.role === UserRole.ADMIN && issue.stage === IssueStage.IDEATE && (
              <button 
                onClick={handleMoveToVote}
                disabled={issue.solutions.length < 2}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-200 hover:scale-105 disabled:opacity-50 transition-all"
              >
                {issue.solutions.length < 2 ? 'Need more plans' : 'Open Voting'}
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {issue.solutions.map(solution => {
               const votePct = totalVotes > 0 ? Math.round((solution.votes.length / totalVotes) * 100) : 0;
               const userVotedForThis = solution.votes.includes(currentUser.id);

               return (
                <div 
                  key={solution.id} 
                  className={`relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border transition-all duration-300
                    ${issue.stage === IssueStage.VOTE && userVotedForThis ? 'border-indigo-400 ring-4 ring-indigo-500/5' : 'border-white'}
                  `}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <p className="text-sm font-black text-slate-900">{solution.authorName}</p>
                      <ExpertBadge skills={solution.authorSkills} />
                    </div>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="font-black text-slate-800 tracking-tight">
                        ${solution.estimatedCost.toLocaleString()}
                        </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                    {solution.description}
                  </p>
                  
                  <ImpactCalculator cost={solution.estimatedCost} />

                  {issue.stage === IssueStage.VOTE ? (
                     <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-3xl font-black text-slate-900">{votePct}%</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{solution.votes.length} votes</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                           <div className="bg-indigo-600 h-full transition-all duration-1000 ease-out" style={{ width: `${votePct}%` }}></div>
                        </div>
                        <button
                          onClick={() => handleVote(solution.id)}
                          className={`w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs transition-all
                            ${userVotedForThis 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                          `}
                        >
                          {userVotedForThis ? 'Selected' : 'Vote for this plan'}
                        </button>
                     </div>
                  ) : (
                    <div className="mt-8 pt-6 border-t border-slate-50 text-[10px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Voting opens after ideation
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* New Solution Form (Only visible in IDEATE) */}
          {issue.stage === IssueStage.IDEATE && (
            <div className="space-y-6 pt-4">
              {/* AI Assistance Section - Redesigned */}
              <div className="bg-gradient-to-br from-[#E6E6F5] to-[#D1D1EB] rounded-[2.5rem] p-8 shadow-sm border border-white/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <Sparkles className="w-32 h-32 text-indigo-900" />
                </div>
                
                <div className="relative z-10">
                  <h4 className="font-black text-indigo-950 text-xl mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-800" />
                    Resident Intelligence
                  </h4>
                  <p className="text-indigo-900/60 font-bold text-sm mb-6 max-w-lg">
                    I'll search local vendors in <strong>{COMMUNITY_INFO.city}</strong> and create a blueprint for this project.
                  </p>
                  
                  {!isAiLoading ? (
                    <button 
                      onClick={handleAiSuggest}
                      className="bg-indigo-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 uppercase tracking-widest"
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiSuggestion ? 'Refresh AI Analysis' : 'Run AI Analysis'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 text-indigo-900 font-black text-sm uppercase tracking-widest">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating Blueprint...
                    </div>
                  )}

                  {aiSuggestion && (
                    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/50 inline-flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-indigo-900" />
                        <span className="font-black text-indigo-950">Est. Budget: {aiSuggestion.estimatedBudget}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {aiSuggestion.contractors.map((contractor, idx) => (
                          <div key={idx} className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/80 shadow-sm hover:shadow-md transition-all">
                            <h5 className="font-black text-slate-800 text-lg mb-1">{contractor.name}</h5>
                            <p className="text-[10px] text-indigo-600 font-black mb-3 uppercase tracking-widest">{contractor.specialty}</p>
                            
                            <div className="space-y-2 mb-6">
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="font-mono">{contractor.phone || 'N/A'}</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleUseContractor(contractor)}
                              className="w-full bg-indigo-900 text-white hover:bg-indigo-950 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Use as Base
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Collapsible Analysis */}
                      <div className="bg-white/80 rounded-[2rem] overflow-hidden border border-white shadow-sm">
                        <button 
                          onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                          className="w-full flex items-center justify-between p-5 text-xs font-black text-indigo-950 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                             <ClipboardList className="w-5 h-5" />
                             Project Analysis & Action Plan
                          </div>
                          {showFullAnalysis ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        
                        {showFullAnalysis && (
                          <div className="p-8 bg-white border-t border-slate-50">
                            <div className="prose prose-sm prose-indigo max-w-none text-slate-600 font-medium">
                                <ReactMarkdown>{aiSuggestion.analysis}</ReactMarkdown>
                            </div>
                            
                            {aiSuggestion.sources.length > 0 && (
                              <div className="border-t border-slate-50 pt-6 mt-8">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Grounding Data</p>
                                <div className="flex flex-wrap gap-2">
                                  {aiSuggestion.sources.map((source, idx) => (
                                    <a 
                                      key={idx}
                                      href={source.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-[10px] bg-slate-50 border border-slate-100 text-slate-500 px-3 py-2 rounded-xl font-black hover:bg-white hover:text-indigo-600 transition-all uppercase tracking-tighter"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      {source.title.slice(0, 30)}...
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Solution Form - Modern Styled */}
              <div id="solution-form" className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white scroll-mt-24">
                <h4 className="font-black text-slate-900 text-xl mb-6 flex items-center gap-3">
                  <div className="bg-slate-900 text-white p-2 rounded-xl">
                    <Send className="w-5 h-5" />
                  </div>
                  Draft your proposal
                </h4>
                <form onSubmit={handleSubmitSolution} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Plan Description</label>
                    <textarea 
                      required
                      value={solutionDesc}
                      onChange={e => setSolutionDesc(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-3xl p-6 font-medium text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                      placeholder="How should we fix this? Outline the steps..."
                      rows={6}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estimated Cost ($)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <input 
                                id="cost-input"
                                required
                                type="number"
                                min="0"
                                value={solutionCost}
                                onChange={e => setSolutionCost(Number(e.target.value))}
                                className="w-full pl-11 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                placeholder="Total Quote"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      {typeof solutionCost === 'number' && solutionCost > 0 && (
                          <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl border border-emerald-100 flex items-center justify-center">
                             <ImpactCalculator cost={solutionCost} />
                          </div>
                      )}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest"
                  >
                    Post Proposal
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DISCUSSION SECTION - Redesigned */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white mt-8">
          <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Community Chat
                </h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                    {issue.comments?.length || 0} messages
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
          </div>

          <div className="space-y-8">
              {issue.comments && issue.comments.map(comment => {
                  const isExpert = comment.authorSkills?.some(s => 
                      ['Resident Architect', 'Resident Accountant', 'Property Manager'].includes(s)
                  );
                  
                  return (
                  <div key={comment.id} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${isExpert ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-100' : 'bg-slate-100 text-slate-500'}`}>
                          {comment.authorName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-sm text-slate-900">{comment.authorName}</span>
                                {isExpert && <ExpertBadge skills={comment.authorSkills} />}
                              </div>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter whitespace-nowrap">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className={`p-5 rounded-3xl rounded-tl-none font-medium text-sm leading-relaxed ${isExpert ? 'bg-amber-50/50 text-amber-950 border border-amber-100/50' : 'bg-slate-50 text-slate-600'}`}>
                              {comment.text}
                          </div>
                      </div>
                  </div>
                  );
              })}

              <form onSubmit={handlePostComment} className="flex gap-4 pt-8 border-t border-slate-50 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                      <span className="text-xs font-black text-white">{currentUser.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 relative">
                      <input 
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Say something helpful..."
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm pr-14"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-2 rounded-xl hover:bg-indigo-600 disabled:opacity-20 disabled:grayscale transition-all"
                      >
                          <Send className="w-5 h-5" />
                      </button>
                  </div>
              </form>
          </div>
      </div>
    </div>
  );
};