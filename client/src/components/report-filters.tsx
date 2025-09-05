import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Filter, BarChart2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { OohHoursConfig } from "@/components/ooh-hours-config";
import { type ReportSummary, type ReportFilters, type Team, type User, type EscalationPolicy, type OohHours } from "@shared/schema";

interface ReportFiltersProps {
  onReportGenerated: (data: ReportSummary) => void;
  isApiConfigured: boolean;
}

export function ReportFilters({ onReportGenerated, isApiConfigured }: ReportFiltersProps) {
  const [reportType, setReportType] = useState<"team" | "user">("team");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedEscalationPolicy, setSelectedEscalationPolicy] = useState("all-policies");
  const [oohHours, setOohHours] = useState<OohHours>({
    weekdayStart: "17:00",
    weekdayEnd: "09:00",
    includeWeekends: true
  });
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().slice(0, 16);
  });

  const { toast } = useToast();

  // Fetch teams
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: isApiConfigured,
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isApiConfigured,
  });

  // Fetch escalation policies
  const { data: escalationPolicies = [] } = useQuery<EscalationPolicy[]>({
    queryKey: ["/api/escalation-policies"],
    enabled: isApiConfigured,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (filters: ReportFilters) => {
      const response = await apiRequest("POST", "/api/generate-report", filters);
      return response.json();
    },
    onSuccess: (data) => {
      onReportGenerated(data);
      toast({
        title: "Report Generated",
        description: `Found ${data.totalCallouts} OOH callouts`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Report Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Export CSV mutation
  const exportCsvMutation = useMutation({
    mutationFn: async (filters: ReportFilters) => {
      const response = await apiRequest("POST", "/api/export-csv", filters);
      return response;
    },
    onSuccess: async (response) => {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `victorops-ooh-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    if (!selectedTarget) {
      toast({
        title: "Missing Selection",
        description: "Please select a team or user",
        variant: "destructive",
      });
      return;
    }

    const filters: ReportFilters = {
      reportType,
      targetId: selectedTarget,
      startDate,
      endDate,
      escalationPolicy: selectedEscalationPolicy && selectedEscalationPolicy !== "all-policies" ? selectedEscalationPolicy : undefined,
      oohHours,
    };

    generateReportMutation.mutate(filters);
  };

  const handleExportCsv = () => {
    if (!selectedTarget) {
      toast({
        title: "Missing Selection",
        description: "Please generate a report first",
        variant: "destructive",
      });
      return;
    }

    const filters: ReportFilters = {
      reportType,
      targetId: selectedTarget,
      startDate,
      endDate,
      escalationPolicy: selectedEscalationPolicy && selectedEscalationPolicy !== "all-policies" ? selectedEscalationPolicy : undefined,
      oohHours,
    };

    exportCsvMutation.mutate(filters);
  };

  // Reset selected target when report type changes
  useEffect(() => {
    setSelectedTarget("");
  }, [reportType]);

  const targetOptions = reportType === "team" ? teams : users;
  const getTargetLabel = (item: Team | User) => {
    if ("name" in item) return item.name;
    return (item as User).displayName || (item as User).username;
  };
  const getTargetValue = (item: Team | User) => {
    if ("slug" in item) return item.slug;
    return (item as User).username;
  };

  return (
    <>
      <OohHoursConfig value={oohHours} onChange={setOohHours} />
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
            <Label htmlFor="report-type">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value: "team" | "user") => setReportType(value)}
            >
              <SelectTrigger data-testid="select-report-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">Team Callouts</SelectItem>
                <SelectItem value="user">User Callouts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target-selection">
              {reportType === "team" ? "Team" : "User"}
            </Label>
            <Select
              value={selectedTarget}
              onValueChange={setSelectedTarget}
              disabled={!isApiConfigured}
            >
              <SelectTrigger data-testid="select-target">
                <SelectValue placeholder={`Select ${reportType}`} />
              </SelectTrigger>
              <SelectContent>
                {targetOptions.map((item) => (
                  <SelectItem 
                    key={getTargetValue(item)} 
                    value={getTargetValue(item)}
                  >
                    {getTargetLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-start-date"
            />
          </div>

          <div>
            <Label htmlFor="end-date">End Date</Label>
            <input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-end-date"
            />
          </div>

          <div>
            <Label htmlFor="escalation-policy">Escalation Policy (Optional)</Label>
            <Select
              value={selectedEscalationPolicy}
              onValueChange={setSelectedEscalationPolicy}
              disabled={!isApiConfigured}
            >
              <SelectTrigger data-testid="select-escalation-policy">
                <SelectValue placeholder="All policies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-policies">All Escalation Policies</SelectItem>
                {escalationPolicies.map((policy) => (
                  <SelectItem 
                    key={policy.slug} 
                    value={policy.slug}
                  >
                    {policy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <Button
            onClick={handleGenerateReport}
            disabled={!isApiConfigured || generateReportMutation.isPending}
            className="flex items-center"
            data-testid="button-generate-report"
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleExportCsv}
            disabled={!selectedTarget || exportCsvMutation.isPending}
            className="flex items-center"
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportCsvMutation.isPending ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </CardContent>
      </Card>
    </>
  );
}
