'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  BarChart3,
  Brain,
  Activity,
  Workflow,
  Users,
  FlaskConical,
  ArrowRight,
  Target,
  Upload,
  Download,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Calendar,
} from 'lucide-react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  protocolCount: number;
}

export default function AIWorkflowDashboard() {
  const { token } = useAuth();
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProtocols: 0,
    completedExports: 0,
    progressReports: 0,
  });

  // Force cache bust for Railway deployment
  console.log('AI Workflow Dashboard loaded - v2.0');

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent clients (simplified for now)
      const clientsResponse = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setRecentClients(clientsData.clients?.slice(0, 5) || []);
        setStats(prev => ({
          ...prev,
          totalClients: clientsData.clients?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              AI-Enhanced Workflow
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Complete functional medicine practice management with Claude Desktop
            integration, intelligent protocol development, and evidence-based
            progress tracking.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.totalClients}
              </div>
              <div className="text-sm text-gray-400">Total Clients</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <FlaskConical className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.activeProtocols}
              </div>
              <div className="text-sm text-gray-400">Active Protocols</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.completedExports}
              </div>
              <div className="text-sm text-gray-400">AI Exports</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.progressReports}
              </div>
              <div className="text-sm text-gray-400">Progress Reports</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Workflow Process */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-xl">
              <Workflow className="h-6 w-6 text-blue-400" />
              Complete AI-Enhanced Workflow
            </CardTitle>
            <p className="text-gray-400">
              Your complete functional medicine practice workflow with Claude
              Desktop integration
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Step 1: Export */}
              <div className="relative">
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        1. Export Data
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-800"
                      >
                        Enhanced
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Export client data with intelligent Claude Desktop prompts
                    for optimal AI analysis.
                  </p>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Timeline Analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Export Data + PDFs
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-blue-400" />
                      Claude Desktop Prompts
                    </div>
                  </div>
                </div>
                <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-500" />
                </div>
              </div>

              {/* Step 2: Analyze */}
              <div className="relative">
                <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        2. AI Analysis
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-purple-100 text-purple-800"
                      >
                        Claude Desktop
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Claude Desktop analyzes with intelligent prompts for
                    superior functional medicine insights.
                  </p>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Root Cause Analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      System Prioritization
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Evidence-Based Protocols
                    </div>
                  </div>
                </div>
                <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-500" />
                </div>
              </div>

              {/* Step 3: Import */}
              <div className="relative">
                <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        3. Import Results
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        Professional
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Import structured protocols with auto-generated professional
                    documents.
                  </p>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Coaching Notes
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Client Letters
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Supplement Lists
                    </div>
                  </div>
                </div>
                <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-500" />
                </div>
              </div>

              {/* Step 4: Track */}
              <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-600 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      4. Track Progress
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-orange-100 text-orange-800"
                    >
                      Monitoring
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Monitor client progress with visual dashboards and
                  evidence-based tracking.
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    Health Metrics
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    Compliance Tracking
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    Trend Analysis
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Categories */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Export & Analysis Features */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-blue-400" />
                Export & AI Analysis
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Enhanced export system with Claude Desktop integration
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">
                      Timeline Analysis
                    </h4>
                    <p className="text-xs text-gray-400">
                      Comprehensive FM analysis with lab ranges & assessment
                      categorization
                    </p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-400 text-blue-300"
                  >
                    30+ Lab Ranges
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-400 text-blue-300"
                  >
                    16 Categories
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-400 text-blue-300"
                  >
                    Claude Ready
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">
                      Export Data + PDFs
                    </h4>
                    <p className="text-xs text-gray-400">
                      ZIP with documents + intelligent Claude Desktop prompts
                    </p>
                  </div>
                  <Download className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-green-400 text-green-300"
                  >
                    Smart Prompts
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-400 text-green-300"
                  >
                    All PDFs
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-400 text-green-300"
                  >
                    JSON Data
                  </Badge>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href="/dashboard/clients">
                  <Users className="h-4 w-4 mr-2" />
                  Go to Clients for Export Options
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Protocol Management Features */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Workflow className="h-5 w-5 text-green-400" />
                Protocol Management
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Complete protocol lifecycle with progress tracking
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">Import Protocol</h4>
                    <p className="text-xs text-gray-400">
                      Claude Desktop results with professional document
                      generation
                    </p>
                  </div>
                  <Upload className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-green-400 text-green-300"
                  >
                    Coaching Notes
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-400 text-green-300"
                  >
                    Client Letters
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-400 text-green-300"
                  >
                    Supplement Lists
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">
                      Progress Tracking
                    </h4>
                    <p className="text-xs text-gray-400">
                      Client self-reporting with practitioner monitoring
                      dashboards
                    </p>
                  </div>
                  <Target className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-400 text-orange-300"
                  >
                    Health Metrics
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-400 text-orange-300"
                  >
                    Compliance
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-400 text-orange-300"
                  >
                    Trend Analysis
                  </Badge>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href="/dashboard/protocols">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Go to Protocol Management
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Fast access to common workflow tasks
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 border-gray-600 hover:border-blue-500"
              >
                <Link href="/dashboard/clients" className="block text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-white">
                      Client Management
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Add clients, upload documents, manage assessments
                  </p>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 border-gray-600 hover:border-purple-500"
              >
                <Link
                  href="/dashboard/protocols/create"
                  className="block text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FlaskConical className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-white">
                      Create Protocol
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Start new protocol development workflow
                  </p>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 border-gray-600 hover:border-green-500"
              >
                <Link href="/dashboard/scheduled" className="block text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-white">
                      Thursday Calls
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    View scheduled clients and coaching calls
                  </p>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Clients with Workflow Status */}
        {recentClients.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-green-400" />
                Recent Clients
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Quick access to recent client workflows
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentClients.map(client => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {client.firstName.charAt(0)}
                          {client.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {client.firstName} {client.lastName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              client.status === 'ONGOING'
                                ? 'border-green-400 text-green-300'
                                : client.status === 'SCHEDULED'
                                  ? 'border-blue-400 text-blue-300'
                                  : 'border-gray-400 text-gray-300'
                            }`}
                          >
                            {client.status}
                          </Badge>
                          <span className="text-gray-400">
                            {client.protocolCount} protocol
                            {client.protocolCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/clients">
                    <Users className="h-4 w-4 mr-2" />
                    View All Clients
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started Guide */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Getting Started with AI Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-3">For New Users</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>1. Add your first client</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>2. Upload assessments and documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>3. Export data with Claude Desktop prompts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>4. Get AI analysis and import protocols</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-3">Key Features</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Intelligent Claude Desktop prompts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Professional document generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Client progress monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Evidence-based outcome tracking</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link href="/dashboard/clients">
                  <Users className="h-4 w-4 mr-2" />
                  Start with Clients
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/protocols/create">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Create First Protocol
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
