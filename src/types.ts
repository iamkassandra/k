export type NodeType =
  | 'trigger'
  | 'gemini_ai'
  | 'api_request'
  | 'condition'
  | 'transform'
  | 'database'
  | 'delay'
  | 'notification'
  | 'code_script'
  | 'sub_workflow';

export type NodeCategory = 'trigger' | 'ai' | 'logic' | 'integration' | 'data' | 'utility';

export interface WorkflowPort {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description?: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface WorkflowNodeData {
  label: string;
  description?: string;
  category: NodeCategory;
  type: NodeType;
  icon?: string;
  color?: string;
  config: {
    // Gemini / AI Config
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
    temperature?: number;
    thinkingEnabled?: boolean;
    thinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    responseFormat?: 'json' | 'text' | 'markdown';
    
    // API / Webhook Config
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url?: string;
    headers?: Record<string, string>;
    body?: string;
    authType?: 'none' | 'bearer' | 'basic' | 'apikey';
    apiKey?: string;
    
    // Condition / Branch Config
    conditionType?: 'expression' | 'rule_builder';
    conditionExpression?: string;
    operator?: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'is_null' | 'regex';
    leftOperand?: string;
    rightOperand?: string;
    
    // Database Config
    dbOperation?: 'get' | 'set' | 'update' | 'query' | 'delete';
    collection?: string;
    documentId?: string;
    queryFilters?: Array<{ field: string; op: string; value: string }>;
    
    // Transform Config
    transformType?: 'json_map' | 'js_eval' | 'filter' | 'aggregate';
    transformCode?: string;
    
    // Delay Config
    delaySeconds?: number;
    
    // Notification Config
    channel?: 'slack' | 'email' | 'webhook' | 'sms';
    recipient?: string;
    template?: string;
    
    // Enterprise Reliability
    retryCount?: number;
    retryDelayMs?: number;
    timeoutMs?: number;
    continueOnError?: boolean;
    fallbackValue?: string;
  };
  inputs: WorkflowPort[];
  outputs: WorkflowPort[];
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  lastRunOutput?: any;
  lastRunError?: string;
  lastRunDurationMs?: number;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // 'out' or 'true' / 'false'
  targetHandle?: string; // 'in'
  label?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
}

export interface WorkflowVariable {
  key: string;
  value: string;
  isSecret?: boolean;
  description?: string;
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  userId?: string;
  userName?: string;
  isPublic?: boolean;
  authorAvatar?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  createdAt: number;
  updatedAt: number;
  userId?: string;
  userName?: string;
  isPublic?: boolean;
  version?: number;
  executionHistory?: WorkflowExecutionRecord[];
}

export interface WorkflowExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: number;
  completedAt?: number;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  triggerPayload?: any;
  nodeResults: Record<string, {
    status: 'success' | 'failed' | 'skipped';
    output?: any;
    error?: string;
    durationMs: number;
    startedAt: number;
    completedAt: number;
  }>;
  logs: Array<{
    timestamp: number;
    nodeId?: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  thinkingSteps?: Array<{
    title: string;
    detail: string;
    durationMs?: number;
  }>;
  rawThinking?: string;
  generatedWorkflow?: Workflow;
  suggestedActions?: string[];
  isGenerating?: boolean;
}

export interface AgentMemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'api_rule' | 'context' | 'schema' | 'auth';
  confidence: number;
  createdAt: number;
  updatedAt: number;
}

export interface ThemeSettings {
  mode: 'dark' | 'light';
  preset: 'obsidian' | 'antigravity_dark' | 'neon_glow' | 'default_light';
  backgroundColor: string; // e.g. #121316 or #575656
  foregroundColor: string; // e.g. #FFB7EF
  accentColor: string; // e.g. #7BCDFF
  verboseChat: boolean;
  conversationWidth: 'default' | 'narrow' | 'wide';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
}
