'use client';

import { useState, useEffect } from 'react';
import { useClientAuth } from '@/lib/client-auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  BarChart3,
  MapPin,
  Calendar,
  TrendingUp,
  Target,
  Truck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Activity,
  Clock,
  Star,
  Users,
  Phone,
  Mail,
  Zap,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface ClientDashboardData {
  recentAssessment?: {
    id: string;
    completedAt: string;
    averageScore: number;
  };
  upcomingCoaching?: {
    date: string;
    topic: string;
    questionsSubmitted: number;
  };
  progressTracking?: {
    weekNumber: number;
    lastUpdate: string;
    improvementScore: number;
  };
}

export default function ClientDashboard() {
  const { clientUser } = useClientAuth();
  const [dashboardData, setDashboardData] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientUser) {
      fetchDashboardData();
    }
  }, [clientUser]);

  const fetchDashboardData = async () => {
    try {
      // TODO: Implement actual dashboard data fetching
      // For now, use mock data
      setDashboardData({
        recentAssessment: clientUser?.assessmentCompleted ? {
          id: '1',
          completedAt: new Date().toISOString(),
          averageScore: 3.2,
        } : undefined,
        upcomingCoaching: {
          date: getNextThursday(),
          topic: 'Healthy Eating on the Road',
          questionsSubmitted: 0,
        },
        progressTracking: {
          weekNumber: 3,
          lastUpdate: new Date().toISOString(),
          improvementScore: 0.8,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextThursday = (): string => {
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    return nextThursday.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {clientUser?.firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Your health journey, optimized for life on the road
        </p>
      </div>

      {/* Subscription Status */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <Badge 
                  className={`${getSubscriptionStatusColor(clientUser?.subscriptionStatus || 'trial')} border mb-1`}
                >
                  {clientUser?.subscriptionStatus === 'active' ? 'Active Member' :
                   clientUser?.subscriptionStatus === 'trial' ? 'Trial Member' : 'Expired Member'}
                </Badge>
                <p className="text-sm text-gray-600">
                  {clientUser?.subscriptionStatus === 'active' && 'Full access to all health tools & coaching'}
                  {clientUser?.subscriptionStatus === 'trial' && '7-day trial - upgrade for full access'}
                  {clientUser?.subscriptionStatus === 'expired' && 'Renew to continue accessing tools'}
                </p>
              </div>
            </div>
            
            {clientUser?.subscriptionStatus !== 'active' && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Status */}
      {!clientUser?.assessmentCompleted ? (
        <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Complete Your Health Assessment
              </h3>
              <p className="text-gray-600 mb-4">
                Get personalized insights about your health in just 15 minutes. This helps us create the perfect plan for your life on the road.
              </p>
              <Button asChild className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-green-600">
                <Link href="/client/assessment">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Start Your Assessment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-600 rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Assessment Complete ✨
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your health profile is ready! View your results and track your progress over time.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild size="sm" variant="outline" className="h-10">
                    <Link href="/client/assessment/results">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Results
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="h-10">
                    <Link href="/client/assessment/new">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      New Assessment
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-blue-300" asChild>
          <Link href="/client/travel-tools">
            <CardContent className="p-4 text-center">
              <div className="p-3 bg-blue-600 rounded-full w-12 h-12 mx-auto mb-3">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Travel Tools</h3>
              <p className="text-xs text-gray-600">Healthy eating on the road</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-green-300" asChild>
          <Link href="/client/coaching">
            <CardContent className="p-4 text-center">
              <div className="p-3 bg-green-600 rounded-full w-12 h-12 mx-auto mb-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Coaching</h3>
              <p className="text-xs text-gray-600">Thursday group calls</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Upcoming Thursday Call */}
      {dashboardData?.upcomingCoaching && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5 text-yellow-600" />
              Next Thursday Call
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {dashboardData.upcomingCoaching.date}
                  </p>
                  <p className="text-sm text-gray-600">
                    Topic: {dashboardData.upcomingCoaching.topic}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {dashboardData.upcomingCoaching.questionsSubmitted} questions
                  </p>
                  <p className="text-xs text-gray-500">submitted</p>
                </div>
              </div>
              
              <Button asChild className="w-full h-10 bg-yellow-600 hover:bg-yellow-700">
                <Link href="/client/coaching">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Submit Questions for Call
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-4">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {dashboardData?.recentAssessment ? 
                dashboardData.recentAssessment.averageScore.toFixed(1) : '--'
              }
            </div>
            <div className="text-xs text-gray-600">Health Score</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {dashboardData?.progressTracking?.weekNumber || '--'}
            </div>
            <div className="text-xs text-gray-600">Week #</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {dashboardData?.progressTracking?.improvementScore ? 
                `+${(dashboardData.progressTracking.improvementScore * 100).toFixed(0)}%` : '--'
              }
            </div>
            <div className="text-xs text-gray-600">Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Activity className="h-5 w-5 text-orange-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clientUser?.assessmentCompleted && dashboardData?.recentAssessment && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assessment Completed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(dashboardData.recentAssessment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/client/assessment/results">
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Joined TruckHealth</p>
                  <p className="text-xs text-gray-500">
                    {clientUser?.createdAt ? new Date(clientUser.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-blue-600 font-medium">Welcome!</div>
            </div>
            
            {!clientUser?.assessmentCompleted && (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Complete your assessment to see more activity here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Zap className="h-5 w-5 text-purple-600" />
            Your Health Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Travel Health Tools</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Find healthy food options, plan route stops, and maintain your health while on the road.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/client/travel-tools">
                  <MapPin className="h-4 w-4 mr-2" />
                  Explore Travel Tools
                </Link>
              </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Progress Tracking</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Track your daily symptoms, energy levels, and protocol compliance.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/client/progress">
                  <Activity className="h-4 w-4 mr-2" />
                  Track Progress
                </Link>
              </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-gray-900">Community Support</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Connect with other health-focused truckers and join Thursday coaching calls.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/client/coaching">
                  <Calendar className="h-4 w-4 mr-2" />
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-gray-800 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-medium mb-2">Need Help?</h4>
            <p className="text-sm text-gray-300 mb-4">
              Our support team is here to help you succeed on your health journey.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                <Link href="mailto:support@destinationhealth.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                <Link href="tel:+1234567890">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
