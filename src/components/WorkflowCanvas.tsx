import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Zap,
  Globe,
  GitBranch,
  Database,
  Bell,
  Clock,
  Code2,
  LayoutGrid,
  Trash2,
  Play,
  RotateCcw
} from 'lucide-react';
import type { WorkflowNode, WorkflowEdge, NodeType } from '../types';
import { NodeCard } from './NodeCard';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onUpdateNodes: (nodes: WorkflowNode[]) => void;
  onUpdateEdges: (edges: WorkflowEdge[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onRunSingleNode: (nodeId: string) => void;
  onOpenNodePalette: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onUpdateNodes,
  onUpdateEdges,
  selectedNodeId,
  onSelectNode,
  onRunSingleNode,
  onOpenNodePalette,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connecting wire state
  const [connectingSource, setConnectingSource] = useState<{ nodeId: string; handleId: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle Canvas Pan (Mouse drag on background)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId) {
      const updatedNodes = nodes.map((node) => {
        if (node.id === draggingNodeId) {
          return {
            ...node,
            position: {
              x: Math.round((e.clientX - pan.x) / zoom - dragOffset.x),
              y: Math.round((e.clientY - pan.y) / zoom - dragOffset.y),
            },
          };
        }
        return node;
      });
      onUpdateNodes(updatedNodes);
    }

    if (connectingSource) {
      setMousePos({
        x: (e.clientX - pan.x) / zoom,
        y: (e.clientY - pan.y) / zoom,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Zoom control
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? Math.min(zoom * zoomFactor, 2.5) : Math.max(zoom / zoomFactor, 0.4);
    setZoom(newZoom);
  };

  // Start dragging a node
  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: (e.clientX - pan.x) / zoom - node.position.x,
      y: (e.clientY - pan.y) / zoom - node.position.y,
    });
    onSelectNode(nodeId);
  };

  // Delete a node and its edges
  const handleDeleteNode = (nodeId: string) => {
    onUpdateNodes(nodes.filter((n) => n.id !== nodeId));
    onUpdateEdges(edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) onSelectNode(null);
  };

  // Duplicate a node
  const handleDuplicateNode = (nodeId: string) => {
    const orig = nodes.find((n) => n.id === nodeId);
    if (!orig) return;
    const newId = `node_${Date.now()}`;
    const newNode: WorkflowNode = {
      ...orig,
      id: newId,
      position: { x: orig.position.x + 40, y: orig.position.y + 40 },
      data: {
        ...orig.data,
        label: `${orig.data.label} (Copy)`,
        status: 'idle',
      },
    };
    onUpdateNodes([...nodes, newNode]);
    onSelectNode(newId);
  };

  // Wire Connection: Start connection from port
  const handleStartConnection = (nodeId: string, handleId: string) => {
    if (!connectingSource) {
      // Start connecting
      setConnectingSource({ nodeId, handleId });
    } else {
      // Complete connection if valid target
      if (connectingSource.nodeId !== nodeId) {
        const edgeId = `edge_${connectingSource.nodeId}_${nodeId}_${Date.now()}`;
        const newEdge: WorkflowEdge = {
          id: edgeId,
          source: connectingSource.handleId === 'in' ? nodeId : connectingSource.nodeId,
          target: connectingSource.handleId === 'in' ? connectingSource.nodeId : nodeId,
          sourceHandle: connectingSource.handleId !== 'in' ? connectingSource.handleId : undefined,
          targetHandle: 'in',
          animated: true,
        };
        onUpdateEdges([...edges, newEdge]);
      }
      setConnectingSource(null);
    }
  };

  // Auto Layout algorithm (Tidy horizontal graph arrangement)
  const handleAutoLayout = () => {
    const levelMap: Record<string, number> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      levelMap[n.id] = 0;
    });

    edges.forEach((e) => {
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    });

    // Roots
    const queue = nodes.filter((n) => (inDegree[n.id] || 0) === 0).map((n) => n.id);
    if (queue.length === 0 && nodes.length > 0) queue.push(nodes[0].id);

    const visited = new Set<string>();
    while (queue.length > 0) {
      const curr = queue.shift()!;
      visited.add(curr);
      const currentLevel = levelMap[curr] || 0;

      const outgoing = edges.filter((e) => e.source === curr).map((e) => e.target);
      outgoing.forEach((targetId) => {
        levelMap[targetId] = Math.max(levelMap[targetId] || 0, currentLevel + 1);
        if (!visited.has(targetId)) queue.push(targetId);
      });
    }

    // Group by level
    const levelGroups: Record<number, string[]> = {};
    nodes.forEach((n) => {
      const lvl = levelMap[n.id] || 0;
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(n.id);
    });

    // Assign positions
    const updatedNodes = nodes.map((node) => {
      const lvl = levelMap[node.id] || 0;
      const group = levelGroups[lvl] || [node.id];
      const indexInGroup = group.indexOf(node.id);
      return {
        ...node,
        position: {
          x: 80 + lvl * 360,
          y: 100 + indexInGroup * 200,
        },
      };
    });

    onUpdateNodes(updatedNodes);
    setPan({ x: 50, y: 50 });
    setZoom(1);
  };

  // Reset View to fit
  const handleFitView = () => {
    if (nodes.length === 0) {
      setPan({ x: 40, y: 40 });
      setZoom(1);
      return;
    }
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    setPan({ x: -minX + 60, y: -minY + 60 });
    setZoom(0.95);
  };

  // Calculate Bezier Curve path between nodes
  const calculatePath = (edge: WorkflowEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return '';

    const sourceWidth = 288; // 72 * 4 (w-72)
    const sourceHeight = 130;
    const targetHeight = 130;

    let sx = sourceNode.position.x + sourceWidth;
    let sy = sourceNode.position.y + sourceHeight / 2;

    if (edge.sourceHandle === 'true') {
      sy = sourceNode.position.y + sourceHeight * 0.33;
    } else if (edge.sourceHandle === 'false') {
      sy = sourceNode.position.y + sourceHeight * 0.66;
    }

    const tx = targetNode.position.x;
    const ty = targetNode.position.y + targetHeight / 2;

    const dx = Math.abs(tx - sx) * 0.5;
    return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
  };

  return (
    <div
      id="workflow-canvas-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative flex-1 h-full w-full bg-[#0e1017] overflow-hidden select-none cursor-crosshair"
      style={{
        backgroundImage: `radial-gradient(#252a3a 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Interactive Transform Layer */}
      <div
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '100%',
          height: '100%',
        }}
      >
        {/* SVG Edges and Connectors */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-auto overflow-visible">
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7BCDFF" />
              <stop offset="100%" stopColor="#FFB7EF" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rendered Workflow Edges */}
          {edges.map((edge) => {
            const d = calculatePath(edge);
            if (!d) return null;
            const isConditionTrue = edge.sourceHandle === 'true';
            const isConditionFalse = edge.sourceHandle === 'false';
            const strokeColor = isConditionTrue
              ? '#00E676'
              : isConditionFalse
              ? '#FF5252'
              : 'url(#edge-gradient)';

            return (
              <g key={edge.id} className="group/edge cursor-pointer">
                {/* Thick background path for easy click/hover */}
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={14}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateEdges(edges.filter((ed) => ed.id !== edge.id));
                  }}
                />
                {/* Animated visible Bezier path */}
                <path
                  d={d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  strokeDasharray={edge.animated ? '6 4' : undefined}
                  className={edge.animated ? 'animate-[dash_1s_linear_infinite]' : ''}
                  filter="url(#glow)"
                />
                {/* Edge branch label */}
                {edge.label && (
                  <text
                    className="text-[10px] font-mono fill-[#c3c8db] select-none"
                    textAnchor="middle"
                  >
                    <textPath href={`#${edge.id}`} startOffset="50%">
                      {edge.label}
                    </textPath>
                  </text>
                )}
              </g>
            );
          })}

          {/* In-progress connecting wire */}
          {connectingSource && (
            <path
              d={`M ${
                (nodes.find((n) => n.id === connectingSource.nodeId)?.position.x || 0) + 288
              } ${
                (nodes.find((n) => n.id === connectingSource.nodeId)?.position.y || 0) + 65
              } C ${
                (nodes.find((n) => n.id === connectingSource.nodeId)?.position.x || 0) + 380
              } ${
                (nodes.find((n) => n.id === connectingSource.nodeId)?.position.y || 0) + 65
              }, ${mousePos.x - 100} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
              fill="none"
              stroke="#7BCDFF"
              strokeWidth={2.5}
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* Rendered Workflow Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            onMouseDown={(e) => handleNodeDragStart(node.id, e)}
            className="absolute pointer-events-auto"
            style={{
              transform: `translate(${node.position.x}px, ${node.position.y}px)`,
            }}
          >
            <NodeCard
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={(id) => onSelectNode(id)}
              onDelete={(id) => handleDeleteNode(id)}
              onDuplicate={(id) => handleDuplicateNode(id)}
              onRunSingle={(id) => onRunSingleNode(id)}
              onStartConnection={(nodeId, handleId) => handleStartConnection(nodeId, handleId)}
              isConnecting={!!connectingSource}
            />
          </div>
        ))}
      </div>

      {/* Floating Canvas Action Bar (Bottom Right) */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 bg-[#141722]/90 backdrop-blur-md p-1 rounded-xl border border-[#272d3e] shadow-2xl text-xs z-20">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.2, 2.5))}
          className="p-2 rounded-lg text-[#8e93a6] hover:text-white hover:bg-[#202638] transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.2, 0.4))}
          className="p-2 rounded-lg text-[#8e93a6] hover:text-white hover:bg-[#202638] transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitView}
          className="p-2 rounded-lg text-[#8e93a6] hover:text-white hover:bg-[#202638] transition"
          title="Fit to View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#272d3e]" />
        <button
          onClick={handleAutoLayout}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#202638] hover:bg-[#2a324a] text-[#7BCDFF] font-medium transition"
          title="Auto-Arrange Layout (DAG)"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Auto Layout</span>
        </button>
      </div>

      {/* Floating Add Node Palette Button (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
        <button
          id="btn-add-node-palette"
          onClick={onOpenNodePalette}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#7BCDFF] text-[#0d1017] font-semibold text-xs shadow-lg shadow-[#7BCDFF]/20 hover:bg-[#8fd5ff] active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Node</span>
        </button>

        {connectingSource && (
          <div className="px-3 py-1.5 rounded-lg bg-[#1e2434] border border-[#7BCDFF] text-[#7BCDFF] text-xs font-medium flex items-center space-x-2 animate-pulse">
            <span>Connecting... Click target node's input pin</span>
            <button
              onClick={() => setConnectingSource(null)}
              className="text-[#FF5252] hover:underline text-[10px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
