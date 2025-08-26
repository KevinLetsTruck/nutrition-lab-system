'use client';

import React, { useEffect } from 'react';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

export function QuickScreenshot() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+S for quick screenshot to clipboard
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toast.info(
          <div>
            <p className="font-semibold">Take a screenshot:</p>
            <p className="text-sm">Windows: Win+Shift+S</p>
            <p className="text-sm">Mac: Cmd+Shift+4</p>
            <p className="text-sm">Then paste in issue form with Ctrl+V</p>
          </div>,
          { duration: 5000 }
        );
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return null;
}
