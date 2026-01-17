'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PerformanceMetric {
  timestamp: number;
  metric: string;
  value: number;
  threshold?: number;
}

interface PerformanceChartProps {
  data: PerformanceMetric[];
  width?: number;
  height?: number;
  metric: string;
}

export default function PerformanceChart({ 
  data, 
  width = 600, 
  height = 300,
  metric 
}: PerformanceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([innerHeight, 0]);

    // Line generator
    const line = d3.line<PerformanceMetric>()
      .x(d => xScale(new Date(d.timestamp)))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M') as any));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d.timestamp)))
      .attr('cy', d => yScale(d.value))
      .attr('r', 3)
      .attr('fill', '#3b82f6');

    // Add threshold line if provided
    const threshold = data[0]?.threshold;
    if (threshold) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(threshold))
        .attr('y2', yScale(threshold))
        .attr('stroke', '#ef4444')
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 2);
    }

    // Add labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(metric);

  }, [data, width, height, metric]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="border border-gray-200 rounded-lg"
    />
  );
}
