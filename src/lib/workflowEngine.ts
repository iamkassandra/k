import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowExecutionRecord } from '../types';

export interface ExecutionContext {
  triggerPayload: any;
  env: Record<string, string>;
  nodeOutputs: Record<string, any>;
  nodeStatus: Record<string, 'idle' | 'running' | 'success' | 'failed' | 'skipped'>;
  nodeErrors: Record<string, string>;
  activeBranches: Set<string>; // 'nodeId:handleId'
  skippedNodes: Set<string>;
}

export interface ParallelStage {
  stageIndex: number;
  nodeIds: string[];
}

/**
 * Safely interpolates {{variables}} and {{node_id.output.path}} in templates or strings
 */
export function interpolateString(template: string, context: ExecutionContext): string {
  if (!template || typeof template !== 'string') return template;

  return template.replace(/\{\{([\s\S]+?)\}\}/g, (_, expression) => {
    const trimmed = expression.trim();

    // 1. Check environment / global variables
    if (context.env && trimmed in context.env) {
      return String(context.env[trimmed]);
    }

    // 2. Check trigger input: $input or trigger
    if (trimmed.startsWith('$input.') || trimmed.startsWith('trigger.')) {
      const path = trimmed.replace(/^(\$input\.|trigger\.)/, '');
      const val = getDeepValue(context.triggerPayload, path);
      return typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
    }

    // 3. Check node output: node_1.output.field
    const nodeMatch = trimmed.match(/^(node_[a-zA-Z0-9_-]+)\.output(?:\.(.+))?$/);
    if (nodeMatch) {
      const nodeId = nodeMatch[1];
      const fieldPath = nodeMatch[2];
      const nodeOut = context.nodeOutputs[nodeId];
      if (nodeOut === undefined) return '';
      if (!fieldPath) {
        return typeof nodeOut === 'object' ? JSON.stringify(nodeOut) : String(nodeOut);
      }
      const val = getDeepValue(nodeOut, fieldPath);
      return typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
    }

    // 4. Default evaluation fallback
    return '';
  });
}

function getDeepValue(obj: any, path: string): any {
  if (!obj || !path) return obj;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

/**
 * Evaluates condition expression safely against execution context
 */
export function evaluateConditionExpression(
  expression: string,
  context: ExecutionContext
): boolean {
  if (!expression || !expression.trim()) return true;

  const interpolated = interpolateString(expression, context);
  const trimmed = interpolated.trim();

  // Handle explicit keywords
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // Basic comparison evaluator
  try {
    // Check comparison operators
    if (trimmed.includes('===')) {
      const [left, right] = trimmed.split('===').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
      return left === right;
    }
    if (trimmed.includes('!==')) {
      const [left, right] = trimmed.split('!==').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
      return left !== right;
    }
    if (trimmed.includes('>=')) {
      const [left, right] = trimmed.split('>=').map((s) => parseFloat(s.trim()));
      return !isNaN(left) && !isNaN(right) && left >= right;
    }
    if (trimmed.includes('<=')) {
      const [left, right] = trimmed.split('<=').map((s) => parseFloat(s.trim()));
      return !isNaN(left) && !isNaN(right) && left <= right;
    }
    if (trimmed.includes('>')) {
      const [left, right] = trimmed.split('>').map((s) => parseFloat(s.trim()));
      return !isNaN(left) && !isNaN(right) && left > right;
    }
    if (trimmed.includes('<')) {
      const [left, right] = trimmed.split('<').map((s) => parseFloat(s.trim()));
      return !isNaN(left) && !isNaN(right) && left < right;
    }

    // Default boolean coercion
    return Boolean(trimmed && trimmed !== '0' && trimmed !== 'null' && trimmed !== 'undefined');
  } catch (err) {
    console.warn('Condition expression evaluation error:', err);
    return false;
  }
}

/**
 * Analyzes DAG graph topology, checks for cycles, and organizes nodes into parallel execution stages
 */
export function buildParallelExecutionStages(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): { stages: ParallelStage[]; hasCycle: boolean; error?: string } {
  const nodeMap = new Map<string, WorkflowNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  });

  edges.forEach((edge) => {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      adjacency.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  const stages: ParallelStage[] = [];
  const inDegreeCopy = new Map(inDegree);
  let processedCount = 0;

  // Queue roots (nodes with 0 incoming dependencies)
  let currentStageNodes = nodes
    .filter((n) => inDegreeCopy.get(n.id) === 0)
    .map((n) => n.id);

  if (currentStageNodes.length === 0 && nodes.length > 0) {
    // If no explicit root, fallback to first node
    currentStageNodes = [nodes[0].id];
  }

  let stageIndex = 0;
  while (currentStageNodes.length > 0) {
    stages.push({
      stageIndex,
      nodeIds: currentStageNodes,
    });
    processedCount += currentStageNodes.length;

    const nextStageSet = new Set<string>();
    currentStageNodes.forEach((nodeId) => {
      const neighbors = adjacency.get(nodeId) || [];
      neighbors.forEach((targetId) => {
        const currentDeg = inDegreeCopy.get(targetId) || 1;
        const newDeg = currentDeg - 1;
        inDegreeCopy.set(targetId, newDeg);
        if (newDeg === 0) {
          nextStageSet.add(targetId);
        }
      });
    });

    currentStageNodes = Array.from(nextStageSet);
    stageIndex++;
  }

  const hasCycle = processedCount < nodes.length;
  return {
    stages,
    hasCycle,
    error: hasCycle ? 'Graph contains circular dependencies or unresolvable loops.' : undefined,
  };
}

/**
 * Validates the full workflow definition
 */
export function validateWorkflowDefinition(workflow: Workflow): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push('Workflow must contain at least one node.');
    return { isValid: false, errors, warnings };
  }

  const hasTrigger = workflow.nodes.some((n) => n.type === 'trigger');
  if (!hasTrigger) {
    warnings.push('Workflow does not have an entry Trigger node.');
  }

  const { hasCycle } = buildParallelExecutionStages(workflow.nodes, workflow.edges || []);
  if (hasCycle) {
    errors.push('Cyclic dependency detected in workflow edges.');
  }

  // Check dangling edges
  const nodeIds = new Set(workflow.nodes.map((n) => n.id));
  (workflow.edges || []).forEach((e) => {
    if (!nodeIds.has(e.source)) {
      errors.push(`Edge ${e.id} references non-existent source node "${e.source}".`);
    }
    if (!nodeIds.has(e.target)) {
      errors.push(`Edge ${e.id} references non-existent target node "${e.target}".`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
