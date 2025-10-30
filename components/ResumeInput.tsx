
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface ResumeInputProps {
  resume: string;
  setResume: (resume: string) => void;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ resume, setResume }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setResume(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="resume" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Candidate Resume
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md,.pdf,.doc,.docx" // Note: PDF/DOC parsing is best-effort via FileReader
        />
        <button
          onClick={handleUploadClick}
          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
        >
          <UploadIcon />
          Upload File
        </button>
      </div>
      <textarea
        id="resume"
        name="resume"
        rows={20}
        className="block w-full h-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition"
        placeholder="Paste resume text here..."
        value={resume}
        onChange={(e) => setResume(e.target.value)}
      />
    </div>
  );
};

export default ResumeInput;
