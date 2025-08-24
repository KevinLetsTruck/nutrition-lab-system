"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AssessmentStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState<Date>();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    currentMedications: "",
    currentSupplements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, create or find the client
      const clientResponse = await fetch("/api/clients/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: date?.toISOString(),
        }),
      });

      if (!clientResponse.ok) {
        throw new Error("Failed to create client profile");
      }

      const clientData = await clientResponse.json();

      // Then create the assessment
      const assessmentResponse = await fetch("/api/assessment/public/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientData.client.id,
          clientEmail: formData.email,
        }),
      });

      if (!assessmentResponse.ok) {
        throw new Error("Failed to start assessment");
      }

      const assessmentData = await assessmentResponse.json();

      // Store client info for the assessment session
      localStorage.setItem("assessmentSession", JSON.stringify({
        clientId: clientData.client.id,
        assessmentId: assessmentData.assessment.id,
        clientName: `${formData.firstName} ${formData.lastName}`,
      }));

      // Redirect to assessment
      router.push(`/assessment-public/${assessmentData.assessment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-brand-green to-brand-orange bg-clip-text text-transparent">
                MetabolX
              </span>
            </h1>
            <p className="text-gray-400 mt-2">Comprehensive Health Assessment</p>
          </div>
          <CardTitle className="text-2xl text-white">Start Your Health Journey</CardTitle>
          <CardDescription className="text-gray-400">
            Please provide your information to begin the assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-300">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  required
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-700 border-gray-600",
                        !date && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications" className="text-gray-300">
                Current Medications (if any)
              </Label>
              <Input
                id="medications"
                value={formData.currentMedications}
                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="List any medications you're currently taking"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplements" className="text-gray-300">
                Current Supplements (if any)
              </Label>
              <Input
                id="supplements"
                value={formData.currentSupplements}
                onChange={(e) => setFormData({ ...formData, currentSupplements: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="List any supplements you're currently taking"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-brand-green text-brand-darkNavy hover:bg-brand-green/90"
              disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.gender || !date}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Assessment...
                </>
              ) : (
                "Start Assessment"
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Your information is secure and will only be used for your health assessment.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
