import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProtocolMonitoringDashboard } from '@/components/protocols/ProtocolMonitoringDashboard';
import { ClientProgressForm } from '@/components/protocols/ClientProgressForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, User, Calendar } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: 'monitor' | 'client' }>;
}

async function getProtocol(protocolId: string) {
  try {
    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id: protocolId },
      include: {
        client: true,
        protocolProgress: {
          orderBy: { weekNumber: 'desc' },
          take: 1, // Get latest progress for current week calculation
        },
      },
    });

    return protocol;
  } catch (error) {
    console.error('Error fetching protocol:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: protocolId } = await params;
  const protocol = await getProtocol(protocolId);

  return {
    title: protocol
      ? `${protocol.protocolName} - Progress Tracking`
      : 'Protocol Progress',
  };
}

export default async function ProtocolProgressPage({ params, searchParams }: PageProps) {
  const { id: protocolId } = await params;
  const { view = 'monitor' } = await searchParams;
  
  const protocol = await getProtocol(protocolId);

  if (!protocol) {
    notFound();
  }

  // Calculate current week based on start date
  const currentWeek = protocol.startDate 
    ? Math.ceil((Date.now() - new Date(protocol.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 1;
  
  // Ensure current week is at least 1 and doesn't exceed duration
  const activeWeek = Math.max(1, Math.min(currentWeek, protocol.durationWeeks || 12));

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/protocols/${protocolId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Protocol
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Protocol Progress
              </h1>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'monitor' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href={`/dashboard/protocols/${protocolId}/progress?view=monitor`}>
                <Activity className="h-4 w-4 mr-2" />
                Monitor View
              </Link>
            </Button>
            <Button
              variant={view === 'client' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href={`/dashboard/protocols/${protocolId}/progress?view=client`}>
                <User className="h-4 w-4 mr-2" />
                Client View
              </Link>
            </Button>
          </div>
        </div>

        {/* Protocol Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {protocol.protocolName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {protocol.client.firstName} {protocol.client.lastName}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Started: {protocol.startDate ? new Date(protocol.startDate).toLocaleDateString() : 'Not started'}
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Week {activeWeek} of {protocol.durationWeeks || 'ongoing'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${
                protocol.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                protocol.status === 'planned' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                protocol.status === 'completed' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                protocol.status === 'paused' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                'bg-gray-100 text-gray-800 border-gray-300'
              }`}>
                {protocol.status.charAt(0).toUpperCase() + protocol.status.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view */}
      {view === 'monitor' ? (
        <ProtocolMonitoringDashboard protocolId={protocolId} />
      ) : (
        <div>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Client Progress Input
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This view shows what clients see when submitting their weekly progress reports. 
              Use this to input progress data on behalf of clients or preview the client experience.
            </p>
          </div>
          
          <ClientProgressForm
            protocolId={protocolId}
            protocolName={protocol.protocolName}
            currentWeek={activeWeek}
            onProgressSubmitted={() => {
              // Refresh the page to show updated progress
              window.location.href = `/dashboard/protocols/${protocolId}/progress?view=monitor`;
            }}
          />
        </div>
      )}
    </div>
  );
}
