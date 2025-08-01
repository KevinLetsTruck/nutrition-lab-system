'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ConversationProgressProps {
  conversationId: string | null;
  currentSection: string;
  onSectionClick?: (section: string) => void;
}

interface SectionProgress {
  name: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'validated';
  messageCount: number;
  patterns?: string[];
  confidence?: number;
}

const SECTIONS = [
  { name: 'introduction', label: 'Introduction' },
  { name: 'digestive', label: 'Digestive Health' },
  { name: 'reproductive', label: 'Reproductive Health' },
  { name: 'neurological', label: 'Neurological' },
  { name: 'cardiovascular', label: 'Heart & Circulation' },
  { name: 'respiratory', label: 'Breathing & Lungs' },
  { name: 'musculoskeletal', label: 'Muscles & Joints' },
  { name: 'endocrine', label: 'Hormones & Metabolism' },
  { name: 'immune', label: 'Immune System' },
  { name: 'mental_emotional', label: 'Mental & Emotional' },
  { name: 'lifestyle', label: 'Lifestyle Factors' },
  { name: 'summary', label: 'Summary & Analysis' }
];

export function ConversationProgress({
  conversationId,
  currentSection,
  onSectionClick
}: ConversationProgressProps) {
  const [sections, setSections] = useState<SectionProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);

  const loadProgress = useCallback(async () => {
    if (!conversationId) return;

    try {
      // Get message counts by section
      const { data: messages } = await supabase
        .from('conversation_messages')
        .select('section')
        .eq('conversation_id', conversationId);

      // Get analysis data
      const { data: analysis } = await supabase
        .from('conversation_analysis')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Calculate section progress
      const sectionProgress = SECTIONS.map(section => {
        const sectionMessages = messages?.filter(m => m.section === section.name) || [];
        let status: SectionProgress['status'] = 'pending';
        
        if (section.name === currentSection) {
          status = 'in-progress';
        } else if (sectionMessages.length > 0) {
          const currentIndex = SECTIONS.findIndex(s => s.name === currentSection);
          const sectionIndex = SECTIONS.findIndex(s => s.name === section.name);
          if (sectionIndex < currentIndex) {
            status = 'completed';
          }
        }

        return {
          name: section.name,
          label: section.label,
          status,
          messageCount: sectionMessages.length,
          patterns: analysis?.patterns_detected?.[section.name] || [],
          confidence: analysis?.confidence_scores?.[section.name]
        };
      });

      setSections(sectionProgress);

      // Calculate overall progress
      const completedSections = sectionProgress.filter(s => s.status === 'completed').length;
      setOverallProgress((completedSections / (SECTIONS.length - 1)) * 100);

      // Extract unique patterns
      if (analysis?.patterns_detected) {
        const allPatterns = Object.values(analysis.patterns_detected).flat() as string[];
        setDetectedPatterns([...new Set(allPatterns)]);
      }

      // Get conversation duration
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('started_at')
        .eq('id', conversationId)
        .single();

      if (conversation?.started_at) {
        const duration = Date.now() - new Date(conversation.started_at).getTime();
        setTotalDuration(Math.floor(duration / 1000 / 60)); // minutes
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, [conversationId, currentSection]);

  useEffect(() => {
    if (!conversationId) return;

    loadProgress();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, () => {
        loadProgress();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, loadProgress]);

  const getStatusIcon = (status: SectionProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'validated':
        return <CheckCircle className="h-5 w-5 text-green-700 fill-current" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Assessment Progress</h3>
        <Progress value={overallProgress} className="mb-2" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{Math.round(overallProgress)}% Complete</span>
          <span>{totalDuration} min</span>
        </div>
      </Card>

      {/* Section List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Sections</h3>
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.name}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                section.status === 'in-progress'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSectionClick?.(section.name)}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(section.status)}
                <span className={`text-sm ${
                  section.status === 'in-progress' ? 'font-medium' : ''
                }`}>
                  {section.label}
                </span>
              </div>
              {section.messageCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {section.messageCount}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Detected Patterns */}
      {detectedPatterns.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Patterns Detected</h3>
          </div>
          <div className="space-y-2">
            {detectedPatterns.slice(0, 3).map((pattern, idx) => (
              <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>{pattern}</span>
              </div>
            ))}
            {detectedPatterns.length > 3 && (
              <p className="text-sm text-gray-500">
                +{detectedPatterns.length - 3} more patterns
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Time Estimate */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Estimated time remaining: {15 - Math.floor(overallProgress / 100 * 15)} min</span>
        </div>
      </Card>
    </div>
  );
}