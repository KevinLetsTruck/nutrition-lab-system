'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, FlaskConical, Plus, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProtocolList } from '@/components/protocols/ProtocolList';
import { useAuth } from '@/lib/auth-context';

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
}

export default function ClientProtocolsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [analyses, setAnalyses] = useState<ClientAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

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
      icon: <FlaskConical className="h-4 w-4" />,
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
              Protocols for {client.firstName} {client.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage functional medicine protocols for this client
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/clients/${client.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Client
              </Link>
            </Button>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status: {client.status} • Member since{' '}
                  {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {analyses.length > 0 ? (
                <Button asChild>
                  <Link
                    href={`/dashboard/clients/${client.id}/protocols/create?analysisId=${analyses[0].id}`}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Create from Analysis
                  </Link>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link
                      href={`/dashboard/clients/${client.id}/analysis/import`}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Import Analysis
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link
                      href={`/dashboard/clients/${client.id}/protocols/create`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Protocol
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {analyses.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Available Analyses ({analyses.length})
                </h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                This client has {analyses.length} analysis
                {analyses.length > 1 ? 'es' : ''} available. You can create
                protocols based on these insights.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" asChild>
                  <Link
                    href={`/dashboard/clients/${client.id}/protocols/create`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Protocol
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link
                    href={`/dashboard/clients/${client.id}/analysis/history`}
                  >
                    View Analyses
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Protocols List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Client Protocols
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  All protocols created for this client
                </p>
              </div>
              <Button asChild>
                <Link href={`/dashboard/clients/${client.id}/protocols/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Protocol
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-6">
            <ProtocolList
              clientId={client.id}
              showAllClients={false}
              pageSize={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
