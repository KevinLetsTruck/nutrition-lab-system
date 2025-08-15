'use client';

import { useParams, useRouter } from 'next/navigation';
import { AssessmentFlow } from '@/components/assessment';
import { toast } from 'react-hot-toast';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  
  // In a real app, you'd get the clientId from the assessment or session
  // For now, we'll use a placeholder
  const clientId = 'placeholder-client-id';

  const handleComplete = () => {
    toast.success('Assessment completed successfully!');
    router.push(`/assessments/${assessmentId}/results`);
  };

  return (
    <AssessmentFlow
      assessmentId={assessmentId}
      clientId={clientId}
      onComplete={handleComplete}
    />
  );
}
