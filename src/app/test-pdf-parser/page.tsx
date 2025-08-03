'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestPDFParserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a PDF file');
    }
  };

  const testPDFParser = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/test-quick-analysis', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Test failed');
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">PDF Parser Test</h1>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test PDF Parsing</h2>
          <p className="text-gray-400 mb-6">
            This page tests if PDF files can be parsed correctly in the production environment.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
                Select a PDF file
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {file && (
              <div className="flex items-center space-x-2 text-gray-300">
                <FileText className="w-5 h-5" />
                <span>{file.name}</span>
                <span className="text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}

            <button
              onClick={testPDFParser}
              disabled={!file || isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Test PDF Parser
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-lg p-6 ${result.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'}`}>
            <div className="flex items-center mb-4">
              {result.success ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  <h3 className="text-lg font-semibold text-green-400">Test Successful</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
                  <h3 className="text-lg font-semibold text-red-400">Test Failed</h3>
                </>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {result.success && (
                <>
                  <p className="text-gray-300">
                    <strong>Pages:</strong> {result.pageCount}
                  </p>
                  <p className="text-gray-300">
                    <strong>Text Length:</strong> {result.textLength} characters
                  </p>
                  <div className="mt-4">
                    <p className="text-gray-400 font-medium mb-2">Text Preview:</p>
                    <div className="bg-slate-700 p-3 rounded text-gray-300 text-xs font-mono overflow-x-auto">
                      {result.textPreview}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="text-red-400">
                  <p><strong>Error:</strong> {error}</p>
                  {result.details && (
                    <p className="mt-2 text-xs">{result.details}</p>
                  )}
                </div>
              )}

              {result.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                    Show Error Stack
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 overflow-x-auto">
                    {result.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-500">
          <p>This test checks if:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>The file is a valid PDF</li>
            <li>The serverless PDF parser (pdfjs-dist) can extract text</li>
            <li>The parser works in the production environment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}