'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { AreaNode, TransformerNode, MeterNode } from './NodeComponents';
import { PowerEdge } from './PowerEdge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Activity, ZapOff, CheckCircle2 } from 'lucide-react';

const nodeTypes = {
  area: AreaNode,
  transformer: TransformerNode,
  meter: MeterNode,
};

const edgeTypes = {
  powerEdge: PowerEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 200 });

  nodes.forEach((node) => {
    // Hardcode dimensions for dagre layout calculations based on custom node sizes
    const width = node.type === 'meter' ? 160 : node.type === 'transformer' ? 200 : 180;
    const height = 80;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = { ...node };

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    const width = node.type === 'meter' ? 160 : node.type === 'transformer' ? 200 : 180;
    const height = 80;
    newNode.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

interface DigitalTwinCanvasProps {
  topology: { nodes: any[]; edges: any[] } | null;
  loading: boolean;
  liveReadingEvents: any[]; // Stream of recent readings to flash nodes
  liveAlertEvents: any[];   // Stream of recent alerts to pulse nodes
}

export const DigitalTwinCanvas = ({ topology, loading, liveReadingEvents, liveAlertEvents }: DigitalTwinCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Apply layout when topology changes
  useEffect(() => {
    if (topology && topology.nodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        topology.nodes,
        topology.edges
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    }
  }, [topology, setNodes, setEdges]);

  // Handle Live Telemetry Flashes
  useEffect(() => {
    if (!liveReadingEvents.length) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'meter') {
          // Check if this meter has a new reading in the current batch
          const recentReading = liveReadingEvents.find(r => r.meterId.includes(node.id.replace('meter_', '')));
          
          if (recentReading) {
            // Update node data to trigger flash animation and update live power
            return {
              ...node,
              data: {
                ...node.data,
                recentlyUpdated: true,
                currentPower: recentReading.value,
              }
            };
          }
        }
        
        // Remove flash if no recent update
        if (node.data.recentlyUpdated) {
          return {
            ...node,
            data: { ...node.data, recentlyUpdated: false }
          };
        }
        
        return node;
      })
    );

    // Timeout to turn off flash effect
    const timer = setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.data.recentlyUpdated) {
            return { ...n, data: { ...n.data, recentlyUpdated: false } };
          }
          return n;
        })
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [liveReadingEvents, setNodes]);

  // Handle Live Alerts
  useEffect(() => {
    if (!liveAlertEvents.length) return;
    
    // An actual implementation would map alert.meterId to a node and set status to FAULTY
    // For now we rely on backend state refresh if needed, or implement complex state updates here.
  }, [liveAlertEvents]);

  // Stats calculation
  const stats = useMemo(() => {
    let online = 0, offline = 0, faulty = 0;
    nodes.forEach(n => {
      if (n.type === 'meter') {
        if (n.data.status === 'ACTIVE') online++;
        else if (n.data.status === 'INACTIVE') offline++;
        else faulty++;
      }
    });
    return { online, offline, faulty };
  }, [nodes]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 rounded-lg border border-slate-800">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-slate-400">Constructing Digital Twin Topology...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        className="digital-twin-canvas"
      >
        <Background color="#1e293b" gap={24} size={2} />
        <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />
        
        <Panel position="top-left" className="m-4">
          <Card className="bg-slate-900/90 border-slate-700 backdrop-blur">
            <CardContent className="p-4 py-3 flex gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Online</span>
                  <span className="font-bold text-sm text-slate-200">{stats.online}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ZapOff className="h-4 w-4 text-slate-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Offline</span>
                  <span className="font-bold text-sm text-slate-200">{stats.offline}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Faulty</span>
                  <span className="font-bold text-sm text-slate-200">{stats.faulty}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
};
