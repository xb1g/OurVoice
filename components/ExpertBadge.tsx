import React from 'react';
import { Award } from 'lucide-react';

interface ExpertBadgeProps {
  skills?: string[];
}

export const ExpertBadge: React.FC<ExpertBadgeProps> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {skills.map((skill, index) => (
        <div key={index} className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded border border-amber-200">
          <Award className="w-3 h-3" />
          {skill}
        </div>
      ))}
    </div>
  );
};