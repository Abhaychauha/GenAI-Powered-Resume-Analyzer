
import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 85) return 'text-green-500 border-green-500';
    if (score >= 70) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">Candidate Fit Score</h3>
      <div
        className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-8 shadow-lg transition-all duration-500 ${getScoreColor()}`}
      >
        <span className={`text-4xl md:text-5xl font-bold ${getScoreColor().split(' ')[0]}`}>{score}</span>
        <span className={`absolute -bottom-1 text-lg font-semibold ${getScoreColor().split(' ')[0]}`}>/ 100</span>
      </div>
    </div>
  );
};

export default ScoreDisplay;
