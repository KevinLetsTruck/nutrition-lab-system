'use client';

import { useState } from 'react';
import { useClientAuth } from '@/lib/client-auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Calendar,
  MessageCircle,
  Users,
  Clock,
  ArrowLeft,
  Send,
  CheckCircle,
  Phone,
  Mail,
  Star,
} from 'lucide-react';

export default function ClientCoachingPage() {
  const { clientUser } = useClientAuth();
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    try {
      // TODO: Implement question submission API
      console.log('Submitting question for Thursday call:', question);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Question submitted for Thursday call!');
      setQuestion('');
    } catch (error) {
      alert('Failed to submit question - please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const getNextThursday = () => {
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    return nextThursday.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/client/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        
        <div>
          <h1 className="text-xl font-bold text-gray-900">Group Coaching</h1>
          <p className="text-sm text-gray-600">Thursday calls and community support</p>
        </div>
      </div>

      {/* Next Thursday Call */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="h-5 w-5 text-green-600" />
            Next Thursday Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{getNextThursday()}</p>
                <p className="text-sm text-gray-600">7:00 PM EST</p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300 border">
                Registered
              </Badge>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-1">This Week's Topic</h4>
              <p className="text-sm text-gray-600">
                "Healthy Eating on the Road: Practical Strategies for Truck Drivers"
              </p>
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1" variant="outline">
                <Link href="tel:+1234567890">
                  <Phone className="h-4 w-4 mr-2" />
                  Call In
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="mailto:support@destinationhealth.com?subject=Thursday Call Link">
                  <Mail className="h-4 w-4 mr-2" />
                  Get Link
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Submit Questions for Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Have a question for the group coaching call? Submit it here and we'll address it on Thursday.
              </p>
              <Textarea
                placeholder="What health challenge are you facing on the road? What would you like help with?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="resize-none text-base"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Questions can be asked anonymously if desired
              </p>
              <Button 
                type="submit" 
                disabled={!question.trim() || submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Question
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Community Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Users className="h-5 w-5 text-purple-600" />
            TruckHealth Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-2">Connect with Fellow Drivers</h4>
              <p className="text-sm text-gray-600 mb-3">
                Join our community of health-focused truck drivers sharing tips, success stories, and mutual support.
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Users className="h-4 w-4 mr-2" />
                Community Features Coming Soon
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">Success Stories</p>
                <p className="text-xs text-gray-600">Coming soon</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">Peer Support</p>
                <p className="text-xs text-gray-600">Coming soon</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Schedule */}
      <Card className="bg-gray-800 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-3 text-green-400" />
            <h4 className="font-medium mb-2">Weekly Schedule</h4>
            <p className="text-sm text-gray-300 mb-4">
              Every Thursday at 7:00 PM EST - Group coaching call for all TruckHealth members
            </p>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-400">
                <strong>Call Format:</strong> 60 minutes of Q&A, health tips, and community support specifically for truck drivers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
