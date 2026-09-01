import React, { useState } from 'react';
import {
  X,
  Brain,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Key,
  Layers
} from 'lucide-react';
import type { AgentMemoryItem } from '../types';

interface AgentMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: AgentMemoryItem[];
  onAddMemory: (memory: Omit<AgentMemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteMemory: (id: string) => void;
}

export const AgentMemoryModal: React.FC<AgentMemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [category, setCategory] = useState<'preference' | 'api_rule' | 'schema' | 'auth'>('preference');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onAddMemory({
      key: newKey.trim(),
      value: newValue.trim(),
      category,
      confidence: 0.98,
    });
    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-[#141622] border border-[#272d3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#c7cbdb] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232838] bg-[#101218]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#FFB7EF]/20 text-[#FFB7EF]">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Agent Long-Term Memory Bank</div>
              <div className="text-[11px] text-[#7d849b]">
                Learned conventions, company architectural rules, and credentials automatically injected into Gemini prompt context
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e93a6] hover:text-white hover:bg-[#202535] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Add New Memory Form */}
          <form onSubmit={handleAdd} className="p-3.5 rounded-xl bg-[#171a27] border border-[#262c3e] space-y-3">
            <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5 text-[#7BCDFF]" />
              <span>Add Persistent Context or Policy</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Context Key (e.g. SRE_SLACK_CHANNEL, DEFAULT_RETRY_POLICY)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-lg text-xs text-white placeholder-[#5e647a] focus:outline-none focus:border-[#7BCDFF]"
                />
              </div>
              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-lg text-xs text-white focus:outline-none focus:border-[#7BCDFF]"
                >
                  <option value="preference">Preference</option>
                  <option value="api_rule">API Rule</option>
                  <option value="schema">Schema</option>
                  <option value="auth">Auth & Secrets</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                rows={2}
                placeholder="Rule value or description (e.g. 'Always route high-severity alerts to #war-room and retry 3 times with 5s backoff')"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#0e1017] border border-[#262c3e] rounded-lg text-xs text-white placeholder-[#5e647a] focus:outline-none focus:border-[#7BCDFF] resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newKey.trim() || !newValue.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#7BCDFF] text-black font-semibold text-xs hover:bg-[#8fd5ff] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Store Memory
              </button>
            </div>
          </form>

          {/* Stored Memory Items List */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-[#8e93a6] uppercase tracking-wider">
              Active Context Items ({memories.length})
            </div>

            {memories.length === 0 ? (
              <div className="p-6 text-center text-[#6e758c] bg-[#11131a] rounded-xl border border-[#202534]">
                No stored memories yet. The agent automatically learns preferences during workflow creation.
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-start justify-between p-3 rounded-xl bg-[#161925] border border-[#252b3d] text-xs hover:border-[#38415c] transition"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold text-[#FFB7EF] text-xs">{mem.key}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#202538] text-[#7BCDFF] text-[9px] uppercase font-mono">
                          {mem.category}
                        </span>
                        <span className="text-[10px] text-[#555a6e]">
                          {Math.round(mem.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9da3b8] leading-relaxed select-text">{mem.value}</p>
                    </div>

                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1 text-[#6e758c] hover:text-[#FF5252] rounded transition shrink-0"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#232838] bg-[#101218] text-[11px]">
          <span className="text-[#6e758c]">Memories automatically sync across all your sessions.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#252a3a] hover:bg-[#31384d] text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
