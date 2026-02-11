import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Check, Plus, Trash2, Zap, Award } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

const PRESET_SKILLS = [
  'Plumber', 'Electrician', 'Carpenter', 
  'Legal Counsel', 'Budget Analyst', 'Architect', 
  'Accountant', 'Gardener', 'Project Manager',
  'Software Engineer', 'Designer', 'Teacher'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Sync local state when the user prop changes (e.g., when switching personas)
  useEffect(() => {
    setName(user.name);
    setSkills(user.skills || []);
  }, [user]);

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
    }
    setCustomSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name,
      skills
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 pb-24">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Profile</h1>
        <p className="text-slate-400 font-medium">Manage your community identity</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer">
                <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-28 h-28 rounded-full bg-slate-100 object-cover ring-8 ring-slate-50 group-hover:ring-indigo-50 transition-all shadow-sm" 
                />
                <div className="absolute bottom-1 right-1 bg-indigo-600 text-white rounded-full p-2 border-4 border-white shadow-sm">
                    <Award className="w-4 h-4" />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mt-4">{name}</h2>
            <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {user.role}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wide">
                    Unit 304
                </span>
            </div>

            <div className="mt-6 w-full max-w-xs">
                <div className="relative text-center bg-slate-50 text-slate-700 text-sm font-bold py-3 px-4 rounded-2xl border-none">
                    Authenticated profile
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                        <Zap className="w-4 h-4 fill-current" />
                    </div>
                </div>
            </div>
        </div>

        <hr className="border-slate-100 mb-8" />

        {/* Form Section */}
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Display Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
            </div>

            <div>
                <div className="flex justify-between items-end mb-2 ml-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Community Skills</label>
                    <span className="text-[10px] font-bold text-slate-300">{skills.length} Active</span>
                </div>
                
                {/* Skill Chips */}
                <div className="bg-slate-50 rounded-[1.5rem] p-4 min-h-[5rem] mb-4 flex flex-wrap gap-2 items-start">
                    {skills.length === 0 && (
                        <p className="text-sm text-slate-400 font-medium italic w-full text-center py-4">
                            Add skills to help neighbors...
                        </p>
                    )}
                    {skills.map(skill => (
                        <button 
                            key={skill}
                            onClick={() => handleRemoveSkill(skill)}
                            className="group inline-flex items-center gap-1.5 bg-white text-indigo-700 px-4 py-2 rounded-xl shadow-sm text-sm font-bold border border-indigo-100 hover:border-red-100 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            {skill}
                            <Trash2 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={customSkill}
                        onChange={e => setCustomSkill(e.target.value)}
                        placeholder="Add a new skill..."
                        className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill(customSkill);
                          }
                        }}
                    />
                    <button 
                        type="button"
                        onClick={() => handleAddSkill(customSkill)}
                        disabled={!customSkill.trim()}
                        className="bg-indigo-600 text-white w-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-lg shadow-indigo-200"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                {/* Suggestions */}
                <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Suggested</span>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_SKILLS.filter(s => !skills.includes(s)).slice(0, 6).map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => handleAddSkill(skill)}
                                className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm transition-all"
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <div className="mt-10">
            <button 
                onClick={handleSave}
                className={`
                    w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl
                    ${isSaved 
                        ? 'bg-emerald-500 text-white shadow-emerald-200 scale-[0.98]' 
                        : 'bg-slate-900 text-white shadow-slate-300 hover:scale-[1.02] active:scale-[0.98]'}
                `}
            >
                {isSaved ? <><Check className="w-6 h-6" /> Profile Saved</> : 'Save Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};
