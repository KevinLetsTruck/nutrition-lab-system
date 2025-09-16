"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  isTruckDriver: boolean;
  dotNumber?: string;
  cdlNumber?: string;
  status: string;
  lastVisit?: string;
  createdAt: string;

  // Enhanced fields for health tracking
  yearsOTR?: number;
  healthGoals?: string;
  lastAssessment?: string;
  symptomBurden?: number;
  activeProtocols?: number;
  upcomingDOT?: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchClients();
    }
  }, [mounted]);

  const fetchClients = async () => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();
      // Add mock data for enhanced fields until we implement them
      const enhancedData = data.map((client: Client) => ({
        ...client,
        yearsOTR: Math.floor(Math.random() * 20) + 1,
        healthGoals: ["Weight Loss", "Energy", "Sleep Quality"][
          Math.floor(Math.random() * 3)
        ],
        lastAssessment:
          Math.random() > 0.3
            ? new Date(
                Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
              ).toISOString()
            : null,
        symptomBurden: Math.floor(Math.random() * 100),
        activeProtocols: Math.floor(Math.random() * 3),
        upcomingDOT:
          Math.random() > 0.2
            ? new Date(
                Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000
              ).toISOString()
            : null,
      }));
      setClients(enhancedData);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sorting function
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon for column headers
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-600" />
    );
  };

  // Define status priority for sorting
  const getStatusPriority = (status: string) => {
    const priorities: { [key: string]: number } = {
      ONGOING: 1,
      SCHEDULED: 2,
      ARCHIVED: 3,
    };
    return priorities[status] || 0;
  };

  const filteredAndSortedClients = clients
    .filter((client) => {
      const matchesSearch =
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || client.status === filterStatus;

      // Exclude archived clients from main list unless specifically filtering for them
      const isNotArchived =
        client.status !== "ARCHIVED" || filterStatus === "ARCHIVED";

      return matchesSearch && matchesFilter && isNotArchived;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;
      let aValue: any;
      let bValue: any;

      switch (key) {
        case "status":
          aValue = getStatusPriority(a.status);
          bValue = getStatusPriority(b.status);
          break;
        case "name":
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "lastAssessment":
          aValue = a.lastAssessment ? new Date(a.lastAssessment).getTime() : 0;
          bValue = b.lastAssessment ? new Date(b.lastAssessment).getTime() : 0;
          break;

        default:
          return 0;
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

  // Status utility functions
  const getStatusVariant = (status: string) => {
    const statusConfig: { [key: string]: string } = {
      ONGOING: "default",
      SCHEDULED: "outline",
      ARCHIVED: "destructive",
    };
    return statusConfig[status] || "default";
  };

  const formatStatusLabel = (status: string) => {
    if (!status) return "Unknown Status";

    const statusConfig: { [key: string]: string } = {
      ONGOING: "Ongoing",
      SCHEDULED: "Scheduled",
      ARCHIVED: "Archived",
    };

    return statusConfig[status] || status.replace(/_/g, " ");
  };

  const handleArchive = async (clientId: string, clientName: string) => {
    if (
      !confirm(
        `Are you sure you want to archive ${clientName}? They will be moved to the archived clients list.`
      )
    ) {
      return;
    }

    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in again");
        return;
      }

      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      if (response.ok) {
        alert(`${clientName} has been archived successfully`);
        fetchClients(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive client");
      }
    } catch (error) {
      console.error("Error archiving client:", error);
      alert(
        `Failed to archive ${clientName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleReactivate = async (clientId: string, clientName: string) => {
    if (
      !confirm(
        `Are you sure you want to reactivate ${clientName}? They will be moved back to the active clients list with "ONGOING" status.`
      )
    ) {
      return;
    }

    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in again");
        return;
      }

      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "ONGOING" }),
      });

      if (response.ok) {
        alert(`${clientName} has been reactivated successfully`);
        fetchClients(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reactivate client");
      }
    } catch (error) {
      console.error("Error reactivating client:", error);
      alert(
        `Failed to reactivate ${clientName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${clientName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in again");
        return;
      }

      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert(`${clientName} has been deleted successfully`);
        fetchClients(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert(
        `Failed to delete ${clientName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleStatusUpdate = async (clientId: string, newStatus: string) => {
    try {
      if (typeof window === "undefined") return;

      setUpdatingStatus(clientId);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in again");
        return;
      }

      // Show loading state
      const originalClients = [...clients];
      setClients(
        clients.map((client) =>
          client.id === clientId ? { ...client, status: newStatus } : client
        )
      );

      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Status is already updated in state above
      } else {
        // Revert on error
        setClients(originalClients);
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Prevent SSR issues
  if (!mounted) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-2 text-[#f1f5f9]">
          <div className="spinner w-6 h-6"></div>
          <span>Loading Client Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">
            Client Management
          </h1>
          <p className="text-[#94a3b8]">
            Manage your truck driver health optimization clients
          </p>
        </div>

        {/* Small New Client Button */}
        <Link href="/dashboard/clients/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Search Bar */}
        <div>
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium mb-3 text-gray-400">
                Search Clients
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400"
                  >
                    ×
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm mt-2 text-gray-400">
                  {filteredAndSortedClients.length} client
                  {filteredAndSortedClients.length !== 1 ? "s" : ""} found for "
                  {searchTerm}"
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <div>
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium mb-3 text-gray-400">
                Filter by Status
              </label>
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-dark">
            <thead>
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider cursor-pointer hover:bg-[#334155] select-none transition-colors duration-200"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Client
                    {getSortIcon("name")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider cursor-pointer hover:bg-[#334155] select-none transition-colors duration-200"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon("status")}
                  </div>
                </th>

                <th
                  className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider cursor-pointer hover:bg-[#334155] select-none transition-colors duration-200"
                  onClick={() => handleSort("lastAssessment")}
                >
                  <div className="flex items-center gap-1">
                    Last Assessment
                    {getSortIcon("lastAssessment")}
                  </div>
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-[#94a3b8]"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner w-5 h-5"></div>
                      <span>Loading clients...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-[#94a3b8]"
                  >
                    No clients found
                  </td>
                </tr>
              ) : (
                filteredAndSortedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#334155] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[#f1f5f9]">
                          {client.firstName} {client.lastName}
                        </div>
                        <div className="text-sm text-[#94a3b8]">
                          {client.email}
                        </div>
                        {client.isTruckDriver && (
                          <span className="badge mt-1">🚛 OTR Driver</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="status-display">
                        {updatingStatus === client.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="spinner w-3 h-3"></div>
                            <span className="text-xs text-[#94a3b8]">
                              Updating...
                            </span>
                          </div>
                        ) : (
                          <select
                            value={client.status || ""}
                            onChange={(e) =>
                              handleStatusUpdate(client.id, e.target.value)
                            }
                            className={`px-2 py-1 text-xs rounded-xl bg-gray-900/50 border border-gray-700 cursor-pointer min-w-[140px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              getStatusVariant(client.status) === "default"
                                ? "text-blue-400"
                                : getStatusVariant(client.status) ===
                                  "secondary"
                                ? "text-green-400"
                                : getStatusVariant(client.status) === "outline"
                                ? "text-yellow-400"
                                : getStatusVariant(client.status) ===
                                  "destructive"
                                ? "text-red-400"
                                : "text-[#94a3b8]"
                            }`}
                          >
                            <option value="ONGOING">Ongoing</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                      {client.lastAssessment ? (
                        new Date(client.lastAssessment).toLocaleDateString()
                      ) : (
                        <span className="text-yellow-400">Never assessed</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="p-2 rounded-xl text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-gray-800 transition-all duration-200"
                          title="View Client"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/clients/${client.id}/edit`}
                          className="p-2 rounded-xl text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-gray-800 transition-all duration-200"
                          title="Edit Client"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {client.status !== "ARCHIVED" ? (
                          <button
                            onClick={() =>
                              handleArchive(
                                client.id,
                                `${client.firstName} ${client.lastName}`
                              )
                            }
                            className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-gray-800 transition-all duration-200"
                            title="Archive Client"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleReactivate(
                                client.id,
                                `${client.firstName} ${client.lastName}`
                              )
                            }
                            className="p-2 rounded-xl text-green-400 hover:text-green-300 hover:bg-gray-800 transition-all duration-200"
                            title="Reactivate Client"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDelete(
                              client.id,
                              `${client.firstName} ${client.lastName}`
                            )
                          }
                          className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-gray-800 transition-all duration-200"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
