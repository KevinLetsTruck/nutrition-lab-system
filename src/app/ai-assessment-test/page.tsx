'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function AIAssessmentTest() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setClients(data || []);
      }
      setLoading(false);
    };

    fetchClients();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI Assessment Test Page</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Select a Client to Test AI Assessment</h2>
        
        {loading ? (
          <p>Loading clients...</p>
        ) : clients.length === 0 ? (
          <div>
            <p className="text-red-600 mb-4">No clients found in the database!</p>
            <p>You need to create some clients first. Go to the <Link href="/clients" className="text-blue-600 underline">Clients page</Link> to add clients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{client.first_name} {client.last_name}</p>
                  <p className="text-sm text-gray-600">ID: {client.id}</p>
                </div>
                <div className="space-x-2">
                  <Link href={`/client/${client.id}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                  <Link href={`/assessments/ai-conversation/${client.id}`}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Start AI Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to use AI Assessment:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Select a client from the list above</li>
          <li>Click "Start AI Assessment" to begin the conversation</li>
          <li>The AI will guide the client through a health assessment</li>
          <li>Responses are saved automatically</li>
        </ol>
      </div>
    </div>
  );
}