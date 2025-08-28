"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtocolCard } from "./ProtocolCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  FileText,
  Users,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Enhanced Protocol interface (matching ProtocolCard)
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

interface ProtocolSupplement {
  id: string;
  productName: string;
  dosage: string;
  timing: string;
  priority: number;
  isActive: boolean;
}

interface ProtocolGeneration {
  id: string;
  pdfUrl?: string;
  emailSentAt?: Date;
  createdAt: Date;
}

interface Protocol {
  id: string;
  protocolName: string;
  protocolPhase?: string;
  status: string;
  startDate?: Date;
  durationWeeks?: number;
  createdAt: Date;
  updatedAt: Date;
  greeting?: string;
  clinicalFocus?: string;
  currentStatus?: string;
  effectivenessRating?: number;
  client: ProtocolClient;
  analysis?: ProtocolAnalysis;
  protocolSupplements: ProtocolSupplement[];
  protocolGenerations: ProtocolGeneration[];
}

// API response interface
interface ProtocolsResponse {
  success: boolean;
  data: Protocol[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProtocolListProps {
  clientId?: string; // Filter by specific client if provided
  onCreateNew?: () => void;
  onEditProtocol?: (protocol: Protocol) => void;
  onDeleteProtocol?: (protocolId: string) => void;
  onGeneratePDF?: (protocolId: string) => void;
  onSendEmail?: (protocolId: string) => void;
  onCreateFromAnalysis?: (analysisId: string) => void;
  className?: string;
}

export function ProtocolList({
  clientId,
  onCreateNew,
  onEditProtocol,
  onDeleteProtocol,
  onGeneratePDF,
  onSendEmail,
  onCreateFromAnalysis,
  className,
}: ProtocolListProps) {
  const { token } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch protocols from API
  const fetchProtocols = async (page = 1) => {
    if (!token) return;

    setLoading(page === 1);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (clientId) params.append("clientId", clientId);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (phaseFilter !== "all") params.append("protocolPhase", phaseFilter);
      params.append("page", page.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/protocols?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch protocols: ${response.statusText}`);
      }

      const data: ProtocolsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch protocols");
      }

      setProtocols(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);

    } catch (err) {
      console.error("Error fetching protocols:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch protocols");
      toast.error("Failed to load protocols", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    fetchProtocols(1);
  }, [token, clientId, statusFilter, phaseFilter]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProtocols(currentPage);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProtocols(newPage);
    }
  };

  // Handle protocol deletion
  const handleDelete = async (protocolId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete protocol");
      }

      toast.success("Protocol deleted successfully");
      
      // Refresh the list
      fetchProtocols(currentPage);
      
      // Call parent handler if provided
      if (onDeleteProtocol) {
        onDeleteProtocol(protocolId);
      }

    } catch (err) {
      console.error("Error deleting protocol:", err);
      toast.error("Failed to delete protocol", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Handle PDF generation
  const handleGeneratePDF = async (protocolId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/protocols/${protocolId}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          format: "standard",
          includeSupplements: true,
          includeDietaryGuidelines: true,
          includeLifestyleModifications: true,
          includeSchedule: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const data = await response.json();
      
      if (onGeneratePDF) {
        onGeneratePDF(protocolId);
      }

      // In a real implementation, this would trigger a download
      toast.success("PDF generated successfully", {
        description: "PDF generation completed (mock implementation)",
      });

    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Handle email sending
  const handleSendEmail = async (protocolId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/protocols/${protocolId}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          includeGreeting: true,
          includePDF: true,
          includeInstructions: true,
          includeFollowUp: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const data = await response.json();
      
      if (onSendEmail) {
        onSendEmail(protocolId);
      }

      toast.success("Email sent successfully", {
        description: "Protocol sent to client (mock implementation)",
      });

    } catch (err) {
      console.error("Error sending email:", err);
      toast.error("Failed to send email", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Filter protocols by search query
  const filteredProtocols = protocols.filter(protocol => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      protocol.protocolName.toLowerCase().includes(query) ||
      `${protocol.client.firstName} ${protocol.client.lastName}`.toLowerCase().includes(query) ||
      protocol.client.email.toLowerCase().includes(query) ||
      protocol.clinicalFocus?.toLowerCase().includes(query)
    );
  });

  // Get status counts for badges
  const statusCounts = protocols.reduce((counts, protocol) => {
    counts[protocol.status] = (counts[protocol.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading protocols...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {clientId ? "Client Protocols" : "All Protocols"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track supplement protocols
              {pagination.total > 0 && ` (${pagination.total} total)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {onCreateNew && (
              <Button onClick={onCreateNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Protocol
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        {protocols.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {pagination.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {statusCounts.active || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Planned</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {statusCounts.planned || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {statusCounts.completed || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search protocols, clients, or focus areas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              {/* Phase Filter */}
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="Phase 1">Phase 1</SelectItem>
                  <SelectItem value="Phase 2">Phase 2</SelectItem>
                  <SelectItem value="Phase 3">Phase 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(searchQuery || statusFilter !== "all" || phaseFilter !== "all") && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active filters:
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {phaseFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Phase: {phaseFilter}
                    <button
                      onClick={() => setPhaseFilter("all")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Protocol List */}
        {filteredProtocols.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {protocols.length === 0 ? "No protocols found" : "No matching protocols"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {protocols.length === 0
                  ? "Create your first protocol to get started"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {onCreateNew && protocols.length === 0 && (
                <Button onClick={onCreateNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Protocol
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProtocols.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                onEdit={onEditProtocol}
                onDelete={handleDelete}
                onGeneratePDF={handleGeneratePDF}
                onSendEmail={handleSendEmail}
                onCreateFromAnalysis={onCreateFromAnalysis}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} protocols
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
                {pagination.totalPages > 5 && (
                  <span className="text-gray-400 px-2">...</span>
                )}
              </div>

              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
