
import React from 'react';
import { CheckIcon, XIcon } from './icons';

interface SkillListProps {
  title: string;
  skills: string[];
  type: 'matching' | 'missing';
}

const SkillList: React.FC<SkillListProps> = ({ title, skills, type }) => {
  const Icon = type === 'matching' ? CheckIcon : XIcon;
  const bgColor = type === 'matching' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  const textColor = type === 'matching' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300';

  return (
    <div>
      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h4>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li key={index} className="flex items-center">
            <Icon />
            <span className={`ml-3 text-sm font-medium text-slate-600 dark:text-slate-400`}>{skill}</span>
          </li>
        ))}
         {skills.length === 0 && (
            <p className="text-sm text-slate-500 italic">None identified.</p>
         )}
      </ul>
    </div>
  );
};

export default SkillList;
