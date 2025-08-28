"use client";

import { useState, useEffect } from "react";
import { Search, User, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  lastVisit?: string;
  _count?: {
    protocols?: number;
  };
}

interface ClientSelectorProps {
  selectedClientId?: string;
  onSelectClient: (client: Client | null) => void;
  disabled?: boolean;
  showAnalysisOnly?: boolean;
  className?: string;
}

export function ClientSelector({
  selectedClientId,
  onSelectClient,
  disabled = false,
  showAnalysisOnly = false,
  className = "",
}: ClientSelectorProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        let endpoint = "/api/clients";
        if (showAnalysisOnly) {
          endpoint += "?hasAnalysis=true";
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }

        const data = await response.json();
        setClients(data.clients || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [showAnalysisOnly]);

  // Set selected client when selectedClientId changes
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find((c) => c.id === selectedClientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [selectedClientId, clients]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    onSelectClient(client);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    onSelectClient(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
      case "ONGOING":
        return "text-green-600 dark:text-green-400";
      case "SCHEDULED":
        return "text-blue-600 dark:text-blue-400";
      case "INITIAL_INTERVIEW_COMPLETED":
        return "text-purple-600 dark:text-purple-400";
      case "ASSESSMENT_COMPLETED":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Select Client
        </label>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded border"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Select Client
        </label>
        <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Select Client {showAnalysisOnly && "(with Analysis)"}
      </label>
      
      {selectedClient ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {selectedClient.firstName.charAt(0)}{selectedClient.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {selectedClient.firstName} {selectedClient.lastName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedClient.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            disabled={disabled}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full justify-start"
          >
            <User className="h-4 w-4 mr-2" />
            {isOpen ? "Select a client..." : "Choose client"}
          </Button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {filteredClients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No clients found" : "No clients available"}
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {client.firstName} {client.lastName}
                            </p>
                            <span className={`text-xs ${getStatusColor(client.status)}`}>
                              {client.status === "ONGOING" ? "Active" : client.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {client.email}
                            </p>
                            {client._count?.protocols && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                {client._count.protocols} protocols
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Created {formatDate(client.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
