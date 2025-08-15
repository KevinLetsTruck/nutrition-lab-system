"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Bug,
  FileText,
  Filter,
  Plus,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Type,
  Layout,
  Brain,
  Zap,
  Code,
} from "lucide-react";
import { toast } from "sonner";

type IssueCategory =
  | "BIAS"
  | "WORDING"
  | "SEED_OIL"
  | "UX"
  | "LOGIC"
  | "AI"
  | "BUG"
  | "DESIGN";
type IssuePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type IssueStatus = "OPEN" | "IN_PROGRESS" | "FIXED" | "VERIFIED";

interface Issue {
  id: string;
  questionId?: string;
  questionText?: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  title: string;
  description: string;
  reproSteps?: string;
  proposedFix?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORY_CONFIG = {
  BIAS: {
    label: "Biasing Content",
    icon: AlertTriangle,
    color: "text-red-600 bg-red-50",
  },
  WORDING: {
    label: "Question Wording",
    icon: Type,
    color: "text-blue-600 bg-blue-50",
  },
  SEED_OIL: {
    label: "Seed Oil Logic",
    icon: Zap,
    color: "text-orange-600 bg-orange-50",
  },
  UX: {
    label: "User Experience",
    icon: Layout,
    color: "text-purple-600 bg-purple-50",
  },
  LOGIC: {
    label: "Flow Logic",
    icon: Brain,
    color: "text-indigo-600 bg-indigo-50",
  },
  AI: {
    label: "AI Behavior",
    icon: Brain,
    color: "text-green-600 bg-green-50",
  },
  BUG: { label: "Bug", icon: Bug, color: "text-red-600 bg-red-50" },
  DESIGN: { label: "Design", icon: Layout, color: "text-pink-600 bg-pink-50" },
};

const PRIORITY_CONFIG = {
  CRITICAL: { label: "Critical", color: "bg-red-600" },
  HIGH: { label: "High", color: "bg-orange-600" },
  MEDIUM: { label: "Medium", color: "bg-yellow-600" },
  LOW: { label: "Low", color: "bg-gray-600" },
};

export default function AssessmentIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<IssueCategory | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Load issues from localStorage
  useEffect(() => {
    const savedIssues = localStorage.getItem("assessment-issues");
    if (savedIssues) {
      setIssues(
        JSON.parse(savedIssues).map((issue: any) => ({
          ...issue,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
        }))
      );
    } else {
      // Add the bias issue you found as the first entry
      const initialIssue: Issue = {
        id: "issue-1",
        category: "BIAS",
        priority: "CRITICAL",
        status: "OPEN",
        title: 'Biasing message: "seed oils cause inflammation"',
        description:
          "Message appears after question that could bias user responses. Assessment should not include educational content that could influence answers.",
        proposedFix:
          "Remove all educational/informational messages during assessment. Save these for the results page only.",
        location: "After seed oil question",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setIssues([initialIssue]);
    }
  }, []);

  // Save issues to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("assessment-issues", JSON.stringify(issues));
  }, [issues]);

  const addIssue = (issue: Omit<Issue, "id" | "createdAt" | "updatedAt">) => {
    const newIssue: Issue = {
      ...issue,
      id: `issue-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setIssues([newIssue, ...issues]);
    toast.success("Issue logged successfully");
    setShowAddForm(false);
  };

  const updateIssueStatus = (id: string, status: IssueStatus) => {
    setIssues(
      issues.map((issue) =>
        issue.id === id ? { ...issue, status, updatedAt: new Date() } : issue
      )
    );
    toast.success(`Issue marked as ${status}`);
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesFilter = filter === "ALL" || issue.category === filter;
    const matchesSearch =
      searchTerm === "" ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const stats = {
    total: issues.length,
    critical: issues.filter((i) => i.priority === "CRITICAL").length,
    open: issues.filter((i) => i.status === "OPEN").length,
    inProgress: issues.filter((i) => i.status === "IN_PROGRESS").length,
    fixed: issues.filter((i) => i.status === "FIXED").length,
    biasIssues: issues.filter((i) => i.category === "BIAS").length,
    seedOilIssues: issues.filter((i) => i.category === "SEED_OIL").length,
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assessment Issue Tracker</h1>
        <p className="text-gray-600">
          Track and fix issues found during assessment testing
        </p>
      </div>

      {/* Quick Add Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Log New Issue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600">Total Issues</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.critical}
            </div>
            <p className="text-xs text-red-600">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-gray-600">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
            <p className="text-xs text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.fixed}
            </div>
            <p className="text-xs text-gray-600">Fixed</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.biasIssues}
            </div>
            <p className="text-xs text-red-600">Bias Issues</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.seedOilIssues}
            </div>
            <p className="text-xs text-orange-600">Seed Oil</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ALL")}
          >
            All
          </Button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(key as IssueCategory)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const categoryConfig = CATEGORY_CONFIG[issue.category];
          const priorityConfig = PRIORITY_CONFIG[issue.priority];
          const Icon = categoryConfig.icon;

          return (
            <Card
              key={issue.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedIssue(issue)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${categoryConfig.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge className={priorityConfig.color}>
                        {priorityConfig.label}
                      </Badge>
                      <Badge variant="outline">{issue.status}</Badge>
                      {issue.questionId && (
                        <span className="text-xs text-gray-500">
                          Question: {issue.questionId}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{issue.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {issue.description}
                    </p>
                    {issue.proposedFix && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <strong>Fix:</strong> {issue.proposedFix}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {issue.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateIssueStatus(issue.id, "IN_PROGRESS");
                        }}
                      >
                        Start Fix
                      </Button>
                    )}
                    {issue.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateIssueStatus(issue.id, "FIXED");
                        }}
                      >
                        Mark Fixed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Issue Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Log New Issue</CardTitle>
              <CardDescription>
                Document an issue found during assessment testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickIssueForm
                onSubmit={addIssue}
                onCancel={() => setShowAddForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function QuickIssueForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (issue: Omit<Issue, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    questionId: "",
    questionText: "",
    category: "BUG" as IssueCategory,
    priority: "MEDIUM" as IssuePriority,
    status: "OPEN" as IssueStatus,
    title: "",
    description: "",
    reproSteps: "",
    proposedFix: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Issue Title *</label>
        <Input
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of the issue"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as IssueCategory,
              })
            }
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority *</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as IssuePriority,
              })
            }
          >
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Question ID</label>
          <Input
            value={formData.questionId}
            onChange={(e) =>
              setFormData({ ...formData, questionId: e.target.value })
            }
            placeholder="e.g., screening_8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Where in the assessment"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <Textarea
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Detailed description of the issue"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Proposed Fix</label>
        <Textarea
          value={formData.proposedFix}
          onChange={(e) =>
            setFormData({ ...formData, proposedFix: e.target.value })
          }
          placeholder="How should this be fixed?"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Log Issue</Button>
      </div>
    </form>
  );
}
