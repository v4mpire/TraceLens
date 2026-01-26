'use client';

import { useState, useEffect, useRef } from 'react';
import { dashboardClient } from '../../lib/api/dashboard-client';

interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface RealTimeChartProps {
  title: string;
  metric: string;
  maxDataPoints?: number;
  refreshInterval?: number;
  height?: number;
  className?: string;
}

export default function RealTimeChart({
  title,
  metric,
  maxDataPoints = 20,
  refreshInterval = 5000,
  height = 200,
  className = '',
}: RealTimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Generate sample data point
  const generateDataPoint = (): DataPoint => ({
    timestamp: Date.now(),
    value: Math.random() * 100 + 50, // Random value between 50-150
    label: new Date().toLocaleTimeString(),
  });

  // Fetch real-time data
  const fetchData = async () => {
    try {
      // Try to get real metrics, fallback to generated data
      const metrics = await dashboardClient.getMetrics();
      const newPoint: DataPoint = {
        timestamp: Date.now(),
        value: metrics.responseTime.current,
        label: new Date().toLocaleTimeString(),
      };

      setData(prevData => {
        const newData = [...prevData, newPoint];
        return newData.slice(-maxDataPoints);
      });
    } catch (error) {
      // Fallback to generated data
      const newPoint = generateDataPoint();
      setData(prevData => {
        const newData = [...prevData, newPoint];
        return newData.slice(-maxDataPoints);
      });
    } finally {
      setLoading(false);
    }
  };

  // Draw chart on canvas
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: canvasHeight } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Set up styling
    const isDark = document.documentElement.classList.contains('dark');
    const lineColor = isDark ? '#60a5fa' : '#3b82f6'; // blue-400 / blue-500
    const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 / gray-200
    const textColor = isDark ? '#d1d5db' : '#374151'; // gray-300 / gray-700

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;
    const padding = 40;

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * (canvasHeight - 2 * padding)) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i * (width - 2 * padding)) / 4;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvasHeight - padding);
      ctx.stroke();
    }

    // Draw data line
    if (data.length > 1) {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (maxDataPoints - 1);
        const y = canvasHeight - padding - ((point.value - minValue) / valueRange) * (canvasHeight - 2 * padding);

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw data points
      ctx.fillStyle = lineColor;
      data.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (maxDataPoints - 1);
        const y = canvasHeight - padding - ((point.value - minValue) / valueRange) * (canvasHeight - 2 * padding);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw labels
    ctx.fillStyle = textColor;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Y-axis labels
    if (ctx) {
      for (let i = 0; i <= 4; i++) {
        const value = minValue + (i * valueRange) / 4;
        const y = canvasHeight - padding - (i * (canvasHeight - 2 * padding)) / 4;
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
      }
    }

    // Current value
    if (data.length > 0 && ctx) {
      const lastDataPoint = data[data.length - 1];
      if (lastDataPoint) {
        const currentValue = lastDataPoint.value;
        ctx.textAlign = 'left';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText(`${Math.round(currentValue)} ${metric}`, padding, 20);
      }
    }
  };

  // Animation loop
  const animate = () => {
    drawChart();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Set up interval for data updates
    const interval = setInterval(fetchData, refreshInterval);

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [refreshInterval]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            Loading...
          </div>
        )}
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px` }}
          className="border border-border rounded-lg bg-card"
        />
        
        {data.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Last {data.length} data points</span>
        <span>Updates every {refreshInterval / 1000}s</span>
      </div>
    </div>
  );
}
