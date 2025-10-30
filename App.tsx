import React, { useState, useCallback } from 'react';
import ResumeInput from './components/ResumeInput';
import AnalysisResult from './components/AnalysisResult';
import RewrittenResume from './components/RewrittenResume';
import { analyzeResume, rewriteResume } from './services/geminiService';
import type { AnalysisResult as AnalysisResultType } from './types';

const App: React.FC = () => {
  const [resume, setResume] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [rewrittenResume, setRewrittenResume] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);


  const handleAnalyze = useCallback(async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError('Please provide both a resume and a job description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setRewrittenResume(null);
    setRewriteError(null);

    try {
      const result = await analyzeResume(resume, jobDescription);
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [resume, jobDescription]);

  const handleRewrite = useCallback(async () => {
    if (!resume.trim() || !jobDescription.trim()) {
        setRewriteError('Original resume and job description are required to rewrite.');
        return;
    }
    setIsRewriting(true);
    setRewriteError(null);
    setRewrittenResume(null);

    try {
        const result = await rewriteResume(resume, jobDescription);
        setRewrittenResume(result);
    } catch (err) {
        if (err instanceof Error) {
            setRewriteError(err.message);
        } else {
            setRewriteError('An unknown error occurred while rewriting the resume.');
        }
    } finally {
        setIsRewriting(false);
    }
  }, [resume, jobDescription]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            GenAI Resume Analyzer
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Instantly score and tailor resumes against job descriptions with the power of AI.
          </p>
        </header>

        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg p-6 space-y-6 h-full flex flex-col">
              <ResumeInput resume={resume} setResume={setResume} />
            </div>
            <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg p-6 space-y-6 h-full flex flex-col">
              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  name="job-description"
                  rows={20}
                  className="block w-full h-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition"
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || isRewriting}
              className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze Resume'
              )}
            </button>
          </div>
          
          <div className="mt-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-center" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {!isLoading && !analysisResult && !error && (
                <div className="text-center py-12 px-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg">
                    <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">Ready for Analysis</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Paste a resume and job description above, then click "Analyze Resume" to see the results.
                    </p>
                </div>
            )}

            {analysisResult && (
              <div className="space-y-6">
                <AnalysisResult result={analysisResult} />
                
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleRewrite}
                    disabled={isRewriting || isLoading}
                    className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900 transition-colors"
                  >
                    {isRewriting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Rewriting...
                      </>
                    ) : (
                      'Rewrite Resume for this Role'
                    )}
                  </button>
                </div>
                
                {isRewriting && (
                    <div className="text-center py-12 px-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg">
                        <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h2 className="mt-4 text-xl font-medium text-slate-700 dark:text-slate-300">Crafting Tailored Resume...</h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            The AI is working its magic. This may take a moment.
                        </p>
                    </div>
                )}
                {rewriteError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-center" role="alert">
                        <strong className="font-bold">Rewrite Error: </strong>
                        <span className="block sm:inline">{rewriteError}</span>
                    </div>
                )}
                {rewrittenResume && <RewrittenResume resumeText={rewrittenResume} />}
              </div>
            )}
          </div>
        </main>
      </div>
      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
