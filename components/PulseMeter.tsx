import React from 'react';
import { Activity, CheckCircle, DollarSign, Users } from 'lucide-react';
import { BUILDING_STATS } from '../constants';

export const PulseMeter: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Community Pulse</h2>
      </div>

      <div className="space-y-6">
        {/* Metric 1: Quorum */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 font-medium">Quorum Met</span>
            <span className="text-emerald-600 font-bold">{BUILDING_STATS.activeResidentsPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" 
              style={{ width: `${BUILDING_STATS.activeResidentsPct}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Residents active this week</p>
        </div>

        {/* Metric 2: Issues Resolved */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{BUILDING_STATS.issuesResolvedMonth}</p>
            <p className="text-sm text-slate-500">Issues resolved this month</p>
          </div>
        </div>

        {/* Metric 3: Money Saved */}
        <div className="flex items-start gap-3">
          <div className="bg-amber-50 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">${BUILDING_STATS.moneySaved.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Saved via community sourcing</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-4 h-4" />
            <span>{BUILDING_STATS.totalUnits} Total Units</span>
        </div>
      </div>
    </div>
  );
};