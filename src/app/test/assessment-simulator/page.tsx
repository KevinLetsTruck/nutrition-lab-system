"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Brain, Heart, Wind, Shield, Dumbbell, Zap, Droplet, Stethoscope, Activity } from "lucide-react";

// Body systems with icons
const bodySystems = [
  { id: "NEUROLOGICAL", name: "Neurological", icon: Brain, color: "text-purple-500" },
  { id: "DIGESTIVE", name: "Digestive", icon: Droplet, color: "text-orange-500" },
  { id: "CARDIOVASCULAR", name: "Cardiovascular", icon: Heart, color: "text-red-500" },
  { id: "RESPIRATORY", name: "Respiratory", icon: Wind, color: "text-blue-500" },
  { id: "IMMUNE", name: "Immune", icon: Shield, color: "text-green-500" },
  { id: "MUSCULOSKELETAL", name: "Musculoskeletal", icon: Dumbbell, color: "text-indigo-500" },
  { id: "ENDOCRINE", name: "Endocrine", icon: Zap, color: "text-yellow-500" },
  { id: "INTEGUMENTARY", name: "Skin/Hair/Nails", icon: Activity, color: "text-pink-500" },
  { id: "GENITOURINARY", name: "Genitourinary", icon: Stethoscope, color: "text-teal-500" },
  { id: "SPECIAL_TOPICS", name: "Special Topics", icon: AlertCircle, color: "text-gray-500" },
];

// Preset personas
const presetPersonas = {
  hormone: {
    name: "Hormone Imbalance",
    description: "Middle-aged with thyroid issues, fatigue, weight gain",
    age: 45,
    gender: "female",
    scores: {
      NEUROLOGICAL: 60,
      DIGESTIVE: 50,
      CARDIOVASCULAR: 30,
      RESPIRATORY: 20,
      IMMUNE: 40,
      MUSCULOSKELETAL: 45,
      ENDOCRINE: 85,
      INTEGUMENTARY: 65,
      GENITOURINARY: 50,
      SPECIAL_TOPICS: 30,
    },
  },
  longCovid: {
    name: "Long COVID",
    description: "Post-COVID syndrome with multiple system involvement",
    age: 38,
    gender: "male",
    scores: {
      NEUROLOGICAL: 80,
      DIGESTIVE: 40,
      CARDIOVASCULAR: 70,
      RESPIRATORY: 85,
      IMMUNE: 75,
      MUSCULOSKELETAL: 60,
      ENDOCRINE: 65,
      INTEGUMENTARY: 30,
      GENITOURINARY: 25,
      SPECIAL_TOPICS: 90,
    },
  },
  autoimmune: {
    name: "Autoimmune",
    description: "Multiple autoimmune conditions with widespread inflammation",
    age: 35,
    gender: "female",
    scores: {
      NEUROLOGICAL: 70,
      DIGESTIVE: 75,
      CARDIOVASCULAR: 40,
      RESPIRATORY: 30,
      IMMUNE: 90,
      MUSCULOSKELETAL: 80,
      ENDOCRINE: 60,
      INTEGUMENTARY: 70,
      GENITOURINARY: 40,
      SPECIAL_TOPICS: 50,
    },
  },
  metabolic: {
    name: "Metabolic Syndrome",
    description: "Diabetes, obesity, cardiovascular risk",
    age: 55,
    gender: "male",
    scores: {
      NEUROLOGICAL: 40,
      DIGESTIVE: 65,
      CARDIOVASCULAR: 85,
      RESPIRATORY: 45,
      IMMUNE: 30,
      MUSCULOSKELETAL: 70,
      ENDOCRINE: 90,
      INTEGUMENTARY: 50,
      GENITOURINARY: 55,
      SPECIAL_TOPICS: 40,
    },
  },
};

export default function AssessmentSimulator() {
  const [selectedPersona, setSelectedPersona] = useState<string>("custom");
  const [age, setAge] = useState(40);
  const [gender, setGender] = useState("female");
  const [systemScores, setSystemScores] = useState<Record<string, number>>({
    NEUROLOGICAL: 50,
    DIGESTIVE: 50,
    CARDIOVASCULAR: 50,
    RESPIRATORY: 50,
    IMMUNE: 50,
    MUSCULOSKELETAL: 50,
    ENDOCRINE: 50,
    INTEGUMENTARY: 50,
    GENITOURINARY: 50,
    SPECIAL_TOPICS: 50,
  });
  const [analysis, setAnalysis] = useState<string>("");
  const [customProtocol, setCustomProtocol] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load preset persona
  const loadPersona = (personaKey: string) => {
    if (personaKey === "custom") return;
    
    const persona = presetPersonas[personaKey as keyof typeof presetPersonas];
    if (persona) {
      setSystemScores(persona.scores);
      setAge(persona.age);
      setGender(persona.gender);
    }
  };

  // Generate AI analysis
  const generateAnalysis = async () => {
    setIsGenerating(true);
    
    // Sort systems by severity
    const sortedSystems = Object.entries(systemScores)
      .map(([system, score]) => ({
        system,
        score,
        severity: score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MODERATE" : "LOW",
      }))
      .sort((a, b) => b.score - a.score);

    const topSystems = sortedSystems.slice(0, 3);

    // Generate analysis text
    const analysisText = `
COMPREHENSIVE HEALTH ASSESSMENT ANALYSIS
=====================================

PATIENT PROFILE:
Age: ${age} | Gender: ${gender}
Assessment Date: ${new Date().toLocaleDateString()}

TOP 3 CRITICAL SYSTEMS:
${topSystems.map((s, i) => `${i + 1}. ${s.system} - ${s.severity} (${s.score}%)`).join("\n")}

ROOT CAUSE ANALYSIS:
${generateRootCause(topSystems)}

PRIORITY INTERVENTIONS:
${generateInterventions(topSystems)}

IMPLEMENTATION STRATEGY:
Phase 1 (Weeks 1-4): Foundation
- Remove inflammatory triggers
- Support detoxification
- Optimize sleep and stress

Phase 2 (Weeks 5-12): Targeted Repair
- System-specific protocols
- Monitor improvements
- Adjust as needed

Phase 3 (Weeks 13+): Optimization
- Fine-tune protocols
- Prevention strategies
- Long-term maintenance

${customProtocol ? `\nCUSTOM ADDITIONS:\n${customProtocol}` : ""}
`;

    setAnalysis(analysisText);
    setIsGenerating(false);
  };

  // Generate root cause based on top systems
  const generateRootCause = (topSystems: any[]) => {
    const patterns = [];
    const systemNames = topSystems.map(s => s.system);

    if (systemNames.includes("ENDOCRINE") && systemNames.includes("NEUROLOGICAL")) {
      patterns.push("• HPA Axis Dysfunction - Chronic stress affecting hormones and neurotransmitters");
    }
    if (systemNames.includes("DIGESTIVE") && systemNames.includes("IMMUNE")) {
      patterns.push("• Gut-Immune Dysregulation - Intestinal permeability driving systemic inflammation");
    }
    if (systemNames.includes("CARDIOVASCULAR") && systemNames.includes("ENDOCRINE")) {
      patterns.push("• Metabolic Syndrome - Insulin resistance affecting multiple systems");
    }
    if (patterns.length === 0) {
      patterns.push("• Multi-system inflammation requiring comprehensive approach");
    }

    return patterns.join("\n");
  };

  // Generate interventions for top systems
  const generateInterventions = (topSystems: any[]) => {
    const interventions: string[] = [];

    topSystems.forEach(({ system }) => {
      switch (system) {
        case "ENDOCRINE":
          interventions.push(`
${system} PROTOCOL:
- Adaptogenic herbs (Ashwagandha 600mg)
- B-complex vitamins
- Magnesium glycinate 400mg
- Blood sugar support (Chromium, ALA)`);
          break;
        case "NEUROLOGICAL":
          interventions.push(`
${system} PROTOCOL:
- Omega-3 (EPA/DHA 2-3g)
- Lion's Mane mushroom
- Curcumin 1000mg
- Sleep support (Melatonin, L-theanine)`);
          break;
        case "DIGESTIVE":
          interventions.push(`
${system} PROTOCOL:
- Probiotic therapy
- L-glutamine 5g BID
- Digestive enzymes
- Elimination diet`);
          break;
        case "IMMUNE":
          interventions.push(`
${system} PROTOCOL:
- Vitamin D3 (optimize to 50-80 ng/mL)
- Vitamin C 1-2g
- Zinc 30mg
- Quercetin 500mg BID`);
          break;
        default:
          interventions.push(`
${system} PROTOCOL:
- System-specific support needed
- Consider specialized testing
- Monitor symptom changes`);
      }
    });

    return interventions.join("\n");
  };

  // Get severity color
  const getSeverityColor = (score: number) => {
    if (score >= 75) return "text-red-600";
    if (score >= 50) return "text-orange-600";
    if (score >= 25) return "text-yellow-600";
    return "text-green-600";
  };

  // Get severity badge
  const getSeverityBadge = (score: number) => {
    if (score >= 75) return <Badge className="bg-red-100 text-red-800">CRITICAL</Badge>;
    if (score >= 50) return <Badge className="bg-orange-100 text-orange-800">HIGH</Badge>;
    if (score >= 25) return <Badge className="bg-yellow-100 text-yellow-800">MODERATE</Badge>;
    return <Badge className="bg-green-100 text-green-800">LOW</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Simulator & AI Analysis Tool
          </h1>
          <p className="text-gray-600">
            Test different health scenarios and see how the AI analyzes and creates treatment protocols
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Persona Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Test Scenario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preset Personas</Label>
                  <Select value={selectedPersona} onValueChange={(value) => {
                    setSelectedPersona(value);
                    loadPersona(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a preset or custom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Configuration</SelectItem>
                      <SelectItem value="hormone">Hormone Imbalance</SelectItem>
                      <SelectItem value="longCovid">Long COVID</SelectItem>
                      <SelectItem value="autoimmune">Autoimmune</SelectItem>
                      <SelectItem value="metabolic">Metabolic Syndrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age</Label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 40)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Severity Sliders */}
            <Card>
              <CardHeader>
                <CardTitle>Body System Severity Levels</CardTitle>
                <p className="text-sm text-gray-600">Adjust severity (0-100%) for each system</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {bodySystems.map((system) => {
                  const Icon = system.icon;
                  const score = systemScores[system.id];
                  
                  return (
                    <div key={system.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${system.color}`} />
                          <Label className="font-medium">{system.name}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getSeverityColor(score)}`}>
                            {score}%
                          </span>
                          {getSeverityBadge(score)}
                        </div>
                      </div>
                      <Slider
                        value={[score]}
                        onValueChange={(value) => {
                          setSystemScores(prev => ({
                            ...prev,
                            [system.id]: value[0]
                          }));
                        }}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Custom Protocol */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Protocol Additions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any custom recommendations or modifications..."
                  value={customProtocol}
                  onChange={(e) => setCustomProtocol(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button 
              onClick={generateAnalysis}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? "Generating Analysis..." : "Generate AI Analysis"}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="visual">Visual</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                  </TabsList>

                  <TabsContent value="analysis" className="mt-4">
                    {analysis ? (
                      <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[800px]">
                        {analysis}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-500">
                        <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Configure settings and click "Generate AI Analysis" to see results</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="visual" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-4">System Severity Chart</h3>
                      {Object.entries(systemScores)
                        .sort((a, b) => b[1] - a[1])
                        .map(([system, score]) => {
                          const systemInfo = bodySystems.find(s => s.id === system);
                          const Icon = systemInfo?.icon || AlertCircle;
                          
                          return (
                            <div key={system} className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${systemInfo?.color}`} />
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{system}</span>
                                  <span className={`text-sm font-bold ${getSeverityColor(score)}`}>
                                    {score}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      score >= 75 ? "bg-red-500" :
                                      score >= 50 ? "bg-orange-500" :
                                      score >= 25 ? "bg-yellow-500" :
                                      "bg-green-500"
                                    }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </TabsContent>

                  <TabsContent value="export" className="mt-4">
                    <div className="space-y-4">
                      <p className="text-gray-600">Export options for the generated analysis:</p>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            const blob = new Blob([analysis], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `assessment-analysis-${Date.now()}.txt`;
                            a.click();
                          }}
                          disabled={!analysis}
                        >
                          Download as Text File
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            navigator.clipboard.writeText(analysis);
                            alert("Analysis copied to clipboard!");
                          }}
                          disabled={!analysis}
                        >
                          Copy to Clipboard
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            const data = {
                              age,
                              gender,
                              systemScores,
                              analysis,
                              customProtocol,
                              timestamp: new Date().toISOString()
                            };
                            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                              type: "application/json" 
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `assessment-data-${Date.now()}.json`;
                            a.click();
                          }}
                          disabled={!analysis}
                        >
                          Export Full Data (JSON)
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
