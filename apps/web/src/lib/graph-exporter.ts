// Graph export utilities for TraceLens dependency graphs

export interface ExportOptions {
  format?: 'png' | 'svg' | 'json';
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeMetadata?: boolean;
  quality?: number; // For PNG exports (0-1)
}

export interface GraphState {
  nodes: any[];
  links: any[];
  transform?: {
    x: number;
    y: number;
    k: number;
  };
  selectedNodes?: string[];
  highlightCriticalPath?: boolean;
  filters?: {
    [key: string]: any;
  };
}

export class GraphExporter {
  private svgElement: SVGSVGElement;

  constructor(svgElement: SVGSVGElement) {
    this.svgElement = svgElement;
  }

  /**
   * Export graph as PNG image
   */
  async exportAsPNG(options: ExportOptions = {}): Promise<Blob> {
    const {
      width = 1200,
      height = 800,
      backgroundColor = '#ffffff',
      quality = 1.0
    } = options;

    // Create a clone of the SVG with proper styling
    const svgClone = this.prepareSVGForExport(width, height, backgroundColor);
    
    // Convert SVG to canvas
    const canvas = await this.svgToCanvas(svgClone, width, height);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', quality);
    });
  }

  /**
   * Export graph as SVG
   */
  exportAsSVG(options: ExportOptions = {}): Blob {
    const {
      width = 1200,
      height = 800,
      backgroundColor = '#ffffff',
      includeMetadata = true
    } = options;

    const svgClone = this.prepareSVGForExport(width, height, backgroundColor);
    
    if (includeMetadata) {
      this.addMetadataToSVG(svgClone);
    }

    const svgString = new XMLSerializer().serializeToString(svgClone);
    return new Blob([svgString], { type: 'image/svg+xml' });
  }

  /**
   * Export graph state as JSON
   */
  exportAsJSON(graphState: GraphState, options: ExportOptions = {}): Blob {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      graphState,
      metadata: options.includeMetadata ? {
        exportedBy: 'TraceLens',
        format: 'json',
        ...options
      } : undefined
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  /**
   * Generate shareable URL with graph state
   */
  generateShareableURL(graphState: GraphState, baseUrl: string = window.location.origin): string {
    const compressed = this.compressGraphState(graphState);
    const params = new URLSearchParams({
      state: compressed,
      v: '1'
    });
    
    return `${baseUrl}/shared-graph?${params.toString()}`;
  }

  /**
   * Parse shareable URL to extract graph state
   */
  parseShareableURL(url: string): GraphState | null {
    try {
      const urlObj = new URL(url);
      const stateParam = urlObj.searchParams.get('state');
      
      if (!stateParam) return null;
      
      return this.decompressGraphState(stateParam);
    } catch (error) {
      console.error('Failed to parse shareable URL:', error);
      return null;
    }
  }

  /**
   * Save graph layout preferences to localStorage
   */
  saveLayoutPreferences(layoutId: string, preferences: any): void {
    const key = `tracelens_layout_${layoutId}`;
    localStorage.setItem(key, JSON.stringify({
      ...preferences,
      savedAt: new Date().toISOString()
    }));
  }

  /**
   * Load graph layout preferences from localStorage
   */
  loadLayoutPreferences(layoutId: string): any | null {
    const key = `tracelens_layout_${layoutId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch (_error) {
      console.error('Failed to parse layout preferences:', _error);
      return null;
    }
  }

  private prepareSVGForExport(width: number, height: number, backgroundColor: string): SVGSVGElement {
    const svgClone = this.svgElement.cloneNode(true) as SVGSVGElement;
    
    // Set dimensions
    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Add background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', backgroundColor);
    svgClone.insertBefore(background, svgClone.firstChild);
    
    // Ensure all styles are inline
    this.inlineStyles(svgClone);
    
    return svgClone;
  }

  private async svgToCanvas(svg: SVGSVGElement, width: number, height: number): Promise<HTMLCanvasElement> {
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(svgUrl);
        resolve(canvas);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG image'));
      };
      
      img.src = svgUrl;
    });
  }

  private inlineStyles(svg: SVGSVGElement): void {
    const elements = svg.querySelectorAll('*');
    
    elements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const inlineStyle: string[] = [];
      
      // Copy relevant CSS properties
      const properties = [
        'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity',
        'font-family', 'font-size', 'font-weight', 'text-anchor'
      ];
      
      properties.forEach((prop) => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'none') {
          inlineStyle.push(`${prop}: ${value}`);
        }
      });
      
      if (inlineStyle.length > 0) {
        element.setAttribute('style', inlineStyle.join('; '));
      }
    });
  }

  private addMetadataToSVG(svg: SVGSVGElement): void {
    const metadata = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
    metadata.innerHTML = `
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
               xmlns:dc="http://purl.org/dc/elements/1.1/">
        <rdf:Description>
          <dc:title>TraceLens Dependency Graph</dc:title>
          <dc:creator>TraceLens</dc:creator>
          <dc:date>${new Date().toISOString()}</dc:date>
          <dc:description>Runtime dependency graph visualization</dc:description>
        </rdf:Description>
      </rdf:RDF>
    `;
    
    svg.insertBefore(metadata, svg.firstChild);
  }

  private compressGraphState(state: GraphState): string {
    // Simple base64 encoding for now - could use more sophisticated compression
    const jsonString = JSON.stringify(state);
    return btoa(encodeURIComponent(jsonString));
  }

  private decompressGraphState(compressed: string): GraphState {
    try {
      const jsonString = decodeURIComponent(atob(compressed));
      return JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid compressed graph state');
    }
  }
}

/**
 * Utility functions for graph export
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};
