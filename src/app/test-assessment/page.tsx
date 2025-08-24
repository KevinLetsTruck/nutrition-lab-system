"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestAssessmentPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("kevin@letstruck.com");
  const [password, setPassword] = useState("1234567890");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        setMessage(`Login successful! You can now start an assessment. ClientId: ${data.user?.clientId || 'N/A'}`);

      } else {
        setMessage(`Login failed: ${data.error || "Unknown error"}`);
        console.error("Login error:", data);
      }
    } catch (error) {
      setMessage(
        `Login error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMessage("Logged out successfully");
  };

  const startNewAssessment = () => {
    router.push("/assessment/new");
  };

  const runTestSetup = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/test-setup");
      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`Test setup complete! Token: ${data.data.token.substring(0, 20)}...`);

        // Automatically set the token
        localStorage.setItem("token", data.data.token);
        setIsLoggedIn(true);
      } else {
        setMessage(`Setup failed: ${data.error} - ${data.details || ''}`);
        console.error("Setup error:", data);
      }
    } catch (error) {
      setMessage(`Setup error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Assessment Test Page
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test the assessment system with authentication
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="space-y-6">
            <button
              onClick={runTestSetup}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? "Setting up..." : "🔧 Run Test Setup (Create User & Client)"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or login manually</span>
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-800 text-center">
                ✅ You are logged in!
              </p>
            </div>

            <button
              onClick={startNewAssessment}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start New Assessment
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.includes("error") || message.includes("failed")
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
