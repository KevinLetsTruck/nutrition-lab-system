'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, FlaskConical, Plus, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProtocolBuilder } from '@/components/protocols/ProtocolBuilder';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
}

interface ClientAnalysis {
  id: string;
  analysisDate: string;
  executiveSummary?: string;
  fullAnalysis: string;
}

export default function CreateClientProtocolPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [analyses, setAnalyses] = useState<ClientAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<
    string | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get analysis ID from URL params if provided
  const initialAnalysisId = searchParams.get('analysisId');

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    if (initialAnalysisId) {
      setSelectedAnalysisId(initialAnalysisId);
    }
  }, [initialAnalysisId]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!clientResponse.ok) {
          if (clientResponse.status === 404) {
            setError('Client not found');
            return;
          }
          throw new Error('Failed to fetch client');
        }

        const clientData = await clientResponse.json();
        setClient(clientData);

        // Fetch client analyses
        try {
          const analysesResponse = await fetch(
            `/api/clients/${params.id}/analysis/history`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (analysesResponse.ok) {
            const analysesData = await analysesResponse.json();
            setAnalyses(analysesData.analyses || []);
          }
        } catch (err) {
          // Analyses are optional, don't fail if they can't be loaded
          console.warn('Failed to fetch analyses:', err);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load client data'
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClientData();
    }
  }, [params.id, router]);

  const handleProtocolCreated = (protocolId: string) => {
    toast.success('Protocol created successfully!');
    router.push(`/dashboard/clients/${params.id}/protocols/${protocolId}`);
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-10 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
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
              {error || 'Client not found'}
            </p>
            <Link
              href="/dashboard/clients"
              className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              ← Back to Clients
            </Link>
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
      label: `${client.firstName} ${client.lastName}`,
      href: `/dashboard/clients/${client.id}`,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Protocols',
      href: `/dashboard/clients/${client.id}/protocols`,
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      label: 'Create Protocol',
      icon: <Plus className="h-4 w-4" />,
    },
  ];

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create Protocol
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a new protocol for {client.firstName} {client.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href={`/dashboard/clients/${client.id}/protocols`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Protocols
              </Link>
            </Button>
          </div>
        </div>

        {/* Client Info & Analysis Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {client.firstName.charAt(0)}
                {client.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {client.firstName} {client.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {client.email}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Selection */}
          {analyses.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Available Analyses ({analyses.length})
                </h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                You can base this protocol on an existing analysis or create it
                from scratch.
              </p>

              {selectedAnalysisId ? (
                <div className="mb-4">
                  {(() => {
                    const selectedAnalysis = analyses.find(
                      a => a.id === selectedAnalysisId
                    );
                    return selectedAnalysis ? (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Analysis from{' '}
                              {new Date(
                                selectedAnalysis.analysisDate
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedAnalysis.executiveSummary
                                ? selectedAnalysis.executiveSummary.substring(
                                    0,
                                    100
                                  ) + '...'
                                : 'Using this analysis to generate protocol'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAnalysisId(undefined)}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {analyses.slice(0, 3).map(analysis => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Analysis from{' '}
                          {new Date(analysis.analysisDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {analysis.executiveSummary
                            ? analysis.executiveSummary.substring(0, 80) + '...'
                            : 'Click to use this analysis'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnalysisId(analysis.id)}
                      >
                        Use This Analysis
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!selectedAnalysisId && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedAnalysisId(undefined)}
                  >
                    Create from Scratch
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={`/dashboard/clients/${client.id}/analysis/import`}
                    >
                      Import New Analysis
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* No analyses message */}
          {analyses.length === 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                  No Analyses Available
                </h3>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                This client doesn't have any analyses yet. You can create a
                protocol from scratch or import a Claude analysis first for more
                personalized recommendations.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link
                    href={`/dashboard/clients/${client.id}/analysis/import`}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Import Analysis First
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Protocol Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Protocol Builder
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a personalized protocol for {client.firstName}{' '}
              {client.lastName}
              {selectedAnalysisId
                ? ' based on their analysis'
                : ' from scratch'}
            </p>
          </div>
          <div className="p-6">
            <ProtocolBuilder
              clientId={client.id}
              analysisId={selectedAnalysisId}
              mode={selectedAnalysisId ? 'create-from-analysis' : 'create'}
              onProtocolCreated={handleProtocolCreated}
              autoSave={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
