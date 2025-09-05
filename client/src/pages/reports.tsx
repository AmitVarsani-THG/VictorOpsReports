import { useState } from "react";
import { Activity } from "lucide-react";
import { ApiSetup } from "@/components/api-setup";
import { ReportFilters } from "@/components/report-filters";
import { ReportSummary } from "@/components/report-summary";
import { CalloutDetails } from "@/components/callout-details";
import { DetailModal } from "@/components/detail-modal";
import { type ReportSummary as ReportSummaryType, type Incident } from "@shared/schema";

export default function Reports() {
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [reportData, setReportData] = useState<ReportSummaryType | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">VictorOps Reporter</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                <span>{isApiConfigured ? "Connected to VictorOps API" : "API Not Configured"}</span>
                <div 
                  className={`w-2 h-2 rounded-full inline-block ml-2 ${
                    isApiConfigured ? "bg-green-500" : "bg-red-500"
                  }`} 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Setup */}
        <ApiSetup 
          onConfigured={() => setIsApiConfigured(true)} 
          data-testid="api-setup"
        />

        {/* Report Filters */}
        <ReportFilters 
          onReportGenerated={setReportData} 
          isApiConfigured={isApiConfigured}
          data-testid="report-filters"
        />

        {/* Report Summary */}
        {reportData && (
          <ReportSummary 
            reportData={reportData} 
            data-testid="report-summary"
          />
        )}

        {/* Callout Details */}
        {reportData && (
          <CalloutDetails 
            incidents={reportData.incidents}
            onViewDetails={handleViewDetails}
            data-testid="callout-details"
          />
        )}

        {/* Detail Modal */}
        <DetailModal
          incident={selectedIncident}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          data-testid="detail-modal"
        />
      </div>
    </div>
  );
}
