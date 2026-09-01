import React, { useState } from 'react';
import { X, Code, Copy, Check, Download } from 'lucide-react';
import type { Workflow } from '../types';

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  isOpen,
  onClose,
  workflow,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonStr = JSON.stringify(workflow, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '_')}_workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-3xl bg-[#141622] border border-[#272d3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#c7cbdb] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232838] bg-[#101218]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#7BCDFF]/20 text-[#7BCDFF]">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Workflow Graph Schema (JSON)</div>
              <div className="text-[11px] text-[#7d849b]">
                Structured node graph representation ready for CI/CD or export
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1e2332] hover:bg-[#282f42] border border-[#2d364d] text-white transition text-xs font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#7BCDFF] hover:bg-[#8fd5ff] text-black font-semibold transition text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8e93a6] hover:text-white hover:bg-[#202535] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-4 overflow-y-auto flex-1 bg-[#0c0e14] font-mono text-[11px] select-text">
          <pre className="text-[#7BCDFF] leading-relaxed whitespace-pre-wrap">
            {jsonStr}
          </pre>
        </div>
      </div>
    </div>
  );
};
