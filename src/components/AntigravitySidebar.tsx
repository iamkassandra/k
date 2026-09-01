import React, { useState } from 'react';
import {
  Plus,
  History,
  Clock,
  FolderGit2,
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle,
  Keyboard,
  LogOut,
  LogIn,
  Workflow as WorkflowIcon,
  Trash2,
  Check,
  ChevronDown,
  Layers,
  Search
} from 'lucide-react';
import type { Workflow, UserProfile, ThemeSettings } from '../types';

interface AntigravitySidebarProps {
  workflows: Workflow[];
  currentWorkflowId: string;
  onSelectWorkflow: (id: string) => void;
  onNewWorkflow: () => void;
  onDeleteWorkflow: (id: string) => void;
  onNewConversation: () => void;
  user: UserProfile | null;
  onLoginGoogle: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  settings: ThemeSettings;
}

export const AntigravitySidebar: React.FC<AntigravitySidebarProps> = ({
  workflows,
  currentWorkflowId,
  onSelectWorkflow,
  onNewWorkflow,
  onDeleteWorkflow,
  onNewConversation,
  user,
  onLoginGoogle,
  onLogout,
  onOpenSettings,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'workflows' | 'projects' | 'history'>('workflows');

  const filteredWorkflows = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside
      id="antigravity-sidebar"
      className="w-64 border-r border-[#20232f] bg-[#14161e] flex flex-col justify-between select-none z-20 shrink-0 text-xs text-[#9aa0b4]"
      style={{
        borderRightColor: '#20232f',
      }}
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col p-3 space-y-3">
        {/* + New Conversation / Workflow Button */}
        <button
          id="btn-new-conversation"
          onClick={onNewConversation}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-[#1f2433] hover:bg-[#282e42] border border-[#2d344a] text-white font-medium transition shadow-sm group"
        >
          <Plus className="w-4 h-4 text-[#7BCDFF] group-hover:scale-110 transition-transform" />
          <span>New Conversation</span>
        </button>

        {/* Quick Nav Links matching PDF screenshot */}
        <div className="flex flex-col space-y-0.5">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${
              activeTab === 'history' ? 'bg-[#1e2332] text-white font-medium' : 'hover:bg-[#1a1d28] hover:text-[#e1e4ea]'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#8e93a6]" />
            <span>Conversation History</span>
          </button>

          <button
            onClick={() => setActiveTab('workflows')}
            className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${
              activeTab === 'workflows' ? 'bg-[#1e2332] text-white font-medium' : 'hover:bg-[#1a1d28] hover:text-[#e1e4ea]'
            }`}
          >
            <WorkflowIcon className="w-3.5 h-3.5 text-[#7BCDFF]" />
            <span>Visual Workflows</span>
            <span className="ml-auto text-[10px] bg-[#242a3b] px-1.5 py-0.5 rounded text-[#7BCDFF] font-mono">
              {workflows.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${
              activeTab === 'projects' ? 'bg-[#1e2332] text-white font-medium' : 'hover:bg-[#1a1d28] hover:text-[#e1e4ea]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#8e93a6]" />
            <span>Scheduled Tasks</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-[#5e647a]" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 bg-[#101217] border border-[#232734] rounded-md text-xs text-[#e1e4ea] placeholder-[#5e647a] focus:outline-none focus:border-[#7BCDFF]/60"
          />
        </div>

        {/* Section Header: Projects */}
        <div className="pt-2 border-t border-[#1e222e]">
          <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-semibold text-[#666d85] uppercase tracking-wider">
            <span>Projects</span>
            <button
              onClick={onNewWorkflow}
              title="Create new workflow canvas"
              className="hover:text-white p-0.5 rounded hover:bg-[#232734] transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-[#1a1d28]/60 text-[#c7cbd9] text-[11px] truncate">
              <FolderGit2 className="w-3.5 h-3.5 text-[#7BCDFF] shrink-0" />
              <span className="truncate">pre-wipe/pre-reset...</span>
            </div>
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-[#1a1d28] text-[#8e93a6] hover:text-[#e1e4ea] text-[11px] truncate cursor-pointer">
              <FolderGit2 className="w-3.5 h-3.5 text-[#8e93a6] shrink-0" />
              <span className="truncate">Full Backup and AI Handoff</span>
            </div>
          </div>
        </div>

        {/* Section: Workflows & Autonomous Graphs */}
        <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-1">
          <div className="px-1 mb-1 text-[11px] font-semibold text-[#666d85] uppercase tracking-wider flex items-center justify-between">
            <span>Active Workflows</span>
          </div>

          {filteredWorkflows.map((wf) => {
            const isSelected = wf.id === currentWorkflowId;
            return (
              <div
                key={wf.id}
                onClick={() => onSelectWorkflow(wf.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition text-xs ${
                  isSelected
                    ? 'bg-[#202535] text-white border border-[#2e374f]'
                    : 'hover:bg-[#181b24] text-[#9aa0b4] hover:text-[#e1e4ea]'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: isSelected ? settings.accentColor || '#7BCDFF' : '#555a6e',
                    }}
                  />
                  <div className="truncate">
                    <div className="truncate font-medium">{wf.name}</div>
                    <div className="text-[10px] text-[#616880] truncate">
                      {wf.nodes?.length || 0} nodes · {wf.category || 'Automation'}
                    </div>
                  </div>
                </div>

                {workflows.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteWorkflow(wf.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#FF5252] rounded transition"
                    title="Delete workflow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Section: Shortcuts, Feedback, Profile & Settings */}
      <div className="p-3 border-t border-[#1e222e] bg-[#12141a] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#6e758e] px-1">
          <button className="flex items-center space-x-1.5 hover:text-white transition">
            <Keyboard className="w-3 h-3" />
            <span>Shortcuts</span>
          </button>
          <button className="flex items-center space-x-1.5 hover:text-white transition">
            <HelpCircle className="w-3 h-3" />
            <span>Provide Feedback</span>
          </button>
        </div>

        {/* User Account / Profile Card matching PDF screenshot */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#181c27] border border-[#232838]">
          <div className="flex items-center space-x-2.5 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-7 h-7 rounded-full border border-[#3b435c]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-black text-xs shrink-0"
                style={{ backgroundColor: settings.foregroundColor || '#FFB7EF' }}
              >
                K
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.displayName || 'KASSANDRA'}
              </div>
              <div className="text-[10px] text-[#717892] truncate">
                {user?.email || 'theaucklandassistant@gmail.com'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {user && !user.isAnonymous ? (
              <button
                onClick={onLogout}
                className="p-1 text-[#8e93a6] hover:text-[#FF5252] transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onLoginGoogle}
                className="p-1 text-[#7BCDFF] hover:text-white transition"
                title="Sign in with Google (Firebase)"
              >
                <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Settings button in bottom bar */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[#1a1e2b] text-[#8e93a6] hover:text-white transition text-xs"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </div>
          <span className="text-[10px] font-mono text-[#555a6e]">⌘,</span>
        </button>
      </div>
    </aside>
  );
};
