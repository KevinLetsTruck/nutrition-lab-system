'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Brain,
  Activity,
  Target,
  Download,
  Upload,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

type WorkflowStep = 'export' | 'analyze' | 'import' | 'track';

interface WorkflowNavigationProps {
  currentStep?: WorkflowStep;
  clientId?: string;
  clientName?: string;
  protocolId?: string;
  className?: string;
  showStepDetails?: boolean;
}

export function WorkflowNavigation({
  currentStep,
  clientId,
  clientName,
  protocolId,
  className = '',
  showStepDetails = true,
}: WorkflowNavigationProps) {
  
  const steps = [
    {
      id: 'export' as const,
      title: 'Export Data',
      description: 'Export client data with Claude Desktop prompts',
      icon: BarChart3,
      color: 'blue',
      actions: clientId ? [
        { label: 'Timeline Analysis', href: `/dashboard/clients/${clientId}`, action: 'timeline' },
        { label: 'Export Data + PDFs', href: `/dashboard/clients/${clientId}`, action: 'export' },
      ] : [],
    },
    {
      id: 'analyze' as const,
      title: 'AI Analysis',
      description: 'Claude Desktop analysis with intelligent prompts',
      icon: Brain,
      color: 'purple',
      actions: [
        { label: 'Upload to Claude Desktop', href: '#', external: true },
        { label: 'Use included prompt', href: '#', external: true },
      ],
    },
    {
      id: 'import' as const,
      title: 'Import Results',
      description: 'Import protocols with professional documents',
      icon: Activity,
      color: 'green',
      actions: clientId ? [
        { label: 'Import Protocol', href: `/dashboard/clients/${clientId}`, action: 'import' },
        { label: 'Generate Documents', href: `/dashboard/clients/${clientId}`, action: 'import' },
      ] : [],
    },
    {
      id: 'track' as const,
      title: 'Track Progress',
      description: 'Monitor implementation and client outcomes',
      icon: Target,
      color: 'orange',
      actions: protocolId ? [
        { label: 'Progress Monitoring', href: `/dashboard/protocols/${protocolId}/progress` },
        { label: 'Status Management', href: `/dashboard/protocols/${protocolId}` },
      ] : [],
    },
  ];

  const getStepStatus = (stepId: WorkflowStep) => {
    if (!currentStep) return 'pending';
    
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'active': return <Clock className="h-4 w-4 text-blue-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (color: string, status: string) => {
    const intensity = status === 'active' ? '500' : status === 'completed' ? '400' : '600';
    const bgIntensity = status === 'active' ? '900/40' : status === 'completed' ? '900/20' : '900/10';
    
    return {
      border: `border-${color}-${intensity}`,
      bg: `bg-${color}-${bgIntensity}`,
      text: `text-${color}-300`,
      icon: `text-${color}-400`,
    };
  };

  if (!showStepDetails) {
    // Compact version
    return (
      <div className={`flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 ${className}`}>
        <span className="text-sm font-medium text-gray-300">Workflow:</span>
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === steps.length - 1;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className={`text-xs ${status === 'active' ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
                {!isLast && <ArrowRight className="h-3 w-3 text-gray-500" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Full version
  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            AI-Enhanced Workflow Progress
          </h3>
          {clientName && (
            <p className="text-sm text-gray-400">
              Client: {clientName}
            </p>
          )}
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                <div className={`p-4 rounded-lg border transition-all ${
                  status === 'active' 
                    ? `bg-${step.color}-900/40 border-${step.color}-500` 
                    : status === 'completed'
                    ? `bg-${step.color}-900/20 border-${step.color}-400`
                    : `bg-gray-900/20 border-gray-600`
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      status === 'active' ? `bg-${step.color}-600` : 
                      status === 'completed' ? `bg-${step.color}-500` : 'bg-gray-600'
                    }`}>
                      <StepIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        status === 'active' ? 'text-white' : 
                        status === 'completed' ? 'text-gray-200' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(status)}
                        <span className="text-xs text-gray-400 capitalize">{status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-3">
                    {step.description}
                  </p>
                  
                  {step.actions.length > 0 && status !== 'completed' && (
                    <div className="space-y-1">
                      {step.actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-7"
                        >
                          <Link href={action.href}>
                            {action.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                {!isLast && (
                  <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-gray-500 bg-brand-navy p-1 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {currentStep && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Current Step</span>
            </div>
            <p className="text-sm text-gray-300">
              You're currently on: <strong>{steps.find(s => s.id === currentStep)?.title}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {steps.find(s => s.id === currentStep)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
