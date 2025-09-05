import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// VictorOps API Configuration
export const apiConfigSchema = z.object({
  apiId: z.string().min(1, "API ID is required"),
  apiKey: z.string().min(1, "API Key is required"),
});

export type ApiConfig = z.infer<typeof apiConfigSchema>;

// Team data from VictorOps API
export const teamSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type Team = z.infer<typeof teamSchema>;

// User data from VictorOps API
export const userSchema = z.object({
  username: z.string(),
  displayName: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// Incident/Callout data from VictorOps API
export const incidentSchema = z.object({
  incidentNumber: z.string(),
  entityId: z.string(),
  entityDisplayName: z.string().optional(),
  stateMessage: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  ackTime: z.string().optional(),
  ackUserId: z.string().optional(),
  currentPhase: z.string(),
  service: z.string().optional(),
  host: z.string().optional(),
  teams: z.array(z.string()).optional(),
  pagedUsers: z.array(z.string()).optional(),
  pagedTeams: z.array(z.string()).optional(),
});

export type Incident = z.infer<typeof incidentSchema>;

// OOH Hours Configuration
export const oohHoursSchema = z.object({
  weekdayStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"), // e.g., "17:00"
  weekdayEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"), // e.g., "09:00"
  includeWeekends: z.boolean().default(true),
});

export type OohHours = z.infer<typeof oohHoursSchema>;

// Escalation Policy data from VictorOps API
export const escalationPolicySchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type EscalationPolicy = z.infer<typeof escalationPolicySchema>;

// Report filter parameters
export const reportFiltersSchema = z.object({
  reportType: z.enum(["team", "user"]),
  targetId: z.string().min(1, "Team or user selection is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  escalationPolicy: z.string().optional(),
  oohHours: oohHoursSchema.optional(),
});

export type ReportFilters = z.infer<typeof reportFiltersSchema>;

// Report summary statistics
export const reportSummarySchema = z.object({
  totalCallouts: z.number(),
  averageResponseTime: z.number(), // in minutes
  peakPeriod: z.string(),
  incidents: z.array(incidentSchema),
});

export type ReportSummary = z.infer<typeof reportSummarySchema>;

// CSV export data
export const csvExportSchema = z.object({
  filters: reportFiltersSchema,
  data: z.array(z.object({
    date: z.string(),
    time: z.string(),
    teamUser: z.string(),
    incident: z.string(),
    responseTime: z.string(),
    status: z.string(),
    severity: z.string(),
    description: z.string(),
  })),
});

export type CsvExportData = z.infer<typeof csvExportSchema>;
