import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Palette,
  Cpu,
  Monitor,
  Globe,
  Sun,
  Moon,
  Check,
  RotateCcw
} from 'lucide-react';
import type { ThemeSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ThemeSettings;
  onUpdateSettings: (newSettings: Partial<ThemeSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'Appearance' | 'General' | 'Application' | 'Models' | 'Customizations' | 'Browser'>('Appearance');

  if (!isOpen) return null;

  const presets = [
    { id: 'antigravity_dark', name: 'Antigravity Obsidian (Default)', bg: '#12141a', fg: '#FFB7EF', accent: '#7BCDFF' },
    { id: 'default_light', name: 'Default Light (PDF Mode)', bg: '#575656', fg: '#FFB7EF', accent: '#7BCDFF' },
    { id: 'neon_glow', name: 'Cyber Neon Horizon', bg: '#0d1117', fg: '#F472B6', accent: '#38BDF8' },
    { id: 'midnight_purple', name: 'Deep Space Nebula', bg: '#170f2b', fg: '#E879F9', accent: '#A855F7' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl bg-[#161822] border border-[#2d3345] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#c7cbdb] text-xs animate-in fade-in zoom-in-95 duration-150"
        style={{ borderColor: '#2d3345' }}
      >
        {/* Top title & Close */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#252a3a] bg-[#12141c]">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#7BCDFF]" />
            <span className="font-semibold text-white text-sm">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8e93a6] hover:text-white hover:bg-[#232838] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Split left navigation & right options (Exact match to PDF) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation */}
          <div className="w-44 border-r border-[#232738] bg-[#12141a] p-2 space-y-0.5 shrink-0">
            <div className="px-2 py-1 text-[10px] font-semibold text-[#5e657c] uppercase tracking-wider">
              Settings
            </div>
            {(['General', 'Application', 'Appearance', 'Models', 'Customizations', 'Browser'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition flex items-center space-x-2 ${
                  activeTab === tab
                    ? 'bg-[#222838] text-white'
                    : 'text-[#8e93a6] hover:bg-[#181b24] hover:text-[#e1e4ea]'
                }`}
              >
                {tab === 'Appearance' && <Palette className="w-3.5 h-3.5 text-[#FFB7EF]" />}
                {tab === 'General' && <Sliders className="w-3.5 h-3.5 text-[#7BCDFF]" />}
                {tab === 'Application' && <Monitor className="w-3.5 h-3.5 text-[#8e93a6]" />}
                {tab === 'Models' && <Cpu className="w-3.5 h-3.5 text-[#00E676]" />}
                {tab === 'Customizations' && <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" />}
                {tab === 'Browser' && <Globe className="w-3.5 h-3.5 text-[#8e93a6]" />}
                <span>{tab}</span>
              </button>
            ))}
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-[#161822]">
            {activeTab === 'Appearance' && (
              <>
                {/* Chat Settings Section */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider pb-1 border-b border-[#252a3a]">
                    Chat Settings
                  </div>

                  {/* Verbose Agent Chat Switch (Matching PDF exactly) */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="font-medium text-white text-xs">Verbose Agent Chat</div>
                      <div className="text-[11px] text-[#7e859b]">
                        Display and preserve intermediate thinking steps
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.verboseChat}
                        onChange={(e) => onUpdateSettings({ verboseChat: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#252b3b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7BCDFF]" />
                    </label>
                  </div>

                  {/* Conversation Width Selector (Matching PDF exactly) */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="font-medium text-white text-xs">Conversation Width</div>
                      <div className="text-[11px] text-[#7e859b]">
                        Configure the maximum width of the conversation panel
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-[#101217] p-1 rounded-lg border border-[#252a3a]">
                      {(['narrow', 'default', 'wide'] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => onUpdateSettings({ conversationWidth: w })}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition ${
                            settings.conversationWidth === w
                              ? 'bg-[#252b3d] text-white shadow-sm'
                              : 'text-[#7e859b] hover:text-white'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Appearance & Color Chips Section (Matching PDF exactly) */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider pb-1 border-b border-[#252a3a]">
                    Appearance
                  </div>

                  {/* Theme Mode Toggle */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="font-medium text-white text-xs">Theme</div>
                      <div className="text-[11px] text-[#7e859b]">
                        Switch between dark ambient and high-contrast light
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-[#101217] p-1 rounded-lg border border-[#252a3a]">
                      <button
                        onClick={() => onUpdateSettings({ mode: 'dark' })}
                        className={`p-1.5 rounded transition ${
                          settings.mode === 'dark' ? 'bg-[#252b3d] text-[#7BCDFF]' : 'text-[#7e859b]'
                        }`}
                        title="Dark Theme"
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onUpdateSettings({ mode: 'light' })}
                        className={`p-1.5 rounded transition ${
                          settings.mode === 'light' ? 'bg-[#252b3d] text-[#FFCC00]' : 'text-[#7e859b]'
                        }`}
                        title="Light Theme"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Preset Dropdown */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="font-medium text-white text-xs">Preset</div>
                      <div className="text-[11px] text-[#7e859b]">Pre-configured Antigravity palette</div>
                    </div>
                    <select
                      value={settings.preset}
                      onChange={(e) => {
                        const sel = presets.find((p) => p.id === e.target.value);
                        if (sel) {
                          onUpdateSettings({
                            preset: sel.id as any,
                            backgroundColor: sel.bg,
                            foregroundColor: sel.fg,
                            accentColor: sel.accent,
                          });
                        }
                      }}
                      className="bg-[#101217] border border-[#252a3a] text-white rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-[#7BCDFF]"
                    >
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color Chips: Background, Foreground, Accent (Matching PDF values: #575656, #FFB7EF, #7BCDFF) */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {/* Background */}
                    <div className="p-2.5 rounded-lg bg-[#101217] border border-[#252a3a] space-y-1.5">
                      <div className="text-[11px] text-[#8e93a6] font-medium">Background</div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-white uppercase">
                          {settings.backgroundColor}
                        </span>
                      </div>
                    </div>

                    {/* Foreground */}
                    <div className="p-2.5 rounded-lg bg-[#101217] border border-[#252a3a] space-y-1.5">
                      <div className="text-[11px] text-[#8e93a6] font-medium">Foreground</div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.foregroundColor}
                          onChange={(e) => onUpdateSettings({ foregroundColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-[#FFB7EF] uppercase">
                          {settings.foregroundColor}
                        </span>
                      </div>
                    </div>

                    {/* Accent */}
                    <div className="p-2.5 rounded-lg bg-[#101217] border border-[#252a3a] space-y-1.5">
                      <div className="text-[11px] text-[#8e93a6] font-medium">Accent</div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.accentColor}
                          onChange={(e) => onUpdateSettings({ accentColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-[#7BCDFF] uppercase">
                          {settings.accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Models' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-white uppercase tracking-wider pb-1 border-b border-[#252a3a]">
                  Gemini AI Models & Thinking Engine
                </div>
                <div className="p-3 bg-[#101217] rounded-lg border border-[#252a3a] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">Default Workflow Reasoner</span>
                    <span className="px-2 py-0.5 rounded bg-[#7BCDFF]/20 text-[#7BCDFF] font-mono text-[10px]">
                      gemini-3.1-pro-preview
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e93a6]">
                    Configured with <strong>HIGH Thinking Mode</strong> for enterprise multi-node logic, schema resolution, and topological layout synthesis.
                  </p>
                </div>
              </div>
            )}

            {activeTab !== 'Appearance' && activeTab !== 'Models' && (
              <div className="p-6 text-center text-[#7e859b] space-y-2">
                <Sliders className="w-6 h-6 mx-auto text-[#7BCDFF] opacity-60" />
                <div className="text-xs font-medium text-white">{activeTab} Preferences</div>
                <p className="text-[11px]">Settings are automatically synchronized to your Firebase cloud profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#252a3a] bg-[#12141c] text-[11px]">
          <button
            onClick={() =>
              onUpdateSettings({
                preset: 'antigravity_dark',
                backgroundColor: '#12141a',
                foregroundColor: '#FFB7EF',
                accentColor: '#7BCDFF',
                verboseChat: true,
                conversationWidth: 'default',
              })
            }
            className="flex items-center space-x-1 text-[#8e93a6] hover:text-white transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#7BCDFF] hover:bg-[#8fd5ff] text-black font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
