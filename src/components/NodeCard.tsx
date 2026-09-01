import React from 'react';
import {
  Zap,
  Sparkles,
  GitBranch,
  Globe,
  Database,
  Bell,
  Clock,
  Code2,
  Trash2,
  Copy,
  Play,
  Settings,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu
} from 'lucide-react';
import type { WorkflowNode, NodeType } from '../types';

interface NodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onRunSingle: (nodeId: string) => void;
  onStartConnection?: (nodeId: string, handleId: string) => void;
  isConnecting?: boolean;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onRunSingle,
  onStartConnection,
  isConnecting,
}) => {
  const { data } = node;

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'trigger':
        return <Zap className="w-3.5 h-3.5 text-[#7BCDFF]" />;
      case 'gemini_ai':
        return <Sparkles className="w-3.5 h-3.5 text-[#FFB7EF]" />;
      case 'condition':
        return <GitBranch className="w-3.5 h-3.5 text-[#FFCC00]" />;
      case 'api_request':
        return <Globe className="w-3.5 h-3.5 text-[#B388FF]" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 text-[#00E676]" />;
      case 'notification':
        return <Bell className="w-3.5 h-3.5 text-[#FF7043]" />;
      case 'delay':
        return <Clock className="w-3.5 h-3.5 text-[#26A69A]" />;
      case 'transform':
      case 'code_script':
      default:
        return <Code2 className="w-3.5 h-3.5 text-[#42A5F5]" />;
    }
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-[#7BCDFF] ring-2 ring-[#7BCDFF]/30 shadow-lg shadow-[#7BCDFF]/10';
    if (data.status === 'running') return 'border-[#7BCDFF] animate-pulse';
    if (data.status === 'success') return 'border-[#00E676]/60';
    if (data.status === 'error') return 'border-[#FF5252]/80';
    return 'border-[#2a2f42] hover:border-[#3d4560]';
  };

  return (
    <div
      id={`node-${node.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`relative w-72 rounded-xl bg-[#151824] border ${getBorderColor()} shadow-xl text-xs select-none transition-all duration-150 group cursor-grab active:cursor-grabbing`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between p-2.5 bg-[#1a1d2c] rounded-t-xl border-b border-[#252a3d]">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="p-1 rounded-md bg-[#12141e] border border-[#2e344a]">
            {getNodeIcon(node.type)}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-white tracking-tight truncate block">
              {data.label}
            </span>
            <span className="text-[10px] text-[#788099] capitalize truncate block">
              {node.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Quick Node Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRunSingle(node.id);
            }}
            title="Execute this node alone"
            className="p-1 rounded hover:bg-[#252b3d] text-[#8e93a6] hover:text-[#7BCDFF] transition"
          >
            <Play className="w-3 h-3 fill-current" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node.id);
            }}
            title="Duplicate node"
            className="p-1 rounded hover:bg-[#252b3d] text-[#8e93a6] hover:text-white transition"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            title="Delete node"
            className="p-1 rounded hover:bg-[#252b3d] text-[#8e93a6] hover:text-[#FF5252] transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Node Body / Description / Config Highlights */}
      <div className="p-3 space-y-2">
        {data.description && (
          <p className="text-[11px] text-[#9aa0b4] line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        )}

        {/* Gemini AI specific pill */}
        {node.type === 'gemini_ai' && (
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#1f192b] border border-[#3e2b54] text-[10px]">
            <div className="flex items-center space-x-1 text-[#FFB7EF]">
              <Cpu className="w-3 h-3" />
              <span>{data.config.model || 'gemini-3.1-pro-preview'}</span>
            </div>
            {data.config.thinkingEnabled && (
              <span className="px-1.5 py-0.2 rounded bg-[#FFB7EF]/20 text-[#FFB7EF] font-mono text-[9px]">
                HIGH THINKING
              </span>
            )}
          </div>
        )}

        {/* Condition Node specific pill */}
        {node.type === 'condition' && data.config.conditionExpression && (
          <div className="px-2 py-1 rounded bg-[#211f18] border border-[#4a4220] font-mono text-[10px] text-[#FFD54F] truncate">
            {data.config.conditionExpression}
          </div>
        )}

        {/* API Request specific pill */}
        {node.type === 'api_request' && data.config.url && (
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#1a1827] border border-[#342e50] text-[10px] truncate">
            <span className="font-bold text-[#B388FF] uppercase">{data.config.method || 'GET'}</span>
            <span className="text-[#8e93a6] font-mono truncate">{data.config.url}</span>
          </div>
        )}

        {/* Execution Status Bar */}
        {data.status && data.status !== 'idle' && (
          <div
            className={`flex items-center justify-between px-2 py-1 rounded text-[10px] font-medium ${
              data.status === 'running'
                ? 'bg-[#152332] text-[#7BCDFF] border border-[#1e3c5a]'
                : data.status === 'success'
                ? 'bg-[#12281e] text-[#00E676] border border-[#1b4d35]'
                : 'bg-[#2b1619] text-[#FF5252] border border-[#522329]'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              {data.status === 'running' && <RefreshCw className="w-3 h-3 animate-spin" />}
              {data.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
              {data.status === 'error' && <AlertCircle className="w-3 h-3" />}
              <span className="capitalize">{data.status}</span>
            </div>
            {data.lastRunDurationMs !== undefined && (
              <span className="font-mono text-[9px] opacity-80">{data.lastRunDurationMs}ms</span>
            )}
          </div>
        )}
      </div>

      {/* Connection Handles (Input & Output Ports) */}
      {/* Left Input Port */}
      {node.type !== 'trigger' && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onStartConnection) onStartConnection(node.id, 'in');
          }}
          className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#181b28] border-2 border-[#7BCDFF] hover:scale-125 transition-transform flex items-center justify-center cursor-pointer shadow-md group/port"
          title="Input Port (Connect incoming output here)"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#7BCDFF]" />
        </div>
      )}

      {/* Right Output Port(s) */}
      {node.type === 'condition' ? (
        <>
          {/* True Handle */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onStartConnection) onStartConnection(node.id, 'true');
            }}
            className="absolute -right-2.5 top-1/3 -translate-y-1/2 w-5 h-5 rounded-full bg-[#181b28] border-2 border-[#00E676] hover:scale-125 transition-transform flex items-center justify-center cursor-pointer shadow-md"
            title="Condition True branch"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
          </div>
          {/* False Handle */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onStartConnection) onStartConnection(node.id, 'false');
            }}
            className="absolute -right-2.5 top-2/3 -translate-y-1/2 w-5 h-5 rounded-full bg-[#181b28] border-2 border-[#FF5252] hover:scale-125 transition-transform flex items-center justify-center cursor-pointer shadow-md"
            title="Condition False branch"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5252]" />
          </div>
        </>
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onStartConnection) onStartConnection(node.id, 'out');
          }}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#181b28] border-2 border-[#FFB7EF] hover:scale-125 transition-transform flex items-center justify-center cursor-pointer shadow-md"
          title="Output Port (Drag to connect downstream node)"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFB7EF]" />
        </div>
      )}
    </div>
  );
};
