'use client';

import { useState } from 'react';
import { useClientAuth } from '@/lib/client-auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Settings,
  ArrowLeft,
  Edit,
  Save,
  Star,
  Truck,
  CheckCircle,
  CreditCard,
} from 'lucide-react';

export default function ClientProfilePage() {
  const { clientUser, logout } = useClientAuth();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(clientUser?.firstName || '');
  const [lastName, setLastName] = useState(clientUser?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(clientUser?.phoneNumber || '');

  const handleSave = async () => {
    try {
      // TODO: Implement profile update API
      console.log('Updating profile:', { firstName, lastName, phoneNumber });
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFirstName(clientUser?.firstName || '');
    setLastName(clientUser?.lastName || '');
    setPhoneNumber(clientUser?.phoneNumber || '');
    setEditing(false);
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
          <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-sm text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
            {!editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-12"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {clientUser?.firstName?.charAt(0)}{clientUser?.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {clientUser?.firstName} {clientUser?.lastName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Professional Truck Driver</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{clientUser?.email}</span>
                </div>
                
                {clientUser?.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{clientUser.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Member since {clientUser?.createdAt ? new Date(clientUser.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Star className="h-5 w-5 text-green-600" />
            Program Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge 
                  className={`${
                    clientUser?.subscriptionStatus === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : clientUser?.subscriptionStatus === 'trial'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  } border mb-2`}
                >
                  {clientUser?.subscriptionStatus === 'active' ? 'Active Member' :
                   clientUser?.subscriptionStatus === 'trial' ? 'Trial Member' : 'Expired Member'}
                </Badge>
                <p className="text-sm text-gray-600">
                  {clientUser?.subscriptionStatus === 'active' && 'TruckHealth Coaching Program - $250/month'}
                  {clientUser?.subscriptionStatus === 'trial' && '7-day trial period'}
                  {clientUser?.subscriptionStatus === 'expired' && 'Subscription renewal required'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Your Program Includes:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Weekly Thursday group coaching calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Comprehensive health assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Travel-optimized health tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Personalized protocol tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">24/7 portal access</span>
                </div>
              </div>
            </div>

            {clientUser?.subscriptionStatus !== 'active' && (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade to Full Access
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Settings className="h-5 w-5 text-gray-600" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            
            <Button variant="outline" className="w-full justify-start h-12" disabled>
              <Mail className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Notification Preferences</div>
                <div className="text-xs text-gray-500">Coming soon</div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start h-12" disabled>
              <Settings className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Privacy Settings</div>
                <div className="text-xs text-gray-500">Coming soon</div>
              </div>
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <Button 
                onClick={logout}
                variant="outline" 
                className="w-full justify-start h-12 text-red-600 border-red-200 hover:bg-red-50"
              >
                <ArrowLeft className="h-4 w-4 mr-3" />
                Sign Out of Portal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="bg-blue-900 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-medium mb-2">Need Help?</h4>
            <p className="text-sm text-blue-100 mb-4">
              Our support team is here to help you get the most out of your TruckHealth portal.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1 border-blue-400 text-blue-100 hover:bg-blue-800">
                <Link href="mailto:support@destinationhealth.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1 border-blue-400 text-blue-100 hover:bg-blue-800">
                <Link href="tel:+1234567890">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
