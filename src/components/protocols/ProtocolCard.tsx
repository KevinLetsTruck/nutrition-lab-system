'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  FileText,
  Mail,
  MoreVertical,
  Pill,
  Trash2,
  Edit3,
  Download,
  Brain,
  Star,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

// Enhanced Protocol interface to match our database schema
interface ProtocolClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ProtocolAnalysis {
  id: string;
  analysisDate: Date;
  analysisVersion: string;
}

interface ProtocolSupplement {
  id: string;
  productName: string;
  dosage: string;
  timing: string;
  priority: number;
  isActive: boolean;
}

interface ProtocolGeneration {
  id: string;
  pdfUrl?: string;
  emailSentAt?: Date;
  createdAt: Date;
}

interface Protocol {
  id: string;
  protocolName: string;
  protocolPhase?: string;
  status: string;
  startDate?: Date;
  durationWeeks?: number;
  createdAt: Date;
  updatedAt: Date;
  greeting?: string;
  clinicalFocus?: string;
  currentStatus?: string;
  effectivenessRating?: number;
  client: ProtocolClient;
  analysis?: ProtocolAnalysis;
  protocolSupplements: ProtocolSupplement[];
  protocolGenerations: ProtocolGeneration[];
}

interface ProtocolCardProps {
  protocol: Protocol;
  onEdit?: (protocol: Protocol) => void;
  onDelete?: (protocolId: string) => void;
  onGeneratePDF?: (protocolId: string) => void;
  onSendEmail?: (protocolId: string) => void;
  onCreateFromAnalysis?: (analysisId: string) => void;
  className?: string;
}

export function ProtocolCard({
  protocol,
  onEdit,
  onDelete,
  onGeneratePDF,
  onSendEmail,
  onCreateFromAnalysis,
  className,
}: ProtocolCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Status styling
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'discontinued':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Phase styling
  const getPhaseColor = (phase?: string) => {
    if (!phase) return 'bg-gray-100 text-gray-600';
    switch (phase.toLowerCase()) {
      case 'phase 1':
        return 'bg-blue-100 text-blue-700';
      case 'phase 2':
        return 'bg-purple-100 text-purple-700';
      case 'phase 3':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Calculate active supplements
  const activeSupplements = protocol.protocolSupplements.filter(
    s => s.isActive
  );
  const prioritySupplements = activeSupplements
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!onGeneratePDF) return;

    setIsGeneratingPDF(true);
    try {
      await onGeneratePDF(protocol.id);
      toast.success('PDF generated successfully', {
        description: `Protocol PDF for ${protocol.client.firstName} ${protocol.client.lastName}`,
      });
    } catch (error) {
      toast.error('Failed to generate PDF', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle email sending
  const handleSendEmail = async () => {
    if (!onSendEmail) return;

    setIsSendingEmail(true);
    try {
      await onSendEmail(protocol.id);
      toast.success('Email sent successfully', {
        description: `Protocol sent to ${protocol.client.email}`,
      });
    } catch (error) {
      toast.error('Failed to send email', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (onDelete) {
      onDelete(protocol.id);
    }
    setShowDeleteDialog(false);
  };

  // Format dates
  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {protocol.protocolName}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {protocol.client.firstName} {protocol.client.lastName}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <Badge
                variant="outline"
                className={getStatusColor(protocol.status)}
              >
                {protocol.status}
              </Badge>

              {/* Phase Badge */}
              {protocol.protocolPhase && (
                <Badge
                  variant="secondary"
                  className={getPhaseColor(protocol.protocolPhase)}
                >
                  {protocol.protocolPhase}
                </Badge>
              )}

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Protocol Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(protocol)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Protocol
                      </DropdownMenuItem>
                    )}
                    {onGeneratePDF && (
                      <DropdownMenuItem
                        onClick={handleGeneratePDF}
                        disabled={isGeneratingPDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF'}
                      </DropdownMenuItem>
                    )}
                    {onSendEmail && (
                      <DropdownMenuItem
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {isSendingEmail ? 'Sending...' : 'Email to Client'}
                      </DropdownMenuItem>
                    )}
                    {protocol.analysis && onCreateFromAnalysis && (
                      <DropdownMenuItem
                        onClick={() =>
                          onCreateFromAnalysis!(protocol.analysis!.id)
                        }
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Create from Analysis
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Protocol
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Clinical Focus */}
          {protocol.clinicalFocus && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Focus:</strong> {protocol.clinicalFocus}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Pill className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Supplements</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {activeSupplements.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {protocol.durationWeeks
                    ? `${protocol.durationWeeks}w`
                    : 'TBD'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Start Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(protocol.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {protocol.effectivenessRating ? (
                <>
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Rating</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {protocol.effectivenessRating}/5
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Rating</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Not rated
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Priority Supplements */}
          {prioritySupplements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Priority Supplements
              </h4>
              <div className="space-y-2">
                {prioritySupplements.map(supplement => (
                  <div
                    key={supplement.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {supplement.productName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {supplement.dosage} • {supplement.timing}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{supplement.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Status */}
          {protocol.currentStatus && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Status:</strong> {protocol.currentStatus}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {protocol.analysis && (
              <div className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span>Analysis: {protocol.analysis.analysisVersion}</span>
              </div>
            )}
            {protocol.protocolGenerations.length > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{protocol.protocolGenerations.length} generations</span>
              </div>
            )}
          </div>
          <div>Updated {format(new Date(protocol.updatedAt), 'MMM d')}</div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Protocol</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{protocol.protocolName}"? This
              will also delete all related supplements, generations, and
              tracking data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Protocol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
