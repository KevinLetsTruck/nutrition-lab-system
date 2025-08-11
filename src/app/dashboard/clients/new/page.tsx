"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

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
    <div
      className="min-h-screen py-8"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="shadow rounded-lg"
          style={{ background: "var(--bg-card)" }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Add New Client
              </h2>
              <Link
                href="/dashboard/clients"
                className="transition-colors hover:opacity-80"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div
                className="px-4 py-3 rounded"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3
                className="text-lg font-medium mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    className="mt-1 block w-full px-3 py-2 rounded-md transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={
                      {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)",
                        "--tw-ring-color": "var(--primary-green)",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    className="mt-1 block w-full px-3 py-2 rounded-md transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={
                      {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)",
                        "--tw-ring-color": "var(--primary-green)",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="mt-1 block w-full px-3 py-2 rounded-md transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={
                      {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)",
                        "--tw-ring-color": "var(--primary-green)",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="mt-1 block w-full px-3 py-2 rounded-md transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={
                      {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)",
                        "--tw-ring-color": "var(--primary-green)",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    className="mt-1 block w-full px-3 py-2 rounded-md transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={
                      {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)",
                        "--tw-ring-color": "var(--primary-green)",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    className="mt-1 block w-full px-3 py-2 rounded-md transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={
                      {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)",
                        "--tw-ring-color": "var(--primary-green)",
                      } as React.CSSProperties
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Truck Driver Information */}
            <div>
              <h3
                className="text-lg font-medium mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Truck Driver Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isTruckDriver"
                    id="isTruckDriver"
                    defaultChecked
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "var(--primary-green)" }}
                  />
                  <label
                    htmlFor="isTruckDriver"
                    className="ml-2 block text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    This client is a truck driver
                  </label>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h3
                className="text-lg font-medium mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Health Goals
              </h3>
              <div>
                <label
                  htmlFor="healthGoals"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Primary Health Goal
                </label>
                <textarea
                  name="healthGoals"
                  id="healthGoals"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 rounded-md resize-none transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={
                    {
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                      "--tw-ring-color": "var(--primary-green)",
                    } as React.CSSProperties
                  }
                  placeholder="e.g., Lose weight, improve energy, manage blood sugar, pass DOT physical..."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard/clients"
                className="py-2 px-4 rounded-md text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{
                  background: "var(--primary-green)",
                }}
              >
                {loading ? "Creating..." : "Create Client"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
