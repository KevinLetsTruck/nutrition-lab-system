'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  FlaskConical,
  Edit,
  FileText,
  Mail,
  Copy,
  ExternalLink,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface ProtocolData {
  id: string;
  protocolName: string;
  protocolPhase?: string;
  greeting?: string;
  clinicalFocus?: string;
  currentStatus: string;
  protocolNotes?: string;
  dailySchedule?: any;
  createdAt: string;
  updatedAt: string;
  client: Client;
  analysis?: {
    id: string;
    analysisDate: string;
    executiveSummary?: string;
  };
  protocolSupplements: Array<{
    id: string;
    productName: string;
    dosage: string;
    timing: string;
    purpose?: string;
    priority: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
  }>;
  protocolGenerations?: Array<{
    id: string;
    pdfUrl?: string;
    emailSentAt?: string;
    emailRecipients?: string[];
    createdAt: string;
  }>;
}

export default function ClientProtocolViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [protocol, setProtocol] = useState<ProtocolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    const fetchProtocol = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/protocols/${params.protocolId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Protocol not found');
            return;
          }
          throw new Error('Failed to fetch protocol');
        }

        const data = await response.json();

        // Verify this protocol belongs to the correct client
        if (data.data.client.id !== params.id) {
          setError('Protocol not found for this client');
          return;
        }

        setProtocol(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load protocol'
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id && params.protocolId) {
      fetchProtocol();
    }
  }, [params.id, params.protocolId, router]);

  const handleGeneratePDF = async () => {
    if (!protocol) return;

    setActionLoading('pdf');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/protocols/${protocol.id}/generate-pdf`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paperSize: 'A4',
            includeSupplements: true,
            includeSchedule: true,
            includeNotes: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const data = await response.json();
      toast.success('PDF generated successfully!');

      // Refresh protocol data to get updated generation info
      window.location.reload();
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmailClient = async () => {
    if (!protocol) return;

    setActionLoading('email');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/protocols/${protocol.id}/email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [protocol.client.email],
          includePDF: true,
          includeGreeting: true,
          includeSupplements: true,
          customMessage: `Hi ${protocol.client.firstName}, your personalized ${protocol.protocolName} is ready!`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      toast.success('Protocol emailed successfully!');

      // Refresh protocol data to get updated generation info
      window.location.reload();
    } catch (error) {
      toast.error('Failed to email protocol');
      console.error('Email sending error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Protocol link copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen p-4"
        style={{ background: 'var(--background)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div
        className="min-h-screen p-4"
        style={{ background: 'var(--background)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error
            </h2>
            <p className="text-red-600 dark:text-red-400">
              {error || 'Protocol not found'}
            </p>
            <div className="flex gap-2 mt-4">
              <Link
                href={`/dashboard/clients/${params.id}/protocols`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ← Back to Client Protocols
              </Link>
              <Link
                href={`/dashboard/clients/${params.id}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                View Client
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: 'Clients',
      href: '/dashboard/clients',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: `${protocol.client.firstName} ${protocol.client.lastName}`,
      href: `/dashboard/clients/${protocol.client.id}`,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Protocols',
      href: `/dashboard/clients/${protocol.client.id}/protocols`,
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      label: protocol.protocolName,
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const activeSupplements = protocol.protocolSupplements.filter(
    s => s.isActive
  );
  const sortedSupplements = activeSupplements.sort(
    (a, b) => a.priority - b.priority
  );

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Breadcrumb items={breadcrumbItems} className="mb-2" />
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {protocol.protocolName}
              </h1>
              <Badge className={getStatusColor(protocol.currentStatus)}>
                {protocol.currentStatus}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Protocol for {protocol.client.firstName}{' '}
              {protocol.client.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/protocols/${protocol.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/dashboard/clients/${protocol.client.id}/protocols`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        {/* Client Context Banner */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {protocol.client.firstName.charAt(0)}
                {protocol.client.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Client: {protocol.client.firstName} {protocol.client.lastName}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {protocol.client.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/clients/${protocol.client.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Client
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link
                  href={`/dashboard/clients/${protocol.client.id}/protocols`}
                >
                  All Protocols
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Protocol Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Protocol Overview
              </h2>

              {protocol.greeting && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Greeting
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {protocol.greeting}
                  </p>
                </div>
              )}

              {protocol.clinicalFocus && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clinical Focus
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {protocol.clinicalFocus}
                  </p>
                </div>
              )}

              {protocol.protocolNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {protocol.protocolNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Supplements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Supplements ({activeSupplements.length})
              </h2>

              {sortedSupplements.length > 0 ? (
                <div className="space-y-4">
                  {sortedSupplements.map((supplement, index) => (
                    <div
                      key={supplement.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              #{supplement.priority}
                            </Badge>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {supplement.productName}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>
                              <span className="font-medium">Dosage:</span>{' '}
                              {supplement.dosage}
                            </p>
                            <p>
                              <span className="font-medium">Timing:</span>{' '}
                              {supplement.timing}
                            </p>
                            {supplement.purpose && (
                              <p>
                                <span className="font-medium">Purpose:</span>{' '}
                                {supplement.purpose}
                              </p>
                            )}
                            {supplement.startDate && (
                              <p>
                                <span className="font-medium">Start:</span>{' '}
                                {formatDate(supplement.startDate)}
                              </p>
                            )}
                            {supplement.endDate && (
                              <p>
                                <span className="font-medium">End:</span>{' '}
                                {formatDate(supplement.endDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No active supplements in this protocol
                </p>
              )}
            </div>

            {/* Daily Schedule */}
            {protocol.dailySchedule && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Daily Schedule
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {typeof protocol.dailySchedule === 'string'
                      ? protocol.dailySchedule
                      : JSON.stringify(protocol.dailySchedule, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={handleGeneratePDF}
                  disabled={actionLoading === 'pdf'}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {actionLoading === 'pdf' ? 'Generating...' : 'Generate PDF'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleEmailClient}
                  disabled={actionLoading === 'email'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {actionLoading === 'email' ? 'Sending...' : 'Email Client'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/dashboard/protocols/${protocol.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Protocol
                  </Link>
                </Button>
              </div>
            </div>

            {/* Protocol Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Protocol Details
              </h2>
              <div className="space-y-3 text-sm">
                {protocol.protocolPhase && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Phase:
                    </span>
                    <Badge variant="outline">{protocol.protocolPhase}</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatDate(protocol.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Updated:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatDate(protocol.updatedAt)}
                  </span>
                </div>
                {protocol.analysis && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Based on Analysis:
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/clients/${protocol.client.id}/analysis/history`}
                        >
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(protocol.analysis.analysisDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generation History */}
            {protocol.protocolGenerations &&
              protocol.protocolGenerations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Generation History
                  </h2>
                  <div className="space-y-3">
                    {protocol.protocolGenerations.map(generation => (
                      <div
                        key={generation.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {generation.pdfUrl ? 'PDF Generated' : 'Email Sent'}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatDateTime(generation.createdAt)}
                          </span>
                        </div>
                        {generation.emailRecipients && (
                          <p className="text-gray-600 dark:text-gray-400">
                            Sent to: {generation.emailRecipients.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
