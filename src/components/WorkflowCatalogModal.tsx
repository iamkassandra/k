import React, { useState } from 'react';
import {
  X,
  Library,
  Sparkles,
  Search,
  ArrowRight,
  Layers,
  Check,
  Download,
  Upload,
  Cpu,
  ShieldAlert,
  TrendingUp,
  FileCheck2,
  FileCode
} from 'lucide-react';
import type { Workflow } from '../types';
import { ENTERPRISE_TEMPLATES } from '../lib/defaultTemplates';

interface WorkflowCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Workflow) => void;
  onImportWorkflow: (imported: Workflow) => void;
}

export const WorkflowCatalogModal: React.FC<WorkflowCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onImportWorkflow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewTemplate, setPreviewTemplate] = useState<Workflow | null>(ENTERPRISE_TEMPLATES[0]);

  if (!isOpen) return null;

  const categories = ['All', 'Infrastructure', 'Sales & Marketing', 'Finance & Risk', 'Content & Media'];

  const filteredTemplates = ENTERPRISE_TEMPLATES.filter((tpl) => {
    const matchesCat = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          onImportWorkflow(parsed);
          onClose();
        } else {
          alert('Invalid workflow JSON file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-4xl bg-[#141620] border border-[#272d3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#c7cbdb] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232838] bg-[#101218]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#7BCDFF]/20 text-[#7BCDFF]">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Enterprise Workflow Catalog</div>
              <div className="text-[11px] text-[#7d849b]">
                Battle-tested autonomous pipelines with Gemini high-reasoning and enterprise error handling
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Import JSON button */}
            <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1e2332] hover:bg-[#282f42] border border-[#2d364d] text-white cursor-pointer transition text-xs font-medium">
              <Upload className="w-3.5 h-3.5 text-[#7BCDFF]" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8e93a6] hover:text-white hover:bg-[#202535] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 px-5 border-b border-[#202534] bg-[#12141c] gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#7BCDFF] text-black shadow-sm font-semibold'
                    : 'bg-[#181c27] text-[#8e93a6] hover:text-white border border-[#24293a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#5e647a]" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0b0d13] border border-[#24293a] rounded-lg text-xs text-white placeholder-[#5e647a] focus:outline-none focus:border-[#7BCDFF]"
            />
          </div>
        </div>

        {/* Catalog Grid & Preview Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Template List */}
          <div className="w-1/2 border-r border-[#202534] overflow-y-auto p-4 space-y-3">
            {filteredTemplates.map((tpl) => {
              const isSelected = previewTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setPreviewTemplate(tpl)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-[#1c2233] border-[#7BCDFF] ring-1 ring-[#7BCDFF]/30 shadow-md'
                      : 'bg-[#151824] border-[#252b3d] hover:border-[#38415c]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-white text-xs">{tpl.name}</div>
                    <span className="px-2 py-0.5 rounded bg-[#252c3f] text-[#7BCDFF] text-[10px] font-medium">
                      {tpl.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8e95ad] line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {tpl.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 rounded bg-[#10121a] text-[#717892] text-[9px] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-[#8e93a6]">
                      {tpl.nodes.length} Nodes · {tpl.edges.length} Edges
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Template Preview Side Pane */}
          {previewTemplate && (
            <div className="w-1/2 p-5 overflow-y-auto space-y-4 bg-[#11131b]">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">{previewTemplate.name}</div>
                <div className="text-xs text-[#7BCDFF] font-medium">{previewTemplate.category}</div>
                <p className="text-xs text-[#9aa0b6] leading-relaxed pt-1">
                  {previewTemplate.description}
                </p>
              </div>

              {/* Node graph flow preview */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[#6d748c] uppercase tracking-wider">
                  Included Nodes ({previewTemplate.nodes.length})
                </div>
                <div className="space-y-1.5">
                  {previewTemplate.nodes.map((node, i) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#161926] border border-[#242b3d] text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-4 h-4 rounded bg-[#202536] text-[#7BCDFF] flex items-center justify-center font-mono text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-medium text-white truncate">{node.data.label}</span>
                      </div>
                      <span className="text-[10px] text-[#788099] capitalize">
                        {node.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Variables */}
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-[#6d748c] uppercase tracking-wider">
                    Required Environment Variables
                  </div>
                  <div className="space-y-1">
                    {previewTemplate.variables.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-[#161926] font-mono text-[10px]"
                      >
                        <span className="text-[#FFB7EF]">{v.key}</span>
                        <span className="text-[#788099] truncate max-w-[150px]">
                          {v.description || 'Config parameter'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Load button */}
              <div className="pt-3">
                <button
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#7BCDFF] hover:bg-[#8fd5ff] text-black font-bold text-xs transition shadow-lg shadow-[#7BCDFF]/20 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Load this Enterprise Workflow</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
