import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'service' | 'database' | 'external' | 'function';
  duration: number;
  isBottleneck: boolean;
  isCriticalPath: boolean;
}

interface Link {
  source: string;
  target: string;
  duration: number;
  isCriticalPath: boolean;
}

interface DependencyGraphProps {
  nodes: Node[];
  links: Link[];
  onNodeSelect?: (node: Node) => void;
  highlightCriticalPath?: boolean;
  width?: number;
  height?: number;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  nodes,
  links,
  onNodeSelect,
  highlightCriticalPath = false,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => d.isCriticalPath && highlightCriticalPath ? '#ef4444' : '#6b7280')
      .attr('stroke-width', d => d.isCriticalPath && highlightCriticalPath ? 3 : 1)
      .attr('stroke-opacity', 0.6);

    // Create nodes
    const node = container.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.isBottleneck ? 12 : 8)
      .attr('fill', d => {
        if (d.isCriticalPath && highlightCriticalPath) return '#ef4444';
        if (d.isBottleneck) return '#f59e0b';
        switch (d.type) {
          case 'service': return '#3b82f6';
          case 'database': return '#10b981';
          case 'external': return '#8b5cf6';
          case 'function': return '#6b7280';
          default: return '#6b7280';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d);
        onNodeSelect?.(d);
      });

    // Add labels
    const labels = container.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .attr('dy', -15)
      .style('pointer-events', 'none');

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

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, highlightCriticalPath, width, height, onNodeSelect]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-white"
      />
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{selectedNode.type}</p>
          <p className="text-sm">Duration: {selectedNode.duration}ms</p>
          {selectedNode.isBottleneck && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-2">
              Bottleneck
            </span>
          )}
          {selectedNode.isCriticalPath && (
            <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-2 ml-1">
              Critical Path
            </span>
          )}
        </div>
      )}
    </div>
  );
};
