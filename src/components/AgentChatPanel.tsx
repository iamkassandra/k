import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  Brain,
  Check,
  Play,
  ArrowRight,
  Plus,
  RefreshCw,
  Sliders,
  Layers,
  HelpCircle,
  Copy,
  CheckCircle2,
  Cpu,
  Zap
} from 'lucide-react';
import type { ChatMessage, Workflow, AgentMemoryItem, ThemeSettings } from '../types';

interface AgentChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  currentWorkflow: Workflow;
  onApplyWorkflow: (wf: Workflow) => void;
  settings: ThemeSettings;
  memories: AgentMemoryItem[];
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentWorkflow,
  onApplyWorkflow,
  settings,
  memories,
}) => {
  const [input, setInput] = useState('');
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await onSendMessage(text);
  };

  const toggleThinking = (msgId: string) => {
    setExpandedThinkingIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const promptSuggestions = [
    'Create an autonomous KYC & compliance pipeline with Gemini risk reasoning and Firestore record',
    'Build an SRE incident auto-triage graph for 5xx errors with PagerDuty & Slack escalation',
    'Generate an enterprise lead enrichment workflow with Clearbit and HubSpot sync',
    'Add an error retry policy (3 retries with 5s backoff) to all AI and API nodes',
    'Add a conditional branch: if severity === "CRITICAL", alert Slack #war-room'
  ];

  const getWidthClass = () => {
    switch (settings.conversationWidth) {
      case 'narrow':
        return 'max-w-md';
      case 'wide':
        return 'max-w-4xl';
      case 'default':
      default:
        return 'max-w-2xl';
    }
  };

  return (
    <div
      id="antigravity-agent-chat-panel"
      className="flex flex-col h-full bg-[#11131a] border-l border-[#1f2330] text-xs select-text overflow-hidden"
    >
      {/* Agent Chat Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1f2330] bg-[#141722] shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[#FFB7EF]/20 border border-[#FFB7EF]/40 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-[#FFB7EF]" />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center space-x-1.5">
              <span>Antigravity Workflow Agent</span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-[#7BCDFF]/20 text-[#7BCDFF]">
                gemini-3.1-pro-preview
              </span>
            </div>
            <div className="text-[10px] text-[#767d94] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
              <span>High Thinking Reasoning Engine Active</span>
            </div>
          </div>
        </div>

        {memories.length > 0 && (
          <div className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-[#1c202d] text-[#FFB7EF] border border-[#FFB7EF]/30 font-medium">
            <Brain className="w-3 h-3" />
            <span>{memories.length} Context Memories</span>
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isThinkingOpen =
            expandedThinkingIds[msg.id] !== undefined
              ? expandedThinkingIds[msg.id]
              : settings.verboseChat;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Bubble Container */}
              <div
                className={`w-full ${getWidthClass()} rounded-2xl p-3.5 space-y-3 ${
                  isUser
                    ? 'bg-[#1e2332] text-white border border-[#2b334a] ml-auto'
                    : 'bg-[#161824] text-[#d6dae8] border border-[#24293c]'
                }`}
              >
                {/* Header with avatar & name */}
                <div className="flex items-center space-x-2 text-[11px] font-medium text-[#7d849b]">
                  {isUser ? (
                    <>
                      <span className="text-white">You</span>
                      <User className="w-3.5 h-3.5 text-[#7BCDFF]" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-[#FFB7EF]" />
                      <span className="text-[#FFB7EF]">Antigravity Agent</span>
                    </>
                  )}
                  <span className="text-[10px] opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Thinking Steps Accordion (Preserved intermediate thinking steps as shown in PDF!) */}
                {!isUser && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                  <div className="rounded-lg bg-[#11131b] border border-[#232738] overflow-hidden">
                    <button
                      onClick={() => toggleThinking(msg.id)}
                      className="w-full flex items-center justify-between p-2 text-[11px] font-mono text-[#8f96af] hover:text-white bg-[#141620] hover:bg-[#181b26] transition"
                    >
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-3.5 h-3.5 text-[#7BCDFF]" />
                        <span className="text-[#7BCDFF]">
                          Thinking Process ({msg.thinkingSteps.length} reasoning steps)
                        </span>
                      </div>
                      {isThinkingOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isThinkingOpen && (
                      <div className="p-2.5 space-y-2 border-t border-[#1e2230] font-mono text-[11px]">
                        {msg.thinkingSteps.map((step, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex items-center space-x-1.5 text-white font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7BCDFF]" />
                              <span>{step.title}</span>
                            </div>
                            <p className="text-[10px] text-[#7d849b] pl-3 leading-relaxed">
                              {step.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Text Content */}
                <div className="text-xs leading-relaxed whitespace-pre-wrap text-[#d6dae8]">
                  {msg.content}
                </div>

                {/* Generated Workflow Card Preview */}
                {msg.generatedWorkflow && (
                  <div className="p-3 rounded-xl bg-[#12141e] border border-[#2c3349] space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-md bg-[#7BCDFF]/20 text-[#7BCDFF]">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs">
                            {msg.generatedWorkflow.name}
                          </div>
                          <div className="text-[10px] text-[#717890]">
                            {msg.generatedWorkflow.nodes?.length || 0} nodes ·{' '}
                            {msg.generatedWorkflow.edges?.length || 0} connections
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#00E676]/20 text-[#00E676] font-mono text-[10px]">
                        Validated
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8e95ad] line-clamp-2">
                      {msg.generatedWorkflow.description}
                    </p>

                    {/* Action button */}
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => onApplyWorkflow(msg.generatedWorkflow!)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-[#7BCDFF] hover:bg-[#8fd5ff] text-black font-semibold text-xs transition shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Apply Workflow to Canvas</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Follow up suggested actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => onSendMessage(action)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#191d29] hover:bg-[#222838] border border-[#272d3e] text-[10px] text-[#9aa1ba] hover:text-white transition"
                      >
                        <ArrowRight className="w-2.5 h-2.5 text-[#7BCDFF]" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-[#7BCDFF] p-3 rounded-xl bg-[#161824] border border-[#24293c] w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Agent reasoning with gemini-3.1-pro-preview (HIGH thinking)...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Carousel */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-[#1f2330] bg-[#141722]/60 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-[#1c202e] hover:bg-[#252b3d] border border-[#2d344a] text-[10px] text-[#9aa1ba] hover:text-white transition shrink-0 flex items-center space-x-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#FFB7EF]" />
              <span className="truncate max-w-[280px]">{prompt}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#1f2330] bg-[#141722] shrink-0">
        <div className="relative flex items-center bg-[#101218] rounded-xl border border-[#292f42] focus-within:border-[#7BCDFF]/80 focus-within:ring-1 focus-within:ring-[#7BCDFF]/40 transition">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask agent to generate, modify, connect nodes, or optimize workflow..."
            className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-[#5d647a] focus:outline-none resize-none"
          />

          <div className="flex items-center space-x-1.5 pr-2">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-lg transition ${
                input.trim() && !isLoading
                  ? 'bg-[#7BCDFF] text-black hover:bg-[#8fd5ff] shadow-sm'
                  : 'bg-[#1f2433] text-[#555b70] cursor-not-allowed'
              }`}
              title="Send to Agent"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
