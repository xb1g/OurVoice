import React from 'react';
import { PulseMeter } from '../components/PulseMeter';
import { COMMUNITY_INFO, MOCK_VENDORS } from '../constants';
import { MapPin, Calendar, ShieldCheck, Car, TreePine, Droplets, Dumbbell, Wallet, TrendingUp, Phone, Globe, Star, CheckCircle2, Info, Receipt, ArrowRight } from 'lucide-react';

export const CondoView: React.FC = () => {
  const totalRecurring = COMMUNITY_INFO.financials.recurringPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-32">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Condo Info</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">Building stats & trusted resources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 overflow-hidden">
        {/* Left Column: Financial & Pulse */}
        <div className="space-y-6 sm:space-y-8">
           <section>
             <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Overview</h2>
             <PulseMeter />
           </section>
           
           {/* Financial Health & Assessments */}
           <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 sm:p-2.5 rounded-xl">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">Financial Health</h2>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide">Monthly transparency report</p>
                    </div>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Your Fee</span>
                    <span className="text-xs font-black text-slate-800">${COMMUNITY_INFO.financials.monthlyAssessment}/mo</span>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-100/50">
                    <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Reserve Fund</p>
                    <p className="text-base sm:text-xl font-bold text-slate-800 tracking-tight truncate">
                        ${COMMUNITY_INFO.financials.reserveFund.toLocaleString()}
                    </p>
                </div>
                <div className="bg-blue-50/50 rounded-2xl p-4 sm:p-5 border border-blue-100/50">
                    <p className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Operating</p>
                    <p className="text-base sm:text-xl font-bold text-slate-800 tracking-tight truncate">
                        ${COMMUNITY_INFO.financials.operatingAccount.toLocaleString()}
                    </p>
                </div>
             </div>

             <div className="pt-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Recent Expenses
                </h3>
                <div className="space-y-3">
                    {COMMUNITY_INFO.financials.recentExpenses.map(expense => (
                        <div key={expense.id} className="flex justify-between items-start text-sm p-2 sm:p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
                            <div className="min-w-0 pr-2">
                                <p className="font-bold text-slate-700 text-xs sm:text-sm group-hover:text-indigo-700 transition-colors truncate">
                                    {expense.description}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {new Date(expense.date).toLocaleDateString()} • {expense.category}
                                </p>
                            </div>
                            <span className="shrink-0 font-mono font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                -${expense.amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
             </div>
           </div>

           {/* Service Contracts / Subscriptions: Where the money goes */}
           <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 text-white shadow-xl shadow-slate-200">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl">
                        <Receipt className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold">Monthly Burn</h2>
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">Recurring subscriptions</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-indigo-400 tracking-tighter">${totalRecurring.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase">Total / mo</p>
                </div>
             </div>

             <div className="space-y-1">
                {COMMUNITY_INFO.financials.recurringPayments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white/40">
                                {payment.vendor.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-black text-white/90">{payment.vendor}</p>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{payment.category}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-mono font-bold text-indigo-300">${payment.amount.toLocaleString()}</p>
                            <p className="text-[8px] font-bold text-white/20 uppercase">{payment.frequency}</p>
                        </div>
                    </div>
                ))}
             </div>
             
             <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-all flex items-center justify-center gap-2">
                Download Full Ledger <ArrowRight className="w-3 h-3" />
             </button>
           </div>
        </div>

        {/* Right Column: Building & Vendors */}
        <div className="space-y-6 sm:space-y-8">
          {/* Building Details */}
           <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
             <div className="h-28 sm:h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 relative p-5 sm:p-6 flex flex-col justify-end">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-white relative z-10 leading-tight">{COMMUNITY_INFO.name}</h2>
                <div className="flex items-center gap-1.5 text-indigo-100 text-[10px] sm:text-sm font-medium relative z-10 mt-1 truncate">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">{COMMUNITY_INFO.address}</span>
                </div>
             </div>
             
             <div className="p-5 sm:p-6 space-y-6">
                <div className="flex gap-3 sm:gap-4">
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter sm:tracking-normal">Built</span>
                        <span className="font-bold text-slate-800 text-sm sm:text-base">{COMMUNITY_INFO.yearBuilt}</span>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                        <BuildingIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter sm:tracking-normal">Units</span>
                        <span className="font-bold text-slate-800 text-sm sm:text-base">{COMMUNITY_INFO.units}</span>
                    </div>
                </div>
                
                <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">Amenities</span>
                   <div className="flex flex-wrap gap-2">
                      {COMMUNITY_INFO.amenities.map(amenity => (
                        <span key={amenity} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-colors hover:bg-indigo-50 hover:text-indigo-600 whitespace-nowrap">
                           {getAmenityIcon(amenity)}
                           {amenity}
                        </span>
                      ))}
                   </div>
                </div>
             </div>
           </div>

           {/* Trusted Contractors */}
           <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-5 sm:p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-50 p-2 sm:p-2.5 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Trusted Pros</h2>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide">Community recommended</p>
                </div>
             </div>

             <div className="space-y-4">
                {MOCK_VENDORS.map(vendor => (
                    <div key={vendor.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="min-w-0 pr-2">
                                <h3 className="font-bold text-slate-800 text-sm truncate">{vendor.name}</h3>
                                <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">{vendor.category}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100 shrink-0">
                                <Star className="w-3 h-3 text-amber-500 fill-current" />
                                <span className="font-bold text-[10px] sm:text-xs text-slate-700">{vendor.rating}</span>
                            </div>
                        </div>
                        <div className="space-y-2 mb-4">
                             <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 font-medium">
                                 <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                 <span className="font-mono">{vendor.phone}</span>
                             </div>
                             {vendor.website && (
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 font-medium">
                                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                                        {vendor.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                             )}
                        </div>
                        {vendor.recommendedBy && (
                            <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold flex items-center gap-1.5 pt-3 border-t border-slate-100/50">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                Rec. by {vendor.recommendedBy}
                            </div>
                        )}
                    </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const BuildingIcon = (props: any) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );

const getAmenityIcon = (name: string) => {
    const className = "w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0";
    if (name.includes('Pool')) return <Droplets className={className} />;
    if (name.includes('Gym')) return <Dumbbell className={className} />;
    if (name.includes('Garden')) return <TreePine className={className} />;
    if (name.includes('Parking')) return <Car className={className} />;
    if (name.includes('Security')) return <ShieldCheck className={className} />;
    return <Info className={className} />;
};