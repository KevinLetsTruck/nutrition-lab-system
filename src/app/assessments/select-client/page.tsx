'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ChevronRight, Info } from 'lucide-react';

// Hardcoded client data from the database check
const AVAILABLE_CLIENTS = [
  { id: '336ac9e9-dda3-477f-89d5-241df47b8745', first_name: 'Kevin', last_name: 'Test' },
  { id: 'bdd08f80-19a0-4f17-9585-230dba3ec448', first_name: 'Mike', last_name: 'Wilson' },
  { id: '2af9df36-3cb4-49f9-a5fc-005101c6e239', first_name: 'Sarah', last_name: 'Johnson' },
  { id: 'ee68d17b-8416-4019-871a-adbe47da01e9', first_name: 'John', last_name: 'Smith' },
  { id: '35f3fd2a-458f-4167-ab18-c7f532a25e4b', first_name: 'Kevin', last_name: 'Rutherford' },
];

export default function SelectClientPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Client for Assessment</h1>
        <p className="text-gray-600">Choose a client to begin health assessment</p>
      </div>

      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              These are the available clients in your system. Click on any client to start their assessment.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {AVAILABLE_CLIENTS.map((client) => (
          <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {client.first_name} {client.last_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {client.id}
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

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <Brain className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Structured Assessment</h3>
          <p className="text-gray-700">
            A guided questionnaire that systematically evaluates health patterns across multiple domains.
            Takes approximately 15-20 minutes.
          </p>
          <ul className="mt-3 text-sm text-gray-600 space-y-1">
            <li>• Energy & Fatigue evaluation</li>
            <li>• Sleep & Recovery patterns</li>
            <li>• Digestive health screening</li>
            <li>• Stress & Mood assessment</li>
            <li>• Pain & Inflammation check</li>
            <li>• Metabolic health review</li>
          </ul>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <FileText className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI Conversation</h3>
          <p className="text-gray-700">
            A conversational assessment where AI asks follow-up questions based on responses.
            More flexible and adaptive approach.
          </p>
          <ul className="mt-3 text-sm text-gray-600 space-y-1">
            <li>• Natural conversation flow</li>
            <li>• Adaptive questioning</li>
            <li>• Personalized depth</li>
            <li>• Context-aware follow-ups</li>
            <li>• Comprehensive analysis</li>
          </ul>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need to add a new client? Contact your administrator.
        </p>
      </div>
    </div>
  );
}