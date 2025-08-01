'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ChevronRight, User } from 'lucide-react';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // If we get a 401, it might be Vercel's auth protection
        if (response.status === 401) {
          console.error('Authentication required by Vercel');
          // Try to get clients data another way or show a message
          throw new Error('Authentication required. Please ensure you are logged in.');
        }
        throw new Error(`Failed to fetch clients: ${response.status}`);
      }
      
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-800">Error: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Assessments</h1>
        <p className="text-gray-600">Select a client to begin an assessment</p>
      </div>

      {clients.length === 0 ? (
        <Card className="p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Clients Found</h3>
          <p className="text-gray-600 mb-4">Add a client to begin assessments</p>
          <Button 
            onClick={() => router.push('/admin/quick-add-client')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Client
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {client.first_name} {client.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Client ID: {client.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Added: {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/assessments/structured/${client.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Structured Assessment
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => router.push(`/assessments/ai-conversation/${client.id}`)}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    AI Conversation
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <Brain className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Structured Assessment</h3>
          <p className="text-gray-700">
            A guided questionnaire that systematically evaluates health patterns across multiple domains.
            Takes approximately 15-20 minutes.
          </p>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <FileText className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI Conversation</h3>
          <p className="text-gray-700">
            A conversational assessment where AI asks follow-up questions based on responses.
            More flexible and adaptive approach.
          </p>
        </Card>
      </div>
    </div>
  );
}