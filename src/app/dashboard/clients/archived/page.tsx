"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Eye,
  RotateCcw,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Archive,
} from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  lastAssessment?: string;
}

type SortConfig = {
  key: keyof Client;
  direction: "asc" | "desc";
} | null;

export default function ArchivedClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchArchivedClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/clients?status=ARCHIVED", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch archived clients");
      }

      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchArchivedClients();
    }
  }, [mounted, router]);

  const handleSort = (key: keyof Client) => {
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

  const getSortIcon = (key: keyof Client) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="w-4 h-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
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
        fetchArchivedClients(); // Refresh the list
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
        `Are you sure you want to permanently delete ${clientName}? This action cannot be undone and will remove all their data.`
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
        alert(`${clientName} has been permanently deleted`);
        fetchArchivedClients(); // Refresh the list
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

  const filteredAndSortedClients = clients
    .filter((client) => {
      const matchesSearch =
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;
      let aValue: any;
      let bValue: any;

      switch (key) {
        case "firstName":
        case "lastName":
        case "email":
          aValue = a[key].toLowerCase();
          bValue = b[key].toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
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

  // Prevent SSR issues
  if (!mounted) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-2 text-[#f1f5f9]">
          <div className="spinner w-6 h-6"></div>
          <span>Loading Archived Clients...</span>
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
            Archived Clients
          </h1>
          <p className="text-[#94a3b8]">Manage and restore archived clients</p>
        </div>

        <Link
          href="/dashboard/clients"
          className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Active Clients
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="card p-4" style={{ background: "var(--bg-card)" }}>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Search Archived Clients
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10 pr-10 py-3 rounded-md"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                ×
              </button>
            )}
          </div>
          {searchTerm && (
            <p
              className="text-sm mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {filteredAndSortedClients.length} client
              {filteredAndSortedClients.length !== 1 ? "s" : ""} found for "
              {searchTerm}"
            </p>
          )}
        </div>
      </div>

      {/* Client Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-dark">
            <thead>
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider cursor-pointer hover:bg-[#334155] select-none transition-colors duration-200"
                  onClick={() => handleSort("firstName")}
                >
                  <div className="flex items-center gap-1">
                    Client
                    {getSortIcon("firstName")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider cursor-pointer hover:bg-[#334155] select-none transition-colors duration-200"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-1">
                    Email
                    {getSortIcon("email")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider cursor-pointer hover:bg-[#334155] select-none transition-colors duration-200"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    Archived Date
                    {getSortIcon("createdAt")}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#374151]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner w-6 h-6"></div>
                      <span className="text-[#94a3b8]">
                        Loading archived clients...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-red-400">
                      <p className="mb-2">Error loading archived clients</p>
                      <p className="text-sm text-[#94a3b8]">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-[#94a3b8]">
                      <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        No archived clients found
                      </p>
                      <p className="text-sm">
                        {searchTerm
                          ? `No archived clients match "${searchTerm}"`
                          : "There are no archived clients yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#374151] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-[#f1f5f9] font-medium">
                          {client.firstName} {client.lastName}
                        </div>
                        {client.phone && (
                          <div className="text-[#94a3b8] text-sm">
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[#f1f5f9]">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[#94a3b8] text-sm">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
                          title="View Client"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleReactivate(
                              client.id,
                              `${client.firstName} ${client.lastName}`
                            )
                          }
                          className="text-green-400 hover:text-green-300 transition-colors duration-200"
                          title="Reactivate Client"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              client.id,
                              `${client.firstName} ${client.lastName}`
                            )
                          }
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          title="Permanently Delete Client"
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

      {/* Summary Stats */}
      {!loading && !error && (
        <div className="mt-6 text-center text-[#94a3b8] text-sm">
          Showing {filteredAndSortedClients.length} of {clients.length} archived
          clients
        </div>
      )}
    </div>
  );
}

