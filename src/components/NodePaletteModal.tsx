import React, { useState } from 'react';
import {
  X,
  Zap,
  Sparkles,
  GitBranch,
  Globe,
  Database,
  Bell,
  Clock,
  Code2,
  Cpu,
  Layers,
  Plus
} from 'lucide-react';
import type { NodeType, NodeCategory, WorkflowNode } from '../types';

interface NodePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: NodeType, label: string, category: NodeCategory, defaultData?: any) => void;
}

export const NodePaletteModal: React.FC<NodePaletteModalProps> = ({
  isOpen,
  onClose,
  onAddNode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const nodeLibrary: Array<{
    type: NodeType;
    label: string;
    category: NodeCategory;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
  }> = [
    {
      type: 'trigger',
      label: 'Webhook / API Trigger',
      category: 'trigger',
      description: 'Ingests inbound JSON payloads, Webhook requests, or scheduled events.',
      icon: <Zap className="w-4 h-4 text-[#7BCDFF]" />,
      color: '#7BCDFF',
      badge: 'Starter',
    },
    {
      type: 'gemini_ai',
      label: 'Gemini AI Deep Reasoner',
      category: 'ai',
      description: 'Employs gemini-3.1-pro-preview with HIGH Thinking Mode for complex multi-step classification, extraction, or generation.',
      icon: <Sparkles className="w-4 h-4 text-[#FFB7EF]" />,
      color: '#FFB7EF',
      badge: 'gemini-3.1-pro',
    },
    {
      type: 'condition',
      label: 'Conditional Branch',
      category: 'logic',
      description: 'Evaluates dynamic boolean rules to split execution path into True/False branches.',
      icon: <GitBranch className="w-4 h-4 text-[#FFD54F]" />,
      color: '#FFD54F',
      badge: 'Branching',
    },
    {
      type: 'api_request',
      label: 'HTTP / REST API Connector',
      category: 'integration',
      description: 'Dispatches authenticated GET, POST, PUT, or DELETE requests with retry policies.',
      icon: <Globe className="w-4 h-4 text-[#B388FF]" />,
      color: '#B388FF',
      badge: 'Integration',
    },
    {
      type: 'database',
      label: 'Firestore Database Action',
      category: 'data',
      description: 'Creates, queries, or updates real-time Firestore database records.',
      icon: <Database className="w-4 h-4 text-[#00E676]" />,
      color: '#00E676',
      badge: 'Storage',
    },
    {
      type: 'notification',
      label: 'Slack & Email Dispatcher',
      category: 'integration',
      description: 'Dispatches real-time Slack channel alerts or formatted email notifications.',
      icon: <Bell className="w-4 h-4 text-[#FF7043]" />,
      color: '#FF7043',
      badge: 'Alerts',
    },
    {
      type: 'delay',
      label: 'Delay / Timer Step',
      category: 'utility',
      description: 'Pauses workflow execution for a designated duration (e.g. 5 minutes, 2 hours).',
      icon: <Clock className="w-4 h-4 text-[#26A69A]" />,
      color: '#26A69A',
      badge: 'Control',
    },
    {
      type: 'transform',
      label: 'Data Transform & JSON Map',
      category: 'data',
      description: 'Maps, filters, aggregates, or transforms JSON data objects between node steps.',
      icon: <Code2 className="w-4 h-4 text-[#42A5F5]" />,
      color: '#42A5F5',
      badge: 'Transform',
    },
  ];

  const filtered = nodeLibrary.filter(
    (n) => selectedCategory === 'all' || n.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl bg-[#141622] border border-[#272d3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#c7cbdb] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#232838] bg-[#101218]">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-[#7BCDFF]" />
            <span className="font-semibold text-white text-sm">Add Node to Canvas</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8e93a6] hover:text-white hover:bg-[#202535] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-1.5 p-3 border-b border-[#202534] bg-[#12141c] overflow-x-auto">
          {['all', 'trigger', 'ai', 'logic', 'integration', 'data', 'utility'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs capitalize font-medium transition ${
                selectedCategory === cat
                  ? 'bg-[#252c3f] text-white shadow-sm font-semibold'
                  : 'text-[#7e859b] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Node Grid */}
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {filtered.map((item) => (
            <div
              key={item.type}
              onClick={() => {
                onAddNode(item.type, item.label, item.category);
                onClose();
              }}
              className="p-3.5 rounded-xl bg-[#171a27] border border-[#262c3e] hover:border-[#7BCDFF] hover:bg-[#1c2132] cursor-pointer transition space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-[#10121a] border border-[#2c3349]">
                  {item.icon}
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-[#202538] text-[#7BCDFF] text-[9px] font-mono">
                    {item.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="font-semibold text-white group-hover:text-[#7BCDFF] transition">
                  {item.label}
                </div>
                <p className="text-[10px] text-[#7d849b] line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
