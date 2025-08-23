"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, Trophy, Heart, LogOut } from "lucide-react";
import confetti from "canvas-confetti";

export default function AssessmentCompletePage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-brand-navy relative">
      {/* MetabolX Logo at top */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-1">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="metabolx-gradient-complete" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              {/* X shape with gradient - modern stylized design */}
              <g>
                {/* Top-left to bottom-right diagonal */}
                <rect x="15" y="25" width="70" height="15" rx="7.5" 
                      transform="rotate(45 50 50)" 
                      fill="url(#metabolx-gradient-complete)" />
                {/* Top-right to bottom-left diagonal */}
                <rect x="15" y="25" width="70" height="15" rx="7.5" 
                      transform="rotate(-45 50 50)" 
                      fill="url(#metabolx-gradient-complete)" />
              </g>
            </svg>
          </div>
          <div className="text-center">
            <div className="font-bold text-white text-sm">MetabolX</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Assessment</div>
          </div>
        </div>
      </div>
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full text-center bg-gray-900/50 border-gray-800">
          <CardHeader className="space-y-4 pb-8">
            <div className="mx-auto">
              <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold">Congratulations! 🎉</h1>
            <p className="text-xl text-muted-foreground">
              You've completed your health assessment
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="font-semibold">Assessment Complete</h3>
              <p className="text-sm text-muted-foreground">
                All questions answered
              </p>
            </div>
            <div className="space-y-2">
              <Heart className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="font-semibold">Data Saved</h3>
              <p className="text-sm text-muted-foreground">
                Your responses are secure
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">
                  ✓
                </span>
              </div>
              <h3 className="font-semibold">Next Steps</h3>
              <p className="text-sm text-muted-foreground">
                Your practitioner will review
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              What happens next?
            </h2>
            <ul className="text-left space-y-2 max-w-lg mx-auto">
              <li className="flex items-start space-x-2">
                <span className="text-brand-green mt-0.5">•</span>
                <span className="text-sm text-gray-300">
                  Your practitioner will review your responses
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-brand-green mt-0.5">•</span>
                <span className="text-sm text-gray-300">
                  They'll create a personalized health plan for you
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-brand-green mt-0.5">•</span>
                <span className="text-sm text-gray-300">
                  You'll be contacted to schedule your consultation
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => {
                logout();
                router.push("/");
              }}
              size="lg"
              className="w-full max-w-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Thank you for taking the time to complete this assessment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
