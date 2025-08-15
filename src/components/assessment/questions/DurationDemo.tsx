"use client";

import React, { useState } from "react";
import { Duration } from "./Duration";

export function DurationDemo() {
  const [value, setValue] = useState<{ hours: number; minutes: number } | null>(
    null
  );

  const demoQuestion = {
    id: "demo_duration",
    text: "How long do you typically exercise each day?",
    type: "DURATION" as const,
    module: "SCREENING" as const,
    required: true,
    minMinutes: 0,
    maxMinutes: 240, // 4 hours max
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Duration Input Demo</h3>
      <p className="text-gray-600">
        Used for time-based questions like exercise duration, sleep time, etc.
      </p>

      <div className="border rounded-lg p-4">
        <Duration question={demoQuestion} value={value} onChange={setValue} />
      </div>

      {value && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">
            Selected Duration: {value.hours} hours and {value.minutes} minutes
          </p>
        </div>
      )}
    </div>
  );
}
