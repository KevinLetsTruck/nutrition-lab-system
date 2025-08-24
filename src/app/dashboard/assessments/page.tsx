"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Brain,
} from "lucide-react";
import { format } from "date-fns";

interface Assessment {
  id: string;
  status: string;
  currentModule: string;
  questionsAsked: number;
  questionsSaved: number;
  startedAt: string;
  completedAt?: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  analysis?: {
    overallScore: number;
    aiSummary?: string;
  };
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress">("all");

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/assessments", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAssessments(data.assessments);
      } else {
        console.error("Failed to fetch assessments:", data.error);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && assessment.status === "COMPLETED") ||
      (filter === "in_progress" && assessment.status === "IN_PROGRESS");

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    const color =
      score >= 80
        ? "bg-green-100 text-green-800"
        : score >= 60
        ? "bg-yellow-100 text-yellow-800"
        : score >= 40
        ? "bg-orange-100 text-orange-800"
        : "bg-red-100 text-red-800";

    return <Badge className={color}>{score}/100</Badge>;
  };

  return (
    <div className="min-h-screen bg-brand-navy p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Assessment Dashboard
          </h1>
          <p className="text-gray-400">
            View and manage all client health assessments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Assessments
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{assessments.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {assessments.filter((a) => a.status === "COMPLETED").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {assessments.filter((a) => a.status === "IN_PROGRESS").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Avg. Questions
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {assessments.length > 0
                  ? Math.round(
                      assessments.reduce((sum, a) => sum + a.questionsAsked, 0) /
                        assessments.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-green"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-brand-green text-brand-darkNavy hover:bg-brand-green/90" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}
            >
              All
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              onClick={() => setFilter("completed")}
              className={filter === "completed" ? "bg-brand-green text-brand-darkNavy hover:bg-brand-green/90" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}
            >
              Completed
            </Button>
            <Button
              variant={filter === "in_progress" ? "default" : "outline"}
              onClick={() => setFilter("in_progress")}
              className={filter === "in_progress" ? "bg-brand-green text-brand-darkNavy hover:bg-brand-green/90" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}
            >
              In Progress
            </Button>
          </div>
        </div>

        {/* Assessments Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Client Assessments</CardTitle>
            <CardDescription className="text-gray-400">
              Click on any assessment to view detailed results and AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Client</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Module</TableHead>
                  <TableHead className="text-gray-300">Questions</TableHead>
                  <TableHead className="text-gray-300">Score</TableHead>
                  <TableHead className="text-gray-300">Started</TableHead>
                  <TableHead className="text-gray-300">Completed</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      No assessments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <TableRow
                      key={assessment.id}
                      className="cursor-pointer hover:bg-gray-700 border-gray-700"
                      onClick={() => router.push(`/dashboard/assessments/${assessment.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">
                            {assessment.client.firstName} {assessment.client.lastName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {assessment.client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                      <TableCell className="text-sm text-gray-300">
                        {assessment.currentModule}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-300">{assessment.questionsAsked} asked</div>
                          <div className="text-green-500">
                            {assessment.questionsSaved} saved
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assessment.analysis?.overallScore ? (
                          getScoreBadge(assessment.analysis.overallScore)
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-300">
                        {format(new Date(assessment.startedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-gray-300">
                        {assessment.completedAt ? (
                          format(new Date(assessment.completedAt), "MMM d, yyyy")
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/assessments/${assessment.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
