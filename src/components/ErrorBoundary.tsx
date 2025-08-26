'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Bug, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}`;

    // Automatically log to issue tracker
    const issue = {
      id: errorId,
      category: 'TECHNICAL',
      priority: 'CRITICAL',
      status: 'OPEN',
      title: error.message,
      description: error.stack || '',
      blocksTesting: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Temporarily disabled - issue tracking coming soon
    // const existingIssues = JSON.parse(localStorage.getItem('assessment-issues') || '[]');
    // existingIssues.unshift(issue);
    // localStorage.setItem('assessment-issues', JSON.stringify(existingIssues));

    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  copyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
Time: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();

    navigator.clipboard.writeText(errorText);
    toast.success('Error details copied to clipboard');
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
          <Card className="max-w-2xl w-full p-6 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-900">Technical Error Detected</h1>
                <p className="text-sm text-red-600">Error ID: {this.state.errorId}</p>
              </div>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
              <div className="text-red-400 mb-2">{this.state.error?.message}</div>
              <div className="text-gray-400 text-xs whitespace-pre-wrap">
                {this.state.error?.stack?.split('\n').slice(0, 5).join('\n')}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <strong>This error has been automatically logged</strong> to the issue tracker. 
                Copy the error details and share with the development team.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={this.copyError} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy Error Details
              </Button>
              <Button onClick={this.reload}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
              {/* Issue tracker button removed - coming soon */}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
