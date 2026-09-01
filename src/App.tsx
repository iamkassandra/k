/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { onAuthStateChanged } from 'firebase/auth';
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  ChatMessage,
  AgentMemoryItem,
  ThemeSettings,
  UserProfile,
  WorkflowExecutionRecord,
  NodeType,
  NodeCategory,
} from './types';
import { ENTERPRISE_TEMPLATES } from './lib/defaultTemplates';
import {
  auth,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  saveWorkflowToCloud,
  loadUserWorkflows,
  deleteWorkflowFromCloud,
  saveAgentMemoryToCloud,
  loadAgentMemories,
  saveUserSettingsToCloud,
  loadUserSettings,
} from './lib/firebase';
import { AntigravityHeader } from './components/AntigravityHeader';
import { AntigravitySidebar } from './components/AntigravitySidebar';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { AgentChatPanel } from './components/AgentChatPanel';
import { NodeInspector } from './components/NodeInspector';
import { SettingsModal } from './components/SettingsModal';
import { WorkflowCatalogModal } from './components/WorkflowCatalogModal';
import { ExecutionDrawer } from './components/ExecutionDrawer';
import { AgentMemoryModal } from './components/AgentMemoryModal';
import { NodePaletteModal } from './components/NodePaletteModal';
import { CodePreviewModal } from './components/CodePreviewModal';

export default function App() {
  // 1. Workflows State
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    return ENTERPRISE_TEMPLATES;
  });
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string>(
    ENTERPRISE_TEMPLATES[0].id
  );

  // 2. User & Auth State
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'user_kassandra',
    email: 'theaucklandassistant@gmail.com',
    displayName: 'KASSANDRA',
    photoURL: '',
    isAnonymous: false,
  });

  // 3. Settings State (Matching PDF screenshot)
  const [settings, setSettings] = useState<ThemeSettings>({
    mode: 'dark',
    preset: 'antigravity_dark',
    backgroundColor: '#12141a',
    foregroundColor: '#FFB7EF',
    accentColor: '#7BCDFF',
    verboseChat: true,
    conversationWidth: 'default',
  });

  // 4. View Mode: 'split' | 'builder' | 'chat'
  const [activeView, setActiveView] = useState<'split' | 'builder' | 'chat' | 'catalog'>('split');

  // 5. Selected Node for Inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 6. Agent Memories
  const [memories, setMemories] = useState<AgentMemoryItem[]>([
    {
      id: 'mem_1',
      key: 'DEFAULT_AI_MODEL',
      value: 'gemini-3.1-pro-preview with HIGH thinking mode',
      category: 'preference',
      confidence: 0.99,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'mem_2',
      key: 'ENTERPRISE_RETRY_POLICY',
      value: 'Apply 3 retries with 5000ms backoff on external webhook and CRM APIs',
      category: 'api_rule',
      confidence: 0.95,
      createdAt: Date.now() - 43200000,
      updatedAt: Date.now() - 43200000,
    },
    {
      id: 'mem_3',
      key: 'SRE_ALERT_SLACK_CHANNEL',
      value: '#sre-war-room and #production-incidents',
      category: 'preference',
      confidence: 0.92,
      createdAt: Date.now() - 21600000,
      updatedAt: Date.now() - 21600000,
    },
  ]);

  // 7. Chat History with Antigravity Agent
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am your Antigravity Autonomous Workflow Agent. I can construct, inspect, and optimize enterprise-grade visual workflows with deep reasoning (gemini-3.1-pro-preview with HIGH Thinking Mode).\n\nTell me what you would like to build or refine!`,
      timestamp: Date.now() - 10000,
      thinkingSteps: [
        {
          title: 'System Bootstrap',
          detail: 'Initialized neural topology reasoner and connected to Firebase persistence.',
        },
        {
          title: 'Context Sync',
          detail: 'Loaded active enterprise templates and agent long-term memory bank.',
        },
      ],
      suggestedActions: [
        'Create Cloud Incident Auto-Triage & Remediation workflow',
        'Generate Autonomous KYC & Compliance Risk Assessment flow',
        'Build Lead Enrichment & CRM Pipeline',
      ],
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 8. Execution & Simulator State
  const [isRunning, setIsRunning] = useState(false);
  const [latestExecution, setLatestExecution] = useState<WorkflowExecutionRecord | null>(null);

  // 9. Auto-save & Status
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(Date.now());

  // 10. Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isExecutionOpen, setIsExecutionOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCodePreviewOpen, setIsCodePreviewOpen] = useState(false);

  // Active Workflow derived
  const activeWorkflow =
    workflows.find((w) => w.id === currentWorkflowId) || workflows[0] || ENTERPRISE_TEMPLATES[0];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'theaucklandassistant@gmail.com',
          displayName: firebaseUser.displayName || 'KASSANDRA',
          photoURL: firebaseUser.photoURL || '',
          isAnonymous: firebaseUser.isAnonymous,
        });

        // Load user workflows & memories
        try {
          const cloudWorkflows = await loadUserWorkflows(firebaseUser.uid);
          if (cloudWorkflows && cloudWorkflows.length > 0) {
            setWorkflows(cloudWorkflows);
            setCurrentWorkflowId(cloudWorkflows[0].id);
          }
          const cloudMemories = await loadAgentMemories(firebaseUser.uid);
          if (cloudMemories && cloudMemories.length > 0) {
            setMemories(cloudMemories);
          }
          const cloudSettings = await loadUserSettings(firebaseUser.uid);
          if (cloudSettings) {
            setSettings(cloudSettings);
          }
        } catch (e) {
          console.warn('Initial cloud load note:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-Save Workflow to Cloud & Local Storage
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!activeWorkflow) return;
    setIsSaving(true);

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveWorkflowToCloud(activeWorkflow, user?.uid);
        setLastSaved(Date.now());
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [activeWorkflow, user?.uid]);

  // Handle Updates to Current Workflow's Nodes
  const handleUpdateNodes = useCallback(
    (newNodes: WorkflowNode[]) => {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === currentWorkflowId ? { ...w, nodes: newNodes, updatedAt: Date.now() } : w))
      );
    },
    [currentWorkflowId]
  );

  // Handle Updates to Current Workflow's Edges
  const handleUpdateEdges = useCallback(
    (newEdges: WorkflowEdge[]) => {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === currentWorkflowId ? { ...w, edges: newEdges, updatedAt: Date.now() } : w))
      );
    },
    [currentWorkflowId]
  );

  // Update Single Node Data
  const handleUpdateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== currentWorkflowId) return w;
          return {
            ...w,
            nodes: w.nodes.map((node) => {
              if (node.id !== nodeId) return node;
              return {
                ...node,
                data: {
                  ...node.data,
                  ...newData,
                },
              };
            }),
            updatedAt: Date.now(),
          };
        })
      );
    },
    [currentWorkflowId]
  );

  // Add a new node from palette
  const handleAddNodeFromPalette = (
    type: NodeType,
    label: string,
    category: NodeCategory,
    defaultData?: any
  ) => {
    const newId = `node_${Date.now()}`;
    const maxX = activeWorkflow.nodes.reduce((max, n) => Math.max(max, n.position.x), 80);
    const newNode: WorkflowNode = {
      id: newId,
      type,
      position: { x: maxX + 320, y: 180 },
      data: {
        label,
        category,
        type,
        color: category === 'ai' ? '#FFB7EF' : category === 'trigger' ? '#7BCDFF' : '#FFD54F',
        config: {
          model: 'gemini-3.1-pro-preview',
          thinkingEnabled: true,
          thinkingLevel: 'HIGH',
          ...defaultData,
        },
        inputs: type !== 'trigger' ? [{ id: 'in', name: 'Input', type: 'object' }] : [],
        outputs:
          type === 'condition'
            ? [
                { id: 'true', name: 'True', type: 'object' },
                { id: 'false', name: 'False', type: 'object' },
              ]
            : [{ id: 'out', name: 'Output', type: 'object' }],
        status: 'idle',
      },
    };

    handleUpdateNodes([...activeWorkflow.nodes, newNode]);
    setSelectedNodeId(newId);
  };

  // Chat Agent Interaction
  const handleSendMessage = async (text: string) => {
    const userMsgId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          currentWorkflow: activeWorkflow,
          memories,
          verboseThinking: settings.verboseChat,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        thinkingSteps: data.thinkingSteps,
        rawThinking: data.rawThinking,
        generatedWorkflow: data.generatedWorkflow,
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If workflow was generated and user prompt was explicit, auto-switch to split or builder
      if (data.generatedWorkflow) {
        // Automatically offer to apply
      }
    } catch (err: any) {
      console.error('Agent chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `I encountered an issue: ${err.message}. Please verify the Gemini API configuration or network connection.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Apply Generated Workflow to Canvas
  const handleApplyWorkflow = (wf: Workflow) => {
    setWorkflows((prev) => {
      const exists = prev.some((w) => w.id === wf.id);
      if (exists) {
        return prev.map((w) => (w.id === wf.id ? wf : w));
      }
      return [wf, ...prev];
    });
    setCurrentWorkflowId(wf.id);
    setActiveView('split');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7BCDFF', '#FFB7EF', '#00E676'],
    });
  };

  // Execute / Simulator Run
  const handleRunWorkflow = async (triggerPayload?: any) => {
    setIsRunning(true);
    setIsExecutionOpen(true);

    // Set all nodes to running state initially
    handleUpdateNodes(
      activeWorkflow.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'running' as const },
      }))
    );

    try {
      const res = await fetch('/api/execute-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: activeWorkflow,
          triggerPayload: triggerPayload || {},
        }),
      });

      const data = await res.json();
      const executionRecord: WorkflowExecutionRecord = {
        id: data.executionId,
        workflowId: activeWorkflow.id,
        workflowName: activeWorkflow.name,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        status: data.status,
        triggerPayload,
        nodeResults: data.nodeResults || {},
        logs: data.logs || [],
      };

      setLatestExecution(executionRecord);

      // Update nodes on canvas with success/error status
      handleUpdateNodes(
        activeWorkflow.nodes.map((node) => {
          const resNode = data.nodeResults?.[node.id];
          return {
            ...node,
            data: {
              ...node.data,
              status: resNode ? resNode.status : 'idle',
              lastRunOutput: resNode?.output,
              lastRunError: resNode?.error,
              lastRunDurationMs: resNode?.durationMs,
            },
          };
        })
      );

      if (data.status === 'success') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#00E676', '#7BCDFF', '#FFB7EF'],
        });
      }
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Run Single Node
  const handleRunSingleNode = async (nodeId: string) => {
    setSelectedNodeId(nodeId);
    handleUpdateNodeData(nodeId, { status: 'running' });
    try {
      const res = await fetch('/api/execute-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: activeWorkflow,
          testNodeId: nodeId,
        }),
      });
      const data = await res.json();
      const resNode = data.nodeResults?.[nodeId];
      handleUpdateNodeData(nodeId, {
        status: resNode?.status || 'success',
        lastRunOutput: resNode?.output,
        lastRunDurationMs: resNode?.durationMs || 150,
      });
    } catch {
      handleUpdateNodeData(nodeId, { status: 'error' });
    }
  };

  // Workflow Management: New, Select, Delete
  const handleNewWorkflow = () => {
    const newWf: Workflow = {
      id: `wf_${Date.now()}`,
      name: 'Untitled Enterprise Workflow',
      description: 'Custom autonomous workflow graph created in Antigravity.',
      tags: ['Custom', 'Autonomous'],
      category: 'General',
      nodes: [
        {
          id: 'node_start',
          type: 'trigger',
          position: { x: 80, y: 200 },
          data: {
            label: 'Webhook Trigger',
            description: 'Inbound payload trigger',
            category: 'trigger',
            type: 'trigger',
            color: '#7BCDFF',
            config: {
              method: 'POST',
              body: '{"event": "start"}',
            },
            inputs: [],
            outputs: [{ id: 'out', name: 'Payload', type: 'object' }],
            status: 'idle',
          },
        },
      ],
      edges: [],
      variables: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: user?.uid,
    };
    setWorkflows((prev) => [newWf, ...prev]);
    setCurrentWorkflowId(newWf.id);
    setSelectedNodeId(null);
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (workflows.length <= 1) return;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    if (currentWorkflowId === id) {
      const remaining = workflows.filter((w) => w.id !== id);
      setCurrentWorkflowId(remaining[0].id);
    }
    await deleteWorkflowFromCloud(id);
  };

  // Memory additions
  const handleAddMemory = async (
    mem: Omit<AgentMemoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newMemory: AgentMemoryItem = {
      ...mem,
      id: `mem_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setMemories((prev) => [newMemory, ...prev]);
    await saveAgentMemoryToCloud(newMemory, user?.uid);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user?.uid) {
      await saveUserSettingsToCloud(user.uid, updated);
    }
  };

  const selectedNode = activeWorkflow.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div
      id="antigravity-app-root"
      className="flex flex-col h-screen w-screen overflow-hidden font-sans"
      style={{
        backgroundColor: settings.backgroundColor || '#12141a',
        color: settings.mode === 'light' ? '#1a1d24' : '#e1e4ea',
      }}
    >
      {/* 1. Antigravity Top Window Titlebar Header (Exact match to PDF) */}
      <AntigravityHeader
        workflow={activeWorkflow}
        user={user}
        settings={settings}
        activeView={activeView}
        setActiveView={setActiveView}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onRunWorkflow={() => handleRunWorkflow()}
        isRunning={isRunning}
        onExportWorkflow={() => setIsCodePreviewOpen(true)}
        onOpenCodePreview={() => setIsCodePreviewOpen(true)}
      />

      {/* 2. Main Middle Workspace: Sidebar + Canvas/Chat */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Antigravity Sidebar */}
        <AntigravitySidebar
          workflows={workflows}
          currentWorkflowId={currentWorkflowId}
          onSelectWorkflow={(id) => {
            setCurrentWorkflowId(id);
            setSelectedNodeId(null);
          }}
          onNewWorkflow={handleNewWorkflow}
          onDeleteWorkflow={handleDeleteWorkflow}
          onNewConversation={() => {
            setMessages((prev) => [
              ...prev,
              {
                id: `msg_${Date.now()}`,
                role: 'assistant',
                content:
                  'Starting a new session! What workflow would you like to build or automate?',
                timestamp: Date.now(),
              },
            ]);
            setActiveView('split');
          }}
          user={user}
          onLoginGoogle={loginWithGoogle}
          onLogout={logoutUser}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
        />

        {/* Dynamic Center Work Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Canvas Pane */}
          {(activeView === 'split' || activeView === 'builder') && (
            <div
              className={`h-full relative flex ${
                activeView === 'split' ? 'w-3/5' : 'w-full'
              }`}
            >
              <WorkflowCanvas
                nodes={activeWorkflow.nodes}
                edges={activeWorkflow.edges}
                onUpdateNodes={handleUpdateNodes}
                onUpdateEdges={handleUpdateEdges}
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                onRunSingleNode={handleRunSingleNode}
                onOpenNodePalette={() => setIsPaletteOpen(true)}
              />

              {/* Node Inspector Drawer when a node is clicked */}
              {selectedNode && (
                <NodeInspector
                  node={selectedNode}
                  onClose={() => setSelectedNodeId(null)}
                  onUpdateNodeData={handleUpdateNodeData}
                  onRunSingle={handleRunSingleNode}
                />
              )}
            </div>
          )}

          {/* Conversational Agent Chat Pane */}
          {(activeView === 'split' || activeView === 'chat') && (
            <div
              className={`h-full ${
                activeView === 'split' ? 'w-2/5' : 'w-full'
              }`}
            >
              <AgentChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                currentWorkflow={activeWorkflow}
                onApplyWorkflow={handleApplyWorkflow}
                settings={settings}
                memories={memories}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Modals & Overlays */}
      {/* Settings Modal (Matching PDF screenshot) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Enterprise Workflow Catalog */}
      <WorkflowCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectTemplate={(tpl) => handleApplyWorkflow(tpl)}
        onImportWorkflow={(imported) => handleApplyWorkflow(imported)}
      />

      {/* Execution / Live Debugger Drawer */}
      <ExecutionDrawer
        isOpen={isExecutionOpen}
        onClose={() => setIsExecutionOpen(false)}
        workflow={activeWorkflow}
        onRunWorkflow={handleRunWorkflow}
        isRunning={isRunning}
        latestExecution={latestExecution}
      />

      {/* Agent Memory Bank */}
      <AgentMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
      />

      {/* Node Palette Modal */}
      <NodePaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onAddNode={handleAddNodeFromPalette}
      />

      {/* Code / JSON Schema Preview Modal */}
      <CodePreviewModal
        isOpen={isCodePreviewOpen}
        onClose={() => setIsCodePreviewOpen(false)}
        workflow={activeWorkflow}
      />
    </div>
  );
}
