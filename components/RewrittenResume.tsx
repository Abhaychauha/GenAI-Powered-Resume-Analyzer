import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ClipboardIcon, ClipboardCheckIcon, DownloadIcon } from './icons';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Helper function for downloading blobs
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper to parse a markdown line into an array of TextRuns for docx
const parseLineToTextRuns = (line: string): TextRun[] => {
  const children: TextRun[] = [];
  // Split by bold/italic markers, keeping the delimiters
  const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(p => p);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      children.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else {
      children.push(new TextRun(part));
    }
  }
  return children;
};

// Helper to parse markdown into an array of docx Paragraphs
const parseMarkdownToDocx = (markdown: string): Paragraph[] => {
    const paragraphs: Paragraph[] = [];
    const lines = markdown.split('\n');

    for (const line of lines) {
        if (line.startsWith('# ')) {
            paragraphs.push(new Paragraph({ children: parseLineToTextRuns(line.substring(2)), heading: HeadingLevel.HEADING_1 }));
            continue;
        }
        if (line.startsWith('## ')) {
            paragraphs.push(new Paragraph({ children: parseLineToTextRuns(line.substring(3)), heading: HeadingLevel.HEADING_2 }));
            continue;
        }

        const isListItem = line.startsWith('- ') || line.startsWith('* ');
        const lineContent = isListItem ? line.substring(2) : line;

        if (!line.trim()) {
            paragraphs.push(new Paragraph({ text: '' }));
            continue;
        }

        paragraphs.push(new Paragraph({
            children: parseLineToTextRuns(lineContent),
            bullet: isListItem ? { level: 0 } : undefined,
        }));
    }

    return paragraphs;
};


// A simple parser to get a decent HTML representation for display
const markdownToHtml = (markdown: string): string => {
    // Note: No HTML escaping, assuming model output is safe Markdown.
    let text = markdown;
    
    // Process block elements first
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    
    let inList = false;
    const lines = text.split('\n');
    const newLines = [];
    for(const line of lines) {
        const isListItem = line.startsWith('- ') || line.startsWith('* ');
        if (isListItem) {
            if (!inList) {
                inList = true;
                newLines.push('<ul>');
            }
            newLines.push(`<li>${line.substring(2)}</li>`);
        } else {
            if (inList) {
                inList = false;
                newLines.push('</ul>');
            }
            newLines.push(line);
        }
    }
    if (inList) {
        newLines.push('</ul>');
    }
    text = newLines.join('\n');

    // Inline elements
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Wrap remaining lines in paragraphs
    return text.split('\n').map(line => {
        if (line.trim() === '' || line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<li>') || line.startsWith('</ul')) {
            return line;
        }
        return `<p>${line}</p>`;
    }).join('');
};


interface RewrittenResumeProps {
  resumeText: string;
}

const RewrittenResume: React.FC<RewrittenResumeProps> = ({ resumeText }) => {
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resumeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [resumeText]);

  const handleDownloadTxt = useCallback(() => {
    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'rewritten-resume.txt');
    setIsMenuOpen(false);
  }, [resumeText]);

  const handleDownloadPdf = useCallback(() => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);

    const margin = 15;
    const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;
    
    const addLine = (text: string, options: { indent?: number; style?: 'normal' | 'bold' | 'italic'; size?: number } = {}) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }
        const { indent = 0, style = 'normal', size = 11 } = options;
        doc.setFontSize(size);
        doc.setFont(undefined, style);
        const x = margin + indent;
        const lines = doc.splitTextToSize(text, usableWidth - indent);
        doc.text(lines, x, y);
        y += (lines.length * 5) + 2; // Approximate line height + small buffer
    };

    const lines = resumeText.split('\n');
    for (const line of lines) {
        if (line.startsWith('# ')) {
            addLine(line.substring(2), { size: 16, style: 'bold' });
            y += 2; // Extra space after heading
        } else if (line.startsWith('## ')) {
            addLine(line.substring(3), { size: 14, style: 'bold' });
            y += 1;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            addLine(`• ${line.substring(2)}`, { indent: 5 });
        } else if (line.trim()) {
            addLine(line);
        } else {
            y += 5; // Empty line
        }
    }

    doc.save('rewritten-resume.pdf');
    setIsMenuOpen(false);
  }, [resumeText]);

  const handleDownloadDocx = useCallback(async () => {
    const paragraphs = parseMarkdownToDocx(resumeText);
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, 'rewritten-resume.docx');
    setIsMenuOpen(false);
  }, [resumeText]);

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg p-6 space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Tailored Resume
        </h3>
        <div className="flex items-center gap-2">
            <button
                onClick={handleCopy}
                className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
            >
                {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
                {copied ? 'Copied!' : 'Copy Text'}
            </button>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
                >
                    <DownloadIcon />
                    Download
                </button>
                {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleDownloadTxt(); }}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left"
                        role="menuitem"
                    >
                        As .txt file
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleDownloadPdf(); }}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left"
                        role="menuitem"
                    >
                        As .pdf file
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleDownloadDocx(); }}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left"
                        role="menuitem"
                    >
                        As .docx file
                    </a>
                    </div>
                </div>
                )}
            </div>
        </div>
      </div>
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md max-h-[60vh] overflow-y-auto">
        <div 
          className="prose prose-sm dark:prose-invert max-w-none prose-h1:text-xl prose-h1:font-bold prose-h2:text-lg prose-h2:font-semibold prose-p:my-2 prose-ul:my-2"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(resumeText) }}
        />
      </div>
    </div>
  );
};

export default RewrittenResume;