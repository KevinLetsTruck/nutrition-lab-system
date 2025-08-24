"use client";

import { useState, useEffect } from "react";
import { QuestionRenderer } from "@/components/assessment/QuestionRenderer";
import { AssessmentQuestion } from "@/lib/assessment/types";

export default function TestQuestionRendering() {
  const [question, setQuestion] = useState<AssessmentQuestion | null>(null);
  const [value, setValue] = useState<any>(null);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    // Fetch test question
    fetch("/api/assessment/test-question")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuestion(data.data.question);
          setDebug(data.data.debug);

        }
      })
      .catch((err) => console.error("Error loading test question:", err));
  }, []);

  const handleSubmit = () => {

  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Question Rendering Test</h1>

        {debug && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Debug Information:</h2>
            <pre className="text-sm">{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}

        {question ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <QuestionRenderer
              question={question}
              value={value}
              onChange={setValue}
              onSubmit={handleSubmit}
            />
          </div>
        ) : (
          <div>Loading test question...</div>
        )}

        {value && (
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold mb-2">Current Value:</h2>
            <pre className="text-sm">{JSON.stringify(value, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
