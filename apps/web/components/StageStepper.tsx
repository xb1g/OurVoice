
import React from 'react';
import { IssueStage } from '../types';
import { Check, Circle } from 'lucide-react';

interface StageStepperProps {
  currentStage: IssueStage;
}

const steps = [
  { id: IssueStage.RAISE, label: 'Raise' },
  { id: IssueStage.VALIDATE, label: 'Validate' },
  { id: IssueStage.IDEATE, label: 'Ideate' },
  { id: IssueStage.VOTE, label: 'Vote' },
  { id: IssueStage.ONGOING, label: 'Ongoing' },
];

export const StageStepper: React.FC<StageStepperProps> = ({ currentStage }) => {
  const getCurrentStepIndex = () => {
    if (currentStage === IssueStage.CLOSED) return 5;
    return steps.findIndex(s => s.id === currentStage);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative px-2">
        {/* Connector Line */}
        <div className="absolute left-6 right-6 top-[18px] transform -translate-y-1/2 h-1.5 bg-slate-100 rounded-full -z-10" />
        <div 
            className="absolute left-6 top-[18px] transform -translate-y-1/2 h-1.5 bg-indigo-600 rounded-full -z-10 transition-all duration-700 ease-out" 
            style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 12px)` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm
                  ${isCompleted ? 'bg-indigo-600 border-indigo-100 text-white' : ''}
                  ${isCurrent ? 'bg-white border-indigo-600 text-indigo-600 scale-125 z-10 shadow-lg ring-4 ring-indigo-50' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-white border-slate-100 text-slate-300' : ''}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[4px]" /> : <span className="text-[10px] font-black">{index + 1}</span>}
              </div>
              <span 
                className={`text-[10px] mt-4 font-black uppercase tracking-widest transition-colors duration-500
                  ${isCurrent ? 'text-indigo-700' : 'text-slate-400'}
                  ${isCompleted ? 'text-indigo-400' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
