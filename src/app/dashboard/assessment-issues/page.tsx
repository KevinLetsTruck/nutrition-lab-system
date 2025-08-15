"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Download,
  ShieldAlert,
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
  | "DESIGN"
  | "TECHNICAL";
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
  errorMessage?: string;
  stackTrace?: string;
  blocksTesting?: boolean;
  quickFix?: string;
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
  TECHNICAL: {
    label: "Technical Error",
    icon: ShieldAlert,
    color: "text-red-700 bg-red-100 border-red-300",
  },
};

const PRIORITY_CONFIG = {
  CRITICAL: { 
    label: "Critical", 
    color: "bg-orange-600",
    borderColor: "border-orange-600",
    textColor: "text-orange-600" 
  },
  HIGH: { 
    label: "High", 
    color: "bg-yellow-600",
    borderColor: "border-yellow-600",
    textColor: "text-yellow-600" 
  },
  MEDIUM: { 
    label: "Medium", 
    color: "bg-blue-600",
    borderColor: "border-blue-600",
    textColor: "text-blue-600" 
  },
  LOW: { 
    label: "Low", 
    color: "bg-green-600",
    borderColor: "border-green-600",
    textColor: "text-green-600" 
  },
};

// Special color for blockers
const getIssueCardColor = (issue: Issue) => {
  if (issue.blocksTesting) {
    return "border-red-600 bg-red-50";
  }
  if (issue.priority === "CRITICAL") {
    return "border-orange-200 bg-orange-50";
  }
  if (issue.priority === "HIGH") {
    return "border-yellow-200 bg-yellow-50";
  }
  return "";
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

  // Keyboard shortcut for quick issue logging
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        setShowAddForm(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Export function to generate markdown report
  const exportIssuesAsMarkdown = useCallback(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    let markdown = `# Assessment Issues Report\n`;
    markdown += `Generated: ${now.toLocaleString()}\n\n`;
    
    // Summary stats
    markdown += `## Summary\n`;
    markdown += `- Total Issues: ${issues.length}\n`;
    markdown += `- Blocking Issues: ${issues.filter(i => i.blocksTesting).length}\n`;
    markdown += `- Critical: ${issues.filter(i => i.priority === 'CRITICAL').length}\n`;
    markdown += `- Open: ${issues.filter(i => i.status === 'OPEN').length}\n`;
    markdown += `- In Progress: ${issues.filter(i => i.status === 'IN_PROGRESS').length}\n\n`;
    
    // Blocking issues first
    const blockingIssues = issues.filter(i => i.blocksTesting);
    if (blockingIssues.length > 0) {
      markdown += `## 🚨 BLOCKING ISSUES\n\n`;
      blockingIssues.forEach(issue => {
        markdown += `### ${issue.title}\n`;
        markdown += `- **ID**: ${issue.id}\n`;
        markdown += `- **Category**: ${issue.category}\n`;
        markdown += `- **Priority**: ${issue.priority}\n`;
        markdown += `- **Status**: ${issue.status}\n`;
        markdown += `- **Description**: ${issue.description}\n`;
        if (issue.errorMessage) markdown += `- **Error**: ${issue.errorMessage}\n`;
        if (issue.quickFix) markdown += `- **Quick Fix**: ${issue.quickFix}\n`;
        if (issue.proposedFix) markdown += `- **Proposed Fix**: ${issue.proposedFix}\n`;
        markdown += `\n`;
      });
    }
    
    // Other issues by priority
    const nonBlockingIssues = issues.filter(i => !i.blocksTesting);
    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(priority => {
      const priorityIssues = nonBlockingIssues.filter(i => i.priority === priority);
      if (priorityIssues.length > 0) {
        markdown += `## ${priority} Priority Issues\n\n`;
        priorityIssues.forEach(issue => {
          markdown += `### ${issue.title}\n`;
          markdown += `- **Category**: ${issue.category}\n`;
          markdown += `- **Status**: ${issue.status}\n`;
          markdown += `- **Description**: ${issue.description}\n`;
          if (issue.proposedFix) markdown += `- **Proposed Fix**: ${issue.proposedFix}\n`;
          markdown += `\n`;
        });
      }
    });
    
    // Download the file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-issues-${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Issues exported as markdown');
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
    blocking: issues.filter((i) => i.blocksTesting).length,
    critical: issues.filter((i) => i.priority === "CRITICAL").length,
    open: issues.filter((i) => i.status === "OPEN").length,
    inProgress: issues.filter((i) => i.status === "IN_PROGRESS").length,
    fixed: issues.filter((i) => i.status === "FIXED").length,
    biasIssues: issues.filter((i) => i.category === "BIAS").length,
    seedOilIssues: issues.filter((i) => i.category === "SEED_OIL").length,
    technicalIssues: issues.filter((i) => i.category === "TECHNICAL").length,
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Log New Issue
          </Button>
          <Button
            onClick={exportIssuesAsMarkdown}
            variant="outline"
            disabled={issues.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Shift+I</kbd> to quickly log issues
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600">Total Issues</p>
          </CardContent>
        </Card>
        {stats.blocking > 0 && (
          <Card className="border-2 border-red-600 bg-red-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-700">
                {stats.blocking}
              </div>
              <p className="text-xs text-red-700 font-semibold">🚨 BLOCKING</p>
            </CardContent>
          </Card>
        )}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.critical}
            </div>
            <p className="text-xs text-orange-600">Critical</p>
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
              className={`cursor-pointer hover:shadow-md transition-shadow ${getIssueCardColor(issue)}`}
              onClick={() => setSelectedIssue(issue)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {issue.blocksTesting && (
                        <Badge className="bg-red-600 text-white">
                          🚨 BLOCKS TESTING
                        </Badge>
                      )}
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
                    {issue.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <strong className="text-red-700">Error:</strong> 
                        <code className="text-red-600 ml-1">{issue.errorMessage}</code>
                      </div>
                    )}
                    {issue.quickFix && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong className="text-blue-700">Quick Fix:</strong> 
                        <span className="text-blue-600 ml-1">{issue.quickFix}</span>
                      </div>
                    )}
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
    errorMessage: "",
    stackTrace: "",
    blocksTesting: false,
    quickFix: "",
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

      {/* Technical Issue Fields */}
      {formData.category === "TECHNICAL" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Error Message</label>
            <Input
              value={formData.errorMessage}
              onChange={(e) =>
                setFormData({ ...formData, errorMessage: e.target.value })
              }
              placeholder="e.g., Failed to fetch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stack Trace</label>
            <Textarea
              value={formData.stackTrace}
              onChange={(e) =>
                setFormData({ ...formData, stackTrace: e.target.value })
              }
              placeholder="Paste the stack trace here"
              rows={3}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quick Fix</label>
            <Textarea
              value={formData.quickFix}
              onChange={(e) =>
                setFormData({ ...formData, quickFix: e.target.value })
              }
              placeholder="Immediate steps to resolve or work around this issue"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="blocksTesting"
              checked={formData.blocksTesting}
              onChange={(e) =>
                setFormData({ ...formData, blocksTesting: e.target.checked })
              }
              className="h-4 w-4 text-red-600"
            />
            <label htmlFor="blocksTesting" className="text-sm font-medium text-red-600">
              This issue blocks testing
            </label>
          </div>
        </>
      )}

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
