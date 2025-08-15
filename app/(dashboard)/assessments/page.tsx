'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AssessmentsPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Health Assessments</h1>
          <Button onClick={() => router.push('/assessment/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-600 text-center">
            Start a new assessment to analyze your health and receive personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
