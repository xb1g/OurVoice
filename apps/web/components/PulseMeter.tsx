import React from 'react';
import { Activity, CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react';
import { BUILDING_STATS, COMMUNITY_INFO } from '../constants';

export const PulseMeter: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4 md:mx-0 md:px-0 md:pb-0">
      <div className="flex gap-3 md:grid md:grid-cols-3">
        {/* Card 1: Quorum / Active - Sage Gradient */}
        <div className="min-w-[140px] sm:min-w-[160px] md:min-w-0 flex-1 bg-gradient-to-br from-[#E2E8DE] to-[#C9D6C1] p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 sm:h-40 relative overflow-hidden group shrink-0">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-900" />
          </div>
          <div>
            <p className="text-emerald-900 font-bold text-[10px] sm:text-xs opacity-70 uppercase tracking-wide">Active</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-950 mt-1">{BUILDING_STATS.activeResidentsPct}%</h3>
          </div>
          <div>
            <div className="w-full bg-white/40 rounded-full h-1.5 mt-2 sm:mt-4">
              <div 
                className="bg-emerald-800 h-1.5 rounded-full transition-all duration-1000" 
                style={{ width: `${BUILDING_STATS.activeResidentsPct}%` }}
              ></div>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-900 font-medium mt-2">Quorum Met</p>
          </div>
        </div>

        {/* Card 2: Savings - Warm Beige/Gold Gradient */}
        <div className="min-w-[140px] sm:min-w-[160px] md:min-w-0 flex-1 bg-gradient-to-br from-[#F5EFE6] to-[#E8DAC3] p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 sm:h-40 relative overflow-hidden group shrink-0">
           <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-amber-900" />
          </div>
          <div>
            <p className="text-amber-900 font-bold text-[10px] sm:text-xs opacity-70 uppercase tracking-wide">Saved</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-950 mt-1">${(BUILDING_STATS.moneySaved / 1000).toFixed(1)}k</h3>
          </div>
          <div className="flex items-center gap-1 bg-white/40 w-fit px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3 text-amber-900" />
            <span className="text-[10px] sm:text-xs font-bold text-amber-900">+12% ytd</span>
          </div>
        </div>

        {/* Card 3: Resolved - Soft Purple/Blue Gradient */}
        <div className="min-w-[140px] sm:min-w-[160px] md:min-w-0 flex-1 bg-gradient-to-br from-[#E6E6F5] to-[#C8C8E6] p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 sm:h-40 relative overflow-hidden group shrink-0">
           <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-900" />
          </div>
          <div>
            <p className="text-indigo-900 font-bold text-[10px] sm:text-xs opacity-70 uppercase tracking-wide">Resolved</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-950 mt-1">{BUILDING_STATS.issuesResolvedMonth}</h3>
          </div>
          <p className="text-[10px] sm:text-xs text-indigo-900 font-medium mt-2">Issues this month</p>
        </div>
      </div>
    </div>
  );
};