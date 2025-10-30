
import React from 'react';
import type { AnalysisResult as AnalysisResultType } from '../types';
import ScoreDisplay from './ScoreDisplay';
import SkillList from './SkillList';

interface AnalysisResultProps {
  result: AnalysisResultType;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg p-6 space-y-6 animate-fade-in">
      <ScoreDisplay score={result.score} />
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Summary</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{result.summary}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Experience Analysis</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{result.experienceSummary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <SkillList title="Matching Skills" skills={result.matchingSkills} type="matching" />
        <SkillList title="Skill Gaps" skills={result.missingSkills} type="missing" />
      </div>
    </div>
  );
};

export default AnalysisResult;
