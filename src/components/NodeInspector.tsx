import React from 'react';
import {
  X,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  Globe,
  Database,
  Bell,
  Clock,
  Code2,
  GitBranch,
  ShieldCheck
} from 'lucide-react';
import type { WorkflowNode, WorkflowNodeData } from '../types';

interface NodeInspectorProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdateNodeData: (nodeId: string, newData: Partial<WorkflowNodeData>) => void;
  onRunSingle: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  onUpdateNodeData,
  onRunSingle,
}) => {
  if (!node) return null;

  const { data } = node;
  const config = data.config || {};

  const handleConfigChange = (key: string, value: any) => {
    onUpdateNodeData(node.id, {
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 h-full border-l border-[#202433] bg-[#141620] flex flex-col text-xs text-[#c3c8db] select-text z-20 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#202433] bg-[#12141c]">
        <div className="flex items-center space-x-2 truncate">
          <Sliders className="w-4 h-4 text-[#7BCDFF]" />
          <span className="font-semibold text-white truncate">Node Inspector</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onRunSingle(node.id)}
            className="p-1 rounded hover:bg-[#222738] text-[#7BCDFF] hover:text-white transition"
            title="Run this node"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#222738] text-[#8e93a6] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label & Description */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider block">
            Node Label
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => onUpdateNodeData(node.id, { label: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white focus:outline-none focus:border-[#7BCDFF]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider block">
            Description
          </label>
          <textarea
            rows={2}
            value={data.description || ''}
            onChange={(e) => onUpdateNodeData(node.id, { description: e.target.value })}
            placeholder="Document what this node does..."
            className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white focus:outline-none focus:border-[#7BCDFF] resize-none"
          />
        </div>

        {/* Node Type Specific Configurations */}

        {/* 1. Gemini AI Configuration */}
        {node.type === 'gemini_ai' && (
          <div className="space-y-3 pt-2 border-t border-[#202433]">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#FFB7EF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI Configuration</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e93a6]">Model Selection</label>
              <select
                value={config.model || 'gemini-3.1-pro-preview'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white focus:outline-none focus:border-[#FFB7EF]"
              >
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (High Thinking)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Low Latency)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Multimodal)</option>
              </select>
            </div>

            {/* High Thinking Toggle */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1726] border border-[#3b2a52]">
              <div>
                <div className="font-medium text-white text-[11px]">Thinking Mode</div>
                <div className="text-[10px] text-[#9b8cb8]">Deep multi-step reasoning</div>
              </div>
              <input
                type="checkbox"
                checked={config.thinkingEnabled ?? true}
                onChange={(e) => handleConfigChange('thinkingEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#FFB7EF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e93a6]">System Instruction</label>
              <textarea
                rows={3}
                value={config.systemPrompt || ''}
                onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                placeholder="You are an enterprise AI reasoning specialist..."
                className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white focus:outline-none focus:border-[#FFB7EF] font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e93a6]">User Prompt Template</label>
              <textarea
                rows={3}
                value={config.userPrompt || ''}
                onChange={(e) => handleConfigChange('userPrompt', e.target.value)}
                placeholder="Process payload: {{node_1.output}}"
                className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white focus:outline-none focus:border-[#FFB7EF] font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* 2. Condition Configuration */}
        {node.type === 'condition' && (
          <div className="space-y-3 pt-2 border-t border-[#202433]">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#FFD54F]">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Condition Logic</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e93a6]">Boolean Expression</label>
              <textarea
                rows={2}
                value={config.conditionExpression || ''}
                onChange={(e) => handleConfigChange('conditionExpression', e.target.value)}
                placeholder='{{node_1.output.score}} >= 80'
                className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white focus:outline-none focus:border-[#FFD54F] font-mono text-[11px]"
              />
              <span className="text-[10px] text-[#6d758c]">
                Evaluates to <strong>True</strong> (top pin) or <strong>False</strong> (bottom pin).
              </span>
            </div>
          </div>
        )}

        {/* 3. API / Webhook Configuration */}
        {node.type === 'api_request' && (
          <div className="space-y-3 pt-2 border-t border-[#202433]">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#B388FF]">
              <Globe className="w-3.5 h-3.5" />
              <span>HTTP / Webhook Request</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-[#8e93a6]">Method</label>
                <select
                  value={config.method || 'GET'}
                  onChange={(e) => handleConfigChange('method', e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-[#8e93a6]">Endpoint URL</label>
                <input
                  type="text"
                  value={config.url || ''}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  placeholder="https://api.example.com/v1/resource"
                  className="w-full px-2 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e93a6]">Request Body (JSON)</label>
              <textarea
                rows={3}
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                placeholder='{"key": "{{node_1.output.id}}"}'
                className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* 4. Database / Firestore Configuration */}
        {node.type === 'database' && (
          <div className="space-y-3 pt-2 border-t border-[#202433]">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#00E676]">
              <Database className="w-3.5 h-3.5" />
              <span>Firestore Database Node</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e93a6]">Operation</label>
              <select
                value={config.dbOperation || 'set'}
                onChange={(e) => handleConfigChange('dbOperation', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white"
              >
                <option value="set">Set / Overwrite Document</option>
                <option value="update">Update Document Fields</option>
                <option value="get">Get Document by ID</option>
                <option value="query">Query Collection</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8e93a6]">Collection Name</label>
              <input
                type="text"
                value={config.collection || ''}
                onChange={(e) => handleConfigChange('collection', e.target.value)}
                placeholder="workflows, audit_logs, customers..."
                className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-md text-xs text-white font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* Enterprise Reliability Policies */}
        <div className="space-y-3 pt-2 border-t border-[#202433]">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#7BCDFF]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Reliability & Retries</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#8e93a6]">Max Retries</label>
              <input
                type="number"
                min={0}
                max={5}
                value={config.retryCount ?? 2}
                onChange={(e) => handleConfigChange('retryCount', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#0e1017] border border-[#262c3e] rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8e93a6]">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeoutMs ?? 15000}
                onChange={(e) => handleConfigChange('timeoutMs', parseInt(e.target.value) || 15000)}
                className="w-full px-2 py-1 bg-[#0e1017] border border-[#262c3e] rounded text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#0e1017] border border-[#202433]">
            <span className="text-[11px] text-[#8e93a6]">Continue on Error</span>
            <input
              type="checkbox"
              checked={config.continueOnError ?? false}
              onChange={(e) => handleConfigChange('continueOnError', e.target.checked)}
              className="w-4 h-4 accent-[#7BCDFF]"
            />
          </div>
        </div>

        {/* Node Last Run Output Inspector */}
        {data.lastRunOutput && (
          <div className="space-y-2 pt-2 border-t border-[#202433]">
            <label className="text-[11px] font-semibold text-[#00E676] uppercase tracking-wider block">
              Last Execution Output
            </label>
            <pre className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#202433] font-mono text-[10px] text-[#7BCDFF] overflow-x-auto max-h-48">
              {JSON.stringify(data.lastRunOutput, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
