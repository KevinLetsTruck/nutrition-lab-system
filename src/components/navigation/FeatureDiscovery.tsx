'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  BarChart3,
  Brain,
  Activity,
  Target,
  Download,
  Upload,
  Users,
  FlaskConical,
  ArrowRight,
  X,
  HelpCircle,
  Zap,
  CheckCircle,
  FileText,
  Monitor,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface FeatureDiscoveryProps {
  onDismiss?: () => void;
  showCompact?: boolean;
}

export function FeatureDiscovery({
  onDismiss,
  showCompact = false,
}: FeatureDiscoveryProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'export-system',
      title: 'Enhanced Export System',
      description: 'Export client data with intelligent Claude Desktop prompts',
      icon: BarChart3,
      color: 'blue',
      badge: 'Phase 1',
      capabilities: [
        'Timeline Analysis with FM lab ranges',
        'Export Data + PDFs with documents',
        'Intelligent Claude Desktop prompts',
        'Assessment categorization (16 categories)',
        'Critical findings analysis',
      ],
      quickAction: { label: 'Try Export', href: '/dashboard/clients' },
    },
    {
      id: 'protocol-import',
      title: 'Protocol Import & Formatting',
      description:
        'Import Claude Desktop results with professional document generation',
      icon: Activity,
      color: 'green',
      badge: 'Phase 2',
      capabilities: [
        'Structured JSON protocol import',
        'Auto-generated coaching notes',
        'Professional client letters',
        'Organized supplement lists',
        'Database storage with tracking',
      ],
      quickAction: { label: 'Import Protocol', href: '/dashboard/clients' },
    },
    {
      id: 'progress-tracking',
      title: 'Protocol Management & Tracking',
      description: 'Client progress monitoring with visual dashboards',
      icon: Target,
      color: 'orange',
      badge: 'Phase 3',
      capabilities: [
        'Client self-reporting (health metrics)',
        'Practitioner monitoring dashboards',
        'Protocol lifecycle management',
        'Compliance tracking & trends',
        'Evidence-based outcome analysis',
      ],
      quickAction: { label: 'View Protocols', href: '/dashboard/protocols' },
    },
    {
      id: 'ai-enhancement',
      title: 'Claude Desktop Integration',
      description:
        'Intelligent prompts for superior functional medicine analysis',
      icon: Brain,
      color: 'purple',
      badge: 'Enhanced',
      capabilities: [
        'Client-specific analysis prompts',
        'Functional medicine framework',
        'Document type recognition',
        'Structured JSON output',
        'Evidence-based protocol development',
      ],
      quickAction: { label: 'AI Workflow', href: '/dashboard/workflow' },
    },
  ];

  if (showCompact) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <div>
                <h4 className="font-medium text-white text-sm">
                  AI-Enhanced Features Available
                </h4>
                <p className="text-xs text-gray-400">
                  Complete workflow: Export → Analyze → Import → Track
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/workflow">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Explore
                </Link>
              </Button>
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Feature Discovery
          </CardTitle>
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          Explore your AI-enhanced functional medicine practice capabilities
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {features.map(feature => {
            const FeatureIcon = feature.icon;
            const isExpanded = activeFeature === feature.id;

            return (
              <div
                key={feature.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isExpanded
                    ? `bg-${feature.color}-900/30 border-${feature.color}-500`
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setActiveFeature(isExpanded ? null : feature.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FeatureIcon
                      className={`h-5 w-5 text-${feature.color}-400`}
                    />
                    <div>
                      <h4 className="font-medium text-white text-sm">
                        {feature.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs border-${feature.color}-400 text-${feature.color}-300`}
                      >
                        {feature.badge}
                      </Badge>
                    </div>
                  </div>
                  <HelpCircle
                    className={`h-4 w-4 ${isExpanded ? 'text-white' : 'text-gray-500'}`}
                  />
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  {feature.description}
                </p>

                {isExpanded && (
                  <div className="space-y-3 mt-4 pt-3 border-t border-gray-600">
                    <div>
                      <h5 className="text-xs font-medium text-gray-300 mb-2">
                        Key Capabilities
                      </h5>
                      <div className="space-y-1">
                        {feature.capabilities.map((capability, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                            <span className="text-xs text-gray-300">
                              {capability}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="w-full"
                      variant="outline"
                    >
                      <Link href={feature.quickAction.href}>
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {feature.quickAction.label}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Start Actions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h4 className="font-medium text-white text-sm">Quick Start</h4>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Button asChild size="sm" variant="outline" className="h-auto p-3">
              <Link href="/dashboard/clients" className="block text-left">
                <Users className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Add Client</span>
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-auto p-3">
              <Link
                href="/dashboard/protocols/create"
                className="block text-left"
              >
                <FlaskConical className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Create Protocol</span>
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-auto p-3">
              <Link href="/dashboard/workflow" className="block text-left">
                <Sparkles className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Learn Workflow</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
