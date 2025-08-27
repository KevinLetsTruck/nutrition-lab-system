import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AnalysisImportForm } from '@/components/analysis/AnalysisImportForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

async function getClient(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        clientAnalyses: {
          select: { id: true, analysisDate: true },
          orderBy: { analysisDate: 'desc' },
          take: 5
        }
      }
    });

    return client;
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const client = await getClient(params.id);
  
  return {
    title: client 
      ? `Import Analysis - ${client.firstName} ${client.lastName}`
      : 'Import Analysis'
  };
}

export default async function ImportAnalysisPage({ params }: PageProps) {
  const client = await getClient(params.id);

  if (!client) {
    notFound();
  }

  const clientName = `${client.firstName} ${client.lastName}`;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clients/${client.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Client
            </Link>
          </Button>
          
          {client.clientAnalyses.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/clients/${client.id}/analysis/history`}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analysis History ({client.clientAnalyses.length})
              </Link>
            </Button>
          )}
        </div>

        {client.clientAnalyses.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Previous Analyses</h3>
            <p className="text-sm text-blue-700">
              This client has {client.clientAnalyses.length} previous analysis(es). 
              Consider reviewing the{' '}
              <Link 
                href={`/dashboard/clients/${client.id}/analysis/history`}
                className="underline font-medium"
              >
                analysis history
              </Link>
              {' '}to track progress and compare patterns.
            </p>
          </div>
        )}
      </div>

      <AnalysisImportForm 
        clientId={client.id}
        clientName={clientName}
        onSuccess={(analysisId) => {
          // Redirect to analysis history after successful import
          window.location.href = `/dashboard/clients/${client.id}/analysis/history`;
        }}
      />
    </div>
  );
}
