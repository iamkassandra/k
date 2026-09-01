import React from 'react';
import {
  Zap,
  Play,
  Save,
  Library,
  Brain,
  Sliders,
  Settings,
  Sparkles,
  RefreshCw,
  FolderDown,
  Layers,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Code
} from 'lucide-react';
import type { Workflow, UserProfile, ThemeSettings } from '../types';

interface AntigravityHeaderProps {
  workflow: Workflow;
  user: UserProfile | null;
  settings: ThemeSettings;
  activeView: 'builder' | 'chat' | 'split' | 'catalog';
  setActiveView: (view: 'builder' | 'chat' | 'split' | 'catalog') => void;
  isSaving: boolean;
  lastSaved: number | null;
  onOpenSettings: () => void;
  onOpenCatalog: () => void;
  onOpenMemory: () => void;
  onRunWorkflow: () => void;
  isRunning: boolean;
  onExportWorkflow: () => void;
  onOpenCodePreview: () => void;
}

export const AntigravityHeader: React.FC<AntigravityHeaderProps> = ({
  workflow,
  user,
  settings,
  activeView,
  setActiveView,
  isSaving,
  lastSaved,
  onOpenSettings,
  onOpenCatalog,
  onOpenMemory,
  onRunWorkflow,
  isRunning,
  onExportWorkflow,
  onOpenCodePreview,
}) => {
  return (
    <header
      id="antigravity-top-header"
      className="h-12 border-b border-[#252836] bg-[#12141a] px-3 flex items-center justify-between select-none z-30 shrink-0 text-xs"
      style={{
        borderBottomColor: '#252836',
      }}
    >
      {/* Left section: macOS Traffic lights & Brand */}
      <div className="flex items-center space-x-3">
        {/* macOS Traffic lights */}
        <div className="flex items-center space-x-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 hover:opacity-80 transition cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 hover:opacity-80 transition cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 hover:opacity-80 transition cursor-pointer" />
        </div>

        {/* Antigravity Logo & Title */}
        <div className="flex items-center space-x-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center font-bold text-black"
            style={{ backgroundColor: settings.accentColor || '#7BCDFF' }}
          >
            <Zap className="w-3.5 h-3.5 fill-black stroke-black" />
          </div>
          <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
            Antigravity
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-normal bg-[#222634] text-[#7BCDFF] border border-[#7BCDFF]/30">
              v2.6 Enterprise
            </span>
          </span>
        </div>

        {/* Top Menus */}
        <div className="hidden md:flex items-center space-x-2 text-[#8e93a6] font-medium text-[11px] ml-2">
          <button className="px-1.5 py-0.5 rounded hover:text-white hover:bg-[#1f2330] transition">File</button>
          <button className="px-1.5 py-0.5 rounded hover:text-white hover:bg-[#1f2330] transition">Edit</button>
          <button className="px-1.5 py-0.5 rounded hover:text-white hover:bg-[#1f2330] transition">View</button>
          <button className="px-1.5 py-0.5 rounded hover:text-white hover:bg-[#1f2330] transition">Window</button>
          <button className="px-1.5 py-0.5 rounded hover:text-white hover:bg-[#1f2330] transition">Help</button>
        </div>

        {/* Breadcrumb / Active Workflow pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-[#181b24] rounded-md border border-[#252a38] text-[11px] text-[#c3c8db] max-w-sm truncate">
          <span className="text-[#8e93a6] truncate">{workflow.category || 'Workflow'}</span>
          <span className="text-[#555a6e]">/</span>
          <span className="font-medium text-white truncate">{workflow.name}</span>
        </div>
      </div>

      {/* Center section: View switcher */}
      <div className="flex items-center bg-[#181b24] p-0.5 rounded-lg border border-[#252a38]">
        <button
          id="btn-view-split"
          onClick={() => setActiveView('split')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
            activeView === 'split'
              ? 'bg-[#272c3d] text-white shadow-sm'
              : 'text-[#8e93a6] hover:text-[#e1e4ea]'
          }`}
          title="Split View: Visual Canvas & Chat Agent"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Canvas & Agent</span>
        </button>

        <button
          id="btn-view-builder"
          onClick={() => setActiveView('builder')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
            activeView === 'builder'
              ? 'bg-[#272c3d] text-white shadow-sm'
              : 'text-[#8e93a6] hover:text-[#e1e4ea]'
          }`}
          title="Full Visual Node Graph Canvas"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Canvas Only</span>
        </button>

        <button
          id="btn-view-chat"
          onClick={() => setActiveView('chat')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
            activeView === 'chat'
              ? 'bg-[#272c3d] text-white shadow-sm'
              : 'text-[#8e93a6] hover:text-[#e1e4ea]'
          }`}
          title="Full Agent Chat & Thinking Workspace"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFB7EF]" />
          <span>Agent Chat</span>
        </button>
      </div>

      {/* Right section: Actions & Status */}
      <div className="flex items-center space-x-2">
        {/* Auto-save cloud status indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-[#8e93a6] px-2 py-1 rounded bg-[#181b24] border border-[#252a38]">
          {isSaving ? (
            <>
              <RefreshCw className="w-3 h-3 text-[#7BCDFF] animate-spin" />
              <span className="text-[#7BCDFF]">Syncing cloud...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-[#00E676]" />
              <span className="text-[#9ea3b5]">Auto-saved</span>
            </>
          )}
        </div>

        {/* Workflow Catalog Button */}
        <button
          id="btn-open-catalog"
          onClick={onOpenCatalog}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-[#1d212d] hover:bg-[#252b3b] border border-[#2e3447] text-white font-medium transition text-xs"
        >
          <Library className="w-3.5 h-3.5 text-[#7BCDFF]" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        {/* Agent Memory Button */}
        <button
          id="btn-open-memory"
          onClick={onOpenMemory}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-[#1d212d] hover:bg-[#252b3b] border border-[#2e3447] text-white font-medium transition text-xs"
          title="Agent Long-term Memory Bank"
        >
          <Brain className="w-3.5 h-3.5 text-[#FFB7EF]" />
          <span className="hidden sm:inline">Memory</span>
        </button>

        {/* Code Preview Button */}
        <button
          id="btn-code-preview"
          onClick={onOpenCodePreview}
          className="p-1.5 rounded-md bg-[#1d212d] hover:bg-[#252b3b] border border-[#2e3447] text-[#c3c8db] hover:text-white transition"
          title="View Workflow JSON / Graph Schema"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        {/* Run / Test Workflow Button */}
        <button
          id="btn-run-workflow"
          onClick={onRunWorkflow}
          disabled={isRunning}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition ${
            isRunning
              ? 'bg-[#272c3d] text-[#8e93a6] cursor-not-allowed'
              : 'bg-[#7BCDFF] text-[#0d1017] hover:bg-[#8fd5ff] shadow-sm active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Run</span>
            </>
          )}
        </button>

        {/* Settings gear */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="p-1.5 rounded-md bg-[#1d212d] hover:bg-[#252b3b] border border-[#2e3447] text-[#c3c8db] hover:text-white transition"
          title="Antigravity Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
