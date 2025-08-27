import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AnalysisHistoryList } from '@/components/analysis/AnalysisHistoryList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Brain } from 'lucide-react';

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
        email: true
      }
    });

    return client;
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getClient(id);
  
  return {
    title: client 
      ? `Analysis History - ${client.firstName} ${client.lastName}`
      : 'Analysis History'
  };
}

export default async function AnalysisHistoryPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  const clientName = `${client.firstName} ${client.lastName}`;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analysis History</h1>
            <p className="text-gray-600">
              Claude Desktop analyses for <span className="font-medium">{clientName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clients/${client.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Client
            </Link>
          </Button>
          
          <Button asChild>
            <Link href={`/dashboard/clients/${client.id}/analysis/import`}>
              <Plus className="h-4 w-4 mr-2" />
              Import Analysis
            </Link>
          </Button>
        </div>
      </div>

      <AnalysisHistoryList clientId={client.id} />
    </div>
  );
}
