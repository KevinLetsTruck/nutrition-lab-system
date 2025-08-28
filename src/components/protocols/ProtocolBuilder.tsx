"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { SupplementForm, type ProtocolSupplement } from "./SupplementForm";
import { DailyScheduleBuilder, type DailySchedule } from "./DailyScheduleBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Save,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Pill,
  Brain,
  Mail,
  Download,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Star,
  Activity,
  GripVertical,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Enhanced interfaces matching our API
interface ProtocolClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ProtocolAnalysis {
  id: string;
  analysisDate: Date;
  analysisVersion: string;
}

interface Protocol {
  id?: string;
  clientId: string;
  analysisId?: string;
  protocolName: string;
  protocolPhase?: string;
  status: string;
  startDate?: Date;
  durationWeeks?: number;
  greeting?: string;
  clinicalFocus?: string;
  currentStatus?: string;
  prioritySupplements?: any;
  dailySchedule?: DailySchedule;
  protocolNotes?: string;
  brandingConfig?: any;
  effectivenessRating?: number;
  complianceNotes?: string;
  sideEffects?: string;
  modificationsMade?: any;
  client?: ProtocolClient;
  analysis?: ProtocolAnalysis;
}

interface ProtocolBuilderProps {
  protocol?: Protocol;
  clientId?: string;
  analysisId?: string;
  mode: "create" | "edit" | "create-from-analysis";
  onSave?: (protocol: Protocol) => void;
  onCancel?: () => void;
  onGeneratePDF?: (protocolId: string) => void;
  onSendEmail?: (protocolId: string) => void;
  className?: string;
}

export function ProtocolBuilder({
  protocol,
  clientId,
  analysisId,
  mode,
  onSave,
  onCancel,
  onGeneratePDF,
  onSendEmail,
  className,
}: ProtocolBuilderProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Form state
  const [formData, setFormData] = useState<Protocol>({
    clientId: clientId || protocol?.clientId || "",
    analysisId: analysisId || protocol?.analysisId,
    protocolName: protocol?.protocolName || "",
    protocolPhase: protocol?.protocolPhase || "Phase 1",
    status: protocol?.status || "planned",
    startDate: protocol?.startDate,
    durationWeeks: protocol?.durationWeeks || 12,
    greeting: protocol?.greeting || "",
    clinicalFocus: protocol?.clinicalFocus || "",
    currentStatus: protocol?.currentStatus || "Protocol in development",
    dailySchedule: protocol?.dailySchedule || {
      morning: "8:00 AM",
      evening: "6:00 PM",
      description: "Standard morning and evening routine",
    },
    protocolNotes: protocol?.protocolNotes || "",
    effectivenessRating: protocol?.effectivenessRating,
    complianceNotes: protocol?.complianceNotes || "",
    sideEffects: protocol?.sideEffects || "",
  });

  // Supplements state
  const [supplements, setSupplements] = useState<ProtocolSupplement[]>([]);
  const [showSupplementForm, setShowSupplementForm] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<ProtocolSupplement | undefined>();

  // Client data for display
  const [clientData, setClientData] = useState<ProtocolClient | null>(null);
  const [analysisData, setAnalysisData] = useState<ProtocolAnalysis | null>(null);

  // Auto-save interval
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || mode === "create") return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [autoSaveEnabled, hasUnsavedChanges, formData, supplements]);

  // Fetch client and analysis data on mount
  useEffect(() => {
    if (clientId || formData.clientId) {
      fetchClientData(clientId || formData.clientId);
    }
    if (analysisId || formData.analysisId) {
      fetchAnalysisData(analysisId || formData.analysisId);
    }
  }, [clientId, analysisId, formData.clientId, formData.analysisId]);

  // Load existing protocol supplements
  useEffect(() => {
    if (protocol?.id && mode === "edit") {
      // In a real implementation, we would fetch supplements from the API
      // For now, we'll simulate this
      setSupplements([]);
    }
  }, [protocol, mode]);

  // Create from analysis
  useEffect(() => {
    if (mode === "create-from-analysis" && analysisId) {
      handleCreateFromAnalysis();
    }
  }, [mode, analysisId]);

  // Fetch client data
  const fetchClientData = async (id: string) => {
    if (!token || !id) return;

    try {
      const response = await fetch(`/api/clients/${id}/complete`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.data.client) {
        setClientData(data.data.client);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

  // Fetch analysis data
  const fetchAnalysisData = async (id: string) => {
    if (!token || !id || !clientId) return;

    try {
      const response = await fetch(`/api/clients/${clientId}/analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
    }
  };

  // Create protocol from analysis
  const handleCreateFromAnalysis = async () => {
    if (!token || !analysisId || !formData.protocolName) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/protocols/create-from-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisId,
          protocolName: formData.protocolName,
          protocolPhase: formData.protocolPhase,
          startDate: formData.startDate,
          durationWeeks: formData.durationWeeks,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create protocol from analysis");
      }

      const data = await response.json();
      
      if (data.success && data.data.protocol) {
        const createdProtocol = data.data.protocol;
        
        // Update form data with extracted information
        setFormData(prev => ({
          ...prev,
          ...createdProtocol,
        }));

        // Set supplements from extraction
        if (createdProtocol.protocolSupplements) {
          setSupplements(createdProtocol.protocolSupplements);
        }

        toast.success("Protocol created from analysis", {
          description: `${data.data.extractedSupplementsCount} supplements extracted`,
        });

        setHasUnsavedChanges(false);
      }

    } catch (error) {
      console.error("Error creating from analysis:", error);
      toast.error("Failed to create protocol from analysis", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save function
  const handleAutoSave = async () => {
    if (mode === "create" || !protocol?.id) return;

    try {
      await saveProtocol(false); // Silent save
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  // Save protocol
  const saveProtocol = async (showToast = true) => {
    if (!token) return;

    setIsSaving(true);

    try {
      const endpoint = mode === "create" 
        ? "/api/protocols"
        : `/api/protocols/${protocol!.id}`;
      
      const method = mode === "create" ? "POST" : "PUT";

      // Prepare supplement data
      const supplementList = supplements.map(supp => ({
        id: supp.id,
        productName: supp.productName,
        dosage: supp.dosage,
        timing: supp.timing,
        purpose: supp.purpose,
        priority: supp.priority,
        isActive: supp.isActive,
        startDate: supp.startDate,
        endDate: supp.endDate,
      }));

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          supplementList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save protocol");
      }

      const data = await response.json();

      if (data.success) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());

        if (showToast) {
          toast.success(
            mode === "create" ? "Protocol created" : "Protocol saved",
            {
              description: `${formData.protocolName} has been saved successfully`,
            }
          );
        }

        if (onSave) {
          onSave(data.data);
        }

        return data.data;
      }

    } catch (error) {
      console.error("Error saving protocol:", error);
      if (showToast) {
        toast.error("Failed to save protocol", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Handle supplement management
  const handleAddSupplement = (supplement: ProtocolSupplement) => {
    setSupplements(prev => [...prev, { ...supplement, id: `temp_${Date.now()}` }]);
    setHasUnsavedChanges(true);
  };

  const handleEditSupplement = (supplement: ProtocolSupplement) => {
    setEditingSupplement(supplement);
    setShowSupplementForm(true);
  };

  const handleUpdateSupplement = (updatedSupplement: ProtocolSupplement) => {
    setSupplements(prev => 
      prev.map(supp => 
        supp.id === updatedSupplement.id ? updatedSupplement : supp
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleDeleteSupplement = (supplementId: string) => {
    setSupplements(prev => prev.filter(supp => supp.id !== supplementId));
    setHasUnsavedChanges(true);
    toast.success("Supplement removed from protocol");
  };

  // Handle drag and drop for supplement reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(supplements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update priorities based on new order
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

    setSupplements(updatedItems);
    setHasUnsavedChanges(true);
  };

  // Handle schedule change
  const handleScheduleChange = (newSchedule: DailySchedule) => {
    handleFormChange("dailySchedule", newSchedule);
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mode === "create" ? "New Protocol" : 
               mode === "edit" ? "Edit Protocol" : 
               "Create from Analysis"}
            </h1>
            {clientData && (
              <p className="text-gray-600 dark:text-gray-400">
                For {clientData.firstName} {clientData.lastName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save status */}
            {mode === "edit" && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Activity className="h-4 w-4" />
                {hasUnsavedChanges ? (
                  <span className="text-orange-600">Unsaved changes</span>
                ) : lastSaved ? (
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                ) : (
                  <span>Auto-save enabled</span>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {protocol?.id && onGeneratePDF && (
                <Button
                  onClick={() => onGeneratePDF(protocol.id!)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              )}

              {protocol?.id && onSendEmail && (
                <Button
                  onClick={() => onSendEmail(protocol.id!)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              )}

              <Button
                onClick={() => saveProtocol()}
                disabled={isSaving || (!hasUnsavedChanges && mode === "edit")}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {mode === "create" ? "Create Protocol" : "Save Protocol"}
                  </>
                )}
              </Button>

              {onCancel && (
                <Button onClick={onCancel} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Loading state for create from analysis */}
        {isLoading && (
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Extracting protocol information from analysis...
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="supplements" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Supplements ({supplements.length})
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Protocol Information</CardTitle>
                  <CardDescription>
                    Basic protocol details and classification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="protocolName" className="text-gray-900 font-medium dark:text-gray-100">
                      Protocol Name *
                    </Label>
                    <Input
                      id="protocolName"
                      value={formData.protocolName}
                      onChange={(e) => handleFormChange("protocolName", e.target.value)}
                      placeholder="e.g., Digestive Health Protocol"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="protocolPhase" className="text-gray-900 font-medium dark:text-gray-100">
                        Phase
                      </Label>
                      <Select
                        value={formData.protocolPhase}
                        onValueChange={(value) => handleFormChange("protocolPhase", value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phase 1">Phase 1</SelectItem>
                          <SelectItem value="Phase 2">Phase 2</SelectItem>
                          <SelectItem value="Phase 3">Phase 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-gray-900 font-medium dark:text-gray-100">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleFormChange("status", value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-gray-900 font-medium dark:text-gray-100">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => handleFormChange("startDate", e.target.value ? new Date(e.target.value) : undefined)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="durationWeeks" className="text-gray-900 font-medium dark:text-gray-100">
                        Duration (weeks)
                      </Label>
                      <Input
                        id="durationWeeks"
                        type="number"
                        min="1"
                        max="52"
                        value={formData.durationWeeks || ""}
                        onChange={(e) => handleFormChange("durationWeeks", parseInt(e.target.value) || undefined)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clinical Focus</CardTitle>
                  <CardDescription>
                    Primary focus areas and current status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clinicalFocus" className="text-gray-900 font-medium dark:text-gray-100">
                      Clinical Focus
                    </Label>
                    <Textarea
                      id="clinicalFocus"
                      value={formData.clinicalFocus || ""}
                      onChange={(e) => handleFormChange("clinicalFocus", e.target.value)}
                      placeholder="Primary health concerns and treatment focus..."
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentStatus" className="text-gray-900 font-medium dark:text-gray-100">
                      Current Status
                    </Label>
                    <Input
                      id="currentStatus"
                      value={formData.currentStatus || ""}
                      onChange={(e) => handleFormChange("currentStatus", e.target.value)}
                      placeholder="Current protocol status or progress..."
                      className="mt-2"
                    />
                  </div>

                  {/* Effectiveness Rating */}
                  {mode === "edit" && (
                    <div>
                      <Label htmlFor="effectivenessRating" className="text-gray-900 font-medium dark:text-gray-100">
                        Effectiveness Rating (1-5)
                      </Label>
                      <Select
                        value={formData.effectivenessRating?.toString() || ""}
                        onValueChange={(value) => handleFormChange("effectivenessRating", value ? parseInt(value) : undefined)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Rate effectiveness..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">⭐ Poor</SelectItem>
                          <SelectItem value="2">⭐⭐ Fair</SelectItem>
                          <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                          <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                          <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Client Greeting */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Client Greeting</CardTitle>
                <CardDescription>
                  Personalized message that will appear at the beginning of the protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.greeting || ""}
                  onChange={(e) => handleFormChange("greeting", e.target.value)}
                  placeholder="Dear [Client Name], based on your assessment..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Supplements Tab */}
          <TabsContent value="supplements" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Supplements ({supplements.length})
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Configure supplement recommendations and timing
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingSupplement(undefined);
                  setShowSupplementForm(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Supplement
              </Button>
            </div>

            {supplements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No supplements added
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add supplements to build your protocol recommendations
                  </p>
                  <Button
                    onClick={() => {
                      setEditingSupplement(undefined);
                      setShowSupplementForm(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Supplement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="supplements">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {supplements
                        .sort((a, b) => a.priority - b.priority)
                        .map((supplement, index) => (
                          <Draggable
                            key={supplement.id}
                            draggableId={supplement.id!}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={snapshot.isDragging ? "shadow-lg" : ""}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-4">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="text-gray-400 hover:text-gray-600 cursor-grab"
                                    >
                                      <GripVertical className="h-5 w-5" />
                                    </div>

                                    <Badge variant="outline" className="shrink-0">
                                      #{supplement.priority}
                                    </Badge>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                          {supplement.productName}
                                        </h4>
                                        {!supplement.isActive && (
                                          <Badge variant="secondary">Inactive</Badge>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {supplement.dosage} • {supplement.timing}
                                      </div>
                                      {supplement.purpose && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Purpose: {supplement.purpose}
                                        </div>
                                      )}
                                    </div>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => handleEditSupplement(supplement)}
                                        >
                                          <Edit3 className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteSupplement(supplement.id!)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Remove
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <DailyScheduleBuilder
              schedule={formData.dailySchedule || {}}
              onChange={handleScheduleChange}
            />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Protocol Notes</CardTitle>
                  <CardDescription>
                    Internal notes about this protocol
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.protocolNotes || ""}
                    onChange={(e) => handleFormChange("protocolNotes", e.target.value)}
                    placeholder="Protocol development notes, modifications, considerations..."
                    className="min-h-[150px]"
                  />
                </CardContent>
              </Card>

              {mode === "edit" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tracking Notes</CardTitle>
                    <CardDescription>
                      Compliance and effectiveness tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="complianceNotes" className="text-gray-900 font-medium dark:text-gray-100">
                        Compliance Notes
                      </Label>
                      <Textarea
                        id="complianceNotes"
                        value={formData.complianceNotes || ""}
                        onChange={(e) => handleFormChange("complianceNotes", e.target.value)}
                        placeholder="Notes about client compliance..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sideEffects" className="text-gray-900 font-medium dark:text-gray-100">
                        Side Effects / Reactions
                      </Label>
                      <Textarea
                        id="sideEffects"
                        value={formData.sideEffects || ""}
                        onChange={(e) => handleFormChange("sideEffects", e.target.value)}
                        placeholder="Any reported side effects or reactions..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Analysis Reference */}
            {analysisData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Analysis Reference
                  </CardTitle>
                  <CardDescription>
                    Original analysis this protocol was created from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Analysis Version: {analysisData.analysisVersion}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Date: {new Date(analysisData.analysisDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to analysis view
                        window.open(
                          `/dashboard/clients/${clientId}/analysis/history`,
                          "_blank"
                        );
                      }}
                    >
                      View Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Supplement Form Modal */}
        <SupplementForm
          open={showSupplementForm}
          onOpenChange={(open) => {
            setShowSupplementForm(open);
            if (!open) {
              setEditingSupplement(undefined);
            }
          }}
          supplement={editingSupplement}
          onSave={editingSupplement ? handleUpdateSupplement : handleAddSupplement}
          existingSupplements={supplements}
          mode={editingSupplement ? "edit" : "add"}
        />
      </div>
    </div>
  );
}
