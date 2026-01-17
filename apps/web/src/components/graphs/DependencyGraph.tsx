'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  name: string;
  type: 'service' | 'database' | 'external' | 'function';
  duration?: number;
  critical?: boolean;
}

interface Link {
  source: string;
  target: string;
  duration: number;
}

interface DependencyGraphProps {
  nodes: Node[];
  links: Link[];
  width?: number;
  height?: number;
}

export default function DependencyGraph({ 
  nodes, 
  links, 
  width = 800, 
  height = 600 
}: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.duration / 10));

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d) => d.critical ? 12 : 8)
      .attr('fill', (d) => {
        switch (d.type) {
          case 'service': return d.critical ? '#ef4444' : '#3b82f6';
          case 'database': return '#10b981';
          case 'external': return '#f59e0b';
          case 'function': return '#8b5cf6';
          default: return '#6b7280';
        }
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedNode(d))
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d) => d.name)
      .attr('font-size', 12)
      .attr('dx', 15)
      .attr('dy', 4);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg"
      />
      
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
          <h4 className="font-semibold">{selectedNode.name}</h4>
          <p className="text-sm text-gray-600">Type: {selectedNode.type}</p>
          {selectedNode.duration && (
            <p className="text-sm text-gray-600">Duration: {selectedNode.duration}ms</p>
          )}
          {selectedNode.critical && (
            <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
              Critical Path
            </span>
          )}
        </div>
      )}
    </div>
  );
}
