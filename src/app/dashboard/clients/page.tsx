"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  FileText,
  FlaskConical,
  ClipboardList,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
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

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && (client.activeProtocols || 0) > 0) ||
      (filterStatus === "needsAssessment" && !client.lastAssessment) ||
      (filterStatus === "highRisk" && (client.symptomBurden || 0) > 60);

    return matchesSearch && matchesFilter;
  });

  const getHealthStatusColor = (burden: number) => {
    if (burden < 30) return "text-green-600 bg-green-100";
    if (burden < 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getDOTStatusColor = (dotDate: string) => {
    if (!dotDate) return "";
    const daysUntil = Math.floor(
      (new Date(dotDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 30) return "text-red-600";
    if (daysUntil < 90) return "text-yellow-600";
    return "text-green-600";
  };

  // Status utility functions
  const getStatusVariant = (status: string) => {
    const statusConfig: { [key: string]: string } = {
      SIGNED_UP: "default",
      INITIAL_INTERVIEW_COMPLETED: "secondary",
      ASSESSMENT_COMPLETED: "outline",
      DOCS_UPLOADED: "secondary",
      SCHEDULED: "outline",
      ONGOING: "default",
      ARCHIVED: "destructive",
    };
    return statusConfig[status] || "default";
  };

  const formatStatusLabel = (status: string) => {
    if (!status) return "Unknown Status";

    const statusConfig: { [key: string]: string } = {
      SIGNED_UP: "Signed Up",
      INITIAL_INTERVIEW_COMPLETED: "Interview Completed",
      ASSESSMENT_COMPLETED: "Assessment Completed",
      DOCS_UPLOADED: "Docs Uploaded",
      SCHEDULED: "Scheduled",
      ONGOING: "Ongoing",
      ARCHIVED: "Archived",
    };

    return statusConfig[status] || status.replace(/_/g, " ");
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchClients(); // Refresh the list
      } else {
        throw new Error("Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleStatusUpdate = async (clientId: string, newStatus: string) => {
    try {
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
        console.log(`✅ Status updated to: ${newStatus}`);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Client Management
        </h1>
        <p className="text-gray-600">
          Manage your truck driver health optimization clients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Protocols</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => (c.activeProtocols || 0) > 0).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ClipboardList className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Need Assessment</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => !c.lastAssessment).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => (c.symptomBurden || 0) > 60).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Clients</option>
            <option value="active">Active Protocols</option>
            <option value="needsAssessment">Needs Assessment</option>
            <option value="highRisk">High Risk</option>
          </select>

          <Link
            href="/dashboard/clients/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Client
          </Link>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Assessment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DOT Medical
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quick Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Loading clients...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.email}
                      </div>
                      {client.isTruckDriver && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          🚛 OTR Driver
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="status-display">
                      {updatingStatus === client.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          <span className="text-xs text-gray-500">Updating...</span>
                        </div>
                      ) : (
                        <select
                          value={client.status || ""}
                          onChange={(e) =>
                            handleStatusUpdate(client.id, e.target.value)
                          }
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${
                            getStatusVariant(client.status) === "default"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : getStatusVariant(client.status) === "secondary"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : getStatusVariant(client.status) === "outline"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : getStatusVariant(client.status) === "destructive"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <option value="SIGNED_UP">Signed Up</option>
                          <option value="INITIAL_INTERVIEW_COMPLETED">
                            Interview Completed
                          </option>
                          <option value="ASSESSMENT_COMPLETED">
                            Assessment Completed
                          </option>
                          <option value="DOCS_UPLOADED">Docs Uploaded</option>
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="ONGOING">Ongoing</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.symptomBurden ? (
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusColor(
                            client.symptomBurden
                          )}`}
                        >
                          {client.symptomBurden}% Burden
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No data</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.lastAssessment ? (
                      new Date(client.lastAssessment).toLocaleDateString()
                    ) : (
                      <span className="text-yellow-600">Never assessed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.upcomingDOT ? (
                      <span
                        className={`text-sm font-medium ${getDOTStatusColor(
                          client.upcomingDOT
                        )}`}
                      >
                        {new Date(client.upcomingDOT).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not tracked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/documents/upload?clientId=${client.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Upload Lab"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/assessments/new?clientId=${client.id}`}
                        className="text-green-600 hover:text-green-900"
                        title="Start Assessment"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/protocols/new?clientId=${client.id}`}
                        className="text-purple-600 hover:text-purple-900"
                        title="Create Protocol"
                      >
                        <FlaskConical className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Client"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/clients/${client.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Client"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(
                            client.id,
                            `${client.firstName} ${client.lastName}`
                          )
                        }
                        className="text-red-600 hover:text-red-900"
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
    </div>
  );
}
