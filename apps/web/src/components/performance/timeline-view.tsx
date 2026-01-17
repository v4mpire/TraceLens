import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TimelineEvent {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  type: 'service' | 'database' | 'external' | 'function';
  isBottleneck: boolean;
  isCriticalPath: boolean;
  lane: number;
}

interface TimelineViewProps {
  events: TimelineEvent[];
  totalDuration: number;
  onEventSelect?: (event: TimelineEvent) => void;
  width?: number;
  height?: number;
  className?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  totalDuration,
  onEventSelect,
  width = 800,
  height = 400,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !events.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const container = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, totalDuration])
      .range([0, innerWidth]);

    const maxLane = Math.max(...events.map(e => e.lane));
    const laneHeight = innerHeight / (maxLane + 1);

    // Color scale
    const getEventColor = (event: TimelineEvent) => {
      if (event.isCriticalPath) return '#ef4444';
      if (event.isBottleneck) return '#f59e0b';
      switch (event.type) {
        case 'service': return '#3b82f6';
        case 'database': return '#10b981';
        case 'external': return '#8b5cf6';
        case 'function': return '#6b7280';
        default: return '#6b7280';
      }
    };

    // Draw timeline bars
    const bars = container.selectAll('.timeline-bar')
      .data(events)
      .enter().append('g')
      .attr('class', 'timeline-bar')
      .style('cursor', 'pointer')
      .on('click', (event, d) => onEventSelect?.(d));

    // Bar rectangles
    bars.append('rect')
      .attr('x', d => xScale(d.startTime))
      .attr('y', d => d.lane * laneHeight + laneHeight * 0.1)
      .attr('width', d => Math.max(2, xScale(d.endTime - d.startTime)))
      .attr('height', laneHeight * 0.8)
      .attr('fill', getEventColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('rx', 3);

    // Bar labels
    bars.append('text')
      .attr('x', d => xScale(d.startTime) + 5)
      .attr('y', d => d.lane * laneHeight + laneHeight * 0.5)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .text(d => {
        const barWidth = xScale(d.endTime - d.startTime);
        if (barWidth < 50) return '';
        return d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name;
      });

    // Duration labels
    bars.append('text')
      .attr('x', d => xScale(d.endTime) + 5)
      .attr('y', d => d.lane * laneHeight + laneHeight * 0.5)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', '#6b7280')
      .text(d => `${d.endTime - d.startTime}ms`);

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d}ms`)
      .ticks(10);

    container.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    // Lane labels
    const uniqueLanes = [...new Set(events.map(e => e.lane))].sort((a, b) => a - b);
    container.selectAll('.lane-label')
      .data(uniqueLanes)
      .enter().append('text')
      .attr('class', 'lane-label')
      .attr('x', -10)
      .attr('y', d => d * laneHeight + laneHeight * 0.5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .text(d => `Lane ${d + 1}`);

    // Critical path indicator
    const criticalPathEvents = events.filter(e => e.isCriticalPath);
    if (criticalPathEvents.length > 1) {
      const pathLine = d3.line<TimelineEvent>()
        .x(d => xScale((d.startTime + d.endTime) / 2))
        .y(d => d.lane * laneHeight + laneHeight * 0.5)
        .curve(d3.curveMonotoneX);

      container.append('path')
        .datum(criticalPathEvents.sort((a, b) => a.startTime - b.startTime))
        .attr('d', pathLine)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('fill', 'none')
        .attr('opacity', 0.7);
    }

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        
        // Update bars
        bars.select('rect')
          .attr('x', d => newXScale(d.startTime))
          .attr('width', d => Math.max(2, newXScale(d.endTime - d.startTime)));

        bars.select('text')
          .attr('x', d => newXScale(d.startTime) + 5);

        // Update axis
        const xAxisGroup = container.select('.x-axis') as d3.Selection<SVGGElement, unknown, null, undefined>;
        if (!xAxisGroup.empty()) {
          xAxisGroup.call(d3.axisBottom(newXScale).tickFormat(d => `${d}ms`) as any);
        }
      });

    svg.call(zoom);

  }, [events, totalDuration, width, height, onEventSelect]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Performance Timeline</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Critical Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Bottleneck</span>
          </div>
          <div className="text-gray-500">
            Total: {totalDuration}ms
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="border border-gray-200 rounded"
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Scroll to zoom horizontally • Click events for details
      </div>
    </div>
  );
};
