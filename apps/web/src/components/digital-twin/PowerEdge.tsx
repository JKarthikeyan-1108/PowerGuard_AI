import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export const PowerEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  animated,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Background track edge */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, stroke: '#334155', strokeWidth: 2, strokeOpacity: 0.5 }} 
      />
      
      {/* Foreground animated edge for active power flow */}
      {animated && (
        <BaseEdge
          path={edgePath}
          style={{
            ...style,
            stroke: '#10b981', // Emerald 500
            strokeWidth: 2,
            strokeDasharray: '8 6',
            animation: 'flow 1s linear infinite',
          }}
        />
      )}
      
      {/* Inline styles for the animation keyframes since tailwind doesn't natively do stroke-dashoffset well */}
      <style>
        {`
          @keyframes flow {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
    </>
  );
};
