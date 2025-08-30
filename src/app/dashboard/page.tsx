'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowNavigation } from '@/components/navigation/WorkflowNavigation';
import { FeatureDiscovery } from '@/components/navigation/FeatureDiscovery';
import {
  Sparkles,
  Users,
  FlaskConical,
  Calendar,
  Activity,
  TrendingUp,
  Brain,
  Target,
  BarChart3,
  ArrowRight,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  activeProtocols: number;
  scheduledClients: number;
  recentActivity: number;
}

interface RecentClient {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  lastActivity: string;
}

export default function DashboardOverview() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeProtocols: 0,
    scheduledClients: 0,
    recentActivity: 0,
  });
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeatureDiscovery, setShowFeatureDiscovery] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const clients = data.clients || [];
        
        setStats({
          totalClients: clients.length,
          activeProtocols: 0, // Would calculate from protocols
          scheduledClients: clients.filter((c: any) => c.status === 'SCHEDULED').length,
          recentActivity: clients.length,
        });
        
        setRecentClients(clients.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'bg-green-100 text-green-800 border-green-300';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ASSESSMENT_COMPLETED': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DOCS_UPLOADED': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-2 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Your AI-Enhanced Practice
          </h1>
          <p className="text-gray-300">
            Complete functional medicine workflow with Claude Desktop integration
          </p>
        </div>

        {/* Feature Discovery */}
        {showFeatureDiscovery && (
          <FeatureDiscovery onDismiss={() => setShowFeatureDiscovery(false)} />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer" asChild>
            <Link href="/dashboard/clients">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
                <div className="text-sm text-gray-400">Total Clients</div>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 hover:border-green-500 transition-colors cursor-pointer" asChild>
            <Link href="/dashboard/protocols">
              <CardContent className="p-6 text-center">
                <FlaskConical className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.activeProtocols}</div>
                <div className="text-sm text-gray-400">Active Protocols</div>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer" asChild>
            <Link href="/dashboard/scheduled">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.scheduledClients}</div>
                <div className="text-sm text-gray-400">Thursday Calls</div>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors cursor-pointer" asChild>
            <Link href="/dashboard/workflow">
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.recentActivity}</div>
                <div className="text-sm text-gray-400">AI Workflow</div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Workflow Navigation */}
        <WorkflowNavigation showStepDetails={true} />

        {/* Recent Clients & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Recent Clients */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-blue-400" />
                Recent Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentClients.length > 0 ? (
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-sm">
                            {client.firstName} {client.lastName}
                          </h4>
                          <Badge 
                            className={`text-xs ${getStatusColor(client.status)} border`}
                          >
                            {formatStatus(client.status)}
                          </Badge>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/dashboard/clients">
                      <Users className="h-4 w-4 mr-2" />
                      View All Clients
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No clients yet</p>
                  <Button asChild>
                    <Link href="/dashboard/clients">
                      <Users className="h-4 w-4 mr-2" />
                      Add Your First Client
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <Button asChild className="w-full h-auto p-4" variant="outline">
                <Link href="/dashboard/clients" className="block text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-white">Manage Clients</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Add clients, upload documents, start assessments
                  </p>
                </Link>
              </Button>

              <Button asChild className="w-full h-auto p-4" variant="outline">
                <Link href="/dashboard/protocols" className="block text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <FlaskConical className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-white">Protocol Management</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Create, import, and track treatment protocols
                  </p>
                </Link>
              </Button>

              <Button asChild className="w-full h-auto p-4" variant="outline">
                <Link href="/dashboard/workflow" className="block text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-white">AI Workflow Guide</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Learn the complete Export → Analyze → Import → Track workflow
                  </p>
                </Link>
              </Button>

              <Button asChild className="w-full h-auto p-4" variant="outline">
                <Link href="/dashboard/scheduled" className="block text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-orange-400" />
                    <span className="font-medium text-white">Thursday Calls</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    View and manage scheduled coaching calls
                  </p>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div>
                  <h3 className="font-semibold text-white">System Status: Fully Operational</h3>
                  <p className="text-sm text-gray-300">
                    All AI-enhanced features are active and ready for use
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Export System</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Import System</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Progress Tracking</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Claude Integration</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
