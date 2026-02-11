import React from 'react';
import { TOTAL_UNITS } from '../constants';
import { Calculator } from 'lucide-react';

interface ImpactCalculatorProps {
  cost: number;
}

export const ImpactCalculator: React.FC<ImpactCalculatorProps> = ({ cost }) => {
  if (!cost || cost <= 0) return null;

  const costPerUnit = cost / TOTAL_UNITS;

  return (
    <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-sm mt-2 animate-in fade-in slide-in-from-top-1">
      <Calculator className="w-4 h-4 text-slate-500" />
      <span className="font-medium">Impact: </span>
      <span>${costPerUnit.toFixed(2)} per unit (One-time)</span>
    </div>
  );
};