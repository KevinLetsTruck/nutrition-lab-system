"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity, ChevronDown } from "lucide-react";
import { TimelineExportDialog } from "./TimelineExportDialog";

type TimelineType =
  | "COMPREHENSIVE"
  | "FOCUSED"
  | "SYMPTOMS"
  | "TREATMENTS"
  | "ASSESSMENTS"
  | "PROTOCOL_DEVELOPMENT";

interface TimelineExportButtonProps {
  clientId: string;
  clientName: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  defaultTimelineType?: TimelineType;
}

export function TimelineExportButton({
  clientId,
  clientName,
  variant = "outline",
  size = "sm",
  defaultTimelineType = "PROTOCOL_DEVELOPMENT",
}: TimelineExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant={variant}
        size={size}
        className="gap-2"
      >
        <Activity className="h-4 w-4" />
        Timeline Analysis
        <ChevronDown className="h-3 w-3" />
      </Button>

      <TimelineExportDialog
        clientId={clientId}
        clientName={clientName}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTimelineType={defaultTimelineType}
      />
    </>
  );
}
