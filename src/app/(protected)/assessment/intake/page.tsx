"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Plus, X } from "lucide-react";
import { Autocomplete } from "@/components/ui/autocomplete";
import {
  commonMedications,
  commonSupplements,
} from "@/lib/data/medications-supplements";

export default function AssessmentIntakePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientData, setClientData] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    primaryHealthGoal: "",
  });

  const [medications, setMedications] = useState<
    { name: string; dosage: string; frequency: string }[]
  >([]);
  const [supplements, setSupplements] = useState<
    { name: string; dosage: string; brand: string }[]
  >([]);

  // Prepare autocomplete options
  const medicationOptions = commonMedications.map((med) => ({
    value: med.name,
    label: med.name,
    category: med.category,
    metadata: med,
  }));

  const supplementOptions = commonSupplements.map((supp) => ({
    value: supp.name,
    label: supp.name,
    category: supp.category,
    metadata: supp,
  }));

  // Check if we already have this info
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.clientId) return;

      try {
        const response = await fetch(`/api/clients/${user.clientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClientData(data);

          // Pre-fill form if data exists
          if (data.dateOfBirth) {
            setFormData((prev) => ({
              ...prev,
              dateOfBirth: data.dateOfBirth,
              gender: data.gender || "",
            }));
          }

          // If medications exist, parse them
          if (data.medications) {
            const meds =
              typeof data.medications === "string"
                ? JSON.parse(data.medications)
                : data.medications;
            if (meds.current) setMedications(meds.current);
            if (meds.supplements) setSupplements(meds.supplements);
          }
        }
      } catch (err) {
        console.error("Error fetching client data:", err);
      }
    };

    fetchClientData();
  }, [user]);

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const addSupplement = () => {
    setSupplements([...supplements, { name: "", dosage: "", brand: "" }]);
  };

  const removeSupplement = (index: number) => {
    setSupplements(supplements.filter((_, i) => i !== index));
  };

  const updateSupplement = (index: number, field: string, value: string) => {
    const updated = [...supplements];
    updated[index] = { ...updated[index], [field]: value };
    setSupplements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Update client info
      const response = await fetch(`/api/clients/${user?.clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          medications: {
            current: medications.filter((m) => m.name),
            supplements: supplements.filter((s) => s.name),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update client information");
      }

      // Navigate to assessment
      router.push("/assessment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSkip =
    clientData?.dateOfBirth && clientData?.gender && clientData?.medications;

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xl gradient-text">
            DestinationHealth
          </span>

          {/* MetabolX Logo - Center */}
          <div className="flex flex-col items-center">
            {/* MetabolX Icon */}
            <div className="relative w-10 h-10 mb-1">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="metabolx-gradient-intake"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                {/* X shape with gradient - modern stylized design */}
                <g>
                  {/* Top-left to bottom-right diagonal */}
                  <rect
                    x="15"
                    y="25"
                    width="70"
                    height="15"
                    rx="7.5"
                    transform="rotate(45 50 50)"
                    fill="url(#metabolx-gradient-intake)"
                  />
                  {/* Top-right to bottom-left diagonal */}
                  <rect
                    x="15"
                    y="25"
                    width="70"
                    height="15"
                    rx="7.5"
                    transform="rotate(-45 50 50)"
                    fill="url(#metabolx-gradient-intake)"
                  />
                </g>
              </svg>
            </div>
            {/* MetabolX Text */}
            <div className="text-center">
              <div className="font-bold text-white text-xs">MetabolX</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Assessment
              </div>
            </div>
          </div>

          <span className="text-sm text-gray-400">
            Pre-Assessment Information
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-2 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Step 1 of 2</span>
          <Progress value={50} className="max-w-xs" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-gray-700">
          <CardHeader className="border-b border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-white">
              Basic Health Information
            </h2>
            <p className="text-gray-400 mt-2">
              Please provide some basic information to help personalize your
              assessment
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Demographics */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <div className="w-1 h-6 bg-brand-green mr-3 rounded-full"></div>
                  Demographics
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-gray-300">
                      Date of Birth *
                    </Label>
                    <Input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender" className="text-gray-300">
                      Gender *
                    </Label>
                    <Select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      className="mt-1"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="height" className="text-gray-300">
                      Height (inches)
                    </Label>
                    <Input
                      type="number"
                      id="height"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value })
                      }
                      placeholder="e.g., 70"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight" className="text-gray-300">
                      Weight (lbs)
                    </Label>
                    <Input
                      type="number"
                      id="weight"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      placeholder="e.g., 180"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="primaryHealthGoal" className="text-gray-300">
                    Primary Health Goal
                  </Label>
                  <Textarea
                    id="primaryHealthGoal"
                    value={formData.primaryHealthGoal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryHealthGoal: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="What's your main health goal? (e.g., lose weight, increase energy, improve digestion)"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <div className="w-1 h-6 bg-brand-orange mr-3 rounded-full"></div>
                  Current Medications
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  List any prescription or over-the-counter medications you
                  currently take
                </p>

                {medications.map((med, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex justify-end mb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-gray-400 text-sm">
                          Medication Name
                        </Label>
                        <Autocomplete
                          options={medicationOptions}
                          value={med.name}
                          onChange={(value, option) => {
                            updateMedication(index, "name", value);
                            // Auto-fill dosage if available in metadata
                            if (option?.metadata?.commonDosages?.length > 0) {
                              updateMedication(
                                index,
                                "dosage",
                                option.metadata.commonDosages[0]
                              );
                            }
                          }}
                          placeholder="Select or type medication..."
                          searchPlaceholder="Search medications..."
                          emptyText="Type to search or add custom medication"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">Dosage</Label>
                        <Input
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedication(index, "dosage", e.target.value)
                          }
                          placeholder="e.g., 500mg"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">
                          Frequency
                        </Label>
                        <Input
                          value={med.frequency}
                          onChange={(e) =>
                            updateMedication(index, "frequency", e.target.value)
                          }
                          placeholder="e.g., Twice daily"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addMedication}
                  className="w-full border-gray-600 hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>

              {/* Current Supplements */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <div className="w-1 h-6 bg-brand-green mr-3 rounded-full"></div>
                  Current Supplements
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  List any vitamins, minerals, or other supplements you
                  currently take
                </p>

                {supplements.map((supp, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex justify-end mb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupplement(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-gray-400 text-sm">
                          Supplement Name
                        </Label>
                        <Autocomplete
                          options={supplementOptions}
                          value={supp.name}
                          onChange={(value, option) => {
                            updateSupplement(index, "name", value);
                            // Auto-fill dosage if available in metadata
                            if (option?.metadata?.commonDosages?.length > 0) {
                              updateSupplement(
                                index,
                                "dosage",
                                option.metadata.commonDosages[0]
                              );
                            }
                          }}
                          placeholder="Select or type supplement..."
                          searchPlaceholder="Search supplements..."
                          emptyText="Type to search or add custom supplement"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">Dosage</Label>
                        <Input
                          value={supp.dosage}
                          onChange={(e) =>
                            updateSupplement(index, "dosage", e.target.value)
                          }
                          placeholder="e.g., 5000 IU"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">Brand</Label>
                        <Input
                          value={supp.brand}
                          onChange={(e) =>
                            updateSupplement(index, "brand", e.target.value)
                          }
                          placeholder="e.g., Nature's Way"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSupplement}
                  className="w-full border-gray-600 hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplement
                </Button>
              </div>

              {/* Submit */}
              <div className="flex justify-between pt-6 border-t border-gray-700">
                {canSkip && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/assessment")}
                    className="text-gray-400"
                  >
                    Skip (already completed)
                  </Button>
                )}
                <Button type="submit" disabled={loading} className="ml-auto">
                  {loading ? "Saving..." : "Continue to Assessment"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
