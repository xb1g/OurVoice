import React, { useState } from 'react';
import { Issue, IssueStage } from '../types';
import { IssueCard } from '../components/IssueCard';
import { Plus } from 'lucide-react';

interface DashboardProps {
  issues: Issue[];
  onNavigate: (view: string, id?: string) => void;
  onCreateIssue: (title: string, desc: string, cat: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ issues, onNavigate, onCreateIssue }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Maintenance');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateIssue(newTitle, newDesc, newCat);
    setShowModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const activeIssues = issues.filter(i => i.stage !== IssueStage.CLOSED);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Board</h1>
          <p className="text-slate-500">Active discussions in your building</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Raise Issue
        </button>
      </div>

      <div className="grid gap-4">
        {activeIssues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No active issues. Raise one to get started!</p>
          </div>
        ) : (
          activeIssues.map(issue => (
            <IssueCard 
              key={issue.id} 
              issue={issue} 
              onClick={(id) => onNavigate('issue', id)} 
            />
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Raise New Issue</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Fix Front Gate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Amenities">Amenities</option>
                  <option value="Budget">Budget</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the problem clearly..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};