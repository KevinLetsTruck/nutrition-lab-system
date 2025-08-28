import { z } from "zod";

export const timelineExportSchema = z.object({
  timelineType: z
    .enum([
      "COMPREHENSIVE",
      "FOCUSED",
      "SYMPTOMS",
      "TREATMENTS",
      "ASSESSMENTS",
      "PROTOCOL_DEVELOPMENT",
    ])
    .default("COMPREHENSIVE"),
  format: z.enum(["markdown", "json"]).default("markdown"),
  includeMetadata: z.boolean().default(true),

  // Granular control options (inspired by alternative implementation)
  includeAssessments: z.boolean().default(true),
  includeDocuments: z.boolean().default(true),
  includeMedicalDocuments: z.boolean().default(true),
  includeNotes: z.boolean().default(true),
  includeProtocols: z.boolean().default(true),
  includeStatusChanges: z.boolean().default(true),
  includeAIAnalyses: z.boolean().default(true),

  dateRange: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
    .optional(),
});

export const timelineExportFilterSchema = z.object({
  clientId: z.string().cuid(),
  timelineType: z
    .enum([
      "COMPREHENSIVE",
      "FOCUSED",
      "SYMPTOMS",
      "TREATMENTS",
      "ASSESSMENTS",
      "PROTOCOL_DEVELOPMENT",
    ])
    .optional(),
  status: z
    .enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "EXPIRED"])
    .optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type TimelineExportInput = z.infer<typeof timelineExportSchema>;
export type TimelineExportFilter = z.infer<typeof timelineExportFilterSchema>;
