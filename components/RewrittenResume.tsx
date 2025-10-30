import React, { useState, useCallback } from 'react';
import { ClipboardIcon, ClipboardCheckIcon } from './icons';

interface RewrittenResumeProps {
  resumeText: string;
}

const RewrittenResume: React.FC<RewrittenResumeProps> = ({ resumeText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resumeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  }, [resumeText]);

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg p-6 space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Tailored Resume
        </h3>
        <button
          onClick={handleCopy}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
        >
          {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
      </div>
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md max-h-[60vh] overflow-y-auto">
         <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
          {resumeText}
        </pre>
      </div>
    </div>
  );
};

export default RewrittenResume;
