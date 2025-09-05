import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { apiConfigSchema, reportFiltersSchema, type ReportSummary, type Team, type User, type Incident } from "@shared/schema";
import axios from "axios";

const VICTOROPS_BASE_URL = "https://api.victorops.com/api-public/v1";

// Helper function to make VictorOps API calls
async function makeVictorOpsRequest(endpoint: string, apiId: string, apiKey: string) {
  try {
    const response = await axios.get(`${VICTOROPS_BASE_URL}${endpoint}`, {
      headers: {
        'X-VO-Api-Id': apiId,
        'X-VO-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Invalid API credentials. Please check your API ID and API Key.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Your API key may not have sufficient permissions.");
      } else if (error.response?.status === 404) {
        throw new Error("API endpoint not found. Please verify your VictorOps account is properly configured.");
      } else {
        throw new Error(`VictorOps API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    throw error;
  }
}

// Helper function to determine if time is out of hours (weekends or 6PM-8AM weekdays)
function isOutOfHours(timestamp: string): boolean {
  const date = new Date(timestamp);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = date.getHours();
  
  // Weekend (Saturday or Sunday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }
  
  // Weekday outside business hours (before 8 AM or after 6 PM)
  if (hour < 8 || hour >= 18) {
    return true;
  }
  
  return false;
}

// Helper function to calculate response time in minutes
function calculateResponseTime(startTime: string, ackTime?: string): number {
  if (!ackTime) return 0;
  
  const start = new Date(startTime);
  const ack = new Date(ackTime);
  return Math.round((ack.getTime() - start.getTime()) / (1000 * 60));
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Test API connection
  app.post("/api/test-connection", async (req, res) => {
    try {
      const config = apiConfigSchema.parse(req.body);
      
      // Test connection by fetching user info instead of profile
      await makeVictorOpsRequest("/user", config.apiId, config.apiKey);
      
      // Store API config if connection successful
      await storage.setApiConfig(config);
      
      res.json({ success: true, message: "Connection successful" });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Connection failed" 
      });
    }
  });

  // Get teams from VictorOps
  app.get("/api/teams", async (req, res) => {
    try {
      const config = await storage.getApiConfig();
      if (!config) {
        return res.status(401).json({ message: "API configuration not found" });
      }

      const data = await makeVictorOpsRequest("/team", config.apiId, config.apiKey);
      const teams: Team[] = data.map((team: any) => ({
        name: team.name,
        slug: team.slug
      }));

      await storage.setTeams(teams);
      res.json(teams);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to fetch teams" });
    }
  });

  // Get users from VictorOps
  app.get("/api/users", async (req, res) => {
    try {
      const config = await storage.getApiConfig();
      if (!config) {
        return res.status(401).json({ message: "API configuration not found" });
      }

      const data = await makeVictorOpsRequest("/user", config.apiId, config.apiKey);
      const users: User[] = data.users?.map((user: any) => ({
        username: user.username,
        displayName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username
      })) || [];

      await storage.setUsers(users);
      res.json(users);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to fetch users" });
    }
  });

  // Generate report
  app.post("/api/generate-report", async (req, res) => {
    try {
      const filters = reportFiltersSchema.parse(req.body);
      const config = await storage.getApiConfig();
      
      if (!config) {
        return res.status(401).json({ message: "API configuration not found" });
      }

      // Create cache key
      const cacheKey = `${filters.reportType}-${filters.targetId}-${filters.startDate}-${filters.endDate}`;
      
      // Check cache first
      const cached = await storage.getReportCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Get incidents from VictorOps
      const startTime = new Date(filters.startDate).toISOString();
      const endTime = new Date(filters.endDate).toISOString();
      
      const incidentsData = await makeVictorOpsRequest(
        `/incidents?startTime=${startTime}&endTime=${endTime}`,
        config.apiId,
        config.apiKey
      );

      let incidents: Incident[] = incidentsData.incidents?.map((incident: any) => ({
        incidentNumber: incident.incidentNumber,
        entityId: incident.entityId,
        entityDisplayName: incident.entityDisplayName || incident.entityId,
        stateMessage: incident.stateMessage,
        startTime: incident.startTime,
        endTime: incident.endTime,
        ackTime: incident.ackTime,
        ackUserId: incident.ackUserId,
        currentPhase: incident.currentPhase,
        service: incident.service,
        host: incident.host,
        teams: incident.teams,
        pagedUsers: incident.pagedUsers,
        pagedTeams: incident.pagedTeams,
      })) || [];

      // Filter for OOH incidents and by team/user
      incidents = incidents.filter(incident => {
        // Check if incident occurred during out-of-hours
        if (!isOutOfHours(incident.startTime)) {
          return false;
        }

        // Filter by team or user based on report type
        if (filters.reportType === "team") {
          return incident.pagedTeams?.includes(filters.targetId) || 
                 incident.teams?.includes(filters.targetId);
        } else {
          return incident.pagedUsers?.includes(filters.targetId) ||
                 incident.ackUserId === filters.targetId;
        }
      });

      // Calculate summary statistics
      const totalCallouts = incidents.length;
      const responseTimes = incidents
        .map(incident => calculateResponseTime(incident.startTime, incident.ackTime))
        .filter(time => time > 0);
      
      const averageResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
        : 0;

      // Calculate peak period (most common hour for incidents)
      const hourCounts: { [hour: number]: number } = {};
      incidents.forEach(incident => {
        const hour = new Date(incident.startTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHour = Object.keys(hourCounts).reduce((a, b) => 
        hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b, "0"
      );
      
      const peakPeriod = `${peakHour}:00 - ${parseInt(peakHour) + 1}:00`;

      const reportSummary: ReportSummary = {
        totalCallouts,
        averageResponseTime,
        peakPeriod,
        incidents
      };

      // Cache the result
      await storage.setReportCache(cacheKey, reportSummary);

      res.json(reportSummary);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to generate report" });
    }
  });

  // Export CSV
  app.post("/api/export-csv", async (req, res) => {
    try {
      const filters = reportFiltersSchema.parse(req.body);
      const cacheKey = `${filters.reportType}-${filters.targetId}-${filters.startDate}-${filters.endDate}`;
      
      const reportData = await storage.getReportCache(cacheKey);
      if (!reportData) {
        return res.status(404).json({ message: "Report data not found. Please generate report first." });
      }

      // Convert incidents to CSV format
      const csvData = reportData.incidents.map(incident => {
        const startDate = new Date(incident.startTime);
        const responseTime = incident.ackTime 
          ? calculateResponseTime(incident.startTime, incident.ackTime)
          : 0;
        
        return {
          date: startDate.toLocaleDateString(),
          time: startDate.toLocaleTimeString(),
          teamUser: filters.reportType === "team" ? filters.targetId : incident.ackUserId || "N/A",
          incident: incident.entityDisplayName || incident.entityId,
          responseTime: responseTime > 0 ? `${responseTime} min` : "N/A",
          status: incident.currentPhase,
          severity: incident.stateMessage.toLowerCase().includes("critical") ? "Critical" : 
                   incident.stateMessage.toLowerCase().includes("warning") ? "Warning" : "Info",
          description: incident.stateMessage,
        };
      });

      // Generate CSV content
      const headers = ["Date", "Time", "Team/User", "Incident", "Response Time", "Status", "Severity", "Description"];
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(","))
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="victorops-ooh-report-${Date.now()}.csv"`);
      res.send(csvContent);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to export CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
