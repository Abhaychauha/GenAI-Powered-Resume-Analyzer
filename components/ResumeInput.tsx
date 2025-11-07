import React, { useRef, useState, useEffect } from 'react';
import { XIcon, CheckIcon } from './icons';

interface ResumeInputProps {
  resume: string;
  setResume: (resume: string) => void;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ resume, setResume }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Effect to clear the filename if the parent component clears the resume text.
  useEffect(() => {
    if (!resume) {
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resume]);

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setResume(text);
      } else {
        console.error("Failed to read file as text.");
        setFileName(null);
      }
    };
    reader.onerror = () => {
      console.error("Error reading file.");
      setFileName(null);
    };
    reader.readAsText(file);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setResume('');
  };

  const dropzoneBaseClasses = "relative w-full h-full border-2 border-dashed rounded-md flex items-center justify-center text-center transition-colors";
  const dropzoneIdleClasses = "border-slate-300 dark:border-slate-600";
  const dropzoneActiveClasses = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10";


  return (
    <div className="flex flex-col h-full">
      <h2 className="block text-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Candidate Resume
      </h2>
      <div 
        className={`${dropzoneBaseClasses} ${isDragOver ? dropzoneActiveClasses : dropzoneIdleClasses}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md,.pdf,.doc,.docx" // Note: PDF/DOC parsing is best-effort via FileReader
        />
        {!resume ? (
           <div
            onClick={handleUploadClick}
            className="cursor-pointer text-slate-500 dark:text-slate-400 p-6 rounded-lg w-full h-full flex flex-col items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="mt-2 font-semibold text-indigo-600 dark:text-indigo-400">
                    {isDragOver ? 'Drop file here' : 'Click to Upload or Drag & Drop'}
                </p>
                <p className="text-xs mt-1">(.txt, .md, .pdf, .docx)</p>
            </div>
        ) : (
          <div className="text-slate-700 dark:text-slate-300 p-6">
            <div className="flex items-center justify-center text-green-500">
                <CheckIcon />
                <span className="ml-2 font-semibold">File Loaded Successfully</span>
            </div>
             <p className="mt-2 text-sm break-all font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{fileName}</p>
             <button
                onClick={handleClear}
                className="mt-4 inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none"
             >
                <XIcon />
                <span className="ml-2">Remove</span>
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeInput;
