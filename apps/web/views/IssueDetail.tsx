import React, { useState } from 'react';
import { Issue, IssueStage, User, Solution, UserRole, Comment, AiContractor } from '../types';
import { StageStepper } from '../components/StageStepper';
import { ExpertBadge } from '../components/ExpertBadge';
import { ImpactCalculator } from '../components/ImpactCalculator';
import { ArrowLeft, Check, ThumbsUp, DollarSign, Send, Lock, Sparkles, ExternalLink, Loader2, Phone, ChevronDown, ChevronUp, ClipboardList, PlusCircle, MessageSquare, MoreVertical, Flag, FastForward, Trash2, Clock, Database, Hammer, Construction, CheckCircle2, Star, Trophy, ArrowRight } from 'lucide-react';
import { generateSolutionSuggestion } from '../services/aiService';
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
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [selectedContractors, setSelectedContractors] = useState<AiContractor[]>([]);

  // DEMO: Instant 100 Votes & Move to Ongoing
  const handleInstantVoteAndLaunch = (solutionId: string) => {
    const dummyVotes = Array.from({ length: 100 }, (_, i) => `demo_voter_${Date.now()}_${i}`);
    const updatedSolutions = issue.solutions.map(s => s.id === solutionId ? { ...s, votes: [...s.votes, ...dummyVotes] } : s);
    onUpdateIssue({ ...issue, solutions: updatedSolutions, stage: IssueStage.ONGOING });
  };

  const handleSupport = () => {
    if (issue.supporters.includes(currentUser.id)) return;
    const newSupporters = [...issue.supporters, currentUser.id];
    let newStage = issue.stage;
    if (newSupporters.length >= 5 && issue.stage === IssueStage.VALIDATE) newStage = IssueStage.IDEATE;
    onUpdateIssue({ ...issue, supporters: newSupporters, stage: newStage });
  };

  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    try {
      const nextIssue = await generateSolutionSuggestion(issue.id, COMMUNITY_INFO);
      onUpdateIssue(nextIssue);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

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
    onUpdateIssue({ ...issue, solutions: [...issue.solutions, newSolution] });
    setSolutionDesc('');
    setSolutionCost('');
  };

  const handleVote = (solutionId: string) => {
    const clean = issue.solutions.map(s => ({ ...s, votes: s.votes.filter(u => u !== currentUser.id) }));
    const updated = clean.map(s => s.id === solutionId ? { ...s, votes: [...s.votes, currentUser.id] } : s);
    onUpdateIssue({ ...issue, solutions: updated });
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
    onUpdateIssue({ ...issue, comments: [...(issue.comments || []), comment] });
    setNewComment('');
  };

  const isSupported = issue.supporters.includes(currentUser.id);
  const totalVotes = issue.solutions.reduce((acc, s) => acc + s.votes.length, 0);

  // Determine winning solution for Ongoing/Closed
  const winningSolution = [...issue.solutions].sort((a, b) => b.votes.length - a.votes.length)[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors border border-white/50 shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex gap-2">
            {issue.stage === IssueStage.CLOSED && (
                <div className="bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-100 border border-emerald-400">
                    <Star className="w-4 h-4 fill-white" />
                    <span className="text-xs font-black uppercase tracking-widest">{issue.rating || 4.9} Community Rating</span>
                </div>
            )}
            <button className="bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors border border-white/50 shadow-sm"><Flag className="w-5 h-5 text-slate-400" /></button>
            <button className="bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors border border-white/50 shadow-sm"><MoreVertical className="w-5 h-5 text-slate-400" /></button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className={`rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border relative overflow-hidden transition-all duration-700 ${issue.stage === IssueStage.CLOSED ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-white'}`}>
        <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-20 -mt-20 opacity-30 ${issue.stage === IssueStage.CLOSED ? 'bg-emerald-500' : 'bg-indigo-50'}`}></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
             <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${issue.stage === IssueStage.CLOSED ? 'bg-white/10 text-emerald-400 border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
               {issue.category}
             </span>
             <span className={`text-[10px] font-bold ${issue.stage === IssueStage.CLOSED ? 'text-white/40' : 'text-slate-400'}`}>
                Resolved {issue.stage === IssueStage.CLOSED ? 'Successfully' : 'Ongoing'}
             </span>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">{issue.title}</h1>
          <div className="flex items-center gap-3">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${issue.stage === IssueStage.CLOSED ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>{issue.authorName.charAt(0)}</div>
             <p className={`text-sm font-bold ${issue.stage === IssueStage.CLOSED ? 'text-white/60' : 'text-slate-400'}`}>Raised by <span className={issue.stage === IssueStage.CLOSED ? 'text-white' : 'text-slate-900'}>{issue.authorName}</span></p>
          </div>
          <div className={`pt-4 border-t ${issue.stage === IssueStage.CLOSED ? 'border-white/10' : 'border-slate-50'}`}>
            <p className={`text-lg font-medium leading-relaxed ${issue.stage === IssueStage.CLOSED ? 'text-white/80' : 'text-slate-600'}`}>{issue.description}</p>
          </div>
          <div className="pt-8">
            <StageStepper currentStage={issue.stage} />
          </div>
        </div>
      </div>

      {/* STAGE: CLOSED (SUCCESS VIEW) */}
      {issue.stage === IssueStage.CLOSED && winningSolution && (
        <div className="space-y-8 animate-in zoom-in-95 duration-700">
           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Trophy className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Mission Accomplished</h2>
                        <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest opacity-80">Community Solution Implemented</p>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem]">
                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Total Cost</p>
                        <p className="text-2xl font-black">${winningSolution.estimatedCost.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-white/40 mt-1">Authorized Budget Met</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem]">
                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Satisfaction</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-2xl font-black">{issue.rating || 4.9}</span>
                            <div className="flex text-amber-300"><Star className="w-4 h-4 fill-current" /></div>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 mt-1">Based on 124 residents</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem]">
                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Efficiency</p>
                        <p className="text-2xl font-black">94%</p>
                        <p className="text-[10px] font-bold text-white/40 mt-1">AI-Optimized Sourcing</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Check className="w-5 h-5 stroke-[4px]" /></div>
                  Winning Community Plan
              </h3>
              <div className="prose prose-sm prose-indigo max-w-none text-slate-600 font-medium bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                  <ReactMarkdown>{winningSolution.description}</ReactMarkdown>
              </div>
              <div className="mt-6 flex items-center justify-between p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md">{winningSolution.authorName.charAt(0)}</div>
                      <div>
                          <p className="text-sm font-black text-slate-800">{winningSolution.authorName}</p>
                          <ExpertBadge skills={winningSolution.authorSkills} />
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mandate</p>
                      <p className="font-black text-slate-700">{winningSolution.votes.length} Votes</p>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* STAGE: VALIDATE */}
      {issue.stage === IssueStage.VALIDATE && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-[2.5rem] p-10 border border-orange-100/50 text-center animate-in zoom-in-95 duration-500">
            <h3 className="text-2xl font-black text-orange-950 mb-3">Gathering Support</h3>
            <p className="text-orange-900/60 font-bold text-sm max-w-sm mx-auto mb-8">Needs 5 supporters to start finding solutions.</p>
            <div className="max-w-xs mx-auto mb-8">
               <div className="bg-orange-200/50 rounded-full h-3 overflow-hidden border border-orange-200/50">
                  <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${Math.min((issue.supporters.length / 5) * 100, 100)}%` }}></div>
               </div>
               <div className="flex justify-between mt-3 px-1">
                  <span className="text-xs font-black text-orange-700 uppercase tracking-widest">{issue.supporters.length} Supporters</span>
                  <span className="text-xs font-black text-orange-900/30 uppercase tracking-widest">Goal: 5</span>
               </div>
            </div>
            <button onClick={handleSupport} disabled={isSupported} className={`px-10 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 mx-auto transition-all shadow-xl ${isSupported ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
              {isSupported ? <><Check className="w-6 h-6 stroke-[3px]" /> Supported!</> : <><ThumbsUp className="w-6 h-6" /> Count Me In</>}
            </button>
        </div>
      )}

      {/* STAGE: ONGOING */}
      {issue.stage === IssueStage.ONGOING && winningSolution && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Construction className="w-32 h-32" /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-500 p-3 rounded-2xl"><Hammer className="w-6 h-6" /></div>
                        <div>
                            <h2 className="text-2xl font-black">Implementation Phase</h2>
                            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Project successfully launched</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Winning Proposal</p>
                                <p className="font-bold text-lg text-white/90">${winningSolution.estimatedCost.toLocaleString()} Authorized</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Community Mandate</p>
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-black text-indigo-400">{winningSolution.votes.length}</div>
                                    <p className="text-xs font-bold text-white/60 leading-tight">Residents voted for <br/>this solution.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Project Status</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-3 h-3 text-white stroke-[4px]" /></div><span className="text-sm font-bold text-white/90">Vendor Retained</span></div>
                                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-3 h-3 text-white stroke-[4px]" /></div><span className="text-sm font-bold text-white/90">Materials Ordered</span></div>
                                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full border-2 border-indigo-500/50 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /></div><span className="text-sm font-bold text-white/90">Work Commenced</span></div>
                            </div>
                        </div>
                    </div>
                    {currentUser.role === UserRole.ADMIN && (
                      <button 
                        onClick={() => onUpdateIssue({ ...issue, stage: IssueStage.CLOSED, rating: 4.9 })}
                        className="mt-10 w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Demo: Close & Success Rating (4.9★)
                      </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* STAGE: IDEATE & VOTE */}
      {(issue.stage === IssueStage.IDEATE || issue.stage === IssueStage.VOTE) && (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{issue.stage === IssueStage.VOTE ? 'Live Poll' : 'Proposed Plans'}</h3>
            {currentUser.role === UserRole.ADMIN && issue.stage === IssueStage.IDEATE && (
              <button onClick={() => onUpdateIssue({ ...issue, stage: IssueStage.VOTE })} disabled={issue.solutions.length < 2} className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-200 hover:scale-105 disabled:opacity-50 transition-all">Open Voting</button>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {issue.solutions.map(solution => {
               const votePct = totalVotes > 0 ? Math.round((solution.votes.length / totalVotes) * 100) : 0;
               const userVoted = solution.votes.includes(currentUser.id);
               return (
                <div key={solution.id} className={`relative bg-white rounded-[2rem] p-6 shadow-sm border transition-all ${issue.stage === IssueStage.VOTE && userVoted ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-white'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2"><p className="text-sm font-black text-slate-900">{solution.authorName}</p><ExpertBadge skills={solution.authorSkills} /></div>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-black text-slate-800 tracking-tight">${solution.estimatedCost.toLocaleString()}</div>
                  </div>
                  <div className="prose prose-sm prose-slate max-w-none text-slate-600 mb-6 font-medium"><ReactMarkdown>{solution.description}</ReactMarkdown></div>
                  <ImpactCalculator cost={solution.estimatedCost} />
                  {issue.stage === IssueStage.VOTE ? (
                     <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                        <div className="flex justify-between items-end"><span className="text-3xl font-black text-slate-900">{votePct}%</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{solution.votes.length} votes</span></div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${votePct}%` }}></div></div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => handleVote(solution.id)} className={`flex-1 py-4 rounded-2xl font-black tracking-widest uppercase text-xs transition-all ${userVoted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-50' : 'bg-slate-100 text-slate-600'}`}>{userVoted ? 'Selected' : 'Vote'}</button>
                            <button onClick={() => handleInstantVoteAndLaunch(solution.id)} className="bg-indigo-100 text-indigo-700 p-4 rounded-2xl hover:bg-indigo-200 transition-colors shadow-sm" title="Demo: Heavy Quorum (100 Votes)"><FastForward className="w-5 h-5" /></button>
                        </div>
                     </div>
                  ) : <div className="mt-8 pt-6 border-t border-slate-50 text-[10px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-2"><Lock className="w-4 h-4" /> Voting opens after ideation</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESIDENT INTELLIGENCE - PERSISTENT BUILDING KNOWLEDGE */}
      {(issue.stage === IssueStage.IDEATE || issue.stage === IssueStage.VOTE || issue.stage === IssueStage.ONGOING || issue.stage === IssueStage.CLOSED) && (
        <div className="space-y-6 pt-4">
          <div className={`rounded-[2.5rem] p-8 shadow-sm border border-white/50 relative overflow-hidden group transition-colors duration-500 ${issue.stage === IssueStage.CLOSED ? 'bg-slate-800/50' : 'bg-gradient-to-br from-[#E6E6F5] to-[#D1D1EB]'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700"><Sparkles className="w-32 h-32 text-indigo-900" /></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-black text-xl flex items-center gap-2 ${issue.stage === IssueStage.CLOSED ? 'text-white' : 'text-indigo-950'}`}>
                  <Sparkles className="w-6 h-6 text-indigo-800" />
                  {issue.stage === IssueStage.CLOSED ? 'Historical Project Blueprint' : 'Resident Intelligence'}
                </h4>
                {issue.aiLastSearched && (
                    <div className="bg-white/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/50">
                        <Database className="w-3 h-3 text-indigo-800" />
                        <span className="text-[8px] font-black uppercase text-indigo-900 tracking-wider">Building Memory Active</span>
                    </div>
                )}
              </div>
              <p className={`font-bold text-sm mb-6 max-w-lg ${issue.stage === IssueStage.CLOSED ? 'text-white/40' : 'text-indigo-900/60'}`}>
                {issue.stage === IssueStage.CLOSED ? 'The research and sourcing data that informed this successful outcome.' : `Using community knowledge and vendor availability in ${COMMUNITY_INFO.city}.`}
              </p>
              
              {!issue.aiAnalysis && issue.stage === IssueStage.IDEATE && (
                <button onClick={handleAiSuggest} className="bg-indigo-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  Run AI Intelligence
                </button>
              )}

              {isAiLoading && <div className="flex items-center gap-3 text-indigo-900 font-black text-sm uppercase tracking-widest"><Loader2 className="w-6 h-6 animate-spin" /> Querying...</div>}

              {issue.aiAnalysis && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/50 flex items-center gap-2"><DollarSign className="w-5 h-5 text-indigo-900" /><span className="font-black text-indigo-950">{issue.aiBudget}</span></div>
                    {issue.stage === IssueStage.IDEATE && selectedContractors.length > 0 && (
                        <button onClick={() => {
                            const intro = `### Proposed Community Solution\n\n`;
                            const sections = selectedContractors.map(c => `#### ${c.name} (${c.specialty})\n- ${c.note}`).join('\n\n');
                            setSolutionDesc(intro + sections);
                            document.getElementById('solution-form')?.scrollIntoView({ behavior: 'smooth' });
                        }} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                            <PlusCircle className="w-4 h-4" /> Build Draft ({selectedContractors.length})
                        </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {issue.aiContractors?.map((contractor, idx) => {
                        const isSelected = selectedContractors.some(c => c.name === contractor.name);
                        return (
                            <div key={idx} 
                                 onClick={() => issue.stage === IssueStage.IDEATE && setSelectedContractors(prev => prev.some(c => c.name === contractor.name) ? prev.filter(c => c.name !== contractor.name) : [...prev, contractor])}
                                 className={`rounded-[1.5rem] p-5 border transition-all relative overflow-hidden ${issue.stage === IssueStage.IDEATE ? 'cursor-pointer' : ''} ${isSelected ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20' : 'bg-white/60 border-white hover:bg-white/80 shadow-sm'}`}>
                              {isSelected && <div className="absolute top-2 right-2 bg-indigo-600 text-white p-0.5 rounded-full"><Check className="w-3 h-3 stroke-[4px]" /></div>}
                              <h5 className="font-black text-slate-800 text-lg mb-1">{contractor.name}</h5>
                              <p className="text-[10px] text-indigo-600 font-black mb-3 uppercase tracking-widest">{contractor.specialty}</p>
                              <p className="text-[10px] text-slate-500 italic">"{contractor.note}"</p>
                            </div>
                        );
                    })}
                  </div>
                  <div className="bg-white/80 rounded-[2rem] overflow-hidden border border-white shadow-sm p-8">
                    <button onClick={() => setShowFullAnalysis(!showFullAnalysis)} className="w-full flex items-center justify-between mb-4 group">
                        <div className="flex items-center gap-3"><ClipboardList className="w-5 h-5 text-indigo-900" /><span className="text-xs font-black uppercase text-indigo-950 tracking-widest">Full Action Blueprint</span></div>
                        {showFullAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showFullAnalysis && (
                        <div className="prose prose-sm prose-indigo max-w-none text-slate-600 font-medium border-t border-slate-100 pt-6 mt-2 animate-in slide-in-from-top-2">
                            <ReactMarkdown>{issue.aiAnalysis}</ReactMarkdown>
                            {issue.aiSources && (
                                <div className="mt-8 pt-6 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Grounding Data</p>
                                    <div className="flex flex-wrap gap-2">
                                        {issue.aiSources.map((s, i) => (
                                            <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] bg-slate-100 text-slate-500 px-3 py-2 rounded-xl font-black hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-tighter">
                                                <ExternalLink className="w-3 h-3" /> {s.title.slice(0, 20)}...
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

          {/* DRAFT FORM (Ideate only) */}
          {issue.stage === IssueStage.IDEATE && (
              <div id="solution-form" className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white scroll-mt-24">
                <h4 className="font-black text-slate-900 text-xl flex items-center gap-3 mb-6"><div className="bg-slate-900 text-white p-2 rounded-xl"><Send className="w-5 h-5" /></div>Draft Proposal</h4>
                <form onSubmit={handleSubmitSolution} className="space-y-6">
                  <textarea required value={solutionDesc} onChange={e => setSolutionDesc(e.target.value)} className="w-full bg-slate-50 border-none rounded-3xl p-6 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none font-mono text-sm" placeholder="Describe the solution..." rows={8} />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><DollarSign className="w-5 h-5" /></div><input required type="number" min="0" value={solutionCost} onChange={e => setSolutionCost(Number(e.target.value))} className="w-full pl-11 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/10 transition-all" placeholder="Budget" /></div>
                    <div className="flex flex-col justify-end">{typeof solutionCost === 'number' && solutionCost > 0 && <ImpactCalculator cost={solutionCost} />}</div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] transition-all uppercase tracking-widest">Post Plan</button>
                </form>
              </div>
          )}
        </div>
      )}

      {/* CHAT SECTION */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white mt-8">
          <div className="flex items-center justify-between mb-10"><div><h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">Community Chat</h3><p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">{issue.comments?.length || 0} messages</p></div><div className="bg-slate-50 p-2.5 rounded-2xl"><MessageSquare className="w-6 h-6 text-slate-400" /></div></div>
          <div className="space-y-8">
              {issue.comments && issue.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">{comment.authorName.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-2">
                              <span className="font-black text-sm text-slate-900">{comment.authorName}</span>
                              <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="p-5 rounded-3xl rounded-tl-none font-medium text-sm leading-relaxed bg-slate-50 text-slate-600">{comment.text}</div>
                      </div>
                  </div>
              ))}
              {issue.stage !== IssueStage.CLOSED && (
                  <form onSubmit={handlePostComment} className="flex gap-4 pt-8 border-t border-slate-50 items-center">
                      <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Say something helpful..." className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm" />
                      <button type="submit" disabled={!newComment.trim()} className="bg-slate-900 text-white p-2 rounded-xl hover:bg-indigo-600 disabled:opacity-20 transition-all"><Send className="w-5 h-5" /></button>
                  </form>
              )}
          </div>
      </div>
    </div>
  );
};
