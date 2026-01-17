import React, { useState } from 'react';
import { GraphExporter, ExportOptions, GraphState, downloadBlob, copyToClipboard } from '../../lib/graph-exporter';

interface ExportControlsProps {
  svgRef: React.RefObject<SVGSVGElement>;
  graphState: GraphState;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  svgRef,
  graphState,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'json'>('png');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    includeMetadata: true,
    quality: 1.0
  });
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);

  const handleExport = async () => {
    if (!svgRef.current) return;

    setIsExporting(true);
    
    try {
      const exporter = new GraphExporter(svgRef.current);
      const options = { ...exportOptions, format: exportFormat };
      
      let blob: Blob;
      let filename: string;
      
      switch (exportFormat) {
        case 'png':
          blob = await exporter.exportAsPNG(options);
          filename = `tracelens-graph-${Date.now()}.png`;
          break;
        case 'svg':
          blob = exporter.exportAsSVG(options);
          filename = `tracelens-graph-${Date.now()}.svg`;
          break;
        case 'json':
          blob = exporter.exportAsJSON(graphState, options);
          filename = `tracelens-graph-${Date.now()}.json`;
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (!svgRef.current) return;

    try {
      const exporter = new GraphExporter(svgRef.current);
      const url = exporter.generateShareableURL(graphState);
      setShareUrl(url);
      setShowShareModal(true);
    } catch (error) {
      console.error('Share URL generation failed:', error);
      alert('Failed to generate share URL. Please try again.');
    }
  };

  const copyShareUrl = async () => {
    try {
      await copyToClipboard(shareUrl);
      alert('Share URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL. Please copy manually.');
    }
  };

  const saveLayout = () => {
    if (!svgRef.current) return;

    try {
      const exporter = new GraphExporter(svgRef.current);
      const layoutId = `layout_${Date.now()}`;
      exporter.saveLayoutPreferences(layoutId, {
        graphState,
        exportOptions,
        name: `Layout ${new Date().toLocaleDateString()}`
      });
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('Failed to save layout. Please try again.');
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Share</h3>
        
        {/* Export format selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              {(['png', 'svg', 'json'] as const).map((format) => (
                <label key={format} className="flex items-center">
                  <input
                    type="radio"
                    value={format}
                    checked={exportFormat === format}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm uppercase">{format}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced options toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              className={`w-4 h-4 mr-1 transform transition-transform ${
                showAdvanced ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Options
          </button>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={exportOptions.width}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      width: parseInt(e.target.value) || 1200
                    })}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    min="400"
                    max="4000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={exportOptions.height}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      height: parseInt(e.target.value) || 800
                    })}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    min="300"
                    max="3000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={exportOptions.backgroundColor}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    backgroundColor: e.target.value
                  })}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>

              {exportFormat === 'png' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality ({Math.round((exportOptions.quality || 1) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={exportOptions.quality}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      quality: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
              )}

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeMetadata: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Include metadata</span>
              </label>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>

            <button
              onClick={saveLayout}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Layout
            </button>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Graph</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Share this graph with others using the URL below:
            </p>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
              />
              <button
                onClick={copyShareUrl}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Copy
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              This URL contains the current graph state and will allow others to view the same visualization.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
