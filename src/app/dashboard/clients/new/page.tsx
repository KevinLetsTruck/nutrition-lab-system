"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function NewClientPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      isTruckDriver: formData.get("isTruckDriver") === "on",
      healthGoals: formData.get("healthGoals")
        ? [formData.get("healthGoals") as string]
        : undefined,
    };

    try {
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        const result = await response.json();
        throw new Error(result.error || "Failed to create client");
      }

      const client = await response.json();
      router.push(`/dashboard/clients/${client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Add New Client</h2>
              <Link href="/dashboard/clients">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-brand-green mr-3 rounded-full"></div>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">
                        First Name *
                      </Label>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">
                        Last Name *
                      </Label>
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-300">
                        Email *
                      </Label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-300">
                        Phone
                      </Label>
                      <Input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth" className="text-gray-300">
                        Date of Birth
                      </Label>
                      <Input
                        type="date"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender" className="text-gray-300">
                        Gender
                      </Label>
                      <Select name="gender" id="gender" className="mt-1">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Truck Driver Information */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-brand-orange mr-3 rounded-full"></div>
                    Truck Driver Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Checkbox
                        name="isTruckDriver"
                        id="isTruckDriver"
                        defaultChecked
                        className="border-gray-600 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green"
                      />
                      <Label
                        htmlFor="isTruckDriver"
                        className="ml-2 text-gray-300"
                      >
                        This client is a truck driver
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Health Information */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-brand-green mr-3 rounded-full"></div>
                    Health Goals
                  </h3>
                  <div>
                    <Label htmlFor="healthGoals" className="text-gray-300">
                      Primary Health Goal
                    </Label>
                    <Textarea
                      name="healthGoals"
                      id="healthGoals"
                      rows={3}
                      className="mt-1 resize-none"
                      placeholder="e.g., Lose weight, improve energy, manage blood sugar, pass DOT physical..."
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                  <Link href="/dashboard/clients">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-green hover:bg-brand-green/90 border-brand-green"
                  >
                    {loading ? "Creating..." : "Create Client"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
