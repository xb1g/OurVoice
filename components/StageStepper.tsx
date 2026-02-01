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
];

export const StageStepper: React.FC<StageStepperProps> = ({ currentStage }) => {
  const getCurrentStepIndex = () => {
    if (currentStage === IssueStage.CLOSED) return 4;
    return steps.findIndex(s => s.id === currentStage);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 -z-10" />
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-500 -z-10 transition-all duration-500" 
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center bg-white px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : ''}
                  ${isCurrent ? 'bg-white border-indigo-600 text-indigo-600 scale-110' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-white border-slate-200 text-slate-300' : ''}
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <span 
                className={`text-xs mt-2 font-medium 
                  ${isCurrent ? 'text-indigo-700' : 'text-slate-500'}
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