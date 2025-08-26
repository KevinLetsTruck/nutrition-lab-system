"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface NAQResponseEntryProps {
  documentId: string;
  clientName?: string;
}

interface NAQQuestion {
  id: string;
  questionNumber: number;
  symptomText: string;
  section: string;
  value: number | null;
}

const NAQ_SECTIONS = [
  { name: "Diet", start: 1, end: 20 },
  { name: "Lifestyle", start: 21, end: 24 },
  { name: "Medications", start: 25, end: 51 },
  { name: "Upper Gastrointestinal", start: 52, end: 70 },
  { name: "Liver & Gallbladder", start: 71, end: 98 },
  { name: "Small Intestine", start: 99, end: 115 },
  { name: "Large Intestine", start: 116, end: 135 },
  { name: "Mineral Needs", start: 136, end: 164 },
  { name: "Essential Fatty Acids", start: 165, end: 172 },
  { name: "Sugar Handling", start: 173, end: 185 },
  { name: "Vitamin Need", start: 186, end: 212 },
  { name: "Adrenal", start: 213, end: 238 },
  { name: "Pituitary", start: 239, end: 251 },
  { name: "Thyroid", start: 252, end: 267 },
  { name: "Female Reproductive", start: 277, end: 296 },
  { name: "Cardiovascular", start: 297, end: 306 },
  { name: "Kidney & Bladder", start: 307, end: 311 },
  { name: "Immune System", start: 312, end: 318 },
];

export default function NAQResponseEntry({
  documentId,
  clientName = "Client",
}: NAQResponseEntryProps) {
  const [questions, setQuestions] = useState<NAQQuestion[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSections, setSavedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [documentId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `/api/medical/documents/${documentId}/lab-values`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();

      // Transform lab values into questions format
      const naqQuestions: NAQQuestion[] = data.labValues
        .filter((lv: any) => lv.standardName === "naq_question")
        .map((lv: any) => ({
          id: lv.id,
          questionNumber:
            lv.questionNumber || parseInt(lv.testName.replace("NAQ Q", "")),
          symptomText: lv.valueText || lv.symptomText || "",
          section: lv.category || "General",
          value: lv.value,
        }))
        .sort(
          (a: NAQQuestion, b: NAQQuestion) =>
            a.questionNumber - b.questionNumber
        );

      setQuestions(naqQuestions);

      // Check which sections already have responses
      const sectionsWithResponses = new Set<number>();
      NAQ_SECTIONS.forEach((section, index) => {
        const sectionQuestions = naqQuestions.filter(
          (q) =>
            q.questionNumber >= section.start && q.questionNumber <= section.end
        );
        if (sectionQuestions.some((q) => q.value !== null)) {
          sectionsWithResponses.add(index);
        }
      });
      setSavedSections(sectionsWithResponses);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateResponse = (questionId: string, value: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, value } : q))
    );
  };

  const saveResponses = async () => {
    setSaving(true);

    try {
      const section = NAQ_SECTIONS[currentSection];
      const sectionQuestions = questions.filter(
        (q) =>
          q.questionNumber >= section.start && q.questionNumber <= section.end
      );

      // Update each question's value
      for (const question of sectionQuestions) {
        if (question.value !== null) {
          await fetch(`/api/medical/lab-values/${question.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: question.value }),
          });
        }
      }

      // Add section to saved set
      setSavedSections((prev) => new Set([...prev, currentSection]));

      // If not the last section, go to next
      if (currentSection < NAQ_SECTIONS.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    } catch (error) {
      console.error("Error saving responses:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const section = NAQ_SECTIONS[currentSection];
  const sectionQuestions = questions.filter(
    (q) => q.questionNumber >= section.start && q.questionNumber <= section.end
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>NAQ Response Entry - {clientName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Section {currentSection + 1} of {NAQ_SECTIONS.length}:{" "}
              {section.name}
            </p>
            <div className="flex gap-2">
              {NAQ_SECTIONS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSection(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSection
                      ? "bg-blue-600"
                      : savedSections.has(index)
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                  title={NAQ_SECTIONS[index].name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{section.name}</span>
            {savedSections.has(currentSection) && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 w-12">
                  {question.questionNumber}.
                </span>
                <span className="flex-1 text-gray-700">
                  {question.symptomText}
                </span>
              </div>
              <div className="flex gap-4 ml-12">
                {[0, 1, 2, 3].map((value) => (
                  <button
                    key={value}
                    onClick={() => updateResponse(question.id, value)}
                    className={`w-12 h-12 rounded-full border-2 font-medium transition-all ${
                      question.value === value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {value}
                  </button>
                ))}
                {question.value !== null && (
                  <button
                    onClick={() => updateResponse(question.id, null as any)}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(currentSection - 1)}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Button
          onClick={saveResponses}
          disabled={saving || sectionQuestions.every((q) => q.value === null)}
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save & Continue
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => setCurrentSection(currentSection + 1)}
          disabled={currentSection === NAQ_SECTIONS.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600">
            <p>
              Questions answered in this section:{" "}
              {sectionQuestions.filter((q) => q.value !== null).length} /{" "}
              {sectionQuestions.length}
            </p>
            <p>
              Total sections completed: {savedSections.size} /{" "}
              {NAQ_SECTIONS.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
