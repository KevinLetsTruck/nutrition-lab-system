'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary/10 text-primary border border-primary/20 rounded-full">
            <span className="text-sm font-medium">🚛 FNTP Certified • Truck Driver Specialist</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-heading font-bold mb-6 leading-tight">
            Transform Your Life Through{" "}
            <span className="gradient-text">
              Holistic Health Coaching
            </span>
          </h1>
          
          <p className="text-xl text-foreground-secondary max-w-4xl mx-auto mb-10 leading-relaxed">
            Start your journey to optimal health with evidence-based nutritional
            guidance and personalized wellness strategies designed just for you
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild className="shadow-2xl shadow-blue-500/25">
              <Link href="/clients">
                Begin Your Health Journey
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild className="border-primary/30 hover:border-primary">
              <Link href="/assessments">View Sample Report</Link>
            </Button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Professional Health Assessment Platform
            </h2>
            <p className="text-xl text-foreground-secondary">
              Advanced functional medicine tools designed for truck driver health optimization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-brand rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">📊</span>
                </div>
                <CardTitle>Comprehensive Assessment</CardTitle>
                <CardDescription>
                  150-question functional medicine evaluation targeting truck driver health challenges
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-brand rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Intelligent pattern recognition and root cause identification with personalized protocols
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-brand rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🚛</span>
                </div>
                <CardTitle>Truck Driver Specialized</CardTitle>
                <CardDescription>
                  Road-compatible protocols designed for the unique challenges of professional driving
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-heading font-bold mb-4 gradient-text">
            Ready to Start Your Health Journey?
          </h3>
          <p className="text-lg text-foreground-secondary mb-8">
            Join hundreds of satisfied clients who have transformed their health
          </p>
          <Button size="lg" asChild>
            <Link href="/clients">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}