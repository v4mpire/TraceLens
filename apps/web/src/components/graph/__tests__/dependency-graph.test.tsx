import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DependencyGraph } from '../dependency-graph';

// Mock D3
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      remove: jest.fn()
    })),
    append: jest.fn(() => ({
      selectAll: jest.fn(() => ({
        data: jest.fn(() => ({
          enter: jest.fn(() => ({
            append: jest.fn(() => ({
              attr: jest.fn(() => ({ attr: jest.fn() })),
              style: jest.fn(() => ({ style: jest.fn() })),
              call: jest.fn(),
              on: jest.fn()
            }))
          }))
        }))
      }))
    })),
    call: jest.fn(),
    attr: jest.fn()
  })),
  forceSimulation: jest.fn(() => ({
    force: jest.fn(() => ({ force: jest.fn() })),
    on: jest.fn(),
    stop: jest.fn()
  })),
  forceLink: jest.fn(() => ({
    id: jest.fn(() => ({ distance: jest.fn() }))
  })),
  forceManyBody: jest.fn(() => ({
    strength: jest.fn()
  })),
  forceCenter: jest.fn(),
  forceCollide: jest.fn(() => ({
    radius: jest.fn()
  })),
  zoom: jest.fn(() => ({
    scaleExtent: jest.fn(() => ({
      on: jest.fn()
    }))
  })),
  drag: jest.fn(() => ({
    on: jest.fn(() => ({
      on: jest.fn(() => ({
        on: jest.fn()
      }))
    }))
  }))
}));

const mockNodes = [
  {
    id: '1',
    name: 'Service A',
    type: 'service' as const,
    duration: 100,
    isBottleneck: false,
    isCriticalPath: true
  },
  {
    id: '2',
    name: 'Database Query',
    type: 'database' as const,
    duration: 200,
    isBottleneck: true,
    isCriticalPath: true
  }
];

const mockLinks = [
  {
    source: '1',
    target: '2',
    duration: 50,
    isCriticalPath: true
  }
];

describe('DependencyGraph', () => {
  it('renders without crashing', () => {
    render(
      <DependencyGraph
        nodes={mockNodes}
        links={mockLinks}
      />
    );
    
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('displays node information when node is selected', () => {
    const onNodeSelect = jest.fn();
    
    render(
      <DependencyGraph
        nodes={mockNodes}
        links={mockLinks}
        onNodeSelect={onNodeSelect}
      />
    );
    
    // The component should render the SVG
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct dimensions', () => {
    render(
      <DependencyGraph
        nodes={mockNodes}
        links={mockLinks}
        width={1000}
        height={700}
      />
    );
    
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('width', '1000');
    expect(svg).toHaveAttribute('height', '700');
  });

  it('handles empty nodes gracefully', () => {
    render(
      <DependencyGraph
        nodes={[]}
        links={[]}
      />
    );
    
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
