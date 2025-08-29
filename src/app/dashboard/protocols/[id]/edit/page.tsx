'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, FileText, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProtocolBuilder } from '@/components/protocols/ProtocolBuilder';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface ProtocolData {
  id: string;
  protocolName: string;
  protocolPhase?: string;
  currentStatus: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  analysis?: {
    id: string;
  };
}

export default function EditProtocolPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [protocol, setProtocol] = useState<ProtocolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const response = await fetch(`/api/protocols/${params.id}`, {
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
        setProtocol(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load protocol'
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProtocol();
    }
  }, [params.id, router]);

  const handleProtocolUpdated = (protocolId: string) => {
    toast.success('Protocol updated successfully!');
    router.push(`/dashboard/protocols/${protocolId}`);
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
                href="/dashboard/protocols"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ← Back to Protocols
              </Link>
              {params.id && (
                <Link
                  href={`/dashboard/protocols/${params.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  View Protocol
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: 'Protocols',
      href: '/dashboard/protocols',
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      label: protocol.protocolName,
      href: `/dashboard/protocols/${protocol.id}`,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: 'Edit',
      icon: <Save className="h-4 w-4" />,
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
              Edit Protocol
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Editing {protocol.protocolName} for {protocol.client.firstName}{' '}
              {protocol.client.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/protocols/${protocol.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Protocol
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/dashboard/protocols/${protocol.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        {/* Protocol Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Protocol Editor
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Make changes to this protocol. All changes are automatically
                  saved.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {protocol.client.firstName.charAt(0)}
                  {protocol.client.lastName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {protocol.client.firstName} {protocol.client.lastName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {protocol.client.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ProtocolBuilder
              protocolId={protocol.id}
              clientId={protocol.client.id}
              analysisId={protocol.analysis?.id}
              mode="edit"
              onProtocolCreated={handleProtocolUpdated}
              autoSave={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
