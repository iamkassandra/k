import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  RefreshCw,
  Sliders,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import type { Workflow, WorkflowExecutionRecord } from '../types';

interface ExecutionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
  onRunWorkflow: (triggerPayload: any) => Promise<void>;
  isRunning: boolean;
  latestExecution: WorkflowExecutionRecord | null;
}

export const ExecutionDrawer: React.FC<ExecutionDrawerProps> = ({
  isOpen,
  onClose,
  workflow,
  onRunWorkflow,
  isRunning,
  latestExecution,
}) => {
  const [triggerInput, setTriggerInput] = useState<string>(
    JSON.stringify(
      {
        alert_id: 'ALT-9842',
        service: 'auth-gateway',
        metric: '5xx_rate',
        value: 14.8,
        region: 'us-east-1',
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
  const [selectedNodeOutput, setSelectedNodeOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRun = () => {
    try {
      const parsed = JSON.parse(triggerInput);
      onRunWorkflow(parsed);
    } catch {
      onRunWorkflow({ raw: triggerInput });
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#12141c] border-l border-[#24293a] shadow-2xl z-50 flex flex-col text-xs text-[#c3c8db] select-text animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202534] bg-[#0e1017]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#7BCDFF]" />
          <span className="font-semibold text-white text-sm">Workflow Simulator & Live Debugger</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#8e93a6] hover:text-white hover:bg-[#202536] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Trigger Payload Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider">
              Trigger Mock Payload (JSON)
            </label>
            <span className="text-[10px] text-[#6d758c]">Passes to trigger node ($input)</span>
          </div>
          <textarea
            rows={5}
            value={triggerInput}
            onChange={(e) => setTriggerInput(e.target.value)}
            className="w-full p-2.5 bg-[#0a0c12] border border-[#232838] rounded-xl font-mono text-[11px] text-[#7BCDFF] focus:outline-none focus:border-[#7BCDFF] resize-y"
          />
        </div>

        {/* Run Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl font-bold text-xs transition shadow-lg ${
              isRunning
                ? 'bg-[#202636] text-[#8e93a6] cursor-not-allowed'
                : 'bg-[#7BCDFF] hover:bg-[#8fd5ff] text-black shadow-[#7BCDFF]/20 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Graph Execution...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Trigger Autonomous Run</span>
              </>
            )}
          </button>
        </div>

        {/* Execution Summary */}
        {latestExecution && (
          <div className="space-y-4 pt-3 border-t border-[#202534]">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#171a26] border border-[#252b3d]">
              <div className="flex items-center space-x-2.5">
                {latestExecution.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#FF5252]" />
                )}
                <div>
                  <div className="font-semibold text-white text-xs">
                    Execution {latestExecution.status === 'success' ? 'Completed' : 'Failed'}
                  </div>
                  <div className="text-[10px] text-[#788099]">
                    ID: {latestExecution.id} · {Object.keys(latestExecution.nodeResults || {}).length} nodes executed
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                  latestExecution.status === 'success'
                    ? 'bg-[#00E676]/20 text-[#00E676]'
                    : 'bg-[#FF5252]/20 text-[#FF5252]'
                }`}
              >
                {latestExecution.status.toUpperCase()}
              </span>
            </div>

            {/* Step-by-Step Node Execution Results */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider">
                Node Outputs Breakdown
              </div>
              <div className="space-y-1.5">
                {workflow.nodes.map((node) => {
                  const res = latestExecution.nodeResults?.[node.id];
                  const isSuccess = res?.status === 'success';
                  const isExpanded = selectedNodeOutput === node.id;

                  return (
                    <div
                      key={node.id}
                      className="rounded-lg bg-[#151824] border border-[#23293a] overflow-hidden"
                    >
                      <button
                        onClick={() => setSelectedNodeOutput(isExpanded ? null : node.id)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-[#1a1e2d] transition text-left"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {res ? (
                            isSuccess ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-[#FF5252] shrink-0" />
                            )
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-[#5e657c] shrink-0" />
                          )}
                          <span className="font-medium text-white truncate">{node.data.label}</span>
                          <span className="text-[10px] text-[#6e758e]">({node.type})</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {res && (
                            <span className="font-mono text-[10px] text-[#7BCDFF]">
                              {res.durationMs}ms
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[#8e93a6]" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#8e93a6]" />
                          )}
                        </div>
                      </button>

                      {isExpanded && res && (
                        <div className="p-3 border-t border-[#1f2434] bg-[#0c0e14] font-mono text-[10px]">
                          <div className="text-[#8e93a6] mb-1 font-semibold">Output Payload:</div>
                          <pre className="text-[#7BCDFF] overflow-x-auto max-h-40 leading-relaxed">
                            {JSON.stringify(res.output || res.error, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execution Logs Stream */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider">
                Live Execution Logs ({latestExecution.logs?.length || 0})
              </div>
              <div className="p-3 rounded-xl bg-[#090b10] border border-[#202534] font-mono text-[10px] space-y-1.5 max-h-48 overflow-y-auto">
                {(latestExecution.logs || []).map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-[#555c70] shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <span
                      className={`font-semibold shrink-0 uppercase text-[9px] px-1 rounded ${
                        log.level === 'error'
                          ? 'bg-[#FF5252]/20 text-[#FF5252]'
                          : log.level === 'warn'
                          ? 'bg-[#FFCC00]/20 text-[#FFCC00]'
                          : 'bg-[#7BCDFF]/20 text-[#7BCDFF]'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-[#d0d5e6] break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
