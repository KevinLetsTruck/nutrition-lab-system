'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  MapPin,
  Utensils,
  Truck,
  Clock,
  ArrowLeft,
  Navigation,
  ShoppingCart,
  Target,
} from 'lucide-react';

export default function TravelToolsPage() {
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
          <h1 className="text-xl font-bold text-gray-900">Travel Health Tools</h1>
          <p className="text-sm text-gray-600">Stay healthy while on the road</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
        <CardContent className="p-6 text-center">
          <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Travel Tools Coming Soon!
          </h3>
          <p className="text-gray-600 mb-4">
            We're building powerful travel health tools specifically for truck drivers. 
            These will include route planning, healthy food finder, and mobile health tracking.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-green-600" />
                <span>Route Health Planning</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="h-4 w-4 text-green-600" />
                <span>Healthy Truck Stop Finder</span>
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                <span>Mobile Grocery Lists</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span>Exercise Breaks</span>
              </div>
            </div>
          </div>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/client/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
