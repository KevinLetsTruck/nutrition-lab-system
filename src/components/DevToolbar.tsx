'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bug, X, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Keyboard shortcut: Ctrl+Shift+D to toggle toolbar
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsOpen(!isOpen);
      }
      // Ctrl+Shift+I for quick issue
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        logQuickIssue();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const logQuickIssue = () => {
    const url = window.location.href;
    const issue = {
      id: `quick-${Date.now()}`,
      category: 'BUG',
      priority: 'MEDIUM',
      status: 'OPEN',
      title: quickNote || 'Quick issue logged during testing',
      description: `Found at: ${url}`,
      location: url,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Temporarily store in memory only
    // const existing = JSON.parse(localStorage.getItem('assessment-issues') || '[]');
    // existing.unshift(issue);
    // localStorage.setItem('assessment-issues', JSON.stringify(existing));
    
    toast.success('Issue logged!');
    setQuickNote('');
  };

  if (!isDev) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all"
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* Toolbar */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Dev Toolbar</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Quick issue note..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && logQuickIssue()}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={logQuickIssue} className="text-xs">
                <Plus className="mr-1 h-3 w-3" />
                Log Issue
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => toast.info('Issue tracking coming soon')}
                className="text-xs"
              >
                <Bug className="mr-1 h-3 w-3" />
                View All
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>📍 Current: {window.location.pathname}</div>
              <div>⌨️ Ctrl+Shift+I: Quick issue</div>
              <div>⌨️ Ctrl+Shift+D: Toggle toolbar</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
