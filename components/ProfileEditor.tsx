import React, { useState } from 'react';
import { User } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ProfileEditorProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onClose: () => void;
}

const PRESET_SKILLS = [
  'Plumber', 'Electrician', 'Carpenter', 
  'Legal Counsel', 'Budget Analyst', 'Architect', 
  'Accountant', 'Gardener', 'Project Manager',
  'Software Engineer', 'Designer', 'Teacher'
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setCustomSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      skills
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Community Skills</label>
            <p className="text-xs text-slate-500 mb-3">Add skills to help your neighbors identify your expertise in discussions.</p>
            
            {/* Active Skills */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem] bg-slate-50 p-3 rounded-lg border border-slate-100">
              {skills.length === 0 && <span className="text-sm text-slate-400 italic self-center">No skills added yet</span>}
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2.5 py-1 rounded shadow-sm text-sm font-medium border border-indigo-100 group">
                  {skill}
                  <button 
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-500 ml-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Skill */}
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                placeholder="Type a skill..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
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
                className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-2 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Common Skills</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_SKILLS.filter(s => !skills.includes(s)).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};