"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pill,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Target,
} from "lucide-react";

interface Supplement {
  id: string;
  analysisId: string;
  name: string;
  brand?: string;
  dosage: string;
  timing: string;
  duration: string;
  priority: string;
  category: string;
  rationale?: string;
  phase: string;
  estimatedCost: number;
  interactions?: string;
  contraindications?: string;
  labJustification?: string;
  status: string;
  createdAt: string;
}

interface SupplementListProps {
  clientId: string;
  clientName: string;
}

export function SupplementList({ clientId, clientName }: SupplementListProps) {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSupplement, setExpandedSupplement] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetchSupplements();
  }, [clientId]);

  const fetchSupplements = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/clients/${clientId}/complete`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch client data");
      }

      const data = await response.json();
      const client = data.client;
      const healthGoals = client.healthGoals || {};
      const supplementsList = healthGoals.supplements || [];

      setSupplements(supplementsList);

      // Calculate total monthly cost
      const total = supplementsList.reduce(
        (sum: number, supp: Supplement) => sum + (supp.estimatedCost || 0),
        0
      );
      setTotalCost(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "PHASE1":
        return "bg-blue-100 text-blue-800";
      case "PHASE2":
        return "bg-purple-100 text-purple-800";
      case "PHASE3":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading supplements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Error loading supplements: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Supplement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Supplement Protocol for {clientName}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">
                {formatCurrency(totalCost)}/month
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {supplements.length}
              </div>
              <div className="text-sm text-gray-600">Total Supplements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {supplements.filter((s) => s.priority === "CRITICAL").length}
              </div>
              <div className="text-sm text-gray-600">Critical Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {supplements.filter((s) => s.phase === "PHASE1").length}
              </div>
              <div className="text-sm text-gray-600">Phase 1</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalCost)}
              </div>
              <div className="text-sm text-gray-600">Monthly Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Supplement Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {supplements.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No supplements found</p>
              <p className="text-sm text-gray-500">
                Import a Claude analysis to see supplement recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {supplements.map((supplement) => (
                <div
                  key={supplement.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {supplement.name}
                          </h3>
                          {supplement.brand && (
                            <Badge variant="outline" className="text-xs">
                              {supplement.brand}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(supplement.priority)}>
                            {supplement.priority}
                          </Badge>
                          <Badge className={getPhaseColor(supplement.phase)}>
                            {supplement.phase}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {supplement.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(supplement.estimatedCost)}/month
                          </div>
                          <div className="text-xs text-gray-500">
                            {supplement.dosage}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedSupplement(
                              expandedSupplement === supplement.id
                                ? null
                                : supplement.id
                            )
                          }
                        >
                          {expandedSupplement === supplement.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {expandedSupplement === supplement.id && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Dosing & Timing
                          </h4>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>
                              <strong>Dosage:</strong> {supplement.dosage}
                            </p>
                            <p>
                              <strong>Timing:</strong> {supplement.timing}
                            </p>
                            <p>
                              <strong>Duration:</strong> {supplement.duration}
                            </p>
                          </div>
                        </div>

                        {supplement.rationale && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Clinical Rationale
                            </h4>
                            <p className="text-sm text-gray-700">
                              {supplement.rationale}
                            </p>
                          </div>
                        )}
                      </div>

                      {supplement.labJustification && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Lab Justification
                          </h4>
                          <p className="text-sm text-gray-700">
                            {supplement.labJustification}
                          </p>
                        </div>
                      )}

                      {(supplement.interactions ||
                        supplement.contraindications) && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            Safety Information
                          </h4>
                          {supplement.interactions && (
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Interactions:</strong>{" "}
                              {supplement.interactions}
                            </p>
                          )}
                          {supplement.contraindications && (
                            <p className="text-sm text-gray-700">
                              <strong>Contraindications:</strong>{" "}
                              {supplement.contraindications}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}