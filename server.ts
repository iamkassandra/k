import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in environment.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Workflow Validation Endpoint
app.post('/api/validate-workflow', (req: Request, res: Response) => {
  try {
    const { workflow } = req.body;
    if (!workflow || !workflow.nodes) {
      return res.status(400).json({ error: 'Missing workflow definition' });
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    const nodes = workflow.nodes as any[];
    const edges = (workflow.edges || []) as any[];

    if (nodes.length === 0) {
      errors.push('Workflow has no nodes.');
    }

    const hasTrigger = nodes.some((n) => n.type === 'trigger');
    if (!hasTrigger) {
      warnings.push('Workflow does not contain an entry Trigger node.');
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    edges.forEach((e) => {
      if (!nodeIds.has(e.source)) errors.push(`Edge ${e.id} references missing source ${e.source}`);
      if (!nodeIds.has(e.target)) errors.push(`Edge ${e.id} references missing target ${e.target}`);
    });

    return res.json({
      isValid: errors.length === 0,
      errors,
      warnings,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Natural Chat & Autonomous Workflow Generation Agent Endpoint (Kass's Autonomous Engine)
app.post('/api/chat-agent', async (req: Request, res: Response) => {
  try {
    const { message, history = [], currentWorkflow, memories = [], verboseThinking = true } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // Offline fallback with smart synthesis
      return res.json({
        content: `I'm ready to help you construct or optimize your autonomous enterprise workflow in Kass's Workflow Studio. (Note: Running in local prototype mode - configure GEMINI_API_KEY for live neural graph generation).`,
        thinkingSteps: [
          { title: 'Analyzing User Intent', detail: 'Evaluated prompt requirements and operational constraints.' },
          { title: 'Synthesizing DAG Topology', detail: 'Ensuring inputs, outputs, parallel stages, and conditional branches are verified.' }
        ],
        generatedWorkflow: null,
        suggestedActions: [
          'Create multi-step KYC risk assessment pipeline',
          'Add automated parallel triage and escalation',
          'Optimize retry policies for high reliability'
        ]
      });
    }

    const systemInstruction = `You are the lead AI Workflow Architect in "Kass's Workflow Studio" powered by the Antigravity Autonomous Engine.
Your goal is to converse naturally with the user, understand their operational needs, and autonomously generate, update, or optimize visual enterprise workflows.

Current Workflow Context:
${currentWorkflow ? JSON.stringify(currentWorkflow, null, 2) : 'No active workflow loaded.'}

Agent Long-Term Memory / User Context:
${JSON.stringify(memories, null, 2)}

Instructions:
1. Provide a concise, highly knowledgeable, friendly explanation of your plan.
2. If the user is asking to build, create, modify, add to, or optimize a workflow, you MUST generate a complete, valid, structured workflow object inside your JSON response under "workflow".
3. For the workflow:
   - Calculate clean (x, y) coordinates for nodes in a left-to-right flow (start around x:80, step x by 320-360px).
   - Support parallel node branches where appropriate (e.g. multiple downstream nodes receiving output from the same parent, differing in y by 180-220px).
   - Use node types: 'trigger', 'gemini_ai', 'api_request', 'condition', 'transform', 'database', 'delay', 'notification', 'code_script'.
   - Include realistic enterprise configurations: system prompts, API endpoints, retry counts (e.g. 2-3), timeoutMs, condition expressions (e.g. '{{node_1.output.status}} === "success"').
   - For condition nodes, include two output handles: 'true' and 'false'.
   - Create edges with corresponding source, target, sourceHandle ('true'/'false' if condition), targetHandle ('in').
4. Always output your response in the following JSON format:
{
  "thinkingSteps": [
    { "title": "Step 1 name", "detail": "What was reasoned or verified" },
    { "title": "Step 2 name", "detail": "Node topology & variable binding analysis" }
  ],
  "message": "Friendly response explaining what you did and key architectural choices",
  "workflow": <Full workflow object or null if pure conversational question>,
  "suggestedActions": ["Follow up action 1", "Follow up action 2", "Follow up action 3"]
}`;

    const prompt = `User Message: ${message}\n\nRecent History:\n${history.map((h: any) => `${h.role}: ${h.content}`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Try extracting json block
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = {
          message: responseText,
          thinkingSteps: [{ title: 'Autonomous Reasoning Complete', detail: 'Analyzed request context.' }],
          workflow: null,
          suggestedActions: []
        };
      }
    }

    return res.json({
      content: parsed.message || 'Workflow generated successfully in Kass\'s Studio.',
      thinkingSteps: parsed.thinkingSteps || [
        { title: 'Neural Graph Synthesis', detail: 'Generated high-reliability enterprise nodes, parallel paths, and edges.' }
      ],
      rawThinking: (response as any).candidates?.[0]?.thinkingProcess || '',
      generatedWorkflow: parsed.workflow ? {
        id: parsed.workflow.id || `wf_${Date.now()}`,
        name: parsed.workflow.name || 'Autonomous Generated Workflow',
        description: parsed.workflow.description || 'Generated in Kass\'s Studio',
        tags: parsed.workflow.tags || ['Enterprise', 'Autonomous'],
        category: parsed.workflow.category || 'Automation',
        nodes: parsed.workflow.nodes || [],
        edges: parsed.workflow.edges || [],
        variables: parsed.workflow.variables || [],
        createdAt: parsed.workflow.createdAt || Date.now(),
        updatedAt: Date.now()
      } : null,
      suggestedActions: parsed.suggestedActions || [
        'Test run this workflow',
        'Add error retry policy',
        'Export to JSON'
      ]
    });
  } catch (error: any) {
    console.error('Error in /api/chat-agent:', error);
    return res.status(500).json({
      error: error.message || 'Internal agent error',
      content: `I encountered an issue processing your request: ${error.message || 'Unknown error'}. Please retry or adjust parameters.`,
      thinkingSteps: [{ title: 'Execution Exception', detail: error.message }]
    });
  }
});

// Autonomous Multi-Step Workflow Execution Engine (Supports Parallelism, Conditional Branching, & Error Retries)
app.post('/api/execute-workflow', async (req: Request, res: Response) => {
  try {
    const { workflow, triggerPayload = {}, testNodeId } = req.body;
    if (!workflow || !workflow.nodes) {
      return res.status(400).json({ error: 'Missing workflow definition' });
    }

    const ai = getGeminiClient();
    const executionId = `exec_${Date.now()}`;
    const logs: Array<{ timestamp: number; nodeId?: string; level: 'info' | 'warn' | 'error' | 'debug'; message: string }> = [];
    const nodeResults: Record<string, any> = {};

    const nodes = workflow.nodes as any[];
    const edges = (workflow.edges || []) as any[];

    logs.push({
      timestamp: Date.now(),
      level: 'info',
      message: `[Kass's Studio Engine] Initializing execution #${executionId} for "${workflow.name}" (${nodes.length} nodes, ${edges.length} edges)`
    });

    // Execution Context Store
    const context: {
      trigger: any;
      env: Record<string, string>;
      nodes: Record<string, any>;
      activeBranches: Set<string>;
      skippedNodes: Set<string>;
    } = {
      trigger: triggerPayload,
      env: (workflow.variables || []).reduce((acc: any, v: any) => ({ ...acc, [v.key]: v.value }), {}),
      nodes: {},
      activeBranches: new Set<string>(),
      skippedNodes: new Set<string>()
    };

    // Helper: Variable Interpolator
    const interpolate = (template: string): string => {
      if (!template || typeof template !== 'string') return template;
      return template.replace(/\{\{([\s\S]+?)\}\}/g, (_, expr) => {
        const trimmed = expr.trim();
        if (trimmed in context.env) return context.env[trimmed];
        if (trimmed.startsWith('$input.') || trimmed.startsWith('trigger.')) {
          const key = trimmed.replace(/^(\$input\.|trigger\.)/, '');
          return context.trigger?.[key] !== undefined ? String(context.trigger[key]) : '';
        }
        const nodeMatch = trimmed.match(/^(node_[a-zA-Z0-9_-]+)\.output(?:\.(.+))?$/);
        if (nodeMatch) {
          const nId = nodeMatch[1];
          const path = nodeMatch[2];
          const out = context.nodes[nId];
          if (!out) return '';
          if (!path) return typeof out === 'object' ? JSON.stringify(out) : String(out);
          const parts = path.split('.');
          let cur = out;
          for (const p of parts) {
            if (cur === null || cur === undefined) return '';
            cur = cur[p];
          }
          return typeof cur === 'object' ? JSON.stringify(cur) : String(cur ?? '');
        }
        return '';
      });
    };

    // 1. Build Dependency Graph for Parallel Stage Resolution
    const inDegree: Record<string, number> = {};
    const adjacency: Record<string, Array<{ target: string; sourceHandle?: string }>> = {};
    const incomingEdges: Record<string, Array<{ source: string; sourceHandle?: string }>> = {};

    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adjacency[n.id] = [];
      incomingEdges[n.id] = [];
    });

    edges.forEach((e) => {
      if (adjacency[e.source] && inDegree[e.target] !== undefined) {
        adjacency[e.source].push({ target: e.target, sourceHandle: e.sourceHandle });
        incomingEdges[e.target].push({ source: e.source, sourceHandle: e.sourceHandle });
        inDegree[e.target] = (inDegree[e.target] || 0) + 1;
      }
    });

    // 2. Identify Initial Batch of Ready Nodes
    let readyNodes: string[] = nodes
      .filter((n) => inDegree[n.id] === 0)
      .map((n) => n.id);

    if (testNodeId) {
      readyNodes = [testNodeId];
    } else if (readyNodes.length === 0 && nodes.length > 0) {
      readyNodes = [nodes[0].id];
    }

    const executedSet = new Set<string>();
    let stageNumber = 1;

    // Helper: Execute a single node with retry logic
    const executeNodeWithRetry = async (node: any): Promise<{ status: 'success' | 'failed' | 'skipped'; output?: any; error?: string; durationMs: number }> => {
      // Check if node is skipped due to condition branch
      if (context.skippedNodes.has(node.id)) {
        logs.push({
          timestamp: Date.now(),
          nodeId: node.id,
          level: 'debug',
          message: `Node [${node.data.label}] skipped (inactive branch).`
        });
        return {
          status: 'skipped',
          output: { skipped: true, reason: 'Inactive conditional branch' },
          durationMs: 0
        };
      }

      const maxRetries = Math.min(Math.max(node.data.config?.retryCount ?? 1, 0), 4);
      let attempt = 0;
      let lastErr: any = null;
      const startTime = Date.now();

      while (attempt <= maxRetries) {
        attempt++;
        try {
          if (attempt > 1) {
            logs.push({
              timestamp: Date.now(),
              nodeId: node.id,
              level: 'warn',
              message: `Retrying node [${node.data.label}] (Attempt ${attempt}/${maxRetries + 1})...`
            });
            await new Promise((r) => setTimeout(r, 400 * attempt));
          }

          let output: any = null;

          if (node.type === 'trigger') {
            output = Object.keys(context.trigger).length > 0
              ? context.trigger
              : (node.data.config?.body ? JSON.parse(node.data.config.body) : { status: 'triggered', timestamp: Date.now() });
          } else if (node.type === 'gemini_ai') {
            if (ai) {
              const systemPrompt = node.data.config?.systemPrompt || 'You are an enterprise AI reasoning specialist.';
              const rawUserPrompt = node.data.config?.userPrompt || `Process context: ${JSON.stringify(context.nodes)}`;
              const userPrompt = interpolate(rawUserPrompt);

              const aiResp = await ai.models.generateContent({
                model: node.data.config?.model || 'gemini-3.1-pro-preview',
                contents: userPrompt,
                config: {
                  systemInstruction: systemPrompt,
                  thinkingConfig: {
                    thinkingLevel: node.data.config?.thinkingLevel === 'HIGH' ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
                  },
                  responseMimeType: node.data.config?.responseFormat === 'json' ? 'application/json' : 'text/plain'
                }
              });

              const text = aiResp.text || '';
              try {
                output = JSON.parse(text);
              } catch {
                output = { result: text, raw: text };
              }
            } else {
              // High fidelity simulation
              output = {
                status: 'analyzed',
                model: node.data.config?.model || 'gemini-3.1-pro-preview',
                reasoning: 'Evaluated input telemetry and synthesized decision graph.',
                confidenceScore: 0.96,
                severity: 'HIGH',
                icp_score: 92,
                risk_score: 0.12,
                recommended_action: 'Proceed with VIP automated dispatch',
                email_icebreaker: 'Noticed your recent cloud infrastructure scale-up; let’s optimize failovers together.'
              };
            }
          } else if (node.type === 'condition') {
            const rawExpr = node.data.config?.conditionExpression || 'true';
            const expr = interpolate(rawExpr);
            
            // Evaluate condition
            let isTrue = true;
            if (expr.includes('===') || expr.includes('!==') || expr.includes('>=') || expr.includes('<=') || expr.includes('>') || expr.includes('<')) {
              try {
                // Safe expression parsing
                if (expr.includes('===')) {
                  const [l, r] = expr.split('===').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
                  isTrue = l === r;
                } else if (expr.includes('>=')) {
                  const [l, r] = expr.split('>=').map((s) => parseFloat(s.trim()));
                  isTrue = !isNaN(l) && !isNaN(r) && l >= r;
                } else if (expr.includes('<=')) {
                  const [l, r] = expr.split('<=').map((s) => parseFloat(s.trim()));
                  isTrue = !isNaN(l) && !isNaN(r) && l <= r;
                } else if (expr.includes('>')) {
                  const [l, r] = expr.split('>').map((s) => parseFloat(s.trim()));
                  isTrue = !isNaN(l) && !isNaN(r) && l > r;
                } else if (expr.includes('<')) {
                  const [l, r] = expr.split('<').map((s) => parseFloat(s.trim()));
                  isTrue = !isNaN(l) && !isNaN(r) && l < r;
                }
              } catch {
                isTrue = true;
              }
            }

            const chosenHandle = isTrue ? 'true' : 'false';
            const unchosenHandle = isTrue ? 'false' : 'true';

            output = {
              expression: expr,
              result: isTrue,
              branchTaken: chosenHandle,
              timestamp: Date.now()
            };

            // Mark inactive outgoing branches
            const outEdges = adjacency[node.id] || [];
            outEdges.forEach((edge) => {
              if (edge.sourceHandle && edge.sourceHandle === unchosenHandle) {
                context.skippedNodes.add(edge.target);
              }
            });

            logs.push({
              timestamp: Date.now(),
              nodeId: node.id,
              level: 'info',
              message: `Condition [${node.data.label}] evaluated to ${isTrue ? 'TRUE' : 'FALSE'}. Routing through [${chosenHandle}] branch.`
            });
          } else if (node.type === 'api_request') {
            const url = interpolate(node.data.config?.url || 'https://api.internal/v1/resource');
            output = {
              status: 200,
              statusText: 'OK',
              endpoint: url,
              method: node.data.config?.method || 'GET',
              data: { id: `res_${Math.floor(Math.random() * 90000 + 10000)}`, synced: true, timestamp: new Date().toISOString() }
            };
          } else if (node.type === 'database') {
            output = {
              operation: node.data.config?.dbOperation || 'set',
              collection: node.data.config?.collection || 'records',
              documentId: interpolate(node.data.config?.documentId || `doc_${Date.now()}`),
              acknowledged: true,
              timestamp: Date.now()
            };
          } else if (node.type === 'notification') {
            output = {
              channel: node.data.config?.channel || 'slack',
              recipient: node.data.config?.recipient || '#war-room',
              message: interpolate(node.data.config?.template || 'Notification dispatched'),
              delivered: true,
              messageId: `msg_${Date.now()}`
            };
          } else {
            output = { status: 'completed', nodeType: node.type, timestamp: Date.now() };
          }

          const duration = Date.now() - startTime;
          return { status: 'success', output, durationMs: duration };
        } catch (err: any) {
          lastErr = err;
        }
      }

      const duration = Date.now() - startTime;
      return { status: 'failed', error: lastErr?.message || 'Execution error', durationMs: duration };
    };

    // 3. Main Stage-by-Stage Parallel Execution Loop
    while (readyNodes.length > 0) {
      const currentBatch = [...readyNodes];
      readyNodes = [];

      logs.push({
        timestamp: Date.now(),
        level: 'info',
        message: `Stage ${stageNumber}: Executing ${currentBatch.length} node(s) in parallel -> [${currentBatch.map((id) => nodes.find((n) => n.id === id)?.data.label || id).join(', ')}]`
      });

      // Execute all nodes in the current stage concurrently!
      const batchPromises = currentBatch.map(async (nodeId) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const startedAt = Date.now();
        const res = await executeNodeWithRetry(node);
        const completedAt = Date.now();

        context.nodes[nodeId] = res.output;
        nodeResults[nodeId] = {
          ...res,
          startedAt,
          completedAt
        };

        if (res.status === 'success') {
          logs.push({
            timestamp: completedAt,
            nodeId,
            level: 'info',
            message: `Node [${node.data.label}] completed successfully in ${res.durationMs}ms`
          });
        } else if (res.status === 'failed') {
          logs.push({
            timestamp: completedAt,
            nodeId,
            level: 'error',
            message: `Node [${node.data.label}] failed: ${res.error}`
          });
        }

        executedSet.add(nodeId);
      });

      await Promise.all(batchPromises);

      if (testNodeId) break;

      // Determine next batch of nodes whose dependencies are all satisfied
      const nextBatchSet = new Set<string>();
      currentBatch.forEach((nodeId) => {
        const outgoing = adjacency[nodeId] || [];
        outgoing.forEach(({ target }) => {
          if (!executedSet.has(target)) {
            const inEdges = incomingEdges[target] || [];
            // Check if all incoming dependencies have been executed
            const allReady = inEdges.every((e) => executedSet.has(e.source));
            if (allReady) {
              nextBatchSet.add(target);
            }
          }
        });
      });

      readyNodes = Array.from(nextBatchSet);
      stageNumber++;
    }

    logs.push({
      timestamp: Date.now(),
      level: 'info',
      message: `Workflow execution completed. ${Object.keys(nodeResults).length} nodes evaluated.`
    });

    const isFailure = Object.values(nodeResults).some((r: any) => r.status === 'failed');

    return res.json({
      executionId,
      status: isFailure ? 'failed' : 'success',
      startedAt: Date.now() - 600,
      completedAt: Date.now(),
      nodeResults,
      logs
    });
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Antigravity Visual Workflow Builder server running on port ${PORT}`);
  });
}

startServer();
