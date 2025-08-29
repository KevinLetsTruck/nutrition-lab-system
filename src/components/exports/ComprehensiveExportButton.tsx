'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { ComprehensiveExportDialog } from './ComprehensiveExportDialog';

interface ComprehensiveExportButtonProps {
  clientId: string;
  clientName: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ComprehensiveExportButton({
  clientId,
  clientName,
  variant = 'outline',
  size = 'sm',
  className = '',
}: ComprehensiveExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className={`${className}`}
      >
        <Package className="h-4 w-4 mr-2" />
        Export Package
      </Button>

      <ComprehensiveExportDialog
        clientId={clientId}
        clientName={clientName}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
