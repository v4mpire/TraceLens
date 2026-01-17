import { GraphExporter, ExportOptions, GraphState } from '../graph-exporter';

// Mock DOM APIs
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
});

Object.defineProperty(window, 'XMLSerializer', {
  value: class {
    serializeToString = jest.fn(() => '<svg></svg>');
  }
});

// Mock canvas
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    drawImage: jest.fn()
  }))
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: jest.fn((callback) => {
    callback(new Blob(['mock'], { type: 'image/png' }));
  })
});

describe('GraphExporter', () => {
  let mockSvg: SVGSVGElement;
  let exporter: GraphExporter;

  beforeEach(() => {
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvg.setAttribute('width', '800');
    mockSvg.setAttribute('height', '600');
    
    // Mock cloneNode
    mockSvg.cloneNode = jest.fn(() => mockSvg);
    
    exporter = new GraphExporter(mockSvg);
  });

  describe('exportAsPNG', () => {
    it('exports PNG with default options', async () => {
      const blob = await exporter.exportAsPNG();
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('');
    });

    it('exports PNG with custom options', async () => {
      const options: ExportOptions = {
        format: 'png',
        width: 1200,
        height: 800,
        quality: 0.8
      };
      
      const blob = await exporter.exportAsPNG(options);
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('exportAsSVG', () => {
    it('exports SVG with default options', () => {
      const blob = exporter.exportAsSVG();
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/svg+xml');
    });

    it('exports SVG with metadata', () => {
      const options: ExportOptions = {
        format: 'svg',
        includeMetadata: true
      };
      
      const blob = exporter.exportAsSVG(options);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/svg+xml');
    });
  });

  describe('exportAsJSON', () => {
    it('exports graph state as JSON', () => {
      const graphState: GraphState = {
        nodes: [{ id: '1', name: 'Test' }],
        links: [],
        transform: { x: 0, y: 0, k: 1 }
      };
      
      const blob = exporter.exportAsJSON(graphState);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });
  });

  describe('generateShareableURL', () => {
    it('generates valid shareable URL', () => {
      const graphState: GraphState = {
        nodes: [{ id: '1', name: 'Test' }],
        links: []
      };
      
      const url = exporter.generateShareableURL(graphState, 'https://example.com');
      
      expect(url).toContain('https://example.com/shared-graph?');
      expect(url).toContain('state=');
      expect(url).toContain('v=1');
    });
  });

  describe('parseShareableURL', () => {
    it('parses valid shareable URL', () => {
      const originalState: GraphState = {
        nodes: [{ id: '1', name: 'Test' }],
        links: []
      };
      
      const url = exporter.generateShareableURL(originalState, 'https://example.com');
      const parsedState = exporter.parseShareableURL(url);
      
      expect(parsedState).toEqual(originalState);
    });

    it('returns null for invalid URL', () => {
      const result = exporter.parseShareableURL('invalid-url');
      
      expect(result).toBeNull();
    });
  });

  describe('layout preferences', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });
    });

    it('saves layout preferences', () => {
      const preferences = { zoom: 1.5, position: { x: 100, y: 200 } };
      
      exporter.saveLayoutPreferences('test-layout', preferences);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'tracelens_layout_test-layout',
        expect.stringContaining('"zoom":1.5')
      );
    });

    it('loads layout preferences', () => {
      const mockPreferences = { zoom: 1.5, savedAt: '2023-01-01T00:00:00.000Z' };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockPreferences));
      
      const result = exporter.loadLayoutPreferences('test-layout');
      
      expect(result).toEqual(mockPreferences);
      expect(localStorage.getItem).toHaveBeenCalledWith('tracelens_layout_test-layout');
    });

    it('returns null for non-existent preferences', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const result = exporter.loadLayoutPreferences('non-existent');
      
      expect(result).toBeNull();
    });
  });
});
