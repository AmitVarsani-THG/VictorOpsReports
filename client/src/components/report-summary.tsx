import { PhoneCall, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type ReportSummary } from "@shared/schema";

interface ReportSummaryProps {
  reportData: ReportSummary;
}

export function ReportSummary({ reportData }: ReportSummaryProps) {
  const formatResponseTime = (minutes: number) => {
    if (minutes === 0) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total OOH Callouts</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-total-callouts">
                {reportData.totalCallouts}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <PhoneCall className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Response Time</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-avg-response-time">
                {formatResponseTime(reportData.averageResponseTime)}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peak OOH Period</p>
              <p className="text-xl font-bold text-foreground" data-testid="text-peak-period">
                {reportData.peakPeriod}
              </p>
            </div>
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
