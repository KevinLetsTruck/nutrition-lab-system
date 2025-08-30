'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { 
  Settings, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Loader2
} from 'lucide-react';

interface ProtocolStatusManagerProps {
  protocolId: string;
  protocolName: string;
  currentStatus: string;
  clientName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged?: () => void;
}

const statusOptions = [
  { value: 'planned', label: 'Planned', icon: Calendar, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'active', label: 'Active', icon: PlayCircle, color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'paused', label: 'Paused', icon: PauseCircle, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'discontinued', label: 'Discontinued', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300' },
];

export function ProtocolStatusManager({
  protocolId,
  protocolName,
  currentStatus,
  clientName,
  isOpen,
  onOpenChange,
  onStatusChanged,
}: ProtocolStatusManagerProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [reasonForChange, setReasonForChange] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  const handleStatusUpdate = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (selectedStatus === currentStatus) {
      toast.error('Please select a different status');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/protocols/${protocolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newStatus: selectedStatus,
          reasonForChange: reasonForChange.trim() || undefined,
          adjustmentNotes: adjustmentNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const data = await response.json();

      toast.success('Protocol status updated successfully!', {
        description: `Changed from ${data.statusChange.from} to ${data.statusChange.to}`
      });

      onStatusChanged?.();
      onOpenChange(false);
      
      // Reset form
      setReasonForChange('');
      setAdjustmentNotes('');

    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update protocol status', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find(option => option.value === currentStatus);
  };

  const getSelectedStatusInfo = () => {
    return statusOptions.find(option => option.value === selectedStatus);
  };

  const currentStatusInfo = getCurrentStatusInfo();
  const selectedStatusInfo = getSelectedStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Settings className="h-5 w-5 text-blue-600" />
            Update Protocol Status
          </DialogTitle>
          <DialogDescription>
            Change the status of {protocolName} for {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Current Status:
              </span>
              {currentStatusInfo && (
                <Badge className={`${currentStatusInfo.color} border`}>
                  <currentStatusInfo.icon className="h-3 w-3 mr-1" />
                  {currentStatusInfo.label}
                </Badge>
              )}
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              New Status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.value === currentStatus}
                  >
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                      {option.value === currentStatus && (
                        <span className="text-xs text-gray-500">(current)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Change */}
          {selectedStatus !== currentStatus && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Reason for Change
              </label>
              <Textarea
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Why is this status change being made?"
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Adjustment Notes */}
          {selectedStatus !== currentStatus && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Adjustment Notes <span className="text-gray-500">(Optional)</span>
              </label>
              <Textarea
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="Any protocol adjustments or additional notes?"
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Status Change Preview */}
          {selectedStatus !== currentStatus && selectedStatusInfo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <selectedStatusInfo.icon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Status Change Preview
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Protocol will change from <strong>{currentStatusInfo?.label}</strong> to <strong>{selectedStatusInfo.label}</strong>
              </p>
              {selectedStatus === 'completed' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ℹ️ Completing this protocol will set the completion date
                </p>
              )}
              {selectedStatus === 'discontinued' && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ⚠️ Discontinuing will stop all active tracking for this protocol
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={loading || selectedStatus === currentStatus || !token}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
